import React, { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { ListFilter, Search } from "lucide-react";
import { ICategory } from "../../../pages/product/interface";

interface CategoryFilterDropdownProps {
  categories: ICategory[];
  selectedCategory: string;
  setSelectedCategory: (categoryId: string) => void;
  showSearch?: boolean;
  showProductCounts?: boolean;
  filterLabel?: string;
}

const CategoryFilterDropdown: React.FC<CategoryFilterDropdownProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  showSearch = true,
  showProductCounts = true,
  filterLabel = "Filter by Category",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Create hierarchy structure for better organization
  const organizedCategories = useMemo(() => {
    const categoryMap = new Map<
      string,
      ICategory & { children: ICategory[] }
    >();

    // Initialize all categories in the map
    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    const rootCategories: (ICategory & { children: ICategory[] })[] = [];
    const childCategories: (ICategory & { children: ICategory[] })[] = [];

    // Separate root and child categories
    categories.forEach((category) => {
      const categoryWithChildren = categoryMap.get(category.id)!;

      if (category.parentId && categoryMap.has(category.parentId)) {
        // Add to parent's children
        const parent = categoryMap.get(category.parentId)!;
        parent.children.push(categoryWithChildren);
        childCategories.push(categoryWithChildren);
      } else {
        // Root level category
        rootCategories.push(categoryWithChildren);
      }
    });

    // Sort categories
    const sortedRoots = rootCategories.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Flatten for display with proper hierarchy
    const flattenForDisplay = (
      cats: (ICategory & { children: ICategory[] })[],
      level: number = 0
    ): (ICategory & { level: number })[] => {
      const result: (ICategory & { level: number })[] = [];
      cats.forEach((cat) => {
        result.push({ ...cat, level });
        if (cat.children.length > 0) {
          //@ts-ignore
          result.push(...flattenForDisplay(cat.children, level + 1));
        }
      });
      return result;
    };

    return flattenForDisplay(sortedRoots);
  }, [categories]);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return organizedCategories;

    const searchLower = searchTerm.toLowerCase();
    return organizedCategories.filter((category) =>
      category.name.toLowerCase().includes(searchLower)
    );
  }, [organizedCategories, searchTerm]);

  // Get active filter count for display
  const activeFilterCount = selectedCategory !== "all" ? 1 : 0;

  // Get selected category name for button text
  const selectedCategoryName = useMemo(() => {
    if (selectedCategory === "all") return null;
    const category = categories.find((cat) => cat.id === selectedCategory);
    return category?.name;
  }, [selectedCategory, categories]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Don't close dropdown to allow multiple interactions
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='h-7 gap-1'>
          <ListFilter className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
            Filter
            {activeFilterCount > 0 && (
              <span className='ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground'>
                {activeFilterCount}
              </span>
            )}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel>{filterLabel}</DropdownMenuLabel>
        {selectedCategoryName && (
          <div className='px-2 py-1 text-xs text-muted-foreground'>
            Active: {selectedCategoryName}
          </div>
        )}
        <DropdownMenuSeparator />

        {/* Search Input */}
        {showSearch && (
          <>
            <div className='p-2'>
              <div className='relative'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search categories...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='h-8 pl-8'
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Categories List */}
        <div className='max-h-60 overflow-y-auto'>
          {/* All option */}
          <DropdownMenuCheckboxItem
            checked={selectedCategory === "all"}
            onCheckedChange={() => handleCategorySelect("all")}
            className='font-medium'>
            All Categories
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          {/* Filtered categories */}
          {filteredCategories.length === 0 ? (
            <div className='px-2 py-4 text-sm text-muted-foreground text-center'>
              {searchTerm ? "No categories found" : "No categories available"}
            </div>
          ) : (
            filteredCategories.map((category) => {
              const productCount =
                showProductCounts && (category.totalProducts ?? 0) > 0
                  ? ` (${category.totalProducts})`
                  : "";

              return (
                <DropdownMenuCheckboxItem
                  key={category.id}
                  checked={selectedCategory === category.id}
                  onCheckedChange={() => handleCategorySelect(category.id)}
                  className='flex items-center'>
                  <span
                    style={{ paddingLeft: `${category.level * 12}px` }}
                    className='flex-1 truncate'>
                    {category.level > 0 && (
                      <span className='text-muted-foreground mr-1'>
                        {"└─".repeat(Math.min(category.level, 3))}
                      </span>
                    )}
                    {category.name}
                    {productCount}
                  </span>
                </DropdownMenuCheckboxItem>
              );
            })
          )}
        </div>

        {/* Clear filter option */}
        {selectedCategory !== "all" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={false}
              onCheckedChange={() => handleCategorySelect("all")}
              className='text-muted-foreground'>
              Clear filter
            </DropdownMenuCheckboxItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CategoryFilterDropdown;
