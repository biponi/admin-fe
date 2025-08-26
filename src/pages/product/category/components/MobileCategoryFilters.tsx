import React, { useState } from "react";
import {
  Filter,
  X,
  ChevronDown,
  Grid3X3,
  Check,
  Layers,
  TreePine,
  SlidersHorizontal,
  FolderTree,
  Eye,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../utils/functions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../../components/ui/sheet";
import { ScrollArea } from "../../../../components/ui/scroll-area";

interface MobileCategoryFiltersProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
  viewMode: "flat" | "tree";
  onViewModeChange: (mode: "flat" | "tree") => void;
  levelFilter: string;
  onLevelFilterChange: (level: string) => void;
  uniqueLevels: number[];
  totalCategories: number;
  activeCount: number;
  inactiveCount: number;
}

const MobileCategoryFilters: React.FC<MobileCategoryFiltersProps> = ({
  selectedTab,
  onTabChange,
  viewMode,
  onViewModeChange,
  levelFilter,
  onLevelFilterChange,
  uniqueLevels,
  totalCategories,
  activeCount,
  inactiveCount,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const tabConfig = [
    {
      key: "all",
      label: "All Categories",
      icon: Grid3X3,
      count: totalCategories,
    },
    { key: "active", label: "Active", icon: Check, count: activeCount },
    { key: "inactive", label: "Inactive", icon: X, count: inactiveCount },
  ];

  const currentTab =
    tabConfig.find((t) => t.key === selectedTab) || tabConfig[0];

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedTab !== "all") count++;
    if (levelFilter !== "all") count++;
    if (viewMode !== "flat") count++;
    return count;
  };

  return (
    <div className='space-y-4 px-4 sm:hidden'>
      {/* Filter Controls */}
      <div className='flex items-center gap-2 justify-between'>
        {/* Main Filter Button */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button
              variant='outline'
              className='flex-1 h-11 bg-white border-gray-200 rounded-xl hover:bg-gray-50 transition-colors relative'>
              <div className='flex items-center gap-2 min-w-0'>
                <div
                  className={cn(
                    "h-2 w-2 rounded-full flex-shrink-0",
                    currentTab.key === "all"
                      ? "bg-gray-400"
                      : currentTab.key === "active"
                      ? "bg-green-500"
                      : "bg-red-500"
                  )}
                />
                <span className='truncate text-sm font-medium'>
                  {currentTab.label}
                </span>
                {currentTab.count > 0 && (
                  <Badge
                    variant='secondary'
                    className='ml-1 px-1.5 py-0.5 text-xs bg-gray-100'>
                    {currentTab.count}
                  </Badge>
                )}
              </div>
              <ChevronDown className='h-4 w-4 ml-auto flex-shrink-0' />

              {/* Active Filters Indicator */}
              {getActiveFiltersCount() > 0 && (
                <div className='absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center'>
                  <span className='text-xs text-white font-bold'>
                    {getActiveFiltersCount()}
                  </span>
                </div>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent side='bottom' className='h-[80vh] rounded-t-3xl'>
            <SheetHeader className='text-left pb-6'>
              <SheetTitle className='flex items-center gap-2 text-xl'>
                <SlidersHorizontal className='h-5 w-5' />
                Filter Categories
              </SheetTitle>
            </SheetHeader>

            <ScrollArea className='h-[calc(80vh-8rem)]'>
              <div className='space-y-6'>
                {/* Status Filter */}
                <div>
                  <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <Filter className='h-4 w-4' />
                    Category Status
                  </h3>
                  <div className='grid grid-cols-1 gap-3'>
                    {tabConfig.map(({ key, label, icon: Icon, count }) => (
                      <Button
                        key={key}
                        variant={selectedTab === key ? "default" : "outline"}
                        onClick={() => {
                          onTabChange(key);
                        }}
                        className={cn(
                          "h-12 flex items-center justify-between px-4 transition-all duration-200 rounded-xl",
                          selectedTab === key
                            ? "bg-primary text-white shadow-lg"
                            : "bg-white hover:bg-gray-50 border-gray-200"
                        )}>
                        <div className='flex items-center gap-3'>
                          <Icon className='h-4 w-4' />
                          <span className='font-medium'>{label}</span>
                        </div>
                        <Badge
                          variant={
                            selectedTab === key ? "secondary" : "default"
                          }
                          className={cn(
                            "px-2 py-1",
                            selectedTab === key
                              ? "bg-white/20 text-white border-0"
                              : "bg-gray-100 text-gray-700"
                          )}>
                          {count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* View Mode Filter */}
                <div>
                  <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <Eye className='h-4 w-4' />
                    View Mode
                  </h3>
                  <div className='grid grid-cols-2 gap-3'>
                    <Button
                      variant={viewMode === "flat" ? "default" : "outline"}
                      onClick={() => onViewModeChange("flat")}
                      className={cn(
                        "h-12 flex flex-col items-center gap-1 transition-all duration-200 rounded-xl",
                        viewMode === "flat"
                          ? "bg-primary text-white shadow-lg"
                          : "bg-white hover:bg-gray-50 border-gray-200"
                      )}>
                      <Grid3X3 className='h-4 w-4' />
                      <span className='text-xs font-medium'>Flat View</span>
                    </Button>
                    <Button
                      variant={viewMode === "tree" ? "default" : "outline"}
                      onClick={() => onViewModeChange("tree")}
                      className={cn(
                        "h-12 flex flex-col items-center gap-1 transition-all duration-200 rounded-xl",
                        viewMode === "tree"
                          ? "bg-primary text-white shadow-lg"
                          : "bg-white hover:bg-gray-50 border-gray-200"
                      )}>
                      <TreePine className='h-4 w-4' />
                      <span className='text-xs font-medium'>Tree View</span>
                    </Button>
                  </div>
                </div>

                {/* Level Filter */}
                {uniqueLevels.length > 0 && (
                  <div>
                    <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                      <Layers className='h-4 w-4' />
                      Category Level
                    </h3>
                    <div className='grid grid-cols-2 gap-3'>
                      <Button
                        variant={levelFilter === "all" ? "default" : "outline"}
                        onClick={() => onLevelFilterChange("all")}
                        className={cn(
                          "h-10 transition-all duration-200 rounded-xl",
                          levelFilter === "all"
                            ? "bg-primary text-white shadow-lg"
                            : "bg-white hover:bg-gray-50 border-gray-200"
                        )}>
                        All Levels
                      </Button>
                      {uniqueLevels.map((level) => (
                        <Button
                          key={level}
                          variant={
                            levelFilter === level.toString()
                              ? "default"
                              : "outline"
                          }
                          onClick={() => onLevelFilterChange(level.toString())}
                          className={cn(
                            "h-10 transition-all duration-200 rounded-xl",
                            levelFilter === level.toString()
                              ? "bg-primary text-white shadow-lg"
                              : "bg-white hover:bg-gray-50 border-gray-200"
                          )}>
                          Level {level}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4'>
                  <h3 className='font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                    <FolderTree className='h-4 w-4' />
                    Quick Stats
                  </h3>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='bg-white rounded-xl p-3 text-center'>
                      <div className='text-2xl font-bold text-primary'>
                        {totalCategories}
                      </div>
                      <div className='text-xs text-gray-600'>Total</div>
                    </div>
                    <div className='bg-white rounded-xl p-3 text-center'>
                      <div className='text-2xl font-bold text-green-600'>
                        {activeCount}
                      </div>
                      <div className='text-xs text-gray-600'>Active</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className='mt-8 pb-safe'>
                <Button
                  onClick={() => setIsFilterOpen(false)}
                  className='w-full h-12 bg-primary text-white rounded-2xl text-base font-semibold'>
                  Apply Filters
                </Button>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='text-xs font-medium text-gray-600'>
            Active filters:
          </span>

          {selectedTab !== "all" && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary border-0 rounded-full'>
              Status: {currentTab.label}
              <button
                onClick={() => onTabChange("all")}
                className='ml-1 hover:bg-primary/20 rounded-full p-0.5'>
                <X className='h-2.5 w-2.5' />
              </button>
            </Badge>
          )}

          {levelFilter !== "all" && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 border-0 rounded-full'>
              <Layers className='h-2.5 w-2.5' />
              Level {levelFilter}
              <button
                onClick={() => onLevelFilterChange("all")}
                className='ml-1 hover:bg-blue-200 rounded-full p-0.5'>
                <X className='h-2.5 w-2.5' />
              </button>
            </Badge>
          )}

          {viewMode !== "flat" && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 border-0 rounded-full'>
              <TreePine className='h-2.5 w-2.5' />
              Tree View
              <button
                onClick={() => onViewModeChange("flat")}
                className='ml-1 hover:bg-green-200 rounded-full p-0.5'>
                <X className='h-2.5 w-2.5' />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileCategoryFilters;
