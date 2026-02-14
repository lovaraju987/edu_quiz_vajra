import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("No models found. Response:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

listModels();
