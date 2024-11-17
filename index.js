require("dotenv").config();

const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const express = require("express");
const crypto = require("crypto");
const multer = require("multer");
const Fuse = require("fuse.js");
const path = require("path");
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

fs.stat("assets/", (err, stats) => {
  if (err || !stats.isDirectory()) {
    fs.mkdirSync("assets/");
  }
});

let userArr = Object.keys(users);
console.log(
  `[SERVER] There are currently ${userArr.length} accounts in this instance.`
);

for (const username of userArr) {
  console.log(`[SERVER] Checking user ${username}`);
  let userConvos = users[username].conversations;
  userConvos.forEach((conversation, index) => {
    if (!conversation.hasOwnProperty("lastMessage")) {
      let convoData = JSON.parse(
        fs.readFileSync(`conversations/${conversation.conversationId}.json`)
      );

      convoData.belongsTo = username;
      convoData.convNumber = index;

      fs.writeFileSync(
        `conversations/${conversation.conversationId}.json`,
        JSON.stringify(convoData, null, 2)
      );

      let messages = convoData.messages;
      let messageObj = messages[messages.length - 1];
      let lastMessage = messageObj ? messageObj.content : undefined;
      let formatted = lastMessage
        ? lastMessage.substring(0, 50).replace(/(\r\n|\n|\r)/gm, "") + "..."
        : "This conversation is empty.";
      users[username].conversations[index].lastMessage = formatted;
    }
  });
}

fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

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
app.use(express.urlencoded({ extended: true }));
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

app.post("/displayName", authenticator, (req, res) => {
  let { newName } = req.body;
  users[req.user.username]["public"].display_name = newName;
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
  res.json({ error: false, message: "Display name set" });
});

app.post(
  "/profilePicture",
  [authenticator, multer().single("file")],
  (req, res) => {
    console.log(req.file);
    if (!req.file) {
      return res.send({ error: true, message: "Please provide an image!" });
    }
    let fileName =
      req.user.username.trim() +
      "." +
      path.extname(req.file.originalname).trim();

    fs.writeFileSync(`assets/${fileName}`, req.file.buffer);

    users[req.user.username][
      "public"
    ].profile_picture = `profilePicture/${fileName}`;
    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
    res.send({ error: false, message: "Profile picture set" });
  }
);

app.get("/profilePicture/*", (req, res) => {
  let userPfp = req.path.split("/").pop();
  res.sendFile(userPfp, { root: path.join(__dirname, "/assets") });
});

