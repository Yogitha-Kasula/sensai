"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-flash-latest",
});

// Retry only on 503 (temporary overload). Never retry on 429 (quota).
async function generateWithRetry(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      if (err?.status !== 503 || i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** i)); // wait 1s, 2s
    }
  }
}

export const generateAIInsights = async (industry) => {
  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "HIGH" | "MEDIUM" | "LOW",
      "topSkills": ["skill1", "skill2"],
      "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
      "keyTrends": ["trend1", "trend2"],
      "recommendedSkills": ["skill1", "skill2"]
    }

    IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
    Include at least 5 common roles for salary ranges.
    Growth rate should be a percentage.
    Include at least 5 skills and trends.
    Make skills concise (e.g., "Python", "Cloud Computing") - maximum 2-3 words per skill.
  `;

  try {
    const result = await generateWithRetry(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    const start = cleanedText.indexOf("{");
    const end = cleanedText.lastIndexOf("}");
    return JSON.parse(cleanedText.substring(start, end + 1));
  } catch (error) {
    console.error("Error generating AI insights:", error);
    if (error?.status === 429) {
      throw new Error("AI daily limit reached. Please try again later.");
    }
    throw error;
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist, return null
  if (!user.industryInsight) {
    return null;
  }

  return user.industryInsight;
}
