"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export async function generateCoverLetter(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        resume: true,
      },
    });

    if (!user) throw new Error("User not found");

    const prompt = `
      Write a professional cover letter for a job application.
      
      Job Details:
      - Company Name: ${data.companyName}
      - Job Title: ${data.jobTitle}
      - Job Description: ${data.jobDescription || "Not provided"}

      Applicant Details (based on their resume and profile):
      - Industry: ${user.industry || "Not specified"}
      - Experience: ${user.experience || "Not specified"} years
      - Skills: ${user.skills?.join(", ") || "Not specified"}
      - Resume Content:
      ${user.resume?.content || "Not provided"}

      Instructions:
      - The cover letter should be professional, tailored to the job description, and highlight relevant skills and experience from the applicant's resume.
      - Keep it concise (3-4 paragraphs).
      - FORMATTING RULE: You MUST use the EXACT template below for the header and footer. Do NOT replace the bracketed placeholders (like [Your Name]) with real information. Output the brackets exactly as shown in the template.

      [Your Name] [Your Address] [Your Phone Number] [Your Email]

      [Date]

      Hiring Manager ${data.companyName} [Company Address]

      Dear Hiring Manager,

      [Body of your generated cover letter goes here]

      Thank you for your time and consideration. I have attached my resume for your review and welcome the opportunity to discuss my qualifications further.

      Sincerely, [Your Name]
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let content = response.text().trim();

    // Strip Markdown code block syntax if Gemini added it
    content = content.replace(/^```[\w]*\n?/g, "").replace(/```$/g, "").trim();

    const coverLetter = await db.coverLetter.create({
      data: {
        userId: user.id,
        content,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        jobDescription: data.jobDescription,
      },
    });

    revalidatePath("/ai-cover-letter");
    return { success: true, coverLetter };
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error(error.message || "Failed to generate cover letter");
  }
}

export async function getCoverLetters() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const coverLetters = await db.coverLetter.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return coverLetters;
  } catch (error) {
    console.error("Error fetching cover letters:", error);
    throw new Error("Failed to fetch cover letters");
  }
}

export async function getCoverLetter(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const coverLetter = await db.coverLetter.findUnique({
      where: {
        id,
        userId: user.id, // Ensure they own it
      },
    });

    return coverLetter;
  } catch (error) {
    console.error("Error fetching cover letter:", error);
    throw new Error("Failed to fetch cover letter");
  }
}

export async function deleteCoverLetter(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    await db.coverLetter.delete({
      where: {
        id,
        userId: user.id, // Ensure they own it
      },
    });

    revalidatePath("/ai-cover-letter");
    return { success: true };
  } catch (error) {
    console.error("Error deleting cover letter:", error);
    throw new Error("Failed to delete cover letter");
  }
}
