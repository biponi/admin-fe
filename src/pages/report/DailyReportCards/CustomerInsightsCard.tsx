// ============================================
// FILE: src/pages/report/DailyReportCards/CustomerInsightsCard.tsx
// ============================================
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Download, Users, UserPlus, Repeat } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import useRoleCheck from "../../auth/hooks/useRoleCheck";

interface CustomerInsightsCardProps {
  data: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    geographicDistribution: any[];
  };
  onDownload: (type: "csv" | "pdf", reportType?: string) => void;
}

const chartConfig = {
  new: {
    label: "New Customers",
    color: "#10b981", // green-500
  },
  returning: {
    label: "Returning Customers",
    color: "#3b82f6", // blue-500
  },
};

const CustomerInsightsCard: React.FC<CustomerInsightsCardProps> = ({
  data,
  onDownload,
}) => {
  const { hasRequiredPermission } = useRoleCheck();

  const chartData = [
    {
      name: "New Customers",
      value: data.newCustomers,
      fill: chartConfig.new.color,
    },
    {
      name: "Returning Customers",
      value: data.returningCustomers,
      fill: chartConfig.returning.color,
    },
  ];

  const newCustomerPercentage =
    data.totalCustomers > 0
      ? ((data.newCustomers / data.totalCustomers) * 100).toFixed(1)
      : "0";

  const returningCustomerPercentage =
    data.totalCustomers > 0
      ? ((data.returningCustomers / data.totalCustomers) * 100).toFixed(1)
      : "0";

  return (
    <Card className='border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2 text-[15px] font-semibold text-slate-900'>
              <Users className='h-4 w-4' />
              Customer Insights
            </CardTitle>
            <CardDescription className='text-[12px] text-slate-400'>
              Total Customers: {data.totalCustomers}
            </CardDescription>
          </div>
          {hasRequiredPermission("Report", "download") && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => onDownload("csv", "customer-insights")}
              className='h-8 px-3 gap-1.5 text-[13px] font-medium text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150'>
              <Download className='h-3.5 w-3.5' />
              Export CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {/* Customer Distribution Pie Chart */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='h-[250px]'>
              <h4 className='text-[13px] font-semibold text-slate-900 mb-4 text-center'>
                Customer Type Distribution
              </h4>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Customer Metrics */}
            <div className='space-y-4'>
              <h4 className='text-[13px] font-semibold text-slate-900'>
                Customer Metrics
              </h4>

              {/* Total Customers */}
              <div className='bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 relative overflow-hidden'>
                <div className='absolute left-0 top-0 bottom-0 w-[3px] my-2.5 rounded-full bg-indigo-500' />
                <div className='flex items-center gap-2 mb-2'>
                  <Users className='h-4 w-4 text-indigo-600' />
                  <p className='text-[12px] font-medium text-slate-900'>
                    Total Customers
                  </p>
                </div>
                <p className='text-[22px] font-semibold text-indigo-600 leading-none'>
                  {data.totalCustomers}
                </p>
              </div>

              {/* New Customers */}
              <div className='bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 relative overflow-hidden'>
                <div className='absolute left-0 top-0 bottom-0 w-[3px] my-2.5 rounded-full bg-emerald-500' />
                <div className='flex items-center gap-2 mb-2'>
                  <UserPlus className='h-4 w-4 text-emerald-600' />
                  <p className='text-[12px] font-medium text-slate-900'>
                    New Customers
                  </p>
                </div>
                <div className='flex items-baseline justify-between'>
                  <p className='text-[15px] font-semibold text-emerald-600'>
                    {data.newCustomers}
                  </p>
                  <p className='text-[12px] font-semibold text-emerald-600'>
                    {newCustomerPercentage}%
                  </p>
                </div>
              </div>

              {/* Returning Customers */}
              <div className='bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 relative overflow-hidden'>
                <div className='absolute left-0 top-0 bottom-0 w-[3px] my-2.5 rounded-full bg-blue-500' />
                <div className='flex items-center gap-2 mb-2'>
                  <Repeat className='h-4 w-4 text-blue-600' />
                  <p className='text-[12px] font-medium text-slate-900'>
                    Returning Customers
                  </p>
                </div>
                <div className='flex items-baseline justify-between'>
                  <p className='text-[15px] font-semibold text-blue-600'>
                    {data.returningCustomers}
                  </p>
                  <p className='text-[12px] font-semibold text-blue-600'>
                    {returningCustomerPercentage}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Acquisition Insights */}
          <div className='bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4'>
            <h4 className='text-[13px] font-semibold text-slate-900 mb-3'>
              Acquisition Insights
            </h4>
            <div className='grid grid-cols-3 gap-4'>
              <div className='text-center'>
                <p className='text-[22px] font-semibold text-emerald-600 leading-none'>
                  {newCustomerPercentage}%
                </p>
                <p className='text-[11px] text-slate-500 mt-1'>
                  New Customer Rate
                </p>
              </div>
              <div className='text-center'>
                <p className='text-[22px] font-semibold text-blue-600 leading-none'>
                  {returningCustomerPercentage}%
                </p>
                <p className='text-[11px] text-slate-500 mt-1'>
                  Retention Rate
                </p>
              </div>
              <div className='text-center'>
                <p className='text-[22px] font-semibold text-violet-600 leading-none'>
                  {data.totalCustomers > 0 && data.newCustomers > 0
                    ? (data.totalCustomers / data.newCustomers).toFixed(1)
                    : "0"}
                </p>
                <p className='text-[11px] text-slate-500 mt-1'>
                  Ratio (Total/New)
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInsightsCard;
