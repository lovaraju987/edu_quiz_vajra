import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-pro"];

    for (const modelName of models) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Give me a list of 2 fruits in JSON format like [\"apple\", \"banana\"]");
            const text = (await result.response).text();
            console.log(`Success ${modelName}:`, text);
        } catch (e) {
            console.log(`Failed ${modelName}:`, e.message);
        }
    }
}

test();
