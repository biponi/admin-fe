// ============================================
// FILE: components/reports/GeographicDistributionCard.tsx
// ============================================
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Download, MapPin } from "lucide-react";
import useRoleCheck from "../auth/hooks/useRoleCheck";

import { ChartConfig } from "../../components/ui/chart";
import BarChartActive from "../../components/Charts/BarChartActive";
import BarChartWithLegend from "../../components/Charts/BarChartWithLegend";

interface GeographicData {
  discountPercentage: number;
  discounts: number;
  district: string;
  division: string;
  orderCount: number;
  revenue: number;
  subtotal: number;
  deliveryCharge?: number;
  paid?: number;
  due?: number;
}

interface GeographicDistributionCardProps {
  duration?: string;
  data: GeographicData[];
  onDownload: () => void;
}

const chartConfigForRevenue = {
  revenue: {
    label: "Revenue",
    color: "#218c74",
  },
  discounts: {
    label: "Discounts",
    color: "#b33939",
  },
  paid: {
    label: "Paid",
    color: "#218c74",
  },
  due: {
    label: "Due",
    color: "#ff793f",
  },
  backgroundGrid: {
    color: "#aaa69d",
  },
} satisfies ChartConfig;

const GeographicDistributionCard: React.FC<GeographicDistributionCardProps> = ({
  data,
  duration = "",
  onDownload,
}) => {
  const { hasRequiredPermission } = useRoleCheck();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace("BDT", "৳");
  };

  const divisionMap: { [key: string]: GeographicData } = {};

  data.forEach((item) => {
    if (!divisionMap[item.division]) {
      divisionMap[item.division] = {
        discountPercentage: 0,
        discounts: 0,
        district: "",
        division: item.division,
        orderCount: 0,
        revenue: 0,
        subtotal: 0,
      };
    }
    divisionMap[item.division].discountPercentage += item.discountPercentage;
    divisionMap[item.division].discounts += item.discounts;
    divisionMap[item.division].orderCount += item.orderCount;
    divisionMap[item.division].revenue += item.revenue;
    divisionMap[item.division].subtotal += item.subtotal;
    divisionMap[item.division].deliveryCharge =
      (divisionMap[item.division].deliveryCharge || 0) +
      (item.deliveryCharge || 0);
    divisionMap[item.division].paid =
      (divisionMap[item.division].paid || 0) + (item.paid || 0);
    divisionMap[item.division].due =
      (divisionMap[item.division].due || 0) + (item.due || 0);
  });

  const metricsForDivision = Object.values(divisionMap).map((item) => ({
    xKey: item.division,
    yKey: item.orderCount,
  }));

  const metricsForDivisionWithRevenue = Object.values(divisionMap).map(
    (item) => ({
      division: item.division,
      revenue: item.revenue,
      discounts: item.discounts,
      deliveryCharge: item.deliveryCharge,
      paid: item.paid,
      due: item.due,
      subtotal: item.subtotal,
    })
  );

  if (data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
        <div>
          <CardTitle className='flex items-center gap-2 mb-2'>
            <MapPin className='h-5 w-5' />
            Geographic Distribution
          </CardTitle>
          <CardDescription>
            Sales performance by geographic region
          </CardDescription>
        </div>
        {hasRequiredPermission("Report", "download") && (
          <Button onClick={onDownload} size='sm' variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            Download
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          <Tabs defaultValue='Division'>
            <TabsList>
              <TabsTrigger value='Division'>Division</TabsTrigger>
              <TabsTrigger value='District'>District</TabsTrigger>
            </TabsList>
            <TabsContent value='Division'>
              {/* Chart */}
              <div className='h-auto w-full grid grid-cols-1 gap-2 sm:grid-cols-2 mb-3'>
                <BarChartActive
                  names={{
                    xKey: "Division",
                    yKey: "Orders: ",
                  }}
                  data={metricsForDivision}
                  label='Order Count by Division'
                  duration={duration}
                  footer='Order Count Data'
                  footerDescription={
                    "Total Orders: " +
                    formatCurrency(
                      data.reduce((acc, item) => acc + item.orderCount, 0)
                    )
                  }
                  isUpwardTrend={false}
                />
                <BarChartWithLegend
                  data={metricsForDivisionWithRevenue}
                  xKey='division'
                  barKeys={["subtotal", "revenue"]}
                  chartConfig={chartConfigForRevenue}
                  label='Revenue vs Subtotal by Division'
                  duration={duration}
                  footer='Revenue Vs Subtotal'
                  footerDescription={
                    "Total Revenue " +
                    formatCurrency(
                      data.reduce((acc, item) => acc + item.revenue, 0)
                    ) +
                    " vs " +
                    "Total Subtotal " +
                    formatCurrency(
                      data.reduce((acc, item) => acc + item.subtotal, 0)
                    )
                  }
                  isUpwardTrend={false}
                />
              </div>

              <div className='h-auto w-full grid grid-cols-1 gap-2 sm:grid-cols-2'>
                <BarChartWithLegend
                  data={metricsForDivisionWithRevenue}
                  xKey='division'
                  barKeys={["discounts", "deliveryCharge"]}
                  chartConfig={chartConfigForRevenue}
                  label='Discount vs Delivery Charge by Division'
                  duration={duration}
                  footer='Discount Vs Delivery Charge'
                  footerDescription={
                    "Total Discounts " +
                    formatCurrency(
                      data.reduce((acc, item) => acc + item.discounts, 0)
                    ) +
                    " vs " +
                    "Total Delivery Charge " +
                    formatCurrency(
                      data.reduce(
                        (acc, item) => acc + (item.deliveryCharge ?? 0),
                        0
                      )
                    )
                  }
                  isUpwardTrend={false}
                />
                <BarChartWithLegend
                  data={metricsForDivisionWithRevenue}
                  xKey='division'
                  barKeys={["paid", "due"]}
                  chartConfig={chartConfigForRevenue}
                  label='Paid vs Due by Division'
                  duration={duration}
                  footer='Paid Vs Due'
                  footerDescription={
                    "Total Paid " +
                    formatCurrency(
                      data.reduce((acc, item) => acc + (item.paid || 0), 0)
                    ) +
                    " vs " +
                    "Total Due " +
                    formatCurrency(
                      data.reduce((acc, item) => acc + (item.due || 0), 0)
                    )
                  }
                  isUpwardTrend={false}
                />
              </div>
            </TabsContent>
            <TabsContent value='District'>
              {/* Data Table */}
              <div className='rounded-md border'>
                <div className='max-h-96 overflow-y-auto overflow-x-auto'>
                  <table className='w-full text-sm relative'>
                    <thead className=' sticky top-0 bg-background'>
                      <tr className='border-b bg-muted/50'>
                        <th className='p-3 text-left font-medium'>District</th>
                        <th className='p-3 text-right font-medium'>Orders</th>
                        <th className='p-3 text-right font-medium'>Subtotal</th>
                        <th className='p-3 text-right font-medium'>
                          Discounts
                        </th>
                        <th className='p-3 text-right font-medium'>Revenue</th>
                        <th className='p-3 text-right font-medium'>
                          Delivery Charge
                        </th>
                        <th className='p-3 text-right font-medium'>Paid</th>
                        <th className='p-3 text-right font-medium'>Due</th>

                        <th className='p-3 text-right font-medium'>Paid %</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((item, index) => (
                        <tr
                          key={index}
                          className='border-b last:border-0 hover:bg-muted/50 transition-colors'>
                          <td className='p-3 font-medium'>{item.district}</td>
                          <td className='p-3 text-right'>{item.orderCount}</td>

                          <td className='p-3 text-right'>
                            {formatCurrency(item.subtotal)}
                          </td>
                          <td className='p-3 text-right text-destructive'>
                            {formatCurrency(item.discounts)}
                          </td>
                          <td className='p-3 text-right font-semibold'>
                            {formatCurrency(item.revenue)}
                          </td>
                          <td className='p-3 text-right font-semibold'>
                            {formatCurrency(item.deliveryCharge || 0)}
                          </td>
                          <td className='p-3 text-right font-semibold'>
                            {formatCurrency(item.paid || 0)}
                          </td>
                          <td className='p-3 text-right font-semibold'>
                            {formatCurrency(item.due || 0)}
                          </td>

                          <td className='p-3 text-right'>
                            {(
                              ((item.paid || 0) /
                                (item.revenue + (item.deliveryCharge || 0))) *
                              100
                            ).toFixed(1)}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeographicDistributionCard;
