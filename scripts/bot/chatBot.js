import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
console.log(process.env.GOOGLE_API_KEY); // For debugging, remove in production
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const streamChat = async (req, res) => {
  try {
    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Read request data
    const chatHistory = req.body.history || [];
    const userQuestion = req.body.chat;

    if (!userQuestion) {
      res.write("Error: No question provided");
      res.end();
      return;
    }

    // Read resume data from file
    let resumeData;
    try {
      resumeData = await fs.readFile("uploads/resumeData.txt", "utf-8");
    } catch (fileError) {
      res.write("Error: Could not read resume data file");
      res.end();
      return;
    }

    if (!resumeData.trim()) {
      res.write("Error: Resume data file is empty");
      res.end();
      return;
    }

    // System instruction to restrict AI to resume-based analysis
    const systemPrompt = `You are an ATS (Applicant Tracking System) analysis assistant. Your sole purpose is to analyze and answer questions about the user's resume data provided below. Do not provide information or answers beyond the scope of the resume analysis. If a question cannot be answered based on the resume data, respond with: "This question cannot be answered based on the available resume data."

Resume Data:
${resumeData}

Instructions:
1. Only answer questions related to the resume data above
2. Provide analysis based on ATS criteria (content quality, keywords, formatting, experience relevance)
3. Do not speculate or generate information not present in the resume
4. Keep responses concise and relevant to the question`;

    // Format chat history with validation
    const formattedHistory = [
      // Always include the system prompt as the first "user" message
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      // Follow with the actual chat history
      ...chatHistory.map((msg, index) => {
        const text = msg.parts && msg.parts[0] && typeof msg.parts[0].text === 'string' 
          ? msg.parts[0].text 
          : "Invalid message content";
        console.log(`History item ${index}:`, { role: msg.role, text });
        return {
          role: msg.role, // "user" or "model"
          parts: [{ text }]
        };
      })
    ];

    // Debug the formatted history
    console.log("Formatted History:", JSON.stringify(formattedHistory, null, 2));

    // Initialize the chat with formatted history
    const chat = model.startChat({
      history: formattedHistory
    });

    // Send the user's question and stream the response
    const result = await chat.sendMessageStream(userQuestion);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      console.log(chunkText);
      res.write(chunkText);
    }
    
    res.end();
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(`Error: ${error.message}`);
    res.end();
  }
};