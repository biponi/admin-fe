import { CircleUserRound, LifeBuoy, LogOut, PanelLeft } from "lucide-react";
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
import { BiponiMainLogo } from "../utils/contents";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { getInitialsWord } from "../utils/functions";
import useRoleCheck from "../pages/auth/hooks/useRoleCheck";
import { SettingsPanel } from "../components/settings-panel";

const Navbar = () => {
  const { signOut, user } = useLoginAuth();
  const { hasRequiredPermission } = useRoleCheck();
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
            <img src={BiponiMainLogo} className='size-5' alt='main-logo' />
          </Button>
        </div>
        <nav className='grid gap-1 p-2'>
          {navItems
            .filter(
              (nav) => nav.active && hasRequiredPermission(nav.id, "view")
            )
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='mt-auto rounded-lg'
                aria-label='Help'>
                <SettingsPanel />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='right' sideOffset={5}>
              Settings
            </TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className='border-2 border-white shadow-lg'>
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{getInitialsWord(user?.name)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                My Profile
              </DropdownMenuItem>
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
                  <img
                    src={BiponiMainLogo}
                    className='size-5'
                    alt='main-logo'
                  />{" "}
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
};

export default Navbar;
