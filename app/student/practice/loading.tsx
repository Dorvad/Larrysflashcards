export default function Loading() {
  return (
    <div className="px-4 pt-5 pb-6 animate-pulse">
      {/* Stop button placeholder */}
      <div className="flex justify-end mb-2">
        <div className="h-6 w-14 bg-gray-200 rounded-full" />
      </div>

      <div className="max-w-lg mx-auto flex flex-col gap-5">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between mb-2">
            <div className="h-3 w-14 bg-gray-200 rounded-full" />
            <div className="h-3 w-8 bg-gray-200 rounded-full" />
          </div>
          <div className="h-2 bg-gray-100 rounded-full" />
        </div>

        {/* Card skeleton */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 pt-8 pb-6 flex flex-col items-center gap-6">
            <div className="h-10 w-32 bg-sky-100 rounded-full" />
            <div className="h-20 w-52 bg-gray-100 rounded-2xl" />
            <div className="h-4 w-20 bg-gray-100 rounded-full" />
          </div>
          <div className="px-5 pb-7 pt-2">
            <div className="h-16 w-full bg-sky-100 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
