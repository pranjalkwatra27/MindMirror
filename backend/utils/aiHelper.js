const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");

// Standard local AI candidate endpoints (Ollama, LM Studio, LocalAI, custom)
const getLocalCandidateEndpoints = () => {
  const customUrl = process.env.LOCAL_LLM_URL;
  const customModel = process.env.LOCAL_LLM_MODEL || "llama3";

  const candidates = [];
  if (customUrl) {
    candidates.push({
      url: customUrl.endsWith("/chat/completions") ? customUrl : `${customUrl.replace(/\/$/, "")}/chat/completions`,
      model: customModel,
      isOllamaNative: false
    });
  }

  // Ollama OpenAI-compatible endpoint
  candidates.push({
    url: "http://localhost:11434/v1/chat/completions",
    model: customModel || "llama3",
    isOllamaNative: false
  });

  // Ollama native endpoint
  candidates.push({
    url: "http://localhost:11434/api/generate",
    model: customModel || "llama3",
    isOllamaNative: true
  });

  // LM Studio endpoint
  candidates.push({
    url: "http://localhost:1234/v1/chat/completions",
    model: customModel || "local-model",
    isOllamaNative: false
  });

  // LocalAI endpoint
  candidates.push({
    url: "http://localhost:8080/v1/chat/completions",
    model: customModel || "gpt-3.5-turbo",
    isOllamaNative: false
  });

  return candidates;
};

const tryLocalAI = async (prompt) => {
  const endpoints = getLocalCandidateEndpoints();
  for (const ep of endpoints) {
    try {
      if (ep.isOllamaNative) {
        const res = await axios.post(ep.url, {
          model: ep.model,
          prompt: prompt,
          stream: false
        }, { timeout: 2500 });
        if (res.data?.response) return res.data.response;
      } else {
        const res = await axios.post(ep.url, {
          model: ep.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        }, {
          headers: { "Content-Type": "application/json" },
          timeout: 2500
        });
        if (res.data?.choices?.[0]?.message?.content) {
          return res.data.choices[0].message.content;
        }
      }
    } catch {
      // Continue to next candidate
    }
  }
  return null;
};

const callAI = async (prompt) => {
  const forceLocal = process.env.USE_LOCAL_LLM === "true";

  // If local LLM explicitly enabled or configured, try local first
  if (forceLocal || process.env.LOCAL_LLM_URL) {
    const localResult = await tryLocalAI(prompt);
    if (localResult) return localResult;
  }

  // Cloud Gemini Cascade (with fast per-model race timeout)
  const modelCandidates = ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest", "gemini-flash-latest"];
  let lastErr = null;
  for (const m of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const generatePromise = model.generateContent(prompt);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout on model ${m}`)), 4500)
      );
      const result = await Promise.race([generatePromise, timeoutPromise]);
      const response = await result.response;
      return response.text();
    } catch (err) {
      lastErr = err;
    }
  }

  // If cloud also failed, check any opportunistic local AI before finally throwing
  const opportunisticLocal = await tryLocalAI(prompt);
  if (opportunisticLocal) return opportunisticLocal;

  throw lastErr || new Error("All AI generation providers failed.");
};

module.exports = { callAI };

