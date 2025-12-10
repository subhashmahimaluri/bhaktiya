import Image from "next/image";

interface HelperCardProps {
  imageUrl: string;
  alt: string;
  name: string;
  role: string;
  quote: string;
}

export default function HelperCard({
  imageUrl,
  alt,
  name,
  role,
  quote,
}: HelperCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
      <div className="flex items-center space-x-4">
        <Image
          alt={alt}
          className="h-20 w-20 rounded-full object-cover"
          src={imageUrl}
          width={80}
          height={80}
        />
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {name}
          </h3>
          <p className="text-sm text-primary font-medium">{role}</p>
        </div>
      </div>
      <p className="mt-4 text-slate-600 dark:text-slate-300">
        &quot;{quote}&quot;
      </p>
    </div>
  );
}
