require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error("❌ MONGODB_URI not found in .env.local");
    process.exit(1);
}

console.log("Attempting connection...");

mongoose.connect(uri)
    .then(() => {
        console.log("✅ MongoDB Connection Successful!");
        return mongoose.disconnect();
    })
    .then(() => {
        console.log("Disconnected.");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ Connection Failed:", err.message);
        process.exit(1);
    });
