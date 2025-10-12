import React from "react";
import {
  Package,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  TrendingUp,
  TrendingDown,
  Archive,
  Activity,
  CheckCircle,
  XCircle,
  ShoppingCart,
  RefreshCw,
  Tag,
  Hash,
  Calendar,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { cn } from "../../../utils/functions";
import useRoleCheck from "../../auth/hooks/useRoleCheck";
import dayjs from "dayjs";
import ShareButton from "../../../common/ShareButton";

interface MobileProductCardProps {
  id: string;
  sku: string;
  slug: string;
  image?: string;
  title: string;
  categoryName: string;
  active: boolean;
  quantity: number;
  unitPrice: number;
  totalSold: number;
  totalReturned: number;
  variations: string[];
  updatedAt: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewVariations?: () => void;
}

const MobileProductCard: React.FC<MobileProductCardProps> = ({
  id,
  sku,
  slug,
  image,
  title,
  categoryName,
  active,
  quantity,
  unitPrice,
  totalSold,
  totalReturned,
  variations,
  updatedAt,
  onEdit,
  onDelete,
  onViewVariations,
}) => {
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();

  const getStatusConfig = () => {
    return active
      ? {
          color: " text-white border-0",
          icon: CheckCircle,
          label: "Active",
        }
      : {
          color: "bg-red-100 text-red-500 border-0",
          icon: XCircle,
          label: "Inactive",
        };
  };

  const getStockStatus = () => {
    if (quantity <= 0) {
      return {
        color: "bg-red-100 text-red-500 border-0",
        icon: TrendingDown,
        label: "Out of Stock",
      };
    } else if (quantity <= 10) {
      return {
        color: "bg-orange-100 text-orange-600 font-bold border-0",
        icon: Archive,
        label: "Low Stock",
      };
    } else {
      return {
        color: " text-white border-0",
        icon: TrendingUp,
        label: "In Stock",
      };
    }
  };

  const statusConfig = getStatusConfig();
  const stockConfig = getStockStatus();
  const StatusIcon = statusConfig.icon;
  const StockIcon = stockConfig.icon;

  const totalSoldQuantity = totalSold ?? 0;

  const formatNumber = (num: number): string => {
    return Number(num) % 1 < 1
      ? Math.floor(num).toLocaleString()
      : num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  return (
    <div className='bg-white rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden'>
      {/* Header with Image */}
      <div className='relative'>
        <div className='aspect-[4/3] bg-gray-100 relative overflow-hidden'>
          <div className='absolute inset-0 bg-gray-900/40 flex items-center justify-center' />
          {image ? (
            <img
              src={image}
              alt={title}
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
              "h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200",
              image ? "hidden" : "flex"
            )}>
            <Package className='h-12 w-12 text-gray-400' />
          </div>

          {/* Status Overlay */}

          <Badge
            className={cn(
              "absolute top-1.5 left-1.5 right-1.5 w-[36px] px-1.5 py-0.5 text-[10px] font-medium border flex items-center gap-0.5 rounded-md backdrop-blur-sm",
              statusConfig.color
            )}>
            <StatusIcon className='h-2.5 w-2.5' />
            {active ? "✓" : "✗"}
          </Badge>

          <Badge
            className={cn(
              "absolute bottom-1.5  right-1.5 w-[40px] px-1.5 py-0.5 text-sm font-medium border flex items-center gap-0.5 rounded-md backdrop-blur-sm",
              stockConfig.color
            )}>
            <StockIcon className='h-3 w-3' />
            {quantity}
          </Badge>

          {/* Actions Dropdown */}
          {hasSomePermissionsForPage("product", ["edit", "delete"]) && (
            <div className='absolute top-1.5 right-1.5'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0 bg-white/90 hover:bg-white rounded-full backdrop-blur-sm'>
                    <MoreVertical className='h-3 w-3' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-40'>
                  <DropdownMenuItem onClick={onViewVariations}>
                    <Eye className='h-4 w-4 mr-2' />
                    View Details
                  </DropdownMenuItem>

                  {hasRequiredPermission("product", "edit") && (
                    <DropdownMenuItem onClick={() => onEdit(id)}>
                      <Edit className='h-4 w-4 mr-2' />
                      Edit Product
                    </DropdownMenuItem>
                  )}

                  {hasRequiredPermission("product", "delete") && (
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
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='p-2'>
        {/* Product Title & Category */}
        <div className='mb-2 flex justify-between items-start'>
          <h3 className='flex items-center gap-1 text-gray-900 text-sm font-semibold leading-tight line-clamp-2 mb-0.5 uppercase'>
            <Hash className='h-2 w-2 text-gray-500' />
            {title}
          </h3>
          <div className='text-[10px] font-mono text-gray-900'>
            ৳{formatNumber(unitPrice)}
          </div>
        </div>

        {/* Price & SKU */}
        <div className='mb-2'>
          <div className='flex items-center gap-1 text-[10px] text-gray-600'>
            <Tag className='h-2 w-2' />
            <span className='truncate'>{categoryName}</span>
          </div>
          <div className=' items-center gap-1 text-[10px] text-gray-500 hidden'>
            <Hash className='h-2 w-2' />
            <span className='font-mono'>{sku}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-3 gap-1 mb-2'>
          <div className='text-center p-1 bg-blue-50 rounded-md'>
            <ShoppingCart className='h-2.5 w-2.5 text-blue-600 mx-auto mb-0.5' />
            <p className='font-bold text-xs text-blue-800'>
              {totalSoldQuantity}
            </p>
            <p className='text-[9px] text-blue-600'>Sold</p>
          </div>

          <div className='text-center p-1 bg-orange-50 rounded-md'>
            <RefreshCw className='h-2.5 w-2.5 text-orange-600 mx-auto mb-0.5' />
            <p className='font-bold text-xs text-orange-800'>{totalReturned}</p>
            <p className='text-[9px] text-orange-600'>Return</p>
          </div>

          <div
            className='text-center p-1 bg-purple-50 rounded-md cursor-pointer hover:bg-purple-100 transition-colors touch-manipulation'
            onClick={onViewVariations}>
            <Activity className='h-2.5 w-2.5 text-purple-600 mx-auto mb-0.5' />
            <p className='font-bold text-xs text-purple-800'>
              {variations.length === 1 && variations[0] === "No Variant"
                ? 0
                : variations.length}
            </p>
            <p className='text-[9px] text-purple-600'>Variant</p>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between pt-1 border-t border-gray-100'>
          <div className='flex items-center gap-0.5 text-[10px] text-gray-500'>
            <Calendar className='h-2.5 w-2.5' />
            <span>{dayjs(updatedAt).format("MMM D")}</span>
          </div>
          <ShareButton
            sm={true}
            linkToShare={`https://priorbd.com/collections/${slug}`}
            title={`Check out this awesome product: ${title}`}
            text={`This ${categoryName} has ${quantity} item left. Don't miss out!`}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileProductCard;
