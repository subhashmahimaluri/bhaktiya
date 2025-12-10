"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="banner relative text-left py-20 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[600px] md:min-h-[700px] lg:min-h-[600px]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/banner.png"
          alt="Banner background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#7c4fe0]/85 via-[#5b3ec9]/80 to-[#4528dc]/85"></div>

      {/* Wave Effect */}
      <div className="wave-effect">
        <div className="waves-shape shape-one">
          <div className="wave wave-one"></div>
        </div>
        <div className="waves-shape shape-two">
          <div className="wave wave-two"></div>
        </div>
        <div className="waves-shape shape-three">
          <div className="wave wave-three"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-30 max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div>
          <h1 className="animate-fadeInUp delay-1 text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Your AI-Powered Path to
            <span className="text-yellow-300"> Global Opportunities</span>
          </h1>
          <p className="animate-fadeInUp delay-2 max-w-xl text-lg text-white/90 mb-8">
            Unlock personalized migration plans and career mobility with smart
            technology. Get expert guidance on visa options, job markets, and
            relocation paths tailored just for you.
          </p>
          <div className="animate-fadeInUp delay-2 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#"
                className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-gradient-to-r from-purple-400 via-purple-500 to-pink-500 rounded-xl overflow-hidden shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center gap-2">
                  Get Started
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Link>
              <Link
                href="#"
                className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-bold text-purple-600 bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl hover:shadow-white/30 transition-all duration-300 hover:scale-105 border-2 border-white/50"
              >
                <span className="absolute inset-0 w-full h-full bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative">Learn More</span>
              </Link>
            </div>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="flex-shrink mx-4 text-white/60 text-xs uppercase tracking-wider">
                or
              </span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>

            {/* Become a Helper CTA */}
            <Link
              href="#"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 font-semibold text-white border-2 border-white/40 backdrop-blur-sm rounded-xl hover:bg-white/10 hover:border-white/60 transition-all duration-300"
            >
              <span className="relative flex items-center gap-2">
                <span className="material-icons-outlined text-xl">
                  verified
                </span>
                Become a Helper
                <span className="px-2 py-0.5 bg-yellow-300 text-slate-900 text-xs font-bold rounded-full ml-1">
                  EARN
                </span>
              </span>
            </Link>
          </div>
        </div>

        {/* Right Side Image - Now visible on mobile too */}
        <div className="flex justify-center items-center mt-8 lg:mt-0">
          <div className="bounce-effect relative w-full max-w-[400px] lg:max-w-[500px]">
            <Image
              src="/right-image.png"
              alt="App showcase"
              width={500}
              height={500}
              className="object-contain drop-shadow-2xl w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
