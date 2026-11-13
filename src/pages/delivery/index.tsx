import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { BarChart3, Package, Truck } from "lucide-react";
import DeliveryDashboard from "./DeliveryDashboard";
import CourierOrdersList from "./CourierOrdersList";
import MainView from "@/coreComponents/mainView";
import { PageHeader } from "../../components/PageHeader";

const DeliveryPage: React.FC = () => {
  return (
    <MainView title="Delivery Management">
      <div className="min-h-screen bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 mobile:px-3 mobile:py-3 mobile:pb-[calc(5rem+env(safe-area-inset-bottom))]">
          {/* Header */}
          <PageHeader
            icon={<Truck className="h-5 w-5 text-white" />}
            title="Delivery"
            subtitle="Manage courier orders and track deliveries"
          />

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <Tabs defaultValue="dashboard" className="w-full">
              <div className="border-b border-slate-100">
                <TabsList className="h-auto bg-transparent p-0 gap-0 rounded-none flex justify-start mobile:w-full mobile:overflow-x-auto">
                  <TabsTrigger
                    value="dashboard"
                    className="relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger
                    value="orders"
                    className="relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    <Package className="h-4 w-4" />
                    Orders
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="dashboard" className="p-4 sm:p-6 mt-0 focus-visible:outline-none mobile:p-3">
                <DeliveryDashboard />
              </TabsContent>

              <TabsContent value="orders" className="p-4 sm:p-6 mt-0 focus-visible:outline-none mobile:p-3">
                <CourierOrdersList />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainView>
  );
};

export default DeliveryPage;
