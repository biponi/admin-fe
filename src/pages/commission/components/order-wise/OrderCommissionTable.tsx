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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
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
  MoreHorizontal,
  Check,
  Clock,
  Pause,
  XCircle,
} from "lucide-react";

interface OrderCommissionTableProps {
  commissions: OrderCommission[];
  selectedIds: string[];
  onSelect: (orderId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetails?: (orderCommission: OrderCommission) => void;
  onMarkPaid?: (orderCommission: OrderCommission) => void;
  onMarkUnpaid?: (orderCommission: OrderCommission) => void;
  onHold?: (orderCommission: OrderCommission) => void;
  onCancel?: (orderCommission: OrderCommission) => void;
  loading?: boolean;
}

export const OrderCommissionTable: React.FC<OrderCommissionTableProps> = ({
  commissions,
  selectedIds,
  onSelect,
  onSelectAll,
  onViewDetails,
  onMarkPaid,
  onMarkUnpaid,
  onHold,
  onCancel,
  loading = false,
}) => {
  const allSelected =
    commissions.length > 0 && selectedIds.length === commissions.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  // Mobile Card Layout
  const MobileCard = ({ commission }: { commission: OrderCommission }) => (
    <Card className='relative overflow-hidden rounded-2xl border-[var(--cm-border,#e4e6f0)] bg-[var(--cm-surface,#fff)] shadow-[0_8px_24px_rgba(26,29,46,0.06)]'>
      <div className='absolute inset-x-0 top-0 h-1 bg-[var(--cm-accent,#5b52f0)]' />
      <CardContent className='p-4 pt-5 space-y-4'>
        {/* Header: Order Number + Checkbox + Status */}
        <div className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-1 items-center gap-3'>
            <Checkbox
              checked={selectedIds.includes(commission.orderId)}
              onCheckedChange={(checked: boolean) =>
                onSelect(commission.orderId, checked)
              }
              className='mt-0.5 shrink-0 border-[var(--cm-border,#e4e6f0)] data-[state=checked]:border-[var(--cm-accent,#5b52f0)] data-[state=checked]:bg-[var(--cm-accent,#5b52f0)]'
            />
            <div className='min-w-0'>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-[var(--cm-muted,#8b90a7)]'>
                Order Commission
              </p>
              <button
                className='mt-1 inline-flex items-center gap-1 rounded-full border border-[rgba(91,82,240,0.22)] bg-[var(--cm-accent-lt,rgba(91,82,240,.08))] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--cm-accent,#5b52f0)]'
                onClick={() => showOrderModal(commission.orderNumber)}
              >
                #{commission.orderNumber}
                <ExternalLink className='h-3 w-3' />
              </button>
            </div>
          </div>
          <StatusBreakdownBadge
            breakdown={commission.statusBreakdown}
            className='text-xs'
          />
        </div>

        {/* Recipients */}
        <div className='rounded-2xl border border-[var(--cm-border,#e4e6f0)] bg-[var(--cm-surface2,#f0f1f8)]/60 p-3'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-2 text-xs font-semibold text-[var(--cm-muted,#8b90a7)]'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[var(--cm-accent,#5b52f0)] shadow-sm'>
                <Users className='h-4 w-4' />
              </div>
              <span>{commission.recipients.length} Recipient(s)</span>
            </div>
            <span className='rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--cm-text,#1a1d2e)] shadow-sm'>
              {commission.productCount} products
            </span>
          </div>
          <div className='mt-3 space-y-2'>
            {commission.recipients
              .slice(0, 2)
              .map((recipient: any, idx: number) => (
                <RecipientCell
                  key={idx}
                  name={recipient.userName}
                  avatar={recipient.userAvatar}
                  className='rounded-xl bg-white/70 px-2 py-1.5 text-sm'
                />
              ))}
            {commission.recipients.length > 2 && (
              <div className='pl-2 text-xs font-medium text-[var(--cm-muted,#8b90a7)]'>
                +{commission.recipients.length - 2} more
              </div>
            )}
          </div>
        </div>

        {/* Product Count & Total Commission */}
        <div className='rounded-2xl border border-[rgba(91,82,240,0.16)] bg-[linear-gradient(135deg,rgba(91,82,240,0.08),rgba(0,184,150,0.08))] p-3.5'>
          <div className='flex items-end justify-between gap-3'>
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-[var(--cm-muted,#8b90a7)]'>
                Total Commission
              </p>
              <div
                className='mt-1 cursor-pointer text-2xl font-bold tracking-tight text-[var(--cm-text,#1a1d2e)] transition-colors hover:text-[var(--cm-accent,#5b52f0)]'
                onClick={() => onViewDetails?.(commission)}>
                {formatCurrency(commission.totalCommissionAmount)}
              </div>
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--cm-accent,#5b52f0)] shadow-sm'>
              <Package className='h-5 w-5' />
            </div>
          </div>
        </div>

        {/* Date & Actions */}
        <div className='flex items-center justify-between border-t border-[var(--cm-border,#e4e6f0)] pt-3'>
          <div className='flex items-center gap-2 text-xs font-medium text-[var(--cm-muted,#8b90a7)]'>
            <Calendar className='h-3 w-3' />
            <span>{formatDate(commission.createdAt)}</span>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-9 w-9 rounded-xl border-[var(--cm-border,#e4e6f0)] bg-white p-0 text-[var(--cm-muted,#8b90a7)] hover:border-[rgba(91,82,240,0.35)] hover:bg-[var(--cm-accent-lt,rgba(91,82,240,.08))] hover:text-[var(--cm-accent,#5b52f0)]'
              onClick={() => showOrderModal(commission.orderNumber)}
              title='View order'>
              <ExternalLink className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='h-9 w-9 rounded-xl border-[var(--cm-border,#e4e6f0)] bg-white p-0 text-[var(--cm-muted,#8b90a7)] hover:border-[rgba(91,82,240,0.35)] hover:bg-[var(--cm-accent-lt,rgba(91,82,240,.08))] hover:text-[var(--cm-accent,#5b52f0)]'
              onClick={() => onViewDetails?.(commission)}
              title='View details'>
              <Eye className='h-4 w-4' />
            </Button>
            {(onMarkPaid || onMarkUnpaid || onHold || onCancel) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-9 w-9 rounded-xl border-[var(--cm-border,#e4e6f0)] bg-white p-0 text-[var(--cm-muted,#8b90a7)] hover:border-[rgba(91,82,240,0.35)] hover:bg-[var(--cm-accent-lt,rgba(91,82,240,.08))] hover:text-[var(--cm-accent,#5b52f0)]'
                    title='More actions'>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='w-44'
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e4e6f0',
                    borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(26,29,46,.1)',
                  }}>
                  {onMarkPaid && (
                    <DropdownMenuItem
                      onClick={() => onMarkPaid(commission)}
                      className='text-green-600 focus:text-green-700 focus:bg-green-50'>
                      <Check className='h-4 w-4 mr-2' />
                      Mark Paid
                    </DropdownMenuItem>
                  )}
                  {onMarkUnpaid && (
                    <DropdownMenuItem
                      onClick={() => onMarkUnpaid(commission)}
                      className='text-blue-600 focus:text-blue-700 focus:bg-blue-50'>
                      <Clock className='h-4 w-4 mr-2' />
                      Mark Unpaid
                    </DropdownMenuItem>
                  )}
                  {onHold && (
                    <DropdownMenuItem
                      onClick={() => onHold(commission)}
                      className='text-orange-600 focus:text-orange-700 focus:bg-orange-50'>
                      <Pause className='h-4 w-4 mr-2' />
                      On Hold
                    </DropdownMenuItem>
                  )}
                  {onCancel && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onCancel(commission)}
                        className='text-red-600 focus:text-red-700 focus:bg-red-50'>
                        <XCircle className='h-4 w-4 mr-2' />
                        Cancel
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Desktop Table Layout
  const DesktopTable = () => (
    <div className='rounded-b-md rounded-t-none border-t'>
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
                  {(onMarkPaid || onMarkUnpaid || onHold || onCancel) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align='end'
                        className='w-44'
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e4e6f0',
                          borderRadius: 12,
                          boxShadow: '0 8px 24px rgba(26,29,46,.1)',
                        }}>
                        {onMarkPaid && (
                          <DropdownMenuItem
                            onClick={() => onMarkPaid(commission)}
                            className='text-green-600 focus:text-green-700 focus:bg-green-50'>
                            <Check className='h-4 w-4 mr-2' />
                            Mark Paid
                          </DropdownMenuItem>
                        )}
                        {onMarkUnpaid && (
                          <DropdownMenuItem
                            onClick={() => onMarkUnpaid(commission)}
                            className='text-blue-600 focus:text-blue-700 focus:bg-blue-50'>
                            <Clock className='h-4 w-4 mr-2' />
                            Mark Unpaid
                          </DropdownMenuItem>
                        )}
                        {onHold && (
                          <DropdownMenuItem
                            onClick={() => onHold(commission)}
                            className='text-orange-600 focus:text-orange-700 focus:bg-orange-50'>
                            <Pause className='h-4 w-4 mr-2' />
                            On Hold
                          </DropdownMenuItem>
                        )}
                        {onCancel && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onCancel(commission)}
                              className='text-red-600 focus:text-red-700 focus:bg-red-50'>
                              <XCircle className='h-4 w-4 mr-2' />
                              Cancel
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
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
