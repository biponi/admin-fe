import React, { useState } from "react";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Grid3X3,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  SlidersHorizontal,
  Tag,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../utils/functions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../components/ui/sheet";
import { ICategory } from "../interface";
import { ScrollArea } from "../../../components/ui/scroll-area";

interface MobileProductFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedTab: string;
  onTabChange: (tab: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: ICategory[];
  totalProducts: number;
  activeCount: number;
  inactiveCount: number;
  inStockCount: number;
  outOfStockCount: number;
  onRefresh: () => void;
}

const MobileProductFilters: React.FC<MobileProductFiltersProps> = ({
  searchValue,
  onSearchChange,
  selectedTab,
  onTabChange,
  selectedCategory,
  onCategoryChange,
  categories,
  totalProducts,
  activeCount,
  inactiveCount,
  inStockCount,
  outOfStockCount,
  onRefresh,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const tabConfig = [
    { key: "all", label: "All Products", icon: Grid3X3, count: totalProducts },
    { key: "active", label: "Active", icon: CheckCircle, count: activeCount },
    {
      key: "inactive",
      label: "Inactive",
      icon: AlertCircle,
      count: inactiveCount,
    },
    {
      key: "instock",
      label: "In Stock",
      icon: TrendingUp,
      count: inStockCount,
    },
    {
      key: "outofstock",
      label: "Out of Stock",
      icon: TrendingDown,
      count: outOfStockCount,
    },
  ];

  const currentTab =
    tabConfig.find((t) => t.key === selectedTab) || tabConfig[0];
  const selectedCategoryName =
    categories.find((c) => c.id === selectedCategory)?.name || "";

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedTab !== "all") count++;
    if (selectedCategory) count++;
    if (searchValue) count++;
    return count;
  };

  return (
    <div className='space-y-3 px-4 sm:hidden'>
      {/* Search Bar */}
      <div className='relative'>
        <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10'>
          <Search className='h-4 w-4' />
        </div>
        <Input
          type='text'
          placeholder='Search products, SKU...'
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className='pl-10 pr-12 h-10 bg-gray-50 border-0 rounded-xl text-sm placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-200'
        />
        {searchValue && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onSearchChange("")}
            className='absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full'>
            <X className='h-3 w-3' />
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className='flex items-center gap-2 justify-between'>
        {/* Main Filter Button */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button
              variant='outline'
              className='flex-1 h-9 bg-white border-gray-200 rounded-xl hover:bg-gray-50 transition-colors relative'>
              <div className='flex items-center gap-2 min-w-0'>
                <div
                  className={cn(
                    "h-2 w-2 rounded-full flex-shrink-0",
                    currentTab.key === "all"
                      ? "bg-gray-400"
                      : currentTab.key === "active"
                      ? "bg-green-500"
                      : currentTab.key === "inactive"
                      ? "bg-red-500"
                      : currentTab.key === "instock"
                      ? "bg-blue-500"
                      : "bg-orange-500"
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
                Filter Products
              </SheetTitle>
            </SheetHeader>

            <ScrollArea className='h-[calc(80vh-100px)] px-4'>
              <div className='space-y-6'>
                {/* Status Filter */}
                <div>
                  <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <Filter className='h-4 w-4' />
                    Product Status
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

                {/* Category Filter */}
                {categories.length > 0 && (
                  <div>
                    <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                      <Tag className='h-4 w-4' />
                      Category Filter
                    </h3>
                    <div className='grid grid-cols-1 gap-2 max-h-48 overflow-y-auto'>
                      <Button
                        variant={
                          selectedCategory === "" ? "default" : "outline"
                        }
                        onClick={() => onCategoryChange("")}
                        className={cn(
                          "h-10 justify-start transition-all duration-200 rounded-xl",
                          selectedCategory === ""
                            ? "bg-primary text-white shadow-lg"
                            : "bg-white hover:bg-gray-50 border-gray-200"
                        )}>
                        All Categories
                      </Button>
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={
                            selectedCategory === category.id
                              ? "default"
                              : "outline"
                          }
                          onClick={() => onCategoryChange(category.id)}
                          className={cn(
                            "h-10 justify-start transition-all duration-200 rounded-xl",
                            selectedCategory === category.id
                              ? "bg-primary text-white shadow-lg"
                              : "bg-white hover:bg-gray-50 border-gray-200"
                          )}>
                          <Tag className='h-3 w-3 mr-2' />
                          <span className='truncate'>{category.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4'>
                  <h3 className='font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                    <BarChart3 className='h-4 w-4' />
                    Quick Overview
                  </h3>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='bg-white rounded-xl p-3 text-center'>
                      <div className='text-2xl font-bold text-primary'>
                        {totalProducts}
                      </div>
                      <div className='text-xs text-gray-600'>
                        Total Products
                      </div>
                    </div>
                    <div className='bg-white rounded-xl p-3 text-center'>
                      <div className='text-2xl font-bold text-green-600'>
                        {activeCount}
                      </div>
                      <div className='text-xs text-gray-600'>
                        Active Products
                      </div>
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

        {/* Refresh Button */}
        <Button
          variant='outline'
          size='sm'
          onClick={onRefresh}
          className='h-9 px-3 bg-white border-gray-200 rounded-xl hover:bg-gray-50'>
          <RefreshCw className='h-4 w-4' />
        </Button>
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

          {selectedCategory && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 border-0 rounded-full'>
              <Tag className='h-2.5 w-2.5' />
              {selectedCategoryName}
              <button
                onClick={() => onCategoryChange("")}
                className='ml-1 hover:bg-blue-200 rounded-full p-0.5'>
                <X className='h-2.5 w-2.5' />
              </button>
            </Badge>
          )}

          {searchValue && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 border-0 rounded-full'>
              <Search className='h-2.5 w-2.5' />"{searchValue.substring(0, 15)}
              {searchValue.length > 15 ? "..." : ""}"
              <button
                onClick={() => onSearchChange("")}
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

export default MobileProductFilters;
