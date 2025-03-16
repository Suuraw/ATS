import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
let fields;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Converts local file to base64 for Gemini AI
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType,
    },
  };
}

async function processScreenshot() {
  try {
    // Define the screenshot path (ensure it's from the correct uploads folder)
    const screenshotPath = path.resolve("uploads", "form_screenshot.png");

    // Ensure the file exists before processing
    if (!fs.existsSync(screenshotPath)) {
      throw new Error(`File not found: ${screenshotPath}`);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Extract all form field names which are associated with Your answer or other input fields from the image.
      THE RESPONSE SHOULD NOT CONTAIN ANY ASTERIKS
      `;

    const imagePart = fileToGenerativePart(screenshotPath, "image/png");

    const generatedContent = await model.generateContent([prompt, imagePart]);
    fields = generatedContent.response.text();
    await fs.writeFileSync("uploads/requiredJobFields.txt", fields);
  } catch (error) {
    console.error("❌ Error processing image:", error);
  }
}

export default processScreenshot;
export { fields };
