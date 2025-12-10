import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="group relative p-8 bg-white dark:bg-background-dark rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
      {/* Purple gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Background pattern on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-300 rounded-full blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon Container */}
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
          <Icon className="w-8 h-8" strokeWidth={2.5} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-white transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-300 group-hover:text-white/90 transition-colors duration-300 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
