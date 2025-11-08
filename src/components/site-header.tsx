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
      <header className='hidden sm:flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 z-[999999]'>
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

        {/* Notification Button with glass effect */}
        {hasPagePermission("notifications", "view", userState?.permissions) && (
          <div className='relative group/bell ml-auto mr-6'>
            {/* Button glow on hover */}
            <div className='absolute inset-0 bg-primary/20 rounded-xl blur-md opacity-0 group-hover/bell:opacity-100 transition-opacity' />

            <NotificationBell
              size='sm'
              variant='ghost'
              className='relative h-9 w-9 rounded-xl bg-transparent  text-gray-700 hover:text-primary '
            />
          </div>
        )}
      </header>
    </>
  );
}
