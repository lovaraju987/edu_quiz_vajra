import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

// --- FALLBACK DATA FOR OFFLINE MODE ---
const getFallbackQuestions = (level: number) => {
    // Generate some deterministic questions if AI fails
    // This ensures the app works even without an API key
    const categories = ['Health', 'Science', 'Sports', 'GK', 'History'];
    const suffix = level === 1 ? " (Elem)" : level === 2 ? " (Inter)" : " (High)";

    let questions = [];

    // 1. Health
    questions.push(
        { text: `Which vitamin comes from sunlight?${suffix}`, options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin B"], answerIndex: 2, category: "Health", level },
        { text: `How much water should you drink daily?${suffix}`, options: ["1 Glass", "8 Glasses", "20 Glasses", "None"], answerIndex: 1, category: "Health", level },
        { text: `What is good for healthy eyes?${suffix}`, options: ["Carrots", "Candy", "Burger", "Pizza"], answerIndex: 0, category: "Health", level },
        { text: `Which organ pumps blood?${suffix}`, options: ["Brain", "Lungs", "Heart", "Kidney"], answerIndex: 2, category: "Health", level },
        { text: `Junk food causes?${suffix}`, options: ["Strength", "Obesity", "Intelligence", "Speed"], answerIndex: 1, category: "Health", level }
    );

    // 2. Science
    questions.push(
        { text: `H2O is the chemical formula for?${suffix}`, options: ["Oxygen", "Gold", "Water", "Salt"], answerIndex: 2, category: "Science", level },
        { text: `Which planet has rings?${suffix}`, options: ["Mars", "Saturn", "Venus", "Mercury"], answerIndex: 1, category: "Science", level },
        { text: `Force is measured in?${suffix}`, options: ["Joules", "Newtons", "Watts", "Meters"], answerIndex: 1, category: "Science", level },
        { text: `Plants need what to make food?${suffix}`, options: ["Moonlight", "Sunlight", "Fire", "Ice"], answerIndex: 1, category: "Science", level },
        { text: `What is the center of an atom?${suffix}`, options: ["Electron", "Proton", "Nucleus", "Orbit"], answerIndex: 2, category: "Science", level }
    );

    // 3. Sports
    questions.push(
        { text: `Who is the 'God of Cricket'?${suffix}`, options: ["Virat Kohli", "Sachin Tendulkar", "Dhoni", "Kapil Dev"], answerIndex: 1, category: "Sports", level },
        { text: `Olympics 2024 will be held in?${suffix}`, options: ["Paris", "London", "Tokyo", "Delhi"], answerIndex: 0, category: "Sports", level },
        { text: `How many players in a Cricket team?${suffix}`, options: ["10", "11", "12", "9"], answerIndex: 1, category: "Sports", level },
        { text: `National game of India (de facto)?${suffix}`, options: ["Cricket", "Hockey", "Football", "Kabaddi"], answerIndex: 1, category: "Sports", level },
        { text: `P.V. Sindhu plays which sport?${suffix}`, options: ["Tennis", "Badminton", "Boxing", "Running"], answerIndex: 1, category: "Sports", level }
    );

    // 4. GK
    questions.push(
        { text: `Capital of India?${suffix}`, options: ["Mumbai", "Kolkata", "New Delhi", "Chennai"], answerIndex: 2, category: "GK", level },
        { text: `Prime Minister of India (2024)?${suffix}`, options: ["Manmohan Singh", "Narendra Modi", "Rahul Gandhi", "Amit Shah"], answerIndex: 1, category: "GK", level },
        { text: `Largest state in India by area?${suffix}`, options: ["Goa", "UP", "Rajasthan", "Maharashtra"], answerIndex: 2, category: "GK", level },
        { text: `Currency of India?${suffix}`, options: ["Dollar", "Yen", "Rupee", "Euro"], answerIndex: 2, category: "GK", level },
        { text: `National bird of India?${suffix}`, options: ["Peacock", "Eagle", "Sparrow", "Ostrich"], answerIndex: 0, category: "GK", level }
    );

    // 5. History
    questions.push(
        { text: `Who was the first PM of India?${suffix}`, options: ["Gandhi", "Nehru", "Patel", "Bose"], answerIndex: 1, category: "History", level },
        { text: `India got independence in?${suffix}`, options: ["1945", "1947", "1950", "1952"], answerIndex: 1, category: "History", level },
        { text: `Who wrote the Constitution?${suffix}`, options: ["Ambedkar", "Gandhi", "Nehru", "Tagore"], answerIndex: 0, category: "History", level },
        { text: `Father of the Nation?${suffix}`, options: ["Nehru", "Gandhi", "Bhagat Singh", "Bose"], answerIndex: 1, category: "History", level },
        { text: `Ancient university in India?${suffix}`, options: ["Oxford", "Nalanda", "Cambridge", "Harvard"], answerIndex: 1, category: "History", level }
    );

    return questions;
};

export async function generateDailyQuestions(level: number) {
    // If no API key, use fallback immediately
    if (!apiKey) {
        console.warn("⚠️ No GEMINI_API_KEY found. Using fallback questions.");
        return getFallbackQuestions(level);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        // ... (rest of AI logic) ...
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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the response (sometimes AI adds \`\`\`json ... \`\`\`)
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const questions = JSON.parse(jsonStr);

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("Invalid questions format from AI");
        }

        return questions;
    } catch (error) {
        console.error("AI Generation Error:", error);
        console.log("🔄 Falling back to static questions...");
        return getFallbackQuestions(level);
    }
}

export async function generateBatchQuestions(level: number, totalNeeded: number = 200) {
    if (!apiKey) {
        console.warn("⚠️ No GEMINI_API_KEY found. Using fallback questions.");
        return getFallbackQuestions(level); // Fallback gives ~25 questions
    }

    const BATCH_SIZE = 40; // Generate 40 at a time to keep JSON small
    const iterations = Math.ceil(totalNeeded / BATCH_SIZE);
    let allQuestions: any[] = [];

    console.log(`Starting Batch Generation for Level ${level}: Need ${totalNeeded} questions (${iterations} iterations).`);

    for (let i = 0; i < iterations; i++) {
        try {
            console.log(`... Generating batch ${i + 1}/${iterations}`);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

            const levelDescription = level === 1 ? "Classes 4 to 6 (Elementary level)" :
                level === 2 ? "Classes 7 and 8 (Intermediate level)" :
                    "Classes 9 and 10 (High School level)";

            const prompt = `
                You are an expert Indian school teacher. Generate exactly ${BATCH_SIZE} unique multiple-choice questions for students in ${levelDescription}.
                
                The questions must be divided into exactly 5 categories, with ${BATCH_SIZE / 5} questions each:
                1. Health (Hygiene, Nutrition, Human Body)
                2. Science (Physics, Chemistry, Biology, Space)
                3. Sports (Cricket, Olympics, Indian athletes, Games rules)
                4. GK (Indian politics, Geography, Current Affairs, Capitals)
                5. History (Indian Freedom struggle, Ancient India, World History)
        
                For each question, provide:
                - The question text (Ensure it is UNIQUE from typical generic questions)
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

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const questions = JSON.parse(jsonStr);

            if (Array.isArray(questions)) {
                allQuestions = [...allQuestions, ...questions];
            }

            // CRITICAL: 60-second delay to respect Gemini rate limit (15 requests/min)
            // This prevents quota exhaustion during batch generation
            await new Promise(resolve => setTimeout(resolve, 60000));

        } catch (error) {
            console.error(`Error in batch ${i + 1}:`, error);
            // Continue to next batch even if one fails
        }
    }

    console.log(`Completed Batch Generation. Total Questions: ${allQuestions.length}`);

    // If we totally failed, return fallback
    if (allQuestions.length === 0) {
        return getFallbackQuestions(level);
    }

    return allQuestions;
}
