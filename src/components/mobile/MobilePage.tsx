import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { rippleProps } from "./use-ripple";
import { cn } from "../../lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobilePageProps {
  /** Sub-app-bar title (below the global topbar). Omit when the page draws its own header. */
  title?: string;
  /** Optional icon chip rendered before the title */
  icon?: ReactNode;
  /** Optional one-line subtitle under the title */
  subtitle?: string;
  /** Show a back arrow; defaults to router back() */
  back?: boolean;
  onBack?: () => void;
  /** Right-side icon buttons for the sub-app-bar */
  actions?: ReactNode;
  /** Material FAB, rendered bottom-right above the tab bar */
  fab?: ReactNode;
  /** Sticky bottom action bar (forms, detail pages) */
  stickyActions?: ReactNode;
  /**
   * Pages that draw their own bottom bar (productList, order-v2) must set
   * this to avoid double bottom padding + double tab bar.
   */
  noBottomNav?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Material page shell for mobile. Gated to <768px via `mobile:` — on desktop
 * it renders children untouched, so pages wrap their whole tree and only the
 * mobile presentation changes.
 */
export function MobilePage({
  title,
  icon,
  subtitle,
  back,
  onBack,
  actions,
  fab,
  stickyActions,
  noBottomNav,
  className,
  children,
}: MobilePageProps) {
  const navigate = useNavigate();
  const mobileOnly = "mobile:block hidden md:hidden";
  const handleBack = onBack ?? (() => navigate(-1));

  const isMobile = useIsMobile();

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className={cn("contents", className)}>
      {/* Sub app bar */}
      {(title || back) && (
        <header
          className={cn(
            mobileOnly,
            "sticky top-0 z-20  !flex py-4 justify-center items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2",
          )}>
          {back && (
            <button
              onClick={handleBack}
              aria-label='Back'
              className='m3-ripple h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary active:scale-95 transition-transform grid place-items-center'
              {...rippleProps()}>
              <ArrowLeft className='h-5 w-5' />
            </button>
          )}
          {icon && (
            <div className='h-9 w-9 shrink-0 rounded-xl bg-primary/10 grid place-items-center'>
              {icon}
            </div>
          )}
          {title && (
            <div className='flex-1 min-w-0 pl-1'>
              <h1 className='truncate text-base font-semibold leading-tight'>
                {title}
              </h1>
              {subtitle && (
                <p className='truncate text-[11px] text-muted-foreground mt-0.5'>
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {actions && <div className='flex items-center gap-1'>{actions}</div>}
        </header>
      )}

      {children}

      {/* FAB — bottom-right, above tab bar + safe area */}
      {fab && (
        <div
          className={cn(
            mobileOnly,
            "fixed right-4 bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] z-30",
          )}>
          {fab}
        </div>
      )}

      {/* Sticky action bar */}
      {stickyActions && (
        <div
          className={cn(
            mobileOnly,
            "sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]",
          )}>
          {stickyActions}
        </div>
      )}

      {/* Space for the global bottom tab bar when the page doesn't draw one */}
      {!noBottomNav && (
        <div
          className={cn(
            mobileOnly,
            "h-[calc(4rem+env(safe-area-inset-bottom))]",
          )}
        />
      )}
    </div>
  );
}
