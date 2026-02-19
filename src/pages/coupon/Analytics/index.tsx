import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
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
  const [segmentSummary, setSegmentSummary] = useState<SegmentSummary | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalCouponStats | null>(null);
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
    return <div className="flex justify-center items-center h-64">Loading analytics...</div>;
  }

  const segmentCards = [
    {
      title: "New Customers",
      count: segmentSummary?.newCustomers.count || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      customers: segmentSummary?.newCustomers.customers || [],
    },
    {
      title: "Inactive Customers",
      count: segmentSummary?.inactiveCustomers.count || 0,
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      customers: segmentSummary?.inactiveCustomers.customers || [],
    },
    {
      title: "High-Value Customers",
      count: segmentSummary?.highValueCustomers.count || 0,
      icon: Award,
      color: "text-green-600",
      bgColor: "bg-green-50",
      customers: segmentSummary?.highValueCustomers.customers || [],
    },
    {
      title: "Frequent Customers",
      count: segmentSummary?.frequentCustomers.count || 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      customers: segmentSummary?.frequentCustomers.customers || [],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coupon Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track coupon performance and customer segments
        </p>
      </div>

      {/* Global Coupon Statistics */}
      {globalStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.totalCoupons}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{globalStats.activeCoupons}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expired Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{globalStats.expiredCoupons}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Disabled Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{globalStats.disabledCoupons}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Most Used Coupons */}
      {globalStats && globalStats.mostUsed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Used Coupons</CardTitle>
            <CardDescription>Top performing coupons by usage count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {globalStats.mostUsed.map((coupon, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="font-mono font-semibold text-lg">{coupon.code}</div>
                    <div className="text-sm text-muted-foreground">Total Discount: {coupon.totalDiscount} BDT</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{coupon.usageCount}</div>
                    <div className="text-xs text-muted-foreground">uses</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Segments */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Segments</CardTitle>
          <CardDescription>
            Target customers with personalized coupons based on their behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segmentCards.map((segment) => {
              const Icon = segment.icon;
              return (
                <Card key={segment.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-lg ${segment.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${segment.color}`} />
                      </div>
                      <Badge variant="secondary" className="text-lg font-semibold">
                        {segment.count}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-4">{segment.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {segment.count} {segment.title.toLowerCase()}
                      </p>
                      {segment.customers.slice(0, 3).length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Sample customers:
                          <ul className="mt-1 space-y-1">
                            {segment.customers.slice(0, 3).map((customer, idx) => (
                              <li key={idx} className="font-mono">
                                {customer.phoneNumber}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Segment Details Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="new">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="highValue">High-Value</TabsTrigger>
              <TabsTrigger value="frequent">Frequent</TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-4">
              {segmentSummary && segmentSummary.newCustomers.customers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>First Order</TableHead>
                      <TableHead>Order Count</TableHead>
                      <TableHead>Total Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {segmentSummary.newCustomers.customers.slice(0, 10).map((customer, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono">{customer.phoneNumber}</TableCell>
                        <TableCell>{new Date(customer.firstOrderDate).toLocaleDateString()}</TableCell>
                        <TableCell>{customer.orderCount}</TableCell>
                        <TableCell>{customer.totalSpent} BDT</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No new customers found
                </div>
              )}
            </TabsContent>

            <TabsContent value="inactive" className="space-y-4">
              {segmentSummary && segmentSummary.inactiveCustomers.customers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Last Order</TableHead>
                      <TableHead>Order Count</TableHead>
                      <TableHead>Total Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {segmentSummary.inactiveCustomers.customers.slice(0, 10).map((customer, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono">{customer.phoneNumber}</TableCell>
                        <TableCell>{new Date(customer.lastOrderDate).toLocaleDateString()}</TableCell>
                        <TableCell>{customer.orderCount}</TableCell>
                        <TableCell>{customer.totalSpent} BDT</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No inactive customers found
                </div>
              )}
            </TabsContent>

            <TabsContent value="highValue" className="space-y-4">
              {segmentSummary && segmentSummary.highValueCustomers.customers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Order Count</TableHead>
                      <TableHead>Avg Order Value</TableHead>
                      <TableHead>Last Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {segmentSummary.highValueCustomers.customers.slice(0, 10).map((customer, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono">{customer.phoneNumber}</TableCell>
                        <TableCell className="font-semibold">{customer.totalSpent} BDT</TableCell>
                        <TableCell>{customer.orderCount}</TableCell>
                        <TableCell>{customer.avgOrderValue} BDT</TableCell>
                        <TableCell>{new Date(customer.lastOrderDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No high-value customers found
                </div>
              )}
            </TabsContent>

            <TabsContent value="frequent" className="space-y-4">
              {segmentSummary && segmentSummary.frequentCustomers.customers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Order Count</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>First Order</TableHead>
                      <TableHead>Last Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {segmentSummary.frequentCustomers.customers.slice(0, 10).map((customer, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono">{customer.phoneNumber}</TableCell>
                        <TableCell className="font-semibold">{customer.orderCount}</TableCell>
                        <TableCell>{customer.totalSpent} BDT</TableCell>
                        <TableCell>{new Date(customer.firstOrderDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(customer.lastOrderDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No frequent customers found
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
