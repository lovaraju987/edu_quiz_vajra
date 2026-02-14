import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
        Generate exactly 5 unique multiple-choice questions for school students.
        - Level: 1 (Classes 4-6)
        - Category: GK
        - Output strictly in valid JSON format as an array of objects.
        - Format: [{"text": "Question?", "options": ["A", "B", "C", "D"], "answerIndex": 0-3, "category": "GK", "level": 1}]
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("RAW TEXT START\n", text, "\nRAW TEXT END");

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const jsonString = jsonMatch[0];
            const parsed = JSON.parse(jsonString);
            console.log("Parsed successfuly, count:", parsed.length);
        } else {
            console.log("No JSON array found in response");
        }
    } catch (e) {
        console.error("Test Error:", e);
    }
}

test();
