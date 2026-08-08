import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useCommission } from "../../../hooks/useCommission";
import { CommissionStatusBadge } from "../../commission/components/CommissionStatusBadge";
import {
  formatDate,
  formatCurrency,
} from "../../../utils/inventoryReportUtils";
import { Commission } from "../../../api/commission";
import { DateRangePicker } from "../../../coreComponents/DateRangePicker";
import { DateRange } from "react-day-picker";
import {
  Loader2,
  Package,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { startOfDay, endOfDay } from "date-fns";

interface UserCommissionTableProps {
  userId: string;
}

export const UserCommissionTable: React.FC<UserCommissionTableProps> = ({
  userId,
}) => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { fetchPersonalCommissions, isLoading } = useCommission();

  const filterParams = useMemo(() => {
    const params: Record<string, any> = {
      page: 1,
      limit: 20,
    };
    if (dateRange.from) {
      params.startDate = startOfDay(dateRange.from).toISOString();
    }
    if (dateRange.to) {
      params.endDate = endOfDay(dateRange.to).toISOString();
    }
    if (statusFilter !== "all") {
      params.status = statusFilter;
    }
    return params;
  }, [dateRange, statusFilter]);

  const loadCommissions = useCallback(
    async (page: number) => {
      setIsLoadingPage(true);
      const data = await fetchPersonalCommissions({
        ...filterParams,
        page,
      });
      if (data) {
        setCommissions(data.commissions);
        setPagination(data.pagination);
      }
      setIsLoadingPage(false);
    },
    [fetchPersonalCommissions, filterParams],
  );

  useEffect(() => {
    loadCommissions(1);
  }, [loadCommissions]);

  const hasActiveFilters =
    dateRange.from !== undefined || dateRange.to !== undefined || statusFilter !== "all";

  const clearFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setStatusFilter("all");
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages || isLoadingPage) return;
    setPagination((prev) => ({ ...prev, currentPage: page }));
    loadCommissions(page);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Commissions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filter Bar */}
        <div className="mb-4 space-y-3">
          {/* Date Range Picker + Status Filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <DateRangePicker
              initialDateFrom={dateRange.from}
              initialDateTo={dateRange.to}
              showCompare={false}
              onUpdate={(values: { range: DateRange }) => {
                setDateRange({
                  from: values.range.from ? startOfDay(values.range.from) : undefined,
                  to: values.range.to ? endOfDay(values.range.to) : undefined,
                });
              }}
            />

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Status:
              </span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9 text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="hold">Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="removed">Removed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-xs text-muted-foreground"
                onClick={clearFilters}>
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <Separator className="mb-4" />

        {isLoading ? (
          <div className='flex justify-center items-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        ) : commissions.length === 0 ? (
          <div className='text-center py-8 text-muted-foreground'>
            No commissions found
          </div>
        ) : (
          <>
            {/* Mobile: Card Layout */}
            <div className='space-y-3 md:hidden'>
              {commissions.map((commission) => (
                <Card key={commission.id} className='overflow-hidden'>
                  <CardContent className='p-4 space-y-3'>
                    {/* Header: Order + Status */}
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <Avatar className='h-8 w-8'>
                            <AvatarFallback className='text-xs bg-blue-100 text-blue-700'>
                              {commission.userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Badge
                            variant='outline'
                            className='font-mono text-xs'>
                            #{commission.orderNumber}
                          </Badge>
                        </div>
                      </div>
                      <CommissionStatusBadge status={commission.status} />
                    </div>

                    <Separator />

                    {/* Commission Amount */}
                    <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200'>
                      <p className='text-xs text-blue-700 mb-1'>
                        Commission Amount
                      </p>
                      <p className='text-2xl font-bold text-blue-900'>
                        {formatCurrency(commission.commissionAmount)}
                      </p>
                      <p className='text-xs text-blue-700 mt-1'>
                        {commission.commissionType === "percentage"
                          ? `${commission.commissionRate}% rate`
                          : `${formatCurrency(commission.commissionRate)} rate`}
                      </p>
                    </div>

                    {/* Product Info */}
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2 text-sm font-medium'>
                        <Package className='h-4 w-4 text-purple-600' />
                        <span className='line-clamp-1'>
                          {commission.productName}
                        </span>
                      </div>
                      <p className='text-xs text-muted-foreground pl-6'>
                        Qty: {commission.quantity} ×{" "}
                        {formatCurrency(commission.productPrice)} ={" "}
                        {formatCurrency(commission.totalPrice)}
                      </p>
                    </div>

                    {/* Date */}
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <Calendar className='h-3 w-3' />
                      {formatDate(commission.createdAt)}
                    </div>

                    {/* Paid Off Date - Only for paid commissions */}
                    {commission.status === "paid" && commission.paidOffDate && (
                      <div className='flex items-center gap-2 text-xs text-green-600'>
                        <CheckCircle2 className='h-3 w-3' />
                        Paid: {formatDate(commission.paidOffDate)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop: Table Layout */}
            <div className='rounded-md border hidden md:block'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Paid Off Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className='font-medium'>
                        #{commission.orderNumber}
                      </TableCell>
                      <TableCell>{commission.productName}</TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(commission.commissionAmount)}
                      </TableCell>
                      <TableCell>
                        <CommissionStatusBadge status={commission.status} />
                      </TableCell>
                      <TableCell>{formatDate(commission.createdAt)}</TableCell>
                      <TableCell>
                        {commission.status === "paid" &&
                        commission.paidOffDate ? (
                          <div className='flex items-center gap-1 text-sm text-green-600'>
                            <CheckCircle2 className='h-3 w-3' />
                            {formatDate(commission.paidOffDate)}
                          </div>
                        ) : (
                          <span className='text-sm text-muted-foreground'>
                            -
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className='flex items-center justify-between gap-4 pt-4'>
                <span className='text-sm text-muted-foreground'>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <div className='flex items-center gap-1'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      handlePageChange(pagination.currentPage - 1)
                    }
                    disabled={pagination.currentPage <= 1 || isLoadingPage}
                    className='h-8 w-8 p-0'>
                    <ChevronLeft className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      handlePageChange(pagination.currentPage + 1)
                    }
                    disabled={
                      pagination.currentPage >= pagination.totalPages ||
                      isLoadingPage
                    }
                    className='h-8 w-8 p-0'>
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
