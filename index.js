require("dotenv").config();

const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const express = require("express");
const crypto = require("crypto");

const app = express();

const secretKey = crypto.randomBytes(32).toString("hex");
const port = process.env.PORT ? process.env.PORT : 5501;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const ai = require("./providers/gemini");

const fs = require("fs");
let characters = {};
let users = {};

if (!fs.existsSync("characters.json")) {
  fs.writeFileSync("characters.json", JSON.stringify(characters, null, 2));
} else {
  characters = JSON.parse(fs.readFileSync("characters.json"));
}

if (!fs.existsSync("users.json")) {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
} else {
  users = JSON.parse(fs.readFileSync("users.json"));
}

fs.stat("conversations/", (err, stats) => {
  if (err || !stats.isDirectory()) {
    fs.mkdirSync("conversations/");
  }
});

function makeId(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const provider = new ai.Provider({
  apiKey: process.env.API_KEY,
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
  },
  optionalData: {
    safetySettings: {
      HARM_CATEGORY_HARASSMENT: "BLOCK_NONE",
      HARM_CATEGORY_HATE_SPEECH: "BLOCK_NONE",
      HARM_CATEGORY_DANGEROUS_CONTENT: "BLOCK_NONE",
      HARM_CATEGORY_SEXUALLY_EXPLICIT: "BLOCK_NONE",
    },
  },
});

app.use(express.json());
app.use(express.static("frontend"));

function authenticator(req, res, next) {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    res.status(401);
    return res.json({ error: true, message: "Authentication failed" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.status(403);
      return res.json({ error: true, message: "Authentication failed" });
    }

    if (!decoded) {
      res.status(500);
      return res.json({ error: true, message: "Failed to decode JWT token" });
    }

    req.user = decoded;
    next();
  });
}

app.post("/signup", (req, res) => {
  let { username, password } = req.body;
  if (username in users) {
    res.status(500);
    return res.json({ error: true, message: "User already exists" });
  }
  bcrypt.hash(password, 10, (err, hash) => {
    users[username] = {
      auth: hash,
      conversations: [],
      public: {
        created: new Date().toISOString(),
        display_name: username,
        username: username,
      },
    };

    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
    return res.json({ error: false, message: "Successfully created account" });
  });
});

app.post("/login", (req, res) => {
  let { username, password } = req.body;

  if (username in users) {
    let hash = users[username]["auth"];

    bcrypt.compare(password, hash, (err, result) => {
      if (err) {
        res.status(403);
        return res.json({ error: true, message: "Authentication failed" });
      }
      if (!result) {
        res.status(401);
        return res.json({ error: true, message: "Invalid password." });
      }
      const token = jwt.sign({ username }, secretKey, { expiresIn: "24h" });
      return res.json({ error: false, token });
    });
  } else {
    res.status(500);
    return res.json({ error: true, message: "Invalid user" });
  }
});

app.get("/validate", authenticator, (req, res) => {
  res.json({ error: false, message: req.user });
});

app.get("/info", authenticator, (req, res) => {
  res.send(users[req.user.username]["public"]);
});

io.use((socket, next) => {
  console.log(socket.handshake);
  const token = socket.handshake.auth.token;
  if (!token) {
    next(new Error("Authentication required"));
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      next(new Error("Session invalid"));
    }

    if (decoded) {
      socket.handshake.auth.name = decoded.username;
    } else {
      next(new Error("Error authenticating"));
    }
    next();
  });
});

io.on("connection", (socket) => {
  if (socket.handshake.auth.name == undefined) {
    socket.disconnect(true);
    return;
  }
  socket.emit("conversations", users[socket.handshake.auth.name].conversations);
  socket.emit("characters", characters);
  socket.on("createConversation", (data) => {
    let characterId = parseInt(data);
    let userName = socket.handshake.auth.name;
    console.log(characterId);
    console.log(characters[characterId]);
    if (characterId < 0 || characterId > characters.length - 1) {
      socket.emit("creationError", "Character ID out of bounds");
      return;
    }
    let convId = `${makeId(5)}-${makeId(5)}-${makeId(5)}`;
    let conversationData = {
      character: characters[characterId],
      started: new Date().toISOString(),
      messages: [],
    };
    fs.writeFileSync(
      `conversations/${convId}.json`,
      JSON.stringify(conversationData, null, 2)
    );
    users[userName].conversations.push(convId);
    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
    socket.emit("creationSuccess");
  });
  socket.on("joinConversation", (conversationId) => {
    let convoData = JSON.parse(
      fs.readFileSync(`conversations/${conversationId}.json`)
    );
    console.log(convoData);
    socket.conversation = new ai.ChatSession(
      provider,
      convoData.character.prompt
    );
    socket.conversation.setContext(convoData.messages);
    socket.conversationId = conversationId;
    socket.emit("conversationData", convoData.messages);
  });
  socket.on("send", async (msg) => {
    let convoData = JSON.parse(
      fs.readFileSync(`conversations/${socket.conversationId}.json`)
    );
    if (!socket.conversation) {
      socket.emit("sendError", "You're not in a conversation yet!");
      return;
    }
    let msgResponse = await socket.conversation.send(msg);
    console.log("msg response");
    console.log(msgResponse);
    if (msgResponse.error) {
      socket.emit("sendError", msgResponse.message);
      socket.conversation.setContext(convoData.messages);
      return;
    }
    let curContext = socket.conversation.getContext();
    convoData.messages = curContext;
    fs.writeFileSync(
      `conversations/${socket.conversationId}.json`,
      JSON.stringify(convoData, null, 2)
    );
    socket.emit("msg", msgResponse.message);
  });
  socket.on("updateContext", (context) => {
    socket.conversation.setContext(context);
    socket.emit("contextUpdated");
  });
  socket.on("disconnect", () => {
    if (socket.conversation) {
      socket.conversationId = null;
      socket.conversation.destroy();
    }
  });
  socket.on("endConvo", () => {
    if (socket.conversation) {
      socket.conversationId = null;
      socket.conversation.destroy();
    }
  });
});

server.listen(port, () => {
  console.log(`NurtureChat instance listening on port ${port}`);
});
