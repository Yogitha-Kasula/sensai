export const initialResumeData = {
  contactInfo: {
    name: "",
    email: "",
    mobile: "",
    countryCode: "+91",
    linkedin: "",
    twitter: "",
  },
  summary: "",
  skills: "",
  experience: [],
  education: [],
  projects: [],
};

// Generates markdown from the form data and appends the raw JSON as an invisible comment
export function generateResumeMarkdown(data) {
  let md = "";

  md += `<div align="center">\n\n`;

  // Name (Header)
  const emailName = data.contactInfo.email ? data.contactInfo.email.split('@')[0] : "Your Name";
  const name = data.contactInfo.name ? data.contactInfo.name : emailName;
  md += `# ${name}\n\n`;

  // Contact Info
  const contact = [];
  if (data.contactInfo.email) contact.push(`📧 ${data.contactInfo.email}`);
  if (data.contactInfo.mobile) {
    const code = data.contactInfo.countryCode ? `${data.contactInfo.countryCode} ` : "";
    contact.push(`📱 ${code}${data.contactInfo.mobile}`);
  }
  if (data.contactInfo.linkedin) contact.push(`💼 [LinkedIn](${data.contactInfo.linkedin})`);
  if (data.contactInfo.twitter) contact.push(`🐦 [Twitter](${data.contactInfo.twitter})`);

  if (contact.length > 0) {
    md += `${contact.join(" | ")}\n\n`;
  }

  md += `</div>\n\n`;

  // Summary
  if (data.summary) {
    md += `## Professional Summary\n\n${data.summary}\n\n`;
  }

  // Skills
  if (data.skills) {
    md += `## Skills\n\n${data.skills}\n\n`;
  }

  // Work Experience
  if (data.experience && data.experience.length > 0) {
    md += `## Work Experience\n\n`;
    data.experience.forEach((exp) => {
      if (!exp) return;
      const dates = `${exp.startDate || "Present"} - ${exp.isCurrent ? "Present" : exp.endDate || ""}`;
      md += `#### ${exp.title} @ ${exp.company}\n`;
      md += `${dates}\n\n`;
      if (exp.description) {
        md += `${exp.description}\n\n`;
      }
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    md += `## Education\n\n`;
    data.education.forEach((edu) => {
      if (!edu) return;
      const dates = `${edu.startYear || ""} - ${edu.endYear || ""}`;
      md += `#### ${edu.degree}\n`;
      md += `${edu.school} | ${dates}\n\n`;
    });
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    md += `## Projects\n\n`;
    data.projects.forEach((proj) => {
      if (!proj) return;
      md += `#### ${proj.name}\n`;
      if (proj.link) md += `[Link](${proj.link})\n\n`;
      if (proj.description) md += `${proj.description}\n\n`;
    });
  }

  return md.trim();
}

// Parses the markdown string to extract the embedded form data
export function parseResumeMarkdown(markdown) {
  if (!markdown) return initialResumeData;

  const match = markdown.match(/<!-- RESUME_DATA: (.*?) -->/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error("Failed to parse embedded resume data:", e);
    }
  }

  // If no embedded data, return initial (we could attempt to parse the markdown but that's very brittle)
  return initialResumeData;
}
