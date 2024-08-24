require("dotenv").config();

const { createServer } = require("http");
const { Server } = require("socket.io");

const express = require("express");
const app = express();

const port = process.env.PORT ? process.env.PORT : 5501;
const server = createServer(app);
const io = new Server(server);

const ai = require("./providers/gemini");

const fs = require("fs");
let characters = {};

if (!fs.existsSync("characters.json")) {
  fs.writeFileSync("characters.json", JSON.stringify(characters));
} else {
  characters = JSON.parse(fs.readFileSync("characters.json"));
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

app.use(express.static("frontend"));

server.listen(port, () => {
  console.log(`NurtureChat instance listening on port ${port}`);
});
