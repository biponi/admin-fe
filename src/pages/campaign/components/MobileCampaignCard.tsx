import React from "react";
import {
  Calendar,
  Edit,
  Trash2,
  MoreVertical,
  Percent,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
  Package,
  Truck,
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
import { ICampaign } from "../interface";

interface Props {
  campaign: ICampaign;
  index: number;
  handleUpdateCampaign: (id: string) => void;
  deleteExistingCampaign: (id: string) => void;
}

const MobileCampaignCard: React.FC<Props> = ({
  campaign,
  index,
  handleUpdateCampaign,
  deleteExistingCampaign,
}) => {
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();

  const getStatusConfig = () => {
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);

    if (!campaign.active) {
      return {
        color: "bg-gray-100 text-gray-600 border-gray-200",
        icon: XCircle,
        label: "Inactive",
      };
    } else if (now < startDate) {
      return {
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: Clock,
        label: "Upcoming",
      };
    } else if (now > endDate) {
      return {
        color: "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
        label: "Expired",
      };
    } else {
      return {
        color: "bg-green-100 text-green-700 border-green-200",
        icon: CheckCircle,
        label: "Active",
      };
    }
  };

  const getUrgencyConfig = () => {
    const now = new Date();
    const endDate = new Date(campaign.endDate);
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return {
        color: "bg-red-50 text-red-600 border-red-200",
        label: "Expired",
      };
    } else if (daysRemaining <= 2) {
      return {
        color: "bg-red-50 text-red-600 border-red-200",
        label: `${daysRemaining}d left`,
      };
    } else if (daysRemaining <= 7) {
      return {
        color: "bg-orange-50 text-orange-600 border-orange-200",
        label: `${daysRemaining}d left`,
      };
    } else {
      return null; // Don't show urgency badge if more than 7 days
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const urgencyConfig = getUrgencyConfig();

  const formatDate = (date: Date) => {
    return dayjs(date).format("MMM D, YYYY");
  };

  const formatTime = (date: Date) => {
    return dayjs(date).format("h:mm A");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-sm">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-base">
              {campaign.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={cn(
                  "px-2 py-0.5 text-[10px] font-medium border flex items-center gap-1 rounded-md",
                  statusConfig.color
                )}
              >
                <StatusIcon className="h-2.5 w-2.5" />
                {statusConfig.label}
              </Badge>
              {urgencyConfig && (
                <Badge
                  variant="outline"
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-medium border rounded-md",
                    urgencyConfig.color
                  )}
                >
                  {urgencyConfig.label}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {hasSomePermissionsForPage("campaign", ["edit", "delete"]) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 hover:bg-gray-100 rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {hasRequiredPermission("campaign", "edit") && (
                <DropdownMenuItem onClick={() => handleUpdateCampaign(campaign.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Campaign
                </DropdownMenuItem>
              )}

              {hasRequiredPermission("campaign", "delete") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => deleteExistingCampaign(campaign.id)}
                    className="text-red-600 focus:text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Campaign
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Campaign Image */}
      {campaign.image && (
        <div className="px-4 pb-3">
          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={campaign.image}
              alt={campaign.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Products */}
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100">
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-purple-700">Products</p>
              <p className="font-bold text-sm text-purple-800">
                {campaign.products?.length || 0}
              </p>
            </div>
          </div>

          {/* Discount */}
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Percent className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-green-700">Discount</p>
              <p className="font-bold text-sm text-green-800">
                {campaign.discount}
                {campaign.discountType === "fixed" ? "৳" : "%"}
              </p>
            </div>
          </div>
        </div>

        {/* Prepayment Info (if applicable) */}
        {campaign.prepaymentRequired && (
          <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-purple-600" />
              <p className="text-xs font-medium text-purple-700">
                Prepayment: {campaign.prepaymentAmount}
                {campaign.prepaymentType === "fixed" ? "৳" : "%"}
                {campaign.minOrderAmount && campaign.minOrderAmount > 0 && (
                  <span className="ml-1">
                    (min: ৳{campaign.minOrderAmount})
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Delivery Discount Info (if applicable) */}
        {campaign.deliveryDiscountType && campaign.deliveryDiscountType !== "none" && (
          <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-medium text-blue-700">
                Delivery:{" "}
                {campaign.deliveryDiscountType === "free"
                  ? "FREE"
                  : campaign.deliveryDiscountType === "percentage"
                  ? `${campaign.deliveryDiscountAmount}% off`
                  : `${campaign.deliveryDiscountAmount} off`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Date Range */}
      <div className="px-4 pb-4">
        <div className="p-3 bg-gray-50 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-green-600" />
            <div className="flex-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Start</p>
              <p className="text-xs font-semibold text-gray-700">
                {formatDate(campaign.startDate)} at {formatTime(campaign.startDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-red-600" />
            <div className="flex-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">End</p>
              <p className="text-xs font-semibold text-gray-700">
                {formatDate(campaign.endDate)} at {formatTime(campaign.endDate)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCampaignCard;
