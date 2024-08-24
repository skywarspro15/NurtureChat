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
  fs.writeFileSync("characters.json", JSON.stringify(characters));
} else {
  characters = JSON.parse(fs.readFileSync("characters.json"));
}

if (!fs.existsSync("users.json")) {
  fs.writeFileSync("users.json", JSON.stringify(users));
} else {
  users = JSON.parse(fs.readFileSync("users.json"));
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

app.post("/signup", (req, res) => {
  let { username, password } = req.body;
  if (username in users) {
    res.status(500);
    return res.json({ error: true, message: "User already exists" });
  }
  bcrypt.hash(password, 10, (err, hash) => {
    users[username] = {
      auth: hash,
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
  socket.emit("hi", socket.handshake.auth.name);
});

server.listen(port, () => {
  console.log(`NurtureChat instance listening on port ${port}`);
});
