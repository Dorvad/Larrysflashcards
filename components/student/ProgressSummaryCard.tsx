import type { ProgressStats } from "@/types";

interface StatBlock {
  label: string;
  value: number;
  bgColor: string;
  textColor: string;
}

interface ProgressSummaryCardProps {
  stats: ProgressStats;
}

export default function ProgressSummaryCard({ stats }: ProgressSummaryCardProps) {
  const statBlocks: StatBlock[] = [
    {
      label: "New",
      value: stats.newWords,
      bgColor: "bg-sky-50",
      textColor: "text-sky-600",
    },
    {
      label: "Practicing",
      value: stats.practicing,
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      label: "Strong",
      value: stats.strong,
      bgColor: "bg-violet-50",
      textColor: "text-violet-600",
    },
    {
      label: "Mastered",
      value: stats.mastered,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="grid grid-cols-2 gap-3">
        {statBlocks.map(({ label, value, bgColor, textColor }) => (
          <div key={label} className={`rounded-xl p-3 ${bgColor}`}>
            <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
