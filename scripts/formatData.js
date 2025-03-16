import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export async function formatData(rawData) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `FORMAT THE DATA ${rawData}`;
  const result = await model.generateContent(prompt);
  fs.writeFileSync("output.txt", result.response.text());
  return result.response.text();
}
