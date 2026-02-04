import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY not found in .env.local");
        return;
    }
    console.log("Using Key: " + process.env.GEMINI_API_KEY.substring(0, 10) + "...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelsToTry = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini-1.0-pro',
        'gemini-2.0-flash-exp'
    ];

    console.log("--- Testing SDK Models ---");
    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello");
            console.log(`✅ SDK ${modelName}: SUCCESS`);
        } catch (e) {
            console.log(`❌ SDK ${modelName}: FAILED (${e.message})`);
        }
    }

    console.log("\n--- Testing REST API Direct ---");
    for (const modelName of modelsToTry) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: "Say hello" }] }] })
            });
            const data = await response.json();
            if (response.ok) {
                console.log(`✅ REST ${modelName}: SUCCESS`);
            } else {
                console.log(`❌ REST ${modelName}: FAILED (${data.error?.message || response.statusText})`);
            }
        } catch (e) {
            console.log(`❌ REST ${modelName}: ERROR (${e.message})`);
        }
    }
}

testModels();
