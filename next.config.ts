import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // ✅ SECURITY: Disable source maps in production
    // Prevents anyone from reading your full TypeScript source code in DevTools
    productionBrowserSourceMaps: false,

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // ✅ SECURITY: HTTP Security Headers on every response
    async headers() {
        return [
            {
                // Apply to ALL routes
                source: '/:path*',
                headers: [
                    {
                        // Prevents browsers from MIME-sniffing — e.g., loading a .txt as JS
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        // Prevents your site from being embedded in an iframe (clickjacking)
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        // Controls how much referrer info is sent when navigating
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        // Enforces HTTPS for 1 year — only enable after you have SSL confirmed
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains',
                    },
                    {
                        // Blocks XSS attempts, restrict resource loading origins
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                ],
            },
            {
                // ✅ PERFORMANCE: Cache Next.js static assets for 1 year
                // Safe because Next.js uses content hashes in filenames (e.g., main.abc123.js)
                // When you deploy new code, filenames change → old cache is automatically bypassed
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                // ✅ PERFORMANCE: Cache public images for 24 hours
                source: '/images/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, stale-while-revalidate=604800',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
