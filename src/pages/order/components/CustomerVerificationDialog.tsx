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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { cn } from "../../../lib/utils";
import {
  Phone,
  MapPin,
  Package,
  AlertCircle,
  ChevronDown,
  ClipboardCheck,
  FileText,
  CheckCircle2,
} from "lucide-react";
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

const CHECKLIST_ITEMS: {
  key: keyof VerificationChecklist;
  label: string;
  description: string;
}[] = [
  {
    key: "calledCustomer",
    label: "Called customer",
    description: "Successfully contacted the customer via phone",
  },
  {
    key: "verifiedPhone",
    label: "Verified phone number",
    description: "Confirmed the phone number is correct",
  },
  {
    key: "verifiedAddress",
    label: "Verified delivery address",
    description: "Confirmed the delivery address with customer",
  },
  {
    key: "customerConfirmed",
    label: "Customer confirmed order",
    description: "Customer explicitly confirmed they want to proceed",
  },
  {
    key: "checkedInventory",
    label: "Checked inventory",
    description: "Verified all products are in stock and available",
  },
];

const INITIAL_CHECKLIST: VerificationChecklist = {
  calledCustomer: false,
  verifiedPhone: false,
  verifiedAddress: false,
  customerConfirmed: false,
  checkedInventory: false,
};

export const CustomerVerificationDialog: React.FC<
  CustomerVerificationDialogProps
