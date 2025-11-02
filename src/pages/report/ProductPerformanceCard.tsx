// ============================================
// FILE: components/reports/ProductPerformanceCard.tsx
// ============================================
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
    <Empty className='from-muted/50 to-background h-full bg-gradient-to-b from-30%'>
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
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Product Performance
          </CardTitle>
          <CardDescription>Top performing products by sales</CardDescription>
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={() => setMetric("order")}
            size='sm'
            variant={metric === "order" ? "default" : "outline"}>
            Order
          </Button>
          <Button
            onClick={() => setMetric("return")}
            size='sm'
            variant={metric === "return" ? "default" : "outline"}>
            Returns
          </Button>
          {useRoleCheck().hasRequiredPermission("Report", "download") && (
            <Button onClick={onDownload} size='sm' variant='outline'>
              <Download className='h-4 w-4 mr-2' />
              Download
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {metric === "order" ? (
          <>
            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {data?.order.products?.length === 0 && <EmptyMuted title='' />}
              {data?.order.products?.map((product: any, index: number) => (
                <div
                  key={index}
                  className='flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors'>
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.productName}
                      className='w-16 h-16 object-cover rounded'
                    />
                  ) : (
                    <div className='w-16 h-16 bg-muted rounded flex items-center justify-center'>
                      <Package className='h-8 w-8 text-muted-foreground' />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium truncate'>
                      {product.productName}
                    </p>
                    <div className='flex items-center gap-4 mt-1 text-sm text-muted-foreground'>
                      <span>{product.totalUnitsSold} units sold</span>
                      <span>•</span>
                      <span>{product.orderCount} orders</span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-lg'>
                      {formatCurrency(product.totalRevenue)}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Avg: {formatCurrency(product.averageUnitPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {data?.order.pagination &&
              data?.order.pagination.totalPages > 1 && (
                <div className='mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground'>
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
                  className='flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors'>
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.productName}
                      className='w-16 h-16 object-cover rounded'
                    />
                  ) : (
                    <div className='w-16 h-16 bg-muted rounded flex items-center justify-center'>
                      <Package className='h-8 w-8 text-muted-foreground' />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium truncate'>
                      {product.productName}
                    </p>
                    <div className='flex items-center gap-4 mt-1 text-sm text-muted-foreground'>
                      <span>{product.totalUnitsSold} units sold</span>
                      <span>•</span>
                      <span>{product.orderCount} orders</span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-lg'>
                      {formatCurrency(product.totalRevenue)}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Avg: {formatCurrency(product.averageUnitPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {data?.return.pagination &&
              data?.return.pagination.totalPages > 1 && (
                <div className='mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground'>
                  <p>
                    Showing page {data?.return.pagination.page} of{" "}
                    {data?.return.pagination.totalPages}
                  </p>
                </div>
              )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductPerformanceCard;
