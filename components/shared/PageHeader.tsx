import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  action,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`flex flex-row justify-between items-start ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-base text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}
