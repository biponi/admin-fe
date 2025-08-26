import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "../utils/navItem";
import useRoleCheck from "../pages/auth/hooks/useRoleCheck";
import { cn } from "../utils/functions";

export function MobileBottomNav() {
  const { hasRequiredPermission } = useRoleCheck();
  const navigate = useNavigate();
  const pathName = useLocation().pathname;

  const filteredNavItems = navItems
    .filter((nav) => nav.active && hasRequiredPermission(nav.id, "view"))
    .slice(0, 5); // Limit to 5 items for better mobile UX

  const navigateToRoute = (link: string) => {
    navigate(link);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 border-t border-border/40 sm:hidden shadow-lg">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <nav className="flex items-center justify-around py-1.5 px-2 safe-area-inset-bottom">
        {filteredNavItems.map((item) => {
          const isActive = pathName.includes(item.link);
          return (
            <button
              key={item.link}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-xl min-h-[56px] w-full max-w-[80px] transition-all duration-300 active:scale-95",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground active:bg-accent/50"
              )}
              onClick={() => navigateToRoute(item.link)}
              style={{ WebkitTapHighlightColor: 'transparent' }}>
              
              <div className={cn(
                "relative flex items-center justify-center h-7 w-7 transition-all duration-300",
                isActive && "transform scale-110"
              )}>
                <div className={cn(
                  "absolute inset-0 rounded-full transition-all duration-300",
                  isActive ? "bg-primary/15 scale-125" : "bg-transparent"
                )}>
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
                  )}
                </div>
                <div className={cn(
                  "relative z-10 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.icon}
                </div>
              </div>
              
              <span className={cn(
                "text-[10px] font-medium leading-tight text-center truncate max-w-full transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.title}
              </span>
              
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-primary rounded-full shadow-sm animate-in slide-in-from-top-2 duration-300" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}