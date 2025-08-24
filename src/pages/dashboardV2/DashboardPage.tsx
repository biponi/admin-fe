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
    <div className='flex w-full flex-col gap-6'>
      <Tabs defaultValue='v1'>
        <TabsList>
          <TabsTrigger value='v1'>V1</TabsTrigger>
          <TabsTrigger value='v2'>V2</TabsTrigger>
        </TabsList>
        <TabsContent value='v1'>
          <DashboardPage />
        </TabsContent>
        <TabsContent value='v2'>
          <AdvancedDashboardPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
