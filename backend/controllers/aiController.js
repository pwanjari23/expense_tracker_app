const { GoogleGenAI } = require("@google/genai");
const { response } = require("../app");
require("dotenv").config();

exports.callAiModal = async (req, res) => {
  try {
    const { prompt } = req.body;
    const ai = new GoogleGenAI({ apikey: process.env.GEMINI_API_KEY });
    const responseFromAI = await ai.models.generateContent({
      // model: "gemini-2-flash-preview"",
      model:"gemini-2.5-flash",
      contents: prompt,
    });
    console.log(responseFromAI.text);
    res.status(200).json({response:responseFromAI.text})
  } catch (error) {
    console.log(error);
    res.status(500).json({response:"Something went wrong"})
  }
};

