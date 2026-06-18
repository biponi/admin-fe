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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
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
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Hash,
  Search,
  MoreHorizontal,
  Eye,
  ChevronLeft,
  Inbox,
} from "lucide-react";
import { useProductAnalytics } from "../hooks/useProductAnalytics";
import { format } from "date-fns";
import { showOrderModal } from "../../../utils/orderModal";

interface OrderHistoryTabProps {
  productId: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-500",
  },
  processing: {
    label: "Processing",
    className: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
    dot: "bg-indigo-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    dot: "bg-rose-500",
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = STATUS_CONFIG[status.toLowerCase()] || {
    label: status,
    className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

const OrderHistoryTab = ({ productId }: OrderHistoryTabProps) => {
  const isMobile = useIsMobile();
  const { orderHistory, loading, fetchOrderHistory, orderParams } =
    useProductAnalytics(productId);

  //eslint-disable-next-line
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchOrderHistory();
    //eslint-disable-next-line
  }, []);

  const handleFilter = () => {
    fetchOrderHistory({
      page: 1,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
    });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setSearchQuery("");
    fetchOrderHistory({ page: 1, limit: 20 });
  };

  const hasFilters = startDate || endDate || (statusFilter && statusFilter !== "all") || searchQuery;

  const handleOrderClick = (order: any) => {
    showOrderModal(order.orderNumber);
  };

  if (loading && !orderHistory) {
    return (
      <div className='flex flex-col items-center justify-center h-64 gap-3'>
        <div className='w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin' />
        <p className='text-sm text-slate-500'>Loading orders…</p>
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
                Total Orders
              </p>
              <p className='text-2xl font-bold text-slate-900'>
                {orderHistory?.summary.totalOrders || 0}
              </p>
              <p className='text-xs text-slate-500'>all time</p>
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
                Total Revenue
              </p>
              <p className='text-2xl font-bold text-slate-900'>
                ৳{orderHistory?.summary.totalRevenue?.toLocaleString() || 0}
              </p>
              <p className='text-xs text-slate-500'>
                earned
              </p>
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
                Quantity Sold
              </p>
              <p className='text-2xl font-bold text-slate-900'>
                {orderHistory?.summary.totalQuantitySold?.toLocaleString() || 0}
              </p>
              <p className='text-xs text-slate-500'>units</p>
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
                Avg Order Value
              </p>
              <p className='text-2xl font-bold text-slate-900'>
                ৳
                {typeof orderHistory?.summary.averageOrderValue === "number"
                  ? orderHistory.summary.averageOrderValue.toFixed(0)
                  : orderHistory?.summary.averageOrderValue || 0}
              </p>
              <p className='text-xs text-slate-500'>
                per order
              </p>
            </div>
            <div className='bg-amber-100 p-2.5 rounded-lg'>
              <TrendingUp className='h-5 w-5 text-amber-600' strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className='flex flex-col sm:flex-row gap-3'>
        {/* Search */}
        <div className='relative flex-1 max-w-xs'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none' />
          <Input
            placeholder='Search orders...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
            className='pl-9 h-9 text-sm border-slate-200 bg-white focus-visible:ring-indigo-500'
          />
        </div>

        {/* Start Date */}
        <div className='relative'>
          <Input
            type='date'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className='h-9 text-sm border-slate-200 bg-white focus-visible:ring-indigo-500'
          />
        </div>

        {/* End Date */}
        <div className='relative'>
          <Input
            type='date'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className='h-9 text-sm border-slate-200 bg-white focus-visible:ring-indigo-500'
          />
        </div>

        {/* Status */}
        <Select value={statusFilter || "all"} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full sm:w-44 h-9 text-sm border-slate-200 bg-white focus:ring-indigo-500'>
            <SelectValue placeholder='All statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            <SelectItem value='completed'>Completed</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='processing'>Processing</SelectItem>
            <SelectItem value='cancelled'>Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <button
          onClick={handleFilter}
          className='h-9 px-4 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm'>
          Apply
        </button>

        {hasFilters && (
          <button
            onClick={handleReset}
            className='h-9 px-3 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5'>
            <X className='h-3.5 w-3.5' />
            Clear
          </button>
        )}
      </div>

      {/* Orders List - Desktop Table / Mobile Cards */}
      {isMobile ? (
        <div className='space-y-4'>
          {orderHistory?.orders?.map((order) => {
            const totalQuantity =
              order.productDetails?.reduce(
                (sum: number, p: any) => sum + p.quantity,
                0,
              ) || 0;

            return (
              <Card
                key={order.orderId}
                className='group relative overflow-hidden border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-sm cursor-pointer'
                onClick={() => handleOrderClick(order)}>
                <CardContent className='p-4'>
                  <div className='space-y-4'>
                    {/* Header */}
                    <div className='flex items-start justify-between'>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-2'>
                          <Hash className='h-4 w-4 text-slate-400' />
                          <span className='font-semibold text-slate-800 hover:text-indigo-600 transition-colors'>
                            #{order.orderNumber}
                          </span>
                        </div>
                        <div className='flex items-center gap-2 text-xs text-slate-500'>
                          <Calendar className='h-3 w-3' />
                          {format(new Date(order.orderDate), "MMM dd, yyyy")}
                        </div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    {/* Product Variants */}
                    <div className='bg-slate-50 px-3 py-2 rounded-lg border border-slate-100'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Package className='h-4 w-4 text-slate-500' />
                        <span className='text-xs font-semibold text-slate-700'>
                          Product Variants
                        </span>
                      </div>
                      <div className='flex flex-wrap gap-1'>
                        {order.productDetails?.map((detail: any, idx: number) => (
                          <div key={idx} className='flex items-center gap-1'>
                            {detail.variation?.size && (
                              <span className='text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100'>
                                {detail.variation.size}
                              </span>
                            )}
                            {detail.variation?.color && (
                              <span className='text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100'>
                                {detail.variation.color}
                              </span>
                            )}
                            {detail.quantity > 1 && (
                              <span className='text-[10px] font-semibold text-slate-500'>
                                ×{detail.quantity}
                              </span>
                            )}
                            {idx < order.productDetails.length - 1 && (
                              <span className='text-slate-300'>·</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='bg-white p-3 rounded-lg border border-slate-100'>
                        <p className='text-xs text-slate-500 font-semibold mb-1'>
                          Quantity
                        </p>
                        <p className='text-lg font-semibold text-slate-800'>
                          {totalQuantity}
                        </p>
                      </div>
                      <div className='bg-white p-3 rounded-lg border border-slate-100'>
                        <p className='text-xs text-slate-500 font-semibold mb-1'>
                          Total Price
                        </p>
                        <p className='text-lg font-semibold text-slate-800'>
                          ৳{order.orderTotal?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>

                    {/* Discount if exists */}
                    {order.discount > 0 && (
                      <div className='flex items-center justify-between text-sm bg-slate-50 px-3 py-2 rounded-lg border border-slate-100'>
                        <span className='text-slate-600 font-medium'>
                          Discount Applied
                        </span>
                        <span className='text-emerald-600 font-semibold'>
                          -৳{order.discount}
                        </span>
                      </div>
                    )}

                    {/* View Details */}
                    <div className='flex items-center justify-end text-sm text-indigo-600 font-medium pt-2 border-t border-slate-100'>
                      <span>View Details</span>
                      <ChevronRight className='h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {(!orderHistory?.orders || orderHistory.orders.length === 0) && (
            <Card className='border border-dashed border-slate-200'>
              <CardContent className='py-12 text-center'>
                <div className='flex flex-col items-center gap-2 text-slate-400'>
                  <Inbox className='h-8 w-8 opacity-40' />
                  <p className='text-sm font-medium'>No orders found</p>
                  {hasFilters && (
                    <button
                      onClick={handleReset}
                      className='text-xs text-indigo-600 hover:underline mt-1'>
                      Clear filters
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className='rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='bg-slate-50 hover:bg-slate-50 border-b border-slate-100'>
                  <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                    Order Number
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                    Product Variant
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 text-right'>
                    Quantity
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 text-right'>
                    Discount
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 text-right'>
                    Price
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                    Status
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                    Date
                  </TableHead>
                  <TableHead className='w-10' />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderHistory?.orders?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className='py-16 text-center'>
                      <div className='flex flex-col items-center gap-2 text-slate-400'>
                        <Inbox className='h-8 w-8 opacity-40' />
                        <p className='text-sm font-medium'>No orders found</p>
                        {hasFilters && (
                          <button
                            onClick={handleReset}
                            className='text-xs text-indigo-600 hover:underline mt-1'>
                            Clear filters
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orderHistory?.orders?.map((order) => {
                    const totalQuantity =
                      order.productDetails?.reduce(
                        (sum: number, p: any) => sum + p.quantity,
                        0,
                      ) || 0;

                    return (
                      <TableRow
                        key={order.orderId}
                        className='border-b border-slate-50 hover:bg-slate-50/60 transition-colors group'>
                        <TableCell className='py-3.5'>
                          <span
                            className='font-medium text-slate-800 hover:text-indigo-600 cursor-pointer transition-colors'
                            onClick={() => handleOrderClick(order)}>
                            #{order.orderNumber}
                          </span>
                        </TableCell>
                        <TableCell className='py-3.5'>
                          <div className='flex flex-wrap gap-1'>
                            {order.productDetails?.map((detail: any, idx: number) => (
                              <div key={idx} className='flex items-center gap-1'>
                                {detail.variation?.size && (
                                  <span className='text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100'>
                                    {detail.variation.size}
                                  </span>
                                )}
                                {detail.variation?.color && (
                                  <span className='text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100'>
                                    {detail.variation.color}
                                  </span>
                                )}
                                {detail.quantity > 1 && (
                                  <span className='text-[10px] font-semibold text-slate-500'>
                                    ×{detail.quantity}
                                  </span>
                                )}
                                {idx < order.productDetails.length - 1 && (
                                  <span className='text-slate-300'>·</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className='py-3.5 text-right text-sm tabular-nums text-slate-600 font-medium'>
                          {totalQuantity}
                        </TableCell>
                        <TableCell className='py-3.5 text-right'>
                          {order.discount > 0 ? (
                            <span className='text-sm font-medium text-emerald-600'>
                              -৳{order.discount}
                            </span>
                          ) : (
                            <span className='text-sm text-slate-300'>—</span>
                          )}
                        </TableCell>
                        <TableCell className='py-3.5 text-right text-sm tabular-nums text-slate-600 font-medium'>
                          ৳{order.orderTotal?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell className='py-3.5'>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className='py-3.5 text-sm text-slate-500 whitespace-nowrap'>
                          {format(
                            new Date(order.orderDate),
                            "MMM dd, yyyy hh:MM a",
                          )}
                        </TableCell>
                        <TableCell className='py-3.5 text-right pr-3'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className='inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'>
                                <MoreHorizontal className='h-4 w-4' />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align='end'
                              className='w-44 shadow-lg'>
                              <DropdownMenuItem
                                onClick={() => handleOrderClick(order)}
                                className='gap-2 cursor-pointer'>
                                <Eye className='h-3.5 w-3.5 text-slate-500' />
                                View details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {orderHistory && orderHistory.pagination.totalItems > 0 && (
            <div className='flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50'>
              <p className='text-xs text-slate-500 order-2 sm:order-1'>
                Showing{" "}
                <span className='font-medium text-slate-700'>
                  {((orderHistory.pagination.currentPage || 1) - 1) *
                    (orderParams.limit || 20) +
                    1}
                  –
                  {Math.min(
                    (orderHistory.pagination.currentPage || 1) *
                      (orderParams.limit || 20),
                    orderHistory.pagination.totalItems || 0,
                  )}
                </span>{" "}
                of{" "}
                <span className='font-medium text-slate-700'>
                  {orderHistory.pagination.totalItems || 0}
                </span>{" "}
                orders
              </p>
              <div className='flex items-center gap-1 order-1 sm:order-2'>
                <button
                  disabled={!orderHistory?.pagination.hasPreviousPage}
                  onClick={() =>
                    fetchOrderHistory({ page: (orderParams.page || 1) - 1 })
                  }
                  className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'>
                  <ChevronLeft className='h-3.5 w-3.5' />
                  Previous
                </button>
                <span className='px-3 py-1.5 text-xs text-slate-500 font-medium'>
                  Page {orderHistory?.pagination.currentPage}
                </span>
                <button
                  disabled={!orderHistory?.pagination.hasNextPage}
                  onClick={() =>
                    fetchOrderHistory({ page: (orderParams.page || 1) + 1 })
                  }
                  className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'>
                  Next
                  <ChevronRight className='h-3.5 w-3.5' />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Details Sheet (Desktop) / Drawer (Mobile) */}
      {isMobile ? (
        <Drawer open={showDetails} onOpenChange={setShowDetails}>
          <DrawerContent className='max-h-[85vh]'>
            <DrawerHeader className='border-b bg-slate-50'>
              <DrawerTitle className='flex items-center gap-2 text-xl'>
                <div className='bg-indigo-600 p-2 rounded-lg'>
                  <ShoppingCart className='h-5 w-5 text-white' />
                </div>
                Order #{selectedOrder?.orderNumber}
              </DrawerTitle>
            </DrawerHeader>
            <ScrollArea className='h-[calc(85vh-80px)] px-4 py-6'>
              <div className='space-y-6'>
                {/* Customer Information */}
                <div>
                  <div className='flex items-center gap-2 mb-3'>
                    <div className='bg-slate-700 p-1.5 rounded-lg'>
                      <User className='h-4 w-4 text-white' />
                    </div>
                    <h3 className='font-semibold text-slate-800'>
                      Customer Information
                    </h3>
                  </div>
                  <div className='space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100'>
                    <div className='flex items-start gap-3'>
                      <User className='h-4 w-4 text-slate-500 mt-0.5' />
                      <div>
                        <p className='text-xs text-slate-600 font-semibold'>
                          Name
                        </p>
                        <p className='text-sm font-medium text-slate-800'>
                          {selectedOrder?.customer.name}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3'>
                      <Mail className='h-4 w-4 text-slate-500 mt-0.5' />
                      <div>
                        <p className='text-xs text-slate-600 font-semibold'>
                          Email
                        </p>
                        <p className='text-sm font-medium text-slate-800'>
                          {selectedOrder?.customer.email}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3'>
                      <Phone className='h-4 w-4 text-slate-500 mt-0.5' />
                      <div>
                        <p className='text-xs text-slate-600 font-semibold'>
                          Phone
                        </p>
                        <p className='text-sm font-medium text-slate-800'>
                          {selectedOrder?.customer.phoneNumber}
                        </p>
                      </div>
                    </div>
                    {selectedOrder?.customer.address && (
                      <div className='flex items-start gap-3'>
                        <MapPin className='h-4 w-4 text-slate-500 mt-0.5' />
                        <div>
                          <p className='text-xs text-slate-600 font-semibold'>
                            Address
                          </p>
                          <p className='text-sm font-medium text-slate-800'>
                            {selectedOrder.customer.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div>
                  <div className='flex items-center gap-2 mb-3'>
                    <div className='bg-indigo-600 p-1.5 rounded-lg'>
                      <Package className='h-4 w-4 text-white' />
                    </div>
                    <h3 className='font-semibold text-slate-800'>Product Details</h3>
                  </div>
                  <div className='space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100'>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='bg-white p-3 rounded-lg'>
                        <p className='text-xs text-slate-600 font-semibold mb-1'>
                          Quantity
                        </p>
                        <p className='text-lg font-semibold text-slate-800'>
                          {selectedOrder?.productDetails.quantity}
                        </p>
                      </div>
                      <div className='bg-white p-3 rounded-lg'>
                        <p className='text-xs text-slate-600 font-semibold mb-1'>
                          Unit Price
                        </p>
                        <p className='text-lg font-semibold text-slate-800'>
                          ৳{selectedOrder?.productDetails.unitPrice}
                        </p>
                      </div>
                    </div>
                    <div className='bg-white p-3 rounded-lg'>
                      <p className='text-xs text-slate-600 font-semibold mb-1'>
                        Total Price
                      </p>
                      <p className='text-2xl font-semibold text-slate-800'>
                        ৳{selectedOrder?.productDetails.totalPrice}
                      </p>
                    </div>
                    {selectedOrder?.productDetails.discount > 0 && (
                      <div className='bg-emerald-50 p-3 rounded-lg border border-emerald-100'>
                        <p className='text-xs text-emerald-700 font-semibold mb-1'>
                          Discount Applied
                        </p>
                        <p className='text-lg font-semibold text-emerald-600'>
                          -৳{selectedOrder.productDetails.discount}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Information */}
                <div>
                  <div className='flex items-center gap-2 mb-3'>
                    <div className='bg-amber-600 p-1.5 rounded-lg'>
                      <ShoppingCart className='h-4 w-4 text-white' />
                    </div>
                    <h3 className='font-semibold text-slate-800'>
                      Order Information
                    </h3>
                  </div>
                  <div className='space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-slate-600 font-semibold'>
                        Order Date
                      </span>
                      <span className='text-sm font-medium text-slate-800'>
                        {selectedOrder &&
                          format(
                            new Date(selectedOrder.orderDate),
                            "MMM dd, yyyy HH:mm",
                          )}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-slate-600 font-semibold'>
                        Status
                      </span>
                      <StatusBadge status={selectedOrder?.status || ""} />
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-slate-600 font-semibold'>
                        Delivery Status
                      </span>
                      <Badge variant='outline' className='bg-white border border-slate-200'>
                        {selectedOrder?.deliveryStatus}
                      </Badge>
                    </div>
                    <div className='pt-3 border-t border-slate-200'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-slate-700 font-semibold'>
                          Order Total
                        </span>
                        <span className='text-2xl font-semibold text-slate-800'>
                          ৳{selectedOrder?.orderTotal}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={showDetails} onOpenChange={setShowDetails}>
          <SheetContent className='w-full sm:max-w-2xl overflow-hidden'>
            <SheetHeader className='border-b pb-4 bg-slate-50 -mx-6 px-6 pt-6'>
              <SheetTitle className='flex items-center gap-3 text-2xl'>
                <div className='bg-indigo-600 p-2.5 rounded-xl shadow-sm'>
                  <ShoppingCart className='h-6 w-6 text-white' />
                </div>
                Order #{selectedOrder?.orderNumber}
              </SheetTitle>
              <SheetDescription className='text-base'>
                Full order and customer details
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className='h-[calc(100vh-180px)] mt-6 -mx-6 px-6'>
              <div className='space-y-6 pb-6'>
                {/* Customer Information */}
                <div>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='bg-slate-700 p-2 rounded-lg shadow-sm'>
                      <User className='h-5 w-5 text-white' strokeWidth={2.5} />
                    </div>
                    <h3 className='font-semibold text-lg text-slate-800'>
                      Customer Information
                    </h3>
                    <div className='flex-1 h-px bg-slate-200'></div>
                  </div>
                  <div className='space-y-4 bg-slate-50 p-6 rounded-lg border border-slate-100'>
                    <div className='flex items-start gap-4'>
                      <div className='bg-slate-200 p-2 rounded-lg'>
                        <User className='h-5 w-5 text-slate-700' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-xs text-slate-600 font-semibold uppercase tracking-wider mb-1'>
                          Name
                        </p>
                        <p className='text-base font-semibold text-slate-800'>
                          {selectedOrder?.customer.name}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-4'>
                      <div className='bg-slate-200 p-2 rounded-lg'>
                        <Mail className='h-5 w-5 text-slate-700' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-xs text-slate-600 font-semibold uppercase tracking-wider mb-1'>
                          Email
                        </p>
                        <p className='text-base font-semibold text-slate-800'>
                          {selectedOrder?.customer.email}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-4'>
                      <div className='bg-slate-200 p-2 rounded-lg'>
                        <Phone className='h-5 w-5 text-slate-700' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-xs text-slate-600 font-semibold uppercase tracking-wider mb-1'>
                          Phone
                        </p>
                        <p className='text-base font-semibold text-slate-800'>
                          {selectedOrder?.customer.phoneNumber}
                        </p>
                      </div>
                    </div>
                    {selectedOrder?.customer.address && (
                      <div className='flex items-start gap-4'>
                        <div className='bg-slate-200 p-2 rounded-lg'>
                          <MapPin className='h-5 w-5 text-slate-700' />
                        </div>
                        <div className='flex-1'>
                          <p className='text-xs text-slate-600 font-semibold uppercase tracking-wider mb-1'>
                            Address
                          </p>
                          <p className='text-base font-semibold text-slate-800'>
                            {selectedOrder.customer.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='bg-indigo-600 p-2 rounded-lg shadow-sm'>
                      <Package
                        className='h-5 w-5 text-white'
                        strokeWidth={2.5}
                      />
                    </div>
                    <h3 className='font-semibold text-lg text-slate-800'>
                      Product Details
                    </h3>
                    <div className='flex-1 h-px bg-slate-200'></div>
                  </div>
                  <div className='space-y-4 bg-slate-50 p-6 rounded-lg border border-slate-100'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='bg-white p-4 rounded-lg shadow-sm'>
                        <p className='text-xs text-slate-600 font-semibold uppercase tracking-wider mb-2'>
                          Quantity
                        </p>
                        <p className='text-3xl font-semibold text-slate-800'>
                          {selectedOrder?.productDetails.quantity}
                        </p>
                      </div>
                      <div className='bg-white p-4 rounded-lg shadow-sm'>
                        <p className='text-xs text-slate-600 font-semibold uppercase tracking-wider mb-2'>
                          Unit Price
                        </p>
                        <p className='text-3xl font-semibold text-slate-800'>
                          ৳{selectedOrder?.productDetails.unitPrice}
                        </p>
                      </div>
                    </div>
                    <div className='bg-white p-4 rounded-lg shadow-sm'>
                      <p className='text-xs text-slate-600 font-semibold uppercase tracking-wider mb-2'>
                        Total Price
                      </p>
                      <p className='text-4xl font-semibold text-slate-800'>
                        ৳{selectedOrder?.productDetails.totalPrice}
                      </p>
                    </div>
                    {selectedOrder?.productDetails.discount > 0 && (
                      <div className='bg-emerald-50 p-4 rounded-lg border border-emerald-100'>
                        <p className='text-xs text-emerald-700 font-semibold uppercase tracking-wider mb-2'>
                          Discount Applied
                        </p>
                        <p className='text-2xl font-semibold text-emerald-600'>
                          -৳{selectedOrder.productDetails.discount}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Information */}
                <div>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='bg-amber-600 p-2 rounded-lg shadow-sm'>
                      <ShoppingCart
                        className='h-5 w-5 text-white'
                        strokeWidth={2.5}
                      />
                    </div>
                    <h3 className='font-semibold text-lg text-slate-800'>
                      Order Information
                    </h3>
                    <div className='flex-1 h-px bg-slate-200'></div>
                  </div>
                  <div className='space-y-4 bg-slate-50 p-6 rounded-lg border border-slate-100'>
                    <div className='flex items-center justify-between p-3 bg-white rounded-lg'>
                      <span className='text-sm text-slate-600 font-semibold'>
                        Order Date
                      </span>
                      <span className='text-sm font-semibold text-slate-800'>
                        {selectedOrder &&
                          format(
                            new Date(selectedOrder.orderDate),
                            "MMM dd, yyyy HH:mm",
                          )}
                      </span>
                    </div>
                    <div className='flex items-center justify-between p-3 bg-white rounded-lg'>
                      <span className='text-sm text-slate-600 font-semibold'>
                        Status
                      </span>
                      <StatusBadge status={selectedOrder?.status || ""} />
                    </div>
                    <div className='flex items-center justify-between p-3 bg-white rounded-lg'>
                      <span className='text-sm text-slate-600 font-semibold'>
                        Delivery Status
                      </span>
                      <Badge variant='outline' className='bg-white border border-slate-200'>
                        {selectedOrder?.deliveryStatus}
                      </Badge>
                    </div>
                    <div className='pt-4 border-t border-slate-200'>
                      <div className='flex items-center justify-between'>
                        <span className='text-lg text-slate-700 font-semibold'>
                          Order Total
                        </span>
                        <span className='text-4xl font-semibold text-slate-800'>
                          ৳{selectedOrder?.orderTotal}
                        </span>
                      </div>
                    </div>
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

export default OrderHistoryTab;
