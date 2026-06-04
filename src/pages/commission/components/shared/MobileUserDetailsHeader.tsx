import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar";
import { Card, CardContent } from "../../../../components/ui/card";
import { formatCurrency } from "../../../../utils/inventoryReportUtils";
import { TrendingUp, Calendar, ShoppingCart, Package } from "lucide-react";
import { formatDate } from "../../../../utils/inventoryReportUtils";

interface UserDetails {
  userId: string;
  userName: string;
  userAvatar: string;
  summary: {
    totalCommissionAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    pendingAmount: number;
    totalOrders: number;
    totalProducts: number;
  };
}

interface MobileUserDetailsHeaderProps {
  userDetails: UserDetails;
  className?: string;
}

export const MobileUserDetailsHeader: React.FC<MobileUserDetailsHeaderProps> = ({
  userDetails,
  className = ''
}) => {
  const { summary } = userDetails;
  const paymentPercentage = summary.totalCommissionAmount > 0
    ? (summary.paidAmount / summary.totalCommissionAmount) * 100
    : 0;

  return (
    <div className={`md:hidden ${className}`}>
      <Card className='overflow-hidden'>
        <CardContent className='p-4'>
          {/* User Info Section */}
          <div className='flex items-center gap-4 mb-4'>
            <Avatar className='h-16 w-16 ring-4 ring-primary/10'>
              <AvatarImage
                src={userDetails.userAvatar}
                alt={userDetails.userName}
              />
              <AvatarFallback className='text-xl font-semibold bg-primary/10 text-primary'>
                {userDetails.userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <h3 className='text-xl font-bold mb-1'>{userDetails.userName}</h3>
              <div className='flex items-center gap-3 text-sm text-muted-foreground'>
                <div className='flex items-center gap-1'>
                  <ShoppingCart className='h-3.5 w-3.5' />
                  <span>{summary.totalOrders} order{summary.totalOrders !== 1 ? 's' : ''}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Package className='h-3.5 w-3.5' />
                  <span>{summary.totalProducts} product{summary.totalProducts !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats Grid */}
          <div className='grid grid-cols-2 gap-3'>
            {/* Total to Receive */}
            <div className='bg-primary/5 rounded-lg p-3 border border-primary/10'>
              <div className='text-xs text-muted-foreground mb-1'>Total to Receive</div>
              <div className='text-lg font-bold text-primary'>
                {formatCurrency(summary.totalCommissionAmount)}
              </div>
            </div>

            {/* Paid with Percentage */}
            <div className='bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-900'>
              <div className='text-xs text-muted-foreground mb-1 flex items-center justify-between'>
                <span>Paid</span>
                <TrendingUp className='h-3 w-3 text-green-600' />
              </div>
              <div className='text-lg font-bold text-green-700 dark:text-green-300'>
                {formatCurrency(summary.paidAmount)}
              </div>
              <div className='text-xs text-green-600 dark:text-green-400 mt-1'>
                {paymentPercentage.toFixed(1)}% of total
              </div>
            </div>

            {/* Pending */}
            <div className='bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-3 border border-yellow-200 dark:border-yellow-900'>
              <div className='text-xs text-muted-foreground mb-1'>Pending</div>
              <div className='text-lg font-bold text-yellow-700 dark:text-yellow-300'>
                {formatCurrency(summary.pendingAmount)}
              </div>
            </div>

            {/* Unpaid */}
            <div className='bg-red-50 dark:bg-red-950/30 rounded-lg p-3 border border-red-200 dark:border-red-900'>
              <div className='text-xs text-muted-foreground mb-1'>Unpaid</div>
              <div className='text-lg font-bold text-red-700 dark:text-red-300'>
                {formatCurrency(summary.unpaidAmount)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
