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
        }
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Local LLM request failed:", error.message);
      throw error;
    }
  } else {
    // Fallback to Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
};

module.exports = { callAI };
