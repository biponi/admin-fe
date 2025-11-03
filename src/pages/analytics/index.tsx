// import { useEffect, useState } from "react";
// import { analyticsAPI } from "../../api/analytics";
// import type {
//   DashboardResponse,
//   RealtimeResponse,
//   FunnelResponse,
//   TopProductsResponse,
//   DemographicsResponse,
//   TimeSeriesResponse,
//   HourlyActivityResponse,
// } from "../../api/analytics";
// import MetricCard from "./components/MetricCard";
// import RevenueChart from "./components/RevenueChart";
// import HourlyActivityChart from "./components/HourlyActivityChart";
// import RealtimeSessions from "./components/RealtimeSessions";
// import DemographicsChart from "./components/DemographicsChart";
// import FunnelChart from "./components/FunnelChart";
// import TopProductsTable from "./components/TopProductsTable";
// import DateRangePicker from "./components/DateRangePicker";
// import {
//   DollarSign,
//   Users,
//   TrendingUp,
//   RefreshCw,
//   Eye,
//   ShoppingCart,
//   Activity,
//   BarChart3,
// } from "lucide-react";
// import { Button } from "../../components/ui/button";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "../../components/ui/tabs";

const Analytics = () => {
  // const [loading, setLoading] = useState(true);
  // const [refreshing, setRefreshing] = useState(false);
  // const [dateRange, setDateRange] = useState({
  //   startDate: "",
  //   endDate: "",
  // });

  // // State for all analytics data
  // const [realtime, setRealtime] = useState<RealtimeResponse | null>(null);
  // const [funnel, setFunnel] = useState<FunnelResponse | null>(null);
  // const [topProducts, setTopProducts] = useState<TopProductsResponse | null>(
  //   null
  // );
  // const [demographics, setDemographics] = useState<DemographicsResponse | null>(
  //   null
  // );
  // const [timeseries] = useState<TimeSeriesResponse | null>(null);
  // const [hourlyActivity, setHourlyActivity] =
  //   useState<HourlyActivityResponse | null>(null);

  // // Initialize with last 30 days
  // useEffect(() => {
  //   const endDate = new Date();
  //   const startDate = new Date();
  //   startDate.setDate(startDate.getDate() - 30);

  //   setDateRange({
  //     startDate: startDate.toISOString().split("T")[0],
  //     endDate: endDate.toISOString().split("T")[0],
  //   });
  // }, []);

  // // Fetch all data
  // useEffect(() => {
  //   if (dateRange.startDate && dateRange.endDate) {
  //     fetchAllData();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [dateRange]);

  // // Auto-refresh realtime data every 30 seconds
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchRealtimeData();
  //   }, 30000);

  //   return () => clearInterval(interval);
  // }, []);

  // const fetchAllData = async () => {
  //   try {
  //     setLoading(true);

  //     const [
  //       realtimeData,
  //       funnelData,
  //       productsData,
  //       demographicsData,
  //       hourlyData,
  //     ] = await Promise.all([
  //       analyticsAPI.getRealtime(),
  //       analyticsAPI.getFunnel(dateRange.startDate, dateRange.endDate),
  //       analyticsAPI.getTopProducts(dateRange.startDate, dateRange.endDate, 10),
  //       analyticsAPI.getDemographics(dateRange.startDate, dateRange.endDate),
  //       analyticsAPI.getHourlyActivity(dateRange.startDate, dateRange.endDate),
  //     ]);

  //     setRealtime(realtimeData);
  //     setFunnel(funnelData);
  //     setTopProducts(productsData);
  //     setDemographics(demographicsData);
  //     setHourlyActivity(hourlyData);
  //   } catch (error) {
  //     console.error("Failed to fetch analytics data:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fetchRealtimeData = async () => {
  //   try {
  //     const realtimeData = await analyticsAPI.getRealtime();
  //     setRealtime(realtimeData);
  //   } catch (error) {
  //     console.error("Failed to fetch realtime data:", error);
  //   }
  // };

  // const handleRefresh = async () => {
  //   setRefreshing(true);
  //   await fetchAllData();
  //   setRefreshing(false);
  // };

  // const handleDateRangeChange = (startDate: string, endDate: string) => {
  //   setDateRange({ startDate, endDate });
  // };

  // const formatDuration = (seconds: number) => {
  //   const minutes = Math.floor(seconds / 60);
  //   const secs = Math.floor(seconds % 60);
  //   return `${minutes}m ${secs}s`;
  // };

  // if (loading) {
  //   return (
  //     <div className='flex items-center justify-center h-screen'>
  //       <div className='text-center'>
  //         <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-4' />
  //         <p className='text-muted-foreground'>Loading analytics...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    // <div className='w-full mx-auto p-2 space-y-6'>
    //   {/* Header */}
    //   <div className='flex items-center justify-between'>
    //     <div>
    //       <h1 className='text-3xl font-bold'>Analytics Dashboard</h1>
    //       <p className='text-muted-foreground'>
    //         Firebase Analytics (GA4) - Real-time insights and performance
    //         metrics
    //       </p>
    //     </div>
    //     <div className='flex items-center gap-4'>
    //       <DateRangePicker onDateRangeChange={handleDateRangeChange} />
    //       <Button onClick={handleRefresh} disabled={refreshing} size='sm'>
    //         <RefreshCw
    //           className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
    //         />
    //         Refresh
    //       </Button>
    //     </div>
    //   </div>

    //   {/* Overview Metrics */}
    //   {dashboard && (
    //     <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
    //       <MetricCard
    //         title='Active Users'
    //         value={dashboard.overview.activeUsers.toLocaleString()}
    //         icon={Users}
    //         description={`${dashboard.overview.newUsers.toLocaleString()} new users`}
    //       />
    //       <MetricCard
    //         title='Total Revenue'
    //         value={`৳${dashboard.overview.totalRevenue.toLocaleString()}`}
    //         icon={DollarSign}
    //         description={`${dashboard.overview.transactions} transactions`}
    //       />
    //       <MetricCard
    //         title='Sessions'
    //         value={dashboard.overview.sessions.toLocaleString()}
    //         icon={Activity}
    //         description={`${formatDuration(
    //           dashboard.overview.averageSessionDuration
    //         )} avg`}
    //       />
    //       <MetricCard
    //         title='Conversion Rate'
    //         value={`${dashboard.overview.conversionRate.toFixed(1)}%`}
    //         icon={TrendingUp}
    //         description={`${dashboard.overview.bounceRate.toFixed(
    //           1
    //         )}% bounce rate`}
    //       />
    //     </div>
    //   )}

    //   {/* E-commerce Metrics */}
    //   {dashboard && (
    //     <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
    //       <MetricCard
    //         title='Items Viewed'
    //         value={dashboard.overview.itemsViewed.toLocaleString()}
    //         icon={Eye}
    //         description='Product views'
    //       />
    //       <MetricCard
    //         title='Added to Cart'
    //         value={dashboard.overview.itemsAddedToCart.toLocaleString()}
    //         icon={ShoppingCart}
    //         description={`${dashboard.overview.cartToViewRate.toFixed(
    //           1
    //         )}% of views`}
    //       />
    //       <MetricCard
    //         title='Avg Order Value'
    //         value={`৳${dashboard.overview.averageOrderValue.toLocaleString()}`}
    //         icon={DollarSign}
    //         description='Per transaction'
    //       />
    //       <MetricCard
    //         title='Purchase Rate'
    //         value={`${dashboard.overview.purchaseToCartRate.toFixed(1)}%`}
    //         icon={BarChart3}
    //         description='Cart to purchase'
    //       />
    //     </div>
    //   )}

    //   {/* Main Content Tabs */}
    //   <Tabs defaultValue='overview' className='space-y-4'>
    //     <TabsList>
    //       <TabsTrigger value='overview'>Overview</TabsTrigger>
    //       <TabsTrigger value='realtime'>Live Activity</TabsTrigger>
    //       <TabsTrigger value='products'>Products</TabsTrigger>
    //       <TabsTrigger value='demographics'>Demographics</TabsTrigger>
    //     </TabsList>

    //     {/* Overview Tab */}
    //     <TabsContent value='overview' className='space-y-4'>
    //       <div className='grid gap-4 md:grid-cols-2'>
    //         <div className='md:col-span-2'>
    //           {timeseries && <RevenueChart data={timeseries.timeseries} />}
    //         </div>

    //         <div className='md:col-span-1'>
    //           {funnel && (
    //             <FunnelChart
    //               data={funnel.funnel}
    //               conversionRate={funnel.conversionRate}
    //               dropOffRate={funnel.dropOffRate}
    //             />
    //           )}
    //         </div>

    //         <div className='md:col-span-1'>
    //           {hourlyActivity && (
    //             <HourlyActivityChart data={hourlyActivity.hourlyActivity} />
    //           )}
    //         </div>
    //       </div>
    //     </TabsContent>

    //     {/* Realtime Tab */}
    //     <TabsContent value='realtime' className='space-y-4'>
    //       {realtime && <RealtimeSessions data={realtime} />}
    //     </TabsContent>

    //     {/* Products Tab */}
    //     <TabsContent value='products' className='space-y-4'>
    //       {topProducts && <TopProductsTable products={topProducts.products} />}
    //     </TabsContent>

    //     {/* Demographics Tab */}
    //     <TabsContent value='demographics' className='space-y-4'>
    //       {demographics && (
    //         <div className='grid gap-4 md:grid-cols-2'>
    //           <div className='md:col-span-2'>
    //             <DemographicsChart
    //               data={demographics.byCountry}
    //               title='Users by Country'
    //             />
    //           </div>

    //           <div className='md:col-span-1'>
    //             <DemographicsChart
    //               data={demographics.byCity}
    //               title='Top Cities'
    //             />
    //           </div>

    //           <div className='md:col-span-1'>
    //             <DemographicsChart
    //               data={demographics.byDevice}
    //               title='Device Categories'
    //             />
    //           </div>
    //         </div>
    //       )}
    //     </TabsContent>
    //   </Tabs>
    // </div>
    <div className='w-full mx-auto p-2 space-y-6'></div>
  );
};

export default Analytics;
