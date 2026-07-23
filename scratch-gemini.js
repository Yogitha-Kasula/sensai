const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent("hello");
    console.log("Success with gemini-1.5-flash");
  } catch (e) {
    console.error("Error with gemini-1.5-flash:", e.message);
  }
}
run();
