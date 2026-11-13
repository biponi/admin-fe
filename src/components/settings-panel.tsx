import {
  Settings,
  Moon,
  Palette,
  Check,
  Paintbrush,
  ShoppingCart,
  Layers,
  Sparkles,
  Package,
  ArrowLeft,
  Monitor,
  ImageIcon,
  CloudSun,
  Cat,
  Gauge,
  Heart,
} from "lucide-react";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "./ui/drawer";
import { ScrollArea } from "./ui/scroll-area";
import { useSettings } from "../contexts/SettingsContext";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { useIsMobile } from "../hooks/use-mobile";
import { ONEKO_CRITTERS, ONEKO_SPEEDS } from "./oneko";

// ─── Types ───────────────────────────────────────────────────────────────────

type ThemeValue = "default" | "dark" | "blue" | "green" | "purple" | "orange";

// Theme colors accent the app UI (--primary, dashboard gradients). They never
// tint the sidebar surface itself — when a weather background (image or
// animated) is selected, the sidebar shows the weather art with no color
// overlay (index.scss re-pins --sidebar-* on the sidebar container).
const themeOptions: {
  value: ThemeValue;
  label: string;
  icon: typeof Moon;
  swatch: string;
}[] = [
  {
    value: "default",
    label: "Default",
    icon: Monitor,
    swatch: "bg-zinc-100 border border-zinc-300",
  },
  {
    value: "dark",
    label: "Slate",
    icon: Moon,
    swatch: "bg-slate-800",
  },
  {
    value: "blue",
    label: "Ocean",
    icon: Palette,
    swatch: "bg-cyan-500",
  },
  {
    value: "green",
    label: "Forest",
    icon: Palette,
    swatch: "bg-emerald-500",
  },
  {
    value: "purple",
    label: "Royal",
    icon: Palette,
    swatch: "bg-violet-600",
  },
  {
    value: "orange",
    label: "Sunset",
    icon: Palette,
    swatch: "bg-orange-500",
  },
];

const ORDER_VIEW_PREFERENCE_KEY = "order_view_preference";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({
  icon: Icon,
  label,
}: {
  icon: typeof Paintbrush;
  label: string;
}) {
  return (
    <div className='flex items-center gap-2.5 mb-4'>
      <div className='p-1.5 rounded-lg border border-[#D97757]/20 bg-[#D97757]/10 text-[#D97757]'>
        <Icon className='h-3.5 w-3.5' />
      </div>
      <span className='text-[13px] font-semibold text-[#141413] tracking-tight'>
        {label}
      </span>
    </div>
  );
}

function RadioOptionCard({
  value,
  currentValue,
  id,
  children,
}: {
  value: string;
  currentValue: string;
  id: string;
  children: React.ReactNode;
}) {
  const isSelected = currentValue === value;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 transition-colors cursor-pointer",
        isSelected
          ? "border-[#D97757] bg-[#D97757]/[0.05]"
          : "border-[#E8E4DC] hover:border-[#D8D3C8] hover:bg-[#F5F1EA]",
      )}>
      <RadioGroupItem value={value} id={id} className='mt-0.5 shrink-0' />
      <Label htmlFor={id} className='cursor-pointer flex-1 space-y-0'>
        {children}
      </Label>
    </div>
  );
}

// ─── Inner Content ────────────────────────────────────────────────────────────

