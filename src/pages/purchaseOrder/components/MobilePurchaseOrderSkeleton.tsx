import React from "react";
import { Skeleton } from "../../../components/ui/skeleton";

const MobilePurchaseOrderSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>

          {/* Products Section Skeleton */}
          <div className="px-4 pb-3">
            <div className="mb-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="mt-2 p-3 space-y-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>

            {/* Info Grid Skeleton */}
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="px-4 pb-4">
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MobilePurchaseOrderSkeleton;
