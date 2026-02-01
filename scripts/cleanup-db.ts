import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Force load from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function clearDatabase() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("MONGODB_URI not found in .env.local");
        process.exit(1);
    }

    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(uri);
        console.log("Connected! 🚀");

        const collections = ['students', 'quizresults', 'questions'];

        for (const colName of collections) {
            try {
                const collection = mongoose.connection.db!.collection(colName);
                const count = await collection.countDocuments();
                await collection.deleteMany({});
                console.log(`Successfully cleared '${colName}' (${count} documents removed).`);
            } catch (e) {
                console.log(`Collection '${colName}' does not exist or already empty.`);
            }
        }

        console.log("\nDatabase is now CLEAN! ✨");
        console.log("Note: Faculty accounts were preserved so you can still login.");

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Cleanup failed:", error);
        process.exit(1);
    }
}

clearDatabase();
