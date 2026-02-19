import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Phone, MapPin, Package, AlertCircle } from "lucide-react";
import { IOrder } from "../interface";

interface CustomerVerificationDialogProps {
  order: IOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (orderNumber: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface VerificationChecklist {
  calledCustomer: boolean;
  verifiedPhone: boolean;
  verifiedAddress: boolean;
  customerConfirmed: boolean;
  checkedInventory: boolean;
}

export const CustomerVerificationDialog: React.FC<
  CustomerVerificationDialogProps
> = ({ order, open, onOpenChange, onConfirm, onCancel, loading = false }) => {
  const [checklist, setChecklist] = useState<VerificationChecklist>({
    calledCustomer: false,
    verifiedPhone: false,
    verifiedAddress: false,
    customerConfirmed: false,
    checkedInventory: false,
  });
  const [notes, setNotes] = useState("");

  const allChecked = Object.values(checklist).every((v) => v === true);

  const handleConfirm = () => {
    if (!order) return;
    if (!allChecked) {
      return;
    }
    onConfirm(String(order.orderNumber));
  };

  const resetForm = () => {
    setChecklist({
      calledCustomer: false,
      verifiedPhone: false,
      verifiedAddress: false,
      customerConfirmed: false,
      checkedInventory: false,
    });
    setNotes("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  if (!order) return null;

  const fraudRisk = order.fraudDetection;
  const riskColor =
    fraudRisk?.riskLevel === "red"
      ? "text-red-600 bg-red-50"
      : fraudRisk?.riskLevel === "yellow"
        ? "text-yellow-600 bg-yellow-50"
        : "text-green-600 bg-green-50";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verify Order - {order.orderNumber}</DialogTitle>
          <DialogDescription>
            Confirm order details by calling the customer and verifying
            inventory before proceeding to packaging.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Fraud Risk Warning */}
          {fraudRisk && fraudRisk.isFraud && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">
                  Fraud Risk Detected
                </p>
                <p className="text-sm text-red-700">
                  Risk Score: {fraudRisk.riskScore}/100
                  {fraudRisk.fraudFlags && fraudRisk.fraudFlags.length > 0 && (
                    <>
                      <br />
                      Flags: {fraudRisk.fraudFlags.join(", ")}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Order Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{order.customer.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Items:</span>
                <span className="font-medium">{order.products.length}</span>
              </div>
              <div className="flex items-start gap-2 col-span-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <span className="text-muted-foreground">Address:</span>
                  <p className="font-medium text-xs">
                    {order.shipping.address}
                    {order.shipping.district && `, ${order.shipping.district}`}
                    {order.shipping.division && `, ${order.shipping.division}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Verification Checklist */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Verification Checklist</h3>
            <p className="text-xs text-muted-foreground">
              Complete all verification steps before confirming the order.
            </p>

            <div className="space-y-2">
              <div className="flex items-start space-x-3 p-2 rounded-md hover:bg-accent/50">
                <Checkbox
                  id="called-customer"
                  checked={checklist.calledCustomer}
                  onCheckedChange={(checked) =>
                    setChecklist({ ...checklist, calledCustomer: !!checked })
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="called-customer"
                    className="cursor-pointer font-normal"
                  >
                    Called customer
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Successfully contacted the customer via phone
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2 rounded-md hover:bg-accent/50">
                <Checkbox
                  id="verified-phone"
                  checked={checklist.verifiedPhone}
                  onCheckedChange={(checked) =>
                    setChecklist({ ...checklist, verifiedPhone: !!checked })
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="verified-phone"
                    className="cursor-pointer font-normal"
                  >
                    Verified phone number
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Confirmed the phone number is correct
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2 rounded-md hover:bg-accent/50">
                <Checkbox
                  id="verified-address"
                  checked={checklist.verifiedAddress}
                  onCheckedChange={(checked) =>
                    setChecklist({ ...checklist, verifiedAddress: !!checked })
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="verified-address"
                    className="cursor-pointer font-normal"
                  >
                    Verified delivery address
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Confirmed the delivery address with customer
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2 rounded-md hover:bg-accent/50">
                <Checkbox
                  id="customer-confirmed"
                  checked={checklist.customerConfirmed}
                  onCheckedChange={(checked) =>
                    setChecklist({ ...checklist, customerConfirmed: !!checked })
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="customer-confirmed"
                    className="cursor-pointer font-normal"
                  >
                    Customer confirmed order
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Customer explicitly confirmed they want to proceed with this
                    order
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2 rounded-md hover:bg-accent/50">
                <Checkbox
                  id="checked-inventory"
                  checked={checklist.checkedInventory}
                  onCheckedChange={(checked) =>
                    setChecklist({ ...checklist, checkedInventory: !!checked })
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="checked-inventory"
                    className="cursor-pointer font-normal"
                  >
                    Checked inventory
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Verified all products are in stock and available
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about the verification process..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              handleOpenChange(false);
              onCancel();
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!allChecked || loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Confirming..." : "Confirm Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
