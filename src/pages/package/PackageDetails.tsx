import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePackageStore } from "../../store/packageStore";
import { PackageStatusBadge } from "../../components/package/PackageStatusBadge";
import { BarcodeDisplay } from "../../components/package/BarcodeDisplay";
import { ActivityTimeline } from "../../components/package/ActivityTimeline";
import { CourierForm } from "../../components/package/CourierForm";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Loader2, ArrowLeft, Download, Ship, X, Package as PackageIcon, Edit } from "lucide-react";
import { toast } from "sonner";
import type { PackageCourier } from "./interface";
import type { IOrderProduct } from "../order/interface.d";
import axios from "../../api/axios";
import config from "../../utils/config";
import PlaceHolderImage from "../../assets/placeholder.svg";
import { EditOrderSheet } from "../../components/package/EditOrderSheet";

export function PackageDetailsPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const {
    currentPackage,
    activities,
    loading,
    loadPackage,
    loadActivities,
    markAsPacked,
    requestShipping,
    cancelPackage,
  } = usePackageStore();

  const [showCourierDialog, setShowCourierDialog] = useState(false);
  const [showProductsSheet, setShowProductsSheet] = useState(false);
  const [showEditOrderSheet, setShowEditOrderSheet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderProducts, setOrderProducts] = useState<IOrderProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (orderNumber) {
      loadPackage(parseInt(orderNumber));
      loadActivities(parseInt(orderNumber));
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  // Fetch order products when package is loaded
  useEffect(() => {
    if (currentPackage?.order?.id) {
      fetchOrderProducts(currentPackage.order.id);
    }
  }, [currentPackage]);

  const fetchOrderProducts = async (orderId: string) => {
    try {
      setLoadingProducts(true);
      const response = await axios.get<any>(config.order.getOrderProducts(orderId));
      if (response.data?.success && response.data?.data?.products) {
        setOrderProducts(response.data.data.products);
      }
    } catch (error) {
      console.error("Error fetching order products:", error);
      toast.error("Failed to load order products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDownloadSlip = async () => {
    toast.success("Downloading packaging slip...");
    // TODO: Implement actual download
  };

  const handleMarkAsPacked = async () => {
    if (!currentPackage) return;
    try {
      setSubmitting(true);
      await markAsPacked(currentPackage.orderNumber);
      await loadPackage(currentPackage.orderNumber);
      await loadActivities(currentPackage.orderNumber);
    } catch (error) {
      // Error handled by store
    } finally {
      setSubmitting(false);
    }
  };

  const handleCourierSubmit = async (courier: PackageCourier) => {
    if (!currentPackage) return;
    try {
      setSubmitting(true);
      await requestShipping(currentPackage.orderNumber, courier);
      setShowCourierDialog(false);
      await loadPackage(currentPackage.orderNumber);
      await loadActivities(currentPackage.orderNumber);
    } catch (error) {
      // Error handled by store
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!currentPackage) return;
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;

    try {
      setSubmitting(true);
      await cancelPackage(currentPackage.orderNumber, reason);
      await loadPackage(currentPackage.orderNumber);
      await loadActivities(currentPackage.orderNumber);
    } catch (error) {
      // Error handled by store
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!currentPackage) {
    return <div>Package not found</div>;
  }

  const canDownloadSlip = currentPackage.status === "requested";
  const canMarkAsPacked = currentPackage.status === "packing";
  const canRequestShipping = currentPackage.status === "packed";
  const canCancel = ["requested", "packing", "packed"].includes(
    currentPackage.status,
  );

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' onClick={() => navigate("/packages")}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>
              Package #{currentPackage.orderNumber}
            </h1>
            <p className='text-gray-500'>{currentPackage.packageCode}</p>
          </div>
        </div>
        <PackageStatusBadge status={currentPackage.status} />
      </div>

      {/* Actions */}
      <div className='flex gap-2 flex-wrap'>
        {canDownloadSlip && (
          <Button onClick={handleDownloadSlip}>
            <Download className='mr-2 h-4 w-4' />
            Download Packaging Slip
          </Button>
        )}
        <Button onClick={() => setShowProductsSheet(true)} variant='outline'>
          <PackageIcon className='mr-2 h-4 w-4' />
          View Products ({orderProducts.length})
        </Button>
        {canMarkAsPacked && (
          <Button onClick={handleMarkAsPacked} disabled={submitting}>
            Mark as Packed
          </Button>
        )}
        {canRequestShipping && (
          <Dialog open={showCourierDialog} onOpenChange={setShowCourierDialog}>
            <DialogTrigger asChild>
              <Button>
                <Ship className='mr-2 h-4 w-4' />
                Request Shipping
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Shipping</DialogTitle>
              </DialogHeader>
              <CourierForm
                onSubmit={handleCourierSubmit}
                isLoading={submitting}
                defaultValues={currentPackage.courier}
              />
            </DialogContent>
          </Dialog>
        )}
        {canCancel && (
          <Button
            variant='destructive'
            onClick={handleCancel}
            disabled={submitting}>
            <X className='mr-2 h-4 w-4' />
            Cancel Package
          </Button>
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Package Info */}
          <Card>
            <CardHeader>
              <CardTitle>Package Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-500'>Order Number</p>
                  <p className='font-semibold'>#{currentPackage.orderNumber}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Package Code</p>
                  <p className='font-semibold font-mono'>
                    {currentPackage.packageCode}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Status</p>
                  <PackageStatusBadge status={currentPackage.status} />
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Age</p>
                  <p className='font-semibold'>
                    {currentPackage.ageInDays || 0} days
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Total Amount</p>
                  <p className='font-semibold'>
                    {currentPackage.order?.totalPrice || 0}৳
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>COD Amount</p>
                  <p className='font-semibold text-green-600'>
                    {currentPackage.order?.remaining || 0}৳
                  </p>
                </div>
              </div>

              {currentPackage.order?.notes && (
                <div>
                  <p className='text-sm text-gray-500 mb-2'>
                    Special Instructions
                  </p>
                  <div className='p-3 bg-yellow-50 border border-yellow-200 rounded'>
                    <p className='text-sm italic'>
                      {currentPackage.order.notes}
                    </p>
                  </div>
                </div>
              )}

              {currentPackage.courier?.provider && (
                <div>
                  <p className='text-sm text-gray-500 mb-2'>
                    Courier Information
                  </p>
                  <div className='p-3 bg-gray-50 rounded space-y-1'>
                    <p className='text-sm'>
                      <span className='font-medium'>Provider:</span>{" "}
                      {currentPackage.courier.provider}
                    </p>
                    {currentPackage.courier.consignmentId && (
                      <p className='text-sm'>
                        <span className='font-medium'>Consignment:</span>{" "}
                        {currentPackage.courier.consignmentId}
                      </p>
                    )}
                    {currentPackage.courier.trackingCode && (
                      <p className='text-sm'>
                        <span className='font-medium'>Tracking:</span>{" "}
                        {currentPackage.courier.trackingCode}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Information */}
          {currentPackage.order && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Order Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditOrderSheet(true)}
                  className="h-8"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Order
                </Button>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-500'>Customer Name</p>
                    <p className='font-semibold'>
                      {currentPackage.order.customer.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Phone Number</p>
                    <p className='font-semibold'>
                      {currentPackage.order.customer.phoneNumber || "N/A"}
                    </p>
                  </div>
                  <div className='col-span-2'>
                    <p className='text-sm text-gray-500'>Shipping Address</p>
                    <p className='font-semibold'>
                      {currentPackage.order.shipping.address || "N/A"}
                    </p>
                    {currentPackage.order.shipping.division && (
                      <p className='text-sm text-gray-600'>
                        {currentPackage.order.shipping.division}
                        {currentPackage.order.shipping.district &&
                          `, ${currentPackage.order.shipping.district}`}
                        {currentPackage.order.shipping.postalCode &&
                          ` - ${currentPackage.order.shipping.postalCode}`}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <ActivityTimeline activities={activities} />
        </div>

        {/* Right Column */}
        <div className='space-y-6'>
          <BarcodeDisplay
            orderNumber={currentPackage.orderNumber}
            packageCode={currentPackage.packageCode}
          />
        </div>
      </div>

      {/* Products Sheet */}
      <Sheet open={showProductsSheet} onOpenChange={setShowProductsSheet}>
        <SheetContent className='w-full sm:max-w-md'>
          <SheetHeader>
            <SheetTitle>Order Products</SheetTitle>
            <p className='text-sm text-gray-500'>
              Order #{currentPackage.orderNumber} • {orderProducts.length} items
            </p>
          </SheetHeader>

          <div className='mt-6'>
            {loadingProducts ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='h-8 w-8 animate-spin' />
              </div>
            ) : orderProducts.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <PackageIcon className='h-12 w-12 text-gray-400 mb-4' />
                  <p className='text-gray-500'>No products found</p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className='h-[calc(100vh-200px)]'>
                <div className='space-y-4 pr-4'>
                  {orderProducts.map((product) => (
                    <Card key={product.id}>
                      <CardContent className='p-4'>
                        <div className='flex gap-4'>
                          {/* Product Image */}
                          <div className='flex-shrink-0'>
                            <img
                              src={product.thumbnail || PlaceHolderImage}
                              alt={product.name}
                              className='w-20 h-20 object-cover rounded-md border'
                              onError={(e) => {
                                e.currentTarget.src = PlaceHolderImage;
                              }}
                            />
                          </div>

                          {/* Product Details */}
                          <div className='flex-1 min-w-0'>
                            <p className='font-medium text-sm line-clamp-2 mb-1'>
                              {product.name}
                            </p>

                            {/* Variant */}
                            {product.variation && (product.variation.color || product.variation.size) && (
                              <p className='text-xs text-gray-600 mb-2'>
                                (
                                {product.variation.color && (
                                  <span className='capitalize'>{product.variation.color}</span>
                                )}
                                {product.variation.color && product.variation.size && <span> . </span>}
                                {product.variation.size && (
                                  <span>{product.variation.size}</span>
                                )}
                                )
                              </p>
                            )}

                            {/* Price and Quantity */}
                            <div className='flex items-center justify-between'>
                              <div>
                                <p className='text-sm font-semibold'>
                                  {product.quantity}x {product.unitPrice}৳
                                </p>
                                <p className='text-xs text-gray-500'>
                                  Total: {product.totalPrice}৳
                                </p>
                              </div>
                              <Badge variant='secondary' className='text-xs'>
                                Qty: {product.quantity}
                              </Badge>
                            </div>

                            {/* Discount */}
                            {product.discount && product.discount > 0 && (
                              <p className='text-xs text-green-600 mt-1'>
                                Discount: {product.discount}৳
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Order Sheet */}
      <EditOrderSheet
        order={currentPackage.order || null}
        open={showEditOrderSheet}
        onOpenChange={setShowEditOrderSheet}
        onOrderUpdated={async () => {
          if (orderNumber) {
            await loadPackage(parseInt(orderNumber));
            await loadActivities(parseInt(orderNumber));
          }
        }}
      />
    </div>
  );
}
