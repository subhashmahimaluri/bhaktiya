import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 border-t border-slate-700/50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* About Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src={"/logo-white.png"}
                width="180"
                height="42"
                alt="PlanBPass"
                priority
                quality={90}
              />
            </Link>
            <p className="mt-4 text-slate-300 text-base leading-relaxed">
              Your AI-powered path to global opportunities. We help
              professionals navigate their migration journey with confidence.
            </p>
            {/* Newsletter Signup */}
            <div className="mt-8">
              <h4 className="text-white font-semibold text-sm mb-3">
                Stay Updated
              </h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-pbp-purple-1 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-pbp-purple-1 to-pbp-purple-2 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:px-5 md:px-5">
            <h3 className="text-white font-semibold text-base mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-slate-300 hover:text-pbp-purple-2 transition-colors text-base"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-300 hover:text-pbp-purple-2 transition-colors text-base"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-300 hover:text-pbp-purple-2 transition-colors text-base"
                >
                  Success Stories
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-300 hover:text-pbp-purple-2 transition-colors text-base"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-300 hover:text-pbp-purple-2 transition-colors text-base"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-300 hover:text-pbp-purple-2 transition-colors text-base"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-slate-300 hover:text-pbp-purple-2 transition-colors text-base"
                >
                  Destinations
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-300 hover:text-pbp-purple-2 transition-colors text-base"
                >
                  Visa Guides
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-300 hover:text-pbp-purple-2 transition-colors text-base"
                >
                  Find Helpers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-300 hover:text-pbp-purple-2 transition-colors text-base"
                >
                  Career Hub
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-300 hover:text-pbp-purple-2 transition-colors text-base"
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">
              Contact Us
            </h3>
            <ul className="space-y-4">
              {/* Address */}
              <li className="flex items-start gap-3">
                <span className="material-icons-outlined text-pbp-purple-2 text-xl mt-0.5">
                  location_on
                </span>
                <div>
                  <p className="text-slate-300 text-base leading-relaxed">
                    IFZA Business Park, DDP
                    <br />
                    Building A1, Dubai Digital Park
                    <br />
                    Dubai Silicon Oasis
                    <br />
                    Dubai, 341041, UAE
                  </p>
                </div>
              </li>
              {/* Email */}
              <li className="flex items-start gap-3">
                <span className="material-icons-outlined text-pbp-purple-2 text-xl">
                  email
                </span>
                <a
                  href="mailto:contact@planbpass.com"
                  className="text-slate-300 hover:text-pbp-purple-2 transition-colors text-base"
                >
                  contact@planbpass.com
                </a>
              </li>
              {/* Phone Numbers */}
              <li className="flex items-start gap-3">
                <span className="material-icons-outlined text-pbp-purple-2 text-xl">
                  phone
                </span>
                <div className="space-y-1">
                  <a
                    href="tel:+971529128793"
                    className="block text-slate-300 hover:text-pbp-purple-2 transition-colors text-base"
                  >
                    +971 529128793 (UAE)
                  </a>
                  <a
                    href="tel:+919980551764"
                    className="block text-slate-300 hover:text-pbp-purple-2 transition-colors text-base"
                  >
                    +91 9980551764 (India)
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-slate-400 text-base">
              © {new Date().getFullYear()} PlanBPass. All rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap gap-6">
              <Link
                href="#"
                className="text-slate-400 hover:text-pbp-purple-2 transition-colors text-base"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-pbp-purple-2 transition-colors text-base"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-pbp-purple-2 transition-colors text-base"
              >
                Cookie Policy
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="#"
                aria-label="Facebook"
                className="h-10 w-10 rounded-full bg-slate-800 hover:bg-pbp-purple-1 text-slate-300 hover:text-white transition-all flex items-center justify-center"
              >
                <span className="material-icons-outlined text-xl">
                  facebook
                </span>
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="h-10 w-10 rounded-full bg-slate-800 hover:bg-pbp-purple-1 text-slate-300 hover:text-white transition-all flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="h-10 w-10 rounded-full bg-slate-800 hover:bg-pbp-purple-1 text-slate-300 hover:text-white transition-all flex items-center justify-center"
              >
                <span className="material-icons-outlined text-xl">link</span>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="h-10 w-10 rounded-full bg-slate-800 hover:bg-pbp-purple-1 text-slate-300 hover:text-white transition-all flex items-center justify-center"
              >
                <span className="material-icons-outlined text-xl">
                  photo_camera
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
