"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export async function saveResume(content) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content,
      },
      create: {
        userId: user.id,
        content,
      },
    });

    revalidatePath("/resume");
    return { success: true, resume };
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const resume = await db.resume.findUnique({
      where: {
        userId: user.id,
      },
    });

    return resume;
  } catch (error) {
    console.error("Error fetching resume:", error);
    throw new Error("Failed to fetch resume");
  }
}

export async function improveWithAI({ current, type }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        industryInsight: true,
      },
    });

    if (!user) throw new Error("User not found");

    const prompt = `
      As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
      Make it more professional, impactful, and quantifiable where possible.
      Keep it concise and focus on achievements over responsibilities.
      
      CRITICAL INSTRUCTION: If the provided text is very brief or vague (e.g., "I started my journey", "Did some coding"), do NOT hallucinate or invent completely unrelated technical skills, methodologies, or specific experiences. Simply improve the phrasing of what the user actually provided while keeping it grounded.

      Current ${type}:
      "${current}"

      IMPORTANT: Return ONLY the improved text. Do not include any conversational text like "Here is the improved version" or "Here you go". Do not wrap the text in markdown blocks or quotes. Just the raw text.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text().trim();

    // Strip markdown formatting if AI ignored instructions
    text = text.replace(/^```[\w]*\n?/g, "").replace(/```$/g, "").trim();
    
    // Strip surrounding quotes if AI wrapped the text
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.slice(1, -1).trim();
    }

    return text;
  } catch (error) {
    console.error("Error improving with AI:", error);
    throw new Error("Failed to improve content");
  }
}
