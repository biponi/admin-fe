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
import { Label } from "@/components/ui/label"
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Sparkles,
  CalendarPlus,
  Pencil,
  ArrowUpAZ,
  DollarSign,
  Package,
  X,
} from "lucide-react"
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
      <DrawerContent className="rounded-t-2xl max-h-[85vh]">
        {/* Header with close button */}
        <DrawerHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-indigo-600" />
            <div>
              <DrawerTitle className="text-base font-semibold">Sort Products</DrawerTitle>
              <DrawerDescription className="text-xs">Choose how to organize your products</DrawerDescription>
            </div>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto max-h-[65vh]">
          {/* Direction toggle */}
          <div className="flex items-center gap-2 py-3">
            <Label className="text-sm font-medium text-gray-700">Direction</Label>
            <div className="ml-auto flex items-center rounded-lg border border-gray-200 bg-white p-0.5">
              <button
                onClick={() => setSelectedOrder("desc")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedOrder === "desc"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <ArrowDown className="h-3 w-3" />
                Desc
              </button>
              <button
                onClick={() => setSelectedOrder("asc")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedOrder === "asc"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <ArrowUp className="h-3 w-3" />
                Asc
              </button>
            </div>
          </div>

          {/* Sort field options */}
          <div className="space-y-2">
            {SORT_FIELDS.map((option) => {
              const isSelected = selectedField === option.value
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedField(option.value)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isSelected ? "text-white" : "text-gray-500"}`} />
                      <Label
                        className={`text-sm font-semibold ${
                          isSelected ? "text-white" : ""
                        }`}
                      >
                        {option.label}
                      </Label>
                    </div>
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <DrawerFooter className="pt-0 pb-6">
          <Button onClick={handleApplySort} className="w-full">
            Apply Sort
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
