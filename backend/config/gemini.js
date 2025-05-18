const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the model (Gemini-pro for text generation)
const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });

module.exports = { geminiModel }; 