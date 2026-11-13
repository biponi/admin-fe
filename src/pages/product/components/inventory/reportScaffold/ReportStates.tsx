/**
 * Shared loading / error / empty states for report bodies.
 */
import type { ReactNode } from "react";
import { AlertCircle, RefreshCw, Inbox } from "lucide-react";
import { Skeleton } from "../../../../../components/ui/skeleton";
import { Button } from "../../../../../components/ui/button";
import { claude } from "../../../../../lib/claude";
import { cn } from "../../../../../lib/utils";

export const ReportSkeletonRows = ({ rows = 6 }: { rows?: number }) => (
  <div className='space-y-2 py-2'>
    <Skeleton className='h-9 w-full rounded-md bg-[#F5F1EA]' />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className='h-11 w-full rounded-md bg-[#FAF9F6]' />
    ))}
  </div>
);

export const ReportErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className='flex flex-col items-center justify-center py-16 text-center px-6'>
    <div className='w-10 h-10 rounded-xl bg-[#FBEFF3] flex items-center justify-center mb-3'>
      <AlertCircle className='h-5 w-5 text-[#B3365B]' />
    </div>
    <h3 className={cn(claude.title, "mb-1")}>Failed to load report</h3>
    <p className='text-xs text-[#8A877D] mb-4 max-w-xs'>{message}</p>
    <Button variant='outline' size='sm' onClick={onRetry} className={claude.btnOutline}>
      <RefreshCw className='h-3.5 w-3.5 mr-1.5' />
      Try again
    </Button>
  </div>
);

export const ReportEmptyState = ({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
}) => (
  <div className='flex flex-col items-center justify-center py-16 text-center px-6'>
    <div className='w-10 h-10 rounded-xl bg-[#F5F1EA] flex items-center justify-center mb-3 text-[#8A877D]'>
      {icon ?? <Inbox className='h-5 w-5' />}
    </div>
    <h3 className={cn(claude.title, "mb-1")}>{title}</h3>
    <p className='text-xs text-[#8A877D] max-w-xs'>{description}</p>
  </div>
);
