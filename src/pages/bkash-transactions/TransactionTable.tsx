import {
  Ban,
  CheckCircle2,
  Clock,
  CreditCard,
  History,
  RotateCcw,
  Search,
  Timer,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { cn } from "../../lib/utils";
import { claude } from "../../lib/claude";
import { statusColors } from "../../lib/claudeChart";
import { formatFraudDate } from "../../components/fraud/fraudTheme";
import type { BkashEventType, BkashTransactionLog } from "../../api/bkashTransaction";

/**
 * Event tones on the Claude palette (statusColors good/warn/bad/neutral plus a
 * coral accent for refund events), mirroring the ToneBadge idiom from the
 * inventory report scaffold.
 */
type Tone = keyof typeof statusColors | "accent";

const ACCENT_TONE = { text: "#9A4B2E", bg: "#FAF0EA", border: "#F0D5C8" };
const toneColor = (tone: Tone) =>
  tone === "accent" ? ACCENT_TONE : statusColors[tone];

export const EVENT_TONE: Record<BkashEventType, { label: string; tone: Tone; icon: LucideIcon }> = {
  payment_initiated: { label: "Initiated", tone: "neutral", icon: CreditCard },
  create_result: { label: "Create Result", tone: "neutral", icon: CreditCard },
  callback_received: { label: "Callback", tone: "neutral", icon: History },
  execute_success: { label: "Executed", tone: "good", icon: CheckCircle2 },
  execute_failed: { label: "Failed", tone: "bad", icon: XCircle },
  order_converted: { label: "Converted", tone: "good", icon: CheckCircle2 },
  payment_timeout: { label: "Timeout", tone: "warn", icon: Timer },
  payment_not_found: { label: "Not Found", tone: "warn", icon: Clock },
  refund_initiated: { label: "Refund Started", tone: "accent", icon: RotateCcw },
  refund_success: { label: "Refunded", tone: "accent", icon: RotateCcw },
  refund_failed: { label: "Refund Failed", tone: "bad", icon: Ban },
  query: { label: "Query", tone: "neutral", icon: Search },
  search: { label: "Search", tone: "neutral", icon: Search },
};

export const EventBadge = ({ eventType }: { eventType: BkashEventType }) => {
  const event = EVENT_TONE[eventType] || EVENT_TONE.callback_received;
  const c = toneColor(event.tone);
  const Icon = event.icon;
  return (
    <span
      className='inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap'
      style={{ color: c.text, backgroundColor: c.bg, borderColor: c.border }}>
      <Icon className='h-3 w-3' />
      {event.label}
    </span>
  );
};

interface TransactionTableProps {
  logs: BkashTransactionLog[];
  loading: boolean;
  onView: (log: BkashTransactionLog) => void;
  emptyMessage?: string;
}

/** Table of bKash transaction log entries shared by the list/filter views */
const TransactionTable = ({
  logs,
  loading,
  onView,
  emptyMessage = "No transactions found",
}: TransactionTableProps) => {
  if (loading) {
    return (
      <div className='space-y-2 px-3 py-3'>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className='h-11 w-full rounded-md bg-[#F5F1EA]' />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center px-4 py-10 text-center'>
        <div className={cn(claude.iconTile, "mb-3")}>
          <CreditCard className='w-4 h-4' />
        </div>
        <div className='text-sm font-semibold text-[#141413]'>{emptyMessage}</div>
        <p className='mt-1 text-[11px] text-[#8A877D]'>
          Events are logged as customers move through bKash checkout.
        </p>
      </div>
    );
  }

  const th = cn(
    "h-9 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#8A877D]",
  );

  return (
    <Table>
      <TableHeader>
        <TableRow className='hover:bg-transparent border-[#E8E4DC]'>
          <TableHead className={th}>Event</TableHead>
          <TableHead className={th}>Payment / TrxID</TableHead>
          <TableHead className={th}>Order</TableHead>
          <TableHead className={cn(th, "hidden md:table-cell")}>Amount</TableHead>
          <TableHead className={cn(th, "hidden lg:table-cell")}>Mobile</TableHead>
          <TableHead className={cn(th, "hidden lg:table-cell")}>Source</TableHead>
          <TableHead className={th}>Time</TableHead>
          <TableHead className='h-9 px-3' />
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id} className='border-[#E8E4DC] hover:bg-[#F5F1EA]'>
            <TableCell className='px-3 py-2.5'>
              <EventBadge eventType={log.eventType} />
            </TableCell>
            <TableCell className='px-3 py-2.5'>
              <div className='text-[11px] font-mono text-[#141413] truncate max-w-[180px]'>
                {log.paymentId || "—"}
              </div>
              <div className='text-[10px] font-mono text-[#8A877D] truncate max-w-[180px]'>
                {log.trxID || ""}
              </div>
            </TableCell>
            <TableCell className='px-3 py-2.5'>
              <div className='text-[11px] text-[#57554D] tabular-nums'>
                {log.orderNumber ? `#${log.orderNumber}` : log.orderId || "—"}
              </div>
            </TableCell>
            <TableCell className='px-3 py-2.5 hidden md:table-cell'>
              <div className='text-[11px] font-semibold text-[#141413] tabular-nums'>
                {log.amount != null ? `৳${log.amount}` : "—"}
              </div>
            </TableCell>
            <TableCell className='px-3 py-2.5 hidden lg:table-cell'>
              <span className='text-[11px] text-[#57554D] tabular-nums'>
                {log.mobileNumber || "—"}
              </span>
            </TableCell>
            <TableCell className='px-3 py-2.5 hidden lg:table-cell'>
              <span className='text-[10px] text-[#8A877D]'>
                {log.context?.source || "—"}
              </span>
            </TableCell>
            <TableCell className='px-3 py-2.5'>
              <span className='text-[11px] text-[#8A877D] whitespace-nowrap'>
                {formatFraudDate(log.timestamps?.createdAt)}
              </span>
            </TableCell>
            <TableCell className='px-3 py-2.5 text-right'>
              <Button
                variant='outline'
                size='sm'
                disabled={!log.paymentId}
                onClick={() => onView(log)}
                className={cn(claude.btnOutline, "h-7 px-2.5 text-[11px] gap-1.5")}>
                <History className='h-3 w-3' />
                Timeline
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

/** Shared pagination footer */
export const TablePagination = ({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) => (
  <div className='flex items-center justify-between px-3 py-2 border-t border-[#E8E4DC] bg-[#FAF9F6]'>
    <span className={claude.microLabel}>
      Page {page + 1} of {Math.max(1, totalPages)}
    </span>
    <div className='flex items-center gap-1.5'>
      <Button
        variant='outline'
        size='sm'
        disabled={page <= 0}
        onClick={() => onChange(page - 1)}
        className={cn(claude.btnOutline, "h-7 px-2.5 text-[11px]")}>
        Previous
      </Button>
      <Button
        variant='outline'
        size='sm'
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        className={cn(claude.btnOutline, "h-7 px-2.5 text-[11px]")}>
        Next
      </Button>
    </div>
  </div>
);

export default TransactionTable;
