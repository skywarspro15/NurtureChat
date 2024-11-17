const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

class Provider {
  constructor(data) {
    this.sessionData = {
      apiKey: data.apiKey,
      generationConfig: {
        temperature: data.generationConfig.temperature,
        topP: data.generationConfig.topP,
        topK: data.generationConfig.topK,
        maxOutputTokens: data.generationConfig.maxOutputTokens,
        responseMimeType: "text/plain",
      },
      optionalData: data.optionalData,
    };
    console.log("[PROVIDERS] Gemini provider initialized");
    return this.sessionData;
  }
}

class ChatSession {
  constructor(data, instructions = "", functions) {
    let safetySettings = [];
    this.functions = null;
    if (functions) {
      this.functions = functions;
      console.log(this.functions);
    }
    if (data.optionalData.safetySettings) {
      let safetyData = data.optionalData.safetySettings;
      Object.keys(safetyData).forEach((category) => {
        safetySettings.push({
          category: HarmCategory[category],
          threshold: HarmBlockThreshold[safetyData[category]],
        });
      });
    }
    this.genAI = new GoogleGenerativeAI(data.apiKey);
    let model = "gemini-1.5-flash";
    let modelConfig = {
      model: model,
      systemInstruction:
        instructions +
        "\n\n" +
        "ALWAYS RUN the 'whoIs' function when you introduce a character. Do this when the user asks about a certain character. Act as if you know the character when using this function. Always use this function when the user is asking to switch perspectives to another character. For example, when calling the character a name other than them.",
      safetySettings: safetySettings,
      apiVersion: "v1beta",
    };
    if (this.functions) {
      modelConfig["tools"] = {
        functionDeclarations: this.functions.declarations,
      };
    }
    console.log(modelConfig);
    this.model = this.genAI.getGenerativeModel(modelConfig);
    this.session = this.model.startChat({
      generationConfig: data.generationConfig,
      history: [],
    });
  }

  changeConfig(newConfig) {
    let currentHistory = this.session._history.map((a) => ({ ...a }));
    this.session = this.model.startChat({
      generationConfig: newConfig,
      history: currentHistory,
    });
  }

  async send(message) {
    try {
      let result = await this.session.sendMessage(message);
      let call = result.response.functionCalls()
        ? result.response.functionCalls()[0]
        : undefined;
      let funcResponse = null;
      if (call) {
        console.log(`[PROVIDER] Calling ${call.name}`);
        funcResponse = await this.functions.assignments[call.name](call.args);
        result = await this.session.sendMessage([
          {
            functionResponse: { name: call.name, response: funcResponse },
          },
        ]);
      }
      return { error: false, message: result.response.text() };
    } catch (e) {
      return { error: true, message: e };
    }
  }

  setContext(context) {
    let geminiFormatted = [];
    let lastMsg = { role: "none", index: -1 };
    context.forEach((part) => {
      if (part.role == lastMsg.role) {
        let prevMsg = geminiFormatted[lastMsg.index];
        if (part.role != "function") {
          let partCompiled = {};
          if ("functionCall" in part) {
            partCompiled["functionCall"] = part.functionCall;
          }
          if ("content" in part) {
            partCompiled["text"] = part.content;
          }
          prevMsg.parts.push(partCompiled);
        } else {
          prevMsg.parts.push({ functionResponse: part.content });
        }
      } else {
        lastMsg.role = part.role;
        if (part.role != "function") {
          let partCompiled = {};
          if ("functionCall" in part) {
            partCompiled["functionCall"] = part.functionCall;
          }
          if ("content" in part) {
            partCompiled["text"] = part.content;
          }
          lastMsg.index =
            geminiFormatted.push({
              role: part.role,
              parts: [partCompiled],
            }) - 1;
        } else {
          lastMsg.index =
            geminiFormatted.push({
              role: part.role,
              parts: [{ functionResponse: part.content }],
            }) - 1;
        }
      }
    });
    console.log(JSON.stringify(geminiFormatted, null, 2));
    this.session._history = geminiFormatted;
  }

  getContext() {
    let formatted = [];
    console.log(JSON.stringify(this.session._history, null, 2));
    this.session._history.forEach((part) => {
      let role = part.role;
      if (role == "function") {
        formatted.push({ role, content: part.parts[0].functionResponse });
      } else {
        part.parts.forEach((fragment) => {
          if ("text" in fragment) {
            formatted.push({ role, content: fragment.text });
          }
          if ("functionCall" in fragment) {
            formatted.push({ role, functionCall: fragment.functionCall });
          }
        });
      }
    });
    return formatted;
  }

  destroy() {
    this.genAI = null;
  }
}

exports.Provider = Provider;
exports.ChatSession = ChatSession;
