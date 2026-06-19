import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "stock-asc"
  | "stock-desc"
  | "updated-desc"
  | "updated-asc"

interface MobileProductSortSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSort: (sortBy: SortOption) => void
  initialSort?: SortOption
}

const SORT_OPTIONS: Array<{
  value: SortOption
  label: string
  description: string
}> = [
  {
    value: "name-asc",
    label: "Name (A-Z)",
    description: "Alphabetical order",
  },
  {
    value: "name-desc",
    label: "Name (Z-A)",
    description: "Reverse alphabetical",
  },
  {
    value: "price-asc",
    label: "Price (Low to High)",
    description: "Cheapest first",
  },
  {
    value: "price-desc",
    label: "Price (High to Low)",
    description: "Most expensive first",
  },
  {
    value: "stock-asc",
    label: "Stock (Low to High)",
    description: "Lowest stock first",
  },
  {
    value: "stock-desc",
    label: "Stock (High to Low)",
    description: "Highest stock first",
  },
  {
    value: "updated-desc",
    label: "Recently Updated",
    description: "Newest first",
  },
  {
    value: "updated-asc",
    label: "Oldest Updated",
    description: "Oldest first",
  },
]

export function MobileProductSortSheet({
  open,
  onOpenChange,
  onSort,
  initialSort = "updated-desc",
}: MobileProductSortSheetProps) {
  const [selectedSort, setSelectedSort] = useState<SortOption>(initialSort)

  const handleApplySort = () => {
    onSort(selectedSort)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md pb-safe-bottom flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>Sort Products</SheetTitle>
          <p className="text-sm text-gray-500">
            Choose how to organize your products
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-2 -mx-6 px-6">
          {SORT_OPTIONS.map((option) => {
            const isSelected = selectedSort === option.value
            return (
              <button
                key={option.value}
                onClick={() => setSelectedSort(option.value)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label
                      className={`text-sm font-semibold ${
                        isSelected ? "text-white" : ""
                      }`}
                    >
                      {option.label}
                    </Label>
                    <p
                      className={`text-xs mt-0.5 ${
                        isSelected ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {option.description}
                    </p>
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

        <SheetFooter className="border-t pt-4 shrink-0">
          <Button onClick={handleApplySort} className="w-full">
            Apply Sort
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
