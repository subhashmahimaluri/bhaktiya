interface SectionHeaderProps {
  title: string;
  description: string;
}

export default function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="text-center">
      <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl mx-auto text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}
