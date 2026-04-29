export default function Loading() {
  return (
    <div className="min-h-screen pb-4 animate-pulse">
      {/* Back nav */}
      <div className="px-4 pt-5 pb-2">
        <div className="h-4 w-20 bg-gray-200 rounded-full" />
      </div>

      {/* Hero card */}
      <div className="mx-4 mt-3 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-4">
        <div className="h-12 w-28 bg-gray-100 rounded-xl" />
        <div className="h-8 w-36 bg-gray-100 rounded-xl" />
        <div className="h-5 w-24 bg-gray-100 rounded-full" />
        <div className="flex gap-2">
          <div className="h-7 w-20 bg-gray-100 rounded-full" />
          <div className="h-7 w-24 bg-gray-100 rounded-full" />
        </div>
        <div className="h-11 w-32 bg-sky-100 rounded-full" />
      </div>

      {/* Example card */}
      <div className="mx-4 mt-4 bg-amber-50 rounded-2xl p-5">
        <div className="h-3 w-16 bg-amber-100 rounded-full mb-3" />
        <div className="h-6 w-full bg-amber-100 rounded-full mb-2" />
        <div className="h-4 w-3/4 bg-amber-100 rounded-full" />
      </div>

      {/* Stats card */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-3 w-16 bg-gray-100 rounded-full mb-2" />
              <div className="h-7 w-10 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
