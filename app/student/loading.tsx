export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Header skeleton */}
      <div className="px-5 pt-12 pb-6">
        <div className="h-3 w-28 bg-gray-200 rounded-full mb-3" />
        <div className="h-8 w-48 bg-gray-200 rounded-full mb-2" />
        <div className="h-8 w-24 bg-gray-200 rounded-full" />
      </div>

      {/* Practice card skeleton */}
      <div className="px-5">
        <div className="bg-sky-200/60 rounded-3xl h-36 w-full" />
      </div>

      {/* New this week skeleton */}
      <div className="mt-10 px-5">
        <div className="h-3 w-24 bg-gray-200 rounded-full mb-4" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl w-28 h-24 shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
}
