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
import { useCommission } from "../../hooks/useCommission";
import { CommissionHeader } from "./commission-components/CommissionHeader";
import { UserCommissionTable } from "./commission-components/UserCommissionTable";
import { Loader2 } from "lucide-react";

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

  return (
    <div className='relative min-h-screen md:rounded-2xl bg-gradient-to-br from-orange-50 via-rose-50 to-cyan-50 py-4 sm:py-8 px-4 w-full'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='shadow-none bg-transparent border-0 mt-6 md:mt-0'>
          <CommissionHeader
            userName={userName}
            totalEarned={userTotals.totalPaidAmount}
            pending={userTotals.totalPendingAmount}
            unpaid={userTotals.totalUnpaidAmount}
          />
        </div>

        {/* Main Content */}
        <Tabs
          defaultValue='my-commissions'
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-4'>
          {/* Mobile: Dropdown for tabs */}
          <div className='md:hidden'>
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className='w-full h-12'>
                <SelectValue placeholder='Select tab' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='overview'>Overview</SelectItem>
                <SelectItem value='my-commissions'>My Commissions</SelectItem>
                <SelectItem value='earnings'>Earnings</SelectItem>
                <SelectItem value='history'>History</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Horizontal tabs */}
          <TabsList className='hidden md:flex h-11  w-full grid-cols-4 lg:w-auto lg:inline-grid gap-2 bg-white px-2 pt-2 pb-4 rounded-lg shadow-md'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='my-commissions'>My Commissions</TabsTrigger>
            <TabsTrigger value='earnings'>Earnings</TabsTrigger>
            <TabsTrigger value='history'>History</TabsTrigger>
          </TabsList>

          <TabsContent value='my-commissions'>
            <UserCommissionTable userId={userId || ""} />
          </TabsContent>

          <TabsContent value='overview'>
            <div className='bg-white rounded-lg p-6 shadow-md'>
              <h3 className='text-lg font-semibold mb-4'>
                Commission Overview
              </h3>
              <p className='text-muted-foreground'>
                Welcome to your commission dashboard. Here you can track all
                your earnings, view pending payments, and analyze your
                commission history.
              </p>
            </div>
          </TabsContent>

          <TabsContent value='earnings'>
            <div className='bg-white rounded-lg p-6 shadow-md'>
              <h3 className='text-lg font-semibold mb-4'>Earnings Breakdown</h3>
              <div className='space-y-4'>
                <div className='flex justify-between items-center p-4 bg-green-50 rounded-lg'>
                  <span className='font-medium'>Total Paid</span>
                  <span className='text-2xl font-bold text-green-600'>
                    ${userTotals.totalPaidAmount}
                  </span>
                </div>
                <div className='flex justify-between items-center p-4 bg-yellow-50 rounded-lg'>
                  <span className='font-medium'>Pending</span>
                  <span className='text-2xl font-bold text-yellow-600'>
                    ${userTotals.totalPendingAmount}
                  </span>
                </div>
                <div className='flex justify-between items-center p-4 bg-blue-50 rounded-lg'>
                  <span className='font-medium'>Unpaid</span>
                  <span className='text-2xl font-bold text-blue-600'>
                    ${userTotals.totalUnpaidAmount}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='history'>
            <div className='bg-white rounded-lg p-6 shadow-md'>
              <h3 className='text-lg font-semibold mb-4'>Commission History</h3>
              <p className='text-muted-foreground'>
                Your complete commission history will be displayed here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
