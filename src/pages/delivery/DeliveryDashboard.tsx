import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { RefreshCw, Calendar, Filter } from "lucide-react";
import { useDeliveryDashboard } from "./hooks/useDeliveryDashboard";
import DeliveryStatsCards from "./components/DeliveryStatsCards";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export const DeliveryDashboard: React.FC = () => {
  const {
    dashboardData,
    balance,
    isLoading,
    error,
    startDate,
    endDate,
    selectedStatus,
    setStartDate,
    setEndDate,
    setSelectedStatus,
    clearFilters,
    refresh,
  } = useDeliveryDashboard();

  const renderFilters = () => {
    return (
      <Card className='mb-6 border-slate-200 shadow-sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='w-5 h-5' />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {/* Start Date */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-600 flex items-center gap-2'>
                <Calendar className='w-4 h-4' />
                Start Date
              </label>
              <Input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='w-full border-slate-200 focus:border-indigo-300'
              />
            </div>

            {/* End Date */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-600 flex items-center gap-2'>
                <Calendar className='w-4 h-4' />
                End Date
              </label>
              <Input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='w-full border-slate-200 focus:border-indigo-300'
              />
            </div>

            {/* Status Filter */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-600'>
                Delivery Status
              </label>
              <Select
                value={selectedStatus || 'all'}
                onValueChange={(val) => setSelectedStatus(val === 'all' ? '' : val)}>
                <SelectTrigger className='border-slate-200 focus:border-indigo-300'>
                  <SelectValue placeholder='All Statuses' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value='all'>All Statuses</SelectItem>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='in_transit'>In Transit</SelectItem>
                    <SelectItem value='delivered'>Delivered</SelectItem>
                    <SelectItem value='cancelled'>Cancelled</SelectItem>
                    <SelectItem value='hold'>On Hold</SelectItem>
                    <SelectItem value='in_review'>In Review</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-600 invisible'>
                Actions
              </label>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={clearFilters}
                  className='flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-150'>
                  Clear
                </Button>
                <Button onClick={refresh} className='flex-1 gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all duration-150'>
                  <RefreshCw className='w-4 h-4' />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLoading = () => {
    return (
      <div className='space-y-4'>
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4'>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className='border-slate-100 shadow-sm'>
              <CardContent className='p-4'>
                <Skeleton className='h-20 w-full bg-slate-100' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderError = () => {
    return (
      <Card className='border-rose-200 bg-rose-50'>
        <CardContent className='p-6 text-center'>
          <p className='text-rose-600 mb-4'>{error}</p>
          <Button onClick={refresh} variant='outline' className='gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-150'>
            <RefreshCw className='w-4 h-4' />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (isLoading && !dashboardData) {
    return (
      <div className='space-y-4'>
        {renderFilters()}
        {renderLoading()}
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className='space-y-4'>
        {renderFilters()}
        {renderError()}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Filters */}
      {renderFilters()}

      {/* Stats Cards */}
      {dashboardData && (
        <DeliveryStatsCards
          totalOrders={dashboardData.totalOrders}
          statusBreakdown={dashboardData.statusBreakdown}
          balance={balance}
        />
      )}

      {/* Status Breakdown Chart */}
      {dashboardData && dashboardData.statusBreakdown.length > 0 && (
        <Card className='border-slate-100 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-slate-900'>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {dashboardData.statusBreakdown.map((status, index) => {
                const percentage =
                  (status.count / dashboardData.totalOrders) * 100;
                return (
                  <div key={index} className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='font-medium capitalize text-slate-900'>
                        {status._id.replace(/_/g, " ")}
                      </span>
                      <span className='text-slate-600'>
                        {status.count} orders ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className='w-full bg-slate-200 rounded-full h-2.5'>
                      <div
                        className='bg-indigo-600 h-2.5 rounded-full transition-all duration-300'
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className='flex items-center justify-between text-xs text-slate-500'>
                      <span>COD: ৳{status.totalCOD.toLocaleString()}</span>
                      <span>
                        Collected: ৳{status.totalCollected.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeliveryDashboard;
