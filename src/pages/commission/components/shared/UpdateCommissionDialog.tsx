import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import { Button } from "../../../../components/ui/button";
import { Commission } from "../../../../api/commission";
import { CommissionStatusBadge } from "./CommissionStatusBadge";
import { useToast } from "../../../../components/ui/use-toast";

interface UpdateCommissionDialogProps {
  commission: Commission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, status: string, notes?: string) => Promise<void>;
}

export const UpdateCommissionDialog: React.FC<UpdateCommissionDialogProps> = ({
  commission,
  open,
  onOpenChange,
  onUpdate,
}) => {
  const [status, setStatus] = useState<string>(commission?.status || "pending");
  const [notes, setNotes] = useState<string>(commission?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!commission) return;

    setIsSubmitting(true);
    try {
      await onUpdate(commission.id, status, notes);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update commission status",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Update Commission Status</DialogTitle>
          <DialogDescription>
            Update the status and add notes for commission #
            {commission?.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <div className="space-y-2">
            <Label>Current Status</Label>
            <div className="flex items-center gap-2">
              {commission && <CommissionStatusBadge status={commission.status} />}
            </div>
          </div>

          {/* New Status */}
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="removed">Removed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
