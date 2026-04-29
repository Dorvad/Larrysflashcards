"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface RouteConfig {
  title: string;
  back?: { href: string; label: string };
}

function getConfig(pathname: string): RouteConfig {
  if (pathname === "/student") return { title: "Larry's Flashcards" };
  if (pathname === "/student/practice") return { title: "Practice", back: { href: "/student", label: "Home" } };
  if (pathname === "/student/words") return { title: "My Words" };
  if (pathname.startsWith("/student/words/")) return { title: "Word", back: { href: "/student/words", label: "My Words" } };
  if (pathname === "/student/progress") return { title: "Progress" };
  if (pathname === "/student/add-word") return { title: "Suggest a Word", back: { href: "/student/words", label: "My Words" } };
  return { title: "Larry's Flashcards" };
}

export function StudentTopBar() {
  const pathname = usePathname();
  const config = getConfig(pathname);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 h-14 flex items-center px-3 md:max-w-xl md:mx-auto md:left-0 md:right-0 md:w-full lg:max-w-2xl xl:max-w-3xl">
      {/* Left: back button or spacer */}
      <div className="w-16 flex items-center">
        {config.back ? (
          <Link
            href={config.back.href}
            className="flex items-center gap-1.5 text-sky-600 font-medium text-sm min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden xs:inline">{config.back.label}</span>
          </Link>
        ) : null}
      </div>

      {/* Center: title */}
      <h1 className="flex-1 text-center text-base font-semibold text-gray-900 truncate px-2">
        {config.title}
      </h1>

      {/* Right: spacer to balance left */}
      <div className="w-16" />
    </header>
  );
}
