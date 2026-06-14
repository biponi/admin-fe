import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import CategoryFilterDropdown from "../../product/components/FilterByCategory";
import type { ICategory } from "../../product/interface";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  selectedBrand: string;
  onBrandChange: (brandId: string) => void;
  categories: ICategory[];
  brands: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedBrand,
  onBrandChange,
  categories,
  brands,
  isLoading = false,
}: FilterBarProps) {
  return (
    <div className='space-y-4 sticky top-0 z-20 '>
      <div className='flex justify-between items-center gap-3 flex-row w-full'>
        {/* Search Bar */}
        <div className='relative group flex-1 '>
          <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-600 transition-colors' />
          <Input
            type='text'
            placeholder='Search products by name or SKU...'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className='pl-11 h-11 border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-400/20 transition-all'
            disabled={isLoading}
          />
        </div>

        <div>
          <CategoryFilterDropdown
            categories={categories}
            selectedCategory={selectedCategory || "all"}
            setSelectedCategory={onCategoryChange}
            filterLabel='Filter by Category'
            showSearch={true}
            showProductCounts={true}
          />
        </div>
      </div>

      {/* Filters */}
      <div className='flex gap-3 items-center flex-wrap'>
        {/* Category Filter */}
        {/* <div className='flex-1 w-full'>
          <CategoryFilterDropdown
            categories={categories}
            selectedCategory={selectedCategory || "all"}
            setSelectedCategory={onCategoryChange}
            filterLabel='Filter by Category'
            showSearch={true}
            showProductCounts={true}
          />
        </div> */}

        {/* Brand Filter */}
        <div className='flex-1 min-w-[180px] hidden'>
          <Select
            value={selectedBrand || "all"}
            onValueChange={onBrandChange}
            disabled={isLoading}>
            <SelectTrigger className='w-full h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all'>
              <SelectValue placeholder='All Brands' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {(selectedCategory && selectedCategory !== "all") ||
        (selectedBrand && selectedBrand !== "all") ||
        searchQuery ? (
          <Button
            variant='outline'
            size='icon'
            onClick={() => {
              onCategoryChange("all");
              onBrandChange("all");
              onSearchChange("");
            }}
            className='h-11 w-11 shrink-0 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all'
            title='Clear filters'>
            <SlidersHorizontal className='h-4 w-4' />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
