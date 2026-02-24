import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const isDev = process.env.NODE_ENV === 'development';

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
    if (!MONGODB_URI) {
        console.warn('⚠️ MONGODB_URI is missing. EduQuiz is running in MOCK MODE (localStorage fallback).');
        return false;
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,

            // ─── Connection Pool (Critical for 1 Lakh Users) ───────────────
            // Default maxPoolSize is 5 — catastrophically low for high traffic
            // At 5: only 5 concurrent DB operations, rest queue → timeout cascade
            // At 50: handles ~5,000 concurrent requests comfortably
            maxPoolSize: 50,
            minPoolSize: 5,    // Always keep 5 connections warm (faster response)

            // ─── Timeout Settings ───────────────────────────────────────────
            // How long to wait for a connection from the pool (ms)
            waitQueueTimeoutMS: 10000,  // 10s — fail fast instead of hanging
            // How long a socket can be idle before being closed
            socketTimeoutMS: 45000,
            // How long to wait for a server to be found
            serverSelectionTimeoutMS: 10000,

            // ─── Reliability ────────────────────────────────────────────────
            // Retry reads once on network failure (not writes — idempotency concern)
            retryReads: true,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
        if (isDev) console.log("✅ MongoDB Connected");
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;

