import fs from "fs";
import path from "path";
import { clearUploadsFolder } from "../app.js";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const processResumeDataWithRequiredField = async (req, res) => {
  try {
    const uploadsFolderPath = path.join(__dirname, "../uploads");
    console.log(uploadsFolderPath);
    const resumeDataPath = path.join(uploadsFolderPath, "resumeData.txt");
    const requiredJobFieldsPath = path.join(
      uploadsFolderPath,
      "requiredJobFields.txt"
    );
    console.log(resumeDataPath);

    if (
      !fs.existsSync(resumeDataPath) ||
      !fs.existsSync(requiredJobFieldsPath)
    ) {
      return res
        .status(404)
        .json({ message: "Submit resume pdf and job form link" });
    }
    const resumeData = await fs.readFileSync("uploads/resumeData.txt", "utf-8");
    const jobFields = await fs.readFileSync(
      "uploads/requiredJobFields.txt",
      "utf-8"
    );

    const prompt = `YOUR JOB IS TO SCRAP THE RESPECTIVE ANSWERS FOR THE FIELDS ${jobFields} FROM THE USERS RESUME DATA : ${resumeData},- THE RESPONSE SHOULD NOT CONTAIN ANY ASTERIKS`;
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const generatedContent = await model.generateContent(prompt);
    const response = generatedContent.response.text();
    clearUploadsFolder();
    return res
      .status(200)
      .json({ message: "All required data present", data: response });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
