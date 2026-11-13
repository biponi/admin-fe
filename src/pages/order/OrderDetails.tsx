import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/PageHeader";
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
import {
  ArrowLeft,
  FileText,
  RefreshCw,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  CreditCard,
  Truck,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { getOrderDetails } from "../../api/order";
import RiskBadge from "../../components/fraud/RiskBadge";
import BlockedBadge from "../../components/fraud/BlockedBadge";
import { IOrder } from "./interface";
import { useToast } from "../../components/ui/use-toast";
import { format } from "date-fns";
import DefaultLoading from "../../coreComponents/defaultLoading";
import { Alert, AlertDescription } from "../../components/ui/alert";
import {
  MobilePage,
  MobileListCard,
  MobileSkeletonList,
  rippleProps,
} from "../../components/mobile";
import { useIsMobile } from "../../hooks/use-mobile";

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        return <Clock className='h-4 w-4' />;
      case "confirmed":
        return <CheckCircle className='h-4 w-4' />;
      case "processing":
        return <Package className='h-4 w-4' />;
      case "shipped":
        return <Truck className='h-4 w-4' />;
      case "delivered":
        return <CheckCircle className='h-4 w-4' />;
      case "cancelled":
        return <XCircle className='h-4 w-4' />;
      case "returned":
        return <AlertCircle className='h-4 w-4' />;
      default:
        return <AlertCircle className='h-4 w-4' />;
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case "green":
        return "default";
      case "yellow":
        return "secondary";
      case "red":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    if (isMobile) {
      return (
        <div className='p-3'>
          <MobileSkeletonList count={5} />
        </div>
      );
    }
    return <DefaultLoading title='Loading Order Details...' />;
  }

  if (!order) {
    return (
      <MainView title='Order Not Found'>
        <div className='flex flex-col items-center justify-center h-96'>
          <AlertCircle className='h-16 w-16 text-gray-400 mb-4' />
          <h2 className='text-2xl font-semibold mb-2'>Order Not Found</h2>
          <p className='text-gray-500 mb-6'>
            The order youre looking for doesnt exist.
          </p>
          <Button onClick={() => navigate("/order")}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Orders
          </Button>
        </div>
      </MainView>
    );
  }

  /* ────────────────────────────────────────────────────────────────────────
     Mobile (Material) presentation — the desktop tree below is untouched.
     ──────────────────────────────────────────────────────────────────────── */
  if (isMobile) {
    const pricingTotal =
      order.totalPrice - order.discount + order.deliveryCharge;

    return (
      <MobilePage
        title={`Order #${order.orderNumber}`}
        icon={<FileText className='h-5 w-5 text-primary' />}
        subtitle={`${order.status} · ${format(
          new Date(order.timestamps.createdAt),
          "MMM dd, yyyy HH:mm",
        )}`}
        back
        onBack={() => navigate("/order")}
        actions={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label='Refresh order'
            className='m3-ripple grid h-10 w-10 place-items-center rounded-full active:bg-muted disabled:opacity-50'
            {...rippleProps()}>
            <RefreshCw
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        }>
        <div className='px-3 pt-3 pb-4 space-y-3'>
          {/* Order summary */}
          <div className='rounded-2xl border bg-card px-4 py-3.5 space-y-2'>
            <div className='flex items-start justify-between gap-2'>
              <p className='text-lg font-semibold tracking-tight leading-tight'>
                Order #{order.orderNumber}
              </p>
              <div className='flex flex-col items-end gap-1'>
                <Badge
                  variant={getStatusColor(order.status)}
                  className='gap-1 text-xs'>
                  {getStatusIcon(order.status)}
                  <span>{order.status}</span>
                </Badge>
                {order.isReturn && (
                  <Badge variant='destructive' className='text-xs'>
                    Returned
                  </Badge>
                )}
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>
              {format(new Date(order.timestamps.createdAt), "MMM dd, yyyy HH:mm")}
            </p>
            <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
              <span>ID: {order.id}</span>
              <span>Created by: {order.orderCreatedBy}</span>
              {order.courier?.provider && <span>Courier: {order.courier.provider}</span>}
            </div>
          </div>

          {/* Blocked customer banner */}
          {order.fraudDetection?.blocked && (
            <Alert className='border-rose-600 bg-rose-600 text-white'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                <strong>Customer blocked:</strong> this customer is in the fraud
                group — new orders for them will be rejected.
                {order.fraudDetection.lastAnalyzedAt
                  ? ` Risk level: ${order.fraudDetection.riskLevel} (score ${order.fraudDetection.riskScore}).`
                  : null}
              </AlertDescription>
            </Alert>
          )}

          {/* Fraud detection warning */}
          {order.requiresManualReview &&
            order.fraudFlags &&
            order.fraudFlags.length > 0 && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>
                  <strong>Fraud Detection Alert:</strong> This order requires
                  manual review. Risk Level:{" "}
                  <RiskBadge
                    level={
                      order.fraudDetection?.riskLevel ?? order.customerRiskLevel
                    }
                    className='align-middle'
                  />{" "}
                  (Score:{" "}
                  {order.fraudDetection?.riskScore ?? order.customerRiskScore})
                  <ul className='mt-2 list-disc list-inside'>
                    {order.fraudFlags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

          <Tabs defaultValue='overview' className='w-full'>
            <TabsList className='grid w-full grid-cols-5 h-9'>
              <TabsTrigger value='overview' className='text-[11px] px-1'>
                Overview
              </TabsTrigger>
              <TabsTrigger value='products' className='text-[11px] px-1'>
                Products
              </TabsTrigger>
              <TabsTrigger value='payment' className='text-[11px] px-1'>
                Payment
              </TabsTrigger>
              <TabsTrigger value='timeline' className='text-[11px] px-1'>
                Timeline
              </TabsTrigger>
              <TabsTrigger value='audit' className='text-[11px] px-1'>
                Audit
              </TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value='overview' className='mt-3 space-y-2.5'>
              <MobileListCard
                static
                leading={<User className='h-5 w-5 text-muted-foreground' />}
                title={order.customer.name}
                subtitle={
                  [
                    order.customer.phoneNumber,
                    order.customer.email,
                  ]
                    .filter(Boolean)
                    .join(" · ") || undefined
                }
              />
              <MobileListCard
                static
                leading={<MapPin className='h-5 w-5 text-muted-foreground' />}
                title={`${order.shipping.division} · ${order.shipping.district}`}
                subtitle={order.shipping.address}
              />
              {order.courier &&
                (order.courier.provider ||
                  order.courier.trackingCode ||
                  order.courier.consignmentId) && (
                  <MobileListCard
                    static
                    leading={<Truck className='h-5 w-5 text-muted-foreground' />}
                    title={order.courier.provider || "Courier"}
                    subtitle={
                      [
                        order.courier.consignmentId,
                        order.courier.trackingCode,
                        order.estimatedDeliveryDate
                          ? `ETA ${format(
                              new Date(order.estimatedDeliveryDate),
                              "MMM dd, yyyy",
                            )}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || undefined
                    }
                  />
                )}
              {order.notes && (
                <MobileListCard
                  static
                  title='Order Notes'
                  subtitle={order.notes}
                />
              )}
            </TabsContent>

            {/* Products */}
            <TabsContent value='products' className='mt-3 space-y-2.5'>
              {order.products.map((product, idx) => (
                <MobileListCard
                  key={idx}
                  static
                  leading={
                    product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className='w-12 h-12 object-cover rounded-xl border'
                      />
                    ) : (
                      <div className='grid h-12 w-12 place-items-center rounded-xl border bg-muted'>
                        <Package className='h-5 w-5 text-muted-foreground' />
                      </div>
                    )
                  }
                  title={product.name}
                  subtitle={
                    product.hasVariation && product.variation
                      ? [
                          product.variation.color,
                          product.variation.size,
                        ]
                          .filter(Boolean)
                          .join(" / ")
                      : undefined
                  }
                  trailing={
                    <div className='text-right'>
                      <p className='text-sm font-semibold'>
                        ৳{product.totalPrice.toLocaleString()}
                      </p>
                      <p className='text-[11px] text-muted-foreground'>
                        {product.quantity} × ৳
                        {product.unitPrice.toLocaleString()}
                      </p>
                    </div>
                  }
                />
              ))}
            </TabsContent>

            {/* Payment */}
            <TabsContent value='payment' className='mt-3 space-y-2.5'>
              <div className='rounded-2xl border bg-card px-4 py-3.5 space-y-2.5'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Subtotal</span>
                  <span className='font-medium'>
                    ৳{order.totalPrice.toLocaleString()}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className='flex items-center justify-between text-sm text-green-600'>
                    <span>Discount</span>
                    <span className='font-medium'>
                      -৳{order.discount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Delivery Charge</span>
                  <span className='font-medium'>
                    ৳{order.deliveryCharge.toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className='flex items-center justify-between text-base font-bold'>
                  <span>Total</span>
                  <span>৳{pricingTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className='rounded-2xl border bg-card px-4 py-3.5 space-y-2.5'>
                <div className='flex items-center gap-2 text-sm font-medium'>
                  <CreditCard className='h-4 w-4 text-muted-foreground' />
                  Payment Status
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Paid</span>
                  <span className='font-medium text-green-600'>
                    ৳{order.paid.toLocaleString()}
                  </span>
                </div>
                {order.remaining > 0 && (
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Remaining</span>
                    <span className='font-medium text-red-600'>
                      ৳{order.remaining.toLocaleString()}
                    </span>
                  </div>
                )}
                {order.remaining === 0 && (
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Status</span>
                    <Badge>Fully Paid</Badge>
                  </div>
                )}
              </div>

              {order.payment && order.payment.length > 0 && (
                <div className='rounded-2xl border bg-card px-4 py-3.5 space-y-2.5'>
                  <p className='text-sm font-medium'>Payment History</p>
                  {order.payment.map((payment, idx) => (
                    <div
                      key={idx}
                      className='flex items-start justify-between gap-2 border-b pb-2 last:border-0 last:pb-0'>
                      <div className='min-w-0'>
                        <p className='text-sm font-medium'>
                          ৳{payment.amount?.toLocaleString() || 0}
                        </p>
                        <p className='text-[11px] text-muted-foreground truncate'>
                          {payment.paymentType || "-"} ·{" "}
                          {payment.paymentBy || "-"}
                        </p>
                        <p className='text-[11px] text-muted-foreground'>
                          {payment.date
                            ? format(new Date(payment.date), "MMM dd, yyyy HH:mm")
                            : "-"}
                          {payment.transectionId
                            ? ` · ${payment.transectionId}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Timeline */}
            <TabsContent value='timeline' className='mt-3 space-y-2.5'>
              <MobileListCard
                static
                leading={<Clock className='h-5 w-5 text-muted-foreground' />}
                title='Order Created'
                subtitle={format(
                  new Date(order.timestamps.createdAt),
                  "MMM dd, yyyy HH:mm",
                )}
              />
              {order.timestamps.updatedAt && (
                <MobileListCard
                  static
                  leading={<Clock className='h-5 w-5 text-muted-foreground' />}
                  title='Last Updated'
                  subtitle={format(
                    new Date(order.timestamps.updatedAt),
                    "MMM dd, yyyy HH:mm",
                  )}
                />
              )}
              {order.courier?.createdAt && (
                <MobileListCard
                  static
                  leading={<Truck className='h-5 w-5 text-muted-foreground' />}
                  title='Courier Assigned'
                  subtitle={format(
                    new Date(order.courier.createdAt),
                    "MMM dd, yyyy HH:mm",
                  )}
                />
              )}
              {order.isReturn && order.returnedAt && (
                <MobileListCard
                  static
                  danger
                  leading={<AlertCircle className='h-5 w-5' />}
                  title='Order Returned'
                  subtitle={format(
                    new Date(order.returnedAt),
                    "MMM dd, yyyy HH:mm",
                  )}
                />
              )}
              {order.deliveryTimeline && order.deliveryTimeline.length > 0 && (
                <p className='pt-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground'>
                  Delivery tracking
                </p>
              )}
              {order.deliveryTimeline?.map((event, idx) => (
                <MobileListCard
                  key={idx}
                  static
                  leading={
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-full ${
                        event.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                      <Truck className='h-4 w-4' />
                    </div>
                  }
                  title={event.status}
                  subtitle={
                    [
                      event.remarks,
                      event.timestamp
                        ? format(
                            new Date(event.timestamp),
                            "MMM dd, yyyy HH:mm",
                          )
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || undefined
                  }
                  trailing={
                    event.location ? (
                      <Badge variant='outline' className='text-[11px]'>
                        {event.location}
                      </Badge>
                    ) : undefined
                  }
                />
              ))}
            </TabsContent>

            {/* Audit */}
            <TabsContent value='audit' className='mt-3 space-y-3'>
              {order.customer?.phoneNumber && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center text-base'>
                      <AlertCircle className='mr-2 h-5 w-5' />
                      Fraud Detection Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FraudDetailPanel
                      phoneNumber={order.customer.phoneNumber}
                      customerName={order.customer.name}
                      onChanged={handleRefresh}
                    />
                  </CardContent>
                </Card>
              )}

              {order.isReturn && (
                <div className='rounded-2xl border bg-card px-4 py-3.5 space-y-2.5'>
                  <p className='text-sm font-medium'>Return Information</p>
                  {order.returnReason && (
                    <div>
                      <p className='text-xs text-muted-foreground'>
                        Return Reason
                      </p>
                      <p className='text-sm font-medium'>
                        {order.returnReason}
                      </p>
                    </div>
                  )}
                  {order.returnReasonDetails && (
                    <div>
                      <p className='text-xs text-muted-foreground'>Details</p>
                      <p className='text-sm font-medium'>
                        {order.returnReasonDetails}
                      </p>
                    </div>
                  )}
                  {order.returnedAt && (
                    <div>
                      <p className='text-xs text-muted-foreground'>Returned At</p>
                      <p className='text-sm font-medium'>
                        {format(
                          new Date(order.returnedAt),
                          "MMM dd, yyyy HH:mm",
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className='rounded-2xl border bg-card px-4 py-3.5 space-y-2.5'>
                <p className='text-sm font-medium'>System Information</p>
                <div>
                  <p className='text-xs text-muted-foreground'>Created At</p>
                  <p className='text-sm font-medium'>
                    {format(
                      new Date(order.timestamps.createdAt),
                      "MMM dd, yyyy HH:mm:ss",
                    )}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Updated At</p>
                  <p className='text-sm font-medium'>
                    {format(
                      new Date(order.timestamps.updatedAt),
                      "MMM dd, yyyy HH:mm:ss",
                    )}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className='text-xs text-muted-foreground'>Order ID</p>
                  <p className='font-mono text-sm'>
                    {order.id || order._id}
                  </p>
                </div>
                {order.active !== undefined && (
                  <div className='flex items-center justify-between'>
                    <p className='text-xs text-muted-foreground'>Status</p>
                    <Badge variant={order.active ? "default" : "secondary"}>
                      {order.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </MobilePage>
    );
  }

  return (
    <MainView title={`Order #${order.orderNumber}`}>
      <div className='space-y-6'>
        {/* Page Header */}
        <PageHeader
          icon={<FileText className='h-5 w-5' />}
          title={`Order #${order.orderNumber}`}
          subtitle={order.status}
          actions={
            <>
              <Button variant='outline' onClick={() => navigate("/order")}>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Orders
              </Button>
              <Button
                variant='outline'
                onClick={handleRefresh}
                disabled={refreshing}>
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </>
          }
        />

        {/* Order Header */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <Badge
                  variant={getStatusColor(order.status)}
                  className='text-sm'>
                  {getStatusIcon(order.status)}
                  <span className='ml-1'>{order.status}</span>
                </Badge>
                {order.isReturn && (
                  <Badge variant='destructive' className='text-sm'>
                    Returned
                  </Badge>
                )}
              </div>
              <div className='text-sm text-gray-500'>
                {format(
                  new Date(order.timestamps.createdAt),
                  "MMM dd, yyyy HH:mm",
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-center space-x-4 text-sm'>
              <span>ID: {order.id}</span>
              <Separator orientation='vertical' className='h-4' />
              <span>Created by: {order.orderCreatedBy}</span>
              {order.courier?.provider && (
                <>
                  <Separator orientation='vertical' className='h-4' />
                  <span>Courier: {order.courier.provider}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Blocked customer banner */}
        {order.fraudDetection?.blocked && (
          <Alert className='border-rose-600 bg-rose-600 text-white'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              <strong>Customer blocked:</strong> this customer is in the fraud
              group — new orders for them will be rejected.
              {order.fraudDetection.lastAnalyzedAt
                ? ` Risk level: ${order.fraudDetection.riskLevel} (score ${order.fraudDetection.riskScore}).`
                : null}
            </AlertDescription>
          </Alert>
        )}

        {/* Fraud Detection Warning */}
        {order.requiresManualReview &&
          order.fraudFlags &&
          order.fraudFlags.length > 0 && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                <strong>Fraud Detection Alert:</strong> This order requires
                manual review. Risk Level:{" "}
                <RiskBadge
                  level={
                    order.fraudDetection?.riskLevel ?? order.customerRiskLevel
                  }
                  className='align-middle'
                />{" "}
                (Score: {order.fraudDetection?.riskScore ?? order.customerRiskScore})
                <ul className='mt-2 list-disc list-inside'>
                  {order.fraudFlags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

        {/* Main Content Tabs */}
        <Tabs defaultValue='overview' className='w-full'>
          <TabsList className='grid w-full grid-cols-5'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='products'>Products</TabsTrigger>
            <TabsTrigger value='payment'>Payment</TabsTrigger>
            <TabsTrigger value='timeline'>Timeline</TabsTrigger>
            <TabsTrigger value='audit'>Audit</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center text-lg'>
                    <User className='mr-2 h-5 w-5' />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center'>
                    <User className='mr-3 h-4 w-4 text-gray-500' />
                    <span className='font-medium'>{order.customer.name}</span>
                  </div>
                  {order.customer.phoneNumber && (
                    <div className='flex items-center'>
                      <Phone className='mr-3 h-4 w-4 text-gray-500' />
                      <span>{order.customer.phoneNumber}</span>
                    </div>
                  )}
                  {order.customer.email && (
                    <div className='flex items-center'>
                      <Mail className='mr-3 h-4 w-4 text-gray-500' />
                      <span>{order.customer.email}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center text-lg'>
                    <MapPin className='mr-2 h-5 w-5' />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div>
                    <p className='text-sm text-gray-500'>District</p>
                    <p className='font-medium'>{order.shipping.division}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Area</p>
                    <p className='font-medium'>{order.shipping.district}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Address</p>
                    <p className='font-medium'>{order.shipping.address}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Courier & Delivery */}
              {order.courier &&
                (order.courier.provider ||
                  order.courier.trackingCode ||
                  order.courier.consignmentId) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center text-lg'>
                        <Truck className='mr-2 h-5 w-5' />
                        Courier Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      {order.courier.provider && (
                        <div>
                          <p className='text-sm text-gray-500'>Provider</p>
                          <p className='font-medium'>
                            {order.courier.provider}
                          </p>
                        </div>
                      )}
                      {order.courier.consignmentId && (
                        <div>
                          <p className='text-sm text-gray-500'>
                            Consignment ID
                          </p>
                          <p className='font-medium'>
                            {order.courier.consignmentId}
                          </p>
                        </div>
                      )}
                      {order.courier.trackingCode && (
                        <div>
                          <p className='text-sm text-gray-500'>Tracking Code</p>
                          <p className='font-medium'>
                            {order.courier.trackingCode}
                          </p>
                        </div>
                      )}
                      {order.estimatedDeliveryDate && (
                        <div>
                          <p className='text-sm text-gray-500'>
                            Estimated Delivery
                          </p>
                          <p className='font-medium'>
                            {format(
                              new Date(order.estimatedDeliveryDate),
                              "MMM dd, yyyy",
                            )}
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
                    <CardTitle className='text-lg'>Order Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm'>{order.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value='products'>
            <Card>
              <CardContent className='p-0'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Variations</TableHead>
                      <TableHead className='text-right'>Unit Price</TableHead>
                      <TableHead className='text-right'>Quantity</TableHead>
                      <TableHead className='text-right'>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.products.map((product, idx) => {
                      // Determine which image to display: variant image or product thumbnail
                      const displayImage = product.thumbnail || '';

                      return (
                        <TableRow key={idx}>
                          <TableCell>
                            <div className='flex items-center space-x-3'>
                              {displayImage && (
                                <img
                                  src={displayImage}
                                  alt={product.name}
                                  className='w-12 h-12 object-cover rounded border'
                                />
                              )}
                              <div>
                                <p className='font-medium'>{product.name}</p>
                                <p className='text-sm text-gray-500'>
                                  ID: {product.productId}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        <TableCell>
                          {product.hasVariation && product.variation ? (
                            <div className='text-sm'>
                              {product.variation.size && (
                                <p>Size: {product.variation.size}</p>
                              )}
                              {product.variation.color && (
                                <p>Color: {product.variation.color}</p>
                              )}
                            </div>
                          ) : (
                            <span className='text-gray-400'>-</span>
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          ৳{product.unitPrice.toLocaleString()}
                        </TableCell>
                        <TableCell className='text-right'>
                          {product.quantity}
                        </TableCell>
                        <TableCell className='text-right font-medium'>
                          ৳{product.totalPrice.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value='payment' className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Pricing Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center text-lg'>
                    <DollarSign className='mr-2 h-5 w-5' />
                    Pricing Details
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Subtotal</span>
                    <span className='font-medium'>
                      ৳{order.totalPrice.toLocaleString()}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className='flex justify-between text-green-600'>
                      <span>Discount</span>
                      <span className='font-medium'>
                        -৳{order.discount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Delivery Charge</span>
                    <span className='font-medium'>
                      ৳{order.deliveryCharge.toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className='flex justify-between text-lg font-bold'>
                    <span>Total</span>
                    <span>
                      ৳
                      {(
                        order.totalPrice -
                        order.discount +
                        order.deliveryCharge
                      ).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Status */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center text-lg'>
                    <CreditCard className='mr-2 h-5 w-5' />
                    Payment Status
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Total Amount</span>
                    <span className='font-medium'>
                      ৳
                      {(
                        order.totalPrice -
                        order.discount +
                        order.deliveryCharge
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className='flex justify-between text-green-600'>
                    <span>Paid</span>
                    <span className='font-medium'>
                      ৳{order.paid.toLocaleString()}
                    </span>
                  </div>
                  {order.remaining > 0 && (
                    <div className='flex justify-between text-red-600'>
                      <span>Remaining</span>
                      <span className='font-medium'>
                        ৳{order.remaining.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {order.remaining === 0 && (
                    <div className='flex justify-between text-green-600'>
                      <span>Status</span>
                      <Badge className='ml-auto'>Fully Paid</Badge>
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
                              ? format(
                                  new Date(payment.date),
                                  "MMM dd, yyyy HH:mm",
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>{payment.paymentType || "-"}</TableCell>
                          <TableCell>{payment.paymentBy || "-"}</TableCell>
                          <TableCell>
                            ৳{payment.amount?.toLocaleString() || 0}
                          </TableCell>
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
          <TabsContent value='timeline' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center text-lg'>
                  <Clock className='mr-2 h-5 w-5' />
                  Order Status Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between pb-4 border-b'>
                    <div>
                      <p className='text-sm text-gray-500'>Order Created</p>
                      <p className='font-medium'>
                        {format(
                          new Date(order.timestamps.createdAt),
                          "MMM dd, yyyy HH:mm",
                        )}
                      </p>
                    </div>
                    <Badge variant='outline'>Completed</Badge>
                  </div>
                  {order.timestamps.updatedAt && (
                    <div className='flex items-center justify-between pb-4 border-b'>
                      <div>
                        <p className='text-sm text-gray-500'>Last Updated</p>
                        <p className='font-medium'>
                          {format(
                            new Date(order.timestamps.updatedAt),
                            "MMM dd, yyyy HH:mm",
                          )}
                        </p>
                      </div>
                      <Badge variant='outline'>Updated</Badge>
                    </div>
                  )}
                  {order.courier?.createdAt && (
                    <div className='flex items-center justify-between pb-4 border-b'>
                      <div>
                        <p className='text-sm text-gray-500'>
                          Courier Assigned
                        </p>
                        <p className='font-medium'>
                          {format(
                            new Date(order.courier.createdAt),
                            "MMM dd, yyyy HH:mm",
                          )}
                        </p>
                      </div>
                      <Badge variant='outline'>Processed</Badge>
                    </div>
                  )}
                  {order.isReturn && order.returnedAt && (
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-gray-500'>Order Returned</p>
                        <p className='font-medium'>
                          {format(
                            new Date(order.returnedAt),
                            "MMM dd, yyyy HH:mm",
                          )}
                        </p>
                      </div>
                      <Badge variant='destructive'>Returned</Badge>
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
                  <div className='space-y-4'>
                    {order.deliveryTimeline.map((event, idx) => (
                      <div
                        key={idx}
                        className='flex items-start space-x-4 pb-4 border-b last:border-0'>
                        <div
                          className={`rounded-full p-2 ${
                            event.status === "delivered"
                              ? "bg-green-100"
                              : "bg-blue-100"
                          }`}>
                          <Truck className='h-4 w-4' />
                        </div>
                        <div className='flex-1'>
                          <p className='font-medium'>{event.status}</p>
                          {event.remarks && (
                            <p className='text-sm text-gray-500'>
                              {event.remarks}
                            </p>
                          )}
                          {event.timestamp && (
                            <p className='text-xs text-gray-400 mt-1'>
                              {format(
                                new Date(event.timestamp),
                                "MMM dd, yyyy HH:mm",
                              )}
                            </p>
                          )}
                        </div>
                        {event.location && (
                          <Badge variant='outline'>{event.location}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value='audit' className='space-y-6'>
            {/* Fraud Detection Details — live profile with admin actions */}
            {order.customer?.phoneNumber && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center text-lg'>
                    <AlertCircle className='mr-2 h-5 w-5' />
                    Fraud Detection Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FraudDetailPanel
                    phoneNumber={order.customer.phoneNumber}
                    customerName={order.customer.name}
                    onChanged={handleRefresh}
                  />
                </CardContent>
              </Card>
            )}

            {/* Return Information */}
            {order.isReturn && (
              <Card>
                <CardHeader>
                  <CardTitle>Return Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {order.returnReason && (
                    <div>
                      <p className='text-sm text-gray-500'>Return Reason</p>
                      <p className='font-medium'>{order.returnReason}</p>
                    </div>
                  )}
                  {order.returnReasonDetails && (
                    <div>
                      <p className='text-sm text-gray-500'>Details</p>
                      <p className='font-medium'>{order.returnReasonDetails}</p>
                    </div>
                  )}
                  {order.returnedAt && (
                    <div>
                      <p className='text-sm text-gray-500'>Returned At</p>
                      <p className='font-medium'>
                        {format(
                          new Date(order.returnedAt),
                          "MMM dd, yyyy HH:mm",
                        )}
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
              <CardContent className='space-y-3'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-500'>Created At</p>
                    <p className='font-medium'>
                      {format(
                        new Date(order.timestamps.createdAt),
                        "MMM dd, yyyy HH:mm:ss",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Updated At</p>
                    <p className='font-medium'>
                      {format(
                        new Date(order.timestamps.updatedAt),
                        "MMM dd, yyyy HH:mm:ss",
                      )}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className='text-sm text-gray-500'>Order ID</p>
                  <p className='font-mono text-sm'>{order.id || order._id}</p>
                </div>
                {order.active !== undefined && (
                  <div>
                    <p className='text-sm text-gray-500'>Status</p>
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
