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
  constructor(data, instructions) {
    let safetySettings = [];
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
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: instructions,
      safetySettings: safetySettings,
    });
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
      return { error: false, message: result.response.text() };
    } catch (e) {
      return { error: true, message: e };
    }
  }

  setContext(context) {
    let geminiFormatted = [];
    context.forEach((part) => {
      geminiFormatted.push({
        role: part.role,
        parts: [{ text: part.content }],
      });
    });
    this.session._history = geminiFormatted;
  }

  getContext() {
    let formatted = [];
    this.session._history.forEach((part) => {
      let role = part.role;
      part.parts.forEach((fragment) => {
        formatted.push({ role, content: fragment.text });
      });
    });
    return formatted;
  }

  destroy() {
    this.genAI = null;
  }
}

exports.Provider = Provider;
exports.ChatSession = ChatSession;
