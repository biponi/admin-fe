import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Checkbox } from "../../../components/ui/checkbox";
import { Button } from "../../../components/ui/button";
import {
  Users,
  TrendingUp,
  DollarSign,
  Wallet,
  ChevronDown,
  ChevronUp,
  Megaphone,
  X,
  Trophy,
} from "lucide-react";
import { useCustomerAnalytics } from "../hooks/useCustomerAnalytics";
import { CustomerStatsTopCustomer } from "../interface";
import useRoleCheck from "../../auth/hooks/useRoleCheck";
import { useIsMobile } from "../../../hooks/use-mobile";

interface CustomerStatsProps {
  onBulkCommunicate?: (customers: CustomerStatsTopCustomer[]) => void;
}

const CustomerStats = ({ onBulkCommunicate }: CustomerStatsProps) => {
  const { stats, loading, fetchStats } = useCustomerAnalytics();
  const [isTopCustomersExpanded, setIsTopCustomersExpanded] = useState(false);
  const [selectedTopCustomers, setSelectedTopCustomers] = useState<Set<string>>(
    new Set(),
  );
  const isMobile = useIsMobile();
  const { hasRequiredPermission } = useRoleCheck();

  useEffect(() => {
    fetchStats();
    //eslint-disable-next-line
  }, []);

  // Helper function to safely format numbers
  const safeNumber = (value: number | undefined, fallback: number = 0) => {
    return Number(value?.toFixed(2)).toLocaleString() ?? fallback;
  };

  // Handlers for bulk selection
  const handleSelectTopCustomer = (phone: string) => {
    const newSelection = new Set(selectedTopCustomers);
    if (newSelection.has(phone)) {
      newSelection.delete(phone);
    } else {
      newSelection.add(phone);
    }
    setSelectedTopCustomers(newSelection);
  };

  const handleSelectAllTopCustomers = () => {
    if (!stats?.topCustomers) return;
    if (selectedTopCustomers.size === stats.topCustomers.length) {
      setSelectedTopCustomers(new Set());
    } else {
      setSelectedTopCustomers(
        new Set(stats.topCustomers.map((c) => c.customerPhone)),
      );
    }
  };

  const handleClearTopCustomerSelection = () => {
    setSelectedTopCustomers(new Set());
  };

  const getSelectedTopCustomersData = () => {
    return (
      stats?.topCustomers?.filter((c) =>
        selectedTopCustomers.has(c.customerPhone),
      ) || []
    );
  };

  const handleBulkCommunicateClick = () => {
    const selectedData = getSelectedTopCustomersData();
    if (onBulkCommunicate && selectedData.length > 0) {
      onBulkCommunicate(selectedData);
    }
  };

  if (loading || !stats) {
    return (
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className='border-slate-200/80 shadow-sm'>
            <CardContent className='p-4 md:p-6'>
              <div className='animate-pulse'>
                <div className='h-3 bg-slate-200 rounded w-2/3 mb-3'></div>
                <div className='h-6 bg-slate-200 rounded w-3/4'></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Customers",
      value: safeNumber(stats.summary?.totalCustomers).toLocaleString(),
      icon: <Users className='h-4 w-4 md:h-5 md:w-5' />,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50",
      change: `${safeNumber(stats.summary?.totalOrders).toLocaleString()} total orders`,
    },
    {
      title: "Total Revenue",
      value: `৳${safeNumber(stats.summary?.totalRevenue).toLocaleString()}`,
      icon: <DollarSign className='h-4 w-4 md:h-5 md:w-5' />,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
      change: "All time",
    },
    {
      title: "Total Paid",
      value: `৳${safeNumber(stats.summary?.totalPaid).toLocaleString()}`,
      icon: <Wallet className='h-4 w-4 md:h-5 md:w-5' />,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      change: `৳${safeNumber(stats.summary?.totalPending).toLocaleString()} pending`,
    },
    {
      title: "Avg. Spent/Customer",
      value: `৳${safeNumber(stats.summary?.avgSpentPerCustomer).toLocaleString()}`,
      icon: <TrendingUp className='h-4 w-4 md:h-5 md:w-5' />,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      change: `${safeNumber(stats.summary?.avgOrdersPerCustomer)} avg orders/customer`,
    },
  ];

  return (
    <div className='space-y-5'>
      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4'>
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className='border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all'>
            <CardContent className='p-4 md:p-6'>
              <div className='flex items-start justify-between gap-2'>
                <div className='min-w-0'>
                  <p className='text-xs md:text-sm font-medium text-slate-500 truncate'>
                    {stat.title}
                  </p>
                  <p className='text-lg md:text-2xl font-semibold text-slate-900 mt-1 truncate'>
                    {stat.value}
                  </p>
                  <p className='text-[11px] md:text-xs text-slate-400 mt-1 truncate'>
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`p-2 md:p-3 rounded-xl shrink-0 ${stat.iconBg} ${stat.iconColor}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Customers */}
      {stats.topCustomers && stats.topCustomers.length > 0 && (
        <Card className='border-slate-200/80 shadow-sm overflow-hidden'>
          <CardHeader
            className='cursor-pointer hover:bg-slate-50 transition-colors py-4'
            onClick={() => setIsTopCustomersExpanded(!isTopCustomersExpanded)}>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2 text-base font-medium text-slate-800'>
                <Trophy className='h-4 w-4 text-amber-500' />
                Top Customers by Revenue
              </CardTitle>
              {isTopCustomersExpanded ? (
                <ChevronUp className='h-4 w-4 text-slate-400' />
              ) : (
                <ChevronDown className='h-4 w-4 text-slate-400' />
              )}
            </div>
          </CardHeader>
          {isTopCustomersExpanded && (
            <CardContent className='pt-0'>
              {/* Bulk Actions Panel */}
              {selectedTopCustomers.size > 0 && (
                <div className='mb-4 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl'>
                  <div className='flex items-center justify-between gap-2 flex-wrap'>
                    <div className='flex items-center gap-2 flex-1 min-w-0 flex-wrap'>
                      <div className='bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium shrink-0'>
                        {selectedTopCustomers.size} selected
                      </div>
                      {hasRequiredPermission("BulkCommunication", "create") && (
                        <Button
                          onClick={handleBulkCommunicateClick}
                          className='bg-slate-900 hover:bg-slate-800 text-sm'
                          size='sm'>
                          <Megaphone className='h-3.5 w-3.5 mr-1.5' />
                          {isMobile ? "Send campaign" : "Send bulk SMS/Email"}
                        </Button>
                      )}
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleClearTopCustomerSelection}
                      className='text-slate-500 hover:text-slate-900 shrink-0'>
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}

              {/* Select All Checkbox */}
              <div className='mb-3 flex items-center gap-2 px-0.5'>
                <Checkbox
                  checked={
                    !!stats.topCustomers &&
                    stats.topCustomers.length > 0 &&
                    selectedTopCustomers.size === stats.topCustomers.length
                  }
                  onCheckedChange={handleSelectAllTopCustomers}
                  aria-label='Select all top customers'
                />
                <span className='text-sm text-slate-500'>Select all</span>
              </div>

              <div className='space-y-2 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3'>
                {stats.topCustomers.map((customer, index) => {
                  const isSelected = selectedTopCustomers.has(
                    customer.customerPhone,
                  );
                  return (
                    <div
                      key={customer.customerPhone}
                      onClick={() =>
                        handleSelectTopCustomer(customer.customerPhone)
                      }
                      className={`flex items-center justify-between gap-3 p-3 md:p-4 border rounded-xl transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50/60 border-indigo-200"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}>
                      <div className='flex items-center gap-3 min-w-0'>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            handleSelectTopCustomer(customer.customerPhone)
                          }
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select ${customer.customerName}`}
                          className='shrink-0'
                        />
                        <div
                          className={`w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-full flex items-center justify-center font-semibold text-sm ${
                            index === 0
                              ? "bg-amber-100 text-amber-700"
                              : index === 1
                                ? "bg-slate-200 text-slate-600"
                                : index === 2
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-indigo-50 text-indigo-600"
                          }`}>
                          {index + 1}
                        </div>
                        <div className='min-w-0'>
                          <p className='font-medium text-slate-800 truncate'>
                            {customer.customerName}
                          </p>
                          <p className='text-xs md:text-sm text-slate-400 truncate'>
                            {customer.customerPhone}
                          </p>
                        </div>
                      </div>
                      <div className='text-right shrink-0'>
                        <p className='font-semibold text-sm md:text-lg text-slate-900'>
                          ৳{safeNumber(customer.totalSpent).toLocaleString()}
                        </p>
                        <p className='text-[11px] md:text-xs text-slate-400'>
                          {safeNumber(customer.orderCount)} orders
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

export default CustomerStats;
