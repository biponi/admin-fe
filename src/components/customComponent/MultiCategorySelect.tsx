import React, { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { ChevronDown, Search, X, Check, Star } from "lucide-react";
import { ICategory } from "../../pages/product/interface";

interface MultiCategorySelectProps {
  categories: ICategory[];
  selectedCategoryIds: string[];
  primaryCategoryId: string;
  setSelectedCategoryIds: (ids: string[]) => void;
  setPrimaryCategoryId: (id: string) => void;
  maxCategories?: number;
  disabled?: boolean;
}

const MultiCategorySelect: React.FC<MultiCategorySelectProps> = ({
  categories,
  selectedCategoryIds,
  primaryCategoryId,
  setSelectedCategoryIds,
  setPrimaryCategoryId,
  maxCategories = 5,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Get selected categories
  const selectedCategories = categories.filter((cat) =>
    selectedCategoryIds.includes(cat.id),
  );

  // Create category hierarchy structure
  const categoryHierarchy = useMemo(() => {
    const categoryMap = new Map<
      string,
      ICategory & { children: ICategory[] }
    >();

    // Initialize all categories in the map
    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    const rootCategories: (ICategory & { children: ICategory[] })[] = [];

    // Build hierarchy
    categories.forEach((category) => {
      const categoryWithChildren = categoryMap.get(category.id)!;

      if (category.parentId && categoryMap.has(category.parentId)) {
        // Add to parent's children
        const parent = categoryMap.get(category.parentId)!;
        parent.children.push(categoryWithChildren);
      } else {
        // Root level category
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories.sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categoryHierarchy;

    const searchLower = searchTerm.toLowerCase();

    const filterCategory = (
      category: ICategory & { children: ICategory[] },
    ): (ICategory & { children: ICategory[] }) | null => {
      const matchesSearch = category.name.toLowerCase().includes(searchLower);
      const filteredChildren = category.children
        //@ts-ignore
        .map((child) => filterCategory(child))
        .filter(Boolean) as (ICategory & { children: ICategory[] })[];

      if (matchesSearch || filteredChildren.length > 0) {
        return {
          ...category,
          children: filteredChildren,
        };
      }
      return null;
    };

    return categoryHierarchy
      .map((category) => filterCategory(category))
      .filter(Boolean) as (ICategory & { children: ICategory[] })[];
  }, [categoryHierarchy, searchTerm]);

  // Handle category selection
  const handleCategoryToggle = (categoryId: string) => {
    const isSelected = selectedCategoryIds.includes(categoryId);

    if (isSelected) {
      // Prevent removing if it's the only category
      if (selectedCategoryIds.length === 1) {
        return; // Must have at least one category
      }

      // Allow removing primary category - if removed, set first remaining as primary
      const newSelectedIds = selectedCategoryIds.filter((id) => id !== categoryId);
      if (categoryId === primaryCategoryId && newSelectedIds.length > 0) {
        // Set new primary category
        setPrimaryCategoryId(newSelectedIds[0]);
      }

      setSelectedCategoryIds(newSelectedIds);
    } else {
      // Check max limit
      if (selectedCategoryIds.length >= maxCategories) {
        return; // Max categories reached
      }

      // If this is the first category, make it primary
      const newIds = [...selectedCategoryIds, categoryId];
      if (newIds.length === 1) {
        setPrimaryCategoryId(categoryId);
      }

      setSelectedCategoryIds(newIds);
    }
  };

  // Remove category badge
  const handleRemoveCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Prevent removing if it's the only category
    if (selectedCategoryIds.length === 1) {
      return;
    }

    // Allow removing primary category - if removed, set first remaining as primary
    const newSelectedIds = selectedCategoryIds.filter((id) => id !== categoryId);
    if (categoryId === primaryCategoryId && newSelectedIds.length > 0) {
      // Set new primary category
      setPrimaryCategoryId(newSelectedIds[0]);
    }

    setSelectedCategoryIds(newSelectedIds);
  };

  // Set as primary category
  const handleSetAsPrimary = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCategoryIds.includes(categoryId)) {
      setPrimaryCategoryId(categoryId);
    }
  };

  // Render category items recursively
  const renderCategoryItems = (
    categories: (ICategory & { children: ICategory[] })[],
    level: number = 0,
  ) => {
    return categories.map((category) => {
      const hasChildren = category.children.length > 0;
      const isSelected = selectedCategoryIds.includes(category.id);
      const isPrimary = primaryCategoryId === category.id;
      const productCount =
        (category.totalProducts ?? 0) > 0 ? ` (${category.totalProducts})` : "";

      if (hasChildren) {
        return (
          <DropdownMenuSub key={category.id}>
            <DropdownMenuSubTrigger className='flex items-center justify-between'>
              <span className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={isSelected}
                  readOnly
                  className='pointer-events-none'
                  onClick={(e) => e.stopPropagation()}
                />
                {category.name}
                {productCount}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className='w-64'>
              {/* Allow selecting parent category */}
              <DropdownMenuItem
                onClick={() => handleCategoryToggle(category.id)}
                disabled={
                  (!isSelected &&
                    selectedCategoryIds.length >= maxCategories) ||
                  (isSelected && isPrimary && selectedCategoryIds.length === 1)
                }
                className='font-medium border-b mb-1'>
                <div className='flex items-center gap-2 w-full'>
                  <input
                    type='checkbox'
                    checked={isSelected}
                    readOnly
                    className='pointer-events-none'
                  />
                  <span className='flex-1'>
                    Select "{category.name}"
                    {isPrimary && (
                      <Badge variant='secondary' className='ml-2 text-xs'>
                        Primary
                      </Badge>
                    )}
                  </span>
                </div>
              </DropdownMenuItem>
              {/* @ts-ignore */}
              {renderCategoryItems(category.children, level + 1)}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        );
      }

      return (
        <DropdownMenuItem
          key={category.id}
          onClick={() => handleCategoryToggle(category.id)}
          disabled={
            (!isSelected && selectedCategoryIds.length >= maxCategories) ||
            (isSelected && isPrimary && selectedCategoryIds.length === 1)
          }
          className={isSelected ? "bg-accent" : ""}>
          <div className='flex items-center gap-2 w-full'>
            <input
              type='checkbox'
              checked={isSelected}
              readOnly
              className='pointer-events-none'
            />
            <span className='flex-1'>
              {category.name}
              {productCount}
              {isPrimary && (
                <Badge variant='secondary' className='ml-2 text-xs'>
                  Primary
                </Badge>
              )}
            </span>
            {isSelected && <Check className='h-4 w-4' />}
          </div>
        </DropdownMenuItem>
      );
    });
  };

  // Render flat list when searching
  const renderFlatList = () => {
    const flattenCategories = (
      cats: (ICategory & { children: ICategory[] })[],
      level: number = 0,
    ): (ICategory & { level?: number })[] => {
      const result: (ICategory & { level?: number })[] = [];
      cats.forEach((cat) => {
        result.push({ ...cat, level });
        if (cat.children.length > 0) {
          //@ts-ignore
          result.push(...flattenCategories(cat?.children, level + 1));
        }
      });
      return result;
    };

    const flatCategories = flattenCategories(filteredCategories);

    return flatCategories.map((category) => {
      const isSelected = selectedCategoryIds.includes(category.id);
      const isPrimary = primaryCategoryId === category.id;
      const productCount =
        (category.totalProducts ?? 0) > 0 ? ` (${category.totalProducts})` : "";

      return (
        <DropdownMenuItem
          key={category.id}
          onClick={() => handleCategoryToggle(category.id)}
          disabled={
            (!isSelected && selectedCategoryIds.length >= maxCategories) ||
            (isSelected && isPrimary && selectedCategoryIds.length === 1)
          }
          className={isSelected ? "bg-accent" : ""}>
          <div className='flex items-center gap-2 w-full'>
            <input
              type='checkbox'
              checked={isSelected}
              readOnly
              className='pointer-events-none'
            />
            <span
              className='flex-1'
              style={{ paddingLeft: `${(category.level ?? 0) * 8}px` }}>
              {">".repeat(category.level ?? 0)} {category.name}
              {productCount}
              {isPrimary && (
                <Badge variant='secondary' className='ml-2 text-xs'>
                  Primary
                </Badge>
              )}
            </span>
            {isSelected && <Check className='h-4 w-4' />}
          </div>
        </DropdownMenuItem>
      );
    });
  };

  return (
    <div className='w-full space-y-2'>
      <div className='grid gap-2'>
        <Label htmlFor='category'>
          Categories{" "}
          {selectedCategoryIds.length > 0 &&
            `(${selectedCategoryIds.length}/${maxCategories})`}
        </Label>

        {/* Selected Categories Badges */}
        {selectedCategories.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-2'>
            {selectedCategories.map((category) => {
              const isPrimary = primaryCategoryId === category.id;
              return (
                <Badge
                  key={category.id}
                  variant={isPrimary ? "default" : "secondary"}
                  className='text-sm pr-1'>
                  {category.name}
                  {isPrimary && <span className='ml-1 text-xs'>(Primary)</span>}
                  {selectedCategories.length > 1 && (
                    <>
                      <button
                        onClick={(e) => handleSetAsPrimary(category.id, e)}
                        className='ml-1 hover:bg-primary/20 rounded-full p-0.5'
                        disabled={disabled}
                        title='Set as primary category'>
                        <Star className='h-3 w-3' fill={isPrimary ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={(e) => handleRemoveCategory(category.id, e)}
                        className='ml-1 hover:bg-destructive/20 rounded-full p-0.5'
                        disabled={disabled}>
                        <X className='h-3 w-3' />
                      </button>
                    </>
                  )}
                </Badge>
              );
            })}
          </div>
        )}

        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              className='w-full justify-between'
              id='category'
              disabled={disabled}>
              <span className='truncate'>
                {selectedCategories.length === 0
                  ? "Select categories"
                  : `${selectedCategories.length} category${
                      selectedCategories.length > 1 ? "ies" : ""
                    } selected`}
              </span>
              <ChevronDown className='h-4 w-4 opacity-50' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-full min-w-[--radix-dropdown-menu-trigger-width] max-h-80 overflow-y-auto'>
            {/* Search Input */}
            <div className='p-2 border-b'>
              <div className='relative'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search categories...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-8'
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Max categories warning */}
            {selectedCategoryIds.length >= maxCategories && (
              <div className='p-2 bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-100 text-sm border-b'>
                Maximum {maxCategories} categories allowed
              </div>
            )}

            {/* Categories */}
            <div className='max-h-60 overflow-y-auto'>
              {filteredCategories.length === 0 ? (
                <DropdownMenuItem disabled>
                  {searchTerm
                    ? "No categories found"
                    : "No categories available"}
                </DropdownMenuItem>
              ) : searchTerm ? (
                renderFlatList()
              ) : (
                renderCategoryItems(filteredCategories)
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Helper text */}
        <p className='text-xs text-muted-foreground'>
          Select up to {maxCategories} categories. Click the star icon to set
          the primary category.
        </p>
      </div>
    </div>
  );
};

export default MultiCategorySelect;
