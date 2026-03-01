import React, { useState, useMemo } from "react";
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
  ChevronRight,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";

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

interface CategoryTreeNode extends ICategory {
  children?: CategoryTreeNode[];
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

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

  // Build category tree from flat list
  const categoryTree = useMemo(() => {
    const buildTree = (flatCategories: ICategory[]): CategoryTreeNode[] => {
      const categoryMap = new Map<string, CategoryTreeNode>();
      const rootCategories: CategoryTreeNode[] = [];

      // Create map of all categories
      flatCategories.forEach((category) => {
        categoryMap.set(category.id, { ...category, children: [] });
      });

      // Build tree structure
      flatCategories.forEach((category) => {
        const categoryNode = categoryMap.get(category.id)!;

        if (category.parentId && categoryMap.has(category.parentId)) {
          const parent = categoryMap.get(category.parentId)!;
          if (!parent.children) parent.children = [];
          parent.children.push(categoryNode);
        } else if (!category.parentId || category.level === 0) {
          rootCategories.push(categoryNode);
        }
      });

      return rootCategories;
    };

    return buildTree(categories);
  }, [categories]);

  const toggleCategoryExpanded = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Category Tree Component
  const CategoryTree: React.FC<{
    categories: CategoryTreeNode[];
    level?: number;
  }> = ({ categories, level = 0 }) => {
    // Separate categories into parents (with children) and leaves (without children)
    const parentCategories = categories.filter(
      (cat) => cat.children && cat.children.length > 0,
    );
    const leafCategories = categories.filter(
      (cat) => !cat.children || cat.children.length === 0,
    );

    return (
      <div className='space-y-1'>
        {/* Render parent categories - full width */}
        {parentCategories.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const isSelected = selectedCategory === category.id;

          return (
            <div key={category.id} className='space-y-1'>
              <Collapsible
                open={isExpanded}
                onOpenChange={() => toggleCategoryExpanded(category.id)}>
                <div className='flex items-stretch gap-1'>
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => onCategoryChange(category.id)}
                    className={cn(
                      "flex-1 h-9 justify-between transition-all duration-200 rounded-lg text-left font-medium",
                      isSelected
                        ? "bg-primary text-white shadow-md"
                        : "bg-white hover:bg-gray-50 border-gray-200",
                      level > 0 && "ml-0",
                    )}
                    style={{
                      paddingLeft: `${level * 12 + 10}px`,
                      paddingRight: "10px",
                    }}>
                    <span className='truncate flex-1 text-sm'>
                      {category.name}
                    </span>
                    {category.totalProducts !== undefined && (
                      <Badge
                        variant='secondary'
                        className={cn(
                          "ml-1 px-1.5 py-0 text-[10px] font-normal shrink-0",
                          isSelected
                            ? "bg-white/20 text-white border-0"
                            : "bg-gray-100 text-gray-600",
                        )}>
                        {category.totalProducts}
                      </Badge>
                    )}
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-9 w-9 p-0 border-gray-200 rounded-lg hover:bg-gray-50'>
                      {isExpanded ? (
                        <ChevronDown className='h-3.5 w-3.5' />
                      ) : (
                        <ChevronRight className='h-3.5 w-3.5' />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className='space-y-1 mt-1'>
                  {/* Child container with visual distinction */}
                  <div
                    className={cn(
                      "pt-1 pb-1 rounded-lg",
                      level === 0 &&
                        "bg-gradient-to-r from-gray-50 to-purple-50 border shadow-md border-primary/30 p-2",
                    )}>
                    <CategoryTree
                      //@ts-ignore
                      categories={category?.children}
                      level={level + 1}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}

        {/* Render leaf categories - two per row */}
        {leafCategories.length > 0 && (
          <div className='grid grid-cols-2 gap-1'>
            {leafCategories.map((category) => {
              const isSelected = selectedCategory === category.id;

              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => onCategoryChange(category.id)}
                  className={cn(
                    "h-9 justify-between transition-all duration-200 rounded-lg",
                    isSelected
                      ? "bg-primary text-white shadow-md"
                      : "bg-white hover:bg-gray-50 border-gray-200",
                  )}
                  style={{
                    paddingLeft: `${level * 12 + 10}px`,
                    paddingRight: "8px",
                  }}>
                  <span className='truncate flex-1 text-left text-xs'>
                    {category.name}
                  </span>
                  {category.totalProducts !== undefined && (
                    <Badge
                      variant='secondary'
                      className={cn(
                        "ml-1 px-1 py-0 text-[10px] font-normal shrink-0",
                        isSelected
                          ? "bg-white/20 text-white border-0"
                          : "bg-gray-100 text-gray-600",
                      )}>
                      {category.totalProducts}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const currentTab =
    tabConfig.find((t) => t.key === selectedTab) || tabConfig[0];

  const selectedCategoryName = useMemo(() => {
    const findCategory = (cats: CategoryTreeNode[]): string => {
      for (const cat of cats) {
        if (cat.id === selectedCategory) return cat.name;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return "";
    };
    return findCategory(categoryTree);
  }, [categoryTree, selectedCategory]);

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
                            : "bg-orange-500",
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

          <SheetContent side='bottom' className='h-[85vh] rounded-t-3xl p-0'>
            <SheetHeader className='text-left p-6 pb-4 border-b border-gray-100'>
              <SheetTitle className='flex items-center gap-2 text-xl'>
                <SlidersHorizontal className='h-5 w-5' />
                Filter Products
              </SheetTitle>
            </SheetHeader>

            <ScrollArea className='h-[calc(85vh-140px)]'>
              <div className='px-6 py-4 space-y-6'>
                {/* Status Filter */}
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                    <Filter className='h-4 w-4' />
                    Product Status
                  </h3>
                  <div className='grid grid-cols-2 gap-2'>
                    {tabConfig.map(({ key, label, icon: Icon, count }) => (
                      <Button
                        key={key}
                        variant={selectedTab === key ? "default" : "outline"}
                        onClick={() => {
                          onTabChange(key);
                        }}
                        className={cn(
                          "h-11 flex items-center justify-between px-4 transition-all duration-200 rounded-xl",
                          selectedTab === key
                            ? "bg-primary text-white shadow-lg"
                            : "bg-white hover:bg-gray-50 border-gray-200",
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
                            "px-2 py-0.5 text-xs",
                            selectedTab === key
                              ? "bg-white/20 text-white border-0"
                              : "bg-gray-100 text-gray-700",
                          )}>
                          {count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                {categoryTree.length > 0 && (
                  <div>
                    <div className='flex items-center justify-between mb-3'>
                      <h3 className='font-semibold text-gray-900 flex items-center gap-2'>
                        <Tag className='h-4 w-4' />
                        Category Filter
                      </h3>
                      {selectedCategory && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            onCategoryChange("");
                            setExpandedCategories(new Set());
                          }}
                          className='h-7 px-2 text-xs text-gray-600 hover:text-gray-900'>
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className='space-y-1 max-h-96 overflow-y-auto pr-2'>
                      {/* All Categories Button */}
                      <Button
                        variant={
                          selectedCategory === "" ? "default" : "outline"
                        }
                        onClick={() => onCategoryChange("")}
                        className={cn(
                          "w-full h-10 justify-start transition-all duration-200 rounded-xl mb-2",
                          selectedCategory === ""
                            ? "bg-primary text-white shadow-lg"
                            : "bg-white hover:bg-gray-50 border-gray-200",
                        )}>
                        <Grid3X3 className='h-3 w-3 mr-2' />
                        All Categories
                        <Badge
                          variant='secondary'
                          className={cn(
                            "ml-auto px-1.5 py-0.5 text-xs",
                            selectedCategory === ""
                              ? "bg-white/20 text-white border-0"
                              : "bg-gray-100 text-gray-700",
                          )}>
                          {totalProducts}
                        </Badge>
                      </Button>

                      {/* Hierarchical Category Tree */}
                      <CategoryTree categories={categoryTree} />
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
                    <div className='bg-white rounded-xl p-3 text-center'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {inStockCount}
                      </div>
                      <div className='text-xs text-gray-600'>In Stock</div>
                    </div>
                    <div className='bg-white rounded-xl p-3 text-center'>
                      <div className='text-2xl font-bold text-orange-600'>
                        {outOfStockCount}
                      </div>
                      <div className='text-xs text-gray-600'>Out of Stock</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Apply Button - Fixed at bottom */}
            <div className='p-6 pt-3 border-t border-gray-100 bg-white'>
              <Button
                onClick={() => setIsFilterOpen(false)}
                className='w-full h-12 bg-primary text-white rounded-2xl text-base font-semibold shadow-lg hover:shadow-xl transition-all'>
                Apply Filters
              </Button>
            </div>
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
