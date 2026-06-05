import { ArrowUpDown, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileBottomNavProps {
  onSearchClick: () => void
  onFilterClick: () => void
  onSortClick: () => void
  activeFilterCount?: number
}

export function MobileBottomNav({
  onSearchClick,
  onFilterClick,
  onSortClick,
  activeFilterCount = 0
}: MobileBottomNavProps) {
  const navItems = [
    {
      label: "Search",
      icon: Search,
      onClick: onSearchClick,
      isActive: false,
    },
    {
      label: "Filters",
      icon: Filter,
      onClick: onFilterClick,
      isActive: activeFilterCount > 0,
      badge: activeFilterCount,
    },
    {
      label: "Sort",
      icon: ArrowUpDown,
      onClick: onSortClick,
      isActive: false,
    },
  ]

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] pt-2 sm:hidden">
      <div className="mx-auto max-w-md rounded-2xl border border-gray-200/80 bg-white/95 px-2 py-2 shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur">
        <div className="grid grid-cols-3 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <Button
                key={item.label}
                variant="ghost"
                size="lg"
                onClick={item.onClick}
                className={`relative h-14 rounded-xl px-2 py-1.5 transition-all active:scale-[0.97] ${
                  item.isActive
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="flex flex-col items-center gap-1">
                  <span
                    className={`relative flex h-6 w-8 items-center justify-center rounded-full ${
                      item.isActive ? "bg-blue-600 text-white" : "text-gray-500"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {!!item.badge && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-semibold leading-none">
                    {item.label}
                  </span>
                </span>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
