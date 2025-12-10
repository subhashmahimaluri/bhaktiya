import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}", // Added lib directory for constants
  ],
  // Safelist optimized - removed unused dynamic classes since we use cn() utility
  safelist: [
    "hover:text-secondary",
    "hover:text-primary",
    "bg-secondary",
    "text-secondary",
    "bg-primary",
    "text-primary",
  ],
  theme: {
    extend: {
      colors: {
        "pbp-navy": "#07123a",
        "pbp-purple-1": "#7b3ff9",
        "pbp-purple-2": "#b266ff",
        "pbp-soft": "#f6f5fb",
        primary: "#7F00FF",
        secondary: "#fde047",
        "background-light": "#F8F9FA",
        "background-dark": "#f0b8b8ff",
        "tinted-white": "#FCFCFE",
        "anti-flash-white": "#FCFCFE",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
      },
      boxShadow: {
        custom: "5px 5px 29px 5px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

export default config;
