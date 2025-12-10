/**
 * Section content data for the home page
 * Centralized data for better maintainability
 */

import { Compass, Plane, UserSearch, type LucideIcon } from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  step: number;
}

export interface Destination {
  imageUrl: string;
  alt: string;
  name: string;
}

export interface Helper {
  imageUrl: string;
  alt: string;
  name: string;
  role: string;
  quote: string;
}

export interface FooterLink {
  href: string;
  label: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialPlatform {
  platform: "facebook" | "twitter" | "github";
  href: string;
  ariaLabel: string;
}

// How It Works Section
export const features: Feature[] = [
  {
    icon: UserSearch,
    title: "1. Profile & Goals",
    description:
      "Tell us about your background, skills, and aspirations. Our AI builds a unique profile just for you.",
    step: 1,
  },
  {
    icon: Compass,
    title: "2. Get Your Plan",
    description:
      "Receive a data-driven, personalized migration roadmap with the best country and visa options.",
    step: 2,
  },
  {
    icon: Plane,
    title: "3. Start Your Journey",
    description:
      "Connect with experts, access resources, and follow your step-by-step plan to success.",
    step: 3,
  },
];

// Top Destinations Section
export const destinations: Destination[] = [
  {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2cCWS2ji4tgDgxzICuA4YGwIFWlsZR2Z0wLgY7Yl-TRgRcO3I6yNQ8HOOPPOLRQh151oBadpYB6JRIjfJy32pfuj7ZQqBCfTf-pwDD1G2BduuP7E0Kbyw1NLJFNfjDURRAiRdUNKWeqk3ZHUkBeCE6-euiVdAZoGvuoSwle6M0cxg6fOhvj-fsc-PjpINY7Gv5PvqtRyRQZQASZoXjc7y-aUifNeG7lRyLNAGQubQ2EaIBSyVo5wM7sft_IkrPPwAn28Y7Ko2g1K2",
    alt: "Big Ben in London, UK",
    name: "United Kingdom",
  },
  {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7C8A8U3qf1KDxfMG8ZfMdwEzksd7IMg6y_Np6743t7KldKeHHO7OMGZcXZLChAhc-ceBUd8z7zWoJ1iGk6ABpnCxq9RzWbNfVuQqOron4sl8vs3lEQeQyCoMA9_9FDeidMFef7XiIsNuDCPiSxLbT53M7ON83sl_VHwGaJNaqT9J2_MPQPUM_kTF1v9rhXaYmfIB1PPZ7vWzSQuxhqz5QM8gKydBuWcMjRYqHAu24kPC1Mnd9oLjojf3_SbRSOIamY_A_FMvsIRDV",
    alt: "Brandenburg Gate in Berlin, Germany",
    name: "Germany",
  },
  {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCHqqg959YG8IIXFDs9-OYus4ODvgja8JZSrjUFVAltYIis8VzLvZNKtPa7yfLf4Qw5AKwS4X028Sf4Xf1OQsq-hGJMm9QeEY3s45cjs1bMGCjbY5OD2o55mggS02tK7QyZ7exxeEhLDDvORUecxU6d-wxMlx-yjvRa9lrFIBa311X1jlmtKBkoJioOCCmQxFGS6cKWlAq53MNxYvorvt6uxiGZxf9ujX29RD_YClnW--UI51TWYQNu-nZPfTX60L8JWS__35W_oSQy",
    alt: "Dubai skyline, UAE",
    name: "UAE",
  },
  {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDkUIlGpXH9kED41BLAdVNkPvGAmmL1xMQAx2L_bf8TlUFhm3F_OrAfD7eoPQrmV4jnFHnjs60ilwjYsuemX2s9IxE2THzMp36YYdmMues8rmreEKqrNafwy1Pv9LMOurLzgfcEnrC2AGOTN-1rINS878YGoqUD1_nIZzmTzJodWYxQaxh2ruxjVS3KL8aoDITLBWlG4reMsc4ZXv30K47W7BBOgTrNWu_4jiJHavaT1QAnOg4CVc6uQ744Jy6c0Um8A5kY27ouKlwm",
    alt: "CN Tower in Toronto, Canada",
    name: "Canada",
  },
  {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCbppSoTYwJI407mHqtDJI6tD2znuE9gUVMeY9YM9xPP_eAALNpz-cC7oq8_WX9MwFPKuWvb4DGR5FjgGMXRzVTaZLNfEGdJ8iuLmhfLnTjAGDrZGjQQJm2c9cZi0d3k1TX7EfrPdZJ5S3luJeMLJ0jGsfw3iNgLx72rqXRJLDq3b4sjso-HphvD5z_t55z2t8TRnvHkaU75nVF4O0WWq4bA2wVUUJgoyDzRsvGBvKPFhw9WunVJKpbGj5itAePwyFIJAOdW7M-YtWK",
    alt: "Sydney Opera House, Australia",
    name: "Australia",
  },
];

// Verified Helpers Section
export const helpers: Helper[] = [
  {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAoNt3YXPYpO5f-oBSM55y9xtXQpcRm4jH9ZGo_PYsMX7HrQwhf078Jea9MBtglR5X3MY3YuWqwXCvEyn1LDGJPIcqfYJbPpJvRv4BPEZvO2EC-0a5lfisDPgGukkPTfwSh-qpUGV4K_kE4oT9pNUkVDv9vuzsUHNcCWjcJ77sny_4QgC5S3CC1oSOyBM398tecRdASoQVIe6H8LoEkJ-aFXHzyVJPEagMzAiuHTZV4bjoZtQ0M-IWr1tvbPmI7h4MRv2jnJ90xRwdH",
    alt: "Portrait of Sarah Chen",
    name: "Sarah Chen",
    role: "Immigration Lawyer (Canada)",
    quote:
      "I specialize in Express Entry and PNPs. Let's make your Canadian dream a reality.",
  },
  {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBRqN5EvzumkWnpRvJf7VQK6OxO3O1t1u3Itu_3dHGQzUnYGRgBQMJMaKTwZ9KVjINP5drpi2bqJ6GUkj6vzzg8xG-LgWf5VI5V7QPVnMVn-I7qpkpsJsnh3tQeLmLTirnb7brnByCZs1qHLkmojFvWSstlJMhN2BsJEVyRgTqYlKd-BzFYRrRyzQcVmQ9tMm8vkKfMls4mfz9RnaCuqVufu7wmLxkLcfpQO0vJSMgt_Kn5VBFRGjhkST3DFKUNlpamYMBIFSsIPJFP",
    alt: "Portrait of Markus Weber",
    name: "Markus Weber",
    role: "Tech Recruiter (Germany)",
    quote:
      "Navigating the German job market can be tricky. I'm here to help you land your ideal tech role.",
  },
  {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDllx4XOfWWBp55-voRBCm_Sf4JO8sKQPy0YOpMetRDYM_P2B2ouqSl78mtx8oMp1LbuJgdh7tCC2MGS6zsx384q2Mn4oYnYRwnwkLa_drb9-Ug4dKwAsA7KcAiWViqjde8Aye7qr8suB2-N4T5u7p5tiBv_rFpj4G4JJxlrczksJlGcBU4VwTMKH9Xlx0q8pjOHN1QPeIZcsY6VG2z59SazNsHB7p4HhZT8grp_zxLycGDOKRZnsdZBZoHpeztdDKHfP16mFGGm93N",
    alt: "Portrait of Aisha Al Falahi",
    name: "Aisha Al Falahi",
    role: "Relocation Mentor (UAE)",
    quote:
      "From finding a home to understanding the culture, I'll be your guide to life in Dubai.",
  },
];

// Footer Data
export const footerSections: FooterSection[] = [
  {
    title: "Company",
    links: [
      { href: "#", label: "About" },
      { href: "#", label: "Contact" },
      { href: "#", label: "Careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "#", label: "Privacy Policy" },
      { href: "#", label: "Terms of Service" },
    ],
  },
];

export const socialPlatforms: SocialPlatform[] = [
  { platform: "facebook", href: "#", ariaLabel: "Facebook" },
  { platform: "twitter", href: "#", ariaLabel: "Twitter" },
  { platform: "github", href: "#", ariaLabel: "GitHub" },
];
