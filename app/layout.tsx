import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.animations.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kannada Calendar – Daily Panchanga & ಕನ್ನಡ ಕ್ಯಾಲೆಂಡರ್ - Bhaktiya",
  description:
    "Daily Kannada Panchanga, sunrise, muhurtas, festivals, monthly ಕ್ಯಾಲೆಂಡರ್, ಹಬ್ಬಗಳು, ಕಾರ್ಯ ದಿನಗಳು and Kannada calendar details",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200`}
      >
        {children}
      </body>
    </html>
  );
}
