import React, { useState } from "react";
import {
  Package,
  MapPin,
  Phone,
  DollarSign,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Shield,
  AlertTriangle,
  ShieldCheck,
  MessageCircle,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import dayjs from "dayjs";
import { cn } from "../../../utils/functions";
import useRoleCheck from "../../auth/hooks/useRoleCheck";
import { FraudDetection } from "../interface";
import FraudDetectionDrawer from "./FraudDetectionDrawer";
import { MobileOrderProductDrawer } from "./MobileOrderProductDrawer";

interface OrderProduct {
  id: number | string;
  productId?: string;
  name?: string;
  title?: string;
  image?: string;
  thumbnail?: string;
  quantity?: number;
  price?: number;
  unitPrice?: number;
  totalPrice?: number;
  variant?:
    | string
    | {
        size?: string;
        color?: string;
      };
  variation?: {
    size?: string;
    color?: string;
  };
}

interface Props {
  id: string;
  provider: string;
  orderNumber: number;
  customerName: string;
  customerPhoneNumber: string;
  status: string;
  district: string;
  totalPrice: number;
  paid: number;
  updatedAt: string;
  remaining: number;
  isBulkAdded: boolean;
  fraudDetection?: FraudDetection;
  products?: OrderProduct[];
  handleViewDetails: () => void;
  handleUpdateOrder: () => void;
  handleModifyProduct: () => void;
  handleReturnProducts: () => void;
  handleBulkCheck: (val: boolean) => void;
  deleteExistingOrder: (id: string) => void;
}

const MobileOrderCard: React.FC<Props> = ({
  id,
  orderNumber,
  customerName,
  customerPhoneNumber,
  status,
  totalPrice,
  district,
  paid,
  provider,
  remaining,
  updatedAt,
  isBulkAdded,
  fraudDetection,
  products = [],
  handleBulkCheck,
  handleViewDetails,
  handleUpdateOrder,
  handleModifyProduct,
  deleteExistingOrder,
  handleReturnProducts,
}) => {
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();
  const [showProductDrawer, setShowProductDrawer] = useState(false);

  // Get relative time (e.g., "2h ago")
  const getRelativeTime = (date: string) => {
    const now = dayjs();
    const then = dayjs(date);
    const diff = now.diff(then, "hour");

    if (diff < 1) {
      const minutes = now.diff(then, "minute");
      return `${minutes}m ago`;
    } else if (diff < 24) {
      return `${diff}h ago`;
    } else if (diff < 48) {
      return "Yesterday";
    } else {
      return then.format("MMM D");
    }
  };

  // WhatsApp link
  const getWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanPhone}`;
  };

  const getFraudButtonConfig = (riskLevel?: string) => {
    switch (riskLevel) {
      case "red":
        return {
          icon: AlertTriangle,
          className: "bg-red-50 hover:bg-red-100 text-red-600 border-red-200",
        };
      case "yellow":
        return {
          icon: Shield,
          className:
            "bg-yellow-50 hover:bg-yellow-100 text-yellow-600 border-yellow-200",
        };
      case "green":
        return {
          icon: ShieldCheck,
          className:
            "bg-green-50 hover:bg-green-100 text-green-600 border-green-200",
        };
      default:
        return {
          icon: Shield,
          className:
            "bg-gray-50 hover:bg-gray-100 text-gray-400 border-gray-200",
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "processing":
        return {
          color:
            "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0",
          icon: Clock,
          label: "Processing",
        };
      case "shipped":
        return {
          color:
            "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0",
          icon: Truck,
          label: "Shipped",
        };
      case "completed":
        return {
          color:
            "bg-gradient-to-r from-green-500 to-green-600 text-white border-0",
          icon: CheckCircle,
          label: "Completed",
        };
      case "cancel":
        return {
          color: "bg-gradient-to-r from-red-500 to-red-600 text-white border-0",
          icon: XCircle,
          label: "Cancelled",
        };
      case "return":
        return {
          color:
            "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0",
          icon: RefreshCw,
          label: "Return",
        };
      default:
        return {
          color:
            "bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0",
          icon: Package,
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  // Prepare product gallery (show first 3, rest in badge)
  const displayProducts = products.slice(0, 3);
  const remainingProducts = Math.max(0, products.length - 3);

  return (
    <>
      <div
        className={cn(
          "bg-white rounded-none border-x-0 border-t-0 border-b border-gray-200 shadow-lg hover:shadow-sm transition-all duration-300 overflow-hidden active:scale-[0.98]",
          isBulkAdded && "ring-2 ring-primary ring-offset-0",
        )}>
        {/* Header */}
        <div className='flex items-center justify-between p-4 pb-3'>
          <div className='flex items-center gap-3'>
            {hasSomePermissionsForPage("order", [
              "edit",
              "delete",
              "documents",
            ]) &&
              !status.includes("return") && (
                <div className='relative'>
                  <input
                    type='checkbox'
                    checked={isBulkAdded}
                    onChange={() => handleBulkCheck(!isBulkAdded)}
                    className='w-5 h-5 text-primary border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 transition-colors'
                  />
                  {isBulkAdded && (
                    <div className='absolute inset-0 bg-primary/20 rounded-md animate-pulse pointer-events-none' />
                  )}
                </div>
              )}
            <div className='flex items-center gap-2'>
              <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm'>
                <Package className='h-4 w-4 text-white' />
              </div>
              <span className='font-semibold text-lg text-gray-900'>
                #{orderNumber}
              </span>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Badge
              className={cn(
                "px-3 py-1.5 text-xs font-medium border-0 flex items-center gap-1.5 rounded-full shadow-sm",
                statusConfig.color,
              )}>
              <StatusIcon className='h-3 w-3' />
              {statusConfig.label}
            </Badge>

            {hasSomePermissionsForPage("order", ["edit", "delete"]) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0 hover:bg-gray-100 rounded-full'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  <DropdownMenuItem onClick={handleViewDetails}>
                    <Eye className='h-4 w-4 mr-2' />
                    View Details
                  </DropdownMenuItem>

                  {hasRequiredPermission("order", "edit") && (
                    <DropdownMenuItem onClick={handleUpdateOrder}>
                      <Edit className='h-4 w-4 mr-2' />
                      Edit Order
                    </DropdownMenuItem>
                  )}

                  {hasRequiredPermission("order", "edit") &&
                    status === "processing" && (
                      <DropdownMenuItem onClick={handleModifyProduct}>
                        <Package className='h-4 w-4 mr-2' />
                        Modify Products
                      </DropdownMenuItem>
                    )}

                  {hasRequiredPermission("order", "edit") &&
                    status === "shipped" && (
                      <DropdownMenuItem onClick={handleReturnProducts}>
                        <RefreshCw className='h-4 w-4 mr-2' />
                        Return Products
                      </DropdownMenuItem>
                    )}

                  {hasRequiredPermission("order", "delete") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => deleteExistingOrder(id)}
                        className='text-red-600 focus:text-red-600'>
                        <Trash2 className='h-4 w-4 mr-2' />
                        Delete Order
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Status & Provider */}
        <div className='px-4 pb-3'>
          <div className='flex items-center justify-between text-xs'>
            <div className='flex items-center gap-2 text-gray-600'>
              <Clock className='h-3 w-3' />
              <span>{getRelativeTime(updatedAt)}</span>
            </div>
            {provider && status === "shipped" && (
              <div className='flex items-center gap-1 text-gray-600'>
                <Truck className='h-3 w-3' />
                <span className='font-medium'>{provider}</span>
              </div>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className='px-4 pb-3'>
          <div className='flex items-center gap-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl'>
            <Avatar className='h-10 w-10 border-2 border-white shadow-sm'>
              <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold'>
                {customerName?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold text-gray-900 truncate'>
                {customerName}
              </h3>
              <div className='flex items-center gap-1 text-xs text-gray-600 mt-0.5'>
                <MapPin className='h-3 w-3' />
                <span>{district}</span>
              </div>
              <div className='flex items-center gap-1 text-sm text-gray-600 mt-0.5'>
                <Phone className='h-3 w-3' />
                <span>{customerPhoneNumber}</span>
              </div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0 rounded-full bg-white shadow-sm hover:bg-gray-100'
              asChild>
              <a href={`tel:${customerPhoneNumber}`}>
                <Phone className='h-4 w-4' />
              </a>
            </Button>
          </div>
        </div>

        {/* Price Summary */}
        <div className='px-4 pb-3'>
          <div className='grid grid-cols-3 gap-2'>
            <div className='text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm'>
              <div className='flex items-center justify-center gap-1 mb-1'>
                <DollarSign className='h-3 w-3 text-green-600' />
                <span className='text-xs font-semibold text-green-700'>
                  Total
                </span>
              </div>
              <p className='font-bold text-sm text-green-800'>
                ৳{totalPrice.toLocaleString()}
              </p>
            </div>

            <div className='text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm'>
              <div className='flex items-center justify-center gap-1 mb-1'>
                <CheckCircle className='h-3 w-3 text-blue-600' />
                <span className='text-xs font-semibold text-blue-700'>
                  Paid
                </span>
              </div>
              <p className='font-bold text-sm text-blue-800'>
                ৳{paid.toLocaleString()}
              </p>
            </div>

            <div className='text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm'>
              <div className='flex items-center justify-center gap-1 mb-1'>
                <Clock className='h-3 w-3 text-orange-600' />
                <span className='text-xs font-semibold text-orange-700'>
                  Due
                </span>
              </div>
              <p
                className={cn(
                  "font-bold text-sm",
                  remaining > 0 ? "text-orange-800" : "text-green-800",
                )}>
                ৳{remaining.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='px-4 pb-4'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              {fraudDetection && (
                <FraudDetectionDrawer
                  fraudDetection={fraudDetection}
                  customerName={customerName}
                  phoneNumber={customerPhoneNumber}
                  trigger={
                    <Button
                      variant='outline'
                      size='sm'
                      className={cn(
                        "h-8 px-2 border rounded-lg text-xs",
                        getFraudButtonConfig(fraudDetection.riskLevel)
                          .className,
                      )}>
                      {React.createElement(
                        getFraudButtonConfig(fraudDetection.riskLevel).icon,
                        {
                          className: "h-3.5 w-3.5",
                        },
                      )}
                      <span className='ml-1'>
                        {fraudDetection.riskLevel === "red"
                          ? "High Risk"
                          : fraudDetection.riskLevel === "yellow"
                            ? "Medium"
                            : "Safe"}
                      </span>
                    </Button>
                  }
                />
              )}
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleViewDetails}
                className='h-9 px-4 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-sm'>
                <Eye className='h-3.5 w-3.5 mr-1.5' />
                View Details
              </Button>
              <Button
                variant='ghost'
                size='sm'
                asChild
                className='h-9 w-9 p-0 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 border border-green-200'>
                <a
                  href={getWhatsAppLink(customerPhoneNumber)}
                  target='_blank'
                  rel='noopener noreferrer'>
                  <MessageCircle className='h-4 w-4' />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Drawer */}
      <MobileOrderProductDrawer
        open={showProductDrawer}
        onOpenChange={setShowProductDrawer}
        products={products}
        orderNumber={String(orderNumber)}
      />
    </>
  );
};

export default MobileOrderCard;
