import React, { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { useNotifications } from "./useNotifications";
import NotificationPanel from "./NotificationPanel";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

interface NotificationBellProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "default" | "outline";
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  className = "",
  size = "sm",
  variant = "ghost",
}) => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const iconSize =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <div className={`relative z-[9999] ${className}`}>
      {/* Bell Icon */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant={variant}
        className={`relative ${size}`}
        aria-label='Notifications'>
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
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default NotificationBell;
