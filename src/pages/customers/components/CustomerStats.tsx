import { useEffect, useState } from "react";
import { Checkbox } from "../../../components/ui/checkbox";
import { Button } from "../../../components/ui/button";
import {
  Users,
  TrendingUp,
  DollarSign,
  Wallet,
  ChevronDown,
  Megaphone,
  X,
  Trophy,
} from "lucide-react";
import { useCustomerAnalytics } from "../hooks/useCustomerAnalytics";
import { CustomerStatsTopCustomer } from "../interface";
import useRoleCheck from "../../auth/hooks/useRoleCheck";
import { claude } from "../../../lib/claude";
import { useIsMobile } from "../../../hooks/use-mobile";
import { cn } from "../../../lib/utils";

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

  // Safely format numbers — the API may send numerics as strings ("1250.5")
  const safeNumber = (value: number | string | undefined, fallback: number = 0) => {
    const n = Number(value);
    return (Number.isNaN(n) ? fallback : n).toLocaleString();
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
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4'>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className='bg-white border border-[#E8E4DC] rounded-xl p-4 md:p-5 animate-pulse'>
            <div className='h-8 w-8 bg-[#EDE4D6] rounded-lg mb-3'></div>
            <div className='h-2.5 bg-[#EDE4D6] rounded w-2/3 mb-2'></div>
            <div className='h-6 bg-[#EDE4D6] rounded w-3/4'></div>
          </div>
        ))}
      </div>
    );
  }

  const topCustomers = Array.isArray(stats.topCustomers) ? stats.topCustomers : [];
  // Revenue share bars are relative to the #1 customer on the list
  const topSpent = Math.max(
    ...topCustomers.map((c) => Number(c.totalSpent) || 0),
    0,
  );

  const statCards = [
    {
      title: "Total customers",
      value: safeNumber(stats.summary?.totalCustomers),
      note: `${safeNumber(stats.summary?.totalOrders)} total orders`,
      icon: <Users className='h-4 w-4' />,
    },
    {
      title: "Total revenue",
      value: `৳${safeNumber(stats.summary?.totalRevenue)}`,
      note: "All time",
      icon: <DollarSign className='h-4 w-4' />,
    },
    {
      title: "Total paid",
      value: `৳${safeNumber(stats.summary?.totalPaid)}`,
      note: `৳${safeNumber(stats.summary?.totalPending)} pending`,
      icon: <Wallet className='h-4 w-4' />,
    },
    {
      title: "Avg. spent / customer",
      value: `৳${safeNumber(stats.summary?.avgSpentPerCustomer)}`,
      note: `${safeNumber(stats.summary?.avgOrdersPerCustomer)} avg orders / customer`,
      icon: <TrendingUp className='h-4 w-4' />,
    },
  ];

  return (
    <div className='space-y-4'>
      {/* ── Stat tiles ───────────────────────────────────────────── */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4'>
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={cn(
              claude.card,
              "p-4 md:p-5 hover:border-[#D8D3C8] transition-colors flex flex-col gap-3",
            )}>
            <div className='flex items-start justify-between gap-2'>
              <span className={claude.microLabel + " leading-snug"}>
                {stat.title}
              </span>
              <span className={claude.iconTile + " shrink-0"}>{stat.icon}</span>
            </div>
            <div className='min-w-0'>
              <p className='text-xl md:text-2xl font-semibold text-[#141413] tabular-nums truncate'>
                {stat.value}
              </p>
              <p className='text-[11px] md:text-xs text-[#8A877D] mt-0.5 truncate'>
                {stat.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Top customers by revenue ─────────────────────────────── */}
      {topCustomers.length > 0 && (
        <div className={claude.card + " overflow-hidden"}>
          <button
            onClick={() => setIsTopCustomersExpanded(!isTopCustomersExpanded)}
            className={cn(
              claude.cardHeader,
              "w-full flex items-center justify-between gap-2 px-5 py-3.5 hover:bg-[#F5F1EA] transition-colors text-left",
            )}>
            <div className='flex items-center gap-2.5 min-w-0'>
              <span className={claude.iconTile}>
                <Trophy className='h-4 w-4' />
              </span>
              <span className='min-w-0'>
                <span className='block text-sm font-semibold text-[#141413] truncate'>
                  Top customers by revenue
                </span>
                <span className='block text-xs text-[#8A877D]'>
                  {topCustomers.length} highest spenders · tap to{" "}
                  {isTopCustomersExpanded ? "collapse" : "expand"}
                </span>
              </span>
            </div>
            <div className='flex items-center gap-2 shrink-0'>
              <span className={claude.badge}>{topCustomers.length}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-[#8A877D] transition-transform",
                  isTopCustomersExpanded && "rotate-180",
                )}
              />
            </div>
          </button>

          {isTopCustomersExpanded && (
            <div className='p-4 md:p-5 pt-4'>
              {/* Bulk Actions Panel */}
              {selectedTopCustomers.size > 0 && (
                <div className='mb-4 p-3 bg-[#D97757]/[0.06] border border-[#D97757]/25 rounded-xl'>
                  <div className='flex items-center justify-between gap-2 flex-wrap'>
                    <div className='flex items-center gap-2 flex-1 min-w-0 flex-wrap'>
                      <div className='bg-[#B85A3D] text-white px-3 py-1 rounded-full text-xs font-medium shrink-0'>
                        {selectedTopCustomers.size} selected
                      </div>
                      {hasRequiredPermission("BulkCommunication", "create") && (
                        <Button
                          onClick={handleBulkCommunicateClick}
                          className='bg-[#141413] hover:bg-[#57554D] text-sm'
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
                      className='text-[#57554D] hover:text-[#141413] shrink-0'>
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}

              {/* Select All Checkbox */}
              <div className='mb-3 flex items-center gap-2 px-0.5'>
                <Checkbox
                  checked={
                    topCustomers.length > 0 &&
                    selectedTopCustomers.size === topCustomers.length
                  }
                  onCheckedChange={handleSelectAllTopCustomers}
                  aria-label='Select all top customers'
                />
                <span className='text-sm text-[#57554D]'>Select all</span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3'>
                {topCustomers.map((customer, index) => {
                  const isSelected = selectedTopCustomers.has(
                    customer.customerPhone,
                  );
                  const spent = Number(customer.totalSpent) || 0;
                  const share = topSpent > 0 ? (spent / topSpent) * 100 : 0;
                  return (
                    <div
                      key={customer.customerPhone}
                      onClick={() =>
                        handleSelectTopCustomer(customer.customerPhone)
                      }
                      className={cn(
                        "flex items-start justify-between gap-3 p-3 md:p-3.5 border rounded-xl transition-colors cursor-pointer",
                        isSelected
                          ? "bg-[#D97757]/[0.06] border-[#D97757]/30"
                          : "border-[#E8E4DC] hover:bg-[#F5F1EA]",
                      )}>
                      <div className='flex items-center gap-3 min-w-0 flex-1'>
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
                          className={cn(
                            "h-9 w-9 shrink-0 rounded-full grid place-items-center font-semibold text-sm",
                            index === 0
                              ? "bg-[#D97757] text-white"
                              : "bg-[#F5F1EA] text-[#57554D]",
                          )}>
                          {index + 1}
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='font-medium text-sm text-[#141413] truncate'>
                            {customer.customerName}
                          </p>
                          <p className='text-xs text-[#8A877D] truncate'>
                            {customer.customerPhone}
                          </p>
                          {/* Revenue share bar — relative to #1 */}
                          <div className='mt-1.5 h-1.5 rounded-full bg-[#F5F1EA] overflow-hidden'>
                            <div
                              className='h-full rounded-full bg-[#C96442]'
                              style={{ width: `${share}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className='text-right shrink-0'>
                        <p className='font-semibold text-sm md:text-base text-[#141413] tabular-nums whitespace-nowrap'>
                          ৳{safeNumber(customer.totalSpent)}
                        </p>
                        <p className='text-[11px] md:text-xs text-[#8A877D] whitespace-nowrap'>
                          {safeNumber(customer.orderCount)} orders
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerStats;
