import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Ban,
  BarChart3,
  Clock,
  Flag,
  Loader2,
  RefreshCw,
  ShieldQuestion,
  ShoppingBag,
  UserCog,
  UserX,
} from "lucide-react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { cn } from "../../lib/utils";
import useRoleCheck from "../../pages/auth/hooks/useRoleCheck";
import {
  analyzeFraudCustomer,
  getCustomerRiskProfile,
  removeFromFraudGroup,
  type RiskLevel,
} from "../../api/fraud";
import type { CustomerRiskProfile } from "../../pages/order/interface.d";
import {
  BLOCKED_THEME,
  CARD_CLASS,
  CARD_HEADER_CLASS,
  EYEBROW_CLASS,
  expiryLabel,
  formatFraudDate,
  getRiskTheme,
} from "./fraudTheme";
import RiskBadge from "./RiskBadge";
import BlockedBadge from "./BlockedBadge";
import RiskScoreBar from "./RiskScoreBar";
import AddToFraudGroupDialog from "./AddToFraudGroupDialog";
import RiskOverrideDialog from "./RiskOverrideDialog";

interface FraudDetailPanelProps {
  phoneNumber: string;
  customerName?: string;
  /** Called after any mutation so the parent can refresh its list */
  onChanged?: () => void;
  /** Render without the action footer (e.g. read-only contexts) */
  hideActions?: boolean;
  className?: string;
}

/**
 * Full single-customer risk analysis with admin actions (analyze, risk-group
 * override, block/unblock). Used inside Sheets on the order pages and as the
 * detail view on the Fraud page.
 */
