import { useState } from "react";
import { useSelector } from "react-redux";
import { hasPagePermission } from "../../utils/helperFunction";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Loader2, Package as PackageIcon, User, Phone, MapPin, CheckCircle, XCircle } from "lucide-react";
import { markPackageAsPacked } from "../../api/package";
import { toast } from "sonner";
import type { Package } from "../../pages/package/interface";

interface ScanResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: Package | null;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function ScanResultDialog({
  open,
  onOpenChange,
  package: pkg,
  onConfirm,
  onCancel,
}: ScanResultDialogProps) {
  const user = useSelector((state: any) => state?.user);
  const userPermissions = user?.permissions || [];

  // Permission check
  const canEdit = hasPagePermission("package", "edit", userPermissions);

  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  if (!pkg) return null;

  const isPackingStatus = pkg.status === "packing";
  const canMarkAsPacked = isPackingStatus && canEdit;

  const handleMarkAsPacked = async () => {
    if (!canMarkAsPacked) {
      toast.error("You don't have permission to mark packages as packed");
      return;
    }

    setLoading(true);
    try {
      const result = await markPackageAsPacked(pkg.orderNumber, notes);

      if (result.success && result.data) {
        toast.success("Package marked as packed successfully");
        onConfirm?.();
        onOpenChange(false);
        setNotes("");
      } else {
        toast.error(result.error || "Failed to mark package as packed");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark package as packed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageIcon className="h-5 w-5" />
            Scan Result
          </DialogTitle>
          <DialogDescription>
            Package details for order #{pkg.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPackingStatus ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-orange-600" />
              )}
              <span className="font-semibold">Status:</span>
              <Badge
                variant={isPackingStatus ? "default" : "secondary"}
                className={isPackingStatus ? "bg-green-600" : ""}
              >
                {pkg.status}
              </Badge>
            </div>
            <Badge variant="outline">{pkg.packageCode}</Badge>
          </div>

          {/* Status Message */}
          {!isPackingStatus && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900">Invalid Status</h4>
                  <p className="text-sm text-orange-800 mt-1">
                    This package is currently in <strong>"{pkg.status}"</strong> status.
                    Only packages in <strong>"packing"</strong> status can be marked as packed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Permission Warning */}
          {isPackingStatus && !canEdit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900">Permission Required</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    You don't have permission to mark packages as packed.
                    Please contact your administrator for "Package: Edit" permission.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Package Details */}
          {pkg.order && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                {/* Customer Information */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Name:</span>
                      <span>{pkg.order.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Phone:</span>
                      <span>{pkg.order.customer.phoneNumber}</span>
                    </div>
                    {pkg.order.customer.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Email:</span>
                        <span className="text-gray-600">{pkg.order.customer.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">Shipping Address</h4>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-gray-900">{pkg.order.shipping.address}</p>
                      {(pkg.order.shipping.district || pkg.order.shipping.division) && (
                        <p className="text-gray-600 text-xs mt-1">
                          {pkg.order.shipping.district && `${pkg.order.shipping.district}, `}
                          {pkg.order.shipping.division}
                          {pkg.order.shipping.postalCode && ` - ${pkg.order.shipping.postalCode}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">Order Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Order #:</span>
                      <span className="ml-2">{pkg.orderNumber}</span>
                    </div>
                    <div>
                      <span className="font-medium">Items:</span>
                      <span className="ml-2">{pkg.order.quantity}</span>
                    </div>
                    <div>
                      <span className="font-medium">Total:</span>
                      <span className="ml-2">৳{pkg.order.totalPrice.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">Paid:</span>
                      <span className="ml-2 text-green-600">৳{pkg.order.paid.toLocaleString()}</span>
                    </div>
                    {pkg.order.remaining > 0 && (
                      <div className="col-span-2">
                        <span className="font-medium">Remaining:</span>
                        <span className="ml-2 text-orange-600">৳{pkg.order.remaining.toLocaleString()}</span>
                      </div>
                    )}
                    {pkg.order.notes && (
                      <div className="col-span-2">
                        <span className="font-medium">Notes:</span>
                        <p className="text-gray-600 text-xs mt-1">{pkg.order.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="text-xs text-gray-500 pt-2 border-t">
                  <div>Created: {new Date(pkg.timestamps.createdAt).toLocaleString()}</div>
                  <div>Updated: {new Date(pkg.timestamps.updatedAt).toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes Input */}
          {isPackingStatus && canEdit && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Packing Notes (Optional)
              </label>
              <textarea
                className="w-full min-h-[80px] p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any notes about packing this package..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          {isPackingStatus && canEdit && (
            <Button
              onClick={handleMarkAsPacked}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark as Packed
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
