import React from "react";
import { PanelLeft } from "lucide-react";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "./ui/drawer";
import { BiponiMainLogo } from "../utils/contents";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";
import useRoleCheck from "../pages/auth/hooks/useRoleCheck";
import { ScrollArea } from "./ui/scroll-area";
import { useLocation, useNavigate } from "react-router-dom";

import { CircleUserRound, LogOut } from "lucide-react";
import { navItems } from "../utils/navItem";

const colorClasses = [
  "bg-orange-100 text-orange-700",
  "bg-red-100 text-red-700",
  "bg-green-100 text-green-700",
  "bg-blue-100 text-blue-700",
  "bg-yellow-100 text-yellow-700",
  "bg-indigo-100 text-indigo-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-cyan-100 text-cyan-700",
  "bg-lime-100 text-lime-700",
  "bg-rose-100 text-rose-700",
];

function getRandomColorClass() {
  return colorClasses[Math.floor(Math.random() * colorClasses.length)];
}

const MobileDrawerNav: React.FC<any> = ({
  children = null,
}: {
  children: any;
}) => {
  const { signOut } = useLoginAuth();
  const navigate = useNavigate();
  const { hasRequiredPermission } = useRoleCheck();
  const navigateToRoute = (link: string) => {
    navigate(link);
  };

  const pathName = useLocation().pathname;
  return (
    <Drawer>
      <DrawerTrigger asChild>
        {!!children ? (
          children
        ) : (
          <Button size='sm' variant='ghost' className='h-9 w-9 p-0'>
            <PanelLeft className='h-5 w-5' />
            <span className='sr-only'>Toggle Menu</span>
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className='h-[71vh]'>
        <DrawerHeader className='pb-4'>
          <div className='flex justify-center items-center gap-3 py-2'>
            <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
              <img src={BiponiMainLogo} className='size-6' alt='main-logo' />
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
            <nav className='grid grid-cols-2 gap-3 pb-6'>
              {navItems
                .filter(
                  (nav) => nav.active && hasRequiredPermission(nav.id, "view")
                )
                .map((item) => (
                  <DrawerClose key={item.link} asChild>
                    <Button
                      variant={
                        pathName.includes(item?.link) ? "default" : "outline"
                      }
                      className={`h-14 justify-start gap-4 text-left ${
                        pathName.includes(item?.link)
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "hover:bg-accent "
                      }`}
                      onClick={() => navigateToRoute(item.link)}>
                      <div
                        className={`flex items-center justify-center h-8 w-8 rounded-lg ${
                          pathName.includes(item?.link)
                            ? "bg-background/20"
                            : getRandomColorClass()
                        } `}>
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
  );
};

export default MobileDrawerNav;
