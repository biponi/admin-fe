import { useSelector } from "react-redux";
import { hasPagePermission } from "../../utils/helperFunction";
import AgentView from "./agentView";
import DashboardPage from "./DashboardPage";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

const DashboardV2 = () => {
  const user = useSelector((state: any) => state?.user);
  const userPermissions = user?.permissions || [];
  return hasPagePermission("Dashboard", "view", userPermissions) ? (
    <Tabs defaultValue='home' className='w-full container'>
      <TabsList className='ml-12'>
        <TabsTrigger value='home'>Home</TabsTrigger>
        <TabsTrigger value='dashboard'>Dashboard</TabsTrigger>
      </TabsList>
      <TabsContent value='home'>
        <AgentView />
      </TabsContent>
      <TabsContent value='dashboard' className='container'>
        <DashboardPage />
      </TabsContent>
    </Tabs>
  ) : (
    <AgentView />
  );
};

export default DashboardV2;
