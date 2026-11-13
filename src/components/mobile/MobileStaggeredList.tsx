import { ReactNode } from "react";
import { motion } from "framer-motion";
import { listContainer } from "./animations";
import { cn } from "../../lib/utils";

interface MobileStaggeredListProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper that staggers its MobileListCard children on mount. Key it on the
 * data array identity (not per-keystroke) so low-end Androids don't re-run
 * the animation on every filter keystroke.
 */
export function MobileStaggeredList({
  children,
  className,
}: MobileStaggeredListProps) {
  return (
    <motion.div
      variants={listContainer}
      initial='hidden'
      animate='visible'
      className={cn("flex flex-col gap-2.5", className)}>
      {children}
    </motion.div>
  );
}
