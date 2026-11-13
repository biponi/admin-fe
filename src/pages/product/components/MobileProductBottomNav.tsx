import { ArrowUpDown, FolderTree, Search, ListFilter, Table2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface MobileActiveFilter {
  key: string
  label: string
  onClear: () => void
}

interface MobileProductBottomNavProps {
  onSearchClick: () => void
  onStatusClick: () => void
  onCategoryClick: () => void
  onSortClick: () => void
  onMetaClick: () => void
  hasActiveStatus?: boolean
  hasActiveCategory?: boolean
  hasActiveSort?: boolean
  hasActiveMeta?: boolean
  isInactiveView?: boolean
  /** Active filters shown as clearable chips above the icon row. */
  activeFilters?: MobileActiveFilter[]
}

export function MobileProductBottomNav({
  onSearchClick,
  onStatusClick,
  onCategoryClick,
  onSortClick,
  onMetaClick,
  hasActiveStatus = false,
  hasActiveCategory = false,
  hasActiveSort = false,
  hasActiveMeta = false,
  isInactiveView = false,
  activeFilters = [],
}: MobileProductBottomNavProps) {
  const navItems = [
    {
      label: "Search",
      icon: Search,
      onClick: onSearchClick,
      isActive: false,
    },
    {
      label: "Status",
      icon: ListFilter,
      onClick: onStatusClick,
      isActive: hasActiveStatus,
    },
    {
      label: "Category",
      icon: FolderTree,
      onClick: onCategoryClick,
      isActive: hasActiveCategory,
    },
    {
      label: "Meta",
      icon: Table2,
      onClick: onMetaClick,
      isActive: hasActiveMeta,
    },
    {
      label: "Sort",
      icon: ArrowUpDown,
      onClick: onSortClick,
      isActive: hasActiveSort,
    },
  ]

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] pt-2 sm:hidden">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white/95 shadow-[0_16px_40px_rgba(20,20,19,0.16)] backdrop-blur-md">
        {/* Active filter chips — see & clear filters without opening sheets */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200/80 px-2.5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={filter.onClear}
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition active:scale-95",
                  isInactiveView
                    ? "border-orange-200 bg-orange-50 text-orange-700"
                    : "border-slate-200 bg-white text-[#141413]",
                )}
              >
                <span className="max-w-[140px] truncate">{filter.label}</span>
                <X className="h-3 w-3 shrink-0 opacity-60" />
              </button>
            ))}
          </div>
        )}

        <nav className="grid grid-cols-5 gap-1 px-2 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <Button
                key={item.label}
                variant="ghost"
                size="lg"
                onClick={item.onClick}
                className={cn(
                  "relative h-14 flex-col gap-1 rounded-xl px-1 py-1.5 transition-all active:scale-[0.97]",
                  item.isActive
                    ? "bg-white hover:bg-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-[#141413]",
                )}
              >
                <span className="flex flex-col items-center gap-1">
                  {/* Icon tile — dark #141413 when active (orange accent in
                      the inactive-products view, matching the price accent) */}
                  <span
                    className={cn(
                      "flex h-6 w-9 items-center justify-center rounded-md transition-colors",
                      item.isActive
                        ? isInactiveView
                          ? "bg-orange-500 text-white"
                          : "bg-[#141413] text-white"
                        : "text-slate-500",
                    )}
                  >
                    <Icon
                      className="h-[18px] w-[18px]"
                      strokeWidth={item.isActive ? 2.25 : 2}
                    />
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wide leading-none",
                      item.isActive
                        ? isInactiveView
                          ? "text-orange-600"
                          : "text-[#141413]"
                        : "text-slate-500",
                    )}
                  >
                    {item.label}
                  </span>
                </span>

                {/* Active dot */}
                {item.isActive && (
                  <span
                    className={cn(
                      "absolute bottom-0.5 h-1 w-1 rounded-full",
                      isInactiveView ? "bg-orange-500" : "bg-[#141413]",
                    )}
                  />
                )}
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
