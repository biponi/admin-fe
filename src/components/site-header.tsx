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
import { useLocation } from "react-router-dom";

import { usePageTitle } from "../contexts/PageContext";

import { hasPagePermission } from "../utils/helperFunction";
import { useSelector } from "react-redux";
import NotificationBell from "../notification/NotificationBell";

interface SiteHeaderProps {
  title?: string;
}

export function SiteHeader({ title }: SiteHeaderProps) {
  const { pageTitle } = usePageTitle();

  const pathName = useLocation().pathname;
  const userState = useSelector((state: any) => state?.user);

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
            <NotificationBell size='sm' variant='ghost' />
          </div>
        )}
      </header>

      {/* Mobile Header */}
      <header className='sticky  z-30 flex h-10 items-center gap-4 px-4 sm:hidden group bg-transparent'>
        {/* Glassmorphic background with multiple layers */}
        <div className='absolute inset-0 rounded-2xl overflow-hidden'>
          {/* Main glass layer */}
          <div className='absolute inset-0 bg-white/40 backdrop-blur-2xl' />

          {/* Border gradient */}
          <div className='absolute inset-0 rounded-2xl border border-white/60 shadow-lg shadow-black/5' />

          {/* Top shine effect */}
          <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent' />

          {/* Inner glow */}
          <div className='absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-transparent' />

          {/* Subtle shimmer effect */}
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000' />
        </div>

        {/* Content */}
        <div className='relative flex items-center gap-2 z-10'>
          {/* Logo with glass effect */}
          <div className='relative'>
            <div className='absolute inset-0 bg-primary/10 rounded-lg blur-md' />
            <img
              src={BiponiMainLogo}
              className='relative size-6'
              alt='main-logo'
            />
          </div>

          <span className='text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'>
            Prior Admin
          </span>
        </div>

        <div className='relative ml-auto flex items-center gap-2 z-10'>
          {/* Notification Button with glass effect */}
          {hasPagePermission("chat", "view", userState?.permissions) && (
            <div className='relative group/bell'>
              {/* Button glow on hover */}
              <div className='absolute inset-0 bg-primary/20 rounded-xl blur-md opacity-0 group-hover/bell:opacity-100 transition-opacity' />

              <button className='relative h-9 w-9 flex items-center justify-center rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 text-gray-700 hover:text-primary hover:bg-white/70 transition-all duration-300 active:scale-95 shadow-sm'>
                <NotificationBell size='sm' variant='ghost' />

                {/* Notification dot */}
                <span className='absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white shadow-sm'>
                  <span className='absolute inset-0 bg-red-500 rounded-full animate-ping' />
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom subtle shadow for depth */}
        <div className='absolute inset-x-2 -bottom-1 h-2 bg-gradient-to-b from-black/5 to-transparent blur-sm rounded-b-2xl -z-10' />
      </header>
    </>
  );
}
