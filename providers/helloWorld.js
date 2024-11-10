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
    console.log("[PROVIDERS] Test provider initialized");
    return this.sessionData;
  }
}

class ChatSession {
  constructor(data, instructions = "") {
    this.context = [];
    console.log("[PROVIDERS] Created new ChatSession");
    console.log("[PROVIDERS] Prompt:");
    console.log(instructions);
  }

  changeConfig(newConfig) {
    console.log("[PROVIDERS] Changed configs");
  }

  async send(message) {
    console.log("[PROVIDERS] Sent message:", message);
    this.context.push({ role: "user", content: message });
    this.context.push({ role: "model", content: message });
    for (let i = 0; i < 1000000000; i++) {}
    return { error: false, message: message };
  }

  setContext(contextSent) {
    console.log("[PROVIDERS] Set context");
    console.log(contextSent);
    this.context = contextSent;
  }

  getContext() {
    console.log("[PROVIDERS] Get context");
    return this.context;
  }

  destroy() {
    console.log("[PROVIDERS] Destroy model");
  }
}

exports.Provider = Provider;
exports.ChatSession = ChatSession;
