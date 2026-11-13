import { ReactNode } from "react";
import { ListFilter } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { rippleProps } from "./use-ripple";
import { cn } from "../../lib/utils";

interface MobileFilterTriggerProps {
  onClick: () => void;
  activeCount?: number;
  className?: string;
}

/** Funnel button with an active-filter count badge; sits in the mobile toolbar. */
export function MobileFilterTrigger({
  onClick,
  activeCount = 0,
  className,
}: MobileFilterTriggerProps) {
  return (
    <button
      onClick={onClick}
      aria-label='Filters'
      className={cn(
        "m3-ripple relative h-10 w-10 rounded-full border bg-card grid place-items-center text-muted-foreground",
        activeCount > 0 && "border-primary/40 text-primary",
        className,
      )}
      {...rippleProps()}>
      <ListFilter className='h-4.5 w-4.5' />
      {activeCount > 0 && (
        <Badge
          variant='default'
          className='absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 p-0 text-[10px] font-bold rounded-full'>
          {activeCount}
        </Badge>
      )}
    </button>
  );
}

interface MobileFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  /** Filter controls (chips, selects, etc.) */
  children: ReactNode;
  onApply: () => void;
  onReset?: () => void;
}

/**
 * Material bottom sheet for filters. Body scrolls with contained
 * overscroll; Apply/Reset sit in a safe-area footer.
 */
export function MobileFilterSheet({
  open,
  onOpenChange,
  title = "Filters",
  children,
  onApply,
  onReset,
}: MobileFilterSheetProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='rounded-t-[28px] max-h-[85vh]'>
        <DrawerHeader className='text-center sm:text-center pb-2'>
          <DrawerTitle className='text-base font-semibold'>{title}</DrawerTitle>
        </DrawerHeader>
        <div className='m3-sheet-body flex-1 overflow-y-auto px-4 pb-2'>
          {children}
        </div>
        <DrawerFooter className='flex-row gap-2 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))]'>
          {onReset && (
            <Button
              variant='outline'
              className='flex-1 rounded-full'
              onClick={onReset}>
              Reset
            </Button>
          )}
          <Button
            className='flex-1 rounded-full'
            onClick={() => {
              onApply();
              onOpenChange(false);
            }}>
            Apply
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
