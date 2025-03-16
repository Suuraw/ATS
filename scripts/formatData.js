
async function formatResumeData(rawText) {
  try {
    const formattedData = {};

    // Extract name
    const nameMatch = rawText.match(/^(\w+\s\w+)/);
    formattedData.name = nameMatch ? nameMatch[1] : "";

    // Extract contact details
    const contactMatch = rawText.match(/(\d{3}-\d{3}-\d{4}).*?([\w.-]+@[\w.-]+)\s.*?(linkedin\.com\/in\/[^\s]+)\s.*?(github\.com\/[^\s]+)/);
    formattedData.contact = {
      phone: contactMatch ? contactMatch[1] : "",
      email: contactMatch ? contactMatch[2] : "",
      linkedin: contactMatch ? contactMatch[3] : "",
      github: contactMatch ? contactMatch[4] : "",
    };

    // Extract summary
    const summaryMatch = rawText.match(/Summary(.*?)Skills/s);
    formattedData.summary = summaryMatch ? summaryMatch[1].trim() : "";

    // Extract skills
    const skillsMatch = rawText.match(/Skills(.*?)Experience/s);
    formattedData.skills = skillsMatch ? skillsMatch[1].split(/\s{2,}/).map((s) => s.trim()) : [];

    // Extract experience
    const experienceMatch = rawText.match(/Experience(.*?)Education/s);
    formattedData.experience = experienceMatch ? experienceMatch[1].trim() : "";

    // Extract education
    const educationMatch = rawText.match(/Education(.*?)Projects/s);
    formattedData.education = educationMatch ? educationMatch[1].trim() : "";

    // Extract projects
    const projectsMatch = rawText.match(/Projects(.*?)Activities/s);
    formattedData.projects = projectsMatch ? projectsMatch[1].trim() : "";

    // Extract activities
    const activitiesMatch = rawText.match(/Activities(.*)/s);
    formattedData.activities = activitiesMatch ? activitiesMatch[1].trim() : "";

    return JSON.stringify(formattedData, null, 2);
  } catch (error) {
    throw new Error("Error formatting resume: " + error.message);
  }
}

export default formatResumeData;
