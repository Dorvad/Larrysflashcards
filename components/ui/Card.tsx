import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  const isInteractive = Boolean(onClick);

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (e) => (e.key === "Enter" || e.key === " ") && onClick?.()
          : undefined
      }
      className={cn(
        "bg-white rounded-3xl shadow-card p-6",
        isInteractive &&
          "cursor-pointer hover:shadow-card-hover transition-shadow duration-200 active:scale-[0.98]",
        className
      )}
    >
      {children}
    </div>
  );
}
