import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { TopProduct } from "../../../api/analytics";
import { TrendingUp, Package, Eye, ShoppingCart } from "lucide-react";

interface TopProductsTableProps {
  products: TopProduct[];
  title?: string;
  description?: string;
}

const TopProductsTable: React.FC<TopProductsTableProps> = ({
  products,
  title = "Top Products",
  description,
}) => {
  const getConversionBadge = (rate: number) => {
    if (rate >= 20)
      return { variant: "default" as const, color: "bg-green-500" };
    if (rate >= 10)
      return { variant: "secondary" as const, color: "bg-yellow-500" };
    return { variant: "destructive" as const, color: "bg-red-500" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Package className='h-5 w-5' />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[50px]'>#</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className='text-right'>
                  <div className='flex items-center justify-end gap-1'>
                    <Eye className='h-3 w-3' />
                    Views
                  </div>
                </TableHead>
                <TableHead className='text-right'>
                  <div className='flex items-center justify-end gap-1'>
                    <ShoppingCart className='h-3 w-3' />
                    Add to Cart
                  </div>
                </TableHead>
                <TableHead className='text-right'>Purchases</TableHead>
                <TableHead className='text-right'>Revenue</TableHead>
                <TableHead className='text-right'>Cart Rate</TableHead>
                <TableHead className='text-right'>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='text-center py-8'>
                    <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                      <Package className='h-8 w-8' />
                      <p>No products found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product, index) => {
                  const cartBadge = getConversionBadge(product.conversionRate);
                  const purchaseBadge = getConversionBadge(
                    (product.purchases / product.itemViews) * 100
                  );
                  return (
                    <TableRow key={product.itemId}>
                      <TableCell className='font-medium'>
                        {index === 0 && (
                          <TrendingUp className='h-4 w-4 text-yellow-500 inline mr-1' />
                        )}
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{product.itemName}</p>
                          <p className='text-xs text-muted-foreground'>
                            {product.itemId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        {product.itemViews.toLocaleString()}
                      </TableCell>
                      <TableCell className='text-right'>
                        {product.addToCarts.toLocaleString()}
                      </TableCell>
                      <TableCell className='text-right font-medium'>
                        {product.purchases.toLocaleString()}
                      </TableCell>
                      <TableCell className='text-right font-medium'>
                        ৳{product.itemRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Badge
                          variant={cartBadge.variant}
                          className={cartBadge.color + " text-white"}>
                          {product.conversionRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Badge
                          variant={purchaseBadge.variant}
                          className={purchaseBadge.color + " text-white"}>
                          {product.category}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopProductsTable;
