import { cn } from "@/lib/utils/classNames";
import Link from "next/link";

interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  isScrolled: boolean;
  hasDropdown?: boolean;
  className?: string;
}

export default function NavigationLink({
  href,
  children,
  isScrolled,
  hasDropdown = false,
  className = "",
}: NavigationLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "font-bold transition-colors inline-flex items-center",
        isScrolled
          ? "text-slate-800 hover:text-primary"
          : "text-white hover:text-secondary",
        className
      )}
    >
      {children}
      {hasDropdown && (
        <span className="material-icons-outlined text-base ml-1">
          expand_more
        </span>
      )}
    </Link>
  );
}
