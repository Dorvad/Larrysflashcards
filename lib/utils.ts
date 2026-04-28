// Merge Tailwind class names (lightweight — no clsx dependency needed at scaffold)
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Shuffle an array (Fisher-Yates) — used to randomise flashcard order
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Format a duration in seconds to "2 min 34 sec"
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} sec`;
  return `${m} min ${s} sec`;
}

// Score percentage label for display
export function scoreLabel(pct: number | null): string {
  if (pct === null) return "—";
  if (pct >= 90) return "Excellent!";
  if (pct >= 70) return "Good work";
  if (pct >= 50) return "Keep going";
  return "Needs practice";
}
