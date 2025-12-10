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
  title: "PlanBPass - Your AI-Powered Path to Global Opportunities",
  description:
    "Unlock personalized migration plans and career mobility with smart technology.",
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