function SettingsContentBody() {
  const {
    layoutType,
    theme,
    setTheme,
    createOrderLayoutType,
    setCreateOrderLayoutType,
    sidebarWeatherStyle,
    setSidebarWeatherStyle,
    onekoEnabled,
    setOnekoEnabled,
    onekoCat,
    setOnekoCat,
    onekoSpeed,
    setOnekoSpeed,
    onekoFriend,
    setOnekoFriend,
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
    <div className='space-y-7'>
      {/* ── Theme Colour (modern only) ── */}
      {layoutType === "modern" && (
        <section>
          <SectionLabel icon={Paintbrush} label='Theme Colour' />
          <div className='grid grid-cols-3 sm:grid-cols-6 gap-2'>
            {themeOptions.map((option) => {
              const isSelected = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "group relative flex flex-col items-center gap-2 p-3 rounded-lg transition-colors",
                    " focus-visible:ring-[#D97757]/40",
                    isSelected
                      ? "border-[#D97757] ring-1 ring-[#D97757] bg-[#D97757]/[0.04]"
                      : "border-[#E8E4DC] hover:border-[#D8D3C8] bg-transparent",
                  )}>
                  {/* Swatch */}
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center",
                      option.swatch,
                    )}>
                    {isSelected && (
                      <Check
                        className={cn(
                          "h-4 w-4",
                          option.value === "default"
                            ? "text-zinc-800"
                            : "text-white",
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium transition-colors",
                      isSelected
                        ? "text-[#141413]"
                        : "text-[#57554D] group-hover:text-[#141413]",
                    )}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className='text-[11px] text-[#8A877D] mt-2.5 ml-0.5'>
            Accent colour for buttons and dashboard charts. The sidebar always
            shows the weather background with no colour overlay.
          </p>
        </section>
      )}

      {/* Divider */}
      {layoutType === "modern" && (
        <div className='border-t border-dashed border-border/70' />
      )}

      {/* ── Sidebar Weather Background (modern only) ── */}
      {layoutType === "modern" && (
        <section>
          <SectionLabel icon={CloudSun} label='Sidebar Weather Background' />
          <RadioGroup
            value={sidebarWeatherStyle}
            onValueChange={(v) =>
              setSidebarWeatherStyle(v as "image" | "animated")
            }
            className='grid grid-cols-2 gap-4'>
            {/* Image theme */}
            <RadioOptionCard
              value='image'
              currentValue={sidebarWeatherStyle}
              id='weather-image'>
              <div className='flex items-center gap-2 mb-1'>
                <ImageIcon className='h-3.5 w-3.5 text-[#B85A3D] shrink-0' />
                <span className='font-medium text-sm text-[#141413]'>
                  Image Theme
                </span>
              </div>
              <p className='text-[11px] text-[#8A877D] leading-relaxed'>
                Weather and time-of-day background photos in the sidebar and
                header
              </p>
            </RadioOptionCard>

            {/* Animated scene — default */}
            <RadioOptionCard
              value='animated'
              currentValue={sidebarWeatherStyle}
              id='weather-animated'>
              <div className='flex items-center gap-2 mb-1'>
                <CloudSun className='h-3.5 w-3.5 text-[#57554D] shrink-0' />
                <span className='font-semibold text-sm text-[#141413]'>
                  Animated Scene
                </span>
                <span className='ml-auto px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-[#B85A3D] text-white rounded-full'>
                  Default
                </span>
              </div>
              <p className='text-[11px] text-[#8A877D] leading-relaxed'>
                Live CSS weather animation · Sky, sun/moon, clouds, rain and
                lightning in the sidebar and header
              </p>
            </RadioOptionCard>
          </RadioGroup>
        </section>
      )}

      {/* Divider */}
      {layoutType === "modern" && (
        <div className='border-t border-dashed border-border/70' />
      )}

      {/* ── Order Management View ── */}
      <section>
        <SectionLabel icon={Package} label='Order Management View' />
        <RadioGroup
          value={orderView}
          onValueChange={(v) => setOrderView(v as "v1" | "v2")}
          className='grid grid-cols-2 gap-4'>
          {/* V2 — Modern */}
          <RadioOptionCard value='v2' currentValue={orderView} id='order-v2'>
            <div className='flex items-center gap-2 mb-1'>
              <Sparkles className='h-3.5 w-3.5 text-[#B85A3D] shrink-0' />
              <span className='font-semibold text-sm text-[#141413]'>
                Modern View
              </span>
              <span className='ml-auto px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-[#B85A3D] text-white rounded-full'>
                Recommended
              </span>
            </div>
            <p className='text-[11px] text-[#8A877D] leading-relaxed'>
              Virtual scrolling · Keyboard shortcuts · Smooth animations ·
              Enhanced bulk actions
            </p>
          </RadioOptionCard>

          {/* V1 — Classic */}
          <RadioOptionCard value='v1' currentValue={orderView} id='order-v1'>
            <div className='flex items-center gap-2 mb-1'>
              <ArrowLeft className='h-3.5 w-3.5 text-[#57554D] shrink-0' />
              <span className='font-medium text-sm text-[#141413]'>
                Classic View
              </span>
            </div>
            <p className='text-[11px] text-[#8A877D] leading-relaxed'>
              Familiar layout · All V1 features available
            </p>
          </RadioOptionCard>
        </RadioGroup>
      </section>

      {/* Divider */}
      <div className='border-t border-dashed border-border/70' />

      {/* ── Create Order Layout ── */}
      <section>
        <SectionLabel icon={ShoppingCart} label='Create Order Layout' />
        <RadioGroup
          value={createOrderLayoutType}
          onValueChange={(v) =>
            setCreateOrderLayoutType(v as "wizard" | "product-first")
          }
          className='grid grid-cols-2 gap-4'>
          {/* Product-First */}
          <RadioOptionCard
            value='product-first'
            currentValue={createOrderLayoutType}
            id='create-product-first'>
            <div className='flex items-center gap-2 mb-1'>
              <Sparkles className='h-3.5 w-3.5 text-[#B85A3D] shrink-0' />
              <span className='font-semibold text-sm text-[#141413]'>
                Product-First
              </span>
              <span className='ml-auto px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-[#B85A3D] text-white rounded-full'>
                New
              </span>
            </div>
            <p className='text-[11px] text-[#8A877D] leading-relaxed'>
              Side-by-side view · Grid products · No step navigation ·
              Mobile-friendly cart
            </p>
          </RadioOptionCard>

          {/* Wizard */}
          <RadioOptionCard
            value='wizard'
            currentValue={createOrderLayoutType}
            id='create-wizard'>
            <div className='flex items-center gap-2 mb-1'>
              <Layers className='h-3.5 w-3.5 text-[#57554D] shrink-0' />
              <span className='font-medium text-sm text-[#141413]'>
                Step-by-Step Wizard
              </span>
            </div>
            <p className='text-[11px] text-[#8A877D] leading-relaxed'>
              Products → Customer → Review · Guided workflow · Best for complex
              orders
            </p>
          </RadioOptionCard>
        </RadioGroup>
      </section>

      {/* Divider */}
      <div className='border-t border-dashed border-border/70' />

      {/* ── Oneko Cat (easter egg) ── */}
      <section>
        <SectionLabel icon={Cat} label='Oneko Cat' />
        <RadioGroup
          value={onekoEnabled ? "on" : "off"}
          onValueChange={(v) => setOnekoEnabled(v === "on")}
          className='grid grid-cols-2 gap-4'>
          {/* Enabled */}
          <RadioOptionCard
            value='on'
            currentValue={onekoEnabled ? "on" : "off"}
            id='oneko-on'>
            <div className='flex items-center gap-2 mb-1'>
              <Cat className='h-3.5 w-3.5 text-[#B85A3D] shrink-0' />
              <span className='font-semibold text-sm text-[#141413]'>
                Enabled
              </span>
            </div>
            <p className='text-[11px] text-[#8A877D] leading-relaxed'>
              A little cat chases your cursor around the screen · sleeps and
              scratches walls when you stop moving
            </p>
          </RadioOptionCard>

          {/* Disabled */}
          <RadioOptionCard
            value='off'
            currentValue={onekoEnabled ? "on" : "off"}
            id='oneko-off'>
            <div className='flex items-center gap-2 mb-1'>
              <Monitor className='h-3.5 w-3.5 text-[#57554D] shrink-0' />
              <span className='font-medium text-sm text-[#141413]'>
                Disabled
              </span>
            </div>
            <p className='text-[11px] text-[#8A877D] leading-relaxed'>
              Keep the cat off the screen
            </p>
          </RadioOptionCard>
        </RadioGroup>

        {onekoEnabled && (
          <>
            {/* ── Which critter ── */}
            <div className='mt-5'>
              <span className='text-[12px] font-medium text-[#57554D] mb-2 block'>
                Pick your critter
              </span>
              <div className='grid grid-cols-5 sm:grid-cols-10 gap-2'>
                {ONEKO_CRITTERS.map((option) => {
                  const isSelected = onekoCat === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setOnekoCat(option.value)}
                      className={cn(
                        "group relative flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-colors",
                        isSelected
                          ? "border-[#D97757] ring-1 ring-[#D97757] bg-[#D97757]/[0.04]"
                          : "border-[#E8E4DC] hover:border-[#D8D3C8] bg-transparent",
                      )}>
                      {/* Pixel critter preview (idle sitting frame) */}
                      <span
                        aria-hidden='true'
                        className='block h-7 w-7'
                        style={{
                          backgroundImage: `url(${option.sprite})`,
                          backgroundSize: "224px 112px",
                          backgroundPosition: "-84px -84px",
                          imageRendering: "pixelated",
                          filter: option.filter ?? "none",
                        }}
                      />
                      <span
                        className={cn(
                          "text-[10px] font-medium transition-colors",
                          isSelected
                            ? "text-[#141413]"
                            : "text-[#57554D] group-hover:text-[#141413]",
                        )}>
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Speed ── */}
            <div className='mt-5'>
              <span className='text-[12px] font-medium text-[#57554D] mb-2 block'>
                Speed
              </span>
              <RadioGroup
                value={onekoSpeed}
                onValueChange={setOnekoSpeed}
                className='grid grid-cols-3 gap-4'>
                {ONEKO_SPEEDS.map((option) => (
                  <RadioOptionCard
                    key={option.value}
                    value={option.value}
                    currentValue={onekoSpeed}
                    id={`oneko-speed-${option.value}`}>
                    <div className='flex items-center gap-2 mb-1'>
                      <Gauge className='h-3.5 w-3.5 text-[#B85A3D] shrink-0' />
                      <span className='font-semibold text-sm text-[#141413]'>
                        {option.label}
                      </span>
                    </div>
                    <p className='text-[11px] text-[#8A877D] leading-relaxed'>
                      {option.description}
                    </p>
                  </RadioOptionCard>
                ))}
              </RadioGroup>
            </div>

            {/* ── Bring a friend ── */}
            <div className='mt-5'>
              <span className='text-[12px] font-medium text-[#57554D] mb-2 block'>
                Company
              </span>
              <RadioGroup
                value={onekoFriend ? "on" : "off"}
                onValueChange={(v) => setOnekoFriend(v === "on")}
                className='grid grid-cols-2 gap-4'>
                <RadioOptionCard
                  value='on'
                  currentValue={onekoFriend ? "on" : "off"}
                  id='oneko-friend-on'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Heart className='h-3.5 w-3.5 text-[#B85A3D] shrink-0' />
                    <span className='font-semibold text-sm text-[#141413]'>
                      Bring a friend
                    </span>
                  </div>
                  <p className='text-[11px] text-[#8A877D] leading-relaxed'>
                    A second critter joins the chase from the other side of the
                    screen
                  </p>
                </RadioOptionCard>

                <RadioOptionCard
                  value='off'
                  currentValue={onekoFriend ? "on" : "off"}
                  id='oneko-friend-off'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Monitor className='h-3.5 w-3.5 text-[#57554D] shrink-0' />
                    <span className='font-medium text-sm text-[#141413]'>
                      Solo
                    </span>
                  </div>
                  <p className='text-[11px] text-[#8A877D] leading-relaxed'>
                    Just your critter chasing alone
                  </p>
                </RadioOptionCard>
              </RadioGroup>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const isMobile = useIsMobile();

  // On Mobile: Render bottom drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className='max-h-[85vh] p-0 flex flex-col rounded-t-2xl bg-[#FAF9F6] text-[#141413]'>
          {/* Drawer Drag handle */}
          <div className='mx-auto mt-2 h-1.5 w-12 rounded-full bg-[#D8D3C8]' />

          <DrawerHeader className='px-5 pt-3 pb-3 border-b border-[#E8E4DC] text-left'>
            <div className='flex items-center gap-2.5'>
              <div className='p-2 rounded-lg border border-[#D97757]/20 bg-[#D97757]/10 text-[#D97757]'>
                <Settings className='h-4 w-4' />
              </div>
              <div>
                <DrawerTitle className='text-base font-semibold tracking-tight text-[#141413]'>
                  Preferences
                </DrawerTitle>
                <DrawerDescription className='text-xs text-[#8A877D]'>
                  Customize your dashboard experience
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          {/* Scrollable content body */}
          <div className='flex-1 overflow-y-auto px-5 py-4'>
            <SettingsContentBody />
          </div>

          <DrawerFooter className='px-5 py-3 border-t border-[#E8E4DC] bg-[#FAF9F6] flex flex-row items-center justify-between gap-2'>
            <div className='flex items-center gap-1.5'>
              <Monitor className='h-3.5 w-3.5 text-[#8A877D]' />
              <span className='text-xs text-[#8A877D]'>
                Changes saved automatically
              </span>
            </div>
            <DrawerClose asChild>
              <Button
                size='sm'
                className='h-8 px-4 text-xs rounded-md bg-[#B85A3D] hover:bg-[#A34E34] text-white'>
                Done
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // On Desktop: Render standard centered dialog modal
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl p-0 gap-0 overflow-hidden rounded-xl bg-[#FAF9F6] text-[#141413] border border-[#E8E4DC] shadow-lg'>
        {/* ── Header ── */}
        <DialogHeader className='px-6 pt-6 pb-5 border-b border-[#E8E4DC] bg-[#FAF9F6]'>
          <div className='flex items-center gap-3'>
            <div className='p-2.5 rounded-lg border border-[#D97757]/20 bg-[#D97757]/10 text-[#D97757]'>
              <Settings className='h-5 w-5' />
            </div>
            <div>
              <DialogTitle className='text-lg font-semibold tracking-tight text-[#141413]'>
                Preferences
              </DialogTitle>
              <DialogDescription className='text-xs text-[#8A877D] mt-0.5'>
                Customize your dashboard experience
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Scrollable Body ── */}
        <ScrollArea className='max-h-[70vh]'>
          <div className='px-6 py-5'>
            <SettingsContentBody />
          </div>
        </ScrollArea>

        {/* ── Footer ── */}
        <div className='px-6 py-4 border-t border-[#E8E4DC] bg-[#FAF9F6] flex items-center justify-between gap-3'>
          <div className='flex items-center gap-1.5'>
            <Monitor className='h-3.5 w-3.5 text-[#8A877D]' />
            <span className='text-xs text-[#8A877D]'>
              Changes are saved automatically
            </span>
          </div>
          <Button
            size='sm'
            className={cn(
              "h-8 text-xs rounded-md bg-[#B85A3D] hover:bg-[#A34E34] text-white",
            )}
            onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
