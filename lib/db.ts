import mongoose from 'mongoose';



/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ MONGODB_URI is missing. EduQuiz is running in MOCK MODE (localStorage fallback).');
        }
        return false;
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        console.log("📡 Connecting to MongoDB...");
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log("✅ MongoDB Connected Successfully");
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        console.error("❌ MongoDB Connection Error:", e);
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
