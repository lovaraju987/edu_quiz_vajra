import { NextResponse } from 'next/server';

// This data represents your "External Ad Database"
// For monetization, you can later replace this with a real fetch from an Ad Server (like Google AdSense or a private Ad manager)
const externalAds = [
    {
        title: "UNACADEMY",
        subtitle: "GATE & UPSC 2026",
        color: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        link: "https://unacademy.com"
    },
    {
        title: "BYJU'S CLASSES",
        subtitle: "EXCEL ACCELERATE",
        color: "bg-sky-50",
        border: "border-sky-200",
        text: "text-sky-700",
        link: "https://byjus.com"
    },
    {
        title: "KHAN ACADEMY",
        subtitle: "FREE FOR EVERYONE",
        color: "bg-violet-50",
        border: "border-violet-200",
        text: "text-violet-700",
        link: "https://khanacademy.org"
    },
    {
        title: "COURSERA",
        subtitle: "TOP UNIVERSITY DEGREES",
        color: "bg-pink-50",
        border: "border-pink-200",
        text: "text-pink-700",
        link: "https://coursera.org"
    }
];

export async function GET() {
    // In a production app, you would fetch this from your payment/ad platform
    return NextResponse.json(externalAds);
}
