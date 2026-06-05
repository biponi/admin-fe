import { Card } from "@/components/ui/card"

export function MobileSkeletonCard() {
  return (
    <Card className="p-4 space-y-4 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-1 bg-gray-200 rounded w-full"></div>
      </div>

      {/* Status Badge */}
      <div className="flex justify-between items-center">
        <div className="h-7 bg-gray-200 rounded-full w-28"></div>
        <div className="h-6 bg-gray-200 rounded w-6"></div>
      </div>

      {/* Customer Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-5 bg-gray-200 rounded w-5"></div>
          <div className="h-5 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="flex items-center gap-2 pl-7">
          <div className="h-4 bg-gray-200 rounded w-4"></div>
          <div className="h-4 bg-gray-200 rounded w-40"></div>
        </div>
        <div className="flex items-center gap-2 pl-7">
          <div className="h-4 bg-gray-200 rounded w-4"></div>
          <div className="h-4 bg-gray-200 rounded w-28"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </div>

      {/* Product Gallery */}
      <div className="flex gap-2">
        <div className="h-16 w-16 bg-gray-200 rounded-xl"></div>
        <div className="h-16 w-16 bg-gray-200 rounded-xl"></div>
        <div className="h-16 w-16 bg-gray-200 rounded-xl"></div>
        <div className="h-16 w-16 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Price Section */}
      <div className="grid grid-cols-3 gap-2">
        <div className="h-16 bg-gray-200 rounded-xl"></div>
        <div className="h-16 bg-gray-200 rounded-xl"></div>
        <div className="h-16 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Courier & Time */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-4"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
        <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
        <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
      </div>
    </Card>
  )
}

export function MobileSkeletonCardList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <MobileSkeletonCard key={i} />
      ))}
    </div>
  )
}
