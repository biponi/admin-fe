import React from "react";
import {
  FolderTree,
  Plus,
  Grid3X3,
  ListTree,
  BarChart3,
  CirclePlus,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../utils/functions";

interface MobileCategoryHeaderProps {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  hasCreatePermission: boolean;
  onCreateCategory: () => void;
  selectedTab: string;
}

const MobileCategoryHeader: React.FC<MobileCategoryHeaderProps> = ({
  totalCategories,
  activeCategories,
  inactiveCategories,
  hasCreatePermission,
  onCreateCategory,
  selectedTab,
}) => {
  const statsCards = [
    {
      title: "Total",
      value: totalCategories,
      icon: FolderTree,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      textColor: "text-blue-100",
      valueColor: "text-white",
    },
    {
      title: "Active",
      value: activeCategories,
      icon: BarChart3,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      textColor: "text-green-100",
      valueColor: "text-white",
    },
    {
      title: "Inactive",
      value: inactiveCategories,
      icon: Grid3X3,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      textColor: "text-orange-100",
      valueColor: "text-white",
    },
    {
      title: "Hierarchy",
      value: "Tree",
      icon: ListTree,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      textColor: "text-purple-100",
      valueColor: "text-white",
    },
  ];

  return (
    <div className='bg-gradient-to-br from-gray-50 to-white sm:hidden'>
      {/* Header Section */}
      <div className='px-4 pt-0 pb-4'>
        <div className=' items-center justify-between mb-6 hidden'>
          <div className='flex items-center gap-3'>
            <div className='h-12 w-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg'>
              <ListTree className='h-6 w-6 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Categories</h1>
              <p className='text-sm text-gray-600'>Manage product categories</p>
            </div>
          </div>

          {hasCreatePermission && (
            <Button
              onClick={onCreateCategory}
              size='lg'
              className='h-12 px-6 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95'>
              <Plus className='h-5 w-5 mr-2' />
              Create
            </Button>
          )}
        </div>

        {/* Status Indicator */}
        {selectedTab !== "all" && (
          <div className='mb-4'>
            <Badge
              variant='secondary'
              className='px-3 py-1.5 bg-primary/10 text-primary border-0 rounded-full text-sm font-medium'>
              Showing:{" "}
              {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}{" "}
              Categories
            </Badge>
          </div>
        )}

        {/* Stats Grid */}
        <div className=' grid-cols-2 gap-3 hidden'>
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={cn(
                  "relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-95",
                  stat.color
                )}>
                {/* Background Pattern */}
                <div className='absolute inset-0 bg-black/5' />
                <div className='absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full' />
                <div className='absolute -bottom-2 -left-2 w-12 h-12 bg-white/10 rounded-full' />

                <div className='relative p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <Icon className={cn("h-6 w-6", stat.textColor)} />
                    <div className='flex items-center gap-1'>
                      <div className='w-1 h-1 bg-white/60 rounded-full' />
                      <div className='w-1 h-1 bg-white/40 rounded-full' />
                      <div className='w-1 h-1 bg-white/20 rounded-full' />
                    </div>
                  </div>

                  <div className='space-y-1'>
                    <p className={cn("text-xs font-medium", stat.textColor)}>
                      {stat.title}
                    </p>
                    <p className={cn("text-xl font-bold", stat.valueColor)}>
                      {typeof stat.value === "string"
                        ? stat.value
                        : stat.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className='px-4 pb-4'>
        <div className='bg-white rounded-2xl border border-gray-100 p-4 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center'>
              <FolderTree className='h-5 w-5 text-gray-600' />
            </div>
            <div className='flex-1'>
              <h3 className='font-semibold text-gray-900'>
                Category Management
              </h3>
              <p className='text-xs text-gray-600'>
                Organize and manage product categories
              </p>
            </div>
            {hasCreatePermission && (
              <Button
                onClick={onCreateCategory}
                size='sm'
                className='h-8 w-8 p-0 rounded-lg'>
                <CirclePlus className='h-4 w-4' />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCategoryHeader;
