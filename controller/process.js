import { exec } from "child_process";

const processResume = (filePath) => {
  return new Promise((resolve, reject) => {
    exec(`python scripts/script.py "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || "Error processing resume");
      } else {
        resolve(stdout.trim());
      }
    });
  });
};

export default processResume;
