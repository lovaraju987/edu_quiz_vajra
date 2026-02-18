
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TVSettings from "@/models/TVSettings";

export async function GET() {
    try {
        await dbConnect();

        // Find existing settings or create ONLY ONE default
        let settings = await TVSettings.findOne();

        // 🟢 First Time Setup: Seed Default Data if Empty
        if (!settings) {
            settings = await TVSettings.create({
                slides: [
                    { title: "Premium Tablets", description: "Win high-end tablets for academic excellence", imageUrl: "/images/gifts/tablet.png", badge: "Top Prize" },
                    { title: "Smartwatches", description: "Exclusive rewards for daily consistent performers", imageUrl: "/images/gifts/smartwatch.png", badge: "Daily Award" },
                    { title: "Learning Kits", description: "Comprehensive study sets for top school rankers", imageUrl: "/images/gifts/learning_kit.png", badge: "Merit Gift" },
                    { title: "Gift Vouchers", description: "Redeemable vouchers for gadgets and books", imageUrl: "/images/gifts/voucher.png", badge: "Instant Reward" }
                ],
                scrollerOne: [
                    { name: 'Watch', imageUrl: '/images/gifts/smartwatch.png' },
                    { name: 'Tablet', imageUrl: '/images/gifts/tablet.png' },
                    { name: 'Kit', imageUrl: '/images/gifts/learning_kit.png' },
                    { name: 'Voucher', imageUrl: '/images/gifts/voucher.png' },
                    { name: 'Gadgets', imageUrl: '/images/gifts/smartwatch.png' }
                ],
                scrollerTwo: [
                    { name: 'Amazon', imageUrl: '/images/gifts/voucher.png' },
                    { name: 'Flipkart', imageUrl: '/images/gifts/voucher.png' },
                    { name: 'Shopping', imageUrl: '/images/gifts/voucher.png' },
                    { name: 'Food', imageUrl: '/images/gifts/voucher.png' },
                    { name: 'Brands', imageUrl: '/images/gifts/voucher.png' }
                ],
                headerAds: [
                    { title: "Ad Space 1", imageUrl: "/images/ads/byjus_bg.svg" },
                    { title: "Ad Space 2", imageUrl: "/images/ads/unacademy_bg.svg" },
                    { title: "Ad Space 3", imageUrl: "/images/ads/khan_bg.svg" },
                    { title: "Ad Space 4", imageUrl: "/images/ads/coursera_bg.svg" }
                ]
            });
        }

        return NextResponse.json({ success: true, data: settings });

    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch TV content" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();

        // AUTH CHECK - SECURE
        const { verifyAdmin } = await import("@/lib/admin-auth");
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized Access" }, { status: 401 });
        }

        const body = await req.json();

        // Handle BOTH formats:
        // 1. Direct update { slides: [...], scrollerOne: [...] }
        // 2. OR Just pulling from Body (if sent raw)
        const { slides, scrollerOne, scrollerTwo, headerAds } = body;

        // Validation - Allow partial updates if needed, but ideally full object
        const updateQuery: any = { updatedAt: new Date() };
        if (slides) updateQuery.slides = slides;
        if (scrollerOne) updateQuery.scrollerOne = scrollerOne;
        if (scrollerTwo) updateQuery.scrollerTwo = scrollerTwo;
        if (headerAds) updateQuery.headerAds = headerAds;

        // Update the Single Document (Upsert)
        const updated = await TVSettings.findOneAndUpdate(
            {},
            { $set: updateQuery },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, data: updated });

    } catch (error: any) {
        console.error("TV Update Error:", error);
        return NextResponse.json({ error: "Failed to update TV content" }, { status: 500 });
    }
}
