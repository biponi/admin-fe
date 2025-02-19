import { LifeBuoy, PanelLeft, User2 } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "../components/ui/drawer";
import { navItems } from "../utils/navItem";
import { useLocation, useNavigate } from "react-router-dom";
import { BiponiLogo } from "../utils/contents";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { getInitialsWord } from "../utils/functions";

const Navbar = () => {
  const { signOut, user } = useLoginAuth();
  const navigate = useNavigate();
  const pathName = useLocation().pathname;

  const navigateToRoute = (link: string) => {
    navigate(link);
  };

  return (
    <>
      <aside className='inset-y fixed left-0 z-20 hidden sm:flex h-full flex-col border-r'>
        <div className='border-b p-2'>
          <Button variant='outline' size='icon' aria-label='Home'>
            <img src={BiponiLogo} className='size-5' alt='main-logo' />
          </Button>
        </div>
        <nav className='grid gap-1 p-2'>
          {navItems
            .filter((nav) => nav.active && nav.roles.includes(user?.role))
            .map((item) => (
              <Tooltip key={item.link}>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      pathName.includes(item?.link) ? "default" : "ghost"
                    }
                    size='icon'
                    className='rounded-lg'
                    aria-label={item.title}
                    onClick={() => navigateToRoute(item?.link)}>
                    {item?.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='right' sideOffset={5}>
                  {item?.title}
                </TooltipContent>
              </Tooltip>
            ))}
        </nav>
        <nav className='mt-auto grid gap-1 p-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='mt-auto rounded-lg'
                aria-label='Help'>
                <LifeBuoy className='size-5' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='right' sideOffset={5}>
              Help
            </TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar>
                <AvatarFallback>{getInitialsWord(user?.name)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => signOut()}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </aside>
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
                  <img src={BiponiLogo} className='size-5' alt='main-logo' />{" "}
                </Button>
                <span className='text-base font-semibold text-gray-700'>
                  Prior Admin
                </span>
              </div>
            </DrawerHeader>
            <nav className='grid grid-cols-2 gap-6 p-4 text-lg font-medium mb-4'>
              {navItems
                .filter((nav) => nav.active && nav.roles.includes(user?.role))
                .map((item) => (
                  <DrawerClose>
                    <Button
                      key={item.link}
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
              <DrawerClose>
                <Button
                  variant={"destructive"}
                  className='flex justify-center items-center w-full gap-4'
                  onClick={() => signOut()}>
                  <User2 className='size-5' /> Logout
                </Button>
              </DrawerClose>
            </nav>
          </DrawerContent>
        </Drawer>
      </header>
    </>
  );
};

export default Navbar;
