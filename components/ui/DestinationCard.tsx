import Image from "next/image";

interface DestinationCardProps {
  imageUrl: string;
  alt: string;
  name: string;
}

export default function DestinationCard({
  imageUrl,
  alt,
  name,
}: DestinationCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-64">
      {/* Image with consistent color grading */}
      <div className="relative w-full h-full">
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          style={{
            filter: "brightness(1.05) contrast(1.1) saturate(1.15)",
          }}
        />

        {/* Warm sunlight overlay for consistent color grading */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-transparent to-purple-900/20 mix-blend-overlay"
          style={{ pointerEvents: "none" }}
        />

        {/* Consistent contrast overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Country Name */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-2xl font-bold text-white drop-shadow-lg group-hover:scale-105 transition-transform duration-300">
          {name}
        </h3>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 border-2 border-purple-400/0 group-hover:border-purple-400/50 rounded-2xl transition-all duration-300" />
    </div>
  );
}
