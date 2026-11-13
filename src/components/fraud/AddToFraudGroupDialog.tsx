import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ban, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { addToFraudGroup } from "../../api/fraud";
import { BLOCKED_THEME, EYEBROW_CLASS } from "./fraudTheme";
import { cn } from "../../lib/utils";

interface AddToFraudGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  customerName?: string;
  onAdded?: () => void;
}

const EXPIRY_PRESETS = [
  { label: "Permanent", days: undefined },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

/** Dialog to block a customer from placing orders (manual fraud group) */
const AddToFraudGroupDialog = ({
  open,
  onOpenChange,
  phoneNumber,
  customerName,
  onAdded,
}: AddToFraudGroupDialogProps) => {
  const [reason, setReason] = useState("");
  const [expiryDays, setExpiryDays] = useState<number | undefined>(undefined);
  const [customDays, setCustomDays] = useState("");
  const [useCustomDays, setUseCustomDays] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
      setExpiryDays(undefined);
      setCustomDays("");
      setUseCustomDays(false);
    }
  }, [open]);

  const validCustomDays =
    !useCustomDays || (/^\d+$/.test(customDays) && parseInt(customDays) > 0);

  const canSubmit = reason.trim().length > 0 && validCustomDays && !submitting;

  const handleSubmit = async () => {
    setSubmitting(true);
    const days = useCustomDays ? parseInt(customDays) : expiryDays;
    const result = await addToFraudGroup(phoneNumber, {
      reason: reason.trim(),
      expiresInDays: days,
    });
    setSubmitting(false);

    if (result.success) {
      toast.success(
        `${phoneNumber} added to the fraud group${days ? ` for ${days} days` : " (permanent)"}`
      );
      onOpenChange(false);
      onAdded?.();
    } else {
      toast.error(result.error || "Failed to add customer to fraud group");
    }
  };

  const Icon = BLOCKED_THEME.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/40 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded-lg shadow-sm text-white",
                "bg-gradient-to-br from-rose-500 to-red-600"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Block customer
              </DialogTitle>
              <DialogDescription className="text-[11px] text-slate-500 dark:text-slate-400">
                {customerName ? `${customerName} · ` : ""}
                {phoneNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-4 py-4 space-y-4">
          <div>
            <span className={EYEBROW_CLASS}>Reason (required)</span>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Repeated COD refusal, fake orders…"
              className="mt-1.5 text-[13px] border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              rows={3}
            />
          </div>

          <div>
            <span className={EYEBROW_CLASS}>Duration</span>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {EXPIRY_PRESETS.map((preset) => {
                const active = !useCustomDays && expiryDays === preset.days;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setUseCustomDays(false);
                      setExpiryDays(preset.days);
                    }}
                    className={cn(
                      "px-2 py-1 text-[11px] rounded-full border transition-colors",
                      active
                        ? "bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-950/60 dark:border-rose-700 dark:text-rose-300"
                        : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setUseCustomDays(true)}
                className={cn(
                  "px-2 py-1 text-[11px] rounded-full border transition-colors",
                  useCustomDays
                    ? "bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-950/60 dark:border-rose-700 dark:text-rose-300"
                    : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
                )}
              >
                Custom…
              </button>
            </div>
            {useCustomDays ? (
              <div className="mt-2 flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="30"
                  className="h-7 w-24 text-[12px] border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  days
                </span>
                {!validCustomDays ? (
                  <span className="text-[11px] text-rose-600">
                    Must be a positive number
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Blocked customers cannot place orders on the storefront or the
            admin panel until removed or the duration expires.
          </p>
        </div>

        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 border-slate-300 text-slate-600 hover:bg-slate-50 rounded-md gap-1.5 dark:border-slate-600 dark:text-slate-300"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="h-8 rounded-md gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Ban className="w-3.5 h-3.5" />
            )}
            Block customer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToFraudGroupDialog;
