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
  X,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useCustomerAnalytics } from '../hooks/useCustomerAnalytics';
import { showOrderModal } from '../../../utils/orderModal';

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

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!selectedCustomer) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{selectedCustomer.customerName}</DialogTitle>
              <DialogDescription className="mt-1">
                Customer since {safeFormatDate(selectedCustomer.firstOrderDate)}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-xl font-bold">{selectedCustomer.totalOrderCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-xl font-bold">৳{selectedCustomer.totalSpent.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Avg. Order Value</p>
                      <p className="text-xl font-bold">৳{selectedCustomer.averageOrderValue.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="default" className="text-sm">
                      Active
                    </Badge>
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
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{selectedCustomer.customerPhone}</span>
                </div>
                {selectedCustomer.customerEmail && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{selectedCustomer.customerEmail}</span>
                  </div>
                )}
                {selectedCustomer.firstOrderDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      First order: {safeFormatDate(selectedCustomer.firstOrderDate)}
                    </span>
                  </div>
                )}
                {selectedCustomer.lastOrderDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
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
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-lg font-semibold">৳{selectedCustomer.totalOrderAmount?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Paid</p>
                    <p className="text-lg font-semibold text-green-600">৳{selectedCustomer.totalPaid?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Remaining</p>
                    <p className="text-lg font-semibold text-red-600">৳{selectedCustomer.totalRemaining?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Charge</p>
                    <p className="text-lg font-semibold">৳{selectedCustomer.totalDeliveryCharge?.toLocaleString() || 0}</p>
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
                      <TableHeader className="sticky top-0 bg-white border-b z-10">
                        <TableRow className="bg-sidebar">
                          <TableHead>Order #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Total Price</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Paid</TableHead>
                          <TableHead>Remaining</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCustomer.orders.map((order) => (
                          <TableRow key={order.orderNumber} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              <button
                                onClick={() => showOrderModal(order.orderNumber)}
                                className="text-blue-600 hover:underline cursor-pointer font-medium"
                              >
                                #{order.orderNumber}
                              </button>
                            </TableCell>
                            <TableCell>
                              {safeFormatDate(order.orderDate)}
                            </TableCell>
                            <TableCell>৳{order.totalPrice.toLocaleString()}</TableCell>
                            <TableCell>৳{order.discount.toLocaleString()}</TableCell>
                            <TableCell className="text-green-600">
                              ৳{order.paid.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-red-600">
                              ৳{order.remaining.toLocaleString()}
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
                <CardContent className="py-8 text-center text-gray-500">
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
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <CardTitle className="text-lg">Shipping Address</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{selectedCustomer.shippingAddress}</p>
                  {selectedCustomer.shippingDistrict && selectedCustomer.shippingDivision && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedCustomer.shippingDistrict}, {selectedCustomer.shippingDivision}
                    </p>
                  )}
                  {selectedCustomer.fullAddress && (
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedCustomer.fullAddress}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No address information available
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsModal;
