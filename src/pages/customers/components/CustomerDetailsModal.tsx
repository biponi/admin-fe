import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  DollarSign,
  Tag,
  TrendingUp,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { useCustomerAnalytics } from '../hooks/useCustomerAnalytics';
import { showOrderModal } from '../../../utils/orderModal';
import { claude } from '../../../lib/claude';
import { useIsMobile } from '../../../hooks/use-mobile';
import { MobileDetailSheet, MobileSkeletonList } from '../../../components/mobile';
import { PageLoader } from '../../../components/loaders';

interface CustomerDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone: string;
  email?: string;
}

const CustomerDetailsModal = ({
  open,
  onOpenChange,
  phone,
  email,
}: CustomerDetailsModalProps) => {
  const { selectedCustomer, loading, fetchCustomerDetails, setSelectedCustomer } = useCustomerAnalytics();

  useEffect(() => {
    if (open && phone) {
      fetchCustomerDetails(phone, email);
    }
  }, [open, phone, email, fetchCustomerDetails]);

  const handleClose = () => {
    onOpenChange(false);
    setSelectedCustomer(null);
  };

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string | undefined, formatString: string = 'MMM dd, yyyy') => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      // Check if date is invalid
      if (isNaN(date.getTime())) return '-';
      return format(date, formatString);
    } catch {
      return '-';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'default';
      case 'shipped':
        return 'default';
      case 'processing':
        return 'outline';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'returned':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const isMobile = useIsMobile();

  // API may send numerics as strings — coerce before any math/format
  const safeNum = (value: number | string | undefined | null) => {
    const n = Number(value);
    return (Number.isNaN(n) ? 0 : n).toLocaleString();
  };


  if (loading) {
    if (isMobile) {
      return (
        <MobileDetailSheet open={open} onOpenChange={handleClose} title="Customer details">
          <MobileSkeletonList count={4} />
        </MobileDetailSheet>
      );
    }
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#FAF9F6] border-[#E8E4DC]">
          <div className="flex items-center justify-center h-64">
            <PageLoader domain='users' text='Loading Customer' className='h-64 py-0' />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!selectedCustomer) {
    return null;
  }

  const customerContent = (
    <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card className="bg-white border-[#E8E4DC]">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="h-5 w-5 text-[#B85A3D]" />
                    <div>
                      <p className="text-sm text-[#57554D]">Total Orders</p>
                      <p className="text-xl font-bold text-[#141413] tabular-nums">{safeNum(selectedCustomer.totalOrderCount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#E8E4DC]">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-[#B85A3D]" />
                    <div>
                      <p className="text-sm text-[#57554D]">Total Spent</p>
                      <p className="text-xl font-bold text-[#141413] tabular-nums">৳{safeNum(selectedCustomer.totalSpent)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#E8E4DC]">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-[#B85A3D]" />
                    <div>
                      <p className="text-sm text-[#57554D]">Avg. Order Value</p>
                      <p className="text-xl font-bold text-[#141413] tabular-nums">৳{safeNum(selectedCustomer.averageOrderValue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#E8E4DC]">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-5 w-5 text-[#B85A3D]" />
                    <div>
                      <p className="text-sm text-[#57554D]">Total Discount</p>
                      <p className="text-xl font-bold text-[#141413] tabular-nums">৳{safeNum(selectedCustomer.totalDiscount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-[#8A877D]" />
                  <span className="font-medium text-[#141413]">{selectedCustomer.customerPhone}</span>
                </div>
                {selectedCustomer.customerEmail && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-[#8A877D]" />
                    <span className="font-medium text-[#141413]">{selectedCustomer.customerEmail}</span>
                  </div>
                )}
                {selectedCustomer.firstOrderDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-[#8A877D]" />
                    <span className="text-sm text-[#57554D]">
                      First order: {safeFormatDate(selectedCustomer.firstOrderDate)}
                    </span>
                  </div>
                )}
                {selectedCustomer.lastOrderDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-[#8A877D]" />
                    <span className="text-sm text-[#57554D]">
                      Last order: {safeFormatDate(selectedCustomer.lastOrderDate)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-[#57554D]">Total Amount</p>
                    <p className="text-lg font-semibold text-[#141413] tabular-nums">৳{safeNum(selectedCustomer.totalOrderAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#57554D]">Total Paid</p>
                    <p className="text-lg font-semibold text-[#1A7F37] tabular-nums">৳{safeNum(selectedCustomer.totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#57554D]">Total Remaining</p>
                    <p className="text-lg font-semibold text-[#B3365B] tabular-nums">৳{safeNum(selectedCustomer.totalRemaining)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#57554D]">Delivery Charge</p>
                    <p className="text-lg font-semibold text-[#141413] tabular-nums">৳{safeNum(selectedCustomer.totalDeliveryCharge)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="max-h-[500px] overflow-y-auto">
                    <Table divClass="relative">
                      <TableHeader className="sticky top-0 bg-[#FAF9F6] border-b border-[#E8E4DC] z-10">
                        <TableRow className="bg-[#FAF9F6]">
                          <TableHead className={claude.microLabel}>Order #</TableHead>
                          <TableHead className={claude.microLabel}>Date</TableHead>
                          <TableHead className={claude.microLabel}>Total Price</TableHead>
                          <TableHead className={claude.microLabel}>Discount</TableHead>
                          <TableHead className={claude.microLabel}>Paid</TableHead>
                          <TableHead className={claude.microLabel}>Remaining</TableHead>
                          <TableHead className={claude.microLabel}>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCustomer.orders.map((order) => (
                          <TableRow key={order.orderNumber} className="hover:bg-[#F5F1EA]">
                            <TableCell className="font-medium">
                              <button
                                onClick={() => showOrderModal(order.orderNumber)}
                                className="text-[#B85A3D] hover:underline cursor-pointer font-medium"
                              >
                                #{order.orderNumber}
                              </button>
                            </TableCell>
                            <TableCell>
                              {safeFormatDate(order.orderDate)}
                            </TableCell>
                            <TableCell className="tabular-nums">৳{safeNum(order.totalPrice)}</TableCell>
                            <TableCell className="tabular-nums">৳{safeNum(order.discount)}</TableCell>
                            <TableCell className="text-[#1A7F37] tabular-nums">
                              ৳{safeNum(order.paid)}
                            </TableCell>
                            <TableCell className="text-[#B3365B] tabular-nums">
                              ৳{safeNum(order.remaining)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getOrderStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-[#8A877D]">
                  No orders found for this customer
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-4">
            {selectedCustomer.shippingAddress ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-[#8A877D]" />
                    <CardTitle className="text-lg text-[#141413]">Shipping Address</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#141413]">{selectedCustomer.shippingAddress}</p>
                  {selectedCustomer.shippingDistrict && selectedCustomer.shippingDivision && (
                    <p className="text-sm text-[#57554D] mt-1">
                      {selectedCustomer.shippingDistrict}, {selectedCustomer.shippingDivision}
                    </p>
                  )}
                  {selectedCustomer.fullAddress && (
                    <p className="text-xs text-[#8A877D] mt-2">
                      {selectedCustomer.fullAddress}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-[#8A877D]">
                  No address information available
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
  );

  if (isMobile) {
    return (
      <MobileDetailSheet
        open={open}
        onOpenChange={handleClose}
        title={selectedCustomer.customerName}
        description={`Customer since ${safeFormatDate(selectedCustomer.firstOrderDate)}`}
      >
        {customerContent}
      </MobileDetailSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#FAF9F6] border-[#E8E4DC]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl text-[#141413]">{selectedCustomer.customerName}</DialogTitle>
              <DialogDescription className="mt-1 text-[#57554D]">
                Customer since {safeFormatDate(selectedCustomer.firstOrderDate)}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {customerContent}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsModal;
