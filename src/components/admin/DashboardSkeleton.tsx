export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metrics cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-5 w-5 bg-gray-200 rounded" />
            </div>
            <div className="h-8 w-28 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-gray-200">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-10 w-32 bg-gray-200 rounded-t" />
          ))}
        </div>

        {/* Chart area skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}
