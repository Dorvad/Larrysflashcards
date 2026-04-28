import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: string; // hex colour from word_set
  className?: string;
}

export function Badge({ children, color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-base font-medium",
        className
      )}
      style={
        color
          ? { backgroundColor: color + "22", color }
          : { backgroundColor: "#e5e7eb", color: "#374151" }
      }
    >
      {children}
    </span>
  );
}
