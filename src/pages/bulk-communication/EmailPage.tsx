import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import MainView from "../../coreComponents/mainView";
import { Mail, Plus, BarChart3, RefreshCw } from "lucide-react";
import CampaignList from "./components/CampaignList";
import QueueStats from "./components/QueueStats";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { useToast } from "../../components/ui/use-toast";

const EmailPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasRequiredPermission } = useRoleCheck();
  const [activeTab, setActiveTab] = useState("campaigns");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!hasRequiredPermission("bulkcommunication", "view")) {
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You do not have permission to view bulk email campaigns",
    });
    return null;
  }

  const handleCreateCampaign = () => {
    navigate("/bulk-communication/email/create");
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <MainView title='Bulk Email Campaigns'>
      <div className='min-h-screen bg-slate-50/60'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
          {/* Page Header */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200'>
                <Mail className='h-5 w-5 text-white' />
              </div>
              <div>
                <h1 className='text-xl font-semibold text-slate-900 leading-tight'>
                  Email Campaigns
                </h1>
                <p className='text-sm text-slate-500 mt-0.5'>
                  Manage and monitor your bulk email sends
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className='inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 disabled:opacity-50 shadow-sm'>
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span className='hidden sm:inline'>Refresh</span>
              </button>

              {hasRequiredPermission("bulkcommunication", "create") && (
                <button
                  onClick={handleCreateCampaign}
                  className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-150 shadow-sm shadow-indigo-200'>
                  <Plus className='h-4 w-4' />
                  New Campaign
                </button>
              )}
            </div>
          </div>

          {/* Summary Strip */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {[
              {
                label: "Active Campaigns",
                value: "—",
                accent: "text-indigo-600",
              },
              { label: "Queued Emails", value: "—", accent: "text-amber-600" },
              { label: "Sent Today", value: "—", accent: "text-emerald-600" },
              { label: "Failed", value: "—", accent: "text-rose-600" },
            ].map((stat) => (
              <div
                key={stat.label}
                className='flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm'>
                <div className='w-2 h-2 rounded-full bg-slate-200' />
                <div className='min-w-0'>
                  <p
                    className={`text-lg font-semibold ${stat.accent} leading-none`}>
                    {stat.value}
                  </p>
                  <p className='text-xs text-slate-500 mt-0.5 truncate'>
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'>
              <div className='border-b border-slate-100'>
                <TabsList className='h-auto bg-transparent p-0 gap-0 rounded-none'>
                  <TabsTrigger
                    value='campaigns'
                    className='
                      relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent
                      text-slate-500 hover:text-slate-700
                      data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600
                      data-[state=active]:bg-transparent
                      transition-all duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                    '>
                    <Mail className='h-4 w-4' />
                    Campaigns
                  </TabsTrigger>
                  <TabsTrigger
                    value='queue'
                    className='
                      relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent
                      text-slate-500 hover:text-slate-700
                      data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600
                      data-[state=active]:bg-transparent
                      transition-all duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                    '>
                    <BarChart3 className='h-4 w-4' />
                    Queue Stats
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value='campaigns'
                className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
                <CampaignList type='email' key={`email-${refreshKey}`} />
              </TabsContent>

              <TabsContent
                value='queue'
                className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
                <QueueStats type='email' key={`email-queue-${refreshKey}`} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainView>
  );
};

export default EmailPage;
