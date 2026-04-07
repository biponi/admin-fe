import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  Package,
  User,
  ShoppingCart,
  Calendar,
  FileText,
  Copy,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { Commission } from "../../../api/commission";
import { CommissionStatusBadge } from "./CommissionStatusBadge";
import { formatCurrency, formatDate } from "../../../utils/inventoryReportUtils";

interface CommissionDetailsModalProps {
  commission: Commission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (commission: Commission) => void;
}

export const CommissionDetailsModal: React.FC<CommissionDetailsModalProps> = ({
  commission,
  open,
  onOpenChange,
  onEdit,
}) => {
  const [copied, setCopied] = useState(false);

  if (!commission) return null;

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(commission.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Content = (
    <>
      {/* Header */}
      <SheetHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <SheetTitle className="text-xl">Commission Details</SheetTitle>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                #{commission.orderNumber}
              </span>
              <CommissionStatusBadge status={commission.status} />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyId}
            className="hidden sm:flex"
            title="Copy commission ID"
          >
            {copied ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SheetHeader>

      <ScrollArea className="h-[calc(100vh-200px)] sm:h-[calc(90vh-200px)] pr-4">
        <div className="space-y-4 mt-4">
          {/* Commission Overview */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-sm border border-blue-200">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3 text-blue-900">
              <DollarSign className="h-4 w-4" />
              Commission Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-blue-700">Commission Amount</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatCurrency(commission.commissionAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Type & Rate</p>
                <p className="text-lg font-semibold text-blue-900">
                  {commission.commissionType === "percentage"
                    ? `${commission.commissionRate}%`
                    : formatCurrency(commission.commissionRate)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Product Information */}
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3 text-purple-900">
              <Package className="h-4 w-4 text-purple-600" />
              Product Information
            </h3>
            <div className="flex items-start gap-3">
              {commission.productImage && (
                <img
                  src={commission.productImage}
                  alt={commission.productName}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold text-sm">{commission.productName}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Qty: {commission.quantity} × {formatCurrency(commission.productPrice)}
                </p>
                <p className="text-sm font-medium mt-1">
                  Total: {formatCurrency(commission.totalPrice)}
                </p>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3 text-blue-900">
              <User className="h-4 w-4 text-blue-600" />
              User Information
            </h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={commission.userAvatar} />
                <AvatarFallback>
                  {commission.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-sm">{commission.userName}</p>
                <p className="text-xs text-gray-600">ID: {commission.userId}</p>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3 text-green-900">
              <ShoppingCart className="h-4 w-4 text-green-600" />
              Order Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order Number</span>
                <Badge variant="outline" className="font-semibold">
                  #{commission.orderNumber}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono text-xs">{commission.orderId}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3 text-amber-900">
              <Calendar className="h-4 w-4 text-amber-600" />
              Timeline
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Created</span>
                <span className="font-medium">{formatDate(commission.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium">{formatDate(commission.updatedAt)}</span>
              </div>
              {/* Paid Off Date - NEW FIELD */}
              {commission.status === 'paid' && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Paid Off Date</span>
                  {commission.paidOffDate ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">{formatDate(commission.paidOffDate)}</span>
                    </div>
                  ) : (
                    <span className="text-green-600 font-medium">Today</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {commission.notes && (
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2 text-yellow-900">
                <FileText className="h-4 w-4 text-yellow-700" />
                Notes
              </h3>
              <p className="text-sm bg-white/70 p-3 rounded-lg italic text-gray-700">
                "{commission.notes}"
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
        {onEdit && (
          <Button
            className="flex-1 sm:flex-none"
            onClick={() => {
              onEdit(commission);
              onOpenChange(false);
            }}
          >
            Edit Commission
          </Button>
        )}
      </div>
    </>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {Content}
      </SheetContent>
    </Sheet>
  );
};
