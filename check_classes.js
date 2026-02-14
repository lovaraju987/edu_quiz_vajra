
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    idNo: { type: String, required: true, unique: true },
    class: { type: String, required: true },
    // ... items
});

// Handle the case where the model might already be compiled
const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);

async function checkClasses() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const students = await Student.find({}, 'name idNo class');
        console.log('Student Classes:');
        students.forEach(s => console.log(`${s.name} (${s.idNo}): ${s.class}`));

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkClasses();
