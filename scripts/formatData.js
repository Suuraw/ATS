import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs"
dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export async function formatData(rawData,fileName) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `FORMAT THE DATA AND NO ASTERIKS AND HASH CHARACTER SHOULD BE PRESENT IN THE TEXT ${rawData}`;
  const result = await model.generateContent(prompt);
  const formatedData = result.response.text();
  await fs.writeFileSync(`uploads/${fileName}`,formatedData);
  return result.response.text();
}
