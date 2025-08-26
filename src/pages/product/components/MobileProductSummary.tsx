import React from "react";
import {
  Package,
  Archive,
  Activity,
  TrendingUp,
  BarChart3,
  X,
  Tag
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../components/ui/sheet";
import { CategoryStockSummary, StockSummaryResponse } from "../interface";

interface MobileProductSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  summary: StockSummaryResponse | null;
  trigger?: React.ReactNode;
}

const MobileProductSummary: React.FC<MobileProductSummaryProps> = ({
  isOpen,
  onClose,
  summary,
  trigger
}) => {
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return "0";
    return Number(num) % 1 < 1
      ? Math.floor(num).toLocaleString()
      : num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  const statsCards = [
    {
      title: "Total Products",
      value: summary?.totalActiveProductType || 0,
      key: "totalActiveProducts" as keyof CategoryStockSummary,
      icon: Package,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      textColor: "text-blue-100",
      valueColor: "text-white"
    },
    {
      title: "Total Stock",
      value: summary?.totalActiveProducts || 0,
      key: "totalActiveProducts" as keyof CategoryStockSummary,
      icon: Archive,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      textColor: "text-green-100",
      valueColor: "text-white"
    },
    {
      title: "Variations",
      value: summary?.totalActiveProductVariations || 0,
      key: "totalActiveProductVariations" as keyof CategoryStockSummary,
      icon: Activity,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      textColor: "text-purple-100",
      valueColor: "text-white"
    },
    {
      title: "Total Value",
      value: `৳${formatNumber(summary?.totalActiveProductPrice)}`,
      key: "totalPrice" as keyof CategoryStockSummary,
      icon: TrendingUp,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      textColor: "text-orange-100",
      valueColor: "text-white"
    }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-5 w-5" />
              Inventory Summary
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-xl shadow-sm p-4 ${stat.color}`}
                >
                  <div className="absolute inset-0 bg-black/5" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full" />
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-6 w-6 ${stat.textColor}`} />
                    </div>
                    
                    <div className="space-y-1">
                      <p className={`text-xs font-medium ${stat.textColor}`}>
                        {stat.title}
                      </p>
                      <p className={`text-xl font-bold ${stat.valueColor}`}>
                        {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category Breakdown */}
          {summary?.categories && summary.categories.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category Breakdown
              </h3>
              
              <div className="space-y-4">
                {statsCards.map(({ title, value, key }, cardIndex) => (
                  <div key={cardIndex} className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">
                      {title}
                    </h4>
                    <div className="space-y-3">
                      {summary.categories?.map((category: CategoryStockSummary, index: number) => (
                        <div key={index} className="space-y-2 p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {category.categoryName}
                            </span>
                            <Badge variant="secondary" className="px-2 py-0.5 text-xs bg-gray-200">
                              {formatNumber(category[key as keyof CategoryStockSummary] as number)}
                            </Badge>
                          </div>
                          <Progress
                            value={
                              ((category[key as keyof CategoryStockSummary] as number) / 
                               (typeof value === 'string' ? 1 : value || 1)) * 100
                            }
                            className="h-2"
                          />
                          <div className="text-xs text-gray-500">
                            {(
                              ((category[key as keyof CategoryStockSummary] as number) / 
                               (typeof value === 'string' ? 1 : value || 1)) * 100
                            ).toFixed(1)}% of total
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileProductSummary;