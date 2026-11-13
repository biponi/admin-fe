// Admin meta-data filter for the product list command bar.
// Key/value filter + free-text search against product/variant meta entries
// (backend: POST /product/search with metaFilters / metaSearch).
import { Fragment } from "react";
import { Table2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { EMPTY_META_FILTER, type ProductMetaFilter } from "../hooks/useProductList";
import { cn } from "../../../lib/utils";

interface MetaFilterPopoverProps {
  metaFilter: ProductMetaFilter;
  onMetaFilterChange: (filter: ProductMetaFilter) => void;
  metaSearch: string;
  onMetaSearchChange: (value: string) => void;
  hasActiveMetaFilter: boolean;
  inactiveView?: boolean;
}

const fieldInput =
  "h-8 text-xs bg-white border-zinc-200 rounded-lg focus-visible:ring-1 focus-visible:ring-indigo-500";

export default function MetaFilterPopover({
  metaFilter,
  onMetaFilterChange,
  metaSearch,
  onMetaSearchChange,
  hasActiveMetaFilter,
  inactiveView = false,
}: MetaFilterPopoverProps) {
  const clear = () => {
    onMetaFilterChange(EMPTY_META_FILTER);
    onMetaSearchChange("");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn(
            "h-8 text-xs gap-1.5 rounded-lg border-zinc-200 relative",
            hasActiveMetaFilter &&
              (inactiveView
                ? "border-orange-300 text-orange-600 bg-orange-50"
                : "border-indigo-300 text-indigo-600 bg-indigo-50"),
          )}>
          <Table2 className='h-3.5 w-3.5' />
          Meta
          {hasActiveMetaFilter && (
            <span
              className={cn(
                "absolute -top-1 -right-1 w-2 h-2 rounded-full",
                inactiveView ? "bg-orange-500" : "bg-indigo-500",
              )}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-80 p-4 space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1.5 text-sm font-semibold text-zinc-900'>
            <Table2 className='h-3.5 w-3.5 text-zinc-500' />
            Search by meta data
          </div>
          {hasActiveMetaFilter && (
            <Button
              variant='ghost'
              size='sm'
              onClick={clear}
              className='h-6 px-2 text-[11px] text-red-500 hover:text-red-600 hover:bg-red-50 gap-1'>
              <X className='h-3 w-3' /> Clear
            </Button>
          )}
        </div>

        {/* Free-text across all meta keys/values */}
        <div className='space-y-1'>
          <Label className='text-xs text-zinc-600'>Text search</Label>
          <Input
            type='text'
            value={metaSearch}
            onChange={(e) => onMetaSearchChange(e.target.value)}
            placeholder='e.g. cotton, 5-10y…'
            className={fieldInput}
          />
          <p className='text-[10px] text-zinc-400'>
            Matches any meta key or value, product or variant level.
          </p>
        </div>

        <div className='h-px bg-zinc-100' />

        {/* Key + value / range filter — matches ONE meta entry */}
        <div className='space-y-2'>
          <Label className='text-xs text-zinc-600'>Key filter</Label>
          <Input
            type='text'
            value={metaFilter.key}
            onChange={(e) => onMetaFilterChange({ ...metaFilter, key: e.target.value })}
            placeholder='Key (e.g. age)'
            className={fieldInput}
          />
          <div className='grid grid-cols-2 gap-2'>
            <Input
              type='text'
              value={metaFilter.value}
              onChange={(e) => onMetaFilterChange({ ...metaFilter, value: e.target.value })}
              placeholder='Value contains…'
              className={fieldInput}
            />
            <div className='grid grid-cols-2 gap-1'>
              <Input
                type='number'
                value={metaFilter.min}
                onChange={(e) => onMetaFilterChange({ ...metaFilter, min: e.target.value })}
                placeholder='Min'
                className={fieldInput}
              />
              <Input
                type='number'
                value={metaFilter.max}
                onChange={(e) => onMetaFilterChange({ ...metaFilter, max: e.target.value })}
                placeholder='Max'
                className={fieldInput}
              />
            </div>
          </div>
          <p className='text-[10px] text-zinc-400'>
            Min/Max need numeric meta values (e.g. age = 8). Filters combine
            with the text search above.
          </p>
        </div>

        {hasActiveMetaFilter && (
          <Fragment>
            <div className='flex flex-wrap gap-1.5'>
              {metaSearch.trim() && (
                <Badge variant='secondary' className='text-[10px] font-mono gap-1'>
                  text: {metaSearch.trim()}
                </Badge>
              )}
              {metaFilter.key.trim() && (
                <Badge variant='secondary' className='text-[10px] font-mono gap-1'>
                  {metaFilter.key.trim()}
                  {metaFilter.value.trim() ? ` ~ ${metaFilter.value.trim()}` : ""}
                  {metaFilter.min.trim() ? ` ≥ ${metaFilter.min.trim()}` : ""}
                  {metaFilter.max.trim() ? ` ≤ ${metaFilter.max.trim()}` : ""}
                </Badge>
              )}
            </div>
          </Fragment>
        )}
      </PopoverContent>
    </Popover>
  );
}