> = ({ order, open, onOpenChange, onConfirm, onCancel, loading = false }) => {
  const [checklist, setChecklist] =
    useState<VerificationChecklist>(INITIAL_CHECKLIST);
  const [notes, setNotes] = useState("");
  const [checklistOpen, setChecklistOpen] = useState(true);

  const values = Object.values(checklist);
  const completedCount = values.filter(Boolean).length;
  const totalCount = values.length;
  const allChecked = completedCount === totalCount;

  const toggleItem = (key: keyof VerificationChecklist, checked: boolean) => {
    setChecklist((prev) => ({ ...prev, [key]: checked }));
  };

  const toggleSelectAll = (checked: boolean) => {
    const next = { ...checklist };
    (Object.keys(next) as (keyof VerificationChecklist)[]).forEach((k) => {
      next[k] = checked;
    });
    setChecklist(next);
  };

  const handleConfirm = () => {
    if (!order) return;
    if (!allChecked) {
      return;
    }
    onConfirm(String(order.orderNumber));
  };

  const resetForm = () => {
    setChecklist(INITIAL_CHECKLIST);
    setNotes("");
    setChecklistOpen(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  if (!order) return null;

  const fraudRisk = order.fraudDetection;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto p-0'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b bg-muted/30'>
          <DialogTitle className='text-lg font-semibold tracking-tight'>
            Verify Order — {order.orderNumber}
          </DialogTitle>
          <DialogDescription className='text-sm'>
            Confirm order details by calling the customer and verifying
            inventory before proceeding to packaging.
          </DialogDescription>
        </DialogHeader>

        <div className='px-6 py-5 space-y-4'>
          {/* Fraud Risk Warning */}
          {fraudRisk && fraudRisk.isFraud && (
            <div className='flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/30 dark:border-red-900'>
              <AlertCircle className='h-4.5 w-4.5 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0' />
              <div className='flex-1 space-y-0.5'>
                <p className='text-sm font-semibold text-red-800 dark:text-red-400'>
                  Fraud Risk Detected
                </p>
                <p className='text-sm text-red-700 dark:text-red-400/90'>
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
          <div className='rounded-xl border bg-card shadow-sm p-3.5'>
            <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2.5'>
              Order Summary
            </h3>
            <div className='grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm'>
              <div className='flex items-center gap-2'>
                <span className='flex items-center justify-center h-7 w-7 rounded-md bg-muted shrink-0'>
                  <Phone className='h-3.5 w-3.5 text-muted-foreground' />
                </span>
                <div className='min-w-0'>
                  <p className='text-[11px] text-muted-foreground leading-none mb-0.5'>
                    Phone
                  </p>
                  <p className='font-medium truncate'>
                    {order.customer.phoneNumber}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <span className='flex items-center justify-center h-7 w-7 rounded-md bg-muted shrink-0'>
                  <Package className='h-3.5 w-3.5 text-muted-foreground' />
                </span>
                <div className='min-w-0'>
                  <p className='text-[11px] text-muted-foreground leading-none mb-0.5'>
                    Items
                  </p>
                  <p className='font-medium'>{order.products.length}</p>
                </div>
              </div>
              <div className='flex items-start gap-2 col-span-2'>
                <span className='flex items-center justify-center h-7 w-7 rounded-md bg-muted shrink-0'>
                  <MapPin className='h-3.5 w-3.5 text-muted-foreground' />
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='text-[11px] text-muted-foreground leading-none mb-0.5'>
                    Address
                  </p>
                  <p className='font-medium text-xs leading-snug'>
                    {order.shipping.address}
                    {order.shipping.district && `, ${order.shipping.district}`}
                    {order.shipping.division && `, ${order.shipping.division}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Checklist — collapsible */}
          <Collapsible
            open={checklistOpen}
            onOpenChange={setChecklistOpen}
            className='rounded-xl border bg-card shadow-sm overflow-hidden'>
            <CollapsibleTrigger asChild>
              <button
                type='button'
                className='w-full flex items-center justify-between gap-3 px-3.5 py-3 hover:bg-muted/40 transition-colors'>
                <div className='flex items-center gap-2.5'>
                  <span
                    className={cn(
                      "flex items-center justify-center h-7 w-7 rounded-md shrink-0 transition-colors",
                      allChecked
                        ? "bg-emerald-100 dark:bg-emerald-950/50"
                        : "bg-muted",
                    )}>
                    {allChecked ? (
                      <CheckCircle2 className='h-4 w-4 text-emerald-600 dark:text-emerald-500' />
                    ) : (
                      <ClipboardCheck className='h-4 w-4 text-muted-foreground' />
                    )}
                  </span>
                  <div className='text-left'>
                    <p className='text-sm font-semibold leading-none'>
                      Verification Checklist
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {completedCount} of {totalCount} completed
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2.5'>
                  <div className='hidden sm:block w-20 h-1.5 rounded-full bg-muted overflow-hidden'>
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        allChecked ? "bg-emerald-500" : "bg-primary",
                      )}
                      style={{
                        width: `${(completedCount / totalCount) * 100}%`,
                      }}
                    />
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      checklistOpen && "rotate-180",
                    )}
                  />
                </div>
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className='border-t px-3.5 py-3 space-y-2.5'>
                <div className='flex items-center justify-between'>
                  <p className='text-xs text-muted-foreground'>
                    Complete all steps before confirming the order.
                  </p>
                  <div className='flex items-center gap-1.5'>
                    <Checkbox
                      id='select-all'
                      checked={allChecked}
                      onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                    />
                    <Label
                      htmlFor='select-all'
                      className='cursor-pointer font-medium text-xs text-muted-foreground'>
                      Select all
                    </Label>
                  </div>
                </div>

                <div className='space-y-1'>
                  {CHECKLIST_ITEMS.map((item) => (
                    <div
                      key={item.key}
                      className={cn(
                        "flex items-start space-x-3 p-2 rounded-lg transition-colors",
                        checklist[item.key]
                          ? "bg-emerald-50/60 dark:bg-emerald-950/20"
                          : "hover:bg-accent/50",
                      )}>
                      <Checkbox
                        id={item.key}
                        checked={checklist[item.key]}
                        onCheckedChange={(checked) =>
                          toggleItem(item.key, !!checked)
                        }
                        className='mt-0.5'
                      />
                      <div className='flex-1'>
                        <Label
                          htmlFor={item.key}
                          className='cursor-pointer font-medium text-sm'>
                          {item.label}
                        </Label>
                        <p className='text-xs text-muted-foreground mt-0.5'>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Notes */}
          <div className='rounded-xl border bg-muted/20 overflow-hidden'>
            <div className='px-3.5 py-2 border-b bg-muted/40'>
              <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                Additional Notes
                <span className='ml-1.5 normal-case font-normal text-muted-foreground/70'>
                  (optional)
                </span>
              </p>
            </div>
            <div className='p-3.5'>
              <Label
                htmlFor='notes'
                className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5'>
                <FileText className='h-3.5 w-3.5' />
                Notes
              </Label>
              <Textarea
                id='notes'
                placeholder='Add any notes about the verification process...'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className='resize-none bg-background'
              />
            </div>
          </div>
        </div>

        <DialogFooter className='gap-2 px-6 pb-6 pt-3 border-t bg-background'>
          <Button
            variant='outline'
            onClick={() => {
              handleOpenChange(false);
              onCancel();
            }}
            disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!allChecked || loading}
            className='bg-emerald-600 hover:bg-emerald-700'>
            {loading
              ? "Confirming..."
              : allChecked
                ? "Confirm Order"
                : `Confirm Order (${completedCount}/${totalCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
