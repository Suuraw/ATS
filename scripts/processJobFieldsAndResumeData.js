import fs from "fs";
import path from "path";
import { clearUploadsFolder } from "../app.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const processResumeDataWithRequiredField = async (req, res) => {
    try {
        const uploadsFolderPath = path.join(__dirname, "../uploads");
        console.log(uploadsFolderPath)
        const resumeDataPath = path.join(uploadsFolderPath, "resumeData.txt");
        const requiredJobFieldsPath = path.join(uploadsFolderPath, "requiredJobFields.txt");
        console.log(resumeDataPath);
        
        if (!fs.existsSync(resumeDataPath) || !fs.existsSync(requiredJobFieldsPath)) {
            return res.status(404).json({ message: "Submit resume pdf and job form link" });
        }
        clearUploadsFolder();
        return res.status(200).json({ message: "All required data present" });
    } catch (error) {
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
};
