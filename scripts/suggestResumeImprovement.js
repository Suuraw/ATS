import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const suggestImprovement = async (req, res) => {
  const { jobDescription } = req.body;
  console.log(jobDescription);
  try {
    const resume = fs.readFileSync("uploads/resumeData.txt", "utf-8");
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
    You are an **AI-powered Applicant Tracking System (ATS)** that evaluates resumes against a given **job description**.  
    Your task is to **analyze the resume** based on the job description and provide a detailed ATS score **out of 100**, considering key factors such as:  
    
    ### **Evaluation Criteria:**  
    1. **Keyword Match** – Compare skills, qualifications, and job-specific keywords in the resume against the job description.  
    2. **Experience Relevance** – Assess if the candidate’s work experience aligns with the job role and industry.  
    3. **Education & Certifications** – Verify if the required educational qualifications and certifications are present.  
    4. **Skills Match** – Identify both technical and soft skills mentioned in the job description vs. those listed in the resume.  
    5. **Formatting & Readability** – Ensure the resume follows best practices (clear sections, professional formatting, no excessive fluff).  
    6. **Achievements & Impact** – Check if the resume highlights measurable accomplishments relevant to the job role.  
    7. **Customization & Relevance** – Assess if the resume is **tailored for this specific job** rather than being generic.  
    
    ### **Scoring System:**  
    - Provide a **detailed ATS score out of 100**, breaking it down based on each evaluation criterion.  
    - Highlight **strengths** and **areas for improvement** in the resume.  
    - Suggest missing keywords or sections that can improve the ATS score.  
    
    ### **Input Parameters:**  
    - **Job Description:** ${jobDescription}  
    - **Candidate Resume Data:** ${resume}  
    
    ### **Output Format:**  
    Provide a **JSON response** with the following fields:  
    \`\`\`json
    {
      "ATS Score": <score_out_of_100>,
      "Strengths": ["<key strength 1>", "<key strength 2>", ...],
      "Improvements Needed": ["<missing keywords>", "<lacking details>", ...],
      "Suggested Edits": "<short suggestions to improve score>"
    }
    \`\`\`
    
    Ensure the analysis is **precise, unbiased, and provides actionable feedback** for the candidate to improve their resume for ATS screening.
    `;
    
    const generatedContent = await model.generateContent(prompt);
    console.log(typeof(generatedContent.response.text()));
    res.status(200).json({
      data: {
        "ATS-SCORE": generatedContent.response.text(),
      },
    });
  } catch (error) {
    res.status(404).json({ error: error });
  }
};
