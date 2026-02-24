"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function StudentPulse() {
    const { data: session } = useSession();

    useEffect(() => {
        // Only run heartbeat for student role
        // @ts-ignore
        if (!session?.user || session.user.role !== 'student') return;

        const sendPulse = async () => {
            try {
                await fetch('/api/student/heartbeat', { method: 'POST' });
            } catch (err) {
                // Silently fail as it's just a background pulse
            }
        };

        // Send pulse immediately on mount
        sendPulse();

        // Then every 2 minutes
        const interval = setInterval(sendPulse, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, [session]);

    return null; // Invisible component
}
