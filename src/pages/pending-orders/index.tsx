import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Hourglass, RefreshCw, ShoppingBag } from "lucide-react";
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
  getPendingOrders,
  type PendingOrder,
  type PendingOrderStatus,
} from "../../api/pendingOrder";
import PendingOrderTable from "./PendingOrderTable";
import { TablePagination } from "../bkash-transactions/TransactionTable";

const PAGE_SIZE = 20;

const STATUS_FILTERS: { value: PendingOrderStatus | "all"; label: string }[] = [
  { value: "awaiting_payment", label: "Awaiting payment" },
  { value: "all", label: "All statuses" },
  { value: "converted", label: "Converted" },
  { value: "cancelled", label: "Cancelled" },
  { value: "payment_failed", label: "Payment failed" },
  { value: "product_unavailable", label: "Product unavailable" },
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

/** Pending order list — pre-payment orders with live/TTL + history statuses */
const PendingOrdersPage = () => {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [liveCount, setLiveCount] = useState(0);
  const [status, setStatus] = useState<PendingOrderStatus | "all">(
    "awaiting_payment",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const result = await getPendingOrders({
      page: page + 1, // backend is 1-based
      limit: PAGE_SIZE,
      status,
      search: debouncedSearch || undefined,
    });
    if (result.success && result.data) {
      setOrders(result.data.pendingOrders);
      setTotalPages(result.data.pagination.totalPages || 1);
      setTotal(result.data.pagination.total);
      if (status === "awaiting_payment") {
        setLiveCount(result.data.pagination.total);
      }
    } else {
      toast.error(result.error || "Failed to load pending orders");
    }
    setLoading(false);
  }, [page, status, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Debounced search; any filter change resets pagination
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(0);
  }, [status, debouncedSearch]);

  return (
    <div className='w-full mx-auto px-4 py-5 space-y-4 md:container'>
      <PageHeader
        icon={<ShoppingBag className='w-5 h-5 text-white' />}
        title='Pending Orders'
        subtitle='Pre-payment orders awaiting bKash checkout completion'
        count={<span className='text-[13px] text-[#8A877D]'>{total} orders</span>}
        actions={
          <Button
            size='sm'
            onClick={fetchOrders}
            className={cn(claude.btnPrimary, "h-8 gap-1.5")}>
            <RefreshCw className='w-3.5 h-3.5' />
            Refresh
          </Button>
        }
      />

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        <StatTile
          label='Awaiting payment'
          value={liveCount ?? "—"}
          tone='neutral'
          icon={<Hourglass className='h-4 w-4' />}
          sub='Live unpaid sessions'
        />
        <StatTile
          label='Shown'
          value={total}
          icon={<ShoppingBag className='h-4 w-4' />}
          sub='Current filter result'
        />
      </div>

      <p className='text-[11px] text-[#8A877D]'>
        Orders awaiting payment are auto-deleted ~8 minutes after creation
        (TTL). Terminal statuses — converted, cancelled, payment failed — are
        kept permanently as history.
      </p>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2'>
        <Select
          value={status}
          onValueChange={(value) =>
            setStatus(value as PendingOrderStatus | "all")
          }>
          <SelectTrigger className={cn(claude.input, "h-8 sm:w-48 justify-between")}>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Search order id, temp ref, paymentID, customer…'
          className={cn(claude.input, "h-8 sm:w-80")}
        />
      </div>

      {/* Table */}
      <div className={cn(claude.card, "overflow-hidden")}>
        <PendingOrderTable orders={orders} loading={loading} />
        <TablePagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
};

export default PendingOrdersPage;
