import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { rippleProps } from "./use-ripple";
import { cn } from "../../lib/utils";

interface MobilePaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

/** Material pagination bar — prev / page x of y / next, tap targets ≥40px. */
export function MobilePagination({
  page,
  totalPages,
  onChange,
  className,
}: MobilePaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 py-3",
        className,
      )}>
      <Button
        variant='outline'
        size='icon'
        className='m3-ripple rounded-full'
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label='Previous page'
        {...rippleProps()}>
        <ChevronLeft className='h-4 w-4' />
      </Button>
      <span className='text-[13px] font-medium text-muted-foreground'>
        Page {page} of {totalPages}
      </span>
      <Button
        variant='outline'
        size='icon'
        className='m3-ripple rounded-full'
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label='Next page'
        {...rippleProps()}>
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  );
}
