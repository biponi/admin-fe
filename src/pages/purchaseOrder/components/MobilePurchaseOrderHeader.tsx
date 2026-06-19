import React from "react";
import { Boxes } from "lucide-react";

interface Props {
  totalOrders: number;
}

const MobilePurchaseOrderHeader: React.FC<Props> = ({ totalOrders }) => {
  return (
    <div className='bg-indigo-600 p-4 shadow-sm shadow-indigo-200 flex items-center justify-between gap-3'>
      <div>
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm'>
            <Boxes className='h-5 w-5 text-white' />
          </div>
          <div className='flex-1'>
            <h3 className='font-semibold text-white'>
              Purchase Order Management
            </h3>
            <p className='text-xs text-indigo-100'>
              Organize and manage purchase orders
            </p>
          </div>
        </div>
      </div>
      <div className='rounded-lg px-4 py-2 text-center bg-white text-indigo-900 font-semibold'>
        {totalOrders}
      </div>
    </div>
  );
};

export default MobilePurchaseOrderHeader;
