import { useState, useEffect } from "react";
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
import { useCommission } from "../../../hooks/useCommission";
import { CommissionStatusBadge } from "../../commission/components/CommissionStatusBadge";
import {
  formatDate,
  formatCurrency,
} from "../../../utils/inventoryReportUtils";
import { Commission } from "../../../api/commission";
import { Loader2, Package, Calendar, CheckCircle2 } from "lucide-react";

interface UserCommissionTableProps {
  userId: string;
}

export const UserCommissionTable: React.FC<UserCommissionTableProps> = ({
  userId,
}) => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  //eslint-disable-next-line
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const { fetchPersonalCommissions, isLoading } = useCommission();

  useEffect(() => {
    const loadCommissions = async () => {
      const data = await fetchPersonalCommissions({ page: 1, limit: 20 });
      if (data) {
        setCommissions(data.commissions);
        setPagination(data.pagination);
      }
    };

    loadCommissions();
    //eslint-disable-next-line
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Commissions</CardTitle>
      </CardHeader>
      <CardContent>
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
          </>
        )}
      </CardContent>
    </Card>
  );
};
