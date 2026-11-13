import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { AlertTriangle } from "lucide-react";

interface PrepaymentWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ruleName?: string | null;
  amount: number;
  paid: number;
  /** Called only when the admin confirms the typed-"yes" override */
  onConfirm: () => void;
  isBusy?: boolean;
}

/**
 * Confirmation gate for creating an order without collecting the required
 * prepayment advance. The admin must type "yes" to proceed — a plain click
 * can't bypass it.
 */
const PrepaymentWarningModal = ({
  open,
  onOpenChange,
  ruleName,
  amount,
  paid,
  onConfirm,
  isBusy = false,
}: PrepaymentWarningModalProps) => {
  const [confirmation, setConfirmation] = useState("");
  const confirmed = confirmation.trim().toLowerCase() === "yes";

  useEffect(() => {
    if (!open) setConfirmation("");
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='max-w-md'>
        <AlertDialogHeader>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100'>
            <AlertTriangle className='h-6 w-6 text-amber-600' />
          </div>
          <AlertDialogTitle className='text-center'>
            Skip the prepayment advance?
          </AlertDialogTitle>
          <AlertDialogDescription className='text-center space-y-2'>
            <span className='block'>
              Prepayment rule{ruleName ? ` “${ruleName}”` : ""} requires an
              advance of{" "}
              <strong className='text-amber-700'>৳{amount}</strong>, but the paid
              amount is <strong>৳{paid}</strong>.
            </span>
            <span className='block'>
              If you are sure you want to create this order{" "}
              <strong>without taking the advance</strong>, type{" "}
              <strong className='text-amber-700'>yes</strong> below and click
              submit. Otherwise click cancel.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='space-y-1.5'>
          <Label htmlFor='prepayment-confirm'>
            Type “yes” to create without the advance
          </Label>
          <Input
            id='prepayment-confirm'
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder='yes'
            autoComplete='off'
          />
        </div>
        <AlertDialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!confirmed || isBusy}
            className='bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50'>
            {isBusy ? "Creating…" : "Submit without advance"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PrepaymentWarningModal;
