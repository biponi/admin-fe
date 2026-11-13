import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Ban, Loader2, Plus, Search, UserX } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import { cn } from "../../lib/utils";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { getFraudGroup, removeFromFraudGroup } from "../../api/fraud";
import type { FraudGroupItem } from "../order/interface.d";
import {
  CARD_CLASS,
  CARD_HEADER_CLASS,
  EYEBROW_CLASS,
  expiryLabel,
  formatFraudDate,
} from "../../components/fraud/fraudTheme";
import RiskBadge from "../../components/fraud/RiskBadge";
import BlockedBadge from "../../components/fraud/BlockedBadge";
import AddToFraudGroupDialog from "../../components/fraud/AddToFraudGroupDialog";
import CustomerDetailSheet from "./CustomerDetailSheet";

const PAGE_SIZE = 20;

/** Blocked customers tab — the manual fraud group (block list) */
const FraudGroupTab = () => {
  const { hasRequiredPermission } = useRoleCheck();
  const canBlock = hasRequiredPermission("fraud", "block");

  const [items, setItems] = useState<FraudGroupItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [removingPhone, setRemovingPhone] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [manualPhone, setManualPhone] = useState("");
  const [detailPhone, setDetailPhone] = useState<string | null>(null);
  const [detailName, setDetailName] = useState<string | undefined>();

  const fetchGroup = useCallback(async () => {
    setLoading(true);
    const result = await getFraudGroup({ page, limit: PAGE_SIZE });
    if (result.success && result.data) {
      setItems(result.data.items);
      setTotal(result.data.total);
      setTotalPages(Math.ceil(result.data.total / PAGE_SIZE) || 1);
    } else {
      toast.error(result.error || "Failed to load fraud group");
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const handleRemove = async (item: FraudGroupItem) => {
    setRemovingPhone(item.phoneNumber);
    const result = await removeFromFraudGroup(item.phoneNumber);
    setRemovingPhone(null);
    if (result.success) {
      toast.success(`${item.phoneNumber} removed from the fraud group`);
      fetchGroup();
    } else {
      toast.error(result.error || "Failed to remove customer");
    }
  };

  const handleAddByPhone = () => {
    if (!manualPhone.trim()) {
      toast.error("Enter a customer phone number");
      return;
    }
    setDetailPhone(null);
    setAddDialogOpen(true);
  };

  return (
    <div className='space-y-3'>
      <div className={cn(CARD_CLASS)}>
        <div
          className={cn(
            CARD_HEADER_CLASS,
            "flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          )}
        >
          <div className='flex items-center gap-1.5'>
            <Ban className='w-3 h-3 text-rose-500' />
            <span className={EYEBROW_CLASS}>
              Blocked customers ({total})
            </span>
          </div>
          {canBlock ? (
            <div className='flex items-center gap-1.5'>
              <div className='relative'>
                <Search className='absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400' />
                <Input
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder='Block by phone number…'
                  className='h-7 w-44 pl-7 text-[11px] border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                />
              </div>
              <Button
                size='sm'
                onClick={handleAddByPhone}
                className='h-7 px-2.5 text-[11px] rounded-md gap-1.5 bg-rose-600 hover:bg-rose-700 text-white'
              >
                <Plus className='w-3 h-3' />
                Block
              </Button>
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className='space-y-2 px-3 py-3'>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className='h-11 w-full rounded-md' />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className='flex flex-col items-center justify-center px-4 py-10 text-center'>
            <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 mb-3'>
              <UserX className='w-5 h-5 text-emerald-600 dark:text-emerald-400' />
            </div>
            <div className='text-sm font-semibold text-slate-700 dark:text-slate-200'>
              No blocked customers
            </div>
            <p className='mt-1 text-[11px] text-slate-500 dark:text-slate-400 max-w-[280px]'>
              Add a customer to the fraud group to block them from placing
              orders.
            </p>
          </div>
        ) : (
          <div className='divide-y divide-slate-100 dark:divide-slate-700'>
            {items.map((item) => {
              const expired =
                item.isExpired ??
                (!!item.manualFraud?.expiresAt &&
                  new Date(item.manualFraud.expiresAt) <= new Date());

              return (
                <div
                  key={item.phoneNumber}
                  className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2.5'
                >
                  <div className='flex items-center gap-2.5 min-w-0'>
                    <div
                      className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-lg shrink-0",
                        expired
                          ? "bg-slate-100 dark:bg-slate-700 text-slate-400"
                          : "bg-rose-600 text-white shadow-sm"
                      )}
                    >
                      <Ban className='w-3.5 h-3.5' />
                    </div>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-1.5'>
                        <span className='text-[12px] font-medium text-slate-900 dark:text-slate-100 truncate max-w-[160px]'>
                          {item.customerName || "Unknown"}
                        </span>
                        <RiskBadge level={item.riskLevel} compact />
                        {expired ? null : (
                          <BlockedBadge
                            expiresAt={item.manualFraud?.expiresAt}
                          />
                        )}
                      </div>
                      <div className='text-[11px] text-slate-500 dark:text-slate-400 truncate'>
                        <span className='tabular-nums'>{item.phoneNumber}</span>
                        {" · "}
                        {expired ? "Expired — no longer blocking" : expiryLabel(item.manualFraud?.expiresAt)}
                        {item.manualFraud?.addedAt
                          ? ` · added ${formatFraudDate(item.manualFraud.addedAt)}`
                          : ""}
                        {item.manualFraud?.addedBy
                          ? ` by ${item.manualFraud.addedBy}`
                          : ""}
                      </div>
                      {item.manualFraud?.reason ? (
                        <div className='text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[420px]'>
                          Reason: {item.manualFraud.reason}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className='flex items-center gap-1.5 shrink-0'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        setDetailPhone(item.phoneNumber);
                        setDetailName(item.customerName);
                      }}
                      className='h-7 px-2.5 text-[11px] rounded-md border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300'
                    >
                      Details
                    </Button>
                    {canBlock ? (
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={removingPhone === item.phoneNumber}
                        onClick={() => handleRemove(item)}
                        className='h-7 px-2.5 text-[11px] rounded-md gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/40'
                      >
                        {removingPhone === item.phoneNumber ? (
                          <Loader2 className='w-3 h-3 animate-spin' />
                        ) : null}
                        Unblock
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 ? (
          <div className='flex items-center justify-between px-3 py-2 border-t border-slate-100 dark:border-slate-700'>
            <span className={EYEBROW_CLASS}>
              Page {page + 1} of {totalPages}
            </span>
            <div className='flex items-center gap-1.5'>
              <Button
                variant='outline'
                size='sm'
                disabled={page <= 0}
                onClick={() => setPage(page - 1)}
                className='h-7 px-2.5 text-[11px] rounded-md border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'
              >
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className='h-7 px-2.5 text-[11px] rounded-md border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <AddToFraudGroupDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        phoneNumber={manualPhone.trim()}
        onAdded={() => {
          setManualPhone("");
          fetchGroup();
        }}
      />
      <CustomerDetailSheet
        open={!!detailPhone}
        onOpenChange={(open) => !open && setDetailPhone(null)}
        phoneNumber={detailPhone}
        customerName={detailName}
        onChanged={fetchGroup}
      />
    </div>
  );
};

export default FraudGroupTab;
