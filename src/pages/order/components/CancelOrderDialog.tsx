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
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { AlertTriangle } from "lucide-react";
import { IOrder } from "../interface";
import {
  cancellationReasons,
} from "../hooks/useOrderConfirmation";

interface CancelOrderDialogProps {
  order: IOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (reason: string) => void;
  loading?: boolean;
}

export const CancelOrderDialog: React.FC<CancelOrderDialogProps> = ({
  order,
  open,
  onOpenChange,
  onCancel,
  loading = false,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const selectedReasonObject = cancellationReasons.find(
    (r) => r.value === selectedReason
  );

  const handleCancel = () => {
    if (!selectedReason) return;

    let finalReason = selectedReasonObject?.label || selectedReason;

    // If "other" is selected, append the custom reason
    if (selectedReason === "other" && otherReason.trim()) {
      finalReason = otherReason.trim();
    }

    onCancel(finalReason);
  };

  const resetForm = () => {
    setSelectedReason("");
    setOtherReason("");
    setNotes("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const isFormValid = selectedReason !== "" &&
    (selectedReason !== "other" || otherReason.trim() !== "");

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Cancel Order
          </DialogTitle>
          <DialogDescription>
            You are about to cancel order <strong>{order.orderNumber}</strong>.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-sm text-red-800">
              <p className="font-semibold mb-1">Warning</p>
              <p className="text-xs">
                Cancelling this order will:
              </p>
              <ul className="text-xs list-disc list-inside mt-1 space-y-1">
                <li>Change order status to "cancelled"</li>
                <li>Restore all product quantities to inventory</li>
                <li>Log this action in the audit trail</li>
              </ul>
            </div>
          </div>

          {/* Order Info */}
          <div className="p-3 bg-muted/50 rounded-md space-y-1">
            <p className="text-sm">
              <span className="font-medium">Customer:</span> {order.customer.name}
            </p>
            <p className="text-sm">
              <span className="font-medium">Phone:</span> {order.customer.phoneNumber}
            </p>
            <p className="text-sm">
              <span className="font-medium">Total:</span> ৳{order.totalPrice.toFixed(2)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Items:</span> {order.products.length}
            </p>
          </div>

          {/* Cancellation Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Cancellation Reason <span className="text-red-600">*</span>
            </Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {cancellationReasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Other Reason Input */}
          {selectedReason === "other" && (
            <div className="space-y-2">
              <Label htmlFor="other-reason">
                Please specify <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="other-reason"
                placeholder="Enter the reason for cancellation..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          )}

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details about the cancellation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Keep Order
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={!isFormValid || loading}
          >
            {loading ? "Cancelling..." : "Cancel Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
