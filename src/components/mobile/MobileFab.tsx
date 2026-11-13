import { ReactNode } from "react";
import { motion } from "framer-motion";
import { fabVariants } from "./animations";
import { rippleProps } from "./use-ripple";
import { cn } from "../../lib/utils";

interface MobileFabProps {
  icon: ReactNode;
  label?: string;
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Material 3 FAB. Small (icon-only) by default; pass `label` for the extended
 * pill variant. Entrance uses the shared fabVariants spring.
 */
export function MobileFab({
  icon,
  label,
  onClick,
  className,
  ariaLabel,
}: MobileFabProps) {
  return (
    <motion.button
      variants={fabVariants}
      initial='hidden'
      animate='visible'
      onClick={onClick}
      aria-label={ariaLabel ?? label ?? "Action"}
      className={cn(
        "m3-ripple flex items-center gap-2 rounded-2xl bg-primary text-primary-foreground shadow-[var(--m3-elevation-3)] active:scale-95 transition-transform",
        label ? "h-14 px-5 text-sm font-semibold" : "h-14 w-14 justify-center",
        className,
      )}
      {...rippleProps()}>
      {icon}
      {label && <span>{label}</span>}
    </motion.button>
  );
}
