import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  CreditCard,
  RefreshCw,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { cn } from "../../lib/utils";
import { claude } from "../../lib/claude";
import { PageHeader } from "../../components/PageHeader";
import {
  getBkashTransactionLogs,
  getBkashTransactionStats,
  type BkashEventType,
  type BkashTransactionLog,
  type BkashTransactionStats,
} from "../../api/bkashTransaction";
import TransactionTable, { TablePagination } from "./TransactionTable";
import TimelineSheet from "./TimelineSheet";

const PAGE_SIZE = 20;

const EVENT_FILTERS: { value: BkashEventType | "all"; label: string }[] = [
  { value: "all", label: "All events" },
  { value: "payment_initiated", label: "Initiated" },
  { value: "execute_success", label: "Executed (success)" },
  { value: "execute_failed", label: "Executed (failed)" },
  { value: "order_converted", label: "Order converted" },
  { value: "payment_timeout", label: "Payment timeout" },
  { value: "payment_not_found", label: "Payment not found" },
  { value: "refund_initiated", label: "Refund started" },
  { value: "refund_success", label: "Refund success" },
  { value: "refund_failed", label: "Refund failed" },
  { value: "query", label: "Query" },
  { value: "search", label: "Search" },
];

/** Claude-themed stat tile (ink value, accent icon tile) */
const StatTile = ({
  label,
  value,
  icon,
  tone = "neutral",
  sub,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  tone?: "good" | "bad" | "neutral";
  sub?: string;
}) => (
  <div
    className={cn(
      claude.card,
      "px-4 py-4 flex items-center gap-3 hover:border-[#D8D3C8] transition-colors",
    )}>
    <div
      className={cn(
        claude.iconTile,
        "shrink-0 border-0",
        tone === "good" && "bg-[#EBF7EE] text-[#1A7F37]",
        tone === "bad" && "bg-[#FBEFF3] text-[#B3365B]",
      )}>
      {icon}
    </div>
    <div className='min-w-0'>
      <p className='text-xl font-semibold text-[#141413] leading-none tabular-nums truncate'>
        {value}
      </p>
      <p className='text-xs text-[#8A877D] mt-1 truncate'>{label}</p>
      {sub ? <p className='text-[10px] text-[#8A877D] truncate'>{sub}</p> : null}
    </div>
  </div>
);

/** bKash transaction log viewer — stats, filterable list, per-payment timeline */
const BkashTransactionsPage = () => {
  const [stats, setStats] = useState<BkashTransactionStats | null>(null);
  const [logs, setLogs] = useState<BkashTransactionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [eventType, setEventType] = useState<BkashEventType | "all">("all");
  const [paymentIdQuery, setPaymentIdQuery] = useState("");
  const [trxIdQuery, setTrxIdQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Debounced copies applied to fetches
  const [debouncedPaymentId, setDebouncedPaymentId] = useState("");
  const [debouncedTrxId, setDebouncedTrxId] = useState("");

  const [detailPaymentId, setDetailPaymentId] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const result = await getBkashTransactionStats({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    if (result.success && result.data) setStats(result.data);
  }, [startDate, endDate]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const result = await getBkashTransactionLogs({
      page: page + 1, // backend is 1-based
      limit: PAGE_SIZE,
      eventType: eventType === "all" ? undefined : eventType,
      paymentId: debouncedPaymentId || undefined,
      trxID: debouncedTrxId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    if (result.success && result.data) {
      setLogs(result.data.logs);
      setTotalPages(result.data.pagination.totalPages || 1);
      setTotal(result.data.pagination.total);
    } else {
      toast.error(result.error || "Failed to load transaction logs");
    }
    setLoading(false);
  }, [page, eventType, debouncedPaymentId, debouncedTrxId, startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Debounce the search inputs; any filter change resets pagination
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPaymentId(paymentIdQuery.trim());
      setDebouncedTrxId(trxIdQuery.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [paymentIdQuery, trxIdQuery]);

  useEffect(() => {
    setPage(0);
  }, [eventType, debouncedPaymentId, debouncedTrxId, startDate, endDate]);

  const refreshAll = () => {
    fetchStats();
    fetchLogs();
  };

  const selectTriggerClass = cn(
    claude.input,
    "h-8 sm:w-44 justify-between",
  );

  return (
    <div className='w-full mx-auto px-4 py-5 space-y-4 md:container'>
      <PageHeader
        icon={<CreditCard className='w-5 h-5 text-white' />}
        title='bKash Transactions'
        subtitle='Gateway request, success, failure & refund history'
        count={<span className='text-[13px] text-[#8A877D]'>{total} events</span>}
        actions={
          <Button
            size='sm'
            onClick={refreshAll}
            className={cn(claude.btnPrimary, "h-8 gap-1.5")}>
            <RefreshCw className='w-3.5 h-3.5' />
            Refresh
          </Button>
        }
      />

      {/* Stats */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        <StatTile
          label='Total events'
          value={stats?.totalEvents ?? "—"}
          icon={<CreditCard className='h-4 w-4' />}
          sub='All logged interactions'
        />
        <StatTile
          label='Successful payments'
          value={stats?.eventCounts?.execute_success ?? 0}
          tone='good'
          icon={<CheckCircle2 className='h-4 w-4' />}
          sub='execute_success events'
        />
        <StatTile
          label='Collected'
          value={`৳${(stats?.collectedAmount ?? 0).toLocaleString()}`}
          tone='good'
          icon={<CheckCircle2 className='h-4 w-4' />}
          sub='Sum of successful payments'
        />
        <StatTile
          label='Refunded'
          value={`৳${(stats?.refundedAmount ?? 0).toLocaleString()}`}
          tone='bad'
          icon={<RotateCcw className='h-4 w-4' />}
          sub='Sum of successful refunds'
        />
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2'>
        <Input
          value={paymentIdQuery}
          onChange={(e) => setPaymentIdQuery(e.target.value)}
          placeholder='Filter by paymentID…'
          className={cn(claude.input, "h-8 sm:w-56")}
        />
        <Input
          value={trxIdQuery}
          onChange={(e) => setTrxIdQuery(e.target.value)}
          placeholder='Filter by trxID…'
          className={cn(claude.input, "h-8 sm:w-56")}
        />
        <Select
          value={eventType}
          onValueChange={(value) => setEventType(value as BkashEventType | "all")}>
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder='Event type' />
          </SelectTrigger>
          <SelectContent>
            {EVENT_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className='flex items-center gap-1.5'>
          <Input
            type='date'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={cn(claude.input, "h-8 sm:w-36")}
          />
          <span className='text-[11px] text-[#8A877D]'>→</span>
          <Input
            type='date'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={cn(claude.input, "h-8 sm:w-36")}
          />
        </div>
      </div>

      {/* Table */}
      <div className={cn(claude.card, "overflow-hidden")}>
        <TransactionTable
          logs={logs}
          loading={loading}
          onView={(log) => setDetailPaymentId(log.paymentId)}
        />
        <TablePagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <TimelineSheet
        open={!!detailPaymentId}
        onOpenChange={(open) => !open && setDetailPaymentId(null)}
        paymentId={detailPaymentId}
      />
    </div>
  );
};

export default BkashTransactionsPage;
