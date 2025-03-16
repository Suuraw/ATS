import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get root directory path (assuming this script is inside "scripts/")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, ".."); // Move up to root directory

// Function to capture Google Form screenshot
export const captureGoogleFormScreenshot = async (
  formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfKrOWP3k6IhquHOD-RvvwoTw7rbRlx9XbWrFIpUh7prabR3g/viewform?usp=sharing",
  filename = "form_screenshot.png"
) => {
  try {
    // Set uploads directory to the root folder
    const uploadDir = path.join(rootDir, "uploads");

    // Ensure "uploads" folder exists in root
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Launch headless browser
    const browser = await puppeteer.launch({ headless: true });

    // Open a new page
    const page = await browser.newPage();
    await page.goto(formUrl, { waitUntil: "networkidle2" });

    // Save screenshot in root "uploads" folder
    const savePath = path.join(uploadDir, filename);
    await page.screenshot({ path: savePath, fullPage: true });

    console.log(`✅ Screenshot saved at: ${savePath}`);

    // Close browser
    await browser.close();
  } catch (error) {
    console.error("❌ Error capturing screenshot:", error);
  }
};
