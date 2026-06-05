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
  AvatarImage,
  AvatarFallback,
} from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Checkbox } from "../../../../components/ui/checkbox";
import { UserCommissionSummary } from "../../../../api/commission";
import { StatusBreakdownBadge } from "../shared/StatusBreakdownBadge";
import {
  formatDate,
  formatCurrency,
} from "../../../../utils/inventoryReportUtils";
import {
  Eye,
  Package,
  Calendar,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";

interface UserCommissionTableProps {
  commissions: UserCommissionSummary[];
  selectedIds: string[];
  onSelect: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetails?: (userCommission: UserCommissionSummary) => void;
  loading?: boolean;
}

export const UserCommissionTable: React.FC<UserCommissionTableProps> = ({
  commissions = [],
  selectedIds,
  onSelect,
  onSelectAll,
  onViewDetails,
  loading = false,
}) => {
  const allSelected =
    commissions.length > 0 && selectedIds.length === commissions.length;

  // Mobile Card Layout
  const MobileCard = ({
    commission,
  }: {
    commission: UserCommissionSummary;
  }) => (
    <Card className='relative overflow-hidden rounded-2xl border-[var(--cm-border,#e4e6f0)] bg-[var(--cm-surface,#fff)] shadow-[0_8px_24px_rgba(26,29,46,0.06)]'>
      <div className='absolute inset-x-0 top-0 h-1 bg-[var(--cm-accent,#5b52f0)]' />
      <CardContent className='p-4 pt-5 space-y-4'>
        {/* Header: User Info + Checkbox + Total Commission */}
        <div className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-1 items-center gap-3'>
            <Checkbox
              checked={selectedIds.includes(commission.userId)}
              onCheckedChange={(checked: boolean) =>
                onSelect(commission.userId, checked)
              }
              className='shrink-0 border-[var(--cm-border,#e4e6f0)] data-[state=checked]:border-[var(--cm-accent,#5b52f0)] data-[state=checked]:bg-[var(--cm-accent,#5b52f0)]'
            />
            <Avatar className='h-11 w-11 ring-2 ring-[rgba(91,82,240,0.14)]'>
              <AvatarImage
                src={commission.userAvatar}
                alt={commission.userName}
              />
              <AvatarFallback className='bg-[var(--cm-accent-lt,rgba(91,82,240,.08))] text-sm font-semibold text-[var(--cm-accent,#5b52f0)]'>
                {commission.userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-[var(--cm-muted,#8b90a7)]'>
                User Commission
              </p>
              <h4 className='mt-0.5 truncate text-sm font-semibold text-[var(--cm-text,#1a1d2e)]'>
                {commission.userName}
              </h4>
              <div className='flex items-center gap-2 mt-1'>
                <ShoppingCart className='h-3 w-3 text-[var(--cm-muted,#8b90a7)]' />
                <span className='text-xs font-medium text-[var(--cm-muted,#8b90a7)]'>
                  {commission.totalOrders} orders
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-[rgba(91,82,240,0.16)] bg-[linear-gradient(135deg,rgba(91,82,240,0.08),rgba(0,184,150,0.08))] p-3.5'>
          <div className='flex items-end justify-between gap-3'>
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-[var(--cm-muted,#8b90a7)]'>
                Total Commission
              </p>
              <p className='mt-1 text-2xl font-bold tracking-tight text-[var(--cm-text,#1a1d2e)]'>
                {formatCurrency(commission.totalCommissionAmount)}
              </p>
            </div>
            <button
              className='flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--cm-accent,#5b52f0)] shadow-sm transition-colors hover:bg-[var(--cm-accent-lt,rgba(91,82,240,.08))]'
              onClick={() => onViewDetails?.(commission)}
            >
              <ChevronRight className='h-5 w-5' />
            </button>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className='rounded-xl bg-[var(--cm-surface2,#f0f1f8)]/60 px-3 py-2'>
          <p className='mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--cm-muted,#8b90a7)]'>
            Status
          </p>
          <StatusBreakdownBadge
            breakdown={commission.statusBreakdown}
            className='text-xs'
          />
        </div>

        {/* Products Count & Date Range */}
        <div className='grid grid-cols-2 gap-2'>
          <div className='rounded-xl bg-[var(--cm-surface2,#f0f1f8)]/60 px-3 py-2'>
            <div className='flex items-center gap-1.5 text-[11px] font-medium text-[var(--cm-muted,#8b90a7)]'>
              <Package className='h-3 w-3' />
              Products
            </div>
            <p className='mt-1 text-sm font-semibold text-[var(--cm-text,#1a1d2e)]'>
              {commission.totalProducts}
            </p>
          </div>
          <div className='rounded-xl bg-[var(--cm-surface2,#f0f1f8)]/60 px-3 py-2'>
            <div className='flex items-center gap-1.5 text-[11px] font-medium text-[var(--cm-muted,#8b90a7)]'>
              <Calendar className='h-3 w-3' />
              Range
            </div>
            <p className='mt-1 text-xs font-semibold leading-snug text-[var(--cm-text,#1a1d2e)]'>
              {formatDate(commission.firstCommissionDate)} -{" "}
              {formatDate(commission.lastCommissionDate)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className='border-t border-[var(--cm-border,#e4e6f0)] pt-3'>
          <Button
            variant='outline'
            size='default'
            className='h-11 w-full rounded-xl border-[var(--cm-border,#e4e6f0)] bg-white text-[var(--cm-text,#1a1d2e)] hover:border-[rgba(91,82,240,0.35)] hover:bg-[var(--cm-accent-lt,rgba(91,82,240,.08))] hover:text-[var(--cm-accent,#5b52f0)]'
            onClick={() => onViewDetails?.(commission)}>
            <Eye className='h-4 w-4 mr-2' />
            View Details
            <ChevronRight className='h-4 w-4 ml-1' />
          </Button>
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
                onCheckedChange={onSelectAll}
                aria-label='Select all'
              />
            </TableHead>
            <TableHead>User</TableHead>
            <TableHead>Total Commission</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Status Breakdown</TableHead>
            <TableHead>First Commission</TableHead>
            <TableHead>Last Commission</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commissions.map((commission) => (
            <TableRow key={commission.userId}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(commission.userId)}
                  onCheckedChange={(checked: boolean) =>
                    onSelect(commission.userId, checked)
                  }
                  aria-label={`Select ${commission.userName}`}
                />
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-8 w-8 ring-2 ring-primary/10'>
                    <AvatarImage
                      src={commission.userAvatar}
                      alt={commission.userName}
                    />
                    <AvatarFallback className='bg-primary/10 text-primary font-semibold text-xs'>
                      {commission.userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className='font-medium'>{commission.userName}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className='font-semibold text-primary'>
                  {formatCurrency(commission.totalCommissionAmount)}
                </span>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-1.5 text-sm'>
                  <ShoppingCart className='h-3.5 w-3.5 text-muted-foreground' />
                  {commission.totalOrders}
                </div>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-1.5 text-sm'>
                  <Package className='h-3.5 w-3.5 text-muted-foreground' />
                  {commission.totalProducts}
                </div>
              </TableCell>
              <TableCell>
                <StatusBreakdownBadge
                  breakdown={commission.statusBreakdown}
                  className='text-xs'
                />
              </TableCell>
              <TableCell className='text-sm text-muted-foreground'>
                {formatDate(commission.firstCommissionDate)}
              </TableCell>
              <TableCell className='text-sm text-muted-foreground'>
                {formatDate(commission.lastCommissionDate)}
              </TableCell>
              <TableCell className='text-right'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0'
                  onClick={() => onViewDetails?.(commission)}
                  title='View details'>
                  <Eye className='h-4 w-4' />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (commissions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <div className='rounded-full bg-muted p-4 mb-4'>
          <Package className='h-8 w-8 text-muted-foreground' />
        </div>
        <h3 className='text-lg font-semibold mb-2'>
          No User Commissions Found
        </h3>
        <p className='text-sm text-muted-foreground max-w-sm'>
          Try adjusting your filters or date range to see user commission data.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Card Layout */}
      <div className='md:hidden space-y-3'>
        {commissions.map((commission) => (
          <MobileCard key={commission.userId} commission={commission} />
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className='hidden md:block'>
        <DesktopTable />
      </div>
    </>
  );
};
