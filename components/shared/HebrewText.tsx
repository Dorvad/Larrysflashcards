import type { ReactNode } from "react";

type HebrewSize = "sm" | "md" | "lg" | "xl" | "2xl";

const sizeMap: Record<HebrewSize, string> = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl",
  xl: "text-6xl",
  "2xl": "text-7xl",
};

interface HebrewTextProps {
  children: ReactNode;
  size?: HebrewSize;
  className?: string;
}

export default function HebrewText({
  children,
  size = "md",
  className = "",
}: HebrewTextProps) {
  return (
    <span
      dir="rtl"
      lang="he"
      style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
      className={`text-gray-900 ${sizeMap[size]} ${className}`}
    >
      {children}
    </span>
  );
}
