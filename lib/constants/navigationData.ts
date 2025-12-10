/**
 * Navigation menu configuration
 * Centralized data for Header component
 */

export interface NavLink {
  href: string;
  label: string;
  hasDropdown?: boolean;
}

export const navigationLinks: NavLink[] = [
  { href: "#", label: "Home" },
  { href: "#", label: "How It Works" },
  { href: "#", label: "AI Advisor" },
  { href: "#", label: "Countries", hasDropdown: true },
  { href: "#", label: "For Helpers" },
  { href: "#", label: "Pricing" },
];
