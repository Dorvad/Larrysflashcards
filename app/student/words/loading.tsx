export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Header */}
      <div className="px-5 pt-10 pb-5">
        <div className="h-3 w-16 bg-gray-200 rounded-full mb-4" />
        <div className="h-8 w-32 bg-gray-200 rounded-full mb-2" />
        <div className="h-3 w-24 bg-gray-200 rounded-full" />
      </div>

      {/* Search bar */}
      <div className="px-5 mb-6">
        <div className="bg-gray-100 rounded-2xl h-[52px] w-full" />
      </div>

      {/* Category grid */}
      <div className="px-5">
        <div className="h-3 w-12 bg-gray-200 rounded-full mb-4" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-28" />
          ))}
        </div>
      </div>
    </div>
  );
}
