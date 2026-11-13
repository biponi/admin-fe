import { Clock, Hourglass, ShoppingBag, TimerOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import { cn } from "../../lib/utils";
import { claude } from "../../lib/claude";
import { statusColors } from "../../lib/claudeChart";
import { formatFraudDate } from "../../components/fraud/fraudTheme";
import type { PendingOrder, PendingOrderStatus } from "../../api/pendingOrder";

type Tone = keyof typeof statusColors | "accent";

const ACCENT_TONE = { text: "#9A4B2E", bg: "#FAF0EA", border: "#F0D5C8" };
const toneColor = (tone: Tone) =>
  tone === "accent" ? ACCENT_TONE : statusColors[tone];

export const STATUS_TONE: Record<
  PendingOrderStatus,
  { label: string; tone: Tone; icon: LucideIcon }
> = {
  awaiting_payment: { label: "Awaiting payment", tone: "accent", icon: Hourglass },
  converted: { label: "Converted", tone: "good", icon: ShoppingBag },
  cancelled: { label: "Cancelled", tone: "neutral", icon: TimerOff },
  payment_failed: { label: "Payment failed", tone: "bad", icon: TimerOff },
  product_unavailable: { label: "Product unavailable", tone: "warn", icon: Clock },
};

export const StatusBadge = ({ status }: { status: PendingOrderStatus }) => {
  const statusConfig = STATUS_TONE[status] || STATUS_TONE.cancelled;
  const c = toneColor(statusConfig.tone);
  const Icon = statusConfig.icon;
  return (
    <span
      className='inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap'
      style={{ color: c.text, backgroundColor: c.bg, borderColor: c.border }}>
      <Icon className='h-3 w-3' />
      {statusConfig.label}
    </span>
  );
};

interface PendingOrderTableProps {
  orders: PendingOrder[];
  loading: boolean;
  emptyMessage?: string;
}

/** Table of pending (pre-payment) orders */
const PendingOrderTable = ({
  orders,
  loading,
  emptyMessage = "No pending orders found",
}: PendingOrderTableProps) => {
  if (loading) {
    return (
      <div className='space-y-2 px-3 py-3'>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className='h-11 w-full rounded-md bg-[#F5F1EA]' />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center px-4 py-10 text-center'>
        <div className={cn(claude.iconTile, "mb-3")}>
          <ShoppingBag className='w-4 h-4' />
        </div>
        <div className='text-sm font-semibold text-[#141413]'>{emptyMessage}</div>
        <p className='mt-1 text-[11px] text-[#8A877D]'>
          Orders appear here the moment a customer starts bKash checkout.
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
          <TableHead className={th}>Order</TableHead>
          <TableHead className={th}>Customer</TableHead>
          <TableHead className={th}>Status</TableHead>
          <TableHead className={cn(th, "hidden md:table-cell")}>Items</TableHead>
          <TableHead className={cn(th, "hidden md:table-cell")}>Total</TableHead>
          <TableHead className={cn(th, "hidden lg:table-cell")}>PaymentID</TableHead>
          <TableHead className={th}>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow
            key={order.id}
            className='border-[#E8E4DC] hover:bg-[#F5F1EA]'>
            <TableCell className='px-3 py-2.5'>
              <div className='text-[11px] font-mono text-[#141413] truncate max-w-[140px]'>
                {order.tempOrderNumber}
              </div>
              <div className='text-[10px] text-[#8A877D] tabular-nums'>
                id: {order.id}
              </div>
            </TableCell>
            <TableCell className='px-3 py-2.5'>
              <div className='text-[12px] font-medium text-[#141413] truncate max-w-[150px]'>
                {order.customer?.name || "Unknown"}
              </div>
              <div className='text-[11px] text-[#8A877D] tabular-nums'>
                {order.customer?.phoneNumber}
              </div>
            </TableCell>
            <TableCell className='px-3 py-2.5'>
              <StatusBadge status={order.status} />
            </TableCell>
            <TableCell className='px-3 py-2.5 hidden md:table-cell'>
              <div className='text-[11px] text-[#57554D]'>
                {order.products?.length ?? 0} item
                {(order.products?.length ?? 0) === 1 ? "" : "s"}
              </div>
            </TableCell>
            <TableCell className='px-3 py-2.5 hidden md:table-cell'>
              <div className='text-[11px] font-semibold text-[#141413] tabular-nums'>
                ৳{order.totalPrice ?? 0}
              </div>
            </TableCell>
            <TableCell className='px-3 py-2.5 hidden lg:table-cell'>
              <span className='text-[10px] font-mono text-[#8A877D] truncate max-w-[160px] block'>
                {order.paymentId || "—"}
              </span>
            </TableCell>
            <TableCell className='px-3 py-2.5'>
              <span className='text-[11px] text-[#8A877D] whitespace-nowrap'>
                {formatFraudDate(order.createdAt)}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PendingOrderTable;