const FraudDetailPanel = ({
  phoneNumber,
  customerName,
  onChanged,
  hideActions = false,
  className,
}: FraudDetailPanelProps) => {
  const { hasRequiredPermission } = useRoleCheck();
  const canManage = hasRequiredPermission("fraud", "manage");
  const canBlock = hasRequiredPermission("fraud", "block");

  const [profile, setProfile] = useState<CustomerRiskProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [unblocking, setUnblocking] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    const result = await getCustomerRiskProfile(phoneNumber);
    if (result.success && result.data) {
      setProfile(result.data);
    } else {
      setProfile(null);
      setNotFound(true);
    }
    setLoading(false);
  }, [phoneNumber]);

  useEffect(() => {
    if (phoneNumber) fetchProfile();
  }, [phoneNumber, fetchProfile]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const result = await analyzeFraudCustomer(phoneNumber);
    setAnalyzing(false);
    if (result.success) {
      toast.success(`Analysis updated for ${phoneNumber}`);
      await fetchProfile();
      onChanged?.();
    } else {
      toast.error(
        result.error?.includes("No orders")
          ? "No orders found for this customer"
          : result.error || "Failed to analyze customer",
      );
    }
  };

  const handleUnblock = async () => {
    setUnblocking(true);
    const result = await removeFromFraudGroup(phoneNumber);
    setUnblocking(false);
    if (result.success) {
      toast.success(`${phoneNumber} removed from the fraud group`);
      await fetchProfile();
      onChanged?.();
    } else {
      toast.error(result.error || "Failed to remove customer from fraud group");
    }
  };

  const manualFraud = profile?.manualFraud;
  const isBlocked =
    profile?.blocked ??
    (!!manualFraud?.flagged &&
      (!manualFraud.expiresAt || new Date(manualFraud.expiresAt) > new Date()));
  const theme = getRiskTheme(profile?.riskLevel);
  const RiskIcon = theme.icon;

  const metrics = [
    {
      label: "Cancellation rate",
      value: profile?.cancellationRate?.toFixed(2) ?? 0,
    },
    { label: "Return rate", value: profile?.returnRate?.toFixed(2) ?? 0 },
    {
      label: "Completion rate",
      value: profile?.completionRate?.toFixed(2) ?? 0,
    },
  ];

  const orderStats = [
    { label: "Total", value: profile?.totalOrders ?? 0 },
    { label: "Completed", value: profile?.completedOrders ?? 0 },
    { label: "Cancelled", value: profile?.cancelledOrders ?? 0 },
    { label: "Returned", value: profile?.returnedOrders ?? 0 },
  ];

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-6 w-6 rounded-md' />
          <Skeleton className='h-5 w-40' />
          <Skeleton className='h-5 w-16 rounded-full' />
        </div>
        <Skeleton className='h-20 w-full rounded-lg' />
        <Skeleton className='h-24 w-full rounded-lg' />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className={cn("space-y-4", className)}>
        <div
          className={cn(
            CARD_CLASS,
            "flex flex-col items-center justify-center px-4 py-8 text-center",
          )}>
          <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 mb-3'>
            <ShieldQuestion className='w-5 h-5 text-slate-400' />
          </div>
          <div className='text-sm font-semibold text-slate-700 dark:text-slate-200'>
            Not analyzed yet
          </div>
          <p className='mt-1 text-[11px] text-slate-500 dark:text-slate-400 max-w-[280px]'>
            This customer has no risk profile. Run an analysis to build one from
            their order history.
          </p>
          {canManage && !hideActions ? (
            <Button
              size='sm'
              onClick={handleAnalyze}
              disabled={analyzing}
              className='mt-3 h-8 rounded-md gap-1.5 bg-[#141413] hover:bg-[#2a2a2a] text-white'>
              {analyzing ? (
                <Loader2 className='w-3.5 h-3.5 animate-spin' />
              ) : (
                <RefreshCw className='w-3.5 h-3.5' />
              )}
              Analyze now
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Customer header */}
      <div className={cn(CARD_CLASS)}>
        <div
          className={cn(
            CARD_HEADER_CLASS,
            "flex items-center justify-between gap-2",
          )}>
          <div className='flex items-center gap-2.5 min-w-0'>
            <div
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded-lg shadow-sm text-white shrink-0",
                theme.accentBg,
              )}>
              <RiskIcon className='w-3.5 h-3.5' />
            </div>
            <div className='min-w-0'>
              <div className='text-sm font-semibold text-slate-900 dark:text-slate-100 truncate'>
                {profile.customerName || customerName || "Unknown customer"}
              </div>
              <div className='text-[11px] text-slate-500 dark:text-slate-400 tabular-nums'>
                {profile.phoneNumber}
                {profile.email ? ` · ${profile.email}` : ""}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-1.5 shrink-0'>
            <RiskBadge level={profile.riskLevel} />
            {isBlocked ? (
              <BlockedBadge expiresAt={manualFraud?.expiresAt} />
            ) : null}
          </div>
        </div>

        {/* Scores */}
        <div className='px-3 py-3 grid grid-cols-2 gap-x-4 gap-y-3'>
          <RiskScoreBar
            label='Risk score'
            value={profile.riskScore}
            level={profile.riskLevel}
          />
          <RiskScoreBar
            label='Fraud probability'
            value={profile.riskScore}
            level={profile.riskLevel}
          />
        </div>
      </div>

      {/* Blocked / risk-group source info */}
      {isBlocked && manualFraud ? (
        <div
          className={cn(
            "flex items-start gap-2.5 rounded-md border p-2.5",
            BLOCKED_THEME.banner,
          )}>
          <Ban className='w-4 h-4 mt-0.5 shrink-0' />
          <div className='text-[11px] leading-relaxed'>
            <div className='font-semibold'>
              Blocked from ordering — {expiryLabel(manualFraud.expiresAt)}
            </div>
            {manualFraud.reason ? (
              <div className='opacity-90'>Reason: {manualFraud.reason}</div>
            ) : null}
            <div className='opacity-75'>
              Added by {manualFraud.addedBy || "admin"}
              {manualFraud.addedAt
                ? ` · ${formatFraudDate(manualFraud.addedAt)}`
                : ""}
            </div>
          </div>
        </div>
      ) : null}

      {profile.manualRiskOverride?.enabled ? (
        <div className='flex items-start gap-2.5 bg-amber-50/60 border border-amber-200/60 dark:bg-amber-950/40 dark:border-amber-800 rounded-md p-2.5'>
          <UserCog className='w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400' />
          <div className='text-[11px] leading-relaxed text-amber-800 dark:text-amber-200'>
            <div className='font-semibold'>
              Manual risk group: {profile.manualRiskOverride.level} — overrides
              automatic assessment
            </div>
            {profile.manualRiskOverride.reason ? (
              <div className='opacity-90'>
                Reason: {profile.manualRiskOverride.reason}
              </div>
            ) : null}
            <div className='opacity-75'>
              Set by {profile.manualRiskOverride.overriddenBy || "admin"}
              {profile.manualRiskOverride.overriddenAt
                ? ` · ${formatFraudDate(profile.manualRiskOverride.overriddenAt)}`
                : ""}
            </div>
          </div>
        </div>
      ) : null}

      {/* Order history */}
      <div className={cn(CARD_CLASS)}>
        <div className={cn(CARD_HEADER_CLASS, "flex items-center gap-1.5")}>
          <ShoppingBag className='w-3 h-3 text-slate-400' />
          <span className={EYEBROW_CLASS}>Order history</span>
        </div>
        <div className='px-3 py-3'>
          <div className='grid grid-cols-4 gap-2'>
            {orderStats.map((stat) => (
              <div
                key={stat.label}
                className='rounded-md border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 px-2 py-1.5 text-center'>
                <div className='text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums leading-none'>
                  {stat.value}
                </div>
                <div className={cn(EYEBROW_CLASS, "mt-1")}>{stat.label}</div>
              </div>
            ))}
          </div>
          <div className='mt-3 space-y-2.5'>
            {metrics.map((metric) => (
              <RiskScoreBar
                key={metric.label}
                label={metric.label}
                value={metric.value}
                level={profile.riskLevel}
              />
            ))}
          </div>
          <div className='mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400'>
            <Clock className='w-3 h-3' />
            Last analyzed: {formatFraudDate(profile.lastAnalyzedAt)}
          </div>
        </div>
      </div>

      {/* Fraud flags */}
      <div className={cn(CARD_CLASS)}>
        <div className={cn(CARD_HEADER_CLASS, "flex items-center gap-1.5")}>
          <Flag className='w-3 h-3 text-slate-400' />
          <span className={EYEBROW_CLASS}>
            Fraud flags{" "}
            {profile.fraudFlags?.length ? `(${profile.fraudFlags.length})` : ""}
          </span>
        </div>
        <div className='px-3 py-3'>
          {profile.fraudFlags?.length ? (
            <div className='flex flex-wrap gap-1.5'>
              {profile.fraudFlags.map((flag) => (
                <span
                  key={flag}
                  className='inline-flex items-center rounded-full border border-rose-200 bg-rose-50/60 px-2 py-0.5 text-[10px] text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'>
                  {flag}
                </span>
              ))}
            </div>
          ) : (
            <div className='flex items-center gap-1.5 text-[11px] text-slate-400'>
              <BarChart3 className='w-3 h-3' />
              No fraud flags — behavior looks normal
            </div>
          )}
        </div>
      </div>

      {/* Actions footer */}
      {!hideActions ? (
        <div className='flex flex-wrap items-center gap-2 pt-1'>
          {canManage ? (
            <Button
              variant='outline'
              size='sm'
              onClick={handleAnalyze}
              disabled={analyzing}
              className='h-7 px-2.5 text-[11px] rounded-md gap-1.5 border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300'>
              {analyzing ? (
                <Loader2 className='w-3 h-3 animate-spin' />
              ) : (
                <RefreshCw className='w-3 h-3' />
              )}
              Re-analyze
            </Button>
          ) : null}
          {canManage ? (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setOverrideDialogOpen(true)}
              className='h-7 px-2.5 text-[11px] rounded-md gap-1.5 border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300'>
              <UserCog className='w-3 h-3' />
              Set risk group
            </Button>
          ) : null}
          {canBlock ? (
            isBlocked ? (
              <Button
                variant='outline'
                size='sm'
                onClick={handleUnblock}
                disabled={unblocking}
                className='h-7 px-2.5 text-[11px] rounded-md gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/40'>
                {unblocking ? (
                  <Loader2 className='w-3 h-3 animate-spin' />
                ) : null}
                Remove from fraud group
              </Button>
            ) : (
              <Button
                size='sm'
                onClick={() => setBlockDialogOpen(true)}
                className='h-7 px-2.5 text-[11px] rounded-md gap-1.5 bg-rose-600 hover:bg-rose-700 text-white'>
                <UserX className='w-3 h-3' />
                Block customer
              </Button>
            )
          ) : null}
        </div>
      ) : null}

      <AddToFraudGroupDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        phoneNumber={phoneNumber}
        customerName={profile.customerName || customerName}
        onAdded={async () => {
          await fetchProfile();
          onChanged?.();
        }}
      />
      <RiskOverrideDialog
        open={overrideDialogOpen}
        onOpenChange={setOverrideDialogOpen}
        phoneNumber={phoneNumber}
        customerName={profile.customerName || customerName}
        currentLevel={profile.riskLevel as RiskLevel}
        hasOverride={!!profile.manualRiskOverride?.enabled}
        onSaved={async () => {
          await fetchProfile();
          onChanged?.();
        }}
      />
    </div>
  );
};

export default FraudDetailPanel;
