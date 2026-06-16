import { useState, ReactElement } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { createProductDeleteRequest } from "@/api/operationRequest";
import { toast } from "sonner";

interface Props {
  productId: string;
  productName: string;
  onSuccess?: () => void;
  children?: ReactElement;
}

const DeleteRequestDialog: React.FC<Props> = ({
  productId,
  productName,
  onSuccess,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for the deletion request");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createProductDeleteRequest({
        productId,
        reason: reason.trim(),
      });

      if (result.success) {
        toast.success(
          "Deletion request created successfully. The product is now inactive pending approval."
        );
        setReason("");
        setOpen(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(result.error || "Failed to create deletion request");
      }
    } catch (error) {
      console.error("Error creating deletion request:", error);
      toast.error("An error occurred while creating the deletion request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReason("");
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children || <Button variant="outline">Request Delete</Button>}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Request Product Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to request deletion for <strong>"{productName}"</strong>?
            This will make the product inactive and send a request to administrators for approval.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4">
          <Label htmlFor="reason" className="text-sm font-medium">
            Reason for deletion <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Please explain why this product should be deleted..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2"
            rows={3}
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground mt-1">
            This reason will be reviewed by administrators.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            disabled={isSubmitting || !reason.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Request...
              </>
            ) : (
              "Request Deletion"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRequestDialog;
