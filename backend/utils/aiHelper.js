const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");

const callAI = async (prompt) => {
  const useLocal = process.env.USE_LOCAL_LLM === "true";

  if (useLocal) {
    const localUrl = process.env.LOCAL_LLM_URL || "http://localhost:11434/v1";
    const localModel = process.env.LOCAL_LLM_MODEL || "llama3";
    
    try {
      const response = await axios.post(`${localUrl}/chat/completions`, {
        model: localModel,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }, {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 3500
      });
      
      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content;
      }
    } catch (error) {
      console.warn("Local LLM request offline or failed, falling back to Gemini:", error.message);
    }
  }

  // Fallback to Gemini with active model cascade
  const modelCandidates = ["gemini-flash-latest", "gemini-3.7-flash", "gemini-3.6-flash"];
  let lastErr = null;
  for (const m of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error("All AI generation providers failed.");
};

module.exports = { callAI };
