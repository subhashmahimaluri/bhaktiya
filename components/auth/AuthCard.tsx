import Footer from "@/components/Footer";
import Header from "@/components/Header";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

/**
 * Reusable auth page container with Header, Footer, and gradient background
 */
export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Site Header */}
      <Header />

      {/* Main Content - grows to push footer down */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-md">
          {/* Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-100">
            {/* Card Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
              )}
            </div>

            {/* Form content */}
            {children}
          </div>
        </div>
      </main>

      {/* Site Footer */}
      <Footer />
    </div>
  );
}
