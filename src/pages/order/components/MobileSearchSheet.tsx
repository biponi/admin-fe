import { useState } from "react"
import { Search, X, Clock, XCircle } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MobileSearchSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchValue: string
  onSearchChange: (value: string) => void
}

// Mock recent searches - in real app, this would come from localStorage or API
const mockRecentSearches = [
  "John Doe",
  "01712345678",
  "Dhaka",
  "Steadfast",
]

export function MobileSearchSheet({
  open,
  onOpenChange,
  searchValue,
  onSearchChange,
}: MobileSearchSheetProps) {
  const [localValue, setLocalValue] = useState(searchValue)

  const handleApplySearch = () => {
    onSearchChange(localValue)
    onOpenChange(false)
  }

  const handleClearSearch = () => {
    setLocalValue("")
    onSearchChange("")
  }

  const handleRecentSearch = (term: string) => {
    setLocalValue(term)
    onSearchChange(term)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md pb-safe-bottom">
        <SheetHeader>
          <SheetTitle>Search Orders</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search orders, customers..."
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleApplySearch()
                }
              }}
              className="pl-12 pr-12 h-12 text-base"
              autoFocus
            />
            {localValue && (
              <button
                onClick={() => setLocalValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <XCircle className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleApplySearch}
              disabled={!localValue}
              className="flex-1"
              size="lg"
            >
              Search
            </Button>
            <Button
              onClick={handleClearSearch}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              Clear
            </Button>
          </div>

          {/* Recent Searches */}
          {mockRecentSearches.length > 0 && !localValue && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Recent Searches
              </h3>
              <div className="space-y-2">
                {mockRecentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(term)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="flex-1 text-sm">{term}</span>
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-gray-600"
              >
                Clear Recent Searches
              </Button>
            </div>
          )}

          {/* Search Tips */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Search Tips
            </h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Search by customer name or phone</li>
              <li>• Search by order number</li>
              <li>• Search by location (district, area)</li>
              <li>• Search by courier provider</li>
            </ul>
          </div>
        </div>

        {/* Active Search Indicator */}
        {searchValue && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active search:</span>
              <Badge className="bg-blue-100 text-blue-700 border-0">
                "{searchValue}"
              </Badge>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
