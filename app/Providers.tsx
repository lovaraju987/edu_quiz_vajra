"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useRef } from "react";

// ─── Singleton QueryClient factory ───────────────────────────────────────────
// Creates ONE QueryClient per browser tab and reuses it across renders.
// Using useRef ensures the same instance survives re-renders without useState
// initialization issues that can occur during Next.js SSR/hydration.

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Don't run queries during SSR — only fetch on the client.
                // This prevents "No QueryClient" errors during server render.
                enabled: typeof window !== "undefined",

                // Data is considered "fresh" for 5 minutes
                staleTime: 5 * 60 * 1000,

                // Keep cache in memory 10 minutes after component unmounts
                gcTime: 10 * 60 * 1000,

                // Don't refetch when user switches tabs and comes back
                refetchOnWindowFocus: false,

                // Don't refetch just because network reconnects
                refetchOnReconnect: false,

                // Retry once on failure
                retry: 1,
                retryDelay: 2000,
            },
        },
    });
}

export function Providers({ children }: { children: React.ReactNode }) {
    // useRef instead of useState: avoids the React useState initializer
    // inconsistency between server and client during hydration.
    const clientRef = useRef<QueryClient | null>(null);
    if (!clientRef.current) {
        clientRef.current = makeQueryClient();
    }

    return (
        <QueryClientProvider client={clientRef.current}>
            <SessionProvider>{children}</SessionProvider>
        </QueryClientProvider>
    );
}
