import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, BellRing } from "lucide-react";
import { useNotifications } from "./useNotifications";
import NotificationPanel from "./NotificationPanel";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";

interface NotificationBellProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "default" | "outline";
  asChild?: boolean; // Render just the icon without button wrapper
}

const BUTTON_SIZES: Record<
  NonNullable<NotificationBellProps["size"]>,
  string
> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

const NotificationBell: React.FC<NotificationBellProps> = ({
  className = "",
  size = "sm",
  variant = "ghost",
  asChild = false,
}) => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  // Fixed position for the portaled panel, anchored below the bell
  const [panelPos, setPanelPos] = useState<{ top: number; right: number }>(
    () => ({ top: 64, right: 16 }),
  );

  const iconSize =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  const togglePanel = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setPanelPos({
        top: rect.bottom + 8,
        right: Math.max(window.innerWidth - rect.right, 8),
      });
    }
    setIsOpen((open) => !open);
  };

  const bellIcon = (
    <>
      {unreadCount > 0 ? (
        <BellRing className={iconSize} />
      ) : (
        <Bell className={iconSize} />
      )}

      {/* Badge */}
      {unreadCount > 0 && (
        <Badge
          variant='destructive'
          className='absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs'>
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </>
  );

  // If asChild is true, render just the icon without button wrapper
  if (asChild) {
    return (
      <div className={`relative z-[9999] ${className}`}>
        {bellIcon}

        {/* Notification Panel */}
        {isOpen && (
          <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
        )}
      </div>
    );
  }

  return (
    <>
      <div ref={triggerRef} className={cn("relative", className)}>
        {/* Bell Icon */}
        <Button
          onClick={togglePanel}
          variant={variant}
          className={cn(
            "relative bg-transparent  hover:text-gray-500 hover:bg-white/20",
            BUTTON_SIZES[size],
          )}
          aria-label='Notifications'>
          {bellIcon}
        </Button>
      </div>

      {/* Notification Panel — portaled to body so the top bar's
          overflow-hidden / height can't clip it */}
      {isOpen &&
        createPortal(
          <NotificationPanel
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            fixedPosition={panelPos}
          />,
          document.body,
        )}
    </>
  );
};

export default NotificationBell;
