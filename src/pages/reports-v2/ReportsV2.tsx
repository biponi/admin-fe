import React, { useState, useEffect, useCallback } from "react";
import { startOfDay, endOfDay, format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  Wallet,
  Warehouse,
  Truck,
  RotateCcw,
  Ticket,
  CalendarIcon,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { DateRangePicker } from "../../coreComponents/DateRangePicker";
import MainView from "../../coreComponents/mainView";
import { cn } from "../../lib/utils";

import ExecutiveDashboardTab from "./components/ExecutiveDashboardTab";
import SalesTab from "./components/SalesTab";
import OrdersTab from "./components/OrdersTab";
import ProductsTab from "./components/ProductsTab";
import CustomersTab from "./components/CustomersTab";
import PaymentsFinanceTab from "./components/PaymentsFinanceTab";
import InventoryShippingTab from "./components/InventoryShippingTab";
import RefundsCouponsTab from "./components/RefundsCouponsTab";

import {
  fetchDashboard,
  fetchSales,
  fetchOrders,
  fetchProducts,
  fetchCustomers,
  fetchPayments,
  fetchFinance,
  fetchInventory,
  fetchShipping,
  fetchRefunds,
  fetchCoupons,
  type DashboardData,
  type SalesData,
  type OrdersData,
  type ProductsData,
  type CustomersData,
  type PaymentsData,
  type FinanceData,
  type InventoryData,
  type ShippingData,
  type RefundsData,
  type CouponsData,
} from "../../api/reportV2";

type TabId =
  | "dashboard"
  | "sales"
  | "orders"
  | "products"
  | "customers"
  | "payments"
  | "inventory"
  | "refunds";

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ElementType;
  color: string;
}

const TABS: TabConfig[] = [
  { id: "dashboard", label: "Executive", icon: BarChart3, color: "indigo" },
  { id: "sales", label: "Sales", icon: TrendingUp, color: "emerald" },
  { id: "orders", label: "Orders", icon: ShoppingCart, color: "blue" },
  { id: "products", label: "Products", icon: Package, color: "violet" },
  { id: "customers", label: "Customers", icon: Users, color: "amber" },
  {
    id: "payments",
    label: "Payments & Finance",
    icon: CreditCard,
    color: "cyan",
  },
  {
    id: "inventory",
    label: "Inventory & Shipping",
    icon: Warehouse,
    color: "rose",
  },
  {
    id: "refunds",
    label: "Refunds & Coupons",
    icon: RotateCcw,
    color: "orange",
  },
];

