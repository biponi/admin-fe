import { Code, Menu, Settings } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { useSettings } from "../contexts/SettingsContext";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { Card } from "./ui/card";
import { CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";
import {
  Sun,
  Moon,
  Palette,
  Sparkles,
  ArrowLeft,
  Package,
  Check,
  Paintbrush,
  ShoppingCart,
  Layers,
} from "lucide-react";

interface MobileTopbarProps {
  onMenuClick: () => void;
}

const themeOptions = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    color: "bg-amber-50 border-amber-200",
    accent: "text-amber-600",
    gradient: "from-amber-50 to-orange-50",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    color: "bg-slate-800 border-slate-600",
    accent: "text-slate-300",
    gradient: "from-slate-800 to-slate-900",
  },
  {
    value: "blue",
    label: "Ocean",
    icon: Palette,
    color: "bg-blue-500 border-blue-400",
    accent: "text-blue-100",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    value: "green",
    label: "Forest",
    icon: Palette,
    color: "bg-emerald-500 border-emerald-400",
    accent: "text-emerald-100",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    value: "purple",
    label: "Royal",
    icon: Palette,
    color: "bg-purple-500 border-purple-400",
    accent: "text-purple-100",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    value: "orange",
    label: "Sunset",
    icon: Palette,
    color: "bg-orange-500 border-orange-400",
    accent: "text-orange-100",
    gradient: "from-orange-500 to-red-500",
  },
] as const;

const ORDER_VIEW_PREFERENCE_KEY = "order_view_preference";

