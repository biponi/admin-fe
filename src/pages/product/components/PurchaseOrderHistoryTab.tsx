import { useEffect, useState } from "react";
import { useIsMobile } from "../../../hooks/use-mobile";
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
  Inbox,
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
      <div className='flex flex-col items-center justify-center h-64 gap-3'>
        <div className='w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin' />
        <p className='text-sm text-slate-500'>Loading purchase orders…</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-white rounded-lg border border-slate-100 p-4 hover:border-slate-200 transition-colors'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>
                Total Purchases
              </p>
              <p className='text-2xl font-bold text-slate-900'>
                {purchaseHistory?.summary.totalPurchaseOrders || 0}
              </p>
              <p className='text-xs text-slate-500'>purchase orders</p>
            </div>
            <div className='bg-indigo-100 p-2.5 rounded-lg'>
              <ShoppingCart className='h-5 w-5 text-indigo-600' strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg border border-slate-100 p-4 hover:border-slate-200 transition-colors'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>
                Total Cost
              </p>
              <p className='text-2xl font-bold text-slate-900'>
                ৳{purchaseHistory?.summary.totalCost?.toLocaleString() || 0}
              </p>
              <p className='text-xs text-slate-500'>total spent</p>
            </div>
            <div className='bg-emerald-100 p-2.5 rounded-lg'>
              <DollarSign className='h-5 w-5 text-emerald-600' strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg border border-slate-100 p-4 hover:border-slate-200 transition-colors'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>
                Quantity Purchased
              </p>
              <p className='text-2xl font-bold text-slate-900'>
                {purchaseHistory?.summary.totalQuantityPurchased?.toLocaleString() ||
                  0}
              </p>
              <p className='text-xs text-slate-500'>total units</p>
            </div>
            <div className='bg-purple-100 p-2.5 rounded-lg'>
              <Package className='h-5 w-5 text-purple-600' strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg border border-slate-100 p-4 hover:border-slate-200 transition-colors'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>
                Avg Cost/Unit
              </p>
              <p className='text-2xl font-bold text-slate-900'>
                ৳
                {typeof purchaseHistory?.summary.averageCostPerUnit ===
                "number"
                  ? purchaseHistory.summary.averageCostPerUnit.toFixed(2)
                  : purchaseHistory?.summary.averageCostPerUnit || 0}
              </p>
              <p className='text-xs text-slate-500'>per unit cost</p>
            </div>
            <div className='bg-orange-100 p-2.5 rounded-lg'>
              <TrendingUp className='h-5 w-5 text-orange-600' strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className='bg-white rounded-lg border border-slate-100 shadow-sm'>
        <div className='p-4'>
          <div className='flex items-center gap-2 mb-4'>
            <div className='bg-indigo-100 p-2 rounded-lg'>
              <Filter className='h-5 w-5 text-indigo-600' strokeWidth={2} />
            </div>
            <h3 className='text-base font-semibold text-slate-800'>Filters</h3>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            <div>
              <label className='text-sm font-semibold text-slate-700 mb-1 block'>
                Start Date
              </label>
              <Input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='border border-slate-200 bg-white focus-visible:ring-indigo-500'
              />
            </div>
            <div>
              <label className='text-sm font-semibold text-slate-700 mb-1 block'>
                End Date
              </label>
              <Input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='border border-slate-200 bg-white focus-visible:ring-indigo-500'
              />
            </div>
            <div>
              <label className='text-sm font-semibold text-slate-700 mb-1 block'>
                Sort By
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className='border border-slate-200 bg-white focus:ring-indigo-500'>
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
              <label className='text-sm font-semibold text-slate-700 mb-1 block'>
                Sort Order
              </label>
              <Select
                value={sortOrder}
                onValueChange={(v: "asc" | "desc") => setSortOrder(v)}>
                <SelectTrigger className='border border-slate-200 bg-white focus:ring-indigo-500'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='desc'>Descending</SelectItem>
                  <SelectItem value='asc'>Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-end space-x-2'>
              <Button
                onClick={handleFilter}
                className='flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors'>
                Apply Filters
              </Button>
              <Button
                onClick={handleReset}
                variant='outline'
                className='border border-slate-200'>
                <X className='h-4 w-4 mr-1' />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <div className='rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-slate-50 hover:bg-slate-50 border-b border-slate-100'>
                <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                  Purchase Number
                </TableHead>
                <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                  Variants
                </TableHead>
                <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 text-right'>
                  Total Quantity
                </TableHead>
                <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 text-right'>
                  Total Cost
                </TableHead>
                <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                  Purchase Date
                </TableHead>
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
                    className='cursor-pointer border-b border-slate-50 hover:bg-slate-50/60 transition-colors group'
                    onClick={() => handlePurchaseClick(purchase)}>
                    <TableCell className='py-3.5 font-medium text-slate-800'>
                      #{purchase.purchaseNumber}
                    </TableCell>
                    <TableCell className='py-3.5'>
                      <Badge
                        variant='secondary'
                        className='text-xs bg-slate-100 text-slate-700 border border-slate-200'>
                        {variantCount} variant{variantCount > 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className='py-3.5 text-right text-sm tabular-nums text-slate-600 font-medium'>
                      {totalQuantity}
                    </TableCell>
                    <TableCell className='py-3.5 text-right text-sm tabular-nums text-slate-600 font-medium'>
                      ৳{totalCost?.toLocaleString()}
                    </TableCell>
                    <TableCell className='py-3.5 text-sm text-slate-500'>
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
                    className='text-center py-16'>
                    <div className='flex flex-col items-center gap-2 text-slate-400'>
                      <Inbox className='h-8 w-8 opacity-40' />
                      <p className='text-sm font-medium'>
                        No purchase orders found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className='border-t border-slate-100 bg-slate-50/50 p-3'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-3'>
            <div className='text-xs text-slate-500 order-2 sm:order-1'>
              Showing{" "}
              <span className='font-medium text-slate-700'>
                {((purchaseHistory?.pagination.currentPage || 1) - 1) *
                  (purchaseParams.limit || 20) +
                  1}
                –
                {Math.min(
                  (purchaseHistory?.pagination.currentPage || 1) *
                    (purchaseParams.limit || 20),
                  purchaseHistory?.pagination.totalItems || 0,
                )}
              </span>{" "}
              of{" "}
              <span className='font-medium text-slate-700'>
                {purchaseHistory?.pagination.totalItems || 0}
              </span>{" "}
              purchase orders
            </div>
            <div className='flex items-center gap-2 order-1 sm:order-2'>
              <Select
                value={`${purchaseParams.limit}`}
                onValueChange={(value) =>
                  fetchPurchaseHistory({ limit: Number(value), page: 1 })
                }>
                <SelectTrigger className='w-20 h-8 text-xs border border-slate-200 bg-white'>
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
                }
                className='border border-slate-200'>
                Previous
              </Button>
              <span className='text-xs text-slate-500 font-medium px-2'>
                {purchaseHistory?.pagination.currentPage} /{" "}
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
                }
                className='border border-slate-200'>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

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
                  <h3 className='font-semibold mb-3 text-base text-slate-800'>
                    Product Details
                  </h3>
                  <div className='space-y-3'>
                    <h4 className='font-medium text-sm text-slate-700'>
                      Product Variants (
                      {selectedPurchase?.productDetails?.length || 0})
                    </h4>
                    <div className='space-y-2'>
                      {selectedPurchase?.productDetails?.map(
                        (variant: any, idx: number) => (
                          <div
                            key={idx}
                            className='bg-white rounded-lg border border-slate-100 p-4 shadow-sm'>
                            <div className='space-y-2 text-sm'>
                              <p className='font-semibold text-base text-slate-800'>
                                {variant.title}
                              </p>
                              <p className='text-xs text-slate-600 font-mono'>
                                {variant.sku}
                              </p>
                              <div className='grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100'>
                                <div>
                                  <span className='text-slate-600 font-medium'>
                                    Qty:
                                  </span>{" "}
                                  <span className='font-semibold text-slate-800'>
                                    {variant.quantity}
                                  </span>
                                </div>
                                <div>
                                  <span className='text-slate-600 font-medium'>
                                    Unit:
                                  </span>{" "}
                                  ৳
                                  <span className='font-semibold text-slate-800'>
                                    {variant.unitPrice}
                                  </span>
                                </div>
                                <div>
                                  <span className='text-slate-600 font-medium'>
                                    Cost:
                                  </span>{" "}
                                  ৳
                                  <span className='font-semibold text-slate-800'>
                                    {variant.totalCost}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className='font-semibold mb-3 text-base text-slate-800'>
                    Order Summary
                  </h3>
                  <div className='bg-emerald-50 p-4 rounded-lg border border-emerald-200'>
                    <p className='text-base'>
                      <span className='text-slate-700 font-semibold'>
                        Total Amount:
                      </span>{" "}
                      <span className='font-bold text-xl text-emerald-700'>
                        ৳{selectedPurchase?.totalAmount}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className='font-semibold mb-3 text-base text-slate-800'>
                    Dates
                  </h3>
                  <div className='space-y-2 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200'>
                    <p className='flex items-center gap-2'>
                      <span className='text-slate-600 font-medium'>
                        Purchase Date:
                      </span>{" "}
                      <span className='font-semibold text-slate-800'>
                        {selectedPurchase &&
                          format(
                            new Date(selectedPurchase.purchaseDate),
                            "MMM dd, yyyy",
                          )}
                      </span>
                    </p>
                    <p className='flex items-center gap-2'>
                      <span className='text-slate-600 font-medium'>
                        Created At:
                      </span>{" "}
                      <span className='font-semibold text-slate-800'>
                        {selectedPurchase &&
                          format(
                            new Date(selectedPurchase.createdAt),
                            "MMM dd, yyyy HH:mm",
                          )}
                      </span>
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
              <SheetDescription className='text-slate-600'>
                Full purchase order details
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className='h-[calc(100vh-200px)] mt-6'>
              <div className='space-y-6'>
                <div>
                  <h3 className='font-semibold mb-3 text-base text-slate-800'>
                    Product Details
                  </h3>
                  <div className='space-y-2'>
                    <p className='text-sm text-slate-600 font-medium'>
                      {selectedPurchase?.productDetails?.length || 0} variant(s)
                      in this order
                    </p>
                    {selectedPurchase?.productDetails?.map(
                      (variant: any, idx: number) => (
                        <div
                          key={idx}
                          className='bg-slate-50 rounded-lg border border-slate-100 p-4 shadow-sm'>
                          <div className='space-y-2 text-sm'>
                            <p className='font-semibold text-base text-slate-800'>
                              {variant.title}
                            </p>
                            <p className='text-xs text-slate-600 font-mono'>
                              {variant.sku}
                            </p>
                            <div className='grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200'>
                              <div>
                                <span className='text-slate-600 font-semibold'>
                                  Qty:
                                </span>{" "}
                                <span className='font-semibold text-slate-800'>
                                  {variant.quantity}
                                </span>
                              </div>
                              <div>
                                <span className='text-slate-600 font-semibold'>
                                  Unit:
                                </span>{" "}
                                ৳
                                <span className='font-semibold text-slate-800'>
                                  {variant.unitPrice}
                                </span>
                              </div>
                              <div>
                                <span className='text-slate-600 font-semibold'>
                                  Cost:
                                </span>{" "}
                                ৳
                                <span className='font-semibold text-slate-800'>
                                  {variant.totalCost}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div>
                  <h3 className='font-semibold mb-3 text-base text-slate-800'>
                    Order Summary
                  </h3>
                  <div className='space-y-2 text-sm bg-emerald-50 p-4 rounded-lg border border-emerald-200'>
                    <p className='text-base'>
                      <span className='text-slate-700 font-semibold'>
                        Total Amount:
                      </span>{" "}
                      <span className='font-bold text-xl text-emerald-700'>
                        ৳{selectedPurchase?.totalAmount}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className='font-semibold mb-3 text-base text-slate-800'>
                    Dates
                  </h3>
                  <div className='space-y-2 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200'>
                    <p className='flex items-center gap-2'>
                      <span className='text-slate-600 font-medium'>
                        Purchase Date:
                      </span>{" "}
                      <span className='font-semibold text-slate-800'>
                        {selectedPurchase &&
                          format(
                            new Date(selectedPurchase.purchaseDate),
                            "MMM dd, yyyy",
                          )}
                      </span>
                    </p>
                    <p className='flex items-center gap-2'>
                      <span className='text-slate-600 font-medium'>
                        Created At:
                      </span>{" "}
                      <span className='font-semibold text-slate-800'>
                        {selectedPurchase &&
                          format(
                            new Date(selectedPurchase.createdAt),
                            "MMM dd, yyyy HH:mm",
                          )}
                      </span>
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