const ReportsV2: React.FC = () => {
  const [dateMode, setDateMode] = useState<"preset" | "range">("preset");
  const [preset, setPreset] = useState("last_30_days");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfDay(new Date(new Date().setDate(new Date().getDate() - 30))),
    to: endOfDay(new Date()),
  });
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [isLoading, setIsLoading] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [sales, setSales] = useState<SalesData | null>(null);
  const [orders, setOrders] = useState<OrdersData | null>(null);
  const [products, setProducts] = useState<ProductsData | null>(null);
  const [customers, setCustomers] = useState<CustomersData | null>(null);
  const [payments, setPayments] = useState<PaymentsData | null>(null);
  const [finance, setFinance] = useState<FinanceData | null>(null);
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [shipping, setShipping] = useState<ShippingData | null>(null);
  const [refunds, setRefunds] = useState<RefundsData | null>(null);
  const [coupons, setCoupons] = useState<CouponsData | null>(null);

  const formatLocalDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    const startDate = formatLocalDateTime(dateRange.from);
    const endDate = formatLocalDateTime(dateRange.to);

    try {
      const results = await Promise.allSettled([
        fetchDashboard(startDate, endDate),
        fetchSales(startDate, endDate),
        fetchOrders(startDate, endDate),
        fetchProducts(startDate, endDate),
        fetchCustomers(startDate, endDate),
        fetchPayments(startDate, endDate),
        fetchFinance(startDate, endDate),
        fetchInventory(),
        fetchShipping(startDate, endDate),
        fetchRefunds(startDate, endDate),
        fetchCoupons(startDate, endDate),
      ]);

      const setData = <T,>(
        result: PromiseSettledResult<any>,
        setter: (data: T | null) => void,
      ) => {
        if (result.status === "fulfilled" && result.value.success) {
          setter(result.value.data);
        }
      };

      setData<DashboardData>(results[0], setDashboard);
      setData<SalesData>(results[1], setSales);
      setData<OrdersData>(results[2], setOrders);
      setData<ProductsData>(results[3], setProducts);
      setData<CustomersData>(results[4], setCustomers);
      setData<PaymentsData>(results[5], setPayments);
      setData<FinanceData>(results[6], setFinance);
      setData<InventoryData>(results[7], setInventory);
      setData<ShippingData>(results[8], setShipping);
      setData<RefundsData>(results[9], setRefunds);
      setData<CouponsData>(results[10], setCoupons);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const presets = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last_7_days", label: "Last 7 Days" },
    { value: "last_30_days", label: "Last 30 Days" },
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "last_3_months", label: "Last 3 Months" },
    { value: "this_year", label: "This Year" },
  ];

  const applyPreset = (p: string) => {
    setPreset(p);
    const now = new Date();
    let from: Date;
    let to = endOfDay(now);

    switch (p) {
      case "today":
        from = startOfDay(now);
        break;
      case "yesterday":
        from = startOfDay(new Date(now.setDate(now.getDate() - 1)));
        to = endOfDay(new Date(now));
        break;
      case "last_7_days":
        from = startOfDay(
          new Date(new Date().setDate(new Date().getDate() - 7)),
        );
        break;
      case "last_30_days":
        from = startOfDay(
          new Date(new Date().setDate(new Date().getDate() - 30)),
        );
        break;
      case "this_month":
        from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
        break;
      case "last_month":
        from = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        to = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
        break;
      case "last_3_months":
        from = startOfDay(
          new Date(new Date().setMonth(new Date().getMonth() - 3)),
        );
        break;
      case "this_year":
        from = startOfDay(new Date(now.getFullYear(), 0, 1));
        break;
      default:
        from = startOfDay(
          new Date(new Date().setDate(new Date().getDate() - 30)),
        );
    }
    setDateRange({ from, to });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-BD").format(value);

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <ExecutiveDashboardTab
            data={dashboard}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
          />
        );
      case "sales":
        return (
          <SalesTab
            data={sales}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
          />
        );
      case "orders":
        return (
          <OrdersTab
            data={orders}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
          />
        );
      case "products":
        return (
          <ProductsTab
            data={products}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
          />
        );
      case "customers":
        return (
          <CustomersTab
            data={customers}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
          />
        );
      case "payments":
        return (
          <PaymentsFinanceTab
            payments={payments}
            finance={finance}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
          />
        );
      case "inventory":
        return (
          <InventoryShippingTab
            inventory={inventory}
            shipping={shipping}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
          />
        );
      case "refunds":
        return (
          <RefundsCouponsTab
            refunds={refunds}
            coupons={coupons}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
          />
        );
      default:
        return null;
    }
  };

  return (
    <MainView title='Reports & Analytics V2'>
      <div className='min-h-screen bg-slate-50/60'>
        <div className='max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6'>
          {/* Header */}
          <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200'>
                <BarChart3 className='h-5 w-5 text-white' />
              </div>
              <div>
                <h1 className='text-lg sm:text-xl font-semibold text-slate-900 leading-tight'>
                  Reports & Analytics
                </h1>
                <p className='text-xs sm:text-sm text-slate-500 mt-0.5'>
                  Comprehensive business intelligence dashboard
                </p>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={fetchAllData}
              disabled={isLoading}
              className='border-slate-200 self-start'>
              <RefreshCw
                className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
              />
              Refresh
            </Button>
          </div>

          {/* Data Freshness Notice */}
          <div className='bg-amber-50 border border-amber-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3'>
            <div className='flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-amber-100 flex items-center justify-center'>
              <RefreshCw className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600' />
            </div>
            <div>
              <p className='text-xs sm:text-sm font-medium text-amber-800'>
                Data refreshes every 12 hours
              </p>
              <p className='text-[10px] sm:text-xs text-amber-600 mt-0.5'>
                Today's data will be reflected in the next refresh cycle. Last
                updated data is from the previous 12-hour cycle.
              </p>
            </div>
          </div>

          {/* Date Controls */}
          <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-3 sm:p-4'>
            <div className='flex flex-col md:flex-row md:items-center gap-3 sm:gap-4'>
              {/* Preset Buttons */}
              <div className='flex items-center gap-2 flex-wrap'>
                <div className='inline-flex items-center bg-slate-100 p-1 rounded-lg'>
                  <Button
                    variant={dateMode === "preset" ? "default" : "ghost"}
                    size='sm'
                    onClick={() => setDateMode("preset")}
                    className={cn(
                      "rounded-md transition-all duration-200 text-xs",
                      dateMode === "preset"
                        ? "bg-white shadow-sm text-indigo-600"
                        : "hover:bg-white/50 text-slate-600",
                    )}>
                    Presets
                  </Button>
                  <Button
                    variant={dateMode === "range" ? "default" : "ghost"}
                    size='sm'
                    onClick={() => setDateMode("range")}
                    className={cn(
                      "rounded-md transition-all duration-200 text-xs",
                      dateMode === "range"
                        ? "bg-white shadow-sm text-indigo-600"
                        : "hover:bg-white/50 text-slate-600",
                    )}>
                    Custom Range
                  </Button>
                </div>
              </div>

              {/* Preset chips or Date Range Picker */}
              {dateMode === "preset" ? (
                <div className='flex items-center gap-1 sm:gap-1.5 flex-wrap'>
                  {presets.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => applyPreset(p.value)}
                      className={cn(
                        "px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-lg transition-all duration-200 border",
                        preset === p.value
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                      )}>
                      {p.label}
                    </button>
                  ))}
                </div>
              ) : (
                <DateRangePicker
                  key={dateMode}
                  initialDateFrom={dateRange.from}
                  initialDateTo={dateRange.to}
                  showCompare={false}
                  onUpdate={(values: {
                    range: DateRange;
                    rangeCompare?: DateRange | undefined;
                  }) => {
                    setDateRange({
                      from: startOfDay(values.range.from || new Date()),
                      to: endOfDay(values.range.to || new Date()),
                    });
                  }}
                />
              )}

              {/* Period display */}
              <div className='ml-auto text-[10px] sm:text-xs text-slate-500 flex items-center gap-1.5'>
                <CalendarIcon className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
                <span className='hidden sm:inline'>
                  {format(dateRange.from, "MMM dd, yyyy")} —{" "}
                  {format(dateRange.to, "MMM dd, yyyy")}
                </span>
                <span className='sm:hidden'>
                  {format(dateRange.from, "MMM dd")} —{" "}
                  {format(dateRange.to, "MMM dd")}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>
            <div className='border-b border-slate-100'>
              <div className='flex overflow-x-auto scrollbar-hide'>
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 -mb-px",
                        isActive
                          ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50",
                      )}>
                      <Icon className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                      <span className='hidden sm:inline'>{tab.label}</span>
                      <span className='sm:hidden'>
                        {tab.id === "dashboard" && "Exec"}
                        {tab.id === "sales" && "Sales"}
                        {tab.id === "orders" && "Orders"}
                        {tab.id === "products" && "Products"}
                        {tab.id === "customers" && "Customers"}
                        {tab.id === "payments" && "Pay"}
                        {tab.id === "inventory" && "Inv"}
                        {tab.id === "refunds" && "Ref"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className='p-3 sm:p-4 md:p-6'>
              {isLoading ? (
                <div className='flex items-center justify-center py-12 sm:py-20'>
                  <div className='flex flex-col items-center gap-4'>
                    <Loader2 className='h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 animate-spin' />
                    <div className='text-center'>
                      <h3 className='text-base sm:text-lg font-semibold text-slate-900'>
                        Loading Reports
                      </h3>
                      <p className='text-xs sm:text-sm text-slate-500 mt-1'>
                        Gathering your business data...
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                renderTabContent()
              )}
            </div>
          </div>
        </div>
      </div>
    </MainView>
  );
};

export default ReportsV2;
