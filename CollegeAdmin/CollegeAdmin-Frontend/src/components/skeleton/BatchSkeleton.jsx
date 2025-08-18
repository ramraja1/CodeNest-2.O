export default function BatchSkeleton({ count = 6 }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, key) => (
        <div
          key={key}
          className="bg-gray-100 rounded-xl border border-gray-200 flex flex-col justify-between min-h-[160px] opacity-40 animate-pulse"
        >
          <div className="p-6 flex-1 space-y-3">
            <div className="h-5 bg-gray-300 rounded w-[70%]"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-[85%]"></div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <div className="h-3 bg-gray-300 rounded w-20"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