export function MobileTopbar({ onMenuClick }: MobileTopbarProps) {
  const { user } = useLoginAuth();
  const navigate = useNavigate();
  const { signOut } = useLoginAuth();
  const { layoutType, theme, setTheme, createOrderLayoutType, setCreateOrderLayoutType } = useSettings();
  const [orderView, setOrderView] = useState<"v1" | "v2">(() => {
    const saved = localStorage.getItem(ORDER_VIEW_PREFERENCE_KEY);
    return (saved as "v1" | "v2") || "v2";
  });

  useEffect(() => {
    localStorage.setItem(ORDER_VIEW_PREFERENCE_KEY, orderView);
  }, [orderView]);

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
            <Sheet>
              <SheetTrigger asChild>
                <DropdownMenuItem className="cursor-pointer" onSelect={(e) => e.preventDefault()}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </SheetTrigger>
              <SheetContent
                side='right'
                className='w-[400px] sm:w-[480px] p-0 flex flex-col'>
                {/* Fixed Header */}
                <div className='px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-gray-50'>
                  <SheetHeader>
                    <SheetTitle className='flex items-center gap-2 text-xl'>
                      <div className='p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white'>
                        <Settings className='h-5 w-5' />
                      </div>
                      Settings
                    </SheetTitle>
                    <SheetDescription className='text-sm'>
                      Customize your dashboard experience
                    </SheetDescription>
                  </SheetHeader>
                </div>

                {/* Scrollable Content */}
                <ScrollArea className='flex-1 px-6'>
                  <div className='py-6 space-y-6'>
                    {/* Theme Section - Only show for modern layout */}
                    {layoutType === "modern" && (
                      <>
                        <section>
                          <div className='flex items-center gap-2 mb-4'>
                            <div className='p-1.5 rounded-md bg-purple-100'>
                              <Paintbrush className='h-4 w-4 text-purple-600' />
                            </div>
                            <h3 className='font-semibold text-sm'>Sidebar Theme</h3>
                          </div>

                          <div className='grid grid-cols-3 gap-3'>
                            {themeOptions.map((option) => {
                              const IconComponent = option.icon;
                              const isSelected = theme === option.value;
                              return (
                                <button
                                  key={option.value}
                                  onClick={() => setTheme(option.value as any)}
                                  className={cn(
                                    "relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md hover:scale-105",
                                    isSelected
                                      ? "border-blue-500 shadow-sm"
                                      : "border-gray-200 hover:border-gray-300",
                                  )}>
                                  {isSelected && (
                                    <div className='absolute -top-1.5 -right-1.5 p-1 rounded-full bg-blue-500 shadow-sm'>
                                      <Check className='h-2.5 w-2.5 text-white' />
                                    </div>
                                  )}
                                  <div
                                    className={cn(
                                      "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2 border",
                                      option.color,
                                    )}>
                                    <IconComponent
                                      className={cn("h-5 w-5", option.accent)}
                                    />
                                  </div>
                                  <span className='font-medium text-xs'>
                                    {option.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </section>

                        <Separator />
                      </>
                    )}

                    {/* Order View Section */}
                    <section>
                      <Card className='border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-purple-50/50 shadow-sm'>
                        <CardHeader className='pb-4'>
                          <CardTitle className='text-base flex items-center gap-2'>
                            <div className='p-1.5 rounded-md bg-gradient-to-br from-blue-500 to-purple-500'>
                              <Package className='h-4 w-4 text-white' />
                            </div>
                            Order Management View
                          </CardTitle>
                          <CardDescription>
                            Choose your preferred order management interface
                          </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                          <RadioGroup
                            value={orderView}
                            onValueChange={(value) =>
                              setOrderView(value as "v1" | "v2")
                            }
                            className='space-y-3'>
                            <div
                              className={cn(
                                "flex items-center space-x-3 rounded-xl border-2 p-4 transition-all duration-200",
                                orderView === "v2"
                                  ? "border-blue-400 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm"
                                  : "border-blue-200 hover:bg-blue-50/50",
                              )}>
                              <RadioGroupItem value='v2' id='order-v2-mobile' />
                              <div className='flex-1'>
                                <Label htmlFor='order-v2-mobile' className='cursor-pointer'>
                                  <div className='flex items-center gap-2'>
                                    <Sparkles className='h-4 w-4 text-purple-600' />
                                    <span className='font-semibold'>
                                      Modern View (V2)
                                    </span>
                                    <span className='px-2 py-0.5 text-[10px] font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full'>
                                      Recommended
                                    </span>
                                  </div>
                                  <p className='text-xs text-muted-foreground mt-2 leading-relaxed'>
                                    ✨ Beautiful modern interface with advanced features
                                  </p>
                                </Label>
                              </div>
                            </div>

                            <div
                              className={cn(
                                "flex items-center space-x-3 rounded-xl border-2 p-4 transition-all duration-200",
                                orderView === "v1"
                                  ? "border-gray-400 bg-gray-50 shadow-sm"
                                  : "border-gray-200 hover:bg-accent",
                              )}>
                              <RadioGroupItem value='v1' id='order-v1-mobile' />
                              <div className='flex-1'>
                                <Label htmlFor='order-v1-mobile' className='cursor-pointer'>
                                  <div className='flex items-center gap-2'>
                                    <ArrowLeft className='h-4 w-4 text-gray-600' />
                                    <span className='font-medium'>
                                      Classic View (V1)
                                    </span>
                                  </div>
                                  <p className='text-xs text-muted-foreground mt-2'>
                                    Traditional interface with all existing features
                                  </p>
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </CardContent>
                      </Card>
                    </section>

                    <Separator />

                    {/* Create Order Layout Section */}
                    <section>
                      <Card className='border-2 border-green-100 bg-gradient-to-br from-green-50/50 to-emerald-50/50 shadow-sm'>
                        <CardHeader className='pb-4'>
                          <CardTitle className='text-base flex items-center gap-2'>
                            <div className='p-1.5 rounded-md bg-gradient-to-br from-green-500 to-emerald-500'>
                              <ShoppingCart className='h-4 w-4 text-white' />
                            </div>
                            Create Order Layout
                          </CardTitle>
                          <CardDescription>
                            Choose your preferred create order interface
                          </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                          <RadioGroup
                            value={createOrderLayoutType}
                            onValueChange={(value) =>
                              setCreateOrderLayoutType(
                                value as "wizard" | "product-first",
                              )
                            }
                            className='space-y-3'>
                            <div
                              className={cn(
                                "flex items-center space-x-3 rounded-xl border-2 p-4 transition-all duration-200",
                                createOrderLayoutType === "product-first"
                                  ? "border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm"
                                  : "border-green-200 hover:bg-green-50/50",
                              )}>
                              <RadioGroupItem
                                value='product-first'
                                id='create-order-product-first-mobile'
                              />
                              <div className='flex-1'>
                                <Label
                                  htmlFor='create-order-product-first-mobile'
                                  className='cursor-pointer'>
                                  <div className='flex items-center gap-2'>
                                    <Sparkles className='h-4 w-4 text-green-600' />
                                    <span className='font-semibold'>
                                      Product-First View
                                    </span>
                                    <span className='px-2 py-0.5 text-[10px] font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full'>
                                      New
                                    </span>
                                  </div>
                                  <p className='text-xs text-muted-foreground mt-2 leading-relaxed'>
                                    ✨ Modern single-screen layout for faster order
                                    creation
                                  </p>
                                </Label>
                              </div>
                            </div>

                            <div
                              className={cn(
                                "flex items-center space-x-3 rounded-xl border-2 p-4 transition-all duration-200",
                                createOrderLayoutType === "wizard"
                                  ? "border-gray-400 bg-gray-50 shadow-sm"
                                  : "border-gray-200 hover:bg-accent",
                              )}>
                              <RadioGroupItem value='wizard' id='create-order-wizard-mobile' />
                              <div className='flex-1'>
                                <Label
                                  htmlFor='create-order-wizard-mobile'
                                  className='cursor-pointer'>
                                  <div className='flex items-center gap-2'>
                                    <Layers className='h-4 w-4 text-gray-600' />
                                    <span className='font-medium'>
                                      Step-by-Step Wizard
                                    </span>
                                  </div>
                                  <p className='text-xs text-muted-foreground mt-2'>
                                    Classic multi-step wizard for guided order creation
                                  </p>
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </CardContent>
                      </Card>
                    </section>

                    {/* Bottom padding for scroll */}
                    <div className='h-4' />
                  </div>
                </ScrollArea>

                {/* Fixed Footer */}
                <div className='px-6 py-4 border-t bg-gray-50/80 backdrop-blur-sm'>
                  <p className='text-xs text-center text-muted-foreground'>
                    Changes are saved automatically
                  </p>
                </div>
              </SheetContent>
            </Sheet>
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
