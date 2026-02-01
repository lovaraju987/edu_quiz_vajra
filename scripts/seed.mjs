import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    process.exit(1);
}

const QuestionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    answerIndex: { type: Number, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Health', 'Science', 'Sports', 'GK', 'History']
    },
    level: { type: Number, required: true, enum: [1, 2, 3] },
    createdAt: { type: Date, default: Date.now },
});

const Question = mongoose.model('Question', QuestionSchema);

const questions = [
    // LEVEL 1 (4-6)
    { text: "Who was our First Prime Minister of India?", options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Sardar Patel", "B.R. Ambedkar"], answerIndex: 1, category: "History", level: 1 },
    { text: "Who is our Present Prime Minister of India?", options: ["Narendra Modi", "Manmohan Singh", "Amit Shah", "Rahul Gandhi"], answerIndex: 0, category: "GK", level: 1 },
    { text: "RBI Governor Name", options: ["Urjit Patel", "Shaktikanta Das", "Raghuram Rajan", "Nirmala Sitharaman"], answerIndex: 1, category: "GK", level: 1 },
    { text: "Who is our State Educational Minister?", options: ["Botsa Satyanarayana", "Lokesh Nara", "Adimulapu Suresh", "Ganta Srinivasa Rao"], answerIndex: 1, category: "GK", level: 1 },
    { text: "Who is our State Home Minister?", options: ["Mekathoti Sucharita", "Taneti Vanitha", "Vangalapudi Anitha", "Nimmakayala Chinarajappa"], answerIndex: 2, category: "GK", level: 1 },
    { text: "Who wrote our national anthem?", options: ["Subhash Chandra Bose", "Rabindranath Tagore", "Bankim Chandra Chattopadhyay", "Sarojini Naidu"], answerIndex: 1, category: "History", level: 1 },
    { text: "Name of our national bird", options: ["Parrot", "Peacock", "Eagle", "Sparrow"], answerIndex: 1, category: "GK", level: 1 },
    { text: "Name of our national game", options: ["Cricket", "Football", "Hockey", "Kabaddi"], answerIndex: 2, category: "Sports", level: 1 },
    { text: "Who is the God Father of India?", options: ["Mahatma Gandhi", "Dada Bhai Naoroji", "Bal Gangadhar Tilak", "Lala Lajpat Rai"], answerIndex: 1, category: "History", level: 1 },
    { text: "When, India won the first world cup in cricket?", options: ["1975", "1983", "2007", "2011"], answerIndex: 1, category: "Sports", level: 1 },
    { text: "Abbreviation of ATM", options: ["Any Time Money", "Automated Teller Machine", "Auto Ticket Maker", "Automatic Transaction Mode"], answerIndex: 1, category: "GK", level: 1 },
    { text: "SMS full form", options: ["Short Message Service", "Small Message System", "Simple Message Send", "Standard Mail Service"], answerIndex: 0, category: "GK", level: 1 },
    { text: "ISO full form", options: ["International Standards Organization", "Indian Standard Office", "Internal System Order", "International System Org"], answerIndex: 0, category: "GK", level: 1 },
    { text: "RTC full form", options: ["Road Transport Corporation", "Rail Ticket Center", "Remote Terminal Control", "Real Time Clock"], answerIndex: 0, category: "GK", level: 1 },
    { text: "WWW full form", options: ["World Wide Web", "World Web Wide", "Wide World Web", "Web World Wide"], answerIndex: 0, category: "GK", level: 1 },
    { text: "Who invented the TV?", options: ["Thomas Edison", "John Logie Baird", "Alexander Graham Bell", "James Watt"], answerIndex: 1, category: "Science", level: 1 },
    { text: "Who invented the Telephone?", options: ["Isaac Newton", "Alexander Graham Bell", "Nikola Tesla", "Albert Einstein"], answerIndex: 1, category: "Science", level: 1 },
    { text: "Who invented the Computer?", options: ["Charles Babbage", "Bill Gates", "Steve Jobs", "Alan Turing"], answerIndex: 0, category: "Science", level: 1 },
    { text: "Who invented the Steam Engine?", options: ["George Stephenson", "James Watt", "Robert Fulton", "James Hargreaves"], answerIndex: 1, category: "Science", level: 1 },
    { text: "Who invented the Radio?", options: ["Guglielmo Marconi", "Benjamin Franklin", "Thomas Edison", "Nikola Tesla"], answerIndex: 0, category: "Science", level: 1 },
    { text: "Who is our Indian Cricket Team Captain (T20I)?", options: ["Suryakumar Yadav", "Rohit Sharma", "Virat Kohli", "Hardik Pandya"], answerIndex: 0, category: "Sports", level: 1 },
    { text: "Name of the hero in PK movie?", options: ["Salman Khan", "Shah Rukh Khan", "Aamir Khan", "Akshay Kumar"], answerIndex: 2, category: "GK", level: 1 },
    { text: "Who is the Director of Robo movie?", options: ["S.S. Rajamouli", "Shankar", "Mani Ratnam", "Karan Johar"], answerIndex: 1, category: "GK", level: 1 },
    { text: "Which bird will separates water and milk?", options: ["Swan (Hamsa)", "Peacock", "Crow", "Parrot"], answerIndex: 0, category: "Science", level: 1 },
    { text: "We are celebrating the children's day on:", options: ["October 2nd", "September 5th", "November 14th", "August 15th"], answerIndex: 2, category: "GK", level: 1 },

    // Add some Level 2 and Level 3 items to ensure they exist
    { text: "Which organ filters blood in the human body?", options: ["Heart", "Lungs", "Kidneys", "Liver"], answerIndex: 2, category: "Health", level: 2 },
    { text: "What is the largest cell in the human body?", options: ["Nerve Cell", "Ovum", "Sperm", "Muscle Cell"], answerIndex: 1, category: "Health", level: 2 },
    { text: "What is the pH value of pure water?", options: ["5", "7", "9", "11"], answerIndex: 1, category: "Science", level: 3 },
    { text: "The Quit India Movement was started in which year?", options: ["1930", "1942", "1920", "1947"], answerIndex: 1, category: "History", level: 3 },
];

// Duplicate or add placeholders to reach 25 for each level/category for safety
const topics = ['Health', 'Science', 'Sports', 'GK', 'History'];
const finalQuestions = [...questions];

[1, 2, 3].forEach(lv => {
    topics.forEach(tp => {
        const existing = finalQuestions.filter(q => q.level === lv && q.category === tp);
        for (let i = existing.length; i < 10; i++) {
            finalQuestions.push({
                text: `Sample ${tp} Question for Level ${lv} - #${i}`,
                options: ["A", "B", "C", "D"],
                answerIndex: 0,
                category: tp,
                level: lv
            });
        }
    });
});

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        await Question.deleteMany({});
        console.log('Cleared existing questions');

        await Question.insertMany(finalQuestions);
        console.log(`Seeded ${finalQuestions.length} questions`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
