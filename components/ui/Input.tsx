import { type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        className={cn(
          "w-full px-4 py-3 text-lg bg-white border-2 rounded-xl",
          "placeholder:text-gray-400",
          "focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100",
          "transition-colors duration-150",
          error ? "border-red-400 bg-red-50" : "border-gray-200",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-base text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
