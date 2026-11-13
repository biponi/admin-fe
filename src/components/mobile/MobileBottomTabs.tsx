import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { navItems } from "../../utils/navItem";
import useRoleCheck from "../../pages/auth/hooks/useRoleCheck";
import { rippleProps } from "./use-ripple";
import { cn } from "../../lib/utils";

/**
 * Curated top-level destinations for the Material bottom navigation bar.
 * Each entry maps to a navItems id so permission filtering stays in sync with
 * the sidebar. "More" is always last and opens the full menu (MobileSheetNav).
 */
const TAB_IDS = ["dashboard", "order", "product"] as const;

interface MobileBottomTabsProps {
  onMore: () => void;
  /** Rendered on pages that draw their own bottom bar (productList, order-v2) */
  hidden?: boolean;
}

export function MobileBottomTabs({ onMore, hidden }: MobileBottomTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRequiredPermission } = useRoleCheck();

  // Pages that draw their own full-screen mobile bottom bar (product list,
  // order list, create order) must not get the global tab bar underneath.
  const pathname = location.pathname;
  const pageHasOwnBottomBar =
    pathname === "/products" || pathname === "/order" || pathname.startsWith("/order/create");
  if (hidden || pageHasOwnBottomBar) return null;

  const tabs = TAB_IDS.map((id) =>
    navItems.find((item) => item.id === id),
  ).filter(
    (item): item is (typeof navItems)[number] =>
      !!item && hasRequiredPermission(item.id, "view"),
  );

  const isActive = (link: string) =>
    location.pathname === link || location.pathname.startsWith(`${link}/`);

  return (
    <nav
      aria-label='Primary'
      className='fixed inset-x-0 bottom-0 z-30 md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-safe'>
      <div className='grid grid-flow-col auto-cols-fr h-16'>
        {tabs.map((tab) => {
          const active = isActive(tab.link);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.link)}
              className={cn(
                "m3-ripple flex flex-col items-center justify-center gap-1 outline-none",
                active ? "text-primary" : "text-muted-foreground",
              )}
              {...rippleProps()}>
              {active && (
                <motion.span
                  layoutId='m3-active-pill'
                  className='absolute h-8 w-16 rounded-full bg-primary/12'
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className='relative'>{tab.icon}</span>
              <span className='relative text-[11px] font-medium leading-none'>
                {tab.title}
              </span>
            </button>
          );
        })}

        {/* More — opens the full menu sheet */}
        <button
          onClick={onMore}
          className={cn(
            "m3-ripple relative flex flex-col items-center justify-center gap-1 outline-none",
            "text-muted-foreground",
          )}
          {...rippleProps()}>
          <MoreHorizontal className='h-5 w-5' />
          <span className='text-[11px] font-medium leading-none'>More</span>
        </button>
      </div>
    </nav>
  );
}
