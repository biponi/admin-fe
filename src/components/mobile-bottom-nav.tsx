import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "../utils/navItem";
import useRoleCheck from "../pages/auth/hooks/useRoleCheck";
import { cn } from "../utils/functions";
import BrandLogo from "../assets/Biponi-lg.png";
import MobileDrawerNav from "./MobileDrawerNav";
import { hasPagePermission } from "../utils/helperFunction";
import { useSelector } from "react-redux";
import { Bell } from "lucide-react";
import { useNotifications } from "../notification/useNotifications";

export function MobileBottomNav() {
  const { hasRequiredPermission } = useRoleCheck();
  const navigate = useNavigate();
  const pathName = useLocation().pathname;
  const userState = useSelector((state: any) => state?.user);
  const { unreadCount } = useNotifications();

  // Filter nav items
  const filteredNavItems = navItems.filter(
    (nav) => nav.active && hasRequiredPermission(nav.id, "view")
  );

  // Check if notification permission exists
  const hasNotificationPermission = hasPagePermission(
    "notifications",
    "view",
    userState?.permissions
  );

  // Calculate total items (nav items + notification if available)
  const totalItems =
    filteredNavItems.length + (hasNotificationPermission ? 1 : 0);

  // If total items < 6, show all items on left and floating button on right
  // Otherwise, split: 3 left, center button, 2-3 right
  const showCenterButton = totalItems >= 6;

  const leftNavItems = showCenterButton
    ? filteredNavItems.slice(0, 3)
    : filteredNavItems;
  const rightNavItems = showCenterButton ? filteredNavItems.slice(3, 5) : [];

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
      {/* Navigation Container */}
      <div className='relative mx-2 mb-1'>
        {/* Main nav bar with black background and SVG cutout */}
        <div
          className='relative bg-black shadow-2xl'
          style={{
            borderRadius: "24px",
            clipPath: "url(#notch-clip)",
          }}>
          <nav className='relative flex items-center justify-between px-6 py-3'>
            {/* Left Nav Items */}
            <div
              className={cn(
                "flex items-center gap-2",
                showCenterButton ? "flex-1" : ""
              )}>
              {leftNavItems.map((item) => {
                const isActive = pathName.includes(item.link);
                return (
                  <button
                    key={item.link}
                    className={cn(
                      "relative flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all duration-300 active:scale-90",
                      isActive
                        ? "text-orange-500"
                        : "text-white/80 hover:text-white"
                    )}
                    onClick={() => navigateToRoute(item.link)}
                    style={{ WebkitTapHighlightColor: "transparent" }}>
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
                        isActive ? "text-orange-500" : "text-white/80"
                      )}>
                      {item.title}
                    </span>

                    {/* Active indicator dot */}
                    {isActive && (
                      <div className='absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50' />
                    )}
                  </button>
                );
              })}

              {/* Notification Bell - show on left when items < 6 */}
              {!showCenterButton && hasNotificationPermission && (
                <button
                  onClick={() => navigate("/notifications")}
                  className={cn(
                    "relative flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all duration-300 active:scale-90",
                    pathName.includes("/notifications")
                      ? "text-orange-500"
                      : "text-white/80 hover:text-white"
                  )}
                  style={{ WebkitTapHighlightColor: "transparent" }}>
                  <div className='relative flex items-center justify-center h-6 w-6'>
                    <Bell className='h-5 w-5' />

                    {/* Notification dot with ping effect */}
                    {unreadCount > 0 && (
                      <span className='absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full border border-black'>
                        <span className='absolute inset-0 bg-red-500 rounded-full animate-ping' />
                      </span>
                    )}
                  </div>

                  <span
                    className={cn(
                      "text-[9px] font-semibold leading-tight transition-all duration-200",
                      pathName.includes("/notifications")
                        ? "text-orange-500"
                        : "text-white/80"
                    )}>
                    Alerts
                  </span>

                  {/* Active indicator dot */}
                  {pathName.includes("/notifications") && (
                    <div className='absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50' />
                  )}
                </button>
              )}
            </div>

            {/* Center Floating Button Placeholder - only when items >= 6 */}
            {showCenterButton && <div className='w-14' />}

            {/* Right Nav Items - only when items >= 6 */}
            {showCenterButton && (
              <div className='flex items-center gap-2 flex-1 justify-end'>
                {rightNavItems.map((item) => {
                  const isActive = pathName.includes(item.link);
                  return (
                    <button
                      key={item.link}
                      className={cn(
                        "relative flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all duration-300 active:scale-90",
                        isActive
                          ? "text-orange-500"
                          : "text-white/80 hover:text-white"
                      )}
                      onClick={() => navigateToRoute(item.link)}
                      style={{ WebkitTapHighlightColor: "transparent" }}>
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
                          isActive ? "text-orange-500" : "text-white/80"
                        )}>
                        {item.title}
                      </span>

                      {/* Active indicator dot */}
                      {isActive && (
                        <div className='absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50' />
                      )}
                    </button>
                  );
                })}

                {/* Notification Bell - show on right when items >= 6 */}
                {hasNotificationPermission && (
                  <button
                    onClick={() => navigate("/notifications")}
                    className={cn(
                      "relative flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all duration-300 active:scale-90",
                      pathName.includes("/notifications")
                        ? "text-orange-500"
                        : "text-white/80 hover:text-white"
                    )}
                    style={{ WebkitTapHighlightColor: "transparent" }}>
                    <div className='relative flex items-center justify-center h-6 w-6'>
                      <Bell className='h-5 w-5' />

                      {/* Notification dot with ping effect */}
                      {unreadCount > 0 && (
                        <span className='absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full border border-black'>
                          <span className='absolute inset-0 bg-red-500 rounded-full animate-ping' />
                        </span>
                      )}
                    </div>

                    <span
                      className={cn(
                        "text-[9px] font-semibold leading-tight transition-all duration-200",
                        pathName.includes("/notifications")
                          ? "text-orange-500"
                          : "text-white/80"
                      )}>
                      Alerts
                    </span>

                    {/* Active indicator dot */}
                    {pathName.includes("/notifications") && (
                      <div className='absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50' />
                    )}
                  </button>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* Floating Center Button - only when items >= 6 */}

        <MobileDrawerNav>
          <button
            onClick={handleCenterButtonClick}
            className={`absolute ${
              showCenterButton ? "left-1/2 " : "right-[5%]"
            } -top-8 -translate-x-1/2 group z-10`}
            style={{ WebkitTapHighlightColor: "transparent" }}>
            {/* Outer black ring that creates the "cut" effect */}
            <div className='rounded-full bg-black p-[10px]'>
              {/* Button container */}
              <div className='relative h-[60px] w-[60px] rounded-full bg-orange-500 group-active:scale-95 transition-all duration-200 shadow-2xl'>
                {/* Glass overlay for depth */}
                <div className='absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-white/10 to-transparent' />

                {/* Icon/Logo container */}
                <div className='absolute inset-0 flex items-center justify-center'>
                  <img src={BrandLogo} className='h-8 w-auto' alt='main-logo' />
                </div>

                {/* Bottom highlight for 3D effect */}
                <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-1 bg-white/20 rounded-full blur-sm' />
              </div>
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
