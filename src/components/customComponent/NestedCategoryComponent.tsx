import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";

import { ICategory } from "../../pages/product/interface";

const NestedCategorySelect: React.FC<{
  categories: ICategory[];
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
}> = ({ categories, selectedCategoryId, setSelectedCategoryId }) => {
  return (
    <div className='w-full max-w-md mx-auto space-y-4'>
      {/* Alternative: Simple Select with indented options */}
      <div className='grid gap-3'>
        <Label htmlFor='category'>Category</Label>

        <Select
          value={selectedCategoryId}
          onValueChange={(value) => {
            setSelectedCategoryId(value);
          }}>
          <SelectTrigger id='simple-category' aria-label='Select category'>
            <SelectValue placeholder='Select category' />
          </SelectTrigger>
          <SelectContent>
            {categories
              .sort((a, b) => {
                if (!a.level || !b.level) return 0;
                // Sort by level first, then by name
                if (a.level !== b.level) return a.level - b.level;
                return a.name.localeCompare(b.name);
              })
              .map((category: ICategory) => (
                <SelectItem key={category.id} value={category.id}>
                  <span
                    style={{ paddingLeft: `${(category.level ?? 0) * 16}px` }}>
                    {">".repeat(category.level ?? 0)} {category.name}
                    {(category.totalProducts ?? 0) > 0 &&
                      ` (${category.totalProducts})`}
                  </span>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default NestedCategorySelect;
