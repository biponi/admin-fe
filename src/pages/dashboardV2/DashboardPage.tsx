import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import AdvancedDashboardPage from "./AdvancedDashboardPage";
import DashboardPage from "./SimpleDashboardPage";

export default function DashboardV2() {
  return (
    <div className='flex w-full flex-col gap-4 sm:gap-6'>
      <Tabs defaultValue='v1'>
        <TabsList className='grid w-full grid-cols-2 h-9 sm:h-10'>
          <TabsTrigger value='v1' className='text-sm touch-manipulation'>Simple Dashboard</TabsTrigger>
          <TabsTrigger value='v2' className='text-sm touch-manipulation'>Advanced Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value='v1' className='space-y-0'>
          <DashboardPage />
        </TabsContent>
        <TabsContent value='v2' className='space-y-0'>
          <AdvancedDashboardPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
