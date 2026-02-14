import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/db';
import Question from '@/models/Question';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET(req: Request) {
    try {
        // Security: Check for API Key or Secret Header
        // For now, allow local dev access
        const { searchParams } = new URL(req.url);
        const forced = searchParams.get('force') === 'true';

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not set in environment variables' }, { status: 500 });
        }

        await dbConnect();

        // 1. Define the Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const categories = ['GK', 'Science', 'History', 'Health', 'Sports'];

        const prompt = `
            Generate 10 unique multiple-choice questions for school students (Classes 4-10).
            - Mix of categories: ${categories.join(', ')}
            - Mix of difficulty levels: 1 (Easy), 2 (Medium), 3 (Hard)
            - Output strictly in valid JSON format as an array of objects.
            - Format: [{"text": "Question?", "options": ["A", "B", "C", "D"], "answerIndex": 0-3, "category": "Category", "level": 1-3}]
            - Ensure options are plausible but only one is correct.
            - Ensure questions are factually correct and appropriate for students.
        `;

        // 2. Generate Content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 3. Parse JSON
        // Gemini sometimes wraps JSON in markdown code blocks, strip them
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const newQuestions = JSON.parse(jsonString);

        if (!Array.isArray(newQuestions)) {
            throw new Error("AI response was not an array");
        }

        // 4. Save to Database (with Duplicate Check)
        let addedCount = 0;
        const duplicates = [];

        for (const q of newQuestions) {
            // Check if question text already exists (fuzzy match could be better, but exact match for now)
            const exists = await Question.findOne({ text: q.text });

            if (!exists) {
                await Question.create({
                    text: q.text,
                    options: q.options,
                    answerIndex: q.answerIndex,
                    category: q.category,
                    level: q.level
                });
                addedCount++;
            } else {
                duplicates.push(q.text);
            }
        }

        return NextResponse.json({
            message: `Successfully generated and processed questions.`,
            added: addedCount,
            duplicates: duplicates.length,
            generatedCount: newQuestions.length
        });

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
