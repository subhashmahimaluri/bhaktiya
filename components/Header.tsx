"use client";

import { navigationLinks } from "@/lib/constants/navigationData";
import { cn } from "@/lib/utils/classNames";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import NavigationLink from "./ui/NavigationLink";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "z-50 w-full transition-all duration-300 px-4 sm:px-6 md:px-8 lg:px-8",
          isScrolled
            ? "fixed top-0 left-0 right-0 bg-white shadow-md animate-slideInDown"
            : "absolute top-0 left-0 right-0 bg-transparent backdrop-blur-sm"
        )}
      >
        {!isScrolled && (
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none"></div>
        )}
        <div
          className={cn(
            "max-w-7xl mx-auto relative z-10",
            isScrolled ? "py-2.5" : "py-4"
          )}
        >
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src={isScrolled ? "/logo.png" : "/logo-white.png"}
                width="214"
                height="50"
                alt="PlanBPass"
                priority
                quality={90}
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationLinks.map((link) => (
                <NavigationLink
                  key={link.label}
                  href={link.href}
                  isScrolled={isScrolled}
                  hasDropdown={link.hasDropdown}
                >
                  {link.label}
                </NavigationLink>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                href="#"
                className={cn(
                  "font-bold transition-colors",
                  isScrolled
                    ? "text-slate-800 hover:text-primary"
                    : "text-white hover:text-secondary"
                )}
              >
                Login
              </Link>
              <Link
                href="#"
                className={cn(
                  "font-bold px-5 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity",
                  isScrolled
                    ? "bg-primary text-white"
                    : "bg-secondary text-black"
                )}
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className={cn(
                "lg:hidden transition-colors p-2",
                isScrolled ? "text-primary" : "text-white"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 shadow-2xl z-50 lg:hidden animate-slideInRight">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Image
                  src="/logo-white.png"
                  width="160"
                  height="40"
                  alt="PlanBPass"
                  priority
                />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/90 hover:text-white p-2"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-6 space-y-1 overflow-y-auto h-[calc(100%-180px)]">
              {navigationLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
                >
                  <span>{link.label}</span>
                  {link.hasDropdown && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </Link>
              ))}
            </div>

            {/* Menu Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-purple-900/50 backdrop-blur-sm space-y-3">
              <Link
                href="#"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-white/90 hover:text-white font-semibold py-3 transition-colors"
              >
                Login
              </Link>
              <Link
                href="#"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-secondary hover:bg-secondary/90 text-slate-900 font-bold py-3.5 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
