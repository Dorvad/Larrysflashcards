"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Library, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/student", icon: Home, label: "Home" },
  { href: "/student/practice", icon: BookOpen, label: "Practice" },
  { href: "/student/words", icon: Library, label: "My Words" },
  { href: "/student/progress", icon: TrendingUp, label: "Progress" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    /* xl:hidden keeps the bottom nav through tablet landscape (1024px iPad) */
    <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
      <div className="flex flex-row items-stretch pb-safe">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== "/student" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center min-h-[64px] pt-2 pb-1"
            >
              <Icon
                className={`w-6 h-6 ${isActive ? "text-sky-600" : "text-gray-400"}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-xs font-medium mt-1 ${isActive ? "text-sky-600" : "text-gray-400"}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
