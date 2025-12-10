"use client";

import { useState } from "react";

export default function StickyWaitlistButton() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 group">
      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute -top-2 -right-2 h-6 w-6 bg-slate-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-slate-700"
        aria-label="Close"
      >
        <span className="material-icons-outlined text-sm">close</span>
      </button>

      {/* Main Button */}
      <a
        href="#waitlist"
        className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-pbp-purple-1 to-pbp-purple-2 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
      >
        <div className="relative">
          <span className="material-icons-outlined text-2xl">
            notifications_active
          </span>
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-300 rounded-full animate-pulse"></span>
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-bold">Join Waitlist</div>
          <div className="text-xs text-white/80">Get 50% Off</div>
        </div>
      </a>
    </div>
  );
}
