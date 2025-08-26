import React from "react";
import { ShoppingBag, Plus, BarChart3 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { StockSummaryResponse } from "../interface";

interface MobileProductHeaderProps {
  totalProducts: number;
  hasCreatePermission: boolean;
  onCreateProduct: () => void;
  selectedTab: string;
  summary: StockSummaryResponse | null;
  onOpenSummary?: () => void;
}

const MobileProductHeader: React.FC<MobileProductHeaderProps> = ({
  totalProducts,
  hasCreatePermission,
  onCreateProduct,
  selectedTab,
  summary,
  onOpenSummary,
}) => {
  return (
    <div className='bg-gradient-to-br from-gray-50 to-white sm:hidden'>
      {/* Header Section */}
      <div className='px-4 pt-4 pb-3'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <div className='h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md'>
              <ShoppingBag className='h-5 w-5 text-white' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>Products</h1>
              <p className='text-xs text-gray-600'>Manage inventory</p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {onOpenSummary && (
              <Button
                onClick={onOpenSummary}
                size='sm'
                variant='outline'
                className='h-9 px-3 bg-white border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200'>
                <BarChart3 className='h-4 w-4' />
              </Button>
            )}
            {hasCreatePermission && (
              <Button
                onClick={onCreateProduct}
                size='sm'
                className='h-9 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95'>
                <Plus className='h-4 w-4 mr-1' />
                Add
              </Button>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        {selectedTab !== "all" && (
          <div className='mb-3'>
            <Badge
              variant='secondary'
              className='px-2 py-1 bg-primary/10 text-primary border-0 rounded-lg text-xs font-medium'>
              {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}{" "}
              Products
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileProductHeader;
