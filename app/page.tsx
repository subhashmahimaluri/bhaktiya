import Footer from "@/components/Footer";
import Header from "@/components/Header";
import StickyWaitlistButton from "@/components/StickyWaitlistButton";
import AppStoreButton from "@/components/ui/AppStoreButton";
import DestinationCard from "@/components/ui/DestinationCard";
import FeatureCard from "@/components/ui/FeatureCard";
import HelperCard from "@/components/ui/HelperCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { destinations, features, helpers } from "@/lib/constants/sectionData";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <Header />
      <StickyWaitlistButton />

      <main className="w-full">
        {/* How It Works Section */}
        <section className="py-5 lg:pt-5 pb-10 lg:pb-15 bg-tinted-white dark:bg-slate-900/50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              title="How It Works in 3 Simple Steps"
              description="Your journey to a new life, simplified."
            />
            <div className="mt-16 grid md:grid-cols-3 gap-8 lg:gap-12 text-center">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.step}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Download App Section */}
        <section className="py-10 lg:py-15 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-6">
                  Take Your Journey <br />
                  <span className="text-yellow-300">On The Go</span>
                </h2>
                <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-xl mx-auto lg:mx-0">
                  Download our mobile app and access personalized migration
                  plans, connect with helpers, and get AI-powered guidance
                  anytime, anywhere.
                </p>

                {/* App Store Buttons */}
                <div className="flex gap-4 justify-center align-center lg:justify-start">
                  <AppStoreButton platform="android" />
                  <AppStoreButton platform="ios" />
                </div>

                {/* Stats */}
                <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-yellow-300">
                      50K+
                    </div>
                    <div className="text-sm text-white/80 mt-1">Downloads</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-yellow-300">
                      4.8
                    </div>
                    <div className="text-sm text-white/80 mt-1">Rating</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-yellow-300">
                      40+
                    </div>
                    <div className="text-sm text-white/80 mt-1">Countries</div>
                  </div>
                </div>
              </div>

              {/* Right: Phone Mockup */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-purple-400/30 blur-3xl rounded-full scale-110"></div>

                  {/* Phone Image */}
                  <div className="relative z-10 transform hover:scale-105 transition-transform duration-300">
                    <Image
                      src="/app_image.png"
                      alt="PlanBPass Mobile App"
                      width={400}
                      height={600}
                      className="drop-shadow-2xl"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Destinations Section */}
        <section className="py-10 lg:py-15 bg-anti-flash-white px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              title="Explore Top Destinations"
              description="Discover opportunities in leading countries for global talent."
            />
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {destinations.map((destination) => (
                <DestinationCard
                  key={destination.name}
                  imageUrl={destination.imageUrl}
                  alt={destination.alt}
                  name={destination.name}
                />
              ))}
            </div>
          </div>
        </section>

        {/* AI Migration Advisor Section */}
        <section className="py-10 lg:py-15 bg-white dark:bg-slate-900/50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                Meet Your AI Migration Advisor
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                Get instant, reliable answers to your most complex migration
                questions. Our AI is trained on millions of data points from
                official sources to guide you 24/7.
              </p>
              <Link
                href="#"
                className="mt-8 inline-block bg-primary text-white font-medium px-6 py-3 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
              >
                Chat with Advisor
              </Link>
            </div>
            <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pbp-purple-1 to-pbp-purple-2 flex items-center justify-center text-white">
                    <span className="material-icons-outlined text-2xl">
                      smart_toy
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      AI Advisor
                    </p>
                    <p className="text-sm text-green-500 flex items-center">
                      <span className="h-2 w-2 bg-green-500 rounded-full mr-1.5"></span>
                      Online
                    </p>
                  </div>
                </div>
                <span className="material-icons-outlined text-slate-400">
                  more_horiz
                </span>
              </div>
              <div className="space-y-4 py-6 h-64 overflow-y-auto">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-pbp-purple-1/10 text-pbp-purple-1 flex-shrink-0 flex items-center justify-center">
                    <span className="material-icons-outlined text-lg">
                      smart_toy
                    </span>
                  </div>
                  <div className="bg-slate-200 dark:bg-slate-700 p-3 rounded-lg rounded-tl-none">
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      Hello! How can I help you plan your move today?
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <div className="bg-gradient-to-br from-pbp-purple-1 to-pbp-purple-2 text-white p-3 rounded-lg rounded-br-none">
                    <p className="text-sm">
                      What are the best visa options for a software engineer in
                      Canada?
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-700 flex items-center">
                <input
                  className="w-full bg-slate-200 dark:bg-slate-700 border-none rounded-lg focus:ring-2 focus:ring-pbp-purple-1 px-4 py-2"
                  placeholder="Type your message..."
                  type="text"
                />
                <button className="ml-3 text-pbp-purple-1 hover:text-pbp-purple-2 transition-colors">
                  <span className="material-icons-outlined text-2xl">send</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Dual CTA Section - Get Early Access & Become a Helper */}
        <section
          id="waitlist"
          className="relative py-16 lg:py-20 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 overflow-hidden scroll-mt-20"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Main Heading */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
                <span className="h-2 w-2 bg-yellow-300 rounded-full animate-pulse"></span>
                Join Our Growing Community
              </div>
              <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-4">
                Be Part of the Migration Revolution
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Whether you're planning your move or helping others achieve
                theirs, we have a place for you.
              </p>
            </div>

            {/* Two-Column Cards */}
            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* User Waitlist Card */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pbp-purple-1 to-pbp-purple-2 flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons-outlined text-3xl text-white">
                      flight_takeoff
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Planning Your Move?
                  </h3>
                  <p className="text-slate-600">
                    Get early access and save 50% on premium features
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="material-icons-outlined text-pbp-purple-1 text-xl mt-0.5">
                      check_circle
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900">
                        Early Bird Pricing
                      </div>
                      <div className="text-sm text-slate-600">
                        50% off for early adopters
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-icons-outlined text-pbp-purple-1 text-xl mt-0.5">
                      check_circle
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900">
                        Priority Access
                      </div>
                      <div className="text-sm text-slate-600">
                        Be first when we launch
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-icons-outlined text-pbp-purple-1 text-xl mt-0.5">
                      check_circle
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900">
                        Exclusive Features
                      </div>
                      <div className="text-sm text-slate-600">
                        Beta access to AI tools
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Form */}
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pbp-purple-1 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    className="group w-full px-6 py-3 bg-gradient-to-r from-pbp-purple-1 to-pbp-purple-2 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Join Waitlist
                    <span className="material-icons-outlined text-xl group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                </form>

                {/* Trust Badge */}
                <p className="mt-4 text-xs text-center text-slate-500">
                  🔒 10,000+ professionals already on the waitlist
                </p>
              </div>

              {/* Helper Recruitment Card */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons-outlined text-3xl text-white">
                      verified_user
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Become a Helper
                  </h3>
                  <p className="text-slate-600">
                    Share your expertise and earn competitive income
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="material-icons-outlined text-yellow-500 text-xl mt-0.5">
                      check_circle
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900">
                        Flexible Schedule
                      </div>
                      <div className="text-sm text-slate-600">
                        Work on your own terms
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-icons-outlined text-yellow-500 text-xl mt-0.5">
                      check_circle
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900">
                        Competitive Earnings
                      </div>
                      <div className="text-sm text-slate-600">
                        $50-$200 per consultation
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-icons-outlined text-yellow-500 text-xl mt-0.5">
                      check_circle
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900">
                        Premium Listing
                      </div>
                      <div className="text-sm text-slate-600">
                        Early helpers featured first
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Form */}
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    className="group w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Apply as Helper
                    <span className="material-icons-outlined text-xl group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                </form>

                {/* Trust Badge */}
                <p className="mt-4 text-xs text-center text-slate-500">
                  � Join 500+ verified helpers earning on our platform
                </p>
              </div>
            </div>

            {/* Social Proof Stats */}
            <div className="mt-12 flex items-center justify-center gap-12 flex-wrap">
              <div className="text-center text-white">
                <div className="text-4xl font-bold">10K+</div>
                <div className="text-sm text-white/80">On Waitlist</div>
              </div>
              <div className="text-center text-white">
                <div className="text-4xl font-bold">500+</div>
                <div className="text-sm text-white/80">Helpers</div>
              </div>
              <div className="text-center text-white">
                <div className="text-4xl font-bold">40+</div>
                <div className="text-sm text-white/80">Countries</div>
              </div>
              <div className="text-center text-white">
                <div className="text-4xl font-bold">4.9★</div>
                <div className="text-sm text-white/80">User Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Verified Helpers Section */}
        <section className="py-10 lg:py-15 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              title="Connect With Verified Helpers"
              description="Get personalized guidance from experienced migration consultants, lawyers, and mentors."
            />
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {helpers.map((helper) => (
                <HelperCard
                  key={helper.name}
                  imageUrl={helper.imageUrl}
                  alt={helper.alt}
                  name={helper.name}
                  role={helper.role}
                  quote={helper.quote}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="relative py-16 lg:py-20 bg-white dark:bg-slate-800/30 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Large Decorative Quote Icon */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-slate-200 dark:text-slate-700/30 pointer-events-none">
            <svg
              className="w-32 h-32 lg:w-40 lg:h-40 opacity-30"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
            </svg>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
              Trusted by Thousands Worldwide
            </h2>
            <div className="mt-12">
              <blockquote className="text-xl lg:text-2xl text-slate-700 dark:text-slate-200 leading-relaxed">
                &quot;PlanBPass took all the guesswork out of my move to
                Australia. The AI plan was incredibly accurate, and connecting
                with a local mentor was a game-changer. I felt supported every
                step of the way!&quot;
              </blockquote>
              <div className="mt-8 flex items-center justify-center space-x-4">
                <Image
                  alt="Happy user of PlanBPass"
                  className="h-14 w-14 rounded-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5oNg63xT_YDGGmYGqmgZaz7aUQ0cG5sEvJQqu0GGZviW-zPid02fHDvuN6cQf6BvR944mdrW5jPa-2mzLssu6yg3TY7GEsY5WXBUr8T4T65w4tPbc-7QTaBl0pfP35Hisuc1CKgMwUvlCtWQxWwLCEA4qnErf1AEAp9Ihz8PKsTOBW8ArYbLE4woqUm3y7x3RrD2kJQc9w1d5chC4hvXNeSK4stlfeKCynhxJED7WI6nS9DszxmfQpKRgX0mU4T-sNRS1cRw4ATmw"
                  width={56}
                  height={56}
                />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Javier Rodriguez
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Software Engineer, now in Sydney
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
