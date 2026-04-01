import React from "react";
import { Boxes } from "lucide-react";

interface Props {
  totalOrders: number;
}

const MobilePurchaseOrderHeader: React.FC<Props> = ({ totalOrders }) => {
  return (
    <div className='bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-4 text-white shadow-lg'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center'>
            <Boxes className='h-6 w-6' />
          </div>
          <div>
            <p className='text-blue-100 text-sm font-medium'>Total Orders</p>
            <p className='text-2xl font-bold'>{totalOrders}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobilePurchaseOrderHeader;
