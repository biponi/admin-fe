import { useEffect, useState } from "react";
import { useIsMobile } from "../../../hooks/use-mobile";
import {
  Card,
  CardContent,
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
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../../components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../../../components/ui/drawer";
import { Badge } from "../../../components/ui/badge";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  Filter,
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  X,
} from "lucide-react";
import { useProductAnalytics } from "../hooks/useProductAnalytics";
import { format } from "date-fns";

interface PurchaseOrderHistoryTabProps {
  productId: string;
}

const PurchaseOrderHistoryTab = ({
  productId,
}: PurchaseOrderHistoryTabProps) => {
  const isMobile = useIsMobile();
  const { purchaseHistory, loading, fetchPurchaseHistory, purchaseParams } =
    useProductAnalytics(productId);

  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchPurchaseHistory();
    //eslint-disable-next-line
  }, []);

  const handleFilter = () => {
    fetchPurchaseHistory({
      page: 1,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy,
      sortOrder,
    });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSortBy("createdAt");
    setSortOrder("desc");
    fetchPurchaseHistory({ page: 1, limit: 20 });
  };

  const handlePurchaseClick = (purchase: any) => {
    setSelectedPurchase(purchase);
    setShowDetails(true);
  };

  if (loading && !purchaseHistory) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4'></div>
          <p className='text-sm text-gray-500'>Loading purchase history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>Total Purchases</p>
                <p className='text-2xl font-bold'>
                  {purchaseHistory?.summary.totalPurchaseOrders || 0}
                </p>
              </div>
              <ShoppingCart className='h-8 w-8 text-blue-500' />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>Total Cost</p>
                <p className='text-2xl font-bold'>
                  ৳{purchaseHistory?.summary.totalCost || 0}
                </p>
              </div>
              <DollarSign className='h-8 w-8 text-green-500' />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>Quantity Purchased</p>
                <p className='text-2xl font-bold'>
                  {purchaseHistory?.summary.totalQuantityPurchased || 0}
                </p>
              </div>
              <Package className='h-8 w-8 text-purple-500' />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>Avg Cost/Unit</p>
                <p className='text-2xl font-bold'>
                  ৳
                  {typeof purchaseHistory?.summary.averageCostPerUnit ===
                  "number"
                    ? purchaseHistory.summary.averageCostPerUnit.toFixed(2)
                    : purchaseHistory?.summary.averageCostPerUnit || 0}
                </p>
              </div>
              <TrendingUp className='h-8 w-8 text-orange-500' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center text-lg'>
            <Filter className='mr-2 h-5 w-5' />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            <div>
              <label className='text-sm font-medium'>Start Date</label>
              <Input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className='text-sm font-medium'>End Date</label>
              <Input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className='text-sm font-medium'>Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='createdAt'>Date</SelectItem>
                  <SelectItem value='purchaseNumber'>
                    Purchase Number
                  </SelectItem>
                  <SelectItem value='quantity'>Quantity</SelectItem>
                  <SelectItem value='unitPrice'>Unit Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-sm font-medium'>Sort Order</label>
              <Select
                value={sortOrder}
                onValueChange={(v: "asc" | "desc") => setSortOrder(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='desc'>Descending</SelectItem>
                  <SelectItem value='asc'>Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-end space-x-2'>
              <Button onClick={handleFilter} className='flex-1'>
                Apply Filters
              </Button>
              <Button onClick={handleReset} variant='outline'>
                <X className='h-4 w-4 mr-1' />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DataTable with Sticky Header */}
      <Card>
        <CardContent className='p-0'>
          <div className='max-h-[600px] overflow-y-auto'>
            <Table divClass='relative'>
              <TableHeader className='sticky top-0 bg-white border-b z-10'>
                <TableRow className='bg-sidebar'>
                  <TableHead>Purchase Number</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead className='text-right'>Total Quantity</TableHead>
                  <TableHead className='text-right'>Total Cost</TableHead>
                  <TableHead>Purchase Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseHistory?.purchaseOrders?.map((purchase) => {
                  const totalQuantity = purchase.productDetails.reduce(
                    (sum: number, v: any) => sum + v.quantity,
                    0,
                  );
                  const totalCost = purchase.productDetails.reduce(
                    (sum: number, v: any) => sum + v.totalCost,
                    0,
                  );
                  const variantCount = purchase.productDetails.length;

                  return (
                    <TableRow
                      key={purchase.purchaseOrderId}
                      className='cursor-pointer hover:bg-gray-50'
                      onClick={() => handlePurchaseClick(purchase)}>
                      <TableCell className='font-medium text-blue-600 hover:underline'>
                        #{purchase.purchaseNumber}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary' className='text-xs'>
                          {variantCount} variant{variantCount > 1 ? "s" : ""}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right font-semibold'>
                        {totalQuantity}
                      </TableCell>
                      <TableCell className='text-right font-bold text-green-600'>
                        ৳{totalCost}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(purchase.purchaseDate),
                          "MMM dd, yyyy hh:mm a",
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!purchaseHistory?.purchaseOrders ||
                  purchaseHistory.purchaseOrders.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='text-center py-8 text-gray-500'>
                      No purchase orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className='border-t p-4'>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-600'>
                Showing{" "}
                {((purchaseHistory?.pagination.currentPage || 1) - 1) *
                  (purchaseParams.limit || 20) +
                  1}
                -
                {Math.min(
                  (purchaseHistory?.pagination.currentPage || 1) *
                    (purchaseParams.limit || 20),
                  purchaseHistory?.pagination.totalItems || 0,
                )}{" "}
                of {purchaseHistory?.pagination.totalItems || 0} purchase orders
              </div>
              <div className='flex items-center space-x-2'>
                <Select
                  value={`${purchaseParams.limit}`}
                  onValueChange={(value) =>
                    fetchPurchaseHistory({ limit: Number(value), page: 1 })
                  }>
                  <SelectTrigger className='w-20'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='20'>20</SelectItem>
                    <SelectItem value='50'>50</SelectItem>
                    <SelectItem value='100'>100</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={!purchaseHistory?.pagination.hasPreviousPage}
                  onClick={() =>
                    fetchPurchaseHistory({
                      page: (purchaseParams.page || 1) - 1,
                    })
                  }>
                  Previous
                </Button>
                <span className='text-sm'>
                  Page {purchaseHistory?.pagination.currentPage} of{" "}
                  {purchaseHistory?.pagination.totalPages}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={!purchaseHistory?.pagination.hasNextPage}
                  onClick={() =>
                    fetchPurchaseHistory({
                      page: (purchaseParams.page || 1) + 1,
                    })
                  }>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Details Sheet (Desktop) / Drawer (Mobile) */}
      {isMobile ? (
        <Drawer open={showDetails} onOpenChange={setShowDetails}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                Purchase #{selectedPurchase?.purchaseNumber}
              </DrawerTitle>
            </DrawerHeader>
            <ScrollArea className='h-[60vh] px-4'>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-semibold mb-2'>Product Details</h3>
                  <div className='space-y-3'>
                    <h4 className='font-medium text-sm text-gray-700'>
                      Product Variants (
                      {selectedPurchase?.productDetails?.length || 0})
                    </h4>
                    <div className='space-y-2'>
                      {selectedPurchase?.productDetails?.map(
                        (variant: any, idx: number) => (
                          <Card key={idx} className='p-3 bg-gray-50'>
                            <div className='space-y-1 text-sm'>
                              <p>
                                <span className='text-gray-500'>Title:</span>{" "}
                                <span className='font-medium'>
                                  {variant.title}
                                </span>
                              </p>
                              <p>
                                <span className='text-gray-500'>SKU:</span>{" "}
                                <span className='font-mono text-xs'>
                                  {variant.sku}
                                </span>
                              </p>
                              <div className='grid grid-cols-3 gap-2 mt-2'>
                                <div>
                                  <span className='text-gray-500'>Qty:</span>{" "}
                                  <span className='font-semibold'>
                                    {variant.quantity}
                                  </span>
                                </div>
                                <div>
                                  <span className='text-gray-500'>Unit:</span> ৳
                                  <span className='font-medium'>
                                    {variant.unitPrice}
                                  </span>
                                </div>
                                <div>
                                  <span className='text-gray-500'>Cost:</span> ৳
                                  <span className='font-semibold text-green-600'>
                                    {variant.totalCost}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ),
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className='font-semibold mb-2'>Order Summary</h3>
                  <div className='space-y-1 text-sm'>
                    <p className='text-lg'>
                      <span className='text-gray-500'>Total Amount:</span>{" "}
                      <span className='font-bold text-green-600'>
                        ৳{selectedPurchase?.totalAmount}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className='font-semibold mb-2'>Dates</h3>
                  <div className='space-y-1 text-sm'>
                    <p>
                      <span className='text-gray-500'>Purchase Date:</span>{" "}
                      {selectedPurchase &&
                        format(
                          new Date(selectedPurchase.purchaseDate),
                          "MMM dd, yyyy",
                        )}
                    </p>
                    <p>
                      <span className='text-gray-500'>Created At:</span>{" "}
                      {selectedPurchase &&
                        format(
                          new Date(selectedPurchase.createdAt),
                          "MMM dd, yyyy HH:mm",
                        )}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={showDetails} onOpenChange={setShowDetails}>
          <SheetContent className='w-full sm:max-w-2xl'>
            <SheetHeader>
              <SheetTitle>
                Purchase #{selectedPurchase?.purchaseNumber}
              </SheetTitle>
              <SheetDescription>Full purchase order details</SheetDescription>
            </SheetHeader>
            <ScrollArea className='h-[calc(100vh-200px)] mt-6'>
              <div className='space-y-6'>
                <div>
                  <h3 className='font-semibold mb-3 text-lg'>
                    Product Details
                  </h3>
                  <div className='space-y-2'>
                    <p className='text-sm text-gray-600'>
                      {selectedPurchase?.productDetails?.length || 0} variant(s)
                      in this order
                    </p>
                    {selectedPurchase?.productDetails?.map(
                      (variant: any, idx: number) => (
                        <Card
                          key={idx}
                          className='p-3 bg-blue-50 border-blue-100'>
                          <div className='space-y-1 text-sm'>
                            <p className='font-medium text-base'>
                              {variant.title}
                            </p>
                            <p className='text-xs text-gray-600 font-mono'>
                              {variant.sku}
                            </p>
                            <div className='grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-blue-200'>
                              <div>
                                <span className='text-gray-600'>Qty:</span>{" "}
                                <span className='font-semibold'>
                                  {variant.quantity}
                                </span>
                              </div>
                              <div>
                                <span className='text-gray-600'>Unit:</span> ৳
                                <span className='font-medium'>
                                  {variant.unitPrice}
                                </span>
                              </div>
                              <div>
                                <span className='text-gray-600'>Cost:</span> ৳
                                <span className='font-semibold text-green-600'>
                                  {variant.totalCost}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ),
                    )}
                  </div>
                </div>
                <div>
                  <h3 className='font-semibold mb-3 text-lg'>Order Summary</h3>
                  <div className='space-y-2 text-sm bg-green-50 p-4 rounded-lg border border-green-200'>
                    <p className='text-base'>
                      <span className='text-gray-600 font-medium'>
                        Total Amount:
                      </span>{" "}
                      <span className='font-bold text-lg text-green-700'>
                        ৳{selectedPurchase?.totalAmount}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className='font-semibold mb-3 text-lg'>Dates</h3>
                  <div className='space-y-2 text-sm bg-gray-50 p-4 rounded-lg'>
                    <p>
                      <span className='text-gray-500 font-medium'>
                        Purchase Date:
                      </span>{" "}
                      {selectedPurchase &&
                        format(
                          new Date(selectedPurchase.purchaseDate),
                          "MMM dd, yyyy",
                        )}
                    </p>
                    <p>
                      <span className='text-gray-500 font-medium'>
                        Created At:
                      </span>{" "}
                      {selectedPurchase &&
                        format(
                          new Date(selectedPurchase.createdAt),
                          "MMM dd, yyyy HH:mm",
                        )}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default PurchaseOrderHistoryTab;
