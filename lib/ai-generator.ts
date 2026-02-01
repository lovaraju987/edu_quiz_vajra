import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

export async function generateDailyQuestions(level: number) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const levelDescription = level === 1 ? "Classes 4 to 6 (Elementary level)" :
        level === 2 ? "Classes 7 and 8 (Intermediate level)" :
            "Classes 9 and 10 (High School level)";

    const prompt = `
        You are an expert Indian school teacher. Generate exactly 25 unique multiple-choice questions for students in ${levelDescription}.
        
        The questions must be divided into exactly 5 categories, with 5 questions each:
        1. Health (Hygiene, Nutrition, Human Body)
        2. Science (Physics, Chemistry, Biology, Space)
        3. Sports (Cricket, Olympics, Indian athletes, Games rules)
        4. GK (Indian politics, Geography, Current Affairs, Capitals)
        5. History (Indian Freedom struggle, Ancient India, World History)

        For each question, provide:
        - The question text
        - 4 distinct options
        - The index of the correct answer (0 to 3)

        Output the result STRICTLY as a JSON array of objects with the following structure:
        [
          {
            "text": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answerIndex": 1,
            "category": "Science",
            "level": ${level}
          }
        ]

        Do not include any conversational text or markdown code blocks. Just the raw JSON.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the response (sometimes AI adds ```json ... ```)
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const questions = JSON.parse(jsonStr);

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("Invalid questions format from AI");
        }

        return questions;
    } catch (error) {
        console.error("AI Generation Error:", error);
        return null;
    }
}
