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
import { Separator } from "../../../../components/ui/separator";
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
    <Card className='overflow-hidden hover:shadow-md transition-shadow'>
      <CardContent className='p-4 space-y-3'>
        {/* Header: User Info + Checkbox + Total Commission */}
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            <Checkbox
              checked={selectedIds.includes(commission.userId)}
              onCheckedChange={(checked: boolean) =>
                onSelect(commission.userId, checked)
              }
              className='shrink-0'
            />
            <Avatar className='h-10 w-10 ring-2 ring-primary/10'>
              <AvatarImage
                src={commission.userAvatar}
                alt={commission.userName}
              />
              <AvatarFallback className='bg-primary/10 text-primary font-semibold text-sm'>
                {commission.userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <h4 className='font-semibold text-sm truncate'>
                {commission.userName}
              </h4>
              <div className='flex items-center gap-2 mt-1'>
                <ShoppingCart className='h-3 w-3 text-muted-foreground' />
                <span className='text-xs text-muted-foreground'>
                  {commission.totalOrders} orders
                </span>
              </div>
            </div>
          </div>
          <div className='text-right shrink-0'>
            <div className='text-lg font-bold text-primary'>
              {formatCurrency(commission.totalCommissionAmount)}
            </div>
            <div className='text-xs text-muted-foreground'>Total</div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className='pl-14'>
          <StatusBreakdownBadge
            breakdown={commission.statusBreakdown}
            className='text-xs'
          />
        </div>

        {/* Products Count & Date Range */}
        <div className='flex items-center justify-between pl-14'>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Package className='h-3 w-3' />
            <span>{commission.totalProducts} Product(s)</span>
          </div>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Calendar className='h-3 w-3' />
            <span>
              {formatDate(commission.firstCommissionDate)} –{" "}
              {formatDate(commission.lastCommissionDate)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <Separator />
        <div className='flex justify-end pl-14'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 gap-1'
            onClick={() => onViewDetails?.(commission)}>
            <Eye className='h-3.5 w-3.5' />
            View Details
            <ChevronRight className='h-3.5 w-3.5' />
          </Button>
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
