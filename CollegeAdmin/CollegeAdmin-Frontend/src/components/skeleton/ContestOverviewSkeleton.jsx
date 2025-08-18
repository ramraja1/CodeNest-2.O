// src/components/skeleton/ContestOverviewSkeleton.jsx
export default function ContestOverviewSkeleton() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 animate-pulse">
      {/* Back Button Skeleton */}
      <div className="h-5 w-36 bg-gray-300 rounded opacity-30"></div>

      {/* Contest Details Skeleton */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row justify-between gap-6 opacity-40">
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-gray-300 rounded w-2/3"></div>
          <div className="h-4 bg-gray-300 rounded w-full max-w-xl"></div>
          <div className="flex space-x-6 text-sm">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-5 w-14 bg-gray-200 rounded-full opacity-30"></div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <div className="h-10 bg-gray-300 rounded w-full"></div>
          <div className="h-10 bg-gray-300 rounded w-full"></div>
        </div>
      </div>

      {/* Questions Header and Add Button Skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-7 w-48 bg-gray-300 rounded opacity-30"></div>
        <div className="h-9 w-28 bg-gray-300 rounded opacity-30"></div>
      </div>

      {/* Questions Grid Skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-4 opacity-40"
          >
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-5 bg-gray-300 rounded-full w-20"></div>
            </div>
            <div className="h-4 bg-gray-300 rounded w-full max-w-md"></div>
            <div className="flex gap-4">
              <div className="h-5 bg-gray-300 rounded w-16"></div>
              <div className="h-5 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
