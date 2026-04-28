import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "lg" | "xl";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "lg",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-150 select-none focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:ring-offset-2 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700 shadow-md",
    secondary:
      "bg-sand-100 text-gray-800 hover:bg-sand-200 active:bg-sand-300 border border-sand-200",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200",
    danger:
      "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-md",
  };

  const sizes = {
    md: "px-5 py-3 text-base min-h-[48px]",
    lg: "px-7 py-4 text-lg min-h-[56px]",
    xl: "px-8 py-5 text-xl min-h-[64px] w-full",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
          <span>Loading…</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
