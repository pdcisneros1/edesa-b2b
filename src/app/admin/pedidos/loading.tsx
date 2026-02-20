import { OrdersTableSkeleton } from '@/components/admin/OrdersTableSkeleton';

export default function Loading() {
  return (
    <div className="space-y-5">
      {/* Header skeleton */}
      <div className="flex items-center justify-between animate-pulse">
        <div>
          <div className="h-7 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-48 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Table skeleton */}
      <OrdersTableSkeleton />
    </div>
  );
}
