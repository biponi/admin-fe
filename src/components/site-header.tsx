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
import { ScrollArea } from "./ui/scroll-area";

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
      <header className='sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:hidden'>
        <div className='flex items-center gap-2'>
          <img src={BiponiMainLogo} className='size-6' alt='main-logo' />
          <span className='text-lg font-bold text-primary'>Prior Admin</span>
        </div>

        <div className='ml-auto flex items-center gap-2'>
          {/* Notification Button for Mobile */}
          {hasPagePermission("chat", "view", userState?.permissions) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' className='relative h-9 w-9'>
                  {unreadCount > 0 ? (
                    <BellRing className='h-5 w-5' />
                  ) : (
                    <Bell className='h-5 w-5' />
                  )}
                  {unreadCount > 0 && (
                    <Badge
                      variant='destructive'
                      className='absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]'>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-72' align='end'>
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
                  <div className='max-h-64 overflow-y-auto'>
                    {notifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem
                        key={notification._id}
                        className={`p-3 cursor-pointer ${
                          !notification.read
                            ? "bg-blue-50 border-l-2 border-l-blue-500"
                            : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}>
                        <div className='flex items-start gap-3 w-full'>
                          <div className='text-sm'>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className='flex-1 space-y-1'>
                            <div className='flex items-center justify-between'>
                              <p className='text-xs font-medium leading-none truncate'>
                                {notification.title}
                              </p>
                              <span className='text-[10px] text-gray-500'>
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                            </div>
                            <p className='text-[10px] text-gray-600 line-clamp-2'>
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Drawer>
            <DrawerTrigger asChild>
              <Button size='sm' variant='ghost' className='h-9 w-9 p-0'>
                <PanelLeft className='h-5 w-5' />
                <span className='sr-only'>Toggle Menu</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className='h-[90vh]'>
              <DrawerHeader className='pb-4'>
                <div className='flex justify-center items-center gap-3 py-2'>
                  <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
                    <img
                      src={BiponiMainLogo}
                      className='size-6'
                      alt='main-logo'
                    />
                  </div>
                  <div>
                    <span className='text-xl font-bold text-primary block'>
                      Prior Admin
                    </span>
                    <span className='text-sm text-muted-foreground'>
                      Management Dashboard
                    </span>
                  </div>
                </div>
              </DrawerHeader>

              <ScrollArea className='h-[calc(80vh-8rem)]'>
                <div className='flex-1 px-4'>
                  <nav className='grid gap-3 pb-6'>
                    {navItems
                      .filter(
                        (nav) =>
                          nav.active && hasRequiredPermission(nav.id, "view")
                      )
                      .map((item) => (
                        <DrawerClose key={item.link} asChild>
                          <Button
                            variant={
                              pathName.includes(item?.link)
                                ? "default"
                                : "ghost"
                            }
                            className={`h-14 justify-start gap-4 text-left ${
                              pathName.includes(item?.link)
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "hover:bg-accent"
                            }`}
                            onClick={() => navigateToRoute(item.link)}>
                            <div className='flex items-center justify-center h-8 w-8 rounded-lg bg-background/20'>
                              {item.icon}
                            </div>
                            <div className='flex flex-col items-start'>
                              <span className='font-medium'>{item.title}</span>
                              <span className='text-xs opacity-70'>
                                Manage {item.title.toLowerCase()}
                              </span>
                            </div>
                          </Button>
                        </DrawerClose>
                      ))}
                  </nav>
                </div>
              </ScrollArea>

              <div className='border-t bg-muted/30 px-4 py-4'>
                <div className='grid grid-cols-2 gap-3'>
                  <DrawerClose asChild>
                    <Button
                      variant='secondary'
                      className='h-12 flex flex-col gap-1 bg-background border'
                      onClick={() => navigate("/profile")}>
                      <CircleUserRound className='size-5' />
                      <span className='text-xs'>Profile</span>
                    </Button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <Button
                      variant='destructive'
                      className='h-12 flex flex-col gap-1'
                      onClick={() => signOut()}>
                      <LogOut className='size-5' />
                      <span className='text-xs'>Logout</span>
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </header>
    </>
  );
}
