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
import { Separator } from "@/components/ui/separator"

interface MobileProductFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplyFilters: (filters: ProductFilterOptions) => void
  initialFilters?: ProductFilterOptions
  categories: Array<{ id: string; name: string }>
}

export interface ProductFilterOptions {
  statuses: string[]
  categories: string[]
  stockStatus: string[]
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "bg-emerald-500" },
  { value: "inactive", label: "Inactive", color: "bg-orange-500" },
]

const STOCK_STATUS_OPTIONS = [
  { value: "instock", label: "In Stock", color: "bg-blue-500" },
  { value: "outofstock", label: "Out of Stock", color: "bg-red-500" },
]

export function MobileProductFilterSheet({
  open,
  onOpenChange,
  onApplyFilters,
  initialFilters,
  categories,
}: MobileProductFilterSheetProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    initialFilters?.statuses || []
  )
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters?.categories || []
  )
  const [selectedStockStatus, setSelectedStockStatus] = useState<string[]>(
    initialFilters?.stockStatus || []
  )

  const handleStatusToggle = (value: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(value)
        ? prev.filter((s) => s !== value)
        : [...prev, value]
    )
  }

  const handleCategoryToggle = (value: string) => {
    setSelectedCategories((prev) =>
      prev.includes(value)
        ? prev.filter((c) => c !== value)
        : [...prev, value]
    )
  }

  const handleStockStatusToggle = (value: string) => {
    setSelectedStockStatus((prev) =>
      prev.includes(value)
        ? prev.filter((s) => s !== value)
        : [...prev, value]
    )
  }

  const handleApplyFilters = () => {
    onApplyFilters({
      statuses: selectedStatuses,
      categories: selectedCategories,
      stockStatus: selectedStockStatus,
    })
    onOpenChange(false)
  }

  const handleClearAll = () => {
    setSelectedStatuses([])
    setSelectedCategories([])
    setSelectedStockStatus([])
  }

  const activeFilterCount =
    selectedStatuses.length + selectedCategories.length + selectedStockStatus.length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md pb-safe-bottom flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          {activeFilterCount > 0 && (
            <p className="text-sm text-gray-500">
              {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
            </p>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-6 -mx-6 px-6">
          {/* Product Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Product Status</Label>
              {selectedStatuses.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStatuses([])}
                  className="text-xs text-blue-600"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => {
                const isSelected = selectedStatuses.includes(status.value)
                return (
                  <button
                    key={status.value}
                    onClick={() => handleStatusToggle(status.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${status.color}`} />
                      {status.label}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Stock Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Stock Status</Label>
              {selectedStockStatus.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStockStatus([])}
                  className="text-xs text-blue-600"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {STOCK_STATUS_OPTIONS.map((status) => {
                const isSelected = selectedStockStatus.includes(status.value)
                return (
                  <button
                    key={status.value}
                    onClick={() => handleStockStatusToggle(status.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${status.color}`} />
                      {status.label}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Categories</Label>
              {selectedCategories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategories([])}
                  className="text-xs text-blue-600"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id)
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <SheetFooter className="flex gap-3 border-t pt-4 shrink-0">
          <Button
            variant="outline"
            onClick={handleClearAll}
            disabled={activeFilterCount === 0}
            className="flex-1"
          >
            Clear All
          </Button>
          <Button
            onClick={handleApplyFilters}
            disabled={activeFilterCount === 0}
            className="flex-1"
          >
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
