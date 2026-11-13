import { ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "../../lib/utils";

interface MobileCollapsingHeaderProps {
  /** Large title shown at rest; also fades into the mini bar on scroll */
  title: string;
  subtitle?: ReactNode;
  /** Optional icon chip shown before the compact title in the mini bar */
  icon?: ReactNode;
  /** Right-side icon buttons that stay visible in the mini bar */
  actions?: ReactNode;
  className?: string;
}

/**
 * Android large-title header: a big non-sticky title scrolls away with the
 * content while a sticky mini bar (h-14) fades its title and background in
 * over the first ~90px of window scroll. Desktop-safe (hidden ≥768px).
 */
export function MobileCollapsingHeader({
  title,
  subtitle,
  icon,
  actions,
  className,
}: MobileCollapsingHeaderProps) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [24, 88], [0, 1]);

  return (
    <div className={cn("mobile:block hidden", className)}>
      {/* Compact bar — always present, content fades in as the title scrolls */}
      <header className='sticky top-0 z-20 h-14'>
        <motion.div
          style={{ opacity }}
          className='absolute inset-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
        />
        <div className='relative flex h-full items-center gap-2 px-4'>
          {icon && (
            <div className='h-8 w-8 shrink-0 rounded-xl bg-primary/10 grid place-items-center'>
              {icon}
            </div>
          )}
          <motion.h1
            style={{ opacity }}
            className='truncate text-base font-semibold leading-tight'>
            {title}
          </motion.h1>
          {actions && (
            <div className='ml-auto flex items-center gap-1'>{actions}</div>
          )}
        </div>
      </header>

      {/* Large title — scrolls away with the content */}
      <div className='px-4 pb-1'>
        <h2 className='text-[28px] font-bold leading-tight tracking-tight'>
          {title}
        </h2>
        {subtitle && (
          <p className='mt-1 text-[13px] text-muted-foreground'>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
