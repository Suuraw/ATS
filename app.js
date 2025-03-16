import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises"; // Use Promises for async file operations
import processResume from "./controller/process.js";
import { formatData } from "./scripts/formatData.js";
const app = express();
const port = 3000;

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });
// clear all the files from the uploads folder
const clearUploadsFolder = async () => {
  try {
    const files = await fs.readdir("uploads");
    await Promise.all(
      files.map((file) => fs.unlink(path.join("uploads", file)))
    );
  } catch (error) {
    console.error("Error clearing uploads folder:", error);
  }
};
// API endpoint for uploading resume
app.post("/upload", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Get original extension
    const fileExt = path.extname(req.file.originalname);
    const newFilePath = `${req.file.path}${fileExt}`;

    await fs.rename(req.file.path, newFilePath);

    const extractedText = await processResume(newFilePath);

    await fs.writeFile("output.txt", extractedText);
    // Delete file after processing
    await fs.unlink(newFilePath);
    await clearUploadsFolder();
    const formattedData = await formatData(extractedText);
    res.json({ formattedData });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error processing resume" });
  }
});

// Start the server
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
