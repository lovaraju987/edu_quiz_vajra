import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// ✅ Next.js 16: themeColor must be in viewport export, not metadata
export const viewport: Viewport = {
  themeColor: "#7209B7",
};

export const metadata: Metadata = {
  title: "EduQuiz World | Daily Academic Challenge",
  description: "A daily quiz engagement program promoting academic excellence and digital discipline among students.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EduQuiz",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7209B7" />
        <link rel="apple-touch-icon" href="/images/edu-quiz-logo.png" />
      </head>
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <Toaster position="top-center" richColors />
        <Providers>{children}</Providers>

        {/* Service Worker Registration — Only in production, never in dev */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                // Only register in production to avoid caching dev builds
                if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
                      .then(function(reg) {
                        console.log('[EduQuiz] Service Worker registered. Scope:', reg.scope);
                      })
                      .catch(function(err) {
                        console.warn('[EduQuiz] Service Worker registration failed:', err.message);
                      });
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
