import fs from "fs";
const getJobLink = async (req, res) => {
  try {
    const jobDocs = await fs.readFileSync("uploads/docsData.txt","utf-8");
    console.log(jobDocs);
    const pattern = /https?:\/\/[^\s]+/g;
    const link = jobDocs.match(pattern)[0];
    // Output: https://tinyurl.com/Registration-HighRadius-2026
    console.log(link);
    res.json({ link });
  } catch (error) {
    console.log("getJobLink.js error:  ",error);
  }
};
export default getJobLink;
