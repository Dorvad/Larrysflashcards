import type { WordStatus } from "@/types";

const statusConfig: Record<
  WordStatus,
  { label: string; className: string; dotColor: string }
> = {
  new: {
    label: "New",
    className: "bg-sky-50 text-sky-700 border border-sky-200",
    dotColor: "bg-sky-500",
  },
  practicing: {
    label: "Practicing",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
    dotColor: "bg-amber-500",
  },
  strong: {
    label: "Strong",
    className: "bg-violet-50 text-violet-700 border border-violet-200",
    dotColor: "bg-violet-500",
  },
  mastered: {
    label: "Mastered",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dotColor: "bg-emerald-500",
  },
};

interface StatusBadgeProps {
  status: WordStatus;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const { label, className: statusClassName, dotColor } = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-medium ${statusClassName} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} aria-hidden />
      {label}
    </span>
  );
}
