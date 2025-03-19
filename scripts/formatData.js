import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
let resumeData;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export async function formatData(rawData) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `FORMAT THE DATA AND NO ASTERIKS AND HASH CHARACTER SHOULD BE PRESENT IN THE TEXT ${rawData}`;
  const result = await model.generateContent(prompt);
  resumeData = result.response.text();
  await fs.writeFileSync("uploads/resumeData.txt", resumeData);
  return result.response.text();
}
export default resumeData;
