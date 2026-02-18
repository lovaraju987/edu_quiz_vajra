
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SchoolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    principalName: { type: String, required: true },
    category: { type: String, required: true, index: true },
    description: { type: String },
    website: { type: String },
    images: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
});

const School = mongoose.models.School || mongoose.model('School', SchoolSchema);

const schools = [
    {
        name: "Sharma Home Tuitions",
        address: "12-5-30, Jubliee Hills, Hyderabad",
        email: "sharma@hometutors.com",
        phone: "9876543210",
        principalName: "Mr. Sharma",
        category: "home-tutors",
        description: "Experienced home tutors for Maths and Science."
    },
    {
        name: "Vajra Day Care",
        address: "Plot 45, Gachibowli, Hyderabad",
        email: "info@vajra.edu",
        phone: "9988776655",
        principalName: "Mrs. Lakshmi",
        category: "private-schools-daycare",
        description: "Premium day care services."
    },
    {
        name: "Elite Tutors Academy",
        address: "Madhapur, Hyderabad",
        email: "contact@elitetutors.com",
        phone: "9123456780",
        principalName: "Dr. Rao",
        category: "tuition-centers",
        description: "Best tuition center for IIT-JEE coaching."
    }
];

async function seed() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('No MONGODB_URI found');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        console.log('Clearing old schools...');
        await School.deleteMany({});

        console.log(`Seeding ${schools.length} schools...`);
        await School.insertMany(schools);

        console.log('Schools seeded successfully!');

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