io.use((socket, next) => {
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
      belongsTo: userName,
      convNumber: users[userName].conversations.length,
      character: characters[characterId],
      started: new Date().toISOString(),
      messages: [],
    };
    fs.writeFileSync(
      `conversations/${convId}.json`,
      JSON.stringify(conversationData, null, 2)
    );
    users[userName].conversations.push({
      name: characters[characterId].name,
      conversationId: convId,
      lastMessage: "This conversation is empty.",
    });
    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
    socket.emit(
      "conversations",
      users[socket.handshake.auth.name].conversations
    );
    socket.emit("creationSuccess", convId);
  });
  socket.on("joinConversation", (conversationId) => {
    let convoData = JSON.parse(
      fs.readFileSync(`conversations/${conversationId}.json`)
    );
    console.log(convoData);
    if (convoData.belongsTo == socket.handshake.auth.name) {
      socket.conversation = new ai.ChatSession(
        provider,
        convoData.character.prompt,
        {
          declarations: [
            {
              name: "getTime",
              description: "Gets current time of day.",
              parameters: {
                type: "object",
                description: "Gets current time of day.",
                properties: {
                  timeZone: {
                    type: "string",
                    description:
                      "Timezone based on the character's location. Check the character prompt for hints of a timezone. If a character is from Japan, for instance, put JST as the timezone. If not, put NONE to let the server return the default timezone.",
                  },
                },
                required: ["timeZone"],
              },
            },
            {
              name: "whoIs",
              description:
                "Use this function when the conversation needs more context about a certain character and their certain relationship. Use this when someone asks about a certain character. You may use this to also temporarily switch roles when neccessary in the roleplay.",
              parameters: {
                type: "object",
                description:
                  "Use this function when the conversation needs more context about a certain character and their certain relationship. Use this when someone asks about a certain character. You may use this to also temporarily switch roles when neccessary in the roleplay.",
                properties: {
                  charName: {
                    type: "string",
                    description:
                      "The name of the character. Make sure that this is an exact match; or you may not find any results.",
                  },
                },
                required: ["charName"],
              },
            },
          ],
          assignments: {
            getTime: (args) => {
              console.log("AI put " + args.timeZone + " as the timezone");
              return {
                time: new Date().toLocaleString("en-US", {
                  timeZone: args.timeZone == "NONE" ? "UTC" : args.timeZone,
                }),
              };
            },
            whoIs: (args) => {
              console.log("AI is searching for " + args.charName);
              let fuseOptions = {
                keys: ["name"],
                includeScore: true,
              };
              let characters = convoData.character.relationships;
              const fuse = new Fuse(characters, fuseOptions);
              let result = fuse.search(args.charName);
              return { searchResults: result };
            },
          },
        }
      );
      socket.conversation.setContext(convoData.messages);
      socket.conversationId = conversationId;
      socket.emit("conversationData", convoData);
    }
  });
  socket.on("send", async (msg) => {
    let convoData = JSON.parse(
      fs.readFileSync(`conversations/${socket.conversationId}.json`)
    );
    if (!socket.conversation) {
      socket.emit("sendError", "You're not in a conversation yet!");
      return;
    }
    socket.emit("typing");
    let msgResponse = await socket.conversation.send(msg);
    console.log("msg response");
    console.log(msgResponse);
    if (msgResponse.error) {
      socket.conversation.setContext(convoData.messages);
      socket.emit("sendError", msgResponse.message);
      return;
    }
    let curContext = socket.conversation.getContext();
    convoData.messages = curContext;
    fs.writeFileSync(
      `conversations/${socket.conversationId}.json`,
      JSON.stringify(convoData, null, 2)
    );
    socket.emit("msg", msgResponse.message);
    socket.emit("contextUpdate", curContext);
  });
  socket.on("updateContext", (context) => {
    let convoData = JSON.parse(
      fs.readFileSync(`conversations/${socket.conversationId}.json`)
    );
    socket.conversation.setContext(context);
    convoData.messages = context;
    fs.writeFileSync(
      `conversations/${socket.conversationId}.json`,
      JSON.stringify(convoData, null, 2)
    );
    socket.emit("contextUpdate", context);
  });
  socket.on("disconnect", () => {
    if (socket.conversation) {
      socket.conversationId = null;
      socket.conversation.destroy();
    }
  });
  socket.on("endConvo", (convNumber) => {
    if (socket.conversation) {
      socket.conversationId = null;
      socket.conversation.destroy();
    }

    let username = socket.handshake.auth.name;
    let userConvos = users[username].conversations;
    let conversation = userConvos[convNumber];

    let convoData = JSON.parse(
      fs.readFileSync(`conversations/${conversation.conversationId}.json`)
    );

    fs.writeFileSync(
      `conversations/${conversation.conversationId}.json`,
      JSON.stringify(convoData, null, 2)
    );

    let messages = convoData.messages;
    let messageObj = messages[messages.length - 1];
    let lastMessage = messageObj ? messageObj.content : undefined;
    let formatted = lastMessage
      ? lastMessage.substring(0, 50).replace(/(\r\n|\n|\r)/gm, "") + "..."
      : "This conversation is empty.";
    users[username].conversations[convNumber].lastMessage = formatted;
    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
  });
});

server.listen(port, () => {
  console.log(`[SERVER] NurtureChat instance listening on port ${port}`);
});
