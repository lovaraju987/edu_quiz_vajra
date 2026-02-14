
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://hemanthsilla_db_user:xWeCpptLYS39Qqde@cluster0.0wvrlfh.mongodb.net/edu_quiz_vajra?retryWrites=true&w=majority&appName=Cluster0";

const questions = [
    // --- LEVEL 1 (Classes 4, 5, 6) ---
    // History
    { text: "Who was the first Prime Minister of India?", options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Sardar Patel", "B.R. Ambedkar"], answerIndex: 1, category: "History", level: 1 },
    { text: "Who wrote our national anthem?", options: ["Subhash Chandra Bose", "Rabindranath Tagore", "Bankim Chandra Chattopadhyay", "Sarojini Naidu"], answerIndex: 1, category: "History", level: 1 },
    { text: "Who is known as the God Father of India?", options: ["Mahatma Gandhi", "Bal Gangadhar Tilak", "Dada Bhai Naoroji", "Lala Lajpat Rai"], answerIndex: 2, category: "History", level: 1 },

    // GK & Current Affairs
    { text: "What is the name of our national bird?", options: ["Parrot", "Peacock", "Eagle", "Sparrow"], answerIndex: 1, category: "GK", level: 1 },
    { text: "What is the capital city of India?", options: ["Mumbai", "Kolkata", "New Delhi", "Chennai"], answerIndex: 2, category: "GK", level: 1 },
    { text: "When do we celebrate Children's Day in India?", options: ["October 2nd", "September 5th", "November 14th", "August 15th"], answerIndex: 2, category: "GK", level: 1 },
    { text: "What is the abbreviation of ATM?", options: ["Any Time Money", "Automated Teller Machine", "Auto Ticket Maker", "Automatic Transaction Mode"], answerIndex: 1, category: "GK", level: 1 },
    { text: "What does WWW stand for?", options: ["World Wide Web", "World Web Wide", "Wide World Web", "Web World Wide"], answerIndex: 0, category: "GK", level: 1 },

    // Science & Technology
    { text: "Who invented the TV?", options: ["Thomas Edison", "John Logie Baird", "Alexander Graham Bell", "James Watt"], answerIndex: 1, category: "Science", level: 1 },
    { text: "Who invented the Telephone?", options: ["Isaac Newton", "Alexander Graham Bell", "Nikola Tesla", "Albert Einstein"], answerIndex: 1, category: "Science", level: 1 },
    { text: "Who invented the Computer?", options: ["Charles Babbage", "Bill Gates", "Steve Jobs", "Alan Turing"], answerIndex: 0, category: "Science", level: 1 },
    { text: "Which planet is known as the Red Planet?", options: ["Earth", "Venus", "Mars", "Jupiter"], answerIndex: 2, category: "Science", level: 1 },

    // Sports & Games
    { text: "What is the name of our national game?", options: ["Cricket", "Football", "Hockey", "Kabaddi"], answerIndex: 2, category: "Sports", level: 1 },
    { text: "When did India win the first World Cup in Cricket?", options: ["1975", "1983", "2007", "2011"], answerIndex: 1, category: "Sports", level: 1 },
    { text: "Who is the current captain of Indian Cricket Team (T20I/ODI)?", options: ["MS Dhoni", "Virat Kohli", "Rohit Sharma", "Hardik Pandya"], answerIndex: 2, category: "Sports", level: 1 },

    // Health
    { text: "Which vitamin do we get from Sunlight?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], answerIndex: 3, category: "Health", level: 1 },
    { text: "Which bird can separate water and milk according to mythology?", options: ["Swan (Hamsa)", "Peacock", "Crow", "Parrot"], answerIndex: 0, category: "Health", level: 1 },
    { text: "How many bones are there in an adult human body?", options: ["200", "206", "210", "220"], answerIndex: 1, category: "Health", level: 1 },

    // --- ADDING MORE TO REACH 25+ PER LEVEL (SIMULATED FOR NOW) ---
    { text: "Who is the present Prime Minister of India?", options: ["Narendra Modi", "Manmohan Singh", "Amit Shah", "Rahul Gandhi"], answerIndex: 0, category: "GK", level: 1 },
    { text: "What is the full form of SMS?", options: ["Short Message Service", "Small Message System", "Simple Message Send", "Standard Mail Service"], answerIndex: 0, category: "GK", level: 1 },
    { text: "Who invented the Steam Engine?", options: ["George Stephenson", "James Watt", "Robert Fulton", "James Hargreaves"], answerIndex: 1, category: "Science", level: 1 },
    { text: "Who invented the Radio?", options: ["Guglielmo Marconi", "Benjamin Franklin", "Thomas Edison", "Nikola Tesla"], answerIndex: 0, category: "Science", level: 1 },
    { text: "Name of the hero in PK movie?", options: ["Salman Khan", "Shah Rukh Khan", "Aamir Khan", "Akshay Kumar"], answerIndex: 2, category: "GK", level: 1 },
    { text: "Who is the Director of Robo movie?", options: ["S.S. Rajamouli", "Shankar", "Mani Ratnam", "Karan Johar"], answerIndex: 1, category: "GK", level: 1 },
    { text: "What is ISO abbreviation in context of standards?", options: ["International Standards Organization", "Indian Standard Office", "Internal System Order", "International System Org"], answerIndex: 0, category: "GK", level: 1 },

    // --- LEVEL 2 (Classes 7, 8) ---
    { text: "Which organ filters blood in the human body?", options: ["Heart", "Lungs", "Kidneys", "Liver"], answerIndex: 2, category: "Health", level: 2 },
    { text: "What is the largest cell in the human body?", options: ["Nerve Cell", "Ovum", "Sperm", "Muscle Cell"], answerIndex: 1, category: "Health", level: 2 },
    { text: "What is the chemical symbol for Gold?", options: ["Ag", "Au", "Gd", "Fe"], answerIndex: 1, category: "Science", level: 2 },
    { text: "Who discovered Penicillin?", options: ["Louis Pasteur", "Alexander Fleming", "Gregor Mendel", "Charles Darwin"], answerIndex: 1, category: "Science", level: 2 },
    { text: "The Battle of Plassey was fought in which year?", options: ["1757", "1764", "1857", "1526"], answerIndex: 0, category: "History", level: 2 },
    { text: "Who was the first woman Prime Minister of India?", options: ["Pratibha Patil", "Indira Gandhi", "Sarojini Naidu", "Sushma Swaraj"], answerIndex: 1, category: "History", level: 2 },
    { text: "Who won the FIFA World Cup 2022?", options: ["France", "Brazil", "Argentina", "Germany"], answerIndex: 2, category: "Sports", level: 2 },
    { text: "In which sport is the term 'Butterfly Stroke' used?", options: ["Tennis", "Swimming", "Badminton", "Wrestling"], answerIndex: 1, category: "Sports", level: 2 },
    { text: "Which state is known as the 'Spice Garden of India'?", options: ["Karnataka", "Tamil Nadu", "Kerala", "Assam"], answerIndex: 2, category: "GK", level: 2 },
    { text: "Who is the author of 'Wings of Fire'?", options: ["A.P.J. Abdul Kalam", "Chethan Bhagat", "Arundhati Roy", "R.K. Narayan"], answerIndex: 0, category: "GK", level: 2 },

    // --- LEVEL 3 (Classes 9, 10) ---
    { text: "What is the pH value of pure water?", options: ["5", "7", "9", "11"], answerIndex: 1, category: "Science", level: 3 },
    { text: "Which gas is known as Laughing Gas?", options: ["Nitrogen Dioxide", "Nitrous Oxide", "Carbon Monoxide", "Sulphur Dioxide"], answerIndex: 1, category: "Science", level: 3 },
    { text: "Who was the Viceroy of India during the Partition of Bengal?", options: ["Lord Dalhousie", "Lord Curzon", "Lord Mountbatten", "Lord Canning"], answerIndex: 1, category: "History", level: 3 },
    { text: "The Quit India Movement was started in which year?", options: ["1930", "1942", "1920", "1947"], answerIndex: 1, category: "History", level: 3 },
    { text: "Which is the smallest country in the world by area?", options: ["Monaco", "Maldives", "Vatican City", "San Marino"], answerIndex: 2, category: "GK", level: 3 },
    { text: "The 'Theory of Relativity' was proposed by?", options: ["Isaac Newton", "Albert Einstein", "Stephen Hawking", "Galileo Galilei"], answerIndex: 1, category: "Science", level: 3 },
    { text: "Who is the first Indian women to win an Olympic medal?", options: ["P.V. Sindhu", "Mary Kom", "Karnam Malleswari", "Saina Nehwal"], answerIndex: 2, category: "Sports", level: 3 },
    { text: "Which blood group is known as the Universal Donor?", options: ["A+", "B+", "O-", "AB+"], answerIndex: 2, category: "Health", level: 3 },

];

async function seed() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        const QuestionSchema = new mongoose.Schema({
            text: { type: String, required: true },
            options: [{ type: String, required: true }],
            answerIndex: { type: Number, required: true },
            category: { type: String, required: true },
            level: { type: Number, required: true },
            createdAt: { type: Date, default: Date.now }
        });

        const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

        console.log('Clearing old questions...');
        await Question.deleteMany({}); // Optional: Clear old data to avoid dups

        console.log(`Seeding ${questions.length} questions...`);
        await Question.insertMany(questions);

        console.log('Success! Questions seeded.');
        process.exit(0);
    } catch (e) {
        console.error('Error seeding:', e);
        process.exit(1);
    }
}

seed();
