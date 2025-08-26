import React from "react";
import {
  FolderTree,
  Edit,
  Trash2,
  MoreVertical,
  Package,
  Percent,
  ArrowRight,
  TreePine,
  Layers,
  Check,
  X,
} from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { cn } from "../../../../utils/functions";
import useRoleCheck from "../../../auth/hooks/useRoleCheck";

interface MobileCategoryCardProps {
  id: string;
  name: string;
  image?: string;
  active: boolean;
  discount: number;
  totalProducts: number;
  level: number;
  parentName?: string;
  breadcrumb: string;
  isChild?: boolean;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

const MobileCategoryCard: React.FC<MobileCategoryCardProps> = ({
  id,
  name,
  image,
  active,
  discount,
  totalProducts,
  level,
  parentName,
  breadcrumb,
  isChild = false,
  onEdit,
  onDelete,
}) => {
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();

  const getStatusConfig = () => {
    return active
      ? {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: Check,
          label: "Active",
        }
      : {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: X,
          label: "Inactive",
        };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const getLevelColor = (level: number) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-pink-100 text-pink-800 border-pink-200",
    ];
    return (
      colors[level % colors.length] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",
        isChild && "ml-4 border-l-4 border-l-primary/30"
      )}>
      {/* Header */}
      <div className='flex items-center justify-between p-4 pb-3'>
        <div className='flex items-center gap-3 flex-1 min-w-0'>
          {/* Category Image */}
          <div className='relative h-12 w-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0'>
            {image ? (
              <img
                src={image}
                alt={name}
                className='h-full w-full object-cover'
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const nextElement = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  if (nextElement) nextElement.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={cn(
                "h-full w-full flex items-center justify-center",
                image ? "hidden" : "flex"
              )}>
              <FolderTree className='h-6 w-6 text-gray-400' />
            </div>
          </div>

          {/* Category Info */}
          <div className='flex-1 min-w-0'>
            <h3 className='font-semibold text-lg text-gray-900 truncate'>
              {name}
            </h3>
            {parentName && (
              <div className='flex items-center gap-1 text-xs text-gray-500 mt-0.5'>
                <TreePine className='h-3 w-3' />
                <span className='truncate'>in {parentName}</span>
              </div>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Badge
            className={cn(
              "px-2 py-1 text-xs font-medium border flex items-center gap-1 rounded-full",
              statusConfig.color
            )}>
            <StatusIcon className='h-3 w-3' />
            {statusConfig.label}
          </Badge>

          {hasSomePermissionsForPage("category", ["edit", "delete"]) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0 hover:bg-gray-100 rounded-full'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-40'>
                {hasRequiredPermission("category", "edit") && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className='h-4 w-4 mr-2' />
                    Edit
                  </DropdownMenuItem>
                )}

                {hasRequiredPermission("category", "delete") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(id)}
                      className='text-red-600 focus:text-red-600'>
                      <Trash2 className='h-4 w-4 mr-2' />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Hierarchy Path */}
      {breadcrumb && breadcrumb !== name && (
        <div className='px-4 pb-3'>
          <div className='p-2 bg-gray-50 rounded-lg'>
            <div className='flex items-center gap-1 text-xs text-gray-600'>
              <Layers className='h-3 w-3' />
              <span className='font-medium'>Path:</span>
            </div>
            <p className='text-xs text-gray-700 mt-1 truncate'>{breadcrumb}</p>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className='px-4 pb-3'>
        <div className='grid grid-cols-3 gap-3'>
          {/* Level */}
          <div className='text-center p-2 bg-gray-50 rounded-lg'>
            <Badge
              className={cn(
                "text-xs font-medium border mb-1",
                getLevelColor(level)
              )}>
              Level {level}
            </Badge>
            <div className='flex items-center justify-center gap-1'>
              <Layers className='h-3 w-3 text-gray-500' />
              <span className='text-xs text-gray-600'>Depth</span>
            </div>
          </div>

          {/* Products */}
          <div className='text-center p-2 bg-blue-50 rounded-lg'>
            <p className='font-bold text-lg text-blue-800'>{totalProducts}</p>
            <div className='flex items-center justify-center gap-1'>
              <Package className='h-3 w-3 text-blue-600' />
              <span className='text-xs text-blue-700'>Products</span>
            </div>
          </div>

          {/* Discount */}
          <div className='text-center p-2 bg-green-50 rounded-lg'>
            <p className='font-bold text-lg text-green-800'>{discount}%</p>
            <div className='flex items-center justify-center gap-1'>
              <Percent className='h-3 w-3 text-green-600' />
              <span className='text-xs text-green-700'>Discount</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='px-4 pb-4'>
        <div className='flex items-center justify-between'>
          <div className='text-xs text-gray-500'>ID: {id.slice(-8)}</div>
          <div className='flex items-center gap-1 text-xs text-primary'>
            <span>View Details</span>
            <ArrowRight className='h-3 w-3' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCategoryCard;
