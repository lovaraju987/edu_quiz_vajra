import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const QuestionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    answerIndex: { type: Number, required: true },
    category: { type: String, required: true },
    level: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema, 'questions');

const level1 = [
    { text: "Which city is the capital of India?", options: ["Mumbai", "Kolkata", "New Delhi", "Chennai"], answerIndex: 2, category: "General Knowledge", level: 1 },
    { text: "Who was the first Prime Minister of independent India?", options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Subhash Chandra Bose", "Sardar Patel"], answerIndex: 1, category: "History", level: 1 },
    { text: "Which planet is known as the 'Red Planet'?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answerIndex: 1, category: "Science", level: 1 },
    { text: "Which is the national animal of India?", options: ["Lion", "Elephant", "Tiger", "Leopard"], answerIndex: 2, category: "General Knowledge", level: 1 },
    { text: "What color is at the top of the Indian National Flag?", options: ["Saffron", "White", "Green", "Blue"], answerIndex: 0, category: "GK", level: 1 },
    { text: "Which organ in our body pumps blood?", options: ["Lungs", "Brain", "Heart", "Kidney"], answerIndex: 2, category: "Science", level: 1 },
    { text: "Who is known as the 'Father of the Nation' in India?", options: ["Bhagat Singh", "Mahatma Gandhi", "Dr. B.R. Ambedkar", "Jawaharlal Nehru"], answerIndex: 1, category: "History", level: 1 },
    { text: "How many colors are there in a rainbow?", options: ["5", "6", "7", "8"], answerIndex: 2, category: "Science", level: 1 },
    { text: "MS Dhoni is associated with which sport?", options: ["Football", "Hockey", "Cricket", "Tennis"], answerIndex: 2, category: "Sports", level: 1 },
    { text: "Which is the largest bird in the world?", options: ["Peacock", "Eagle", "Ostrich", "Penguin"], answerIndex: 2, category: "Science", level: 1 },
    { text: "What is the capital of Telangana?", options: ["Warangal", "Nizamabad", "Hyderabad", "Karimnagar"], answerIndex: 2, category: "General Knowledge", level: 1 },
    { text: "Which animal is called the Ship of the Desert?", options: ["Horse", "Elephant", "Camel", "Donkey"], answerIndex: 2, category: "General Knowledge", level: 1 },
    { text: "Who wrote the National Anthem of India?", options: ["Bankim Chandra Chatterjee", "Rabindranath Tagore", "Sarojini Naidu", "Prem Chand"], answerIndex: 1, category: "History", level: 1 },
    { text: "Which is the longest river in India?", options: ["Godavari", "Yamuna", "Ganga", "Narmada"], answerIndex: 2, category: "General Knowledge", level: 1 },
    { text: "What is the capital of Andhra Pradesh?", options: ["Vijayawada", "Visakhapatnam", "Amaravati", "Tirupati"], answerIndex: 2, category: "General Knowledge", level: 1 },
    { text: "How many states are there in India?", options: ["27", "28", "29", "25"], answerIndex: 1, category: "General Knowledge", level: 1 },
    { text: "Which game uses a bat, ball, and wickets?", options: ["Football", "Hockey", "Cricket", "Badminton"], answerIndex: 2, category: "Sports", level: 1 },
    { text: "What do bees make?", options: ["Milk", "Honey", "Wax", "Juice"], answerIndex: 1, category: "Science", level: 1 },
    { text: "Which day is celebrated as Children's Day in India?", options: ["September 5", "November 14", "October 2", "August 15"], answerIndex: 1, category: "GK", level: 1 },
    { text: "The Sun rises in the...", options: ["North", "South", "East", "West"], answerIndex: 2, category: "Science", level: 1 },
    { text: "Which festival is known as the 'Festival of Lights'?", options: ["Holi", "Diwali", "Eid", "Christmas"], answerIndex: 1, category: "General Knowledge", level: 1 },
    { text: "Which sense organ is used for tasting?", options: ["Nose", "Tongue", "Skin", "Eyes"], answerIndex: 1, category: "Health", level: 1 },
    { text: "A figure with three sides is called a...", options: ["Circle", "Square", "Triangle", "Rectangle"], answerIndex: 2, category: "Science", level: 1 },
    { text: "Which is the smallest state of India?", options: ["Sikkim", "Goa", "Tripura", "Manipur"], answerIndex: 1, category: "GK", level: 1 },
    { text: "Gateway of India is located in...", options: ["Delhi", "Mumbai", "Jaipur", "Kolkata"], answerIndex: 1, category: "History", level: 1 }
];

const level2 = [
    { text: "Who is known as the 'Missile Man of India'?", options: ["C.V. Raman", "Dr. A.P.J. Abdul Kalam", "Homi Bhabha", "Vikram Sarabhai"], answerIndex: 1, category: "Science", level: 2 },
    { text: "Which gas do plants absorb from the atmosphere for photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answerIndex: 2, category: "Science", level: 2 },
    { text: "Who was the first Indian woman to win an Olympic medal?", options: ["Saina Nehwal", "Karnam Malleswari", "Mary Kom", "P.V. Sindhu"], answerIndex: 1, category: "Sports", level: 2 },
    { text: "Which is the largest continent in the world?", options: ["Africa", "Europe", "Asia", "North America"], answerIndex: 2, category: "General Knowledge", level: 2 },
    { text: "The 'Quit India' movement was started in which year?", options: ["1940", "1942", "1945", "1947"], answerIndex: 1, category: "History", level: 2 },
    { text: "Which organ filters blood in the human body?", options: ["Heart", "Lungs", "Kidneys", "Liver"], answerIndex: 2, category: "Health", level: 2 },
    { text: "Pankaj Advani is associated with which sport?", options: ["Billiards", "Boxing", "Archery", "Shooting"], answerIndex: 0, category: "Sports", level: 2 },
    { text: "What is the chemical formula for water?", options: ["CO2", "H2O", "O2", "NaCl"], answerIndex: 1, category: "Science", level: 2 },
    { text: "Who was the chairman of the Drafting Committee of the Indian Constitution?", options: ["Jawaharlal Nehru", "Dr. B.R. Ambedkar", "Sardar Patel", "Dr. Rajendra Prasad"], answerIndex: 1, category: "History", level: 2 },
    { text: "Which planet has the most visible rings?", options: ["Jupiter", "Uranus", "Saturn", "Neptune"], answerIndex: 2, category: "Science", level: 2 },
    { text: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], answerIndex: 2, category: "General Knowledge", level: 2 },
    { text: "Which vitamin is obtained from sunlight?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], answerIndex: 3, category: "Health", level: 2 },
    { text: "The Battle of Plassey was fought in...", options: ["1757", "1764", "1857", "1526"], answerIndex: 0, category: "History", level: 2 },
    { text: "Which is the hardest substance available on earth?", options: ["Gold", "Iron", "Diamond", "Platinum"], answerIndex: 2, category: "Science", level: 2 },
    { text: "Who invented the telephone?", options: ["Thomas Edison", "Alexander Graham Bell", "Isaac Newton", "Albert Einstein"], answerIndex: 1, category: "Science", level: 2 },
    { text: "Which state of India is known as the 'Spice Garden'?", options: ["Karnataka", "Kerala", "Assam", "Tamil Nadu"], answerIndex: 1, category: "General Knowledge", level: 2 },
    { text: "How many players are there in a Cricket team on the field?", options: ["9", "11", "12", "10"], answerIndex: 1, category: "Sports", level: 2 },
    { text: "Who discovered Penicillin?", options: ["Louis Pasteur", "Alexander Fleming", "Edward Jenner", "Marie Curie"], answerIndex: 1, category: "Science", level: 2 },
    { text: "Which is the highest waterfall in India?", options: ["Dudhsagar", "Jog Falls", "Kunchikal Falls", "Athirappilly"], answerIndex: 2, category: "GK", level: 2 },
    { text: "The currency of Japan is...", options: ["Yuan", "Euro", "Yen", "Dollar"], answerIndex: 2, category: "GK", level: 2 },
    { text: "Which is the largest desert in the world?", options: ["Thar", "Gobi", "Sahara", "Kalahari"], answerIndex: 2, category: "GK", level: 3 },
    { text: "Who was the first human to travel into space?", options: ["Neil Armstrong", "Yuri Gagarin", "Rakesh Sharma", "Buzz Aldrin"], answerIndex: 1, category: "Science", level: 2 },
    { text: "What is the normal body temperature of a human?", options: ["98.6°F", "95.4°F", "100.2°F", "97.0°F"], answerIndex: 0, category: "Health", level: 2 },
    { text: "Which part of the plant conducts photosynthesis?", options: ["Root", "Stem", "Leaf", "Flower"], answerIndex: 2, category: "Science", level: 2 },
    { text: "Durand Cup is associated with which sport?", options: ["Hockey", "Football", "Cricket", "Tennis"], answerIndex: 1, category: "Sports", level: 2 }
];

// Level 3 also added
const level3 = [
    { text: "What is the SI unit of force?", options: ["Joule", "Watt", "Newton", "Pascal"], answerIndex: 2, category: "Science", level: 3 },
    { text: "Who wrote the book 'Discovery of India'?", options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Sardar Patel", "Rabindranath Tagore"], answerIndex: 1, category: "History", level: 3 },
    { text: "In which year did the First World War begin?", options: ["1912", "1914", "1918", "1939"], answerIndex: 1, category: "History", level: 3 },
    { text: "Which element has the atomic number 1?", options: ["Helium", "Hydrogen", "Oxygen", "Lithium"], answerIndex: 1, category: "Science", level: 3 },
    { text: "Which Indian state has the longest coastline?", options: ["Maharashtra", "Tamil Nadu", "Gujarat", "Andhra Pradesh"], answerIndex: 2, category: "General Knowledge", level: 3 },
    { text: "Who won the Nobel Prize for Physics in 1930 for the discovery of Raman Effect?", options: ["Homi Bhabha", "C.V. Raman", "S. Chandrasekhar", "Jagadish Chandra Bose"], answerIndex: 1, category: "Science", level: 3 },
    { text: "What is the maximum number of members in Lok Sabha?", options: ["543", "545", "552", "250"], answerIndex: 2, category: "General Knowledge", level: 3 },
    { text: "Which organ produces insulin in the human body?", options: ["Liver", "Pancreas", "Kidneys", "Gallbladder"], answerIndex: 1, category: "Health", level: 3 },
    { text: "Who was the first Indian to win an individual Olympic Gold medal?", options: ["Neeraj Chopra", "Abhinav Bindra", "Leander Paes", "Rajyavardhan Rathore"], answerIndex: 1, category: "Sports", level: 3 },
    { text: "The 'Dandi March' was associated with which movement?", options: ["Non-Cooperation", "Civil Disobedience", "Quit India", "Khilafat"], answerIndex: 1, category: "History", level: 3 },
    { text: "What is the value of Acceleration due to gravity (g) near Earth surface?", options: ["8.9 m/s²", "9.8 m/s²", "10.5 m/s²", "7.6 m/s²"], answerIndex: 1, category: "Science", level: 3 },
    { text: "Which amendment is known as the 'Mini Constitution' of India?", options: ["42nd Amendment", "44th Amendment", "73rd Amendment", "86th Amendment"], answerIndex: 0, category: "History", level: 3 },
    { text: "Who is the author of 'Wings of Fire'?", options: ["Vikram Seth", "Dr. A.P.J. Abdul Kalam", "Arundhati Roy", "Chetan Bhagat"], answerIndex: 1, category: "GK", level: 3 },
    { text: "Which metal is liquid at room temperature?", options: ["Gallium", "Mercury", "Sodium", "Lead"], answerIndex: 1, category: "Science", level: 3 },
    { text: "Tokyo Olympics 2020 gold medalist Neeraj Chopra is associated with...", options: ["Long Jump", "Javelin Throw", "Discus Throw", "High Jump"], answerIndex: 1, category: "Sports", level: 3 },
    { text: "What is the chemically name of Vitamin C?", options: ["Citric Acid", "Ascorbic Acid", "Lactic Acid", "Acetic Acid"], answerIndex: 1, category: "Health", level: 3 },
    { text: "The capital of Russia is...", options: ["Saint Petersburg", "Moscow", "Kiev", "Minsk"], answerIndex: 1, category: "GK", level: 3 },
    { text: "Which layer of the atmosphere contains the Ozone layer?", options: ["Troposphere", "Stratosphere", "Mesosphere", "Exosphere"], answerIndex: 1, category: "Science", level: 3 },
    { text: "Who was the founder of the Maurya Empire?", options: ["Ashoka", "Chandragupta Maurya", "Bindusara", "Harsha"], answerIndex: 1, category: "History", level: 3 },
    { text: "Which river is known as the 'Dakshin Ganga'?", options: ["Krishna", "Kaveri", "Godavari", "Mahanadi"], answerIndex: 2, category: "GK", level: 3 },
    { text: "The currency of UK is...", options: ["Euro", "Dollar", "Pound Sterling", "Yen"], answerIndex: 2, category: "GK", level: 3 },
    { text: "What is the escape velocity of Earth?", options: ["9.8 km/s", "11.2 km/s", "7.5 km/s", "15.0 km/s"], answerIndex: 1, category: "Science", level: 3 },
    { text: "Who was the first woman President of India?", options: ["Indira Gandhi", "Pratibha Patil", "Droupadi Murmu", "Sarojini Naidu"], answerIndex: 1, category: "History", level: 3 },
    { text: "Common salt is chemically...", options: ["Sodium Chloride", "Sodium Bicarbonate", "Potassium Chloride", "Calcium Carbonate"], answerIndex: 0, category: "Science", level: 3 },
    { text: "Total number of players in a Basketball team on court?", options: ["5", "6", "7", "11"], answerIndex: 0, category: "Sports", level: 3 }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");
        await Question.deleteMany({});
        console.log("Cleared old questions.");
        await Question.insertMany([...level1, ...level2, ...level3]);
        console.log("✅ Seeded 75 Real Academic Questions Successfully!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seed();
