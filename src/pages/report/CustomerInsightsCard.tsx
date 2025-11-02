// ============================================
// FILE: components/reports/CustomerInsightsCard.tsx
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
import { Download, Users, UserPlus, UserCheck } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import useRoleCheck from "../auth/hooks/useRoleCheck";

interface CustomerInsightsCardProps {
  data: any;
  onDownload: () => void;
}

const chartConfig = {
  name: {
    label: "Name",
    color: "#ffffff",
  },
  spent: {
    label: "Spent",
    color: "#f7f1e3",
  },
  label: {
    color: "#ffffff",
  },
} satisfies ChartConfig;

const CustomerInsightsCard: React.FC<CustomerInsightsCardProps> = ({
  data,
  onDownload,
}) => {
  const topCustomersData =
    data.topCustomers?.slice(0, 5).map((customer: any) => ({
      name:
        `${customer.customerName} (${customer.phoneNumber})` ||
        customer.phoneNumber,
      spent: customer.totalSpent,
      orders: customer.orderCount,
    })) || [];

  return (
    <Card className='bg-[#636e72] text-white'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Customer Insights
          </CardTitle>
          <CardDescription className='text-white'>
            Customer analytics and top performers
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
        {/* Summary Metrics */}
        <div className='grid gap-4 grid-cols-3'>
          <div className='p-4 bg-cyan-50 dark:bg-cyan-950 rounded-lg'>
            <div className='flex items-center gap-2 text-cyan-600 dark:text-cyan-400'>
              <Users className='h-4 w-4' />
              <p className='text-sm font-medium'>Total</p>
            </div>
            <p className='text-2xl font-bold mt-2 text-cyan-600'>
              {data.summary?.totalUniqueCustomers || 0}
            </p>
          </div>

          <div className='p-4 bg-green-50 dark:bg-green-950 rounded-lg'>
            <div className='flex items-center gap-2 text-green-600 dark:text-green-400'>
              <UserPlus className='h-4 w-4' />
              <p className='text-sm font-medium'>New</p>
            </div>
            <p className='text-2xl font-bold mt-2 text-green-600'>
              {data.summary?.newCustomers || 0}
            </p>
          </div>

          <div className='p-4 bg-purple-50 dark:bg-purple-950 rounded-lg'>
            <div className='flex items-center gap-2 text-purple-600 dark:text-purple-400'>
              <UserCheck className='h-4 w-4' />
              <p className='text-sm font-medium'>Returning</p>
            </div>
            <p className='text-2xl font-bold mt-2 text-purple-600'>
              {data.summary?.returningCustomers || 0}
            </p>
          </div>
        </div>

        {/* Top Customers Chart */}
        {topCustomersData.length > 0 && (
          <div>
            <h3 className='text-sm font-medium mb-4'>
              Top 5 Customers by Spending
            </h3>
            <ChartContainer config={chartConfig} className='h-64 w-full'>
              <BarChart
                accessibilityLayer
                data={topCustomersData}
                layout='vertical'
                margin={{
                  right: 16,
                }}>
                <CartesianGrid horizontal={false} vertical={false} />
                <YAxis
                  dataKey='name'
                  type='category'
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                  hide
                />
                <XAxis dataKey='spent' type='number' hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator='line' />}
                />
                <Bar dataKey='spent' fill='var(--color-spent)' radius={5}>
                  <LabelList
                    dataKey='name'
                    position='insideLeft'
                    className='fill-(--color-name)'
                    fontSize={15}
                    fontWeight={600}
                  />
                  <LabelList
                    dataKey='spent'
                    position='right'
                    className='fill-white'
                    fontSize={12}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerInsightsCard;
