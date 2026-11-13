import { ReactNode } from "react";
import { motion } from "framer-motion";
import { listItem } from "./animations";
import { rippleProps } from "./use-ripple";
import { cn } from "../../lib/utils";

interface MobileListCardProps {
  onClick?: () => void;
  /** Leading visual: avatar, icon, thumbnail */
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right-side meta: amount, chevron, badge */
  trailing?: ReactNode;
  badge?: ReactNode;
  danger?: boolean;
  className?: string;
  /** Disable stagger entrance when used outside a MobileStaggeredList */
  static?: boolean;
  children?: ReactNode;
}

/**
 * Material outlined list item card — the standard row for every mobile list.
 * Wrap in MobileStaggeredList for the staggered entrance.
 */
export function MobileListCard({
  onClick,
  leading,
  title,
  subtitle,
  trailing,
  badge,
  danger,
  className,
  static: isStatic,
  children,
}: MobileListCardProps) {
  const Comp: any = onClick ? "button" : "div";
  return (
    <motion.div variants={isStatic ? undefined : listItem}>
      <Comp
        onClick={onClick}
        className={cn(
          "m3-ripple relative overflow-hidden w-full flex items-start gap-3 rounded-2xl border bg-card px-4 py-3 text-left",
          onClick && "active:bg-muted/60 transition-colors",
          danger && "border-destructive/30",
          className,
        )}
        {...(onClick ? rippleProps() : {})}>
        {leading && <div className='shrink-0 pt-0.5'>{leading}</div>}
        <div className='min-w-0 flex-1'>
          <div
            className={cn(
              "font-medium leading-snug truncate",
              danger ? "text-destructive" : "text-foreground",
            )}>
            {title}
          </div>
          {subtitle && (
            <div className='mt-0.5 text-[13px] text-muted-foreground line-clamp-2'>
              {subtitle}
            </div>
          )}
          {children}
        </div>
        {(trailing || badge) && (
          <div className='shrink-0 flex flex-col items-end gap-1.5'>
            {badge}
            {trailing}
          </div>
        )}
      </Comp>
    </motion.div>
  );
}
