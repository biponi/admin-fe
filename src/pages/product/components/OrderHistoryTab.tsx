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
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Hash,
} from "lucide-react";
import { useProductAnalytics } from "../hooks/useProductAnalytics";
import { format } from "date-fns";
import { showOrderModal } from "../../../utils/orderModal";

interface OrderHistoryTabProps {
  productId: string;
}

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
    fetchOrderHistory({ page: 1, limit: 20 });
  };

  const handleOrderClick = (order: any) => {
    showOrderModal(order.orderNumber);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md shadow-green-200";
      case "pending":
        return "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md shadow-amber-200";
      case "processing":
        return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-md shadow-blue-200";
      case "cancelled":
        return "bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-md shadow-red-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  if (loading && !orderHistory) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='relative w-16 h-16 mx-auto mb-4'>
            <div className='absolute inset-0 rounded-full border-4 border-blue-100'></div>
            <div className='absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin'></div>
          </div>
          <p className='text-sm font-medium text-gray-600'>
            Loading order history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='group relative overflow-hidden border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity'></div>
          <CardContent className='pt-6 relative'>
            <div className='flex items-start justify-between'>
              <div className='space-y-2'>
                <p className='text-xs text-blue-600 font-bold uppercase tracking-wider flex items-center gap-2'>
                  <span className='w-6 h-0.5 bg-blue-400'></span>
                  Total Orders
                </p>
                <p className='text-3xl font-black text-blue-700'>
                  {orderHistory?.summary.totalOrders || 0}
                </p>
                <p className='text-xs text-blue-600/70 font-medium'>all time</p>
              </div>
              <div className='bg-gradient-to-br from-blue-400 to-indigo-500 p-3 rounded-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300'>
                <ShoppingCart
                  className='h-6 w-6 text-white'
                  strokeWidth={2.5}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='group relative overflow-hidden border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity'></div>
          <CardContent className='pt-6 relative'>
            <div className='flex items-start justify-between'>
              <div className='space-y-2'>
                <p className='text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-2'>
                  <span className='w-6 h-0.5 bg-emerald-400'></span>
                  Total Revenue
                </p>
                <p className='text-3xl font-black text-emerald-700'>
                  ৳{orderHistory?.summary.totalRevenue?.toLocaleString() || 0}
                </p>
                <p className='text-xs text-emerald-600/70 font-medium'>
                  earned
                </p>
              </div>
              <div className='bg-gradient-to-br from-emerald-400 to-green-500 p-3 rounded-xl shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-300'>
                <DollarSign className='h-6 w-6 text-white' strokeWidth={2.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='group relative overflow-hidden border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity'></div>
          <CardContent className='pt-6 relative'>
            <div className='flex items-start justify-between'>
              <div className='space-y-2'>
                <p className='text-xs text-purple-600 font-bold uppercase tracking-wider flex items-center gap-2'>
                  <span className='w-6 h-0.5 bg-purple-400'></span>
                  Quantity Sold
                </p>
                <p className='text-3xl font-black text-purple-700'>
                  {orderHistory?.summary.totalQuantitySold?.toLocaleString() ||
                    0}
                </p>
                <p className='text-xs text-purple-600/70 font-medium'>units</p>
              </div>
              <div className='bg-gradient-to-br from-purple-400 to-fuchsia-500 p-3 rounded-xl shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300'>
                <Package className='h-6 w-6 text-white' strokeWidth={2.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='group relative overflow-hidden border-2 border-orange-100 hover:border-orange-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity'></div>
          <CardContent className='pt-6 relative'>
            <div className='flex items-start justify-between'>
              <div className='space-y-2'>
                <p className='text-xs text-orange-600 font-bold uppercase tracking-wider flex items-center gap-2'>
                  <span className='w-6 h-0.5 bg-orange-400'></span>
                  Avg Order Value
                </p>
                <p className='text-3xl font-black text-orange-700'>
                  ৳
                  {typeof orderHistory?.summary.averageOrderValue === "number"
                    ? orderHistory.summary.averageOrderValue.toFixed(0)
                    : orderHistory?.summary.averageOrderValue || 0}
                </p>
                <p className='text-xs text-orange-600/70 font-medium'>
                  per order
                </p>
              </div>
              <div className='bg-gradient-to-br from-orange-400 to-amber-500 p-3 rounded-xl shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform duration-300'>
                <TrendingUp className='h-6 w-6 text-white' strokeWidth={2.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card className='border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300'>
        <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'></div>
        <CardHeader className='bg-gradient-to-r from-slate-50 to-gray-50'>
          <CardTitle className='flex items-center text-lg font-bold text-gray-800'>
            <div className='bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md mr-3'>
              <Filter className='h-5 w-5 text-white' strokeWidth={2.5} />
            </div>
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-gray-500' />
                Start Date
              </label>
              <Input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='border-2 border-gray-200 focus:border-blue-400 transition-colors'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-gray-500' />
                End Date
              </label>
              <Input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='border-2 border-gray-200 focus:border-blue-400 transition-colors'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-semibold text-gray-700'>
                Status
              </label>
              <Select
                value={statusFilter || "all"}
                onValueChange={setStatusFilter}>
                <SelectTrigger className='border-2 border-gray-200 focus:border-blue-400'>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Statuses</SelectItem>
                  <SelectItem value='completed'>Completed</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='processing'>Processing</SelectItem>
                  <SelectItem value='cancelled'>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-end space-x-2'>
              <Button
                onClick={handleFilter}
                className='flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all duration-300'>
                Apply Filters
              </Button>
              <Button
                onClick={handleReset}
                variant='outline'
                className='border-2 hover:bg-gray-50'>
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List - Desktop Table / Mobile Cards */}
      {isMobile ? (
        <div className='space-y-4'>
          {orderHistory?.orders?.map((order) => (
            <Card
              key={order.orderId}
              className='group relative overflow-hidden border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg cursor-pointer'
              onClick={() => handleOrderClick(order)}>
              <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
              <CardContent className='p-4'>
                <div className='space-y-4'>
                  {/* Header */}
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <Hash className='h-4 w-4 text-gray-400' />
                        <span className='font-bold text-blue-600'>
                          #{order.orderNumber}
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-xs text-gray-500'>
                        <Calendar className='h-3 w-3' />
                        {format(new Date(order.orderDate), "MMM dd, yyyy")}
                      </div>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>

                  {/* Product Variant */}
                  {order.productDetails.variation && (
                    <div className='flex items-center gap-2 text-sm bg-purple-50 px-3 py-2 rounded-lg border border-purple-100'>
                      <Package className='h-4 w-4 text-purple-600' />
                      <span className='text-purple-700 font-medium'>
                        {order.productDetails.variation.color && (
                          <span>{order.productDetails.variation.color}</span>
                        )}
                        {order.productDetails.variation.color &&
                          order.productDetails.variation.size && (
                            <span> • </span>
                          )}
                        {order.productDetails.variation.size && (
                          <span>{order.productDetails.variation.size}</span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100'>
                      <p className='text-xs text-blue-600 font-semibold mb-1'>
                        Quantity
                      </p>
                      <p className='text-lg font-black text-blue-700'>
                        {order.productDetails.quantity}
                      </p>
                    </div>
                    <div className='bg-gradient-to-br from-emerald-50 to-green-50 p-3 rounded-xl border border-emerald-100'>
                      <p className='text-xs text-emerald-600 font-semibold mb-1'>
                        Total Price
                      </p>
                      <p className='text-lg font-black text-emerald-700'>
                        ৳{order.productDetails.totalPrice?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Discount if exists */}
                  {order.productDetails.discount > 0 && (
                    <div className='flex items-center justify-between text-sm bg-green-50 px-3 py-2 rounded-lg border border-green-100'>
                      <span className='text-green-700 font-medium'>
                        Discount Applied
                      </span>
                      <span className='text-green-600 font-bold'>
                        -৳{order.productDetails.discount}
                      </span>
                    </div>
                  )}

                  {/* View Details */}
                  <div className='flex items-center justify-end text-sm text-blue-600 font-medium pt-2 border-t'>
                    <span>View Details</span>
                    <ChevronRight className='h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform' />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!orderHistory?.orders || orderHistory.orders.length === 0) && (
            <Card className='border-2 border-dashed border-gray-200'>
              <CardContent className='py-12 text-center'>
                <div className='bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <ShoppingCart className='h-8 w-8 text-gray-400' />
                </div>
                <p className='text-gray-500 font-medium'>No orders found</p>
                <p className='text-sm text-gray-400 mt-1'>
                  Try adjusting your filters
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className='border-2 border-gray-100 shadow-lg overflow-hidden'>
          <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'></div>
          <CardContent className='p-0'>
            <div className='max-h-[600px] overflow-y-auto'>
              <Table divClass='relative'>
                <TableHeader className='sticky top-0 bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 z-10 shadow-sm'>
                  <TableRow>
                    <TableHead className='font-bold text-gray-700'>
                      Order Number
                    </TableHead>
                    <TableHead className='font-bold text-gray-700'>
                      Product Variant
                    </TableHead>
                    <TableHead className='text-right font-bold text-gray-700'>
                      Quantity
                    </TableHead>
                    <TableHead className='text-right font-bold text-gray-700'>
                      Discount
                    </TableHead>
                    <TableHead className='text-right font-bold text-gray-700'>
                      Price
                    </TableHead>
                    <TableHead className='font-bold text-gray-700'>
                      Status
                    </TableHead>
                    <TableHead className='font-bold text-gray-700'>
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderHistory?.orders?.map((order) => (
                    <TableRow
                      key={order.orderId}
                      className='cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors duration-200 border-b border-gray-100'
                      onClick={() => handleOrderClick(order)}>
                      <TableCell className='font-bold text-blue-600 hover:text-blue-700'>
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell>
                        {order.productDetails.variation ? (
                          <Badge
                            variant='outline'
                            className='bg-purple-50 text-purple-700 border-purple-200 font-medium'>
                            {order.productDetails.variation.color && (
                              <span>
                                {order.productDetails.variation.color}
                              </span>
                            )}
                            {order.productDetails.variation.color &&
                              order.productDetails.variation.size && (
                                <span> • </span>
                              )}
                            {order.productDetails.variation.size && (
                              <span>{order.productDetails.variation.size}</span>
                            )}
                          </Badge>
                        ) : (
                          <span className='text-gray-400 text-sm'>N/A</span>
                        )}
                      </TableCell>
                      <TableCell className='text-right font-semibold text-gray-700'>
                        {order.productDetails.quantity}
                      </TableCell>
                      <TableCell className='text-right'>
                        {order.productDetails.discount > 0 ? (
                          <span className='font-semibold text-green-600'>
                            -৳{order.productDetails.discount}
                          </span>
                        ) : (
                          <span className='text-gray-400'>-</span>
                        )}
                      </TableCell>
                      <TableCell className='text-right font-bold text-gray-800'>
                        ৳{order.productDetails.totalPrice?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-gray-600 font-medium'>
                        {format(new Date(order.orderDate), "MMM dd, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!orderHistory?.orders ||
                    orderHistory.orders.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center py-12'>
                        <div className='bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                          <ShoppingCart className='h-8 w-8 text-gray-400' />
                        </div>
                        <p className='text-gray-500 font-medium'>
                          No orders found
                        </p>
                        <p className='text-sm text-gray-400 mt-1'>
                          Try adjusting your filters
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className='border-t-2 bg-gradient-to-r from-slate-50 to-gray-50 p-4'>
              <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                <div className='text-sm text-gray-600 font-medium'>
                  Showing{" "}
                  <span className='font-bold text-gray-800'>
                    {((orderHistory?.pagination.currentPage || 1) - 1) *
                      (orderParams.limit || 20) +
                      1}
                  </span>
                  -
                  <span className='font-bold text-gray-800'>
                    {Math.min(
                      (orderHistory?.pagination.currentPage || 1) *
                        (orderParams.limit || 20),
                      orderHistory?.pagination.totalItems || 0,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className='font-bold text-gray-800'>
                    {orderHistory?.pagination.totalItems || 0}
                  </span>{" "}
                  orders
                </div>
                <div className='flex items-center space-x-2'>
                  <Select
                    value={`${orderParams.limit}`}
                    onValueChange={(value) =>
                      fetchOrderHistory({ limit: Number(value), page: 1 })
                    }>
                    <SelectTrigger className='w-20 border-2'>
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
                    disabled={!orderHistory?.pagination.hasPreviousPage}
                    onClick={() =>
                      fetchOrderHistory({ page: (orderParams.page || 1) - 1 })
                    }
                    className='border-2'>
                    Previous
                  </Button>
                  <span className='text-sm font-semibold px-3 py-1 bg-white rounded-lg border-2'>
                    {orderHistory?.pagination.currentPage} /{" "}
                    {orderHistory?.pagination.totalPages}
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={!orderHistory?.pagination.hasNextPage}
                    onClick={() =>
                      fetchOrderHistory({ page: (orderParams.page || 1) + 1 })
                    }
                    className='border-2'>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Details Sheet (Desktop) / Drawer (Mobile) */}
      {isMobile ? (
        <Drawer open={showDetails} onOpenChange={setShowDetails}>
          <DrawerContent className='max-h-[85vh]'>
            <DrawerHeader className='border-b bg-gradient-to-r from-slate-50 to-gray-50'>
              <DrawerTitle className='flex items-center gap-2 text-xl'>
                <div className='bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg'>
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
                    <div className='bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-lg'>
                      <User className='h-4 w-4 text-white' />
                    </div>
                    <h3 className='font-bold text-gray-800'>
                      Customer Information
                    </h3>
                  </div>
                  <div className='space-y-3 bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-100'>
                    <div className='flex items-start gap-3'>
                      <User className='h-4 w-4 text-purple-600 mt-0.5' />
                      <div>
                        <p className='text-xs text-purple-600 font-semibold'>
                          Name
                        </p>
                        <p className='text-sm font-medium text-gray-800'>
                          {selectedOrder?.customer.name}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3'>
                      <Mail className='h-4 w-4 text-purple-600 mt-0.5' />
                      <div>
                        <p className='text-xs text-purple-600 font-semibold'>
                          Email
                        </p>
                        <p className='text-sm font-medium text-gray-800'>
                          {selectedOrder?.customer.email}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3'>
                      <Phone className='h-4 w-4 text-purple-600 mt-0.5' />
                      <div>
                        <p className='text-xs text-purple-600 font-semibold'>
                          Phone
                        </p>
                        <p className='text-sm font-medium text-gray-800'>
                          {selectedOrder?.customer.phoneNumber}
                        </p>
                      </div>
                    </div>
                    {selectedOrder?.customer.address && (
                      <div className='flex items-start gap-3'>
                        <MapPin className='h-4 w-4 text-purple-600 mt-0.5' />
                        <div>
                          <p className='text-xs text-purple-600 font-semibold'>
                            Address
                          </p>
                          <p className='text-sm font-medium text-gray-800'>
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
                    <div className='bg-gradient-to-r from-blue-500 to-indigo-500 p-1.5 rounded-lg'>
                      <Package className='h-4 w-4 text-white' />
                    </div>
                    <h3 className='font-bold text-gray-800'>Product Details</h3>
                  </div>
                  <div className='space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-100'>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='bg-white p-3 rounded-lg'>
                        <p className='text-xs text-blue-600 font-semibold mb-1'>
                          Quantity
                        </p>
                        <p className='text-lg font-black text-blue-700'>
                          {selectedOrder?.productDetails.quantity}
                        </p>
                      </div>
                      <div className='bg-white p-3 rounded-lg'>
                        <p className='text-xs text-emerald-600 font-semibold mb-1'>
                          Unit Price
                        </p>
                        <p className='text-lg font-black text-emerald-700'>
                          ৳{selectedOrder?.productDetails.unitPrice}
                        </p>
                      </div>
                    </div>
                    <div className='bg-white p-3 rounded-lg'>
                      <p className='text-xs text-gray-600 font-semibold mb-1'>
                        Total Price
                      </p>
                      <p className='text-2xl font-black text-gray-800'>
                        ৳{selectedOrder?.productDetails.totalPrice}
                      </p>
                    </div>
                    {selectedOrder?.productDetails.discount > 0 && (
                      <div className='bg-green-100 p-3 rounded-lg border border-green-200'>
                        <p className='text-xs text-green-700 font-semibold mb-1'>
                          Discount Applied
                        </p>
                        <p className='text-lg font-bold text-green-600'>
                          -৳{selectedOrder.productDetails.discount}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Information */}
                <div>
                  <div className='flex items-center gap-2 mb-3'>
                    <div className='bg-gradient-to-r from-orange-500 to-amber-500 p-1.5 rounded-lg'>
                      <ShoppingCart className='h-4 w-4 text-white' />
                    </div>
                    <h3 className='font-bold text-gray-800'>
                      Order Information
                    </h3>
                  </div>
                  <div className='space-y-3 bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border-2 border-orange-100'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-orange-700 font-semibold'>
                        Order Date
                      </span>
                      <span className='text-sm font-medium text-gray-800'>
                        {selectedOrder &&
                          format(
                            new Date(selectedOrder.orderDate),
                            "MMM dd, yyyy HH:mm",
                          )}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-orange-700 font-semibold'>
                        Status
                      </span>
                      <Badge
                        className={getStatusColor(selectedOrder?.status || "")}>
                        {selectedOrder?.status}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-orange-700 font-semibold'>
                        Delivery Status
                      </span>
                      <Badge variant='outline' className='bg-white'>
                        {selectedOrder?.deliveryStatus}
                      </Badge>
                    </div>
                    <div className='pt-3 border-t-2 border-orange-200'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-orange-700 font-bold'>
                          Order Total
                        </span>
                        <span className='text-2xl font-black text-orange-700'>
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
            <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'></div>
            <SheetHeader className='border-b pb-4 bg-gradient-to-r from-slate-50 to-gray-50 -mx-6 px-6 pt-6'>
              <SheetTitle className='flex items-center gap-3 text-2xl'>
                <div className='bg-gradient-to-r from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg'>
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
                    <div className='bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg shadow-md'>
                      <User className='h-5 w-5 text-white' strokeWidth={2.5} />
                    </div>
                    <h3 className='font-bold text-lg text-gray-800'>
                      Customer Information
                    </h3>
                    <div className='flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent'></div>
                  </div>
                  <div className='space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-100'>
                    <div className='flex items-start gap-4'>
                      <div className='bg-purple-200 p-2 rounded-lg'>
                        <User className='h-5 w-5 text-purple-700' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-xs text-purple-600 font-bold uppercase tracking-wider mb-1'>
                          Name
                        </p>
                        <p className='text-base font-semibold text-gray-800'>
                          {selectedOrder?.customer.name}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-4'>
                      <div className='bg-purple-200 p-2 rounded-lg'>
                        <Mail className='h-5 w-5 text-purple-700' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-xs text-purple-600 font-bold uppercase tracking-wider mb-1'>
                          Email
                        </p>
                        <p className='text-base font-semibold text-gray-800'>
                          {selectedOrder?.customer.email}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-4'>
                      <div className='bg-purple-200 p-2 rounded-lg'>
                        <Phone className='h-5 w-5 text-purple-700' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-xs text-purple-600 font-bold uppercase tracking-wider mb-1'>
                          Phone
                        </p>
                        <p className='text-base font-semibold text-gray-800'>
                          {selectedOrder?.customer.phoneNumber}
                        </p>
                      </div>
                    </div>
                    {selectedOrder?.customer.address && (
                      <div className='flex items-start gap-4'>
                        <div className='bg-purple-200 p-2 rounded-lg'>
                          <MapPin className='h-5 w-5 text-purple-700' />
                        </div>
                        <div className='flex-1'>
                          <p className='text-xs text-purple-600 font-bold uppercase tracking-wider mb-1'>
                            Address
                          </p>
                          <p className='text-base font-semibold text-gray-800'>
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
                    <div className='bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg shadow-md'>
                      <Package
                        className='h-5 w-5 text-white'
                        strokeWidth={2.5}
                      />
                    </div>
                    <h3 className='font-bold text-lg text-gray-800'>
                      Product Details
                    </h3>
                    <div className='flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent'></div>
                  </div>
                  <div className='space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='bg-white p-4 rounded-xl shadow-sm'>
                        <p className='text-xs text-blue-600 font-bold uppercase tracking-wider mb-2'>
                          Quantity
                        </p>
                        <p className='text-3xl font-black text-blue-700'>
                          {selectedOrder?.productDetails.quantity}
                        </p>
                      </div>
                      <div className='bg-white p-4 rounded-xl shadow-sm'>
                        <p className='text-xs text-emerald-600 font-bold uppercase tracking-wider mb-2'>
                          Unit Price
                        </p>
                        <p className='text-3xl font-black text-emerald-700'>
                          ৳{selectedOrder?.productDetails.unitPrice}
                        </p>
                      </div>
                    </div>
                    <div className='bg-white p-4 rounded-xl shadow-sm'>
                      <p className='text-xs text-gray-600 font-bold uppercase tracking-wider mb-2'>
                        Total Price
                      </p>
                      <p className='text-4xl font-black text-gray-800'>
                        ৳{selectedOrder?.productDetails.totalPrice}
                      </p>
                    </div>
                    {selectedOrder?.productDetails.discount > 0 && (
                      <div className='bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-xl border-2 border-green-200'>
                        <p className='text-xs text-green-700 font-bold uppercase tracking-wider mb-2'>
                          Discount Applied
                        </p>
                        <p className='text-2xl font-black text-green-600'>
                          -৳{selectedOrder.productDetails.discount}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Information */}
                <div>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='bg-gradient-to-r from-orange-500 to-amber-500 p-2 rounded-lg shadow-md'>
                      <ShoppingCart
                        className='h-5 w-5 text-white'
                        strokeWidth={2.5}
                      />
                    </div>
                    <h3 className='font-bold text-lg text-gray-800'>
                      Order Information
                    </h3>
                    <div className='flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent'></div>
                  </div>
                  <div className='space-y-4 bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border-2 border-orange-100'>
                    <div className='flex items-center justify-between p-3 bg-white rounded-xl'>
                      <span className='text-sm text-orange-700 font-bold'>
                        Order Date
                      </span>
                      <span className='text-sm font-semibold text-gray-800'>
                        {selectedOrder &&
                          format(
                            new Date(selectedOrder.orderDate),
                            "MMM dd, yyyy HH:mm",
                          )}
                      </span>
                    </div>
                    <div className='flex items-center justify-between p-3 bg-white rounded-xl'>
                      <span className='text-sm text-orange-700 font-bold'>
                        Status
                      </span>
                      <Badge
                        className={getStatusColor(selectedOrder?.status || "")}>
                        {selectedOrder?.status}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between p-3 bg-white rounded-xl'>
                      <span className='text-sm text-orange-700 font-bold'>
                        Delivery Status
                      </span>
                      <Badge variant='outline' className='bg-white border-2'>
                        {selectedOrder?.deliveryStatus}
                      </Badge>
                    </div>
                    <div className='pt-4 border-t-2 border-orange-200'>
                      <div className='flex items-center justify-between'>
                        <span className='text-lg text-orange-700 font-black'>
                          Order Total
                        </span>
                        <span className='text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'>
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
