import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SystemSettings from "@/models/SystemSettings";
import { withCache, cacheDelete, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";

export async function GET() {
    try {
        await dbConnect();

        // ✅ IN-MEMORY CACHE: SystemSettings cached for 5 minutes
        // 1 lakh students loading homepage = 1 DB query per 5 min (not 1 lakh)
        const settings = await withCache(
            CACHE_KEYS.SETTINGS,
            CACHE_TTL.SETTINGS,
            async () => {
                let doc = await SystemSettings.findOne({ key: 'global' }).lean();
                if (!doc) {
                    doc = await SystemSettings.create({ key: 'global' });
                }
                return doc;
            }
        );

        return NextResponse.json({ settings }, {
            headers: {
                // HTTP-level caching for CDN/browser layer on top of server cache
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
            }
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Remove key/id from update body to prevent immutable field errors
        const { _id, key, ...updateData } = body;

        const { verifyAdmin } = await import("@/lib/admin-auth");
        const admin = await verifyAdmin();

        if (!admin) {
            return NextResponse.json({ error: "Unauthorized Access" }, { status: 401 });
        }

        const settings = await SystemSettings.findOneAndUpdate(
            { key: 'global' },
            { $set: { ...updateData, updatedAt: new Date() } },
            { new: true, upsert: true }
        );

        // ✅ INVALIDATE CACHE: Admin updated settings → clear stale cache immediately
        // Next request will fetch fresh data from MongoDB
        cacheDelete(CACHE_KEYS.SETTINGS);

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
