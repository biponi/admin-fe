import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Separator } from "../../../../components/ui/separator";
import {
  Package,
  ShoppingCart,
  Calendar,
  DollarSign,
  User,
  TrendingUp,
  Copy,
  Check,
  Percent,
  Coins,
} from "lucide-react";
import { RecipientCell } from "./RecipientCell";
import { CommissionStatusBadge } from "./CommissionStatusBadge";
import {
  formatCurrency,
  formatDate,
} from "../../../../utils/inventoryReportUtils";
import { cn } from "../../../../lib/utils";
import { useState } from "react";

interface ProductCommissionCardProps {
  productName: string;
  productImage: string;
  quantity: number;
  productPrice: number;
  totalPrice: number;
  recipient: {
    userName: string;
    userAvatar: string;
  };
  commissionType: "percentage" | "fixed";
  commissionRate: number;
  commissionAmount: number;
  commissionStatus: string;
  commissionId: string;
  createdAt?: string;
  paidOffDate?: string | null;
  className?: string;
}

export const ProductCommissionCard: React.FC<ProductCommissionCardProps> = ({
  productName,
  productImage,
  quantity,
  productPrice,
  totalPrice,
  recipient,
  commissionType,
  commissionRate,
  commissionAmount,
  commissionStatus,
  commissionId,
  createdAt,
  paidOffDate,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden border rounded-lg transition-all duration-200 hover:shadow-md",
        "bg-white dark:bg-gray-950",
        className,
      )}>
      {/* Header with distinct color */}
      <CardHeader className='pb-3 pt-4 px-5 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-900/50 border-b'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            <Avatar className='h-12 w-12 ring-2 ring-white dark:ring-gray-800 shadow-sm'>
              <AvatarImage src={productImage} alt={productName} />
              <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
                {productName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <CardTitle className='text-base font-semibold truncate text-gray-900 dark:text-gray-100'>
                {productName}
              </CardTitle>
              <div className='flex items-center gap-2 mt-1.5'>
                <button
                  onClick={() => copyToClipboard(commissionId)}
                  className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group'>
                  <span className='font-mono text-xs text-gray-600 dark:text-gray-400'>
                    ID: {commissionId.slice(0, 8)}...
                  </span>
                  {copied ? (
                    <Check className='h-3 w-3 text-green-600' />
                  ) : (
                    <Copy className='h-3 w-3 text-gray-400 group-hover:text-gray-600' />
                  )}
                </button>
              </div>
            </div>
          </div>
          <CommissionStatusBadge status={commissionStatus as any} />
        </div>
      </CardHeader>

      {/* Card Body with white/light background */}
      <CardContent className='space-y-4 px-5 py-4'>
        {/* Product Details */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Quantity
            </p>
            <div className='flex items-center gap-2'>
              <Package className='h-4 w-4 text-gray-400' />
              <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                {quantity} units
              </span>
            </div>
          </div>
          <div className='space-y-1.5'>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Unit Price
            </p>
            <div className='font-mono text-sm font-semibold text-gray-700 dark:text-gray-300'>
              {formatCurrency(productPrice)}
            </div>
          </div>
          <div className='col-span-2 space-y-1.5 pt-1'>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Total Product Value
            </p>
            <div className='flex items-baseline gap-2'>
              <ShoppingCart className='h-4 w-4 text-primary' />
              <span className='text-2xl font-bold text-primary'>
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        <Separator className='my-2' />

        {/* Commission Section */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <div className='h-4 w-1 bg-primary rounded-full'></div>
            <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
              Commission Details
            </h3>
          </div>

          <div className='flex flex-wrap items-center gap-3 pl-3'>
            {/* Commission Rate Badge */}
            <div className='flex items-center gap-2'>
              <Badge
                variant='secondary'
                className='flex items-center gap-1.5 px-3 py-1.5 text-sm font-mono'>
                {commissionType === "percentage" ? (
                  <Percent className='h-3.5 w-3.5' />
                ) : (
                  <Coins className='h-3.5 w-3.5' />
                )}
                <span>
                  Rate:{" "}
                  {commissionType === "percentage"
                    ? `${commissionRate}%`
                    : formatCurrency(commissionRate)}
                </span>
              </Badge>

              <span className='text-gray-400'>→</span>

              {/* Commission Amount Badge */}
              <Badge className='flex items-center gap-1.5 px-3 py-1.5 text-sm font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'>
                <DollarSign className='h-3.5 w-3.5' />
                <span>Amount: {formatCurrency(commissionAmount)}</span>
              </Badge>
            </div>
          </div>
        </div>

        <Separator className='my-2' />

        {/* Recipient */}
        <div className='space-y-1.5'>
          <p className='text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5'>
            <User className='h-3.5 w-3.5' />
            Commission Recipient
          </p>
          <RecipientCell
            name={recipient.userName}
            avatar={recipient.userAvatar}
            className='text-sm font-medium'
          />
        </div>

        {/* Paid Off Date if exists */}
        {paidOffDate && (
          <div className='space-y-1.5 pt-2'>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5'>
              <TrendingUp className='h-3.5 w-3.5' />
              Paid Off Date
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              {formatDate(paidOffDate)}
            </p>
          </div>
        )}
      </CardContent>

      {/* Footer with distinct color - contains created date */}
      <CardFooter className='px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-t'>
        <div className='flex items-center justify-between w-full'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-3.5 w-3.5 text-gray-400' />
            <span className='text-xs text-gray-500'>Created:</span>
            <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>
              {createdAt ? formatDate(createdAt) : "N/A"}
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            <div className='h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600'></div>
            <span className='text-xs text-gray-400 font-mono'>
              Commission #{commissionId.slice(-6)}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
