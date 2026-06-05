import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Commission } from "../../../../api/commission";
import { CommissionStatusBadge } from "../shared/CommissionStatusBadge";
import {
  formatDate,
  formatCurrency,
} from "../../../../utils/inventoryReportUtils";
import { showOrderModal } from "../../../../utils/orderModal";
import {
  Eye,
  Edit,
  Package,
  Calendar,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface CommissionTableProps {
  commissions: Commission[];
  onViewDetails?: (commission: Commission) => void;
  onUpdateStatus?: (commission: Commission) => void;
}

export const ProductCommissionTable: React.FC<CommissionTableProps> = ({
  commissions,
  onViewDetails,
  onUpdateStatus,
}) => {
  if (commissions.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground'>No commissions found</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Card Layout */}
      <div className='space-y-3 md:hidden'>
        {commissions.map((commission) => (
          <Card
            key={commission.id}
            className='relative overflow-hidden rounded-2xl border-[var(--cm-border,#e4e6f0)] bg-[var(--cm-surface,#fff)] shadow-[0_8px_24px_rgba(26,29,46,0.06)]'
          >
            <div className='absolute inset-x-0 top-0 h-1 bg-[var(--cm-accent,#5b52f0)]' />
            <CardContent className='p-4 pt-5 space-y-4'>
              {/* Header: Order + Status + User */}
              <div className='flex items-start justify-between gap-2'>
                <div className='flex items-center gap-2 flex-1 min-w-0'>
                  <Avatar className='h-11 w-11 ring-2 ring-[rgba(91,82,240,0.14)]'>
                    <AvatarImage src={commission.userAvatar} />
                    <AvatarFallback className='bg-[var(--cm-accent-lt,rgba(91,82,240,.08))] text-sm font-semibold text-[var(--cm-accent,#5b52f0)]'>
                      {commission.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    <p className='font-semibold text-sm text-[var(--cm-text,#1a1d2e)] truncate'>
                      {commission.userName}
                    </p>
                    <Button
                      variant='ghost'
                      className='mt-1 h-auto p-0 font-mono text-xs text-[var(--cm-muted,#8b90a7)] hover:bg-transparent hover:text-[var(--cm-accent,#5b52f0)]'
                      onClick={() => showOrderModal(commission.orderNumber)}>
                      <Badge
                        variant='outline'
                        className='pointer-events-none rounded-full border-[rgba(91,82,240,0.22)] bg-[var(--cm-accent-lt,rgba(91,82,240,.08))] px-2.5 text-[var(--cm-accent,#5b52f0)]'
                      >
                        #{commission.orderNumber}
                      </Badge>
                      <ExternalLink className='h-3 w-3 ml-1' />
                    </Button>
                  </div>
                </div>
                <CommissionStatusBadge status={commission.status} />
              </div>

              {/* Commission Amount */}
              <div className='rounded-2xl border border-[rgba(91,82,240,0.16)] bg-[linear-gradient(135deg,rgba(91,82,240,0.08),rgba(0,184,150,0.08))] p-3.5'>
                <div className='flex items-end justify-between gap-3'>
                  <div>
                    <p className='text-[11px] font-semibold uppercase tracking-wide text-[var(--cm-muted,#8b90a7)]'>
                      Commission
                    </p>
                    <p className='mt-1 text-2xl font-bold tracking-tight text-[var(--cm-text,#1a1d2e)]'>
                      {formatCurrency(commission.commissionAmount)}
                    </p>
                  </div>
                  <span className='rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[var(--cm-accent,#5b52f0)] shadow-sm'>
                    {commission.commissionType === "percentage"
                      ? `${commission.commissionRate}%`
                      : formatCurrency(commission.commissionRate)}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className='rounded-xl border border-[var(--cm-border,#e4e6f0)] bg-[var(--cm-surface2,#f0f1f8)]/60 p-3'>
                <div className='flex items-start gap-2 text-sm font-semibold text-[var(--cm-text,#1a1d2e)]'>
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--cm-accent,#5b52f0)] shadow-sm'>
                    <Package className='h-4 w-4' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <span className='line-clamp-1'>{commission.productName}</span>
                    <p className='mt-1 text-xs font-normal text-[var(--cm-muted,#8b90a7)]'>
                      Qty: {commission.quantity} x{" "}
                      {formatCurrency(commission.productPrice)} ={" "}
                      {formatCurrency(commission.totalPrice)}
                    </p>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <div className='rounded-xl bg-[var(--cm-surface2,#f0f1f8)]/60 px-3 py-2'>
                  <div className='flex items-center gap-1.5 text-[11px] font-medium text-[var(--cm-muted,#8b90a7)]'>
                    <Calendar className='h-3 w-3' />
                    Created
                  </div>
                  <p className='mt-1 text-xs font-semibold text-[var(--cm-text,#1a1d2e)]'>
                    {formatDate(commission.createdAt)}
                  </p>
                </div>
                <div className='rounded-xl bg-[var(--cm-surface2,#f0f1f8)]/60 px-3 py-2'>
                  <div className='flex items-center gap-1.5 text-[11px] font-medium text-[var(--cm-muted,#8b90a7)]'>
                    <CheckCircle2 className='h-3 w-3' />
                    Paid
                  </div>
                  <p className='mt-1 text-xs font-semibold text-[var(--cm-accent2,#00b896)]'>
                    {commission.status === "paid" && commission.paidOffDate
                      ? formatDate(commission.paidOffDate)
                      : "Pending"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className='grid grid-cols-2 gap-2 border-t border-[var(--cm-border,#e4e6f0)] pt-3'>
                {onViewDetails && (
                  <Button
                    variant='outline'
                    size='default'
                    className='h-11 rounded-xl border-[var(--cm-border,#e4e6f0)] bg-white text-[var(--cm-text,#1a1d2e)] hover:border-[rgba(91,82,240,0.35)] hover:bg-[var(--cm-accent-lt,rgba(91,82,240,.08))] hover:text-[var(--cm-accent,#5b52f0)]'
                    onClick={() => onViewDetails(commission)}>
                    <Eye className='h-4 w-4 mr-2' />
                    View
                  </Button>
                )}
                {onUpdateStatus && (
                  <Button
                    size='default'
                    className='h-11 rounded-xl bg-[var(--cm-accent,#5b52f0)] text-white shadow-[0_6px_16px_rgba(91,82,240,0.24)] hover:bg-[#6b63f5]'
                    onClick={() => onUpdateStatus(commission)}>
                    <Edit className='h-4 w-4 mr-2' />
                    Edit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className='rounded-b-md rounded-t-none border-t hidden md:block'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className='text-right'>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Paid Off Date</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissions.map((commission) => (
              <TableRow key={commission.id}>
                <TableCell className='font-medium'>
                  <Button
                    variant='ghost'
                    className='h-auto p-0 font-mono hover:text-blue-600 hover:bg-transparent'
                    onClick={() => showOrderModal(commission.orderNumber)}>
                    #{commission.orderNumber}
                    <ExternalLink className='h-3 w-3 ml-1 inline' />
                  </Button>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={commission.userAvatar} />
                      <AvatarFallback>
                        {commission.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='text-sm'>
                      <div className='font-medium'>{commission.userName}</div>
                      <div className='text-xs text-muted-foreground'>
                        {commission.userId}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='text-sm'>
                    <div className='font-medium'>{commission.productName}</div>
                    <div className='text-xs text-muted-foreground'>
                      Qty: {commission.quantity} ×{" "}
                      {formatCurrency(commission.productPrice)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='text-sm'>
                    <div className='font-medium'>
                      {formatCurrency(commission.commissionAmount)}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {commission.commissionType === "percentage"
                        ? `${commission.commissionRate}%`
                        : formatCurrency(commission.commissionRate)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <CommissionStatusBadge status={commission.status} />
                </TableCell>
                <TableCell>
                  <div className='text-sm text-muted-foreground'>
                    {formatDate(commission.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  {commission.status === "paid" && commission.paidOffDate ? (
                    <div className='flex items-center gap-1 text-sm text-green-600'>
                      <CheckCircle2 className='h-3 w-3' />
                      {formatDate(commission.paidOffDate)}
                    </div>
                  ) : (
                    <span className='text-sm text-muted-foreground'>-</span>
                  )}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-2'>
                    {onViewDetails && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onViewDetails(commission)}>
                        <Eye className='h-4 w-4' />
                      </Button>
                    )}
                    {onUpdateStatus && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onUpdateStatus(commission)}>
                        <Edit className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
