import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface MobileStickyActionsProps {
  children: ReactNode;
  /** Set when the page has no global bottom tab bar beneath it */
  className?: string;
}

/**
 * Standalone sticky bottom action bar for mobile (safe-area aware). Prefer
 * MobilePage's `stickyActions` prop when already using the shell.
 */
export function MobileStickyActions({
  children,
  className,
}: MobileStickyActionsProps) {
  return (
    <div
      className={cn(
        "mobile:block hidden sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]",
        className,
      )}>
      {children}
    </div>
  );
}
