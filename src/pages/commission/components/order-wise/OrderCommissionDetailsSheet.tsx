import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../../components/ui/sheet";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Separator } from "../../../../components/ui/separator";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import {
  Package,
  ShoppingCart,
  Calendar,
  Clock,
  Users,
  Copy,
  ExternalLink,
  X,
  BarChart2,
} from "lucide-react";
import { OrderCommissionDetails } from "../../../../api/commission";
import { CommissionStatusBadge } from "../shared/CommissionStatusBadge";
import { ProductCommissionCard } from "../shared/ProductCommissionCard";
import {
  formatCurrency,
  formatDate,
} from "../../../../utils/inventoryReportUtils";
import { showOrderModal } from "../../../../utils/orderModal";
import { cn } from "../../../../lib/utils";

interface OrderCommissionDetailsSheetProps {
  orderDetails: OrderCommissionDetails | null;
  open: boolean;
  onClose: () => void;
}

export const OrderCommissionDetailsSheet: React.FC<
  OrderCommissionDetailsSheetProps
> = ({ orderDetails, open, onClose }) => {
  if (!orderDetails) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        className={cn(
          "w-full sm:max-w-md md:max-w-2xl lg:max-w-3xl",
          "flex flex-col p-0 gap-0",
        )}>
        {/* Header */}
        <SheetHeader className='px-6 py-5 border-b'>
          <div className='flex items-start justify-between gap-3'>
            <div className='space-y-1.5'>
              <SheetTitle className='text-lg font-medium'>
                Order #{orderDetails.orderNumber}
              </SheetTitle>
              <Badge
                variant='outline'
                className='font-mono text-xs gap-1 cursor-pointer hover:bg-muted rounded-full'
                onClick={() => copyToClipboard(orderDetails.orderId)}>
                <Copy className='h-3 w-3' />
                {orderDetails.orderId.slice(0, 8)}…
              </Badge>
            </div>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 shrink-0 mt-0.5'
              onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className='flex-1'>
          <div className='px-6 py-5 space-y-6'>
            {/* Summary stat row */}
            <div className='grid grid-cols-3 gap-3'>
              <div className='bg-muted/50 rounded-lg px-4 py-3'>
                <p className='text-xs text-muted-foreground mb-1 flex items-center gap-1'>
                  <Package className='h-3 w-3' /> Products
                </p>
                <p className='text-xl font-medium'>
                  {orderDetails.summary.totalProducts}
                </p>
              </div>
              <div className='bg-muted/50 rounded-lg px-4 py-3'>
                <p className='text-xs text-muted-foreground mb-1 flex items-center gap-1'>
                  <ShoppingCart className='h-3 w-3' /> Quantity
                </p>
                <p className='text-xl font-medium'>
                  {orderDetails.summary.totalQuantity}
                </p>
              </div>
              <div className='bg-green-50 dark:bg-green-950/40 rounded-lg px-4 py-3'>
                <p className='text-xs text-green-700 dark:text-green-400 mb-1'>
                  Total commission
                </p>
                <p className='text-xl font-medium text-green-700 dark:text-green-400'>
                  {formatCurrency(orderDetails.summary.totalCommissionAmount)}
                </p>
              </div>
            </div>

            {/* Order details */}
            <section className='space-y-3'>
              <SectionLabel
                icon={<ShoppingCart className='h-3.5 w-3.5' />}
                label='Order details'
              />
              <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
                <InfoItem label='Order number'>
                  <Badge variant='outline' className='font-medium text-xs'>
                    #{orderDetails.orderNumber}
                  </Badge>
                </InfoItem>
                <InfoItem label='Total products'>
                  <span className='flex items-center gap-1.5 text-sm'>
                    <Package className='h-3.5 w-3.5 text-muted-foreground' />
                    {orderDetails.summary.totalProducts} items
                  </span>
                </InfoItem>
                <InfoItem label='Order created'>
                  <span className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                    <Calendar className='h-3.5 w-3.5' />
                    {formatDate(orderDetails.orderDates.createdAt)}
                  </span>
                </InfoItem>
                <InfoItem label='First commission'>
                  <span className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                    <Clock className='h-3.5 w-3.5' />
                    {formatDate(orderDetails.orderDates.firstCommissionCreated)}
                  </span>
                </InfoItem>
              </div>
            </section>

            <Separator />

            {/* Recipients */}
            <section className='space-y-3'>
              <SectionLabel
                icon={<Users className='h-3.5 w-3.5' />}
                label='Recipients'
                count={orderDetails.recipients.length}
              />
              <div className='divide-y'>
                {orderDetails.recipients.map((recipient, idx) => (
                  <div
                    key={idx}
                    className='flex items-center justify-between py-2.5 first:pt-0 last:pb-0'>
                    <div className='flex items-center gap-2.5'>
                      <Avatar className='h-7 w-7'>
                        <AvatarImage src={recipient.userAvatar} />
                        <AvatarFallback className='text-[10px]'>
                          {recipient.userName?.[0]?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='text-sm font-medium leading-tight'>
                          {recipient.userName}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {recipient.productCount} product(s)
                        </p>
                      </div>
                    </div>
                    <p className='text-sm font-medium'>
                      {formatCurrency(recipient.commissionAmount)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Status breakdown */}
            <section className='space-y-3'>
              <SectionLabel
                icon={<BarChart2 className='h-3.5 w-3.5' />}
                label='Status breakdown'
              />
              <div className='grid grid-cols-2 gap-2'>
                {Object.entries(orderDetails.statusBreakdown).map(
                  ([status, data]) => (
                    <div
                      key={status}
                      className='flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2.5'>
                      <div className='flex items-center gap-2'>
                        <CommissionStatusBadge
                          status={status as any}
                          className='text-xs'
                        />
                        <span className='text-xs text-muted-foreground'>
                          ×{data.count}
                        </span>
                      </div>
                      <span className='text-xs font-medium font-mono'>
                        {formatCurrency(data.amount)}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </section>

            <Separator />

            {/* Product breakdown */}
            <section className='space-y-3'>
              <div className='flex items-center justify-between'>
                <SectionLabel
                  icon={<Package className='h-3.5 w-3.5' />}
                  label='Product breakdown'
                />
                <Badge
                  variant='secondary'
                  className='text-xs font-normal rounded-full'>
                  {orderDetails.products.length}{" "}
                  {orderDetails.products.length === 1 ? "product" : "products"}
                </Badge>
              </div>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                {orderDetails.products.map((product, idx) => (
                  <ProductCommissionCard
                    key={idx}
                    productName={product.productName}
                    productImage={product.productImage}
                    quantity={product.quantity}
                    productPrice={product.productPrice}
                    totalPrice={product.totalPrice}
                    recipient={{
                      userName: product.commission.recipient.userName,
                      userAvatar: product.commission.recipient.userAvatar,
                    }}
                    commissionType={product.commission.type}
                    commissionRate={product.commission.rate}
                    commissionAmount={product.commission.amount}
                    commissionStatus={product.commission.status}
                    commissionId={product.commission.commissionId}
                    createdAt={product.commission.createdAt}
                    paidOffDate={product.commission.paidOffDate}
                  />
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className='border-t px-6 py-4 flex items-center justify-between'>
          <Button variant='outline' size='sm' onClick={onClose}>
            Close
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => showOrderModal(orderDetails.orderNumber)}>
            <ExternalLink className='h-3.5 w-3.5 mr-1.5' />
            View order
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

function SectionLabel({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <div className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide'>
      {icon}
      {label}
      {count !== undefined && (
        <span className='ml-1 font-normal normal-case tracking-normal bg-muted rounded-full px-2 py-0.5'>
          {count}
        </span>
      )}
    </div>
  );
}

function InfoItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-1'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <div>{children}</div>
    </div>
  );
}
