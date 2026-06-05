import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "status"

interface MobileSortSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSort: (sortBy: SortOption) => void
  initialSort?: SortOption
}

const SORT_OPTIONS = [
  { value: "date-desc" as SortOption, label: "Newest First", icon: "📅⬇️" },
  { value: "date-asc" as SortOption, label: "Oldest First", icon: "📅⬆️" },
  { value: "amount-desc" as SortOption, label: "Highest Amount", icon: "💰⬇️" },
  { value: "amount-asc" as SortOption, label: "Lowest Amount", icon: "💰⬆️" },
  { value: "status" as SortOption, label: "Status", icon: "📋" },
]

export function MobileSortSheet({
  open,
  onOpenChange,
  onSort,
  initialSort = "date-desc",
}: MobileSortSheetProps) {
  const [selectedSort, setSelectedSort] = useState<SortOption>(initialSort)

  const handleApplySort = () => {
    onSort(selectedSort)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md pb-safe-bottom">
        <SheetHeader>
          <SheetTitle>Sort Orders</SheetTitle>
          <p className="text-sm text-gray-500">
            Choose how to order your list
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          <RadioGroup value={selectedSort} onValueChange={(v) => setSelectedSort(v as SortOption)}>
            {SORT_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedSort === option.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedSort(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer font-medium"
                  >
                    {option.label}
                  </Label>
                  {selectedSort === option.value && (
                    <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <SheetFooter className="border-t pt-4">
          <Button onClick={handleApplySort} className="w-full">
            Apply Sorting
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
