import { FaTasks, FaUsers, FaChartLine } from "react-icons/fa";

export default function CollegeAdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 animate-pulse">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-300">🎓 Loading...</h2>
          <div className="h-10 w-28 bg-slate-200 rounded-lg" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Stats Cards Skeleton */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonStat icon={<FaTasks className="opacity-40" />} />
          <SkeletonStat icon={<FaUsers className="opacity-40" />} />
          <SkeletonStat icon={<FaChartLine className="opacity-40" />} />
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid md:grid-cols-2 gap-6">
          <SkeletonAction />
          <SkeletonAction />
        </div>

        {/* Recent Activity Skeleton */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-semibold text-slate-300">
            📢 Fetching recent activity...
          </h3>
          <ul className="mt-4 space-y-3">
            <li className="h-4 w-2/3 bg-slate-200 rounded" />
            <li className="h-4 w-1/2 bg-slate-200 rounded" />
            <li className="h-4 w-3/4 bg-slate-200 rounded" />
          </ul>
        </section>
      </main>
    </div>
  );
}

/* Mini Skeleton Components */

function SkeletonStat({ icon }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition">
      <div className="w-12 h-12 bg-slate-200 flex items-center justify-center rounded-xl mb-4 text-2xl">
        {icon}
      </div>
      <p className="h-3 w-20 bg-slate-200 rounded mb-2"></p>
      <p className="h-6 w-16 bg-slate-300 rounded"></p>
    </div>
  );
}

function SkeletonAction() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border flex flex-col justify-between">
      <div>
        <div className="w-12 h-12 bg-slate-200 flex items-center justify-center rounded-xl mb-4"></div>
        <div className="h-4 w-36 bg-slate-200 rounded mb-2"></div>
        <div className="h-3 w-48 bg-slate-200 rounded"></div>
      </div>
      <div className="mt-6 h-10 w-full bg-emerald-200 rounded-lg"></div>
    </div>
  );
}
