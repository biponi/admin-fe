import React from "react";
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
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
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

interface Props {
  id: string;
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
  remaining,
  updatedAt,
  isBulkAdded,
  fraudDetection,
  handleBulkCheck,
  handleViewDetails,
  handleUpdateOrder,
  handleModifyProduct,
  deleteExistingOrder,
  handleReturnProducts,
}) => {
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();

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
          className: "bg-yellow-50 hover:bg-yellow-100 text-yellow-600 border-yellow-200",
        };
      case "green":
        return {
          icon: ShieldCheck,
          className: "bg-green-50 hover:bg-green-100 text-green-600 border-green-200",
        };
      default:
        return {
          icon: Shield,
          className: "bg-gray-50 hover:bg-gray-100 text-gray-400 border-gray-200",
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "processing":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Clock,
          label: "Processing"
        };
      case "shipped":
        return {
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: Truck,
          label: "Shipped"
        };
      case "completed":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
          label: "Completed"
        };
      case "cancel":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
          label: "Cancelled"
        };
      case "return":
        return {
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: RefreshCw,
          label: "Return"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Package,
          label: status
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",
      isBulkAdded && "ring-2 ring-primary ring-offset-2"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          {hasSomePermissionsForPage("order", ["edit", "delete", "documents"]) &&
            !status.includes("return") && (
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isBulkAdded}
                  onChange={() => handleBulkCheck(!isBulkAdded)}
                  className="w-5 h-5 text-primary border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 transition-colors"
                />
                {isBulkAdded && (
                  <div className="absolute inset-0 bg-primary/20 rounded-md animate-pulse pointer-events-none" />
                )}
              </div>
            )}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-lg text-gray-900">#{orderNumber}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge 
            className={cn(
              "px-3 py-1 text-xs font-medium border flex items-center gap-1.5 rounded-full",
              statusConfig.color
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>

          {hasSomePermissionsForPage("order", ["edit", "delete"]) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleViewDetails}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                
                {hasRequiredPermission("order", "edit") && (
                  <DropdownMenuItem onClick={handleUpdateOrder}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Order
                  </DropdownMenuItem>
                )}
                
                {hasRequiredPermission("order", "edit") && status === "processing" && (
                  <DropdownMenuItem onClick={handleModifyProduct}>
                    <Package className="h-4 w-4 mr-2" />
                    Modify Products
                  </DropdownMenuItem>
                )}
                
                {hasRequiredPermission("order", "edit") && status === "shipped" && (
                  <DropdownMenuItem onClick={handleReturnProducts}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Return Products
                  </DropdownMenuItem>
                )}
                
                {hasRequiredPermission("order", "delete") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => deleteExistingOrder(id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Order
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
              {customerName?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{customerName}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-0.5">
              <Phone className="h-3 w-3" />
              <span>{customerPhoneNumber}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-16">{district}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-700">Total</span>
            </div>
            <p className="font-bold text-sm text-green-800">৳{totalPrice}</p>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Paid</span>
            </div>
            <p className="font-bold text-sm text-blue-800">৳{paid}</p>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-xl border border-orange-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-3 w-3 text-orange-600" />
              <span className="text-xs font-medium text-orange-700">Due</span>
            </div>
            <p className={cn(
              "font-bold text-sm",
              remaining > 0 ? "text-orange-800" : "text-green-800"
            )}>
              ৳{remaining}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Updated {dayjs(updatedAt).format("MMM D, h:mm A")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {fraudDetection && (
              <FraudDetectionDrawer
                fraudDetection={fraudDetection}
                customerName={customerName}
                phoneNumber={customerPhoneNumber}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 border rounded-lg",
                      getFraudButtonConfig(fraudDetection.riskLevel).className
                    )}
                  >
                    {React.createElement(getFraudButtonConfig(fraudDetection.riskLevel).icon, {
                      className: "h-4 w-4",
                    })}
                  </Button>
                }
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewDetails}
              className="h-8 px-3 text-xs bg-primary/5 hover:bg-primary/10 text-primary rounded-lg"
            >
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileOrderCard;