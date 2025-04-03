import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Updated regex patterns for plain text (no asterisks)
const patterns = {
  atsScore: /ATS Score:\s*(.*?)(?=Strengths:)/s,
  strengths: /Strengths:\s*(.*?)(?=Areas to Improve:)/s,
  areasToImprove: /Areas to Improve:\s*(.*?)(?=Recommendations:)/s,
  recommendations: /Recommendations:\s*(.*?)(?=Keywords Found in Your Resume:)/s,
  keywordsFound: /Keywords Found in Your Resume:\s*(.*?)(?=Suggested Keywords to Add:)/s,
  suggestedKeywords: /Suggested Keywords to Add:\s*(.*?)(?=Keyword Relevance:)/s,
  keywordRelevance: /Keyword Relevance:\s*(.*?)$/s,
};

// Helper function to extract bullet points (updated for plain text)
const extractBulletPoints = (text) => {
  return (text.match(/-\s*(.*?)(?=\n|$)/gs) || []).map((item) =>
    item.replace(/^-\s*/, "").trim()
  );
};

// Helper function to extract only the numerical score
const extractScore = (text) => {
  const match = text.match(/(\d{1,2})(?:\/\d{3})?/);
  return match ? match[1] : "N/A";
};

// Helper function to extract keyword relevance subfields
const extractKeywordRelevance = (text) => {
  const industryRelevance = text.match(/Industry Relevance:\s*(\d{1,2})%/s)?.[1] || "N/A";
  const softSkills = text.match(/Soft Skills:\s*(\d{1,2})%/s)?.[1] || "N/A";
  const technicalSkills = text.match(/Technical Skills:\s*(\d{1,2})%/s)?.[1] || "N/A";
  return { industryRelevance, softSkills, technicalSkills };
};

// Function to parse raw text into structured JSON
const parseAtsResponse = (rawText) => {
  const finalData = {
    atsScore: "N/A",
    strengths: [],
    areasToImprove: [],
    recommendations: [],
    keywordsFound: [],
    suggestedKeywords: [],
    keywordRelevance: {
      industryRelevance: "N/A",
      softSkills: "N/A",
      technicalSkills: "N/A"
    }
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = rawText.match(pattern);
    if (match) {
      const content = match[1].trim();
      if (["strengths", "areasToImprove", "recommendations"].includes(key)) {
        finalData[key] = extractBulletPoints(content);
      } else if (["keywordsFound", "suggestedKeywords"].includes(key)) {
        finalData[key] = content.split(",").map((item) => item.trim());
      } else if (key === "keywordRelevance") {
        finalData[key] = extractKeywordRelevance(content);
      } else if (key === "atsScore") {
        finalData[key] = extractScore(content);
      }
    }
  }

  return { finalData };
};

export const getAtsData = async () => {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = await genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const resume = await fs.readFile("uploads/resumeData.txt", "utf-8");

    const prompt = `You are an advanced ATS (Applicant Tracking System) resume analysis tool designed to evaluate resumes based on their alignment with job requirements and industry standards. Your task is to analyze the provided resume data and generate a detailed report based on the following criteria:

**Input:**
- Resume Data: ${JSON.stringify(resume)}

**Analysis Criteria:**
1. **Content Quality**: Assess the clarity, specificity, and relevance of the resume content (e.g., work experience, education, skills). Weight: 30%.
2. **Keyword Matching**: Identify keywords present in the resume and compare them to common industry-specific keywords, soft skills, and technical skills.
3. **Formatting and Structure**: Evaluate the organization and readability of the resume (e.g., bullet points, concise descriptions). Weight: 10%.
4. **Experience Relevance**: Check how well the described experiences align with standard expectations for the target role/industry. Weight: 20%.

**Output Requirements:**
Return the analysis in the following structured format:
1. **ATS Score**: Calculate an overall ATS compatibility score out of 100 based on the weighted criteria (Content Quality: 30%, Keyword Matching: 40%, Experience Relevance: 20%, Formatting: 10%). Provide a brief explanation of how the score was derived.
2. **Strengths**: List 3-5 specific strengths of the resume (e.g., "Strong use of technical keywords like 'Python' and 'Machine Learning'").
3. **Areas to Improve**: List 3-5 areas where the resume could be enhanced (e.g., "Lack of quantifiable achievements in work experience").
4. **Recommendations**: Provide 3-5 actionable suggestions to improve the resume (e.g., "Add metrics to demonstrate impact, such as 'Increased sales by 20%'").
5. **Keywords Found in Your Resume**: List all relevant keywords identified in the resume (e.g., "project management, Java, teamwork").
6. **Suggested Keywords to Add**: Suggest 5-10 keywords that are missing but commonly expected in the target role/industry (e.g., "Agile methodology, cloud computing").
7. **Keyword Relevance** (expressed as percentages):
   - **Industry Relevance**: Percentage of keywords matching industry-specific terms (e.g., 75%).
   - **Soft Skills**: Percentage of soft skill keywords present (e.g., 60%).
   - **Technical Skills**: Percentage of technical skill keywords present (e.g., 80%).

**Instructions:**
- Use a logical, step-by-step approach to evaluate the resume.
- Calculate the ATS Score as follows:
  - Assign a score (0-100) to each criterion based on its quality and relevance.
  - Multiply each criterion score by its weight (e.g., Content Quality score * 0.3).
  - Sum the weighted scores to get the final ATS Score out of 100.
- If specific job role or industry details are not provided, assume a general professional role and adjust based on context clues in the resume.
- Be concise but specific in the output, focusing on actionable insights.
- Do not fabricate information; base the analysis solely on the provided resume data.
- Use plain text for headings (e.g., "ATS Score:" instead of "**ATS Score:**")
- Use hyphens (-) for bullet points instead of asterisks

**Output Example:**
ATS Score: 82/100 (Content Quality: 85 * 0.3 = 25.5, Keyword Matching: 90 * 0.4 = 36, Experience Relevance: 75 * 0.2 = 15, Formatting: 60 * 0.1 = 6; Total = 82)
Strengths:
- Clear project descriptions
- Strong technical skills like 'Python' and 'SQL'
- Consistent formatting
Areas to Improve:
- Limited soft skills mentioned
- No quantifiable results
- Missing certifications section
Recommendations:
- Add metrics like 'Reduced processing time by 15%'
- Include soft skills like 'collaboration'
- List relevant certifications
Keywords Found in Your Resume: Python, SQL, data analysis
Suggested Keywords to Add: machine learning, teamwork, AWS
Keyword Relevance:
- Industry Relevance: 70%
- Soft Skills: 40%
- Technical Skills: 85%

Now, analyze the provided resume data and return the results in the specified format.
- THE OUTPUT SHOULD NOT CONTAIN ANY ASTERISKS
`;

    const generatedContent = await model.generateContent(prompt);
    const rawResponse = generatedContent.response.text();

    console.log("Raw Response:", rawResponse);

    // Parse the raw response into structured JSON
    const structuredData = parseAtsResponse(rawResponse);

    console.log("Structured Data:", JSON.stringify(structuredData, null, 2));

    return structuredData;
  } catch (error) {
    console.error("Error in getAtsData:", error);
    throw error;
  }
};