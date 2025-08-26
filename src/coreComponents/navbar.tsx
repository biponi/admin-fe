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
      <header className='sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:hidden'>
        <Drawer>
          <DrawerTrigger asChild>
            <Button size='icon' variant='outline'>
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
            
            <div className='flex-1 px-4'>
            <nav className='grid gap-3 p-4 text-lg font-medium mb-4'>
              {navItems
                .filter(
                  (nav) => nav.active && hasRequiredPermission(nav.id, "view")
                )
                .map((item) => (
                  <DrawerClose key={item.link} asChild>
                    <Button
                      variant={pathName.includes(item?.link) ? "default" : "ghost"}
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
                        <span className='text-xs opacity-70'>Manage {item.title.toLowerCase()}</span>
                      </div>
                    </Button>
                  </DrawerClose>
                ))}
            </nav>
            </div>
            
            <div className='border-t bg-muted/30 px-4 py-4'>
              <div className='grid grid-cols-2 gap-3'>
                <DrawerClose asChild>
                  <Button
                    variant="secondary"
                    className='h-12 flex flex-col gap-1 bg-background border'
                    onClick={() => navigate("/profile")}>
                    <CircleUserRound className='size-5' />
                    <span className='text-xs'>Profile</span>
                  </Button>
                </DrawerClose>
                <DrawerClose asChild>
                  <Button
                    variant="destructive"
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
      </header>
    </>
  );
};

export default Navbar;
