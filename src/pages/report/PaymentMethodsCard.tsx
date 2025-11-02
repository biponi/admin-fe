// ============================================
// FILE: components/reports/PaymentMethodsCard.tsx
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
import { Download, CreditCard } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import useRoleCheck from "../auth/hooks/useRoleCheck";

interface PaymentMethodsCardProps {
  data: any;
  onDownload: () => void;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const PaymentMethodsCard: React.FC<PaymentMethodsCardProps> = ({
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

  const chartData =
    data.breakdown?.map((item: any) => ({
      name: item.paymentType.toUpperCase(),
      value: item.totalAmount,
      count: item.transactionCount,
    })) || [];

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <CreditCard className='h-5 w-5' />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Payment method breakdown and analytics
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
        {/* Summary */}
        <div className='grid gap-4 grid-cols-2'>
          <div className='p-4 bg-blue-50 dark:bg-blue-950 rounded-lg'>
            <p className='text-sm font-medium text-blue-600 dark:text-blue-400'>
              Total Transactions
            </p>
            <p className='text-2xl font-bold mt-2'>
              {data.summary?.totalTransactions || 0}
            </p>
          </div>
          <div className='p-4 bg-green-50 dark:bg-green-950 rounded-lg'>
            <p className='text-sm font-medium text-green-600 dark:text-green-400'>
              Total Amount
            </p>
            <p className='text-2xl font-bold mt-2'>
              {formatCurrency(data.summary?.totalAmount || 0)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div>
          <ResponsiveContainer width='100%' height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent ?? 0 * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'>
                {chartData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any, props: any) => [
                  `${formatCurrency(value)} (${
                    props.payload.count
                  } transactions)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown List */}
        <div className='space-y-2'>
          {data.breakdown?.map((method: any, index: number) => (
            <div
              key={index}
              className='flex items-center justify-between p-3 bg-muted rounded-lg'>
              <div className='flex items-center gap-3'>
                <div
                  className='w-3 h-3 rounded-full'
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div>
                  <p className='font-medium'>
                    {method.paymentType.toUpperCase()}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {method.transactionCount} transactions
                  </p>
                </div>
              </div>
              <p className='font-bold'>{formatCurrency(method.totalAmount)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodsCard;
