import React from "react";
import {
  ShoppingBag,
  Search,
  Plus,
  RefreshCw,
  Package,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../utils/functions";

interface MobileEmptyStateProps {
  type: "no-orders" | "no-search-results" | "loading" | "error";
  searchQuery?: string;
  onCreateOrder?: () => void;
  onClearSearch?: () => void;
  onRetry?: () => void;
  hasCreatePermission?: boolean;
}

const MobileEmptyState: React.FC<MobileEmptyStateProps> = ({
  type,
  searchQuery,
  onCreateOrder,
  onClearSearch,
  onRetry,
  hasCreatePermission = false,
}) => {
  const getStateConfig = () => {
    switch (type) {
      case "no-orders":
        return {
          icon: ShoppingBag,
          title: "No Orders Yet",
          description: "Start your business journey by creating your first order or wait for customers to place orders.",
          iconColor: "text-blue-500",
          bgColor: "bg-blue-50",
          ringColor: "ring-blue-100",
          primaryAction: hasCreatePermission ? {
            label: "Create First Order",
            icon: Plus,
            onClick: onCreateOrder,
            className: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          } : undefined
        };
      
      case "no-search-results":
        return {
          icon: Search,
          title: "No Orders Found",
          description: `No orders match your search for "${searchQuery}". Try adjusting your search terms or filters.`,
          iconColor: "text-orange-500",
          bgColor: "bg-orange-50",
          ringColor: "ring-orange-100",
          primaryAction: {
            label: "Clear Search",
            icon: RefreshCw,
            onClick: onClearSearch,
            className: "bg-orange-600 hover:bg-orange-700"
          }
        };
      
      case "loading":
        return {
          icon: Package,
          title: "Loading Orders",
          description: "Please wait while we fetch your order data...",
          iconColor: "text-primary",
          bgColor: "bg-primary/5",
          ringColor: "ring-primary/10",
          loading: true
        };
      
      case "error":
        return {
          icon: AlertCircle,
          title: "Something Went Wrong",
          description: "We couldn't load your orders. Please check your connection and try again.",
          iconColor: "text-red-500",
          bgColor: "bg-red-50",
          ringColor: "ring-red-100",
          primaryAction: {
            label: "Try Again",
            icon: RefreshCw,
            onClick: onRetry,
            className: "bg-red-600 hover:bg-red-700"
          }
        };
      
      default:
        return {
          icon: Package,
          title: "No Data",
          description: "No information available at the moment.",
          iconColor: "text-gray-500",
          bgColor: "bg-gray-50",
          ringColor: "ring-gray-100"
        };
    }
  };

  const config = getStateConfig();
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center min-h-[50vh]">
      {/* Animated Icon Container */}
      <div className="relative mb-8">
        {/* Background Effects */}
        <div className={cn(
          "absolute inset-0 rounded-full opacity-20 animate-pulse",
          config.bgColor,
          "scale-150"
        )} />
        <div className={cn(
          "absolute inset-0 rounded-full ring-8 ring-opacity-10",
          config.ringColor,
          "scale-125"
        )} />
        
        {/* Main Icon */}
        <div className={cn(
          "relative h-24 w-24 rounded-full flex items-center justify-center",
          config.bgColor,
          config.loading && "animate-bounce"
        )}>
          <Icon className={cn("h-12 w-12", config.iconColor)} />
          
          {/* Sparkle Effects */}
          {type === "no-orders" && (
            <>
              <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute -bottom-2 -left-2 h-3 w-3 text-blue-400 animate-pulse delay-300" />
            </>
          )}
        </div>

        {/* Loading Spinner */}
        {config.loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary opacity-20"></div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4 max-w-sm mx-auto">
        <h3 className="text-2xl font-bold text-gray-900">{config.title}</h3>
        <p className="text-gray-600 leading-relaxed">
          {config.description}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-8 space-y-3 w-full max-w-sm mx-auto">
        {config.primaryAction && (
          <Button
            onClick={config.primaryAction.onClick}
            size="lg"
            className={cn(
              "w-full h-12 rounded-2xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95",
              config.primaryAction.className
            )}
          >
            <config.primaryAction.icon className="h-5 w-5 mr-2" />
            {config.primaryAction.label}
          </Button>
        )}

        {/* Secondary Actions */}
        {type === "no-orders" && !hasCreatePermission && (
          <div className="pt-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              Orders will appear here once customers start placing them through your store or when you manually create orders.
            </p>
          </div>
        )}
        
        {type === "no-search-results" && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onClearSearch?.()}
              className="h-10 rounded-xl border-2 hover:bg-gray-50"
            >
              Clear Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => onRetry?.()}
              className="h-10 rounded-xl border-2 hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-200 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-200 rounded-full animate-float-delay" />
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-green-200 rounded-full animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-orange-200 rounded-full animate-float-delay" />
      </div>
    </div>
  );
};

export default MobileEmptyState;