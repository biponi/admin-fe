import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import MainView from "../../coreComponents/mainView";
import { Mail, Plus, BarChart3 } from "lucide-react";
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
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <MainView title='Bulk Email Campaigns'>
      <div className='space-y-6'>
        {/* Header with Create Button */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Mail className='h-6 w-6 text-purple-600' />
            <h2 className='text-lg font-semibold'>Email Campaign Management</h2>
          </div>
          <div className='flex space-x-2'>
            <Button variant='outline' onClick={handleRefresh}>
              Refresh
            </Button>
            {hasRequiredPermission("bulkcommunication", "create") && (
              <Button onClick={handleCreateCampaign}>
                <Plus className='h-4 w-4 mr-2' />
                New Campaign
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-2 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-1 shadow-sm'>
            <TabsTrigger
              value='campaigns'
              className='data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all'>
              <Mail className='h-4 w-4 mr-2' />
              Campaigns
            </TabsTrigger>
            <TabsTrigger
              value='queue'
              className='data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all'>
              <BarChart3 className='h-4 w-4 mr-2' />
              Queue Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value='campaigns' className='mt-6'>
            <CampaignList type='email' key={`email-${refreshKey}`} />
          </TabsContent>

          <TabsContent value='queue' className='mt-6'>
            <QueueStats type='email' key={`email-queue-${refreshKey}`} />
          </TabsContent>
        </Tabs>
      </div>
    </MainView>
  );
};

export default EmailPage;
