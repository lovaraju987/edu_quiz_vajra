import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function findWorkingModel() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!data.models) {
            fs.writeFileSync('model_list.txt', "No models found.");
            return;
        }

        const models = data.models.map(m => m.name);
        fs.writeFileSync('model_list.txt', models.join('\n'));
    } catch (e) {
        fs.writeFileSync('model_list.txt', "Error: " + e.message);
    }
}

findWorkingModel();
