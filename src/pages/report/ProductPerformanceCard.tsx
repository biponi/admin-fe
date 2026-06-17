// ============================================
// FILE: components/reports/ProductPerformanceCard.tsx
// ============================================
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Download, List, Package } from "lucide-react";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../components/ui/empty";

interface ProductPerformanceCardProps {
  data: any;
  onDownload: () => void;
}

export function EmptyMuted({ title = "" }: { title?: string }) {
  return (
    <Empty className='from-slate-50 to-white h-full bg-gradient-to-b from-30%'>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <List />
        </EmptyMedia>
        <EmptyTitle>No {title} Orders Yet</EmptyTitle>
        <EmptyDescription>
          You&apos;re all caught up. New {title} orders will appear here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

const ProductPerformanceCard: React.FC<ProductPerformanceCardProps> = ({
  data,
  onDownload,
}) => {
  const [metric, setMetric] = useState<"order" | "return">("order");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>
      {/* Header */}
      <div className='p-5 border-b border-slate-100'>
        <div className='flex items-start justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-slate-900'>
              Product Performance
            </h3>
            <p className='text-sm text-slate-500 mt-1'>
              Top performing products by sales
            </p>
          </div>
          <div className='flex gap-2'>
            <div className='inline-flex items-center bg-slate-100 p-1 rounded-lg'>
              <Button
                variant={metric === "order" ? "default" : "ghost"}
                onClick={() => setMetric("order")}
                size='sm'
                className={`rounded-md transition-all duration-200 ${
                  metric === "order"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "hover:bg-white/50 text-slate-600"
                }`}>
                Order
              </Button>
              <Button
                variant={metric === "return" ? "default" : "ghost"}
                onClick={() => setMetric("return")}
                size='sm'
                className={`rounded-md transition-all duration-200 ${
                  metric === "return"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "hover:bg-white/50 text-slate-600"
                }`}>
                Returns
              </Button>
            </div>
            {useRoleCheck().hasRequiredPermission("Report", "download") && (
              <button
                onClick={onDownload}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors'>
                <Download className='h-3.5 w-3.5' />
                Download
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='p-5'>
        {metric === "order" ? (
          <>
            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {data?.order.products?.length === 0 && <EmptyMuted title='' />}
              {data?.order.products?.map((product: any, index: number) => (
                <div
                  key={index}
                  className='flex items-center gap-4 p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors'>
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.productName}
                      className='w-16 h-16 object-cover rounded-lg'
                    />
                  ) : (
                    <div className='w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center'>
                      <Package className='h-8 w-8 text-slate-400' />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-slate-900 truncate'>
                      {product.productName}
                    </p>
                    <div className='flex items-center gap-4 mt-1 text-sm text-slate-500'>
                      <span>{product.totalUnitsSold} units sold</span>
                      <span>•</span>
                      <span>{product.orderCount} orders</span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-lg text-slate-900'>
                      {formatCurrency(product.totalRevenue)}
                    </p>
                    <p className='text-sm text-slate-500'>
                      Avg: {formatCurrency(product.averageUnitPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {data?.order.pagination &&
              data?.order.pagination.totalPages > 1 && (
                <div className='mt-4 flex items-center justify-center gap-2 text-sm text-slate-500'>
                  <p>
                    Showing page {data?.order.pagination.page} of{" "}
                    {data?.order.pagination.totalPages}
                  </p>
                </div>
              )}
          </>
        ) : (
          <>
            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {data?.return.products?.length === 0 && (
                <EmptyMuted title='Return' />
              )}
              {data?.return.products?.map((product: any, index: number) => (
                <div
                  key={index}
                  className='flex items-center gap-4 p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors'>
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.productName}
                      className='w-16 h-16 object-cover rounded-lg'
                    />
                  ) : (
                    <div className='w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center'>
                      <Package className='h-8 w-8 text-slate-400' />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-slate-900 truncate'>
                      {product.productName}
                    </p>
                    <div className='flex items-center gap-4 mt-1 text-sm text-slate-500'>
                      <span>{product.totalUnitsSold} units sold</span>
                      <span>•</span>
                      <span>{product.orderCount} orders</span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-lg text-slate-900'>
                      {formatCurrency(product.totalRevenue)}
                    </p>
                    <p className='text-sm text-slate-500'>
                      Avg: {formatCurrency(product.averageUnitPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {data?.return.pagination &&
              data?.return.pagination.totalPages > 1 && (
                <div className='mt-4 flex items-center justify-center gap-2 text-sm text-slate-500'>
                  <p>
                    Showing page {data?.return.pagination.page} of{" "}
                    {data?.return.pagination.totalPages}
                  </p>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductPerformanceCard;
