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
  ChevronDown,
  ChevronUp,
  Megaphone,
  X,
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
  const [selectedTopCustomers, setSelectedTopCustomers] = useState<Set<string>>(new Set());
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
      setSelectedTopCustomers(new Set(stats.topCustomers.map((c) => c.customerPhone)));
    }
  };

  const handleClearTopCustomerSelection = () => {
    setSelectedTopCustomers(new Set());
  };

  const getSelectedTopCustomersData = () => {
    return stats?.topCustomers?.filter((c) => selectedTopCustomers.has(c.customerPhone)) || [];
  };

  const handleBulkCommunicateClick = () => {
    const selectedData = getSelectedTopCustomersData();
    if (onBulkCommunicate && selectedData.length > 0) {
      onBulkCommunicate(selectedData);
    }
  };

  if (loading || !stats) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className='p-6'>
              <div className='animate-pulse'>
                <div className='h-4 bg-gray-200 rounded w-1/2 mb-2'></div>
                <div className='h-8 bg-gray-200 rounded w-3/4'></div>
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
      icon: <Users className='h-5 w-5 text-blue-600' />,
      color: "bg-blue-50",
      change: `${safeNumber(stats.summary?.totalOrders).toLocaleString()} total orders`,
    },
    {
      title: "Total Revenue",
      value: `৳${safeNumber(stats.summary?.totalRevenue).toLocaleString()}`,
      icon: <DollarSign className='h-5 w-5 text-purple-600' />,
      color: "bg-purple-50",
      change: "All time",
    },
    {
      title: "Total Paid",
      value: `৳${safeNumber(stats.summary?.totalPaid).toLocaleString()}`,
      icon: <DollarSign className='h-5 w-5 text-green-600' />,
      color: "bg-green-50",
      change: `৳${safeNumber(stats.summary?.totalPending).toLocaleString()} pending`,
    },
    {
      title: "Avg. Spent/Customer",
      value: `৳${safeNumber(stats.summary?.avgSpentPerCustomer).toLocaleString()}`,
      icon: <TrendingUp className='h-5 w-5 text-orange-600' />,
      color: "bg-orange-50",
      change: `${safeNumber(stats.summary?.avgOrdersPerCustomer)} avg orders/customer`,
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {statCards.map((stat, index) => (
          <Card key={index} className='hover:shadow-lg transition-shadow'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    {stat.title}
                  </p>
                  <p className='text-2xl font-bold mt-1'>{stat.value}</p>
                  <p className='text-xs text-gray-500 mt-1'>{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Customers */}
      {stats.topCustomers && stats.topCustomers.length > 0 && (
        <Card>
          <CardHeader
            className='cursor-pointer hover:bg-gray-50 transition-colors'
            onClick={() => setIsTopCustomersExpanded(!isTopCustomersExpanded)}>
            <div className='flex items-center justify-between'>
              <CardTitle>Top Customers by Revenue</CardTitle>
              {isTopCustomersExpanded ? (
                <ChevronUp className='h-5 w-5 text-gray-500' />
              ) : (
                <ChevronDown className='h-5 w-5 text-gray-500' />
              )}
            </div>
          </CardHeader>
          {isTopCustomersExpanded && (
            <CardContent>
              {/* Bulk Actions Panel */}
              {selectedTopCustomers.size > 0 && (
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg">
                        <span className="font-semibold text-sm">{selectedTopCustomers.size}</span>
                        <span className="ml-1 text-sm">
                          Customer{selectedTopCustomers.size !== 1 ? 's' : ''} Selected
                        </span>
                      </div>
                      {hasRequiredPermission('BulkCommunication', 'create') && (
                        <Button
                          onClick={handleBulkCommunicateClick}
                          className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-sm"
                          size="sm"
                        >
                          <Megaphone className="h-4 w-4 mr-1" />
                          {isMobile ? 'Send Campaign' : 'Send Bulk SMS/Email'}
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearTopCustomerSelection}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Select All Checkbox */}
              <div className="mb-3 flex items-center space-x-2">
                <Checkbox
                  checked={
                    stats.topCustomers && stats.topCustomers.length > 0 && selectedTopCustomers.size === stats.topCustomers.length
                      ? true
                      : false
                  }
                  onCheckedChange={handleSelectAllTopCustomers}
                  aria-label="Select all top customers"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>

              <div className='space-y-3'>
                {stats.topCustomers.map((customer, index) => (
                  <div
                    key={customer.customerPhone}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                      selectedTopCustomers.has(customer.customerPhone) ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                    }`}>
                    <div className='flex items-center space-x-4'>
                      <Checkbox
                        checked={selectedTopCustomers.has(customer.customerPhone)}
                        onCheckedChange={() => handleSelectTopCustomer(customer.customerPhone)}
                        aria-label={`Select ${customer.customerName}`}
                      />
                      <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600'>
                        {index + 1}
                      </div>
                      <div>
                        <p className='font-medium'>{customer.customerName}</p>
                        <p className='text-sm text-gray-500'>
                          {customer.customerPhone}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold text-lg'>
                        ৳{safeNumber(customer.totalSpent).toLocaleString()}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {safeNumber(customer.orderCount)} orders
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

export default CustomerStats;
