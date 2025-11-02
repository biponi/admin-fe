// ============================================
// FILE: components/reports/OrderFulfillmentCard.tsx
// ============================================
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Download, Package, AlertCircle, Clock } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import useRoleCheck from "../auth/hooks/useRoleCheck";

interface OrderFulfillmentCardProps {
  data: any;
  onDownload: () => void;
}

const chartConfig = {
  count: {
    label: "Count",
    color: "#636e72",
  },
  value: {
    label: "Value",
    color: "#2d3436",
  },
} satisfies ChartConfig;

const OrderFulfillmentCard: React.FC<OrderFulfillmentCardProps> = ({
  data,
  onDownload,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statusChartData =
    data.statusDistribution?.map((item: any) => ({
      status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      count: item.count,
      value: item.totalValue,
    })) || [];

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Order Fulfillment
          </CardTitle>
          <CardDescription>
            Order status distribution and fulfillment metrics
          </CardDescription>
        </div>
        {useRoleCheck().hasRequiredPermission("Report", "download") && (
          <Button onClick={onDownload} size='sm' variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            Download
          </Button>
        )}
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Stuck Orders Alert */}
        <div className='w-full grid grid-cols-1 gap-2 md:grid-cols-2'>
          {data.stuckOrders && data.stuckOrders.count > 0 && (
            <div className='p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg'>
              <div className='flex items-center gap-2 text-red-600 dark:text-red-400 mb-3'>
                <AlertCircle className='h-5 w-5' />
                <p className='font-semibold'>
                  {data.stuckOrders.count} Orders Need Attention
                </p>
              </div>
              <div className='space-y-2'>
                {data.stuckOrders.orders
                  ?.slice(0, 4)
                  .map((order: any, index: number) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded'>
                      <div>
                        <p className='font-medium'>
                          Order #{order.orderNumber}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {order.customerName} • {order.customerPhone}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='font-bold'>
                          {formatCurrency(order.totalPrice)}
                        </p>
                        <p className='text-sm text-red-600 dark:text-red-400'>
                          {order.ageInDays} days old
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Status Distribution Chart */}
          <div className='h-96 grid grid-cols-1 gap-2'>
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Number of orders by status</CardDescription>
              </CardHeader>
              <CardContent className='w-full'>
                <ChartContainer config={chartConfig} className='h-64 w-full'>
                  <BarChart accessibilityLayer data={statusChartData}>
                    <CartesianGrid vertical={true} />
                    <XAxis
                      dataKey='status'
                      tickLine={false}
                      tickMargin={5}
                      axisLine={false}
                      fontWeight={500}
                      fontSize={15}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator='dashed' />}
                    />
                    <YAxis yAxisId='left' orientation='left' hide />
                    <YAxis yAxisId='right' orientation='right' hide />
                    <Bar
                      yAxisId='left'
                      dataKey='count'
                      fill='var(--color-count)'
                      radius={5}
                      name={"Orders"}
                    />
                    <Bar
                      yAxisId='right'
                      dataKey='value'
                      fill='var(--color-value)'
                      radius={5}
                      name={"Total Value: "}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Average Age by Status */}
        {data.averageAgeByStatus && data.averageAgeByStatus.length > 0 && (
          <div>
            <h3 className='text-sm font-medium mb-3 flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              Average Order Age by Status
            </h3>
            <div className='grid gap-3 grid-cols-2 md:grid-cols-4'>
              {data.averageAgeByStatus.map((item: any, index: number) => (
                <div key={index} className='p-3 bg-muted rounded-lg'>
                  <p className='text-sm text-muted-foreground capitalize'>
                    {item.status}
                  </p>
                  <p className='text-xl font-bold'>
                    {item.averageAgeInDays.toFixed(1)} days
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderFulfillmentCard;
