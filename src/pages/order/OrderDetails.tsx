import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Separator } from "../../components/ui/separator";
import MainView from "../../coreComponents/mainView";
import { ArrowLeft, RefreshCw, Package, User, MapPin, Phone, Mail, DollarSign, CreditCard, Truck, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { getOrderDetails } from "../../api/order";
import { IOrder } from "./interface";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { useToast } from "../../components/ui/use-toast";
import { format } from "date-fns";
import DefaultLoading from "../../coreComponents/defaultLoading";
import { Alert, AlertDescription } from "../../components/ui/alert";

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasRequiredPermission } = useRoleCheck();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  const fetchOrderData = async () => {
    if (!orderId) return;

    try {
      const response = await getOrderDetails(orderId);
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error || "Failed to fetch order details",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch order details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrderData();
    setRefreshing(false);
    toast({
      title: "Success",
      description: "Order data refreshed",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary";
      case "confirmed":
        return "default";
      case "processing":
        return "outline";
      case "shipped":
        return "default";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      case "returned":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "returned":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "low":
        return "default";
      case "medium":
        return "secondary";
      case "high":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return <DefaultLoading title="Loading Order Details..." />;
  }

  if (!order) {
    return (
      <MainView title="Order Not Found">
        <div className="flex flex-col items-center justify-center h-96">
          <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-6">The order youre looking for doesnt exist.</p>
          <Button onClick={() => navigate("/order")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </MainView>
    );
  }

  return (
    <MainView title={`Order #${order.orderNumber}`}>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate("/order")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Order Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <CardTitle className="text-2xl">Order #{order.orderNumber}</CardTitle>
                <Badge variant={getStatusColor(order.status)} className="text-sm">
                  {getStatusIcon(order.status)}
                  <span className="ml-1">{order.status}</span>
                </Badge>
                {order.isReturn && (
                  <Badge variant="destructive" className="text-sm">
                    Returned
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {format(new Date(order.timestamps.createdAt), "MMM dd, yyyy HH:mm")}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 text-sm">
              <span>ID: {order.id}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Created by: {order.orderCreatedBy}</span>
              {order.courier?.provider && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span>Courier: {order.courier.provider}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fraud Detection Warning */}
        {order.requiresManualReview && order.fraudFlags && order.fraudFlags.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Fraud Detection Alert:</strong> This order requires manual review.
              Risk Level:{" "}
              <Badge variant={getRiskLevelColor(order.customerRiskLevel)} className="ml-1">
                {order.customerRiskLevel}
              </Badge>
              {" "}(Score: {order.customerRiskScore})
              <ul className="mt-2 list-disc list-inside">
                {order.fraudFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <User className="mr-2 h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <User className="mr-3 h-4 w-4 text-gray-500" />
                    <span className="font-medium">{order.customer.name}</span>
                  </div>
                  {order.customer.phoneNumber && (
                    <div className="flex items-center">
                      <Phone className="mr-3 h-4 w-4 text-gray-500" />
                      <span>{order.customer.phoneNumber}</span>
                    </div>
                  )}
                  {order.customer.email && (
                    <div className="flex items-center">
                      <Mail className="mr-3 h-4 w-4 text-gray-500" />
                      <span>{order.customer.email}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <MapPin className="mr-2 h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Division</p>
                    <p className="font-medium">{order.shipping.division}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">District</p>
                    <p className="font-medium">{order.shipping.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{order.shipping.address}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Courier & Delivery */}
              {order.courier && (order.courier.provider || order.courier.trackingCode || order.courier.consignmentId) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Truck className="mr-2 h-5 w-5" />
                      Courier Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.courier.provider && (
                      <div>
                        <p className="text-sm text-gray-500">Provider</p>
                        <p className="font-medium">{order.courier.provider}</p>
                      </div>
                    )}
                    {order.courier.consignmentId && (
                      <div>
                        <p className="text-sm text-gray-500">Consignment ID</p>
                        <p className="font-medium">{order.courier.consignmentId}</p>
                      </div>
                    )}
                    {order.courier.trackingCode && (
                      <div>
                        <p className="text-sm text-gray-500">Tracking Code</p>
                        <p className="font-medium">{order.courier.trackingCode}</p>
                      </div>
                    )}
                    {order.estimatedDeliveryDate && (
                      <div>
                        <p className="text-sm text-gray-500">Estimated Delivery</p>
                        <p className="font-medium">
                          {format(new Date(order.estimatedDeliveryDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Order Notes */}
              {order.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{order.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Variations</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.products.map((product, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {product.thumbnail && (
                              <img
                                src={product.thumbnail}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded border"
                              />
                            )}
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-500">ID: {product.productId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.hasVariation && product.variation ? (
                            <div className="text-sm">
                              {product.variation.size && (
                                <p>Size: {product.variation.size}</p>
                              )}
                              {product.variation.color && (
                                <p>Color: {product.variation.color}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          ৳{product.unitPrice.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right font-medium">
                          ৳{product.totalPrice.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pricing Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Pricing Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">৳{order.totalPrice.toLocaleString()}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-৳{order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Charge</span>
                    <span className="font-medium">৳{order.deliveryCharge.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>৳{(order.totalPrice - order.discount + order.deliveryCharge).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-medium">৳{(order.totalPrice - order.discount + order.deliveryCharge).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Paid</span>
                    <span className="font-medium">৳{order.paid.toLocaleString()}</span>
                  </div>
                  {order.remaining > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Remaining</span>
                      <span className="font-medium">৳{order.remaining.toLocaleString()}</span>
                    </div>
                  )}
                  {order.remaining === 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Status</span>
                      <Badge className="ml-auto">Fully Paid</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment History */}
            {order.payment && order.payment.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Paid By</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Transaction ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.payment.map((payment, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            {payment.date
                              ? format(new Date(payment.date), "MMM dd, yyyy HH:mm")
                              : "-"}
                          </TableCell>
                          <TableCell>{payment.paymentType || "-"}</TableCell>
                          <TableCell>{payment.paymentBy || "-"}</TableCell>
                          <TableCell>৳{payment.amount?.toLocaleString() || 0}</TableCell>
                          <TableCell>{payment.transectionId || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="mr-2 h-5 w-5" />
                  Order Status Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-500">Order Created</p>
                      <p className="font-medium">{format(new Date(order.timestamps.createdAt), "MMM dd, yyyy HH:mm")}</p>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                  {order.timestamps.updatedAt && (
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="font-medium">{format(new Date(order.timestamps.updatedAt), "MMM dd, yyyy HH:mm")}</p>
                      </div>
                      <Badge variant="outline">Updated</Badge>
                    </div>
                  )}
                  {order.courier?.createdAt && (
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div>
                        <p className="text-sm text-gray-500">Courier Assigned</p>
                        <p className="font-medium">{format(new Date(order.courier.createdAt), "MMM dd, yyyy HH:mm")}</p>
                      </div>
                      <Badge variant="outline">Processed</Badge>
                    </div>
                  )}
                  {order.isReturn && order.returnedAt && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Order Returned</p>
                        <p className="font-medium">{format(new Date(order.returnedAt), "MMM dd, yyyy HH:mm")}</p>
                      </div>
                      <Badge variant="destructive">Returned</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Timeline */}
            {order.deliveryTimeline && order.deliveryTimeline.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.deliveryTimeline.map((event, idx) => (
                      <div key={idx} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                        <div className={`rounded-full p-2 ${
                          event.status === "delivered" ? "bg-green-100" : "bg-blue-100"
                        }`}>
                          <Truck className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{event.status}</p>
                          {event.remarks && (
                            <p className="text-sm text-gray-500">{event.remarks}</p>
                          )}
                          {event.timestamp && (
                            <p className="text-xs text-gray-400 mt-1">
                              {format(new Date(event.timestamp), "MMM dd, yyyy HH:mm")}
                            </p>
                          )}
                        </div>
                        {event.location && (
                          <Badge variant="outline">{event.location}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit" className="space-y-6">
            {/* Fraud Detection Details */}
            {order.fraudDetection && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Fraud Detection Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Risk Level</p>
                      <Badge variant={getRiskLevelColor(order.customerRiskLevel)} className="mt-1">
                        {order.customerRiskLevel}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Risk Score</p>
                      <p className="font-medium mt-1">{order.customerRiskScore}/100</p>
                    </div>
                  </div>
                  {order.fraudFlags && order.fraudFlags.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Flags</p>
                      <div className="space-y-1">
                        {order.fraudFlags.map((flag, idx) => (
                          <Badge key={idx} variant="destructive" className="mr-2">
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Return Information */}
            {order.isReturn && (
              <Card>
                <CardHeader>
                  <CardTitle>Return Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.returnReason && (
                    <div>
                      <p className="text-sm text-gray-500">Return Reason</p>
                      <p className="font-medium">{order.returnReason}</p>
                    </div>
                  )}
                  {order.returnReasonDetails && (
                    <div>
                      <p className="text-sm text-gray-500">Details</p>
                      <p className="font-medium">{order.returnReasonDetails}</p>
                    </div>
                  )}
                  {order.returnedAt && (
                    <div>
                      <p className="text-sm text-gray-500">Returned At</p>
                      <p className="font-medium">
                        {format(new Date(order.returnedAt), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium">
                      {format(new Date(order.timestamps.createdAt), "MMM dd, yyyy HH:mm:ss")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Updated At</p>
                    <p className="font-medium">
                      {format(new Date(order.timestamps.updatedAt), "MMM dd, yyyy HH:mm:ss")}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-mono text-sm">{order.id || order._id}</p>
                </div>
                {order.active !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={order.active ? "default" : "secondary"}>
                      {order.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainView>
  );
};

export default OrderDetails;
