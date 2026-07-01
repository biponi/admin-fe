import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import MainView from "../../coreComponents/mainView";
import { useCommission } from "../../hooks/useCommission";
import { UserCommissionTable } from "./commission-components/UserCommissionTable";
import { Loader2, DollarSign, Clock, TrendingUp, BarChart3, Wallet } from "lucide-react";
import { formatCurrency } from "../../utils/inventoryReportUtils";

export const UserCommissionPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState("my-commissions");
  const [userTotals, setUserTotals] = useState({
    totalPaidAmount: 0,
    totalPendingAmount: 0,
    totalUnpaidAmount: 0,
  });
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);

  const { fetchPersonalCommissions } = useCommission();

  useEffect(() => {
    const loadUserCommissions = async () => {
      setIsLoading(true);
      const data = await fetchPersonalCommissions({ page: 1, limit: 20 });
      if (data) {
        setUserTotals({
          totalPaidAmount: data.userTotals.totalPaidAmount,
          totalPendingAmount: data.userTotals.totalPendingAmount,
          totalUnpaidAmount: data.userTotals.totalUnpaidAmount,
        });
        setUserName(data.userName);
      }
      setIsLoading(false);
    };

    loadUserCommissions();
    //eslint-disable-next-line
  }, []);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  // Prepare statistics data
  const stats = [
    {
      label: "Total Earned",
      value: formatCurrency(userTotals.totalPaidAmount),
      accentColor: "text-emerald-600",
      bgColor: "bg-emerald-400",
    },
    {
      label: "Pending",
      value: formatCurrency(userTotals.totalPendingAmount),
      accentColor: "text-amber-600",
      bgColor: "bg-amber-400",
    },
    {
      label: "Unpaid",
      value: formatCurrency(userTotals.totalUnpaidAmount),
      accentColor: "text-rose-600",
      bgColor: "bg-rose-400",
    },
    {
      label: "Total Balance",
      value: formatCurrency(userTotals.totalPaidAmount + userTotals.totalPendingAmount + userTotals.totalUnpaidAmount),
      accentColor: "text-indigo-600",
      bgColor: "bg-indigo-400",
    },
  ];

  return (
    <MainView title='User Commissions'>
      <div className='min-h-screen bg-slate-50/60'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
          {/* Page Header */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200'>
                <Wallet className='h-5 w-5 text-white' />
              </div>
              <div>
                <h1 className='text-xl font-semibold text-slate-900 leading-tight'>
                  {userName}'s Commissions
                </h1>
                <p className='text-sm text-slate-500 mt-0.5'>
                  Track earnings and commission history
                </p>
              </div>
            </div>
          </div>

          {/* Summary Statistics Strip */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className='flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm'>
                <div className={`w-2 h-2 rounded-full ${stat.bgColor} flex-shrink-0`} />
                <div className='min-w-0 flex-1'>
                  <p className={`text-lg font-semibold ${stat.accentColor} leading-none`}>
                    {stat.value}
                  </p>
                  <p className='text-xs text-slate-500 mt-0.5 truncate'>
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs Container */}
          <div className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
            <Tabs
              defaultValue='my-commissions'
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'>
              {/* Mobile: Dropdown for tabs */}
              <div className='md:hidden border-b border-slate-100'>
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className='w-full h-12 border-0 rounded-none px-4'>
                    <SelectValue placeholder='Select tab' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='overview'>
                      <div className='flex items-center gap-2'>
                        <BarChart3 className='h-4 w-4' />
                        Overview
                      </div>
                    </SelectItem>
                    <SelectItem value='my-commissions'>
                      <div className='flex items-center gap-2'>
                        <DollarSign className='h-4 w-4' />
                        My Commissions
                      </div>
                    </SelectItem>
                    <SelectItem value='earnings'>
                      <div className='flex items-center gap-2'>
                        <TrendingUp className='h-4 w-4' />
                        Earnings
                      </div>
                    </SelectItem>
                    <SelectItem value='history'>
                      <div className='flex items-center gap-2'>
                        <Clock className='h-4 w-4' />
                        History
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop: Horizontal tabs */}
              <div className='hidden md:block border-b border-slate-100'>
                <TabsList className='h-auto bg-transparent p-0 gap-0 rounded-none flex justify-start'>
                  <TabsTrigger
                    value='overview'
                    className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'>
                    <BarChart3 className='h-4 w-4' />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value='my-commissions'
                    className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'>
                    <DollarSign className='h-4 w-4' />
                    My Commissions
                  </TabsTrigger>
                  <TabsTrigger
                    value='earnings'
                    className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'>
                    <TrendingUp className='h-4 w-4' />
                    Earnings
                  </TabsTrigger>
                  <TabsTrigger
                    value='history'
                    className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'>
                    <Clock className='h-4 w-4' />
                    History
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value='my-commissions'
                className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
                <UserCommissionTable userId={userId || ""} />
              </TabsContent>

              <TabsContent
                value='overview'
                className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
                <div className='rounded-xl border border-slate-100 bg-white p-6 shadow-sm'>
                  <h3 className='text-lg font-semibold text-slate-900 mb-4'>
                    Commission Overview
                  </h3>
                  <p className='text-sm text-slate-600'>
                    Welcome to your commission dashboard. Here you can track all
                    your earnings, view pending payments, and analyze your
                    commission history.
                  </p>
                </div>
              </TabsContent>

              <TabsContent
                value='earnings'
                className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
                <div className='rounded-xl border border-slate-100 bg-white p-6 shadow-sm'>
                  <h3 className='text-lg font-semibold text-slate-900 mb-4'>
                    Earnings Breakdown
                  </h3>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg hover:border-slate-200 transition-colors'>
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100'>
                          <DollarSign className='h-5 w-5 text-emerald-600' />
                        </div>
                        <span className='font-medium text-slate-900'>Total Paid</span>
                      </div>
                      <span className='text-lg font-semibold text-slate-900'>
                        {formatCurrency(userTotals.totalPaidAmount)}
                      </span>
                    </div>
                    <div className='flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg hover:border-slate-200 transition-colors'>
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100'>
                          <Clock className='h-5 w-5 text-amber-600' />
                        </div>
                        <span className='font-medium text-slate-900'>Pending</span>
                      </div>
                      <span className='text-lg font-semibold text-slate-900'>
                        {formatCurrency(userTotals.totalPendingAmount)}
                      </span>
                    </div>
                    <div className='flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg hover:border-slate-200 transition-colors'>
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-rose-100'>
                          <TrendingUp className='h-5 w-5 text-rose-600' />
                        </div>
                        <span className='font-medium text-slate-900'>Unpaid</span>
                      </div>
                      <span className='text-lg font-semibold text-slate-900'>
                        {formatCurrency(userTotals.totalUnpaidAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value='history'
                className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
                <div className='rounded-xl border border-slate-100 bg-white p-6 shadow-sm'>
                  <h3 className='text-lg font-semibold text-slate-900 mb-4'>
                    Commission History
                  </h3>
                  <p className='text-sm text-slate-600'>
                    Your complete commission history will be displayed here.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainView>
  );
};
