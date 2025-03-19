import { exec } from "child_process";
import path from "path";

const processResume = (filePath) => {
  return new Promise((resolve, reject) => {
    console.log(`Processing resume: ${filePath}`);
    
    // Check if file exists
    if (!filePath) {
      reject("No file path provided");
      return;
    }

    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    if (!['.pdf', '.docx'].includes(ext)) {
      reject(`Unsupported file format: ${ext}. Please use PDF or DOCX files.`);
      return;
    }

    // Execute Python script
    exec(`python scripts/script.py "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Process error: ${error.message}`);
        console.error(`Stderr: ${stderr}`);
        reject(stderr || "Error processing resume");
      } else if (stdout.includes("Error:")) {
        console.error(`Python script error: ${stdout}`);
        reject(stdout);
      } else if (stdout.trim() === '') {
        console.error("No text extracted from resume");
        reject("No text was extracted from the resume");
      } else {
        console.log("Resume processed successfully");
        resolve(stdout.trim());
      }
    });
  });
};

export default processResume;
