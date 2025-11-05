import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "../utils/navItem";
import useRoleCheck from "../pages/auth/hooks/useRoleCheck";
import { cn } from "../utils/functions";
import { Menu } from "lucide-react";
import MobileDrawerNav from "./MobileDrawerNav";

export function MobileBottomNav() {
  const { hasRequiredPermission } = useRoleCheck();
  const navigate = useNavigate();
  const pathName = useLocation().pathname;

  // Filter and split nav items: 2 left, 2 right (total 4)
  const filteredNavItems = navItems
    .filter((nav) => nav.active && hasRequiredPermission(nav.id, "view"))
    .slice(0, 4);

  const leftNavItems = filteredNavItems.slice(0, 2);
  const rightNavItems = filteredNavItems.slice(2, 4);

  const navigateToRoute = (link: string) => {
    navigate(link);
  };

  // Separate function for center button action
  const handleCenterButtonClick = () => {
    // Add your center button action here
    console.log("Center button clicked");
  };

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 sm:hidden pb-safe'>
      {/* Glassmorphic Navigation Container */}
      <div className='relative mx-2 mb-1'>
        {/* Glow effect behind nav */}
        <div className='absolute inset-0 bg-gradient-to-t from-primary/20 via-primary/10 to-transparent blur-2xl -z-10' />

        {/* Main nav bar with glassmorphism */}
        <div className='relative backdrop-blur-sm bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden'>
          {/* Gradient overlay for depth */}
          <div className='absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none' />

          {/* Shimmer effect */}
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none' />

          <nav className='relative flex items-center justify-between px-6 py-3'>
            {/* Left Nav Items */}
            <div className='flex items-center gap-2 flex-1'>
              {leftNavItems.map((item) => {
                const isActive = pathName.includes(item.link);
                return (
                  <button
                    key={item.link}
                    className={cn(
                      "relative flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all duration-300 active:scale-90",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground/80 hover:text-foreground active:bg-white/10"
                    )}
                    onClick={() => navigateToRoute(item.link)}
                    style={{ WebkitTapHighlightColor: "transparent" }}>
                    {/* Active background glow */}
                    {isActive && (
                      <div className='absolute inset-0 bg-primary/20 rounded-2xl blur-md' />
                    )}

                    <div
                      className={cn(
                        "relative flex items-center justify-center h-6 w-6 transition-all duration-300",
                        isActive && "scale-110"
                      )}>
                      {item.icon}
                    </div>

                    <span
                      className={cn(
                        "text-[9px] font-semibold leading-tight transition-all duration-200",
                        isActive ? "text-primary opacity-100" : "opacity-70"
                      )}>
                      {item.title}
                    </span>

                    {/* Active indicator dot */}
                    {isActive && (
                      <div className='absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-lg shadow-primary/50' />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Center Floating Button Placeholder */}
            <div className='w-14' />

            {/* Right Nav Items */}
            <div className='flex items-center gap-2 flex-1 justify-end'>
              {rightNavItems.map((item) => {
                const isActive = pathName.includes(item.link);
                return (
                  <button
                    key={item.link}
                    className={cn(
                      "relative flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all duration-300 active:scale-90",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground/80 hover:text-foreground active:bg-white/10"
                    )}
                    onClick={() => navigateToRoute(item.link)}
                    style={{ WebkitTapHighlightColor: "transparent" }}>
                    {isActive && (
                      <div className='absolute inset-0 bg-primary/20 rounded-2xl blur-md' />
                    )}

                    <div
                      className={cn(
                        "relative flex items-center justify-center h-6 w-6 transition-all duration-300",
                        isActive && "scale-110"
                      )}>
                      {item.icon}
                    </div>

                    <span
                      className={cn(
                        "text-[9px] font-semibold leading-tight transition-all duration-200",
                        isActive ? "text-primary opacity-100" : "opacity-70"
                      )}>
                      {item.title}
                    </span>

                    {isActive && (
                      <div className='absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-lg shadow-primary/50' />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Floating Center Button */}
        <MobileDrawerNav>
          <button
            onClick={handleCenterButtonClick}
            className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group shadow-md rounded-full '
            style={{ WebkitTapHighlightColor: "transparent" }}>
            {/* Outer glow ring */}

            {/* Button container */}
            <div className='relative h-14 w-14 rounded-full bg-gradient-to-br  shadow-md shadow-gray-500 group-active:scale-90 transition-transform duration-200'>
              {/* Glass overlay */}
              <div className='absolute inset-0 rounded-full bg-gradient-to-b from-gray-900 to-gray-900 shadow-lg' />

              {/* Inner shadow for depth */}
              <div className='absolute inset-0 rounded-full shadow-inner' />

              {/* Icon container */}
              <div className='absolute inset-0 flex items-center justify-center text-white'>
                <Menu className='w-5 h-5 font-bold' />
              </div>

              {/* Pulse animation ring */}
              {/* <div
              className='absolute inset-0 rounded-full border-2 border-white/30 animate-ping'
              style={{ animationDuration: "2s" }}
            /> */}
            </div>
          </button>
        </MobileDrawerNav>
      </div>

      {/* Add shimmer animation */}
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(200%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        @supports (padding: max(0px)) {
          .pb-safe {
            padding-bottom: max(env(safe-area-inset-bottom), 0.5rem);
          }
        }
      `}</style>
    </div>
  );
}
