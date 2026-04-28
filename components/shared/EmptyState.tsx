import type { ReactNode } from "react";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  emoji,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
    >
      {emoji && (
        <span className="text-4xl mb-4" aria-hidden="true">
          {emoji}
        </span>
      )}
      <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
      {description && (
        <p className="mt-2 text-base text-gray-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
