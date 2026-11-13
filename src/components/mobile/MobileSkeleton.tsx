import { Skeleton } from "../ui/skeleton";
import { cn } from "../../lib/utils";

/** Single list-row skeleton matching the MobileListCard shape. */
export function MobileSkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border bg-card px-4 py-3",
        className,
      )}>
      <Skeleton className='h-10 w-10 shrink-0 rounded-full' />
      <div className='flex-1 space-y-2'>
        <Skeleton className='h-4 w-2/3' />
        <Skeleton className='h-3 w-1/2' />
      </div>
      <Skeleton className='h-4 w-14' />
    </div>
  );
}

/** Stacked list skeleton — standard mobile loading state. */
export function MobileSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-2.5'>
      {Array.from({ length: count }).map((_, i) => (
        <MobileSkeletonCard key={i} />
      ))}
    </div>
  );
}
