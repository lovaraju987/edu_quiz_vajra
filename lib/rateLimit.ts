/**
 * lib/rateLimit.ts — In-Memory Rate Limiter (No Redis Required)
 *
 * How it works:
 * - Tracks request counts per IP address in a Map
 * - Each IP has a sliding window (e.g., 60 seconds)
 * - If requests exceed the limit within the window, returns 429 Too Many Requests
 * - Old entries are automatically cleaned up to prevent memory leaks
 *
 * Usage in API routes:
 *   import { rateLimit } from '@/lib/rateLimit';
 *
 *   export async function GET(req: Request) {
 *       const limited = rateLimit(req, { limit: 10, windowMs: 60_000 });
 *       if (limited) return limited;  // returns 429 response
 *       // ... rest of handler
 *   }
 *
 * Limitations vs Redis rate limiting:
 * - Not shared across multiple server instances (single server only)
 * - Resets on server restart
 * - Sufficient for single-server deployments with 1 lakh users
 */

interface RateLimitEntry {
    count: number;
    windowStart: number;
}

// Global store — survives Next.js hot reloads
const globalForRL = global as any;
if (!globalForRL.__rateLimitStore) {
    globalForRL.__rateLimitStore = new Map<string, RateLimitEntry>();
}
const store: Map<string, RateLimitEntry> = globalForRL.__rateLimitStore;

// Clean up expired entries every 5 minutes to prevent memory leak
if (!globalForRL.__rateLimitCleanupScheduled) {
    globalForRL.__rateLimitCleanupScheduled = true;
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store.entries()) {
            if (now - entry.windowStart > 5 * 60 * 1000) {
                store.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}

interface RateLimitOptions {
    limit: number;       // Max requests allowed per window
    windowMs: number;    // Window duration in milliseconds
    message?: string;    // Custom error message
}

/**
 * Apply rate limiting based on IP address.
 * Returns a 429 NextResponse if rate limit is exceeded, null if allowed.
 *
 * How to use:
 *   const limited = rateLimit(req, { limit: 5, windowMs: 60_000 });
 *   if (limited) return limited;
 */
export function rateLimit(
    req: Request,
    options: RateLimitOptions
): Response | null {
    const { limit, windowMs, message } = options;

    // Extract client IP from headers (works on Vercel, AWS, Nginx)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    // Create a namespaced key: ip + path to avoid cross-route interference
    const url = new URL(req.url);
    const key = `${ip}:${url.pathname}`;

    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
        // New window — reset counter
        store.set(key, { count: 1, windowStart: now });
        return null;  // ✅ Allowed
    }

    if (entry.count >= limit) {
        // Rate limit exceeded
        const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
        return new Response(
            JSON.stringify({
                error: message || `Too many requests. Please wait ${retryAfter} seconds.`,
                retryAfter
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': String(retryAfter),
                    'X-RateLimit-Limit': String(limit),
                    'X-RateLimit-Remaining': '0',
                }
            }
        );
    }

    // Within limit — increment counter
    entry.count++;
    return null;  // ✅ Allowed
}

// ─── Pre-configured Rate Limiters for Common Routes ──────────────────────────

/** Quiz questions: 5 requests per minute per IP */
export const quizQuestionsLimit = (req: Request) =>
    rateLimit(req, {
        limit: 5,
        windowMs: 60_000,
        message: 'Too many quiz requests. Please wait before starting another quiz.',
    });

/** Quiz submit: 3 submissions per minute per IP (prevents double-submit spam) */
export const quizSubmitLimit = (req: Request) =>
    rateLimit(req, {
        limit: 3,
        windowMs: 60_000,
        message: 'Too many quiz submissions. Please wait a moment.',
    });

/** Vouchers: 10 requests per minute per IP */
export const vouchersLimit = (req: Request) =>
    rateLimit(req, {
        limit: 10,
        windowMs: 60_000,
    });

/** Auth/Login: 5 attempts per 15 minutes (brute force protection) */
export const authLimit = (req: Request) =>
    rateLimit(req, {
        limit: 5,
        windowMs: 15 * 60_000,
        message: 'Too many login attempts. Please wait 15 minutes.',
    });

/** General API: 60 requests per minute (generous for normal usage) */
export const generalLimit = (req: Request) =>
    rateLimit(req, {
        limit: 60,
        windowMs: 60_000,
    });

/** Payment verify: 5 per minute per IP — prevents replay attacks & double-submit */
export const paymentLimiter = (req: Request) =>
    rateLimit(req, {
        limit: 5,
        windowMs: 60_000,
        message: 'Too many payment attempts. Please wait a moment.',
    });
