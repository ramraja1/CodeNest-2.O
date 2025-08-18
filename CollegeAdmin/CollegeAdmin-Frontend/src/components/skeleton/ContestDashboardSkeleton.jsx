// src/components/skeleton/ContestDashboardSkeleton.jsx
export default function ContestDashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Back Button Skeleton */}
      <div className="h-5 w-36 bg-gray-300 rounded mb-8 opacity-30 animate-pulse"></div>

      {/* Heading Skeleton */}
      <div className="h-8 w-60 bg-gray-300 rounded mb-10 opacity-30 animate-pulse"></div>

      {/* Grid Skeleton */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* Add Contest Skeleton Card */}
        <div className="p-8 bg-gray-100 rounded-2xl border border-dashed border-gray-200 min-h-[220px] opacity-40"></div>

        {/* Contest Cards Skeleton */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm p-6 min-h-[220px] flex flex-col justify-between opacity-40"
          >
            <div>
              <div className="h-5 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-3 animate-pulse"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-3 animate-pulse"></div>
              <div className="flex flex-wrap gap-2 mt-2">
                {[1, 2, 3].map((tag) => (
                  <div
                    key={tag}
                    className="h-4 w-12 bg-gray-200 rounded-full opacity-30"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
