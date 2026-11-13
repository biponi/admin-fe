import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface MobileEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Material empty state — icon in a tinted circle, title, optional action. */
export function MobileEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: MobileEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-8 py-14 text-center",
        className,
      )}>
      {icon && (
        <div className='grid h-16 w-16 place-items-center rounded-full bg-muted text-muted-foreground'>
          {icon}
        </div>
      )}
      <div>
        <p className='text-[15px] font-semibold'>{title}</p>
        {description && (
          <p className='mt-1 text-[13px] text-muted-foreground'>{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
