"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
  Inbox,
  BarChart3,
  Menu,
  X,
  ArrowLeft,
  LayoutGrid,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { href: "/teacher",          icon: LayoutGrid, label: "Overview" },
  { href: "/teacher/words",    icon: BookMarked, label: "Words" },
  { href: "/teacher/pending",  icon: Inbox,      label: "Pending", badge: 3 },
  { href: "/teacher/progress", icon: BarChart3,  label: "Larry's Progress" },
];

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex flex-row items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
        isActive
          ? "bg-sky-50 text-sky-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-base font-medium flex-1">{item.label}</span>
      {item.badge !== undefined && (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-500 text-white text-xs font-bold">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export default function TeacherNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/teacher") return pathname === "/teacher";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden bg-white border-b border-gray-100 shadow-sm">
        <div className="flex flex-row justify-between items-center px-4 h-14">
          <Link
            href="/student"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Larry&apos;s view
          </Link>
          <span className="text-base font-semibold text-gray-900">Teacher</span>
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <nav className="border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={isActive(item.href)}
                onClick={() => setMobileMenuOpen(false)}
              />
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <LogoutButton className="flex w-full items-center gap-3 px-3 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors">
                <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                <span className="text-base font-medium">Sign out</span>
              </LogoutButton>
            </div>
          </nav>
        )}
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-full fixed top-0 left-0 z-40 py-8 px-4">
        <div className="mb-8 px-3">
          <p className="text-lg font-bold text-gray-900">Larry&apos;s Flashcards</p>
          <p className="text-sm text-gray-400 mt-0.5">Teacher view</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
          ))}
        </nav>

        {/* Footer links */}
        <div className="flex flex-col gap-1 border-t border-gray-100 pt-3 mt-2">
          <Link
            href="/student"
            className="flex items-center gap-2 px-3 py-3 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Larry&apos;s view
          </Link>
          <LogoutButton className="flex w-full items-center gap-2 px-3 py-3 text-sm text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" />
            Sign out
          </LogoutButton>
        </div>
      </aside>
    </>
  );
}
