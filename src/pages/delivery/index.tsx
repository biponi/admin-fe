import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { BarChart3, Package, Truck } from "lucide-react";
import DeliveryDashboard from "./DeliveryDashboard";
import CourierOrdersList from "./CourierOrdersList";
import MainView from "@/coreComponents/mainView";

const DeliveryPage: React.FC = () => {
  return (
    <MainView title="Delivery Management">
      <div className="min-h-screen bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 leading-tight">
                  Delivery Management
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Manage courier orders and track deliveries
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <Tabs defaultValue="dashboard" className="w-full">
              <div className="border-b border-slate-100">
                <TabsList className="h-auto bg-transparent p-0 gap-0 rounded-none flex justify-start">
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

              <TabsContent value="dashboard" className="p-4 sm:p-6 mt-0 focus-visible:outline-none">
                <DeliveryDashboard />
              </TabsContent>

              <TabsContent value="orders" className="p-4 sm:p-6 mt-0 focus-visible:outline-none">
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
