import {
  BookOpen,
  Clapperboard,
  FileText,
  History,
  LayoutDashboard,
  Settings,
  Share2,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavKey =
  | "dashboard"
  | "socialMedia"
  | "productDescriptions"
  | "videoAdScript"
  | "resumeBuilder"
  | "history"
  | "blog"
  | "settings";

export const dashboardNavItems: {
  href: string;
  key: DashboardNavKey;
  icon: LucideIcon;
}[] = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/app/social-media", key: "socialMedia", icon: Share2 },
  { href: "/app/product-description", key: "productDescriptions", icon: ShoppingBag },
  { href: "/app/video-ad-script", key: "videoAdScript", icon: Clapperboard },
  { href: "/app/resume", key: "resumeBuilder", icon: FileText },
  { href: "/history", key: "history", icon: History },
  { href: "/blog", key: "blog", icon: BookOpen },
  { href: "/settings", key: "settings", icon: Settings },
];

export function isDashboardNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
