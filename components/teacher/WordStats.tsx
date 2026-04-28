import type { WordStats as WordStatsType } from "@/types/database";

interface WordStatsProps {
  stats: WordStatsType;
}

export function WordStats({ stats }: WordStatsProps) {
  return (
    <div className="bg-white rounded-3xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Larry&rsquo;s performance on this word
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <Stat
          label="Attempts"
          value={String(stats.total_attempts)}
        />
        <Stat
          label="Accuracy"
          value={
            stats.accuracy_pct !== null ? `${stats.accuracy_pct}%` : "—"
          }
          highlight={
            stats.accuracy_pct !== null && stats.accuracy_pct >= 70
          }
        />
        <Stat label="Correct" value={String(stats.correct_count)} />
        <Stat
          label="Incorrect"
          value={String(stats.incorrect_count)}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${highlight ? "bg-green-50" : "bg-gray-50"}`}
    >
      <p className="text-base text-gray-500">{label}</p>
      <p
        className={`text-2xl font-bold mt-0.5 ${
          highlight ? "text-green-600" : "text-gray-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
