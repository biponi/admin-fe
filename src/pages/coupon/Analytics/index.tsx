import { useState, useEffect } from "react";
import MainView from "../../../coreComponents/mainView";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { TrendingUp, Users, Target, Award } from "lucide-react";
import * as couponAPI from "../../../api/coupon";
import { SegmentSummary, GlobalCouponStats } from "../../../api/coupon";

export default function CouponAnalyticsPage() {
  const [segmentSummary, setSegmentSummary] = useState<SegmentSummary | null>(
    null,
  );
  const [globalStats, setGlobalStats] = useState<GlobalCouponStats | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [segmentsResponse, statsResponse] = await Promise.all([
        couponAPI.getSegmentSummary(),
        couponAPI.getGlobalCouponStats(),
      ]);

      if (segmentsResponse.success && segmentsResponse.data) {
        setSegmentSummary(segmentsResponse.data);
      }

      if (statsResponse.success && statsResponse.data) {
        setGlobalStats(statsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainView title="Coupon Analytics">
        <div className="min-h-screen bg-slate-50/60 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900">
                Loading Analytics
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Please wait while we gather your data...
              </p>
            </div>
          </div>
        </div>
      </MainView>
    );
  }

  const segmentCards = [
    {
      title: "New Customers",
      count: segmentSummary?.newCustomers.count || 0,
      icon: Users,
      customers: segmentSummary?.newCustomers.customers || [],
    },
    {
      title: "Inactive Customers",
      count: segmentSummary?.inactiveCustomers.count || 0,
      icon: Target,
      customers: segmentSummary?.inactiveCustomers.customers || [],
    },
    {
      title: "High-Value Customers",
      count: segmentSummary?.highValueCustomers.count || 0,
      icon: Award,
      customers: segmentSummary?.highValueCustomers.customers || [],
    },
    {
      title: "Frequent Customers",
      count: segmentSummary?.frequentCustomers.count || 0,
      icon: TrendingUp,
      customers: segmentSummary?.frequentCustomers.customers || [],
    },
  ];

  return (
    <MainView title="Coupon Analytics">
      <div className="min-h-screen bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 leading-tight">
                  Coupon Analytics
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Track coupon performance and customer segments
                </p>
              </div>
            </div>
          </div>

          {/* Global Statistics */}
          {globalStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Total Coupons",
                  value: globalStats.totalCoupons.toString(),
                  accent: "text-indigo-600",
                  bg: "bg-indigo-50",
                },
                {
                  label: "Active Coupons",
                  value: globalStats.activeCoupons.toString(),
                  accent: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  label: "Expired Coupons",
                  value: globalStats.expiredCoupons.toString(),
                  accent: "text-slate-600",
                  bg: "bg-slate-50",
                },
                {
                  label: "Disabled Coupons",
                  value: globalStats.disabledCoupons.toString(),
                  accent: "text-rose-600",
                  bg: "bg-rose-50",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${stat.bg.replace("bg-", "bg-").replace("50", "400")}`}
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-lg font-semibold ${stat.accent} leading-none`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Most Used Coupons */}
          {globalStats && globalStats.mostUsed.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">
                  Most Used Coupons
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Top performing coupons by usage count
                </p>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {globalStats.mostUsed.map((coupon, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex-1">
                        <div className="font-mono font-semibold text-lg text-slate-900">
                          {coupon.code}
                        </div>
                        <div className="text-sm text-slate-500">
                          Total Discount: {coupon.totalDiscount} BDT
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">
                          {coupon.usageCount}
                        </div>
                        <div className="text-xs text-slate-500">uses</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Customer Segments */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">
                Customer Segments
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Target customers with personalized coupons based on their
                behavior
              </p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {segmentCards.map((segment) => {
                  const Icon = segment.icon;
                  return (
                    <div
                      key={segment.title}
                      className="group bg-slate-50 rounded-xl border border-slate-100 p-4 hover:shadow-md hover:border-slate-200 transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors duration-200">
                          <Icon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-base font-semibold bg-white border border-slate-200">
                          {segment.count}
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-2">
                        {segment.title}
                      </h3>
                      <p className="text-sm text-slate-500 mb-3">
                        {segment.count} {segment.title.toLowerCase()}
                      </p>
                      {segment.customers.slice(0, 3).length > 0 && (
                        <div className="text-xs text-slate-500">
                          <div className="font-medium text-slate-600 mb-1">
                            Sample customers:
                          </div>
                          <ul className="space-y-1">
                            {segment.customers.slice(0, 3).map((customer, idx) => (
                              <li key={idx} className="font-mono">
                                {customer.phoneNumber}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Segment Details Tabs */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100">
              <Tabs defaultValue="new" className="w-full">
                <TabsList className="h-auto bg-transparent p-0 gap-0 rounded-none">
                  <TabsTrigger
                    value="new"
                    className="relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150">
                    <Users className="h-4 w-4" />
                    New
                  </TabsTrigger>
                  <TabsTrigger
                    value="inactive"
                    className="relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150">
                    <Target className="h-4 w-4" />
                    Inactive
                  </TabsTrigger>
                  <TabsTrigger
                    value="highValue"
                    className="relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150">
                    <Award className="h-4 w-4" />
                    High-Value
                  </TabsTrigger>
                  <TabsTrigger
                    value="frequent"
                    className="relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150">
                    <TrendingUp className="h-4 w-4" />
                    Frequent
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="new"
                  className="p-4 sm:p-6 mt-0 focus-visible:outline-none">
                  {segmentSummary &&
                  segmentSummary.newCustomers.customers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-100 hover:bg-slate-50/50">
                            <TableHead className="font-semibold text-slate-700">
                              Phone Number
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              First Order
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              Order Count
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              Total Spent
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {segmentSummary.newCustomers.customers
                            .slice(0, 10)
                            .map((customer, idx) => (
                              <TableRow
                                key={idx}
                                className="border-slate-100 hover:bg-slate-50/50">
                                <TableCell className="font-mono text-slate-900">
                                  {customer.phoneNumber}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {new Date(
                                    customer.firstOrderDate,
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {customer.orderCount}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {customer.totalSpent} BDT
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No new customers found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent
                  value="inactive"
                  className="p-4 sm:p-6 mt-0 focus-visible:outline-none">
                  {segmentSummary &&
                  segmentSummary.inactiveCustomers.customers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-100 hover:bg-slate-50/50">
                            <TableHead className="font-semibold text-slate-700">
                              Phone Number
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              Last Order
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              Order Count
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              Total Spent
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {segmentSummary.inactiveCustomers.customers
                            .slice(0, 10)
                            .map((customer, idx) => (
                              <TableRow
                                key={idx}
                                className="border-slate-100 hover:bg-slate-50/50">
                                <TableCell className="font-mono text-slate-900">
                                  {customer.phoneNumber}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {new Date(
                                    customer.lastOrderDate,
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {customer.orderCount}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {customer.totalSpent} BDT
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No inactive customers found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent
                  value="highValue"
                  className="p-4 sm:p-6 mt-0 focus-visible:outline-none">
                  {segmentSummary &&
                  segmentSummary.highValueCustomers.customers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-100 hover:bg-slate-50/50">
                            <TableHead className="font-semibold text-slate-700">
                              Phone Number
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              Total Spent
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              Order Count
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              Avg Order Value
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              Last Order
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {segmentSummary.highValueCustomers.customers
                            .slice(0, 10)
                            .map((customer, idx) => (
                              <TableRow
                                key={idx}
                                className="border-slate-100 hover:bg-slate-50/50">
                                <TableCell className="font-mono text-slate-900">
                                  {customer.phoneNumber}
                                </TableCell>
                                <TableCell className="font-semibold text-slate-900">
                                  {customer.totalSpent} BDT
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {customer.orderCount}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {customer.avgOrderValue} BDT
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {new Date(
                                    customer.lastOrderDate,
                                  ).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No high-value customers found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent
                  value="frequent"
                  className="p-4 sm:p-6 mt-0 focus-visible:outline-none">
                  {segmentSummary &&
                  segmentSummary.frequentCustomers.customers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-100 hover:bg-slate-50/50">
                            <TableHead className="font-semibold text-slate-700">
                              Phone Number
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              Order Count
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              Total Spent
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              First Order
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              Last Order
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {segmentSummary.frequentCustomers.customers
                            .slice(0, 10)
                            .map((customer, idx) => (
                              <TableRow
                                key={idx}
                                className="border-slate-100 hover:bg-slate-50/50">
                                <TableCell className="font-mono text-slate-900">
                                  {customer.phoneNumber}
                                </TableCell>
                                <TableCell className="font-semibold text-slate-900">
                                  {customer.orderCount}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {customer.totalSpent} BDT
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {new Date(
                                    customer.firstOrderDate,
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {new Date(
                                    customer.lastOrderDate,
                                  ).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No frequent customers found</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </MainView>
  );
}
