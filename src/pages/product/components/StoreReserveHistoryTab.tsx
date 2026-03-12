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
  History,
  Store,
  Package,
  TrendingUp,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Hash,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useStoreReserveHistory } from "../hooks/useStoreReserveHistory";
import { format } from "date-fns";
import { StoreReserveHistoryItem } from "../interface.store-history";

interface StoreReserveHistoryTabProps {
  productId: string;
}

const StoreReserveHistoryTab = ({ productId }: StoreReserveHistoryTabProps) => {
  const isMobile = useIsMobile();
  const {
    historyData,
    recordData,
    loading,
    recordLoading,
    fetchHistory,
    fetchRecordDetails,
    historyParams,
    changePage,
    changePageSize,
    resetFilters,
  } = useStoreReserveHistory(productId);

  const [selectedRecord, setSelectedRecord] =
    useState<StoreReserveHistoryItem | null>(null);
  const [selectedRecordProducts, setSelectedRecordProducts] = useState<
    StoreReserveHistoryItem[] | null
  >(null);
  const [showDetails, setShowDetails] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "quantity" | "unitPrice" | "storeName" | "createdBy"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFilter = () => {
    fetchHistory({
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
    resetFilters();
  };

  const handleRecordClick = async (products: StoreReserveHistoryItem[]) => {
    setSelectedRecord(products[0]);
    setSelectedRecordProducts(products);
    setShowDetails(true);
    // Fetch detailed record information
    await fetchRecordDetails(products[0].recordId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy hh:mm a");
    } catch {
      return dateString;
    }
  };

  const calculateAverageQuantity = () => {
    if (!historyData?.history || historyData.history.length === 0) return 0;
    const total = historyData.history.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    return Math.round(total / historyData.history.length);
  };

  if (loading && !historyData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4'></div>
          <p className='text-sm text-gray-500'>
            Loading store reserve history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card className='group relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-2 rounded-2xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1'>
          <CardContent className='pt-2'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Total Records</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {historyData?.summary.totalRecords || 0}
                </p>
              </div>
              <History className='h-8 w-8 text-blue-500' />
            </div>
          </CardContent>
        </Card>

        <Card className='group relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-2 rounded-2xl border border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1'>
          <CardContent className='pt-2'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Total Quantity Reserved</p>
                <p className='text-2xl font-bold text-green-600'>
                  {historyData?.summary.totalQuantityReserved || 0}
                </p>
              </div>
              <Package className='h-8 w-8 text-green-500' />
            </div>
          </CardContent>
        </Card>

        <Card className='group relative overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 p-2 rounded-2xl border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1'>
          <CardContent className='pt-2'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Unique Stores</p>
                <p className='text-2xl font-bold text-purple-600'>
                  {historyData?.summary.uniqueStores || 0}
                </p>
              </div>
              <Store className='h-8 w-8 text-purple-500' />
            </div>
          </CardContent>
        </Card>

        <Card className='group relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-2 rounded-2xl border border-orange-100 hover:border-orange-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1'>
          <CardContent className='pt-2'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Avg. Quantity/Record</p>
                <p className='text-2xl font-bold text-orange-600'>
                  {calculateAverageQuantity()}
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
              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='createdAt'>Date</SelectItem>
                  <SelectItem value='quantity'>Quantity</SelectItem>
                  <SelectItem value='unitPrice'>Unit Price</SelectItem>
                  <SelectItem value='storeName'>Store Name</SelectItem>
                  <SelectItem value='createdBy'>Created By</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-sm font-medium'>Sort Order</label>
              <Select
                value={sortOrder}
                onValueChange={(value: any) => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue placeholder='Order' />
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

      {/* Data Table */}
      <Card>
        <CardContent className='p-0'>
          {!isMobile ? (
            <div className='max-h-[600px] overflow-y-auto'>
              <Table divClass='relative'>
                <TableHeader className='sticky top-0 bg-white border-b z-10'>
                  <TableRow className='bg-sidebar'>
                    <TableHead>Date</TableHead>
                    <TableHead>Store Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className='text-right'>Total Quantity</TableHead>
                    <TableHead className='text-right'>Total Value</TableHead>
                    <TableHead>Reserved By</TableHead>
                    <TableHead>Record ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData?.history && historyData.history.length > 0 ? (
                    // Group records by recordId
                    Object.values(
                      historyData.history.reduce((acc: any, record) => {
                        if (!acc[record.recordId]) {
                          acc[record.recordId] = {
                            recordId: record.recordId,
                            createdAt: record.createdAt,
                            storeName: record.storeName,
                            storeLocation: record.storeLocation,
                            createdBy: record.createdBy,
                            products: [] as any[],
                          };
                        }
                        acc[record.recordId].products.push(record);
                        return acc;
                      }, {}),
                    ).map((groupedRecord: any) => {
                      const totalQuantity = groupedRecord.products.reduce(
                        (sum: number, r: any) => sum + r.quantity,
                        0,
                      );
                      const totalValue = groupedRecord.products.reduce(
                        (sum: number, r: any) => sum + r.quantity * r.unitPrice,
                        0,
                      );
                      const productCount = groupedRecord.products.length;

                      return (
                        <TableRow
                          key={groupedRecord.recordId}
                          className='cursor-pointer hover:bg-gray-50'
                          onClick={() =>
                            handleRecordClick(groupedRecord.products)
                          }>
                          <TableCell>
                            <div className='flex items-center'>
                              <Calendar className='h-4 w-4 mr-2 text-gray-400' />
                              <span className='text-sm'>
                                {formatDate(groupedRecord.createdAt)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center'>
                              <Store className='h-4 w-4 mr-2 text-blue-500' />
                              <span className='font-medium'>
                                {groupedRecord.storeName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center'>
                              <MapPin className='h-4 w-4 mr-2 text-gray-400' />
                              <span className='text-sm'>
                                {groupedRecord.storeLocation}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant='secondary'
                              className='text-xs bg-purple-50 text-purple-700 border-purple-200'>
                              {productCount} variant
                              {productCount > 1 ? "s" : ""}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-right'>
                            <Badge
                              variant='secondary'
                              className='font-semibold'>
                              {totalQuantity}
                            </Badge>
                          </TableCell>

                          <TableCell className='text-right font-bold text-green-600'>
                            {formatCurrency(totalValue)}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center'>
                              <User className='h-4 w-4 mr-2 text-gray-400' />
                              <span className='text-sm'>
                                {groupedRecord.createdBy}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center'>
                              <Hash className='h-4 w-4 mr-2 text-gray-400' />
                              <span className='text-xs text-gray-500 font-mono'>
                                {groupedRecord.recordId.slice(0, 8)}...
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className='text-center py-8'>
                        <div className='text-center text-gray-500'>
                          <Package className='h-12 w-12 mx-auto mb-2 text-gray-300' />
                          <p>No store reserve history found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            // Mobile Card View
            <div className='p-4 space-y-4'>
              {historyData?.history && historyData.history.length > 0 ? (
                // Group records by recordId for mobile view
                Object.values(
                  historyData.history.reduce((acc: any, record) => {
                    if (!acc[record.recordId]) {
                      acc[record.recordId] = {
                        recordId: record.recordId,
                        createdAt: record.createdAt,
                        storeName: record.storeName,
                        storeLocation: record.storeLocation,
                        createdBy: record.createdBy,
                        products: [] as any[],
                      };
                    }
                    acc[record.recordId].products.push(record);
                    return acc;
                  }, {}),
                ).map((groupedRecord: any) => {
                  const totalQuantity = groupedRecord.products.reduce(
                    (sum: number, r: any) => sum + r.quantity,
                    0,
                  );
                  const totalValue = groupedRecord.products.reduce(
                    (sum: number, r: any) => sum + r.quantity * r.unitPrice,
                    0,
                  );
                  const productCount = groupedRecord.products.length;

                  return (
                    <Card
                      key={groupedRecord.recordId}
                      className='cursor-pointer hover:shadow-md transition-shadow'
                      onClick={() => handleRecordClick(groupedRecord.products)}>
                      <CardContent className='p-4'>
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center'>
                              <Store className='h-4 w-4 mr-2 text-blue-500' />
                              <span className='font-semibold'>
                                {groupedRecord.storeName}
                              </span>
                            </div>
                            <Badge variant='secondary'>{totalQuantity}</Badge>
                          </div>
                          <div className='text-sm'>
                            <span className='text-gray-600'>Products: </span>
                            <Badge variant='outline' className='text-xs'>
                              {productCount} product
                              {productCount > 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <div className='flex items-center text-sm text-gray-600'>
                            <MapPin className='h-4 w-4 mr-2' />
                            {groupedRecord.storeLocation}
                          </div>
                          <div className='flex items-center text-sm text-gray-600'>
                            <Calendar className='h-4 w-4 mr-2' />
                            {formatDate(groupedRecord.createdAt)}
                          </div>
                          <div className='flex items-center justify-between text-sm'>
                            <span className='font-bold text-green-600'>
                              {formatCurrency(totalValue)}
                            </span>
                            <span className='text-gray-500'>
                              by {groupedRecord.createdBy}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className='text-center text-gray-500 py-8'>
                  <Package className='h-12 w-12 mx-auto mb-2 text-gray-300' />
                  <p>No store reserve history found</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {historyData?.pagination && historyData.pagination.totalPages > 0 && (
            <div className='border-t p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm text-gray-600'>Items per page:</span>
                  <Select
                    value={historyParams.limit?.toString() || "20"}
                    onValueChange={(value) => changePageSize(parseInt(value))}>
                    <SelectTrigger className='w-16'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='10'>10</SelectItem>
                      <SelectItem value='20'>20</SelectItem>
                      <SelectItem value='50'>50</SelectItem>
                      <SelectItem value='100'>100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-center space-x-2'>
                  <span className='text-sm text-gray-600'>
                    Page {historyData.pagination.currentPage} of{" "}
                    {historyData.pagination.totalPages}
                  </span>
                  <div className='flex space-x-1'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        changePage(historyData.pagination.currentPage - 1)
                      }
                      disabled={!historyData.pagination.hasPreviousPage}>
                      <ChevronLeft className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        changePage(historyData.pagination.currentPage + 1)
                      }
                      disabled={!historyData.pagination.hasNextPage}>
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Details Sheet (Desktop) */}
      {!isMobile && (
        <Sheet open={showDetails} onOpenChange={setShowDetails}>
          <SheetContent className='w-[600px] sm:w-[700px]'>
            <SheetHeader>
              <SheetTitle>Record Details</SheetTitle>
              <SheetDescription>
                Detailed information about this store reserve record
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className='h-full  py-4'>
              {selectedRecord && (
                <div className='space-y-6'>
                  {/* Product Information */}
                  <div className='space-y-3'>
                    <h3 className='text-lg font-semibold flex items-center'>
                      <Package className='h-5 w-5 mr-2 text-blue-500' />
                      Product Information
                    </h3>
                    <div className='space-y-2'>
                      <p className='text-sm text-gray-600'>
                        {selectedRecordProducts?.length || 0} product(s) in this
                        record
                      </p>
                      <div className='text-lg font-semibold text-gray-800 mb-2'>
                        {selectedRecordProducts?.[0]?.productName.split(
                          " ",
                        )[0] || "N/A"}
                      </div>
                      {selectedRecordProducts?.map((product, idx) => {
                        const variantName = product.productName
                          .split(" ")
                          .slice(1)
                          .join(" ");
                        return (
                          <Card
                            key={idx}
                            className='p-2 bg-gray-50 border-blue-100'>
                            <CardContent className='pt-2 space-y-1'>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium text-blue-700'>
                                  Variant: {variantName || "Standard"}
                                </span>
                                <Badge
                                  variant='outline'
                                  className='text-xs bg-purple-50 text-purple-700 border-purple-200'>
                                  Qty: {product.quantity}
                                </Badge>
                              </div>
                              <div className='flex items-center justify-between text-sm'>
                                <span className='text-gray-500'>
                                  {formatCurrency(product.unitPrice)} each
                                </span>
                                <span className='font-semibold text-gray-800'>
                                  {formatCurrency(
                                    product.quantity * product.unitPrice,
                                  )}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  {/* Store Information */}
                  <div className='space-y-3'>
                    <h3 className='text-lg font-semibold flex items-center'>
                      <Store className='h-5 w-5 mr-2 text-purple-500' />
                      Store Information
                    </h3>
                    <Card>
                      <CardContent className='pt-6 space-y-2'>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>
                            Store ID:
                          </span>
                          <span className='text-sm font-medium'>
                            {selectedRecord.storeId}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>
                            Store Name:
                          </span>
                          <span className='text-sm font-medium'>
                            {selectedRecord.storeName}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>
                            Location:
                          </span>
                          <span className='text-sm font-medium'>
                            {selectedRecord.storeLocation}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>
                            Store Slug:
                          </span>
                          <span className='text-sm font-medium'>
                            {selectedRecord.storeSlug}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quantity and Price - Summary for all products */}
                  <div className='space-y-3'>
                    <h3 className='text-lg font-semibold flex items-center'>
                      <DollarSign className='h-5 w-5 mr-2 text-green-500' />
                      Record Summary
                    </h3>
                    <Card>
                      <CardContent className='pt-6 space-y-2'>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>
                            Total Quantity Reserved:
                          </span>
                          <Badge
                            variant='secondary'
                            className='text-base font-semibold'>
                            {selectedRecordProducts?.reduce(
                              (sum, p) => sum + p.quantity,
                              0,
                            ) || 0}
                          </Badge>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>
                            Total Products:
                          </span>
                          <span className='text-sm font-medium'>
                            {selectedRecordProducts?.length || 0}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>
                            Total Record Value:
                          </span>
                          <span className='text-sm font-semibold text-green-600'>
                            {formatCurrency(
                              selectedRecordProducts?.reduce(
                                (sum, p) => sum + p.quantity * p.unitPrice,
                                0,
                              ) || 0,
                            )}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Record Information */}
                  <div className='space-y-3'>
                    <h3 className='text-lg font-semibold flex items-center'>
                      <Hash className='h-5 w-5 mr-2 text-orange-500' />
                      Record Information
                    </h3>
                    <Card>
                      <CardContent className='pt-6 space-y-2'>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>
                            Record ID:
                          </span>
                          <span className='text-sm font-mono  bg-gray-100 px-2 py-1 rounded'>
                            {selectedRecord.recordId}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>
                            Created Date:
                          </span>
                          <span className='text-sm font-medium'>
                            {formatDate(selectedRecord.createdAt)}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>
                            Created By:
                          </span>
                          <span className='text-sm font-medium'>
                            {selectedRecord.createdBy}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Additional Info from Record API */}
                  {recordData?.record && (
                    <Card className='bg-blue-50 border-blue-200 hidden'>
                      <CardContent className='pt-6'>
                        <p className='text-sm text-gray-700'>
                          <strong>Total Products in Record:</strong>{" "}
                          {recordData.record.storeLocation}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {recordLoading && (
                <div className='flex items-center justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
                </div>
              )}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}

      {/* Record Details Drawer (Mobile) */}
      {isMobile && (
        <Drawer open={showDetails} onOpenChange={setShowDetails}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Record Details</DrawerTitle>
            </DrawerHeader>
            <ScrollArea className='h-full px-4 pb-8'>
              {selectedRecord && (
                <div className='space-y-4'>
                  {/* Product Information */}
                  <div>
                    <h3 className='text-md font-semibold mb-2'>
                      Product Information
                    </h3>
                    <div className='space-y-2'>
                      <p className='text-sm text-gray-600'>
                        {selectedRecordProducts?.length || 0} product(s) in this
                        record
                      </p>
                      <div className='text-base font-semibold text-gray-800 mb-2'>
                        {selectedRecordProducts?.[0]?.productName.split(
                          " ",
                        )[0] || "N/A"}
                      </div>
                      {selectedRecordProducts?.map((product, idx) => {
                        const variantName = product.productName
                          .split(" ")
                          .slice(1)
                          .join(" ");
                        return (
                          <Card key={idx} className='p-2 bg-gray-50'>
                            <CardContent className='pt-2 space-y-1'>
                              <div className='flex items-center justify-between text-sm'>
                                <span className='font-medium text-gray-700'>
                                  {variantName || "Standard"}
                                </span>
                                <Badge variant='outline' className='text-xs'>
                                  {product.quantity}
                                </Badge>
                              </div>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-500'>
                                  ৳{formatCurrency(product.unitPrice)} each
                                </span>
                                <span className='font-semibold text-green-600'>
                                  ৳
                                  {formatCurrency(
                                    product.quantity * product.unitPrice,
                                  )}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  {/* Store Information */}
                  <div>
                    <h3 className='text-md font-semibold mb-2'>
                      Store Information
                    </h3>
                    <Card>
                      <CardContent className='pt-4 space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600'>Store:</span>
                          <span className='font-medium'>
                            {selectedRecord.storeName}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600'>Location:</span>
                          <span className='font-medium'>
                            {selectedRecord.storeLocation}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Record Summary */}
                  <div>
                    <h3 className='text-md font-semibold mb-2'>
                      Record Summary
                    </h3>
                    <Card>
                      <CardContent className='pt-4 space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600'>Total Quantity:</span>
                          <Badge variant='secondary'>
                            {selectedRecordProducts?.reduce(
                              (sum, p) => sum + p.quantity,
                              0,
                            ) || 0}
                          </Badge>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600'>Total Products:</span>
                          <span className='font-medium'>
                            {selectedRecordProducts?.length || 0}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600'>Total Value:</span>
                          <span className='font-bold text-green-600'>
                            {formatCurrency(
                              selectedRecordProducts?.reduce(
                                (sum, p) => sum + p.quantity * p.unitPrice,
                                0,
                              ) || 0,
                            )}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Record Information */}
                  <div>
                    <h3 className='text-md font-semibold mb-2'>
                      Record Information
                    </h3>
                    <Card>
                      <CardContent className='pt-4 space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600'>Record ID:</span>
                          <span className='font-mono text-xs'>
                            {selectedRecord.recordId}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600'>Date:</span>
                          <span className='font-medium'>
                            {formatDate(selectedRecord.createdAt)}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600'>By:</span>
                          <span className='font-medium'>
                            {selectedRecord.createdBy}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {recordData?.record && (
                    <Card className='bg-blue-50 border-blue-200'>
                      <CardContent className='pt-4'>
                        <p className='text-sm'>
                          <strong>Total Products in Record:</strong>{" "}
                          {recordData.record.totalProductsInRecord}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {recordLoading && (
                <div className='flex items-center justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
                </div>
              )}
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

export default StoreReserveHistoryTab;
