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
                  <TableHead>Product Variant</TableHead>
                  <TableHead className='text-right'>Quantity</TableHead>
                  <TableHead className='text-right'>Unit Cost</TableHead>
                  <TableHead className='text-right'>Total Cost</TableHead>
                  <TableHead>Purchase Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseHistory?.purchaseOrders?.map((purchase) => (
                  <TableRow
                    key={purchase.purchaseOrderId}
                    className='cursor-pointer hover:bg-gray-50'
                    onClick={() => handlePurchaseClick(purchase)}>
                    <TableCell className='font-medium text-blue-600 hover:underline'>
                      #{purchase.purchaseNumber}
                    </TableCell>
                    <TableCell>
                      {purchase.productDetails.variation ? (
                        <span>
                          {purchase.productDetails.variation.color && (
                            <span>
                              {purchase.productDetails.variation.color}
                            </span>
                          )}
                          {purchase.productDetails.variation.color &&
                            purchase.productDetails.variation.size && (
                              <span> - </span>
                            )}
                          {purchase.productDetails.variation.size && (
                            <span>
                              {purchase.productDetails.variation.size}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className='text-gray-400'>Standard</span>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      {purchase.productDetails.quantity}
                    </TableCell>
                    <TableCell className='text-right'>
                      ৳{purchase.productDetails.unitPrice}
                    </TableCell>
                    <TableCell className='text-right font-semibold'>
                      ৳{purchase.productDetails.totalCost}
                    </TableCell>
                    <TableCell>
                      {format(new Date(purchase.purchaseDate), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
                {(!purchaseHistory?.purchaseOrders ||
                  purchaseHistory.purchaseOrders.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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
                  <div className='space-y-1 text-sm'>
                    <p>
                      <span className='text-gray-500'>Title:</span>{" "}
                      {selectedPurchase?.productDetails.title}
                    </p>
                    <p>
                      <span className='text-gray-500'>SKU:</span>{" "}
                      {selectedPurchase?.productDetails.sku}
                    </p>
                    {selectedPurchase?.productDetails.variation && (
                      <p>
                        <span className='text-gray-500'>Variant:</span>{" "}
                        {selectedPurchase.productDetails.variation.color &&
                          selectedPurchase.productDetails.variation.color}
                        {selectedPurchase.productDetails.variation.color &&
                          selectedPurchase.productDetails.variation.size &&
                          " - "}
                        {selectedPurchase.productDetails.variation.size &&
                          selectedPurchase.productDetails.variation.size}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className='font-semibold mb-2'>Purchase Information</h3>
                  <div className='space-y-1 text-sm'>
                    <p>
                      <span className='text-gray-500'>Quantity:</span>{" "}
                      {selectedPurchase?.productDetails.quantity}
                    </p>
                    <p>
                      <span className='text-gray-500'>Unit Price:</span> ৳
                      {selectedPurchase?.productDetails.unitPrice}
                    </p>
                    <p>
                      <span className='text-gray-500'>Total Cost:</span> ৳
                      {selectedPurchase?.productDetails.totalCost}
                    </p>
                    <p>
                      <span className='text-gray-500'>Total Amount:</span> ৳
                      {selectedPurchase?.totalAmount}
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
                  <div className='space-y-2 text-sm bg-gray-50 p-4 rounded-lg'>
                    <p>
                      <span className='text-gray-500 font-medium'>Title:</span>{" "}
                      {selectedPurchase?.productDetails.title}
                    </p>
                    <p>
                      <span className='text-gray-500 font-medium'>SKU:</span>{" "}
                      {selectedPurchase?.productDetails.sku}
                    </p>
                    {selectedPurchase?.productDetails.variation && (
                      <p>
                        <span className='text-gray-500 font-medium'>
                          Variant:
                        </span>{" "}
                        {selectedPurchase.productDetails.variation.color &&
                          selectedPurchase.productDetails.variation.color}
                        {selectedPurchase.productDetails.variation.color &&
                          selectedPurchase.productDetails.variation.size &&
                          " - "}
                        {selectedPurchase.productDetails.variation.size &&
                          selectedPurchase.productDetails.variation.size}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className='font-semibold mb-3 text-lg'>
                    Purchase Information
                  </h3>
                  <div className='space-y-2 text-sm bg-gray-50 p-4 rounded-lg'>
                    <p>
                      <span className='text-gray-500 font-medium'>
                        Quantity:
                      </span>{" "}
                      {selectedPurchase?.productDetails.quantity}
                    </p>
                    <p>
                      <span className='text-gray-500 font-medium'>
                        Unit Price:
                      </span>{" "}
                      ৳{selectedPurchase?.productDetails.unitPrice}
                    </p>
                    <p>
                      <span className='text-gray-500 font-medium'>
                        Total Cost:
                      </span>{" "}
                      ৳{selectedPurchase?.productDetails.totalCost}
                    </p>
                    <p>
                      <span className='text-gray-500 font-medium'>
                        Total Amount:
                      </span>{" "}
                      <span className='font-semibold text-lg'>
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
