// ============================================================
// EduQuiz Vajra - Service Worker
// Caches ONLY: homepage, login page, CSS/JS bundles, fonts, images
// NEVER caches: APIs, dashboard, quiz, admin, payment pages
// ============================================================

const CACHE_NAME = 'edquiz-static-v1';
const CACHE_VERSION = 1;

// ✅ SAFE: These exact URLs are static and safe to cache forever
const STATIC_PAGES = [
    '/',
    '/quiz/login',
];

// ✅ SAFE: URL patterns for static assets — matched by prefix
const STATIC_ASSET_PATTERNS = [
    '/_next/static/',   // All Next.js JS/CSS chunks
    '/images/',         // All images in /public/images/
    '/fonts/',          // Any fonts in /public/fonts/
];

// ✅ SAFE: Specific public files to cache
const STATIC_FILES = [
    '/images/edu-quiz-logo.png',
    '/images/edu-quiz-spin.png',
    '/images/t-sat-logo.png',
    '/globe.svg',
    '/next.svg',
];

// ❌ NEVER CACHE: These prefixes are EXCLUDED — always go to network
const NEVER_CACHE_PATTERNS = [
    '/api/',            // All API routes (student data, quiz, payments)
    '/student/',        // Student dashboard
    '/faculty/',        // Faculty dashboard
    '/admin/',          // Admin panel
    '/quiz/levels',     // Quiz level selection (authenticated)
    '/quiz/play',       // Active quiz (must be real-time)
    '/quiz/results',    // Quiz results (live data)
    '/payment',         // Payment pages
    '/vouchers',        // Voucher redemption
    '/_next/image',     // Next.js image optimization endpoint (dynamic)
];

// ============================================================
// INSTALL — Cache all static assets on first load
// ============================================================
self.addEventListener('install', (event) => {
    console.log('[SW] Installing EduQuiz Service Worker v' + CACHE_VERSION);

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static pages and files...');
            // Cache pages and files individually, don't fail on one error
            const allToCache = [...STATIC_PAGES, ...STATIC_FILES];
            return Promise.allSettled(
                allToCache.map((url) =>
                    cache.add(url).catch((err) => {
                        console.warn('[SW] Could not cache:', url, err.message);
                    })
                )
            );
        })
    );

    // Activate immediately without waiting for old SW to die
    self.skipWaiting();
});

// ============================================================
// ACTIVATE — Delete old caches from previous versions
// ============================================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating EduQuiz Service Worker v' + CACHE_VERSION);

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME) // Delete old cache versions
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );

    // Take control of all open tabs immediately
    self.clients.claim();
});

// ============================================================
// FETCH — Intercept network requests
// Strategy:
//   - NEVER_CACHE_PATTERNS → Always go to network (never cache)
//   - Static assets (_next/static) → Cache First (fastest)
//   - Static pages (/, /quiz/login) → Stale While Revalidate
//   - Everything else → Network only
// ============================================================
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Only handle same-origin requests (never intercept external APIs)
    if (url.origin !== self.location.origin) {
        return; // Let it pass through normally
    }

    const pathname = url.pathname;

    // ❌ STEP 1: Check NEVER_CACHE list first — always fetch from network
    const shouldNeverCache = NEVER_CACHE_PATTERNS.some((pattern) =>
        pathname.startsWith(pattern)
    );
    if (shouldNeverCache) {
        // Do NOT intercept — let browser fetch from network normally
        return;
    }

    // ✅ STEP 2: Static JS/CSS bundles — Cache First (they have hashed filenames, safe forever)
    const isStaticAsset = STATIC_ASSET_PATTERNS.some((pattern) =>
        pathname.startsWith(pattern)
    );
    if (isStaticAsset) {
        event.respondWith(cacheFirst(event.request));
        return;
    }

    // ✅ STEP 3: Static pages (homepage, login) — Stale While Revalidate
    const isStaticPage = STATIC_PAGES.includes(pathname);
    if (isStaticPage) {
        event.respondWith(staleWhileRevalidate(event.request));
        return;
    }

    // ✅ STEP 4: Images and static files — Cache First
    const isStaticFile = STATIC_FILES.some((file) => pathname === file) ||
        pathname.match(/\.(png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf|eot)$/);
    if (isStaticFile) {
        event.respondWith(cacheFirst(event.request));
        return;
    }

    // Everything else — go to network (do NOT intercept)
});

// ============================================================
// STRATEGY: Cache First
// Return cached version if available, otherwise fetch from network and cache it
// Best for: JS/CSS bundles, images (content-addressed, never stale)
// ============================================================
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached; // Instant response from cache
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone()); // Cache for next time
        }
        return networkResponse;
    } catch (err) {
        console.warn('[SW] Network failed for:', request.url);
        // Return nothing — browser will show its own error
    }
}

// ============================================================
// STRATEGY: Stale While Revalidate
// Return cached version INSTANTLY, then fetch fresh version in background
// Best for: Homepage, login page (want speed but also freshness)
// ============================================================
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    // Fetch fresh version in background regardless
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone()); // Update cache silently
        }
        return networkResponse;
    }).catch(() => {
        // Network failed, cached version already returned below
    });

    // Return cached instantly (or wait for network if no cache yet)
    return cached || fetchPromise;
}
