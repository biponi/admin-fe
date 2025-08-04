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
import { ChevronDown, Search } from "lucide-react";
import { ICategory } from "../../pages/product/interface";

const NestedCategoryDropdown: React.FC<{
  categories: ICategory[];
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
}> = ({ categories, selectedCategoryId, setSelectedCategoryId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Find selected category name
  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );
  const selectedCategoryName = selectedCategory?.name || "Select category";

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
      category: ICategory & { children: ICategory[] }
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

  // Render category items recursively
  const renderCategoryItems = (
    categories: (ICategory & { children: ICategory[] })[],
    level: number = 0
  ) => {
    return categories.map((category) => {
      const hasChildren = category.children.length > 0;
      const productCount =
        (category.totalProducts ?? 0) > 0 ? ` (${category.totalProducts})` : "";

      if (hasChildren) {
        return (
          <DropdownMenuSub key={category.id}>
            <DropdownMenuSubTrigger className='flex items-center justify-between'>
              <span>
                {category.name}
                {productCount}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className='w-56'>
              {/* Allow selecting parent category */}
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCategoryId(category.id);
                  setIsOpen(false);
                }}
                className='font-medium border-b mb-1'>
                Select "{category.name}"
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
          onClick={() => {
            setSelectedCategoryId(category.id);
            setIsOpen(false);
          }}
          className={selectedCategoryId === category.id ? "bg-accent" : ""}>
          {category.name}
          {productCount}
        </DropdownMenuItem>
      );
    });
  };

  // Render flat list when searching
  const renderFlatList = () => {
    const flattenCategories = (
      cats: (ICategory & { children: ICategory[] })[],
      level: number = 0
    ): ICategory[] => {
      const result: ICategory[] = [];
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
      const productCount =
        (category.totalProducts ?? 0) > 0 ? ` (${category.totalProducts})` : "";

      return (
        <DropdownMenuItem
          key={category.id}
          onClick={() => {
            setSelectedCategoryId(category.id);
            setIsOpen(false);
            setSearchTerm("");
          }}
          className={selectedCategoryId === category.id ? "bg-accent" : ""}>
          <span style={{ paddingLeft: `${(category.level ?? 0) * 16}px` }}>
            {">".repeat(category.level ?? 0)} {category.name}
            {productCount}
          </span>
        </DropdownMenuItem>
      );
    });
  };

  return (
    <div className='w-full max-w-md mx-auto space-y-4'>
      <div className='grid gap-3'>
        <Label htmlFor='category'>Category</Label>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              className='w-full justify-between'
              id='category'>
              <span className='truncate'>{selectedCategoryName}</span>
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
      </div>
    </div>
  );
};

export default NestedCategoryDropdown;
