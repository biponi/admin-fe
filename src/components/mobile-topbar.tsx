import { Code, Menu } from "lucide-react";
import { Button } from "./ui/button";
import BrandLogo from "../assets/Biponi-lg.png";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { getInitialsWord } from "../utils/functions";
import { useNavigate } from "react-router-dom";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";
import useRoleCheck from "../pages/auth/hooks/useRoleCheck";

interface MobileTopbarProps {
  onMenuClick: () => void;
}

export function MobileTopbar({ onMenuClick }: MobileTopbarProps) {
  const { user } = useLoginAuth();
  const navigate = useNavigate();
  const { signOut } = useLoginAuth();

  return (
    <header className='sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:hidden'>
      {/* Hamburger Menu Button */}
      <Button
        variant='ghost'
        size='icon'
        onClick={onMenuClick}
        className='shrink-0'>
        <Menu className='h-5 w-5' />
        <span className='sr-only'>Toggle navigation menu</span>
      </Button>

      {/* Brand Logo */}
      <div className='flex items-center gap-2 flex-1'>
        <img src={BrandLogo} className='h-8 w-auto' alt='Biponi Logo' />
        <span className='font-semibold text-lg'>Biponi</span>
      </div>

      {/* User Avatar with Dropdown */}
      <div className='flex items-center gap-2'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className='h-9 w-9 border border-border cursor-pointer'>
              {user?.avatar ? (
                <AvatarImage src={user?.avatar} alt={user.name} />
              ) : null}
              <AvatarFallback className='bg-primary text-primary-foreground text-sm font-semibold'>
                {getInitialsWord(user?.name || "User")}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              My Profile
            </DropdownMenuItem>
            {useRoleCheck().hasRequiredPermission(
              "settings",
              "jobs_management",
            ) && (
              <DropdownMenuItem onClick={() => navigate("/settings/jobs")}>
                <Code />
                Actions
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => signOut()}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
