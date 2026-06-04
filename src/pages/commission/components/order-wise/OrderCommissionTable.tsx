import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Avatar, AvatarImage } from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Separator } from "../../../../components/ui/separator";
import { OrderCommission } from "../../../../api/commission";
import { RecipientCell } from "../shared/RecipientCell";
import { StatusBreakdownBadge } from "../shared/StatusBreakdownBadge";
import {
  formatDate,
  formatCurrency,
} from "../../../../utils/inventoryReportUtils";
import { showOrderModal } from "../../../../utils/orderModal";
import {
  Eye,
  Package,
  Calendar,
  ExternalLink,
  Users,
  BookText,
} from "lucide-react";
import { cn } from "../../../../lib/utils";

interface OrderCommissionTableProps {
  commissions: OrderCommission[];
  selectedIds: string[];
  onSelect: (orderId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetails?: (orderCommission: OrderCommission) => void;
  loading?: boolean;
}

export const OrderCommissionTable: React.FC<OrderCommissionTableProps> = ({
  commissions,
  selectedIds,
  onSelect,
  onSelectAll,
  onViewDetails,
  loading = false,
}) => {
  const allSelected =
    commissions.length > 0 && selectedIds.length === commissions.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  // Mobile Card Layout
  const MobileCard = ({ commission }: { commission: OrderCommission }) => (
    <Card className='overflow-hidden'>
      <CardContent className='p-4 space-y-3'>
        {/* Header: Order Number + Checkbox + Status */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 flex-1'>
            <Checkbox
              checked={selectedIds.includes(commission.orderId)}
              onCheckedChange={(checked: boolean) =>
                onSelect(commission.orderId, checked)
              }
              className='mr-2'
            />
            <Badge variant='outline' className='font-semibold'>
              #{commission.orderNumber}
            </Badge>
          </div>
          <StatusBreakdownBadge
            breakdown={commission.statusBreakdown}
            className='text-xs'
          />
        </div>

        {/* Recipients */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Users className='h-3 w-3' />
            <span>{commission.recipients.length} Recipient(s)</span>
          </div>
          <div className='space-y-2 pl-5'>
            {commission.recipients
              .slice(0, 2)
              .map((recipient: any, idx: number) => (
                <RecipientCell
                  key={idx}
                  name={recipient.userName}
                  avatar={recipient.userAvatar}
                  className='text-sm'
                />
              ))}
            {commission.recipients.length > 2 && (
              <div className='text-xs text-muted-foreground pl-11'>
                +{commission.recipients.length - 2} more
              </div>
            )}
          </div>
        </div>

        {/* Product Count & Total Commission */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 text-sm'>
            <Package className='h-4 w-4 text-muted-foreground' />
            <span className='text-muted-foreground'>
              {commission.productCount} Product(s)
            </span>
          </div>
          <div
            className={cn(
              "text-lg font-bold bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 px-3 py-1.5 rounded-lg",
              "cursor-pointer hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900 dark:hover:to-blue-900 transition-colors",
            )}
            onClick={() => onViewDetails?.(commission)}>
            {formatCurrency(commission.totalCommissionAmount)}
          </div>
        </div>

        {/* Date & Actions */}
        <Separator />
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Calendar className='h-3 w-3' />
            <span>{formatDate(commission.createdAt)}</span>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0'
              onClick={() => showOrderModal(commission.orderNumber)}
              title='View order'>
              <ExternalLink className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0'
              onClick={() => onViewDetails?.(commission)}
              title='View details'>
              <Eye className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Desktop Table Layout
  const DesktopTable = () => (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-12'>
              <Checkbox
                checked={allSelected}
                data-indeterminate={someSelected}
                onCheckedChange={(checked: boolean) => onSelectAll(checked)}
                aria-label='Select all'
              />
            </TableHead>
            <TableHead className='w-24'>Order Number</TableHead>
            <TableHead>Recipients</TableHead>
            <TableHead className='text-center'>Products</TableHead>
            <TableHead className='text-right'>Total Commission</TableHead>
            <TableHead className='text-center'>Status</TableHead>
            <TableHead className='text-center'>Created Date</TableHead>
            <TableHead className='w-24'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commissions.map((commission) => (
            <TableRow key={commission.orderId}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(commission.orderId)}
                  onCheckedChange={(checked: boolean) =>
                    onSelect(commission.orderId, checked)
                  }
                  aria-label='Select row'
                />
              </TableCell>
              <TableCell>
                <Badge variant='outline' className='font-semibold'>
                  #{commission.orderNumber}
                </Badge>
              </TableCell>
              <TableCell>
                <div className='space-y-1'>
                  {commission.recipients.length === 1 ? (
                    <RecipientCell
                      name={commission.recipients[0].userName}
                      avatar={commission.recipients[0].userAvatar}
                      className='text-sm'
                    />
                  ) : (
                    <div className='flex items-center gap-1'>
                      <Avatar className='h-6 w-6 -space-x-2'>
                        {commission.recipients
                          .slice(0, 3)
                          .map((recipient: any, idx: number) => (
                            <AvatarImage
                              key={idx}
                              src={recipient.userAvatar}
                              alt={recipient.userName}
                              className='border-2 border-background'
                            />
                          ))}
                      </Avatar>
                      <span className='text-sm text-muted-foreground'>
                        {commission.recipients.length} recipients
                      </span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className='text-center'>
                <div className='flex items-center justify-center gap-1 text-sm'>
                  <Package className='h-3 w-3 text-muted-foreground' />
                  <span>{commission.productCount}</span>
                </div>
              </TableCell>
              <TableCell className='text-right'>
                <div
                  className='font-semibold text-sm cursor-pointer hover:text-primary transition-colors'
                  onClick={() => onViewDetails?.(commission)}>
                  {formatCurrency(commission.totalCommissionAmount)}
                </div>
              </TableCell>
              <TableCell className='text-center'>
                <StatusBreakdownBadge
                  breakdown={commission.statusBreakdown}
                  className='text-xs'
                />
              </TableCell>
              <TableCell className='text-center'>
                <div className='flex items-center justify-center gap-1 text-xs text-muted-foreground'>
                  <Calendar className='h-3 w-3' />
                  <span>{formatDate(commission.createdAt)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0 hidden'
                    onClick={() => showOrderModal(commission.orderNumber)}
                    title='View order'>
                    <ExternalLink className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0'
                    onClick={() => onViewDetails?.(commission)}
                    title='View details'>
                    <BookText className='h-4 w-4' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2' />
          <p className='text-sm text-muted-foreground'>
            Loading commissions...
          </p>
        </div>
      </div>
    );
  }

  if (commissions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        <Package className='h-12 w-12 text-muted-foreground mb-4' />
        <h3 className='text-lg font-semibold mb-2'>No commissions found</h3>
        <p className='text-sm text-muted-foreground text-center max-w-md'>
          Try adjusting your filters or search criteria to find what you're
          looking for.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Card Layout */}
      <div className='md:hidden space-y-3'>
        {commissions.map((commission) => (
          <MobileCard key={commission.orderId} commission={commission} />
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className='hidden md:block'>
        <DesktopTable />
      </div>
    </>
  );
};
