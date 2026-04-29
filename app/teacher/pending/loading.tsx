export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-40 bg-gray-200 rounded-full mb-2" />
      <div className="h-4 w-56 bg-gray-200 rounded-full mb-6" />
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between mb-3">
              <div className="h-3 w-20 bg-gray-100 rounded-full" />
              <div className="h-6 w-16 bg-amber-100 rounded-full" />
            </div>
            <div className="h-6 w-48 bg-gray-100 rounded-full mb-2" />
            <div className="h-4 w-36 bg-gray-100 rounded-full mb-5" />
            <div className="flex gap-3">
              <div className="flex-1 h-14 bg-emerald-50 rounded-xl" />
              <div className="flex-1 h-14 bg-rose-50 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
