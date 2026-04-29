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
  { href: "/student",          icon: Home,       label: "Home"     },
  { href: "/student/practice", icon: BookOpen,   label: "Practice" },
  { href: "/student/words",    icon: Library,    label: "My Words" },
  { href: "/student/progress", icon: TrendingUp, label: "Progress" },
];

export default function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/student") return pathname === "/student";
    return pathname.startsWith(href);
  }

  return (
    <nav className="xl:hidden fixed bottom-0 inset-x-0 z-50">
      {/* Frosted glass bar */}
      <div className="bg-white/92 backdrop-blur-xl border-t border-gray-100/80 shadow-[0_-1px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-stretch pb-safe max-w-xl mx-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 relative flex flex-col items-center justify-center gap-1 py-2 pt-2.5 min-h-[60px]"
              >
                {/* Active pill */}
                {active && (
                  <span
                    className="absolute inset-x-1.5 top-1.5 bottom-1 bg-sky-50 rounded-2xl"
                    aria-hidden
                  />
                )}

                <Icon
                  className={`w-[22px] h-[22px] relative z-10 transition-colors ${
                    active ? "text-sky-600" : "text-gray-400"
                  }`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span
                  className={`text-[11px] relative z-10 transition-colors ${
                    active ? "font-semibold text-sky-600" : "font-medium text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
