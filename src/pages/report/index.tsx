import React, { useEffect, useState } from "react";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "../../components/ui/tabs";
// import Analytics from "../analytics";
import ReportPage from "./Report";
import { analyticsAPI, RealtimeResponse } from "../../api/analytics";

const Report: React.FC = () => {
  const [realtime, setRealtime] = useState<RealtimeResponse | null>(null);
  const fetchRealtimeData = async () => {
    try {
      const realtimeData = await analyticsAPI.getRealtime();
      setRealtime(realtimeData);
    } catch (error) {
      console.error("Failed to fetch realtime data:", error);
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRealtimeData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className='w-full mx-auto p-2 space-y-6'>
      {/* <Tabs defaultValue='sales' className='w-full'>
        <TabsList>
          <TabsTrigger value='sales'>Sales Performance</TabsTrigger>
          <TabsTrigger value='performance'>Performance Metrics</TabsTrigger>
        </TabsList>
        <TabsContent value='sales'>
          <ReportPage />
        </TabsContent>
        <TabsContent value='performance'>
          <Analytics />
        </TabsContent>
      </Tabs> */}
      <ReportPage activeUsers={realtime?.activeUsers || 0} />
    </div>
  );
};

export default Report;
