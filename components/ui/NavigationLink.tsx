import { cn } from "@/lib/utils/classNames";
import Link from "next/link";

interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  hasDropdown?: boolean;
  className?: string;
}

export default function NavigationLink({
  href,
  children,
  hasDropdown = false,
  className = "",
}: NavigationLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "font-bold transition-colors inline-flex items-center text-slate-800 hover:text-primary",
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
