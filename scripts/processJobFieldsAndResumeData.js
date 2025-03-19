import fs from "fs";
import path from "path";
import { clearUploadsFolder } from "../app.js";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
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
        .json({ message: "Submit resume PDF and job form link" });
    }

    const resumeData = await fs.readFileSync(resumeDataPath, "utf-8");
    const jobFields = await fs.readFileSync(requiredJobFieldsPath, "utf-8");

    const prompt = `YOUR JOB IS TO EXTRACT THE RESPECTIVE ANSWERS FOR THE FIELDS: ${jobFields} FROM THE USER'S RESUME DATA: ${resumeData}. 
    - THE RESPONSE SHOULD NOT CONTAIN ANY ASTERISKS (*). 
    - FORMAT THE RESPONSE AS "Field Name: Extracted Value".`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const generatedContent = await model.generateContent(prompt);
    const rawText = generatedContent.response.text();

    // **Regex to extract key-value pairs**
    const fieldPattern = /([\w\s]+):\s*(.*)/g;
    let match;
    let extractedData = {};

    while ((match = fieldPattern.exec(rawText)) !== null) {
      extractedData[match[1].trim()] = match[2].trim();
    }

    // Save extracted data as a JSON file
    const extractedDataPath = path.join(uploadsFolderPath, "extractedData.json");
    fs.writeFileSync(extractedDataPath, JSON.stringify(extractedData, null, 2));

    clearUploadsFolder();
    return res.status(200).json({ message: "All required data present", data: extractedData });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
};