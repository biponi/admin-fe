import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TabOption {
  value: string
  label: string
  badgeClass: string
}

interface MobileStatusDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (tab: string) => void
  options: TabOption[]
  counts: Record<string, number>
  selectedTab: string
  isInactiveView?: boolean
}

export function MobileStatusDrawer({
  open,
  onOpenChange,
  onSelect,
  options,
  counts,
  selectedTab,
  isInactiveView = false,
}: MobileStatusDrawerProps) {
  const handleSelect = (value: string) => {
    onSelect(value)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="flex flex-row items-start justify-between border-b border-slate-200/80 pb-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Filter
            </span>
            <DrawerTitle className="text-base font-semibold text-[#141413]">
              Status
            </DrawerTitle>
            <DrawerDescription className="mt-0.5 text-xs text-slate-400">
              Show products matching one status
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 shrink-0 rounded-md border border-slate-200 bg-white p-0 text-slate-400 hover:text-[#141413]"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="overflow-y-auto bg-white px-3 py-3" style={{ maxHeight: "52vh" }}>
          <div className="space-y-1.5">
            {options.map((option) => {
              const isSelected = selectedTab === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-3.5 py-3 text-[13px] font-medium transition-colors",
                    isSelected
                      ? isInactiveView
                        ? "border-orange-300 bg-white text-orange-600"
                        : "border-[#141413] bg-white text-[#141413]"
                      : "border-slate-200 bg-white text-slate-600 active:bg-slate-50",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        isSelected
                          ? isInactiveView
                            ? "border-orange-500 bg-orange-500 text-white"
                            : "border-[#141413] bg-[#141413] text-white"
                          : "border-slate-300",
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    {option.label}
                  </span>
                  <span
                    className={cn(
                      "rounded-md border px-1.5 py-px text-[11px] font-semibold",
                      isSelected
                        ? isInactiveView
                          ? "border-orange-200 bg-orange-50 text-orange-600"
                          : "border-slate-200 bg-white text-[#141413]"
                        : option.badgeClass,
                    )}
                  >
                    {counts[option.value]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <DrawerFooter className="border-t border-slate-200/80 bg-white pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <DrawerClose asChild>
            <Button className="h-11 w-full rounded-xl bg-[#141413] text-[13px] font-semibold text-white hover:bg-[#2a2a2a]">
              Done
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
