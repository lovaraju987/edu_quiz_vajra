require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI;

const AdminSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        role: { type: String, default: "super_admin" },
    },
    { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function createAdmin() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(uri);
        console.log("✅ Connected.");

        const username = "admin";
        const password = "admin123";

        console.log(`Checking for existing admin '${username}'...`);
        const existing = await Admin.findOne({ username });
        if (existing) {
            console.log("⚠️ Admin already exists. Updating password...");
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            existing.passwordHash = hash;
            await existing.save();
            console.log("✅ Password updated to: admin123");
        } else {
            console.log("🆕 Creating new admin...");
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            await Admin.create({
                username,
                passwordHash: hash,
                role: "super_admin"
            });
            console.log("✅ Admin created successfully.");
        }

        console.log("============================================");
        console.log("USERNAME: admin");
        console.log("PASSWORD: admin123");
        console.log("============================================");

        process.exit(0);
    } catch (e) {
        console.error("❌ Failed:", e);
        process.exit(1);
    }
}

createAdmin();
