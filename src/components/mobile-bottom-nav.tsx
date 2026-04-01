import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "../utils/navItem";
import useRoleCheck from "../pages/auth/hooks/useRoleCheck";
import { cn } from "../utils/functions";
import BrandLogo from "../assets/Biponi-lg.png";
import { hasPagePermission } from "../utils/helperFunction";
import { useSelector } from "react-redux";
import { Bell, ChevronDown, ChevronRight, X } from "lucide-react";
import { useNotifications } from "../notification/useNotifications";
import { useState } from "react";

export function MobileBottomNav() {
  const { hasRequiredPermission } = useRoleCheck();
  const navigate = useNavigate();
  const pathName = useLocation().pathname;
  const userState = useSelector((state: any) => state?.user);
  const { unreadCount } = useNotifications();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Filter nav items
  const filteredNavItems = navItems.filter(
    (nav) => nav.active && hasRequiredPermission(nav.id, "view"),
  );

  // Check if notification permission exists
  const hasNotificationPermission = hasPagePermission(
    "notifications",
    "view",
    userState?.permissions,
  );

  // Calculate total items
  const totalItems =
    filteredNavItems.length + (hasNotificationPermission ? 1 : 0);
  const showCenterButton = totalItems >= 4;

  const leftNavItems = showCenterButton
    ? filteredNavItems.slice(0, 2)
    : filteredNavItems;
  const rightNavItems = showCenterButton ? filteredNavItems.slice(2, 4) : [];

  const navigateToRoute = (link: string) => {
    navigate(link);
  };

  const handleCenterButtonClick = () => {
    setIsDrawerOpen(true);
  };

  const toggleSubmenu = (itemId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleNavItemClick = (item: any) => {
    if (item.items && item.items.length > 0) {
      toggleSubmenu(item.id);
    } else {
      navigate(item.link);
      setIsDrawerOpen(false);
    }
  };

  return (
    <>
      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className='fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-200'
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed left-0 right-0 bottom-0 z-[70] bg-gradient-to-b from-gray-900 to-black rounded-t-3xl transform transition-transform duration-300 ease-out max-h-[75vh] overflow-hidden shadow-2xl",
          isDrawerOpen ? "translate-y-0" : "translate-y-full",
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {/* Drawer Handle */}
        <div className='flex justify-center pt-3 pb-2'>
          <div className='w-12 h-1 bg-white/30 rounded-full' />
        </div>

        {/* Drawer Header */}
        <div className='flex items-center justify-between px-5 pb-3 border-b border-white/10'>
          <div className='flex items-center gap-3 bg-white'>
            <img src={BrandLogo} className='h-8 w-auto bg-white' alt='logo' />
            <h3 className='text-black font-semibold text-lg'>Menu</h3>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className='p-2 rounded-full hover:bg-white/10 transition-colors active:scale-90'>
            <X className='h-5 w-5 text-white/80' />
          </button>
        </div>

        {/* Drawer Content - Scrollable */}
        <div className='overflow-y-auto max-h-[calc(75vh-80px)] custom-scrollbar'>
          <nav className='p-4 space-y-1'>
            {filteredNavItems.map((item) => {
              const isActive = pathName.includes(item.link);
              const hasChildren = item.items && item.items.length > 0;
              const isExpanded = expandedMenus.includes(item.id);

              return (
                <div key={item.id}>
                  {/* Main Item */}
                  <button
                    onClick={() => handleNavItemClick(item)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98]",
                      isActive
                        ? "bg-orange-500/20 text-orange-500 shadow-lg shadow-orange-500/10"
                        : "text-white/90 hover:bg-white/5",
                    )}>
                    <div className='flex items-center gap-3'>
                      <div
                        className={cn(
                          "flex items-center justify-center h-9 w-9 rounded-lg transition-all",
                          isActive
                            ? "bg-orange-500/20 text-orange-500"
                            : "bg-white/5 text-white/80",
                        )}>
                        {item.icon}
                      </div>
                      <span className='font-medium text-[15px]'>
                        {item.title}
                      </span>
                    </div>

                    {hasChildren && (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-white/60 transition-transform duration-200",
                          isExpanded && "rotate-180 text-orange-500",
                        )}
                      />
                    )}
                  </button>

                  {/* Nested/Dropdown Items */}
                  {hasChildren && isExpanded && (
                    <div className='ml-6 mt-1 mb-2 space-y-1 border-l-2 border-orange-500/30 pl-3 animate-in slide-in-from-top-2 duration-200'>
                      {item.items.map((child: any) => {
                        const isChildActive = pathName.includes(child.url);
                        return (
                          <button
                            key={child.url}
                            onClick={() => {
                              navigate(child.url);
                              setIsDrawerOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm active:scale-[0.98] group",
                              isChildActive
                                ? "bg-orange-500/15 text-orange-500 shadow-md shadow-orange-500/5"
                                : "text-white/70 hover:bg-white/5 hover:text-white",
                            )}>
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5",
                                isChildActive
                                  ? "text-orange-500"
                                  : "text-white/40",
                              )}
                            />
                            <span className='font-medium flex-1 text-left'>
                              {child.title}
                            </span>
                            {isChildActive && (
                              <div className='w-1.5 h-1.5 bg-orange-500 rounded-full shadow-sm shadow-orange-500/50' />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Notification in Drawer */}
            {/* {hasNotificationPermission && (
              <button
                onClick={() => {
                  navigate("/notifications");
                  setIsDrawerOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98]",
                  pathName.includes("/notifications")
                    ? "bg-orange-500/20 text-orange-500 shadow-lg shadow-orange-500/10"
                    : "text-white/90 hover:bg-white/5",
                )}>
                <div className='flex items-center gap-3'>
                  <div
                    className={cn(
                      "relative flex items-center justify-center h-9 w-9 rounded-lg transition-all",
                      pathName.includes("/notifications")
                        ? "bg-orange-500/20 text-orange-500"
                        : "bg-white/5 text-white/80",
                    )}>
                    <Bell className='h-5 w-5' />
                    {unreadCount > 0 && (
                      <span className='absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-gray-900 shadow-lg'>
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className='font-medium text-[15px]'>Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className='px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full'>
                    {unreadCount}
                  </span>
                )}
              </button>
            )} */}
          </nav>
        </div>
      </div>

      {/* Bottom Navigation Bar - NO MARGIN, FULL WIDTH */}
      <div className='fixed bottom-0 left-0 right-0 z-50 sm:hidden'>
        <div className='relative bg-black shadow-2xl'>
          <nav className='relative flex items-center justify-between px-3 py-2 pb-safe'>
            {/* Left Nav Items */}
            <div
              className={cn(
                "flex items-center gap-0.5",
                showCenterButton ? "flex-1" : "",
              )}>
              {leftNavItems.map((item) => {
                const isActive = pathName.includes(item.link);
                return (
                  <button
                    key={item.link}
                    className={cn(
                      "relative flex flex-col items-center gap-0.5 py-2 px-2 rounded-xl transition-all duration-200 active:scale-90",
                      isActive
                        ? "text-orange-500"
                        : "text-white/70 hover:text-white",
                    )}
                    onClick={() => navigateToRoute(item.link)}
                    style={{ WebkitTapHighlightColor: "transparent" }}>
                    <div
                      className={cn(
                        "relative flex items-center justify-center h-6 w-6 transition-all",
                        isActive && "scale-110",
                      )}>
                      {item.icon}
                    </div>
                    <span
                      className={cn(
                        "text-[9px] font-semibold whitespace-nowrap",
                        isActive ? "text-orange-500" : "text-white/70",
                      )}>
                      {item.title}
                    </span>
                    {isActive && (
                      <div className='absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full shadow-sm shadow-orange-500/50' />
                    )}
                  </button>
                );
              })}

              {/* {!showCenterButton && hasNotificationPermission && (
                <button
                  onClick={() => navigate("/notifications")}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 py-2 px-2 rounded-xl transition-all duration-200 active:scale-90",
                    pathName.includes("/notifications")
                      ? "text-orange-500"
                      : "text-white/70 hover:text-white",
                  )}
                  style={{ WebkitTapHighlightColor: "transparent" }}>
                  <div className='relative flex items-center justify-center h-6 w-6'>
                    <Bell className='h-5 w-5' />
                    {unreadCount > 0 && (
                      <span className='absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full border border-black'>
                        <span className='absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75' />
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-semibold whitespace-nowrap",
                      pathName.includes("/notifications")
                        ? "text-orange-500"
                        : "text-white/70",
                    )}>
                    Alerts
                  </span>
                </button>
              )} */}
            </div>

            {/* Center Floating Button */}
            {showCenterButton && (
              <div className='absolute left-1/2 -translate-x-1/2 -top-6'>
                <button
                  onClick={handleCenterButtonClick}
                  className='group'
                  style={{ WebkitTapHighlightColor: "transparent" }}>
                  <div className='rounded-full bg-black p-[6px] shadow-xl'>
                    <div className='relative h-14 w-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 group-active:scale-95 transition-transform duration-200 shadow-2xl shadow-orange-500/50'>
                      <div className='absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent' />
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <img
                          src={BrandLogo}
                          className='h-7 w-auto drop-shadow-lg'
                          alt='logo'
                        />
                      </div>
                      {/* Subtle pulse effect */}
                      <div className='absolute inset-0 rounded-full bg-orange-400/20 animate-pulse' />
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Right Nav Items */}
            {showCenterButton && (
              <div className='flex items-center gap-0.5 flex-1 justify-end'>
                {rightNavItems.map((item) => {
                  const isActive = pathName.includes(item.link);
                  return (
                    <button
                      key={item.link}
                      className={cn(
                        "relative flex flex-col items-center gap-0.5 py-2 px-2 rounded-xl transition-all duration-200 active:scale-90",
                        isActive
                          ? "text-orange-500"
                          : "text-white/70 hover:text-white",
                      )}
                      onClick={() => navigateToRoute(item.link)}
                      style={{ WebkitTapHighlightColor: "transparent" }}>
                      <div
                        className={cn(
                          "relative flex items-center justify-center h-6 w-6 transition-all",
                          isActive && "scale-110",
                        )}>
                        {item.icon}
                      </div>
                      <span
                        className={cn(
                          "text-[9px] font-semibold whitespace-nowrap",
                          isActive ? "text-orange-500" : "text-white/70",
                        )}>
                        {item.title}
                      </span>
                      {isActive && (
                        <div className='absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full shadow-sm shadow-orange-500/50' />
                      )}
                    </button>
                  );
                })}

                {/* {hasNotificationPermission && (
                  <button
                    onClick={() => navigate("/notifications")}
                    className={cn(
                      "relative flex flex-col items-center gap-0.5 py-2 px-2 rounded-xl transition-all duration-200 active:scale-90",
                      pathName.includes("/notifications")
                        ? "text-orange-500"
                        : "text-white/70 hover:text-white",
                    )}
                    style={{ WebkitTapHighlightColor: "transparent" }}>
                    <div className='relative flex items-center justify-center h-6 w-6'>
                      <Bell className='h-5 w-5' />
                      {unreadCount > 0 && (
                        <span className='absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full border border-black'>
                          <span className='absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75' />
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[9px] font-semibold whitespace-nowrap",
                        pathName.includes("/notifications")
                          ? "text-orange-500"
                          : "text-white/70",
                      )}>
                      Alerts
                    </span>
                  </button>
                )} */}
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .pb-safe {
          padding-bottom: max(env(safe-area-inset-bottom), 0.5rem);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: slide-in-from-top 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
