import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <Header />
      <main className="w-full">
        {/* Testimonial Section */}
        <section className="relative py-16 lg:py-20 dark:bg-slate-800/30 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
