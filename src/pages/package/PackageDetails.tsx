import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePackageStore } from "../../store/packageStore";
import { PackageStatusBadge } from "../../components/package/PackageStatusBadge";
import { BarcodeDisplay } from "../../components/package/BarcodeDisplay";
import { ActivityTimeline } from "../../components/package/ActivityTimeline";
import { CourierForm } from "../../components/package/CourierForm";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
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
import {
  Loader2,
  ArrowLeft,
  Download,
  Ship,
  X,
  Package as PackageIcon,
  Edit,
  User,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import type { PackageCourier } from "./interface";
import type { IOrderProduct } from "../order/interface.d";
import axios from "../../api/axios";
import config from "../../utils/config";
import PlaceHolderImage from "../../assets/placeholder.svg";
import { EditOrderSheet } from "../../components/package/EditOrderSheet";
import { cn } from "../../lib/utils";

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

  useEffect(() => {
    if (currentPackage?.order?.id) {
      fetchOrderProducts(currentPackage.order.id);
    }
  }, [currentPackage]);

  const fetchOrderProducts = async (orderId: string) => {
    try {
      setLoadingProducts(true);
      const response = await axios.get<any>(
        config.order.getOrderProducts(orderId),
      );
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
      <div className="min-h-screen bg-slate-50/60">
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
            <div className="relative h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          </div>
          <p className="mt-6 text-lg font-semibold text-slate-900">
            Loading package details...
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Please wait while we fetch the data
          </p>
        </div>
      </div>
    );
  }

  if (!currentPackage) {
    return (
      <div className="min-h-screen bg-slate-50/60">
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
            <PackageIcon className="h-10 w-10 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 mb-2">
            Package not found
          </p>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            The package you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => navigate("/packages")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Packages
          </Button>
        </div>
      </div>
    );
  }

  const canDownloadSlip = currentPackage.status === "requested";
  const canMarkAsPacked = currentPackage.status === "packing";
  const canRequestShipping = currentPackage.status === "packed";
  const canCancel = ["requested", "packing", "packed"].includes(
    currentPackage.status,
  );

  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/packages")}
              className="h-9 w-9 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200">
              <PackageIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-semibold text-slate-900 leading-tight">
                  Package #{currentPackage.orderNumber}
                </h1>
                <PackageStatusBadge status={currentPackage.status} />
              </div>
              <p className="text-sm text-slate-500 mt-0.5 font-mono">
                {currentPackage.packageCode}
              </p>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 flex-wrap">
            {canDownloadSlip && (
              <Button
                onClick={handleDownloadSlip}
                className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Download Slip
              </Button>
            )}
            <Button
              onClick={() => setShowProductsSheet(true)}
              variant="outline"
              className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50 gap-1.5">
              <PackageIcon className="h-3.5 w-3.5" />
              View Products
              <Badge
                variant="secondary"
                className="ml-1 h-5 px-1.5 text-[10px] bg-slate-100 text-slate-600 rounded-md">
                {orderProducts.length}
              </Badge>
            </Button>
            {canMarkAsPacked && (
              <Button
                onClick={handleMarkAsPacked}
                disabled={submitting}
                className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 gap-1.5">
                {submitting && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                Mark as Packed
              </Button>
            )}
            {canRequestShipping && (
              <Dialog
                open={showCourierDialog}
                onOpenChange={setShowCourierDialog}>
                <DialogTrigger asChild>
                  <Button
                    className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 gap-1.5">
                    <Ship className="h-3.5 w-3.5" />
                    Request Shipping
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-100">
                        <Truck className="h-3.5 w-3.5 text-blue-600" />
                      </span>
                      Request Shipping
                    </DialogTitle>
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
                variant="destructive"
                onClick={handleCancel}
                disabled={submitting}
                className="h-9 gap-1.5">
                {submitting && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Info */}
            <Card className="border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <PackageIcon className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Package Information
                  </h2>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                      Order Number
                    </p>
                    <p className="font-semibold text-slate-900">
                      #{currentPackage.orderNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                      Package Code
                    </p>
                    <p className="font-semibold font-mono text-slate-900">
                      {currentPackage.packageCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                      Status
                    </p>
                    <PackageStatusBadge status={currentPackage.status} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                      Age
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <p className="font-semibold text-slate-900">
                        {currentPackage.ageInDays || 0} days
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                      Total Amount
                    </p>
                    <p className="font-semibold text-slate-900">
                      {currentPackage.order?.totalPrice || 0}
                      <span className="text-xs font-normal text-slate-400 ml-0.5">
                        BDT
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                      COD Amount
                    </p>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                      <p className="font-semibold text-emerald-600">
                        {currentPackage.order?.remaining || 0}
                        <span className="text-xs font-normal text-slate-400 ml-0.5">
                          BDT
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {currentPackage.order?.notes && (
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
                      Special Instructions
                    </p>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm italic text-amber-800">
                        {currentPackage.order.notes}
                      </p>
                    </div>
                  </div>
                )}

                {currentPackage.courier?.provider && (
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
                      Courier Information
                    </p>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-slate-400" />
                        <p className="text-sm">
                          <span className="font-medium text-slate-700">
                            Provider:
                          </span>{" "}
                          <span className="text-slate-900">
                            {currentPackage.courier.provider}
                          </span>
                        </p>
                      </div>
                      {currentPackage.courier.consignmentId && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                          <p className="text-sm">
                            <span className="font-medium text-slate-700">
                              Consignment:
                            </span>{" "}
                            <span className="text-slate-900 font-mono">
                              {currentPackage.courier.consignmentId}
                            </span>
                          </p>
                        </div>
                      )}
                      {currentPackage.courier.trackingCode && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <p className="text-sm">
                            <span className="font-medium text-slate-700">
                              Tracking:
                            </span>{" "}
                            <span className="text-slate-900 font-mono">
                              {currentPackage.courier.trackingCode}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Information */}
            {currentPackage.order && (
              <Card className="border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <FileText className="h-3.5 w-3.5 text-indigo-600" />
                      </div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Order Information
                      </h2>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditOrderSheet(true)}
                      className="h-7 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 gap-1">
                      <Edit className="h-3 w-3" />
                      Edit Order
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                        Customer Name
                      </p>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <p className="font-semibold text-slate-900">
                          {currentPackage.order.customer.name || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                        Phone Number
                      </p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <p className="font-semibold text-slate-900">
                          {currentPackage.order.customer.phoneNumber || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                        Shipping Address
                      </p>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900">
                            {currentPackage.order.shipping.address || "N/A"}
                          </p>
                          {currentPackage.order.shipping.division && (
                            <p className="text-sm text-slate-500 mt-0.5">
                              {currentPackage.order.shipping.division}
                              {currentPackage.order.shipping.district &&
                                `, ${currentPackage.order.shipping.district}`}
                              {currentPackage.order.shipping.postalCode &&
                                ` - ${currentPackage.order.shipping.postalCode}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Timeline */}
            <ActivityTimeline activities={activities} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <BarcodeDisplay
              orderNumber={currentPackage.orderNumber}
              packageCode={currentPackage.packageCode}
            />
          </div>
        </div>
      </div>

      {/* Products Sheet */}
      <Sheet open={showProductsSheet} onOpenChange={setShowProductsSheet}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-base font-semibold">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100">
                <PackageIcon className="h-3.5 w-3.5 text-indigo-600" />
              </span>
              Order Products
            </SheetTitle>
            <p className="text-sm text-slate-500">
              Order #{currentPackage.orderNumber} &bull; {orderProducts.length}{" "}
              items
            </p>
          </SheetHeader>

          <div className="mt-6">
            {loadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  <p className="text-sm font-medium text-slate-700">
                    Loading products...
                  </p>
                </div>
              </div>
            ) : orderProducts.length === 0 ? (
              <div className="py-16 px-4 text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <PackageIcon className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-lg font-bold text-slate-900 mb-1">
                  No products found
                </p>
                <p className="text-sm text-slate-500">
                  No products associated with this order
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-3 pr-4">
                  {orderProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="border border-slate-200 overflow-hidden">
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <img
                              src={product.thumbnail || PlaceHolderImage}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                              onError={(e) => {
                                e.currentTarget.src = PlaceHolderImage;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-900 line-clamp-2 mb-1">
                              {product.name}
                            </p>

                            {product.variation &&
                              (product.variation.color ||
                                product.variation.size) && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] bg-rose-50 text-rose-600 border-rose-200 rounded-md mb-1.5">
                                  (
                                  {product.variation.color && (
                                    <span className="capitalize">
                                      {product.variation.color}
                                    </span>
                                  )}
                                  {product.variation.color &&
                                    product.variation.size && <span> . </span>}
                                  {product.variation.size && (
                                    <span>{product.variation.size}</span>
                                  )}
                                  )
                                </Badge>
                              )}

                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {product.quantity}x {product.unitPrice}
                                  <span className="text-xs font-normal text-slate-400 ml-0.5">
                                    BDT
                                  </span>
                                </p>
                                <p className="text-xs text-slate-500">
                                  Total: {product.totalPrice}
                                  <span className="text-slate-400 ml-0.5">
                                    BDT
                                  </span>
                                </p>
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-[10px] bg-slate-100 text-slate-600 rounded-md">
                                Qty: {product.quantity}
                              </Badge>
                            </div>

                            {product.discount && product.discount > 0 && (
                              <p className="text-xs text-emerald-600 mt-1 font-medium">
                                Discount: -{product.discount}
                                <span className="text-slate-400 ml-0.5">
                                  BDT
                                </span>
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
