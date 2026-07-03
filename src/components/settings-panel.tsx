import {
  Settings,
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
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { useSettings } from "../contexts/SettingsContext";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";

const themeOptions = [
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
    color: "bg-cyan-500 border-cyan-400",
    accent: "text-cyan-100",
    gradient: "from-cyan-500 to-cyan-500",
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

export function SettingsPanel() {
  const {
    layoutType,
    theme,
    setTheme,
    createOrderLayoutType,
    setCreateOrderLayoutType,
  } = useSettings();
  const location = useLocation();
  const isOrderPage = location.pathname.includes("/order");

  const [orderView, setOrderView] = useState<"v1" | "v2">(() => {
    const saved = localStorage.getItem(ORDER_VIEW_PREFERENCE_KEY);
    return (saved as "v1" | "v2") || "v2";
  });

  useEffect(() => {
    localStorage.setItem(ORDER_VIEW_PREFERENCE_KEY, orderView);
    if (isOrderPage) {
      window.dispatchEvent(
        new CustomEvent("orderViewChanged", { detail: orderView }),
      );
    }
  }, [orderView, isOrderPage]);

  return (
    <Sheet>
      <SheetTrigger className='p-0' asChild>
        <Button className='h-8 p-0 md:pl-[2%] bg-sidebar w-full text-left flex justify-start items-center gap-2'>
          <Settings className='h-6 w-6' />
          <span className='hidden md:inline'>Settings</span>
        </Button>
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
                <section className='hidden md:block'>
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

                <Separator className='hidden md:block' />
              </>
            )}

            {/* Order View Section - Keep original beautiful design */}
            <section className='hidden md:block'>
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
                    {/* V2 Modern View */}
                    <div
                      className={cn(
                        "flex items-center space-x-3 rounded-xl border-2 p-4 transition-all duration-200",
                        orderView === "v2"
                          ? "border-blue-400 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm"
                          : "border-blue-200 hover:bg-blue-50/50",
                      )}>
                      <RadioGroupItem value='v2' id='order-v2' />
                      <div className='flex-1'>
                        <Label htmlFor='order-v2' className='cursor-pointer'>
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
                          <ul className='text-[11px] text-muted-foreground mt-2 space-y-1 ml-1'>
                            <li className='flex items-center gap-1.5'>
                              <span className='text-green-600 font-bold'>
                                ✓
                              </span>
                              <span>
                                Virtual scrolling for better performance
                              </span>
                            </li>
                            <li className='flex items-center gap-1.5'>
                              <span className='text-green-600 font-bold'>
                                ✓
                              </span>
                              <span>Keyboard shortcuts (⌘K)</span>
                            </li>
                            <li className='flex items-center gap-1.5'>
                              <span className='text-green-600 font-bold'>
                                ✓
                              </span>
                              <span>Smooth animations & modern UI</span>
                            </li>
                            <li className='flex items-center gap-1.5'>
                              <span className='text-green-600 font-bold'>
                                ✓
                              </span>
                              <span>Enhanced bulk actions</span>
                            </li>
                          </ul>
                        </Label>
                      </div>
                    </div>

                    {/* V1 Classic View */}
                    <div
                      className={cn(
                        "flex items-center space-x-3 rounded-xl border-2 p-4 transition-all duration-200",
                        orderView === "v1"
                          ? "border-gray-400 bg-gray-50 shadow-sm"
                          : "border-gray-200 hover:bg-accent",
                      )}>
                      <RadioGroupItem value='v1' id='order-v1' />
                      <div className='flex-1'>
                        <Label htmlFor='order-v1' className='cursor-pointer'>
                          <div className='flex items-center gap-2'>
                            <ArrowLeft className='h-4 w-4 text-gray-600' />
                            <span className='font-medium'>
                              Classic View (V1)
                            </span>
                          </div>
                          <p className='text-xs text-muted-foreground mt-2'>
                            Traditional interface with all existing features
                          </p>
                          <ul className='text-[11px] text-muted-foreground mt-2 space-y-1 ml-1'>
                            <li className='flex items-center gap-1.5'>
                              <span className='text-blue-600'>•</span>
                              <span>Familiar layout you're used to</span>
                            </li>
                            <li className='flex items-center gap-1.5'>
                              <span className='text-blue-600'>•</span>
                              <span>All V1 features available</span>
                            </li>
                          </ul>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Info message */}
                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3'>
                    <p className='text-xs text-blue-800 flex items-start gap-2'>
                      <span className='text-base'>ℹ️</span>
                      <span>
                        Your preference is saved and will apply when you visit
                        the Orders page. You can switch anytime!
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <Separator className='hidden md:block' />

            {/* Create Order Layout Section */}
            <section className='hidden md:block'>
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
                    {/* Product-First View - New Layout */}
                    <div
                      className={cn(
                        "flex items-center space-x-3 rounded-xl border-2 p-4 transition-all duration-200",
                        createOrderLayoutType === "product-first"
                          ? "border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm"
                          : "border-green-200 hover:bg-green-50/50",
                      )}>
                      <RadioGroupItem
                        value='product-first'
                        id='create-order-product-first'
                      />
                      <div className='flex-1'>
                        <Label
                          htmlFor='create-order-product-first'
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
                          <ul className='text-[11px] text-muted-foreground mt-2 space-y-1 ml-1'>
                            <li className='flex items-center gap-1.5'>
                              <span className='text-green-600 font-bold'>
                                ✓
                              </span>
                              <span>Side-by-side product & cart view</span>
                            </li>
                            <li className='flex items-center gap-1.5'>
                              <span className='text-green-600 font-bold'>
                                ✓
                              </span>
                              <span>Grid-based product display</span>
                            </li>
                            <li className='flex items-center gap-1.5'>
                              <span className='text-green-600 font-bold'>
                                ✓
                              </span>
                              <span>No step navigation needed</span>
                            </li>
                            <li className='flex items-center gap-1.5'>
                              <span className='text-green-600 font-bold'>
                                ✓
                              </span>
                              <span>Mobile-friendly cart drawer</span>
                            </li>
                          </ul>
                        </Label>
                      </div>
                    </div>

                    {/* Step Wizard View - Classic Layout */}
                    <div
                      className={cn(
                        "flex items-center space-x-3 rounded-xl border-2 p-4 transition-all duration-200",
                        createOrderLayoutType === "wizard"
                          ? "border-gray-400 bg-gray-50 shadow-sm"
                          : "border-gray-200 hover:bg-accent",
                      )}>
                      <RadioGroupItem value='wizard' id='create-order-wizard' />
                      <div className='flex-1'>
                        <Label
                          htmlFor='create-order-wizard'
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
                          <ul className='text-[11px] text-muted-foreground mt-2 space-y-1 ml-1'>
                            <li className='flex items-center gap-1.5'>
                              <span className='text-blue-600'>•</span>
                              <span>Products → Customer → Review</span>
                            </li>
                            <li className='flex items-center gap-1.5'>
                              <span className='text-blue-600'>•</span>
                              <span>Familiar guided workflow</span>
                            </li>
                            <li className='flex items-center gap-1.5'>
                              <span className='text-blue-600'>•</span>
                              <span>Best for complex orders</span>
                            </li>
                          </ul>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Info message */}
                  <div className='bg-green-50 border border-green-200 rounded-lg p-3 mt-3'>
                    <p className='text-xs text-green-800 flex items-start gap-2'>
                      <span className='text-base'>💡</span>
                      <span>
                        Your preference is saved and will apply when you create
                        new orders. Switch anytime!
                      </span>
                    </p>
                  </div>
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
            <SheetClose className='ml-2'>
              <Badge variant={"destructive"}> Close </Badge>
            </SheetClose>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
