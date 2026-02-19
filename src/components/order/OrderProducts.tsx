import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Package } from 'lucide-react';
import { IOrder } from '../../pages/order/interface';

interface OrderProductsProps {
  order: IOrder;
}

export const OrderProducts = ({ order }: OrderProductsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Package className="mr-2 h-5 w-5" />
          Products ({order.products.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variations</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Total Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div className="flex items-start space-x-3">
                    {product.thumbnail && (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500">ID: {product.productId}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {(product.variation?.size || product.variation?.color) ? (
                    <div className="text-sm">
                      {product.variation?.size && (
                        <p>Size: {product.variation.size}</p>
                      )}
                      {product.variation?.color && (
                        <p>Color: {product.variation.color}</p>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>৳{product.unitPrice.toLocaleString()}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>৳{product.totalPrice.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
