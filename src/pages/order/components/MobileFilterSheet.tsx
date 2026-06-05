import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface MobileFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplyFilters: (filters: FilterOptions) => void
  initialFilters?: FilterOptions
}

export interface FilterOptions {
  statuses: string[]
  dateRange?: {
    from: Date
    to: Date
  }
  paymentStatus?: string[]
  minAmount?: number
  maxAmount?: number
}

const STATUS_OPTIONS = [
  { value: "processing", label: "Processing", color: "bg-blue-500" },
  { value: "shipped", label: "Shipped", color: "bg-purple-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "cancel", label: "Cancelled", color: "bg-red-500" },
  { value: "return", label: "Return", color: "bg-orange-500" },
]

const PAYMENT_STATUS_OPTIONS = [
  { value: "paid", label: "Fully Paid" },
  { value: "partial", label: "Partial Payment" },
  { value: "unpaid", label: "Unpaid" },
]

export function MobileFilterSheet({
  open,
  onOpenChange,
  onApplyFilters,
  initialFilters,
}: MobileFilterSheetProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    initialFilters?.statuses || []
  )
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string[]>(
    initialFilters?.paymentStatus || []
  )

  const handleStatusToggle = (value: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(value)
        ? prev.filter((s) => s !== value)
        : [...prev, value]
    )
  }

  const handlePaymentStatusToggle = (value: string) => {
    setSelectedPaymentStatus((prev) =>
      prev.includes(value)
        ? prev.filter((s) => s !== value)
        : [...prev, value]
    )
  }

  const handleApplyFilters = () => {
    onApplyFilters({
      statuses: selectedStatuses,
      paymentStatus: selectedPaymentStatus,
    })
    onOpenChange(false)
  }

  const handleClearAll = () => {
    setSelectedStatuses([])
    setSelectedPaymentStatus([])
  }

  const activeFilterCount =
    selectedStatuses.length + selectedPaymentStatus.length

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
          {/* Order Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Order Status</Label>
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

          {/* Payment Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Payment Status</Label>
              {selectedPaymentStatus.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPaymentStatus([])}
                  className="text-xs text-blue-600"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {PAYMENT_STATUS_OPTIONS.map((status) => {
                const isSelected = selectedPaymentStatus.includes(status.value)
                return (
                  <div
                    key={status.value}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <Checkbox
                      id={status.value}
                      checked={isSelected}
                      onCheckedChange={() =>
                        handlePaymentStatusToggle(status.value)
                      }
                    />
                    <Label
                      htmlFor={status.value}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {status.label}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Date Range - Placeholder for future implementation */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Date Range</Label>
            <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
              Coming soon
            </div>
          </div>

          {/* Amount Range - Placeholder for future implementation */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Amount Range</Label>
            <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
              Coming soon
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
