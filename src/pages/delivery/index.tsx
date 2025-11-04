import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { BarChart3, Package, Truck } from "lucide-react";
import DeliveryDashboard from "./DeliveryDashboard";
import CourierOrdersList from "./CourierOrdersList";

const DeliveryPage: React.FC = () => {
  return (
    <div className='w-full mx-auto p-2 md:p-4 space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-4'>
        <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center'>
          <Truck className='w-6 h-6 text-white' />
        </div>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
            Delivery Management
          </h1>
          <p className='text-gray-600 text-sm md:text-base'>
            Manage courier orders and track deliveries
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='dashboard' className='w-full'>
        <TabsList className='grid w-full grid-cols-2 md:w-auto'>
          <TabsTrigger value='dashboard' className='gap-2'>
            <BarChart3 className='w-4 h-4' />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value='orders' className='gap-2'>
            <Package className='w-4 h-4' />
            <span>Orders</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='dashboard' className='mt-6'>
          <DeliveryDashboard />
        </TabsContent>

        <TabsContent value='orders' className='mt-6'>
          <CourierOrdersList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryPage;
