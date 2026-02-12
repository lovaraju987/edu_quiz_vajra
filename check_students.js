
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkStudents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('students');
        const students = await collection.find({}).limit(10).toArray();
        console.log('Students Data:');
        students.forEach(s => {
            console.log(`Name: ${s.name}, ID: ${s.idNo}, Class: ${s.class}, Type: ${typeof s.class}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkStudents();
