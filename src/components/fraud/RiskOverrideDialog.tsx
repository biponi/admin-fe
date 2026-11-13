import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  overrideRiskLevel,
  removeRiskOverride,
  type RiskLevel,
} from "../../api/fraud";
import { FRAUD_RISK_THEME, EYEBROW_CLASS } from "./fraudTheme";
import { cn } from "../../lib/utils";

interface RiskOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  customerName?: string;
  currentLevel?: RiskLevel;
  /** True when a manual override is currently active on this customer */
  hasOverride?: boolean;
  onSaved?: () => void;
}

const LEVELS: RiskLevel[] = ["green", "yellow", "red"];

/** Dialog for manually assigning a customer to a red/yellow/green risk group */
const RiskOverrideDialog = ({
  open,
  onOpenChange,
  phoneNumber,
  customerName,
  currentLevel = "green",
  hasOverride = false,
  onSaved,
}: RiskOverrideDialogProps) => {
  const [level, setLevel] = useState<RiskLevel>(currentLevel);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (open) {
      setLevel(currentLevel);
      setReason("");
    }
  }, [open, currentLevel]);

  const canSubmit = reason.trim().length > 0 && !submitting;

  const handleSave = async () => {
    setSubmitting(true);
    const result = await overrideRiskLevel(phoneNumber, {
      riskLevel: level,
      reason: reason.trim(),
    });
    setSubmitting(false);

    if (result.success) {
      toast.success(`Risk group set to ${level} for ${phoneNumber}`);
      onOpenChange(false);
      onSaved?.();
    } else {
      toast.error(result.error || "Failed to override risk level");
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    const result = await removeRiskOverride(phoneNumber);
    setRemoving(false);

    if (result.success) {
      toast.success(
        `Override removed — risk level now automatic (${result.data?.newRiskLevel ?? "recomputed"})`
      );
      onOpenChange(false);
      onSaved?.();
    } else {
      toast.error(result.error || "Failed to remove override");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg shadow-sm bg-[#141413] dark:bg-slate-700">
              <UserCog className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Set risk group
              </DialogTitle>
              <DialogDescription className="text-[11px] text-slate-500 dark:text-slate-400">
                {customerName ? `${customerName} · ` : ""}
                {phoneNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-4 py-4 space-y-4">
          {hasOverride ? (
            <div className="bg-amber-50/60 border border-amber-200/60 dark:bg-amber-950/40 dark:border-amber-800 rounded-md p-2.5 text-[11px] text-amber-800 dark:text-amber-200">
              This customer has a manual risk group assigned — it overrides the
              automatic assessment until removed.
            </div>
          ) : null}

          <div>
            <span className={EYEBROW_CLASS}>Risk group</span>
            <div className="mt-1.5 flex items-center gap-1.5">
              {LEVELS.map((lvl) => {
                const theme = FRAUD_RISK_THEME[lvl];
                const Icon = theme.icon;
                const active = level === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-full border transition-colors",
                      active
                        ? theme.badge
                        : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {theme.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className={EYEBROW_CLASS}>Reason (required)</span>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Verified legitimate wholesale customer — lowered to green"
              className="mt-1.5 text-[13px] border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              rows={3}
            />
          </div>

          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Setting a risk group changes the prepayment rules that apply to
            this customer. It does not block them from ordering — use Block
            customer for that.
          </p>
        </div>

        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between gap-2">
          {hasOverride ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={removing}
              onClick={handleRemove}
              className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md gap-1.5 dark:hover:bg-rose-950/40"
            >
              {removing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : null}
              Remove override
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
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
              onClick={handleSave}
              className="h-8 rounded-md gap-1.5 bg-[#141413] hover:bg-[#2a2a2a] text-white"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : null}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskOverrideDialog;
