import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Gift from "@/models/Gift";

const SAMPLE_GIFTS = [
    {
        title: "Scientific Calculator",
        description: "Advanced calculator for mathematics and science students.",
        imageUrl: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=600&q=80"
    },
    {
        title: "Art & Drawing Kit",
        description: "Complete set of color pencils, paints, and sketchbooks for creative minds.",
        imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80"
    },
    {
        title: "Encyclopedia Set",
        description: "Comprehensive knowledge books covering science, history, and geography.",
        imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80"
    },
    {
        title: "Noise-Isolating Headphones",
        description: "Comfortable wired headphones perfect for online classes and focus.",
        imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80"
    },
    {
        title: "Premium Stationery Set",
        description: "Collection of high-quality notebooks, pens, and highlighters.",
        imageUrl: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80"
    }
];

export async function GET() {
    try {
        await dbConnect();

        // Clear existing gifts
        await Gift.deleteMany({});

        // Insert only valid gifts
        await Gift.insertMany(SAMPLE_GIFTS);

        return NextResponse.json({ success: true, message: "Seeded filtered gifts successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Seeding failed" }, { status: 500 });
    }
}
