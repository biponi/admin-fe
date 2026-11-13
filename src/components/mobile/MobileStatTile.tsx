import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface MobileStatTileProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  /** Optional accent for the icon chip background, e.g. "bg-blue-100 text-blue-700" */
  tone?: string;
  className?: string;
}

/** Single Material stat chip. */
export function MobileStatTile({
  label,
  value,
  icon,
  tone = "bg-primary/10 text-primary",
  className,
}: MobileStatTileProps) {
  return (
    <div
      className={cn(
        "flex min-w-[7.5rem] flex-col gap-1.5 rounded-2xl border bg-card px-4 py-3",
        className,
      )}>
      <div className='flex items-center justify-between'>
        <span className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
          {label}
        </span>
        {icon && (
          <span
            className={cn("grid h-7 w-7 place-items-center rounded-full", tone)}>
            {icon}
          </span>
        )}
      </div>
      <span className='text-lg font-semibold leading-none'>{value}</span>
    </div>
  );
}

interface MobileStatRowProps {
  children: ReactNode;
  className?: string;
}

/** Horizontally scrollable stat row — standard for the top of mobile pages. */
export function MobileStatRow({ children, className }: MobileStatRowProps) {
  return (
    <div
      className={cn(
        "mobile:flex hidden gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}>
      {children}
    </div>
  );
}
