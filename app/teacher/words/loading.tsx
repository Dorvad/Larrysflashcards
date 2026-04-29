export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-24 bg-gray-200 rounded-full" />
        <div className="h-10 w-28 bg-sky-100 rounded-xl" />
      </div>
      <div className="h-12 bg-gray-100 rounded-2xl mb-4 w-full" />
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm h-20" />
        ))}
      </div>
    </div>
  );
}
