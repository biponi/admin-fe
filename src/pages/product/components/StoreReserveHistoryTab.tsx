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
  Ruler,
  Palette,
  Inbox,
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
      <div className='flex flex-col items-center justify-center h-64 gap-3'>
        <div className='w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin' />
        <p className='text-sm text-slate-500'>Loading store reserve history…</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white rounded-lg border border-slate-100 p-4 hover:border-slate-200 transition-colors'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>
                Total Records
              </p>
              <p className='text-2xl font-bold text-slate-900'>
                {historyData?.summary.totalRecords || 0}
              </p>
              <p className='text-xs text-slate-500'>reserve records</p>
            </div>
            <div className='bg-indigo-100 p-2.5 rounded-lg'>
              <History className='h-5 w-5 text-indigo-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg border border-slate-100 p-4 hover:border-slate-200 transition-colors'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>
                Total Quantity Reserved
              </p>
              <p className='text-2xl font-bold text-slate-900'>
                {historyData?.summary.totalQuantityReserved?.toLocaleString() ||
                  0}
              </p>
              <p className='text-xs text-slate-500'>units reserved</p>
            </div>
            <div className='bg-emerald-100 p-2.5 rounded-lg'>
              <Package className='h-5 w-5 text-emerald-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg border border-slate-100 p-4 hover:border-slate-200 transition-colors'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>
                Unique Stores
              </p>
              <p className='text-2xl font-bold text-slate-900'>
                {historyData?.summary.uniqueStores || 0}
              </p>
              <p className='text-xs text-slate-500'>stores</p>
            </div>
            <div className='bg-violet-100 p-2.5 rounded-lg'>
              <Store className='h-5 w-5 text-violet-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg border border-slate-100 p-4 hover:border-slate-200 transition-colors'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>
                Avg. Quantity/Record
              </p>
              <p className='text-2xl font-bold text-slate-900'>
                {calculateAverageQuantity()}
              </p>
              <p className='text-xs text-slate-500'>average</p>
            </div>
            <div className='bg-amber-100 p-2.5 rounded-lg'>
              <TrendingUp className='h-5 w-5 text-amber-600' />
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
              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className='border border-slate-200 bg-white focus:ring-indigo-500'>
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
              <label className='text-sm font-semibold text-slate-700 mb-1 block'>
                Sort Order
              </label>
              <Select
                value={sortOrder}
                onValueChange={(value: any) => setSortOrder(value)}>
                <SelectTrigger className='border border-slate-200 bg-white focus:ring-indigo-500'>
                  <SelectValue placeholder='Order' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='desc'>Descending</SelectItem>
                  <SelectItem value='asc'>Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-end space-x-2'>
              <Button onClick={handleFilter} className='flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors'>
                Apply Filters
              </Button>
              <Button onClick={handleReset} variant='outline' className='border border-slate-200'>
                <X className='h-4 w-4 mr-1' />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className='rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden'>
        <div className='p-0'>
          {!isMobile ? (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-slate-50 hover:bg-slate-50 border-b border-slate-100'>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                      Date
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                      Store Name
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                      Location
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                      Products
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 text-right'>
                      Total Quantity
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 text-right'>
                      Total Value
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                      Reserved By
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                      Record ID
                    </TableHead>
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
                          className='cursor-pointer border-b border-slate-50 hover:bg-slate-50/60 transition-colors group'
                          onClick={() =>
                            handleRecordClick(groupedRecord.products)
                          }>
                          <TableCell className='py-3.5'>
                            <div className='flex items-center'>
                              <Calendar className='h-4 w-4 mr-2 text-slate-400' />
                              <span className='text-sm text-slate-600'>
                                {formatDate(groupedRecord.createdAt)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className='py-3.5'>
                            <div className='flex items-center'>
                              <Store className='h-4 w-4 mr-2 text-slate-500' />
                              <span className='font-medium text-sm text-slate-800'>
                                {groupedRecord.storeName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className='py-3.5'>
                            <div className='flex items-center'>
                              <MapPin className='h-4 w-4 mr-2 text-slate-400' />
                              <span className='text-sm text-slate-600'>
                                {groupedRecord.storeLocation}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className='py-3.5'>
                            <Badge
                              variant='secondary'
                              className='text-xs bg-slate-100 text-slate-700 border border-slate-200'>
                              {productCount} variant
                              {productCount > 1 ? "s" : ""}
                            </Badge>
                          </TableCell>
                          <TableCell className='py-3.5 text-right text-sm tabular-nums text-slate-600 font-medium'>
                            {totalQuantity}
                          </TableCell>

                          <TableCell className='py-3.5 text-right text-sm tabular-nums text-slate-600 font-medium'>
                            {formatCurrency(totalValue)}
                          </TableCell>
                          <TableCell className='py-3.5'>
                            <div className='flex items-center'>
                              <User className='h-4 w-4 mr-2 text-slate-400' />
                              <span className='text-sm text-slate-600'>
                                {groupedRecord.createdBy}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className='py-3.5'>
                            <div className='flex items-center'>
                              <Hash className='h-4 w-4 mr-2 text-slate-400' />
                              <span className='text-xs text-slate-500 font-mono'>
                                {groupedRecord.recordId.slice(0, 8)}...
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className='text-center py-16'>
                        <div className='flex flex-col items-center gap-2 text-slate-400'>
                          <Inbox className='h-8 w-8 opacity-40' />
                          <p className='text-sm font-medium'>
                            No store reserve history found
                          </p>
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
                    <div
                      key={groupedRecord.recordId}
                      className='bg-white rounded-lg border border-slate-100 p-4 cursor-pointer hover:border-slate-200 transition-colors'
                      onClick={() => handleRecordClick(groupedRecord.products)}>
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div className='bg-slate-100 p-1.5 rounded'>
                              <Store className='h-3.5 w-3.5 text-slate-600' />
                            </div>
                            <span className='font-semibold text-slate-800'>
                              {groupedRecord.storeName}
                            </span>
                          </div>
                          <Badge variant='secondary' className='bg-slate-100 text-slate-700 border border-slate-200'>{totalQuantity}</Badge>
                        </div>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2 text-sm bg-slate-50 px-3 py-2 rounded border border-slate-100'>
                            <MapPin className='h-4 w-4 text-slate-600 flex-shrink-0' />
                            <span className='text-slate-700 font-medium'>
                              {groupedRecord.storeLocation}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-sm bg-slate-50 px-3 py-2 rounded border border-slate-100'>
                            <Calendar className='h-4 w-4 text-slate-600 flex-shrink-0' />
                            <span className='text-slate-700 font-medium'>
                              {formatDate(groupedRecord.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className='flex items-center justify-between text-sm pt-2 border-t border-slate-100'>
                          <span className='text-slate-600'>by {groupedRecord.createdBy}</span>
                          <span className='font-semibold text-emerald-600'>
                            {formatCurrency(totalValue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className='text-center py-16'>
                  <div className='flex flex-col items-center gap-2 text-slate-400'>
                    <Inbox className='h-8 w-8 opacity-40' />
                    <p className='text-sm font-medium'>
                      No store reserve history found
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {historyData?.pagination && historyData.pagination.totalPages > 0 && (
            <div className='border-t border-slate-100 bg-slate-50/50 p-3'>
              <div className='flex flex-col sm:flex-row items-center justify-between gap-3'>
                <div className='text-xs text-slate-500 order-2 sm:order-1'>
                  Page{" "}
                  <span className='font-medium text-slate-700'>
                    {historyData.pagination.currentPage}
                  </span>{" "}
                  of{" "}
                  <span className='font-medium text-slate-700'>
                    {historyData.pagination.totalPages}
                  </span>
                </div>
                <div className='flex items-center gap-2 order-1 sm:order-2'>
                  <Select
                    value={historyParams.limit?.toString() || "20"}
                    onValueChange={(value) => changePageSize(parseInt(value))}>
                    <SelectTrigger className='w-20 h-8 text-xs border border-slate-200 bg-white'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='10'>10</SelectItem>
                      <SelectItem value='20'>20</SelectItem>
                      <SelectItem value='50'>50</SelectItem>
                      <SelectItem value='100'>100</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant='outline'
                    size='sm'
                    className='border border-slate-200'
                    onClick={() =>
                      changePage(historyData.pagination.currentPage - 1)
                    }
                    disabled={!historyData.pagination.hasPreviousPage}>
                    <ChevronLeft className='h-3.5 w-3.5' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='border border-slate-200'
                    onClick={() =>
                      changePage(historyData.pagination.currentPage + 1)
                    }
                    disabled={!historyData.pagination.hasNextPage}>
                    <ChevronRight className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
                    <h3 className='text-lg font-semibold flex items-center text-slate-900'>
                      <Package className='h-5 w-5 mr-2 text-indigo-600' />
                      Product Information
                    </h3>
                    <div className='space-y-2'>
                      <p className='text-sm text-slate-600'>
                        {selectedRecordProducts?.length || 0} product(s) in this
                        record
                      </p>
                      <div className='text-lg font-semibold text-slate-800 mb-2'>
                        {selectedRecordProducts?.[0]?.productName.split(
                          " ",
                        )[0] || "N/A"}
                      </div>
                      {selectedRecordProducts?.map((product, idx) => {
                        const variantName = product.variantDetails
                          ? product.variantDetails.color ||
                            product.variantDetails.size
                            ? [
                                product.variantDetails.color,
                                product.variantDetails.size,
                              ]
                                .filter(Boolean)
                                .join(" - ")
                            : "Standard"
                          : product.productName.split(" ").slice(1).join(" ") ||
                            "Standard";

                        return (
                          <div
                            key={idx}
                            className='p-3 bg-slate-50 border border-slate-200 rounded-lg hover:shadow-md transition-all'>
                            <div className='space-y-3'>
                              {/* Variant Header with Image */}
                              <div className='flex items-start gap-3'>
                                {/* Variant Image */}
                                <div className='w-16 h-16 bg-white rounded-lg overflow-hidden border-2 border-indigo-200 flex-shrink-0'>
                                  {product.variantDetails?.image ? (
                                    <img
                                      src={product.variantDetails.image}
                                      alt={`${variantName} variant`}
                                      className='w-full h-full object-cover'
                                    />
                                  ) : (
                                    <div className='w-full h-full flex items-center justify-center bg-indigo-100'>
                                      <Package className='h-6 w-6 text-indigo-400' />
                                    </div>
                                  )}
                                </div>

                                {/* Variant Info */}
                                <div className='flex-1 min-w-0'>
                                  <div className='flex items-center justify-between mb-1'>
                                    {/* Size & Color Badges */}
                                    {product.variantDetails && (
                                      <div className='flex gap-2 flex-wrap'>
                                        {product.variantDetails.size && (
                                          <Badge
                                            variant='outline'
                                            className='text-xs border-indigo-300 text-indigo-700'>
                                            <Ruler className='h-3 w-3 mr-1' />
                                            {product.variantDetails.size}
                                          </Badge>
                                        )}
                                        {product.variantDetails.color && (
                                          <Badge
                                            variant='outline'
                                            className='text-xs border-violet-300 text-violet-700'>
                                            <Palette className='h-3 w-3 mr-1' />
                                            {product.variantDetails.color}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                    <Badge className='bg-violet-600 text-white'>
                                      Qty: {product.quantity}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Price Section */}
                              <div className='flex items-center justify-between pt-2 border-t border-slate-200'>
                                <span className='text-sm text-slate-600'>
                                  {formatCurrency(product.unitPrice)} each
                                </span>
                                <span className='text-base font-bold text-emerald-600'>
                                  {formatCurrency(
                                    product.quantity * product.unitPrice,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Store Information */}
                  <div className='space-y-3'>
                    <h3 className='text-lg font-semibold flex items-center text-slate-900'>
                      <Store className='h-5 w-5 mr-2 text-violet-600' />
                      Store Information
                    </h3>
                    <div className='bg-white rounded-lg border border-slate-200'>
                      <div className='p-6 space-y-2'>
                        <div className='flex justify-between'>
                          <span className='text-sm text-slate-600'>
                            Store ID:
                          </span>
                          <span className='text-sm font-medium text-slate-900'>
                            {selectedRecord.storeId}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-slate-600'>
                            Store Name:
                          </span>
                          <span className='text-sm font-medium text-slate-900'>
                            {selectedRecord.storeName}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-slate-600'>
                            Location:
                          </span>
                          <span className='text-sm font-medium text-slate-900'>
                            {selectedRecord.storeLocation}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-slate-600'>
                            Store Slug:
                          </span>
                          <span className='text-sm font-medium text-slate-900'>
                            {selectedRecord.storeSlug}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Price - Summary for all products */}
                  <div className='space-y-3'>
                    <h3 className='text-lg font-semibold flex items-center text-slate-900'>
                      <DollarSign className='h-5 w-5 mr-2 text-emerald-600' />
                      Record Summary
                    </h3>
                    <div className='bg-white rounded-lg border border-slate-200'>
                      <div className='p-6 space-y-2'>
                        <div className='flex justify-between'>
                          <span className='text-sm text-slate-600'>
                            Total Quantity Reserved:
                          </span>
                          <Badge
                            variant='secondary'
                            className='text-base font-semibold bg-indigo-100 text-indigo-700'>
                            {selectedRecordProducts?.reduce(
                              (sum, p) => sum + p.quantity,
                              0,
                            ) || 0}
                          </Badge>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-slate-600'>
                            Total Products:
                          </span>
                          <span className='text-sm font-medium text-slate-900'>
                            {selectedRecordProducts?.length || 0}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-slate-600'>
                            Total Record Value:
                          </span>
                          <span className='text-sm font-semibold text-emerald-600'>
                            {formatCurrency(
                              selectedRecordProducts?.reduce(
                                (sum, p) => sum + p.quantity * p.unitPrice,
                                0,
                              ) || 0,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Record Information */}
                  <div className='space-y-3'>
                    <h3 className='text-lg font-semibold flex items-center text-slate-900'>
                      <Hash className='h-5 w-5 mr-2 text-amber-600' />
                      Record Information
                    </h3>
                    <div className='bg-white rounded-lg border border-slate-200'>
                      <div className='p-6 space-y-2'>
                        <div className='flex justify-between'>
                          <span className='text-sm text-slate-600'>
                            Record ID:
                          </span>
                          <span className='text-sm font-mono bg-slate-100 px-2 py-1 rounded text-slate-900'>
                            {selectedRecord.recordId}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-slate-600'>
                            Created Date:
                          </span>
                          <span className='text-sm font-medium text-slate-900'>
                            {formatDate(selectedRecord.createdAt)}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-slate-600'>
                            Created By:
                          </span>
                          <span className='text-sm font-medium text-slate-900'>
                            {selectedRecord.createdBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info from Record API */}
                  {recordData?.record && (
                    <div className='bg-indigo-50 border border-indigo-200 rounded-lg hidden'>
                      <div className='p-6'>
                        <p className='text-sm text-slate-700'>
                          <strong>Total Products in Record:</strong>{" "}
                          {recordData.record.storeLocation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {recordLoading && (
                <div className='flex items-center justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600'></div>
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
                    <h3 className='text-md font-semibold mb-2 text-slate-900'>
                      Product Information
                    </h3>
                    <div className='space-y-2'>
                      <p className='text-sm text-slate-600'>
                        {selectedRecordProducts?.length || 0} product(s) in this
                        record
                      </p>
                      <div className='text-base font-semibold text-slate-800 mb-2'>
                        {selectedRecordProducts?.[0]?.productName.split(
                          " ",
                        )[0] || "N/A"}
                      </div>
                      {selectedRecordProducts?.map((product, idx) => {
                        const variantName = product.variantDetails
                          ? product.variantDetails.color ||
                            product.variantDetails.size
                            ? [
                                product.variantDetails.color,
                                product.variantDetails.size,
                              ]
                                .filter(Boolean)
                                .join(" - ")
                            : "Standard"
                          : product.productName.split(" ").slice(1).join(" ") ||
                            "Standard";

                        return (
                          <div
                            key={idx}
                            className='p-3 bg-slate-50 border border-slate-200 rounded-lg hover:shadow-md transition-all'>
                            <div className='space-y-3'>
                              {/* Variant Header with Image */}
                              <div className='flex items-start gap-3'>
                                {/* Variant Image */}
                                <div className='w-16 h-16 bg-white rounded-lg overflow-hidden border-2 border-indigo-200 flex-shrink-0'>
                                  {product.variantDetails?.image ? (
                                    <img
                                      src={product.variantDetails.image}
                                      alt={`${variantName} variant`}
                                      className='w-full h-full object-cover'
                                    />
                                  ) : (
                                    <div className='w-full h-full flex items-center justify-center bg-indigo-100'>
                                      <Package className='h-6 w-6 text-indigo-400' />
                                    </div>
                                  )}
                                </div>

                                {/* Variant Info */}
                                <div className='flex-1 min-w-0'>
                                  <div className='flex items-center justify-between mb-1'>
                                    <span className='text-sm font-bold text-slate-800'>
                                      {variantName}
                                    </span>
                                    <Badge className='bg-violet-600 text-white'>
                                      Qty: {product.quantity}
                                    </Badge>
                                  </div>

                                  {/* Size & Color Badges */}
                                  {product.variantDetails && (
                                    <div className='flex gap-2 flex-wrap'>
                                      {product.variantDetails.size && (
                                        <Badge
                                          variant='outline'
                                          className='text-xs border-indigo-300 text-indigo-700'>
                                          <Ruler className='h-3 w-3 mr-1' />
                                          {product.variantDetails.size}
                                        </Badge>
                                      )}
                                      {product.variantDetails.color && (
                                        <Badge
                                          variant='outline'
                                          className='text-xs border-violet-300 text-violet-700'>
                                          <Palette className='h-3 w-3 mr-1' />
                                          {product.variantDetails.color}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Price Section */}
                              <div className='flex items-center justify-between pt-2 border-t border-slate-200'>
                                <span className='text-sm text-slate-600'>
                                  {formatCurrency(product.unitPrice)} each
                                </span>
                                <span className='text-base font-bold text-emerald-600'>
                                  {formatCurrency(
                                    product.quantity * product.unitPrice,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Store Information */}
                  <div>
                    <h3 className='text-md font-semibold mb-2 text-slate-900'>
                      Store Information
                    </h3>
                    <div className='bg-white rounded-lg border border-slate-200'>
                      <div className='p-4 space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-slate-600'>Store:</span>
                          <span className='font-medium text-slate-900'>
                            {selectedRecord.storeName}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-slate-600'>Location:</span>
                          <span className='font-medium text-slate-900'>
                            {selectedRecord.storeLocation}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Record Summary */}
                  <div>
                    <h3 className='text-md font-semibold mb-2 text-slate-900'>
                      Record Summary
                    </h3>
                    <div className='bg-white rounded-lg border border-slate-200'>
                      <div className='p-4 space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-slate-600'>Total Quantity:</span>
                          <Badge variant='secondary' className='bg-indigo-100 text-indigo-700'>
                            {selectedRecordProducts?.reduce(
                              (sum, p) => sum + p.quantity,
                              0,
                            ) || 0}
                          </Badge>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-slate-600'>Total Products:</span>
                          <span className='font-medium text-slate-900'>
                            {selectedRecordProducts?.length || 0}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-slate-600'>Total Value:</span>
                          <span className='font-bold text-emerald-600'>
                            {formatCurrency(
                              selectedRecordProducts?.reduce(
                                (sum, p) => sum + p.quantity * p.unitPrice,
                                0,
                              ) || 0,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Record Information */}
                  <div>
                    <h3 className='text-md font-semibold mb-2 text-slate-900'>
                      Record Information
                    </h3>
                    <div className='bg-white rounded-lg border border-slate-200'>
                      <div className='p-4 space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-slate-600'>Record ID:</span>
                          <span className='font-mono text-xs text-slate-900'>
                            {selectedRecord.recordId}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-slate-600'>Date:</span>
                          <span className='font-medium text-slate-900'>
                            {formatDate(selectedRecord.createdAt)}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-slate-600'>By:</span>
                          <span className='font-medium text-slate-900'>
                            {selectedRecord.createdBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {recordData?.record && (
                    <div className='bg-indigo-50 border border-indigo-200 rounded-lg'>
                      <div className='p-4'>
                        <p className='text-sm text-slate-700'>
                          <strong>Total Products in Record:</strong>{" "}
                          {recordData.record.totalProductsInRecord}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {recordLoading && (
                <div className='flex items-center justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600'></div>
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
