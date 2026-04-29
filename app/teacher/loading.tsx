export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-7 w-36 bg-gray-200 rounded-full mb-2" />
        <div className="h-4 w-48 bg-gray-200 rounded-full" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="h-9 w-12 bg-gray-100 rounded-full mb-2" />
            <div className="h-3 w-20 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>

      {/* Section */}
      <div className="mt-10">
        <div className="h-5 w-40 bg-gray-200 rounded-full mb-4" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm h-16" />
          ))}
        </div>
      </div>
    </div>
  );
}
