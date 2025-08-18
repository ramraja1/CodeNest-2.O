// src/components/skeleton/CollegeAdminDashboardSkeleton.jsx
export default function CollegeAdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 animate-pulse">
      {/* Header Skeleton */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-300 rounded-md"></div>
          <div className="h-10 w-24 bg-gray-300 rounded-lg"></div>
        </div>
      </header>

      {/* Dashboard Content Skeleton */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards Skeleton */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl p-6 shadow-sm border"
            >
              <div className="w-12 h-12 bg-gray-300 rounded-xl mb-4"></div>
              <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-10 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl p-6 shadow-sm border flex flex-col justify-between"
              style={{ minHeight: "180px" }}
            >
              <div>
                <div className="w-12 h-12 bg-gray-300 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
              </div>
              <div className="mt-6 h-10 bg-gray-300 rounded w-full"></div>
            </div>
          ))}
        </div>

        {/* Recent Activity Skeleton */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
          <ul className="space-y-3 text-slate-600">
            {[1, 2, 3].map((item) => (
              <li
                key={item}
                className="h-4 bg-gray-300 rounded w-full max-w-lg"
              ></li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
