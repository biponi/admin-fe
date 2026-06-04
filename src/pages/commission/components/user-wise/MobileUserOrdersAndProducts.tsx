import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { getStatusBgColor, getStatusTextColor } from "../../../../utils/commissionColors";
import { formatDate, formatCurrency } from "../../../../utils/inventoryReportUtils";
import { Package } from "lucide-react";

interface ProductCommission {
  productName: string;
  quantity: number;
  commissionAmount: number;
  commissionStatus: string;
}

interface OrderGroup {
  orderNumber: number;
  orderDate: string;
  products: ProductCommission[];
}

interface MobileUserOrdersAndProductsProps {
  ordersAndProducts: OrderGroup[];
  className?: string;
}

export const MobileUserOrdersAndProducts: React.FC<MobileUserOrdersAndProductsProps> = ({
  ordersAndProducts,
  className = ''
}) => {
  if (ordersAndProducts.length === 0) {
    return (
      <div className={`md:hidden ${className}`}>
        <Card>
          <CardContent className='p-8 text-center'>
            <Package className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No Orders Found</h3>
            <p className='text-sm text-muted-foreground'>
              This user doesn't have any commission records yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`md:hidden space-y-4 ${className}`}>
      {ordersAndProducts.map((orderGroup, index) => (
        <Card key={index} className='overflow-hidden'>
          <CardHeader className='pb-3 bg-muted/30'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-semibold'>
                Order #{orderGroup.orderNumber}
              </CardTitle>
              <div className='text-xs text-muted-foreground'>
                {formatDate(orderGroup.orderDate)}
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            {orderGroup.products.map((product, pIndex) => {
              const bgColor = getStatusBgColor(product.commissionStatus);
              const textColor = getStatusTextColor(product.commissionStatus);
              const isLast = pIndex === orderGroup.products.length - 1;

              return (
                <div
                  key={pIndex}
                  className={`p-4 ${!isLast ? 'border-b' : ''}`}
                >
                  {/* Product Name */}
                  <div className='font-medium text-sm mb-3'>
                    {product.productName}
                  </div>

                  {/* Details Grid */}
                  <div className='grid grid-cols-3 gap-3 mb-3'>
                    {/* Quantity */}
                    <div>
                      <div className='text-xs text-muted-foreground mb-1'>Quantity</div>
                      <div className='font-semibold text-sm'>{product.quantity}</div>
                    </div>

                    {/* Amount */}
                    <div>
                      <div className='text-xs text-muted-foreground mb-1'>Amount</div>
                      <div className='font-semibold text-sm text-primary'>
                        {formatCurrency(product.commissionAmount)}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <div className='text-xs text-muted-foreground mb-1'>Status</div>
                      <Badge className={`text-xs font-medium ${bgColor} ${textColor} border-0`}>
                        {product.commissionStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
