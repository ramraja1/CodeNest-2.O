// src/components/skeleton/BatchOverviewSkeleton.jsx
export default function BatchOverviewSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Back Button Skeleton */}
      <div className="h-6 w-36 bg-gray-300 rounded mb-4 opacity-30 animate-pulse"></div>

      {/* Header + Actions */}
      <div className="bg-white rounded-xl shadow p-6 mb-8 space-y-6 opacity-40">
        <div className="h-8 w-72 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-gray-300 rounded animate-pulse"></div>

        <div className="flex gap-4">
          <div className="h-10 w-28 bg-blue-300 rounded opacity-30"></div>
          <div className="h-10 w-28 bg-red-300 rounded opacity-30"></div>
        </div>

        {/* Batch Code */}
        <div className="h-8 w-40 bg-gray-300 rounded-full mt-4 opacity-30"></div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center border rounded-lg p-4 shadow-sm opacity-40"
          >
            <div className="h-10 w-10 bg-gray-300 rounded mb-2 animate-pulse"></div>
            <div className="h-8 w-12 bg-gray-300 rounded mb-1 animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl shadow border border-gray-100 h-40 opacity-40"
          ></div>
        ))}
      </div>
    </div>
  );
}
