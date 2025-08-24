import { PanelLeft } from "lucide-react";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "./ui/drawer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import { navItems } from "../utils/navItem";
import { BiponiMainLogo } from "../utils/contents";
import { useLocation, useNavigate } from "react-router-dom";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";
import useRoleCheck from "../pages/auth/hooks/useRoleCheck";
import { usePageTitle } from "../contexts/PageContext";
import { CircleUserRound, LogOut, Bell, BellRing } from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { format } from "date-fns";
import { hasPagePermission } from "../utils/helperFunction";
import { useSelector } from "react-redux";

interface SiteHeaderProps {
  title?: string;
}

export function SiteHeader({ title }: SiteHeaderProps) {
  const { signOut } = useLoginAuth();
  const { hasRequiredPermission } = useRoleCheck();
  const { pageTitle } = usePageTitle();
  const navigate = useNavigate();
  const pathName = useLocation().pathname;
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const userState = useSelector((state: any) => state?.user);

  const navigateToRoute = (link: string) => {
    navigate(link);
  };

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = pathName
      .split("/")
      .filter((segment) => segment !== "");
    const breadcrumbs = [];

    if (pathSegments.length === 0 || pathName === "/dashboard") {
      return [{ title: "Dashboard", href: "/dashboard" }];
    }

    // Find matching nav item
    const currentNavItem = navItems.find((item) =>
      pathName.includes(item.link)
    );
    if (currentNavItem) {
      breadcrumbs.push({ title: "Dashboard", href: "/dashboard" });
      breadcrumbs.push({
        title: currentNavItem.title,
        href: currentNavItem.link,
      });

      // Add custom title if provided (from context or props)
      // const currentTitle = title || pageTitle;
      // if (currentTitle && currentTitle !== currentNavItem.title && currentTitle !== 'Dashboard') {
      //   breadcrumbs.push({ title: currentTitle, href: pathName });
      // }
    } else {
      breadcrumbs.push({ title: "Dashboard", href: "/dashboard" });
      const currentTitle = title || pageTitle;
      if (currentTitle && currentTitle !== "Dashboard") {
        breadcrumbs.push({ title: currentTitle, href: pathName });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    // Navigate to relevant page based on notification type
    if (notification.relatedData?.ticketId) {
      navigate(`/chat?ticket=${notification.relatedData.ticketId}`);
    }
  };

  // Format notification time
  const formatNotificationTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return format(date, "HH:mm");
    } else {
      return format(date, "MMM dd, HH:mm");
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_ticket":
        return "🎫";
      case "new_message":
        return "💬";
      case "ticket_assigned":
        return "👤";
      case "ticket_transferred":
        return "↔️";
      case "agent_requested":
        return "🆘";
      default:
        return "📢";
    }
  };

  return (
    <>
      {/* Desktop Header */}
      <header className='hidden sm:flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
        <div className='flex items-center gap-2 px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.href} className='flex items-center gap-2'>
                  {index > 0 && (
                    <BreadcrumbSeparator className='hidden md:block' />
                  )}
                  <BreadcrumbItem className='hidden md:block'>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={breadcrumb.href}>
                        {breadcrumb.title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Notification Button */}
        {hasPagePermission("chat", "view", userState?.permissions) && (
          <div className='flex items-center gap-2 px-4 ml-auto'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' className='relative'>
                  {unreadCount > 0 ? (
                    <BellRing className='h-4 w-4' />
                  ) : (
                    <Bell className='h-4 w-4' />
                  )}
                  {unreadCount > 0 && (
                    <Badge
                      variant='destructive'
                      className='absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs'>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-80' align='end'>
                <DropdownMenuLabel className='flex items-center justify-between'>
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={markAllAsRead}
                      className='text-xs h-6 px-2'>
                      Mark all read
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                  <div className='p-4 text-center text-sm text-gray-500'>
                    No notifications
                  </div>
                ) : (
                  <div className='max-h-80 overflow-y-auto'>
                    {notifications.slice(0, 10).map((notification) => (
                      <DropdownMenuItem
                        key={notification._id}
                        className={`p-3 cursor-pointer ${
                          !notification.read
                            ? "bg-blue-50 border-l-2 border-l-blue-500"
                            : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}>
                        <div className='flex items-start gap-3 w-full'>
                          <div className='text-lg'>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className='flex-1 space-y-1'>
                            <div className='flex items-center justify-between'>
                              <p className='text-sm font-medium leading-none'>
                                {notification.title}
                              </p>
                              <span className='text-xs text-gray-500'>
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                            </div>
                            <p className='text-xs text-gray-600 line-clamp-2'>
                              {notification.message}
                            </p>
                            {notification.priority === "urgent" && (
                              <Badge variant='destructive' className='text-xs'>
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}

                    {notifications.length > 10 && (
                      <DropdownMenuItem
                        className='text-center text-sm text-blue-600'
                        onClick={() => navigate("/notifications")}>
                        View all notifications
                      </DropdownMenuItem>
                    )}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </header>

      {/* Mobile Header */}
      <header className='sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:hidden'>
        <Drawer>
          <DrawerTrigger asChild>
            <Button size='icon' variant='outline'>
              <PanelLeft className='h-5 w-5' />
              <span className='sr-only'>Toggle Menu</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <div className='border-b p-2 flex justify-center items-center gap-1'>
                <Button variant='outline' size='icon' aria-label='Home'>
                  <img
                    src={BiponiMainLogo}
                    className='size-5'
                    alt='main-logo'
                  />
                </Button>
                <span className='text-base font-semibold text-gray-700'>
                  Prior Admin
                </span>
              </div>
            </DrawerHeader>
            <nav className='grid grid-cols-2 gap-6 p-4 text-lg font-medium mb-4'>
              {navItems
                .filter(
                  (nav) => nav.active && hasRequiredPermission(nav.id, "view")
                )
                .map((item) => (
                  <DrawerClose key={item.link}>
                    <Button
                      variant={
                        pathName.includes(item?.link) ? "default" : "outline"
                      }
                      className='flex justify-center items-center w-full gap-4'
                      onClick={() => navigateToRoute(item.link)}>
                      {item.icon}
                      {item.title}
                    </Button>
                  </DrawerClose>
                ))}
            </nav>
            <div className='w-full grid grid-cols-2 gap-6 pt-4 px-4 py-6 rounded-tl-xl rounded-tr-xl bg-gray-300'>
              <DrawerClose>
                <Button
                  variant={"secondary"}
                  className='flex justify-center items-center w-full gap-4'
                  onClick={() => navigate("/profile")}>
                  <CircleUserRound className='size-5' /> My Profile
                </Button>
              </DrawerClose>
              <DrawerClose>
                <Button
                  variant={"destructive"}
                  className='flex justify-center items-center w-full gap-4'
                  onClick={() => signOut()}>
                  <LogOut className='size-5' /> Logout
                </Button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      </header>
    </>
  );
}
