import { useState } from "react"
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
import {
  ArrowUp,
  ArrowDown,
  Sparkles,
  CalendarPlus,
  Pencil,
  ArrowUpAZ,
  DollarSign,
  Package,
  PackageX,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { SortField, SortOrder } from "../hooks/useProductList"

interface MobileProductSortSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSort: (field: SortField, order: SortOrder) => void
  initialField?: SortField
  initialOrder?: SortOrder
}

const SORT_FIELDS: Array<{
  value: SortField
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { value: "priority", label: "Priority", icon: Sparkles },
  { value: "createdAt", label: "Created", icon: CalendarPlus },
  { value: "updatedAt", label: "Updated", icon: Pencil },
  { value: "name", label: "Name", icon: ArrowUpAZ },
  { value: "price", label: "Price", icon: DollarSign },
  { value: "quantity", label: "Stock", icon: Package },
  { value: "outofstock", label: "Out of Stock", icon: PackageX },
]

export function MobileProductSortSheet({
  open,
  onOpenChange,
  onSort,
  initialField = "priority",
  initialOrder = "desc",
}: MobileProductSortSheetProps) {
  const [selectedField, setSelectedField] = useState<SortField>(initialField)
  const [selectedOrder, setSelectedOrder] = useState<SortOrder>(initialOrder)

  const handleApplySort = () => {
    onSort(selectedField, selectedOrder)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex flex-row items-start justify-between border-b border-slate-200/80 pb-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Arrange
            </span>
            <DrawerTitle className="text-base font-semibold text-[#141413]">
              Sort products
            </DrawerTitle>
            <DrawerDescription className="mt-0.5 text-xs text-slate-400">
              Pick a field and direction
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

        <div className="space-y-4 overflow-y-auto bg-white px-3 py-3" style={{ maxHeight: "58vh" }}>
          {/* Direction toggle */}
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Direction
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedOrder("desc")}
                className={cn(
                  "flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                  selectedOrder === "desc"
                    ? "border-[#141413] bg-[#141413] text-white"
                    : "border-slate-200 text-slate-500",
                )}
              >
                <ArrowDown className="h-3 w-3" />
                Desc
              </button>
              <button
                onClick={() => setSelectedOrder("asc")}
                className={cn(
                  "flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                  selectedOrder === "asc"
                    ? "border-[#141413] bg-[#141413] text-white"
                    : "border-slate-200 text-slate-500",
                )}
              >
                <ArrowUp className="h-3 w-3" />
                Asc
              </button>
            </div>
          </div>

          {/* Sort field options */}
          <div className="space-y-1.5">
            {SORT_FIELDS.map((option) => {
              const isSelected = selectedField === option.value
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedField(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-3.5 py-3 text-[13px] font-medium transition-colors",
                    isSelected
                      ? "border-[#141413] bg-white text-[#141413]"
                      : "border-slate-200 bg-white text-slate-600 active:bg-slate-50",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
                        isSelected
                          ? "bg-[#141413] text-white"
                          : "bg-white text-slate-500",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {option.label}
                  </span>
                  {isSelected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#141413]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <DrawerFooter className="border-t border-slate-200/80 bg-white pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <Button
            onClick={handleApplySort}
            className="h-11 w-full rounded-xl bg-[#141413] text-[13px] font-semibold text-white hover:bg-[#2a2a2a]"
          >
            Apply sort
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
