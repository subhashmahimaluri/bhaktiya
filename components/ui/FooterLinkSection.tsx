import Link from "next/link";

interface FooterLink {
  href: string;
  label: string;
}

interface FooterLinkSectionProps {
  title: string;
  links: FooterLink[];
}

export default function FooterLinkSection({
  title,
  links,
}: FooterLinkSectionProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-base text-slate-200 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
