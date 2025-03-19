import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises"; // Use Promises for async file operations
import processResume from "./middleware/process.js";
import { formatData } from "./scripts/formatData.js";
import { captureGoogleFormScreenshot } from "./scripts/takeFormSnap.js";
import processScreenshot from "./scripts/getFormFields.js";
import { processResumeDataWithRequiredField } from "./scripts/processJobFieldsAndResumeData.js";
import { atsScore } from "./scripts/atsScore.js";
const app = express();
const port = 3000;
// Middleware for handling JSON data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });
export const clearUploadsFolder = async () => {
  try {
    const files = await fs.readdir("uploads");
    await Promise.all(
      files.map((file) => fs.unlink(path.join("uploads", file)))
    );
  } catch (error) {
    console.error("Error clearing uploads folder:", error);
  }
};
// API endpoint for taking a screenshot and saving to the uploads folder
app.use(express.urlencoded({ extended: true }));
app.post("/job_form", async (req, res) => {
  const { formUrl } = req.body;
  console.log(formUrl);
  try {
    await captureGoogleFormScreenshot(formUrl);
    await processScreenshot();
    res.status(200).json({ message: "✅ Screenshot saved" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// API endpoint for uploading resume
app.post("/upload", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    console.log(`Processing file with extension: ${fileExt}`);

    // Validate file extension
    if (!['.pdf', '.docx'].includes(fileExt)) {
      await fs.unlink(req.file.path); // Clean up the uploaded file
      return res.status(400).json({ 
        error: "Unsupported file format. Please upload PDF or Word documents." 
      });
    }

    const newFilePath = `${req.file.path}${fileExt}`;
    console.log(`Renaming file to: ${newFilePath}`);

    await fs.rename(req.file.path, newFilePath);

    console.log("Processing resume...");
    const extractedText = await processResume(newFilePath);

    if (extractedText.startsWith("Error:")) {
      await fs.unlink(newFilePath); // Clean up the file
      return res.status(400).json({ error: extractedText });
    }

    console.log("Writing extracted text to output.txt");
    await fs.writeFile("output.txt", extractedText);

    console.log("Formatting data...");
    const formattedData = await formatData(extractedText);

    // Clean up the uploaded file
    await fs.unlink(newFilePath);

    res.json({ formattedData });
  } catch (error) {
    console.error("Error processing resume:", error);
    // Clean up any uploaded files in case of error
    try {
      if (req.file && req.file.path) {
        await fs.unlink(req.file.path);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up file:", cleanupError);
    }
    res.status(500).json({ 
      error: error.message || "Error processing resume",
      details: error.toString()
    });
  }
});
//API endpoint for processing resume Data with fields
app.post("/processData",processResumeDataWithRequiredField);
//API endpoint for calculating the ATS score
app.post("/atsScore",atsScore);
// Start the server
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
