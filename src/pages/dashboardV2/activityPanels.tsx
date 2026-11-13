import { useMemo, useState } from "react";
import { Crown, Search, Star } from "lucide-react";
import { Input } from "../../components/ui/input";
import { BRAND_CONFIG } from "../../config/brand";
import { iconCircleClass, pillClass } from "./dashboardTheme";

interface TopCustomer {
  name: string;
  mobile: string;
  totalSpent: number;
  totalOrders: number;
}

interface BestProduct {
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

type TopNFilter = "all" | "3" | "5";

const TOP_N_OPTIONS: { value: TopNFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "3", label: "Top 3" },
  { value: "5", label: "Top 5" },
];

/** Shared activity-manager toolbar: white pill search + Top-N filter chips. */
const PanelToolbar = ({
  query,
  onQueryChange,
  placeholder,
  filter,
  onFilterChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  placeholder: string;
  filter: TopNFilter;
  onFilterChange: (v: TopNFilter) => void;
}) => (
  <div className='flex items-center gap-2 flex-wrap'>
    <div className='relative flex-1 min-w-[160px]'>
      <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9A9A98]' />
      <Input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        className='rounded-full bg-white border-0 h-9 pl-9 text-sm text-[#1A1A1A] placeholder:text-[#9A9A98] focus-visible:ring-[#E1573F]/40'
      />
    </div>
    {TOP_N_OPTIONS.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onFilterChange(opt.value)}
        className={`${pillClass} px-3 h-9 text-xs font-medium transition-colors ${
          filter === opt.value
            ? "bg-[#111111] text-white"
            : "text-[#1A1A1A] hover:bg-[#F7D9D2]/50"
        }`}>
        {opt.label}
      </button>
    ))}
  </div>
);

const RankChip: React.FC<{ rank: number }> = ({ rank }) => (
  <span
    className={`${pillClass} h-6 w-6 flex items-center justify-center text-[11px] font-bold shrink-0 ${
      rank === 1
        ? "bg-[#E1573F] text-white"
        : rank === 2
        ? "bg-[#F2A992] text-white"
        : rank === 3
        ? "bg-[#F7D9D2] text-[#E1573F]"
        : "text-[#9A9A98]"
    }`}>
    {rank}
  </span>
);

interface PanelProps {
  customers?: TopCustomer[];
  products?: BestProduct[];
  dateLabel?: string;
}

/**
 * Activity-manager style panels (reference: the "Activity manager" card in
 * src/assets/fgfg.webp) — Top Customers and Trending Products as white
 * sub-cards. Re-enables the previously hidden performance tables.
 */
export const TopCustomersPanel: React.FC<PanelProps> = ({
  customers = [],
  dateLabel,
}) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TopNFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = customers.filter(
      (c) =>
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.mobile?.includes(q)
    );
    if (filter !== "all") list = list.slice(0, Number(filter));
    return list;
  }, [customers, query, filter]);

  return (
    <div className='bg-[#EFEDEB] rounded-3xl p-4 sm:p-5 flex flex-col gap-3 h-full'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2.5 min-w-0'>
          <div className={`${iconCircleClass} h-9 w-9 text-[#E1573F] shrink-0`}>
            <Crown className='h-4 w-4' strokeWidth={1.5} />
          </div>
          <div className='min-w-0'>
            <p className='text-base font-semibold text-[#1A1A1A]'>
              Top Customers
            </p>
            {dateLabel && (
              <p className='text-[11px] text-[#9A9A98] truncate'>{dateLabel}</p>
            )}
          </div>
        </div>
        <span className='text-xs text-[#9A9A98] shrink-0'>
          {customers.length} total
        </span>
      </div>

      <PanelToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder='Search customers…'
        filter={filter}
        onFilterChange={setFilter}
      />

      <div className='flex flex-col gap-2 overflow-y-auto max-h-[320px] pr-1'>
        {filtered.length === 0 ? (
          <div className='bg-white rounded-2xl px-4 py-8 text-center text-sm text-[#9A9A98]'>
            No customers found in this period
          </div>
        ) : (
          filtered.map((customer, index) => (
            <div
              key={`${customer.mobile}-${index}`}
              className='bg-white rounded-2xl px-4 py-3 flex items-center gap-3'>
              <RankChip rank={index + 1} />
              <div className='h-9 w-9 rounded-full bg-[#F7D9D2] flex items-center justify-center text-sm font-bold text-[#E1573F] shrink-0'>
                {customer.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold text-[#1A1A1A] truncate'>
                  {customer.name || "Unknown"}
                </p>
                <p className='text-xs text-[#9A9A98] truncate'>
                  {customer.mobile} · {customer.totalOrders} orders
                </p>
              </div>
              <p className='text-sm font-bold text-[#E1573F] shrink-0'>
                {BRAND_CONFIG.currency} {customer.totalSpent?.toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const TrendingProductsPanel: React.FC<PanelProps> = ({
  products = [],
  dateLabel,
}) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TopNFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => !q || p.name?.toLowerCase().includes(q));
    if (filter !== "all") list = list.slice(0, Number(filter));
    return list;
  }, [products, query, filter]);

  return (
    <div className='bg-[#EFEDEB] rounded-3xl p-4 sm:p-5 flex flex-col gap-3 h-full'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2.5 min-w-0'>
          <div className={`${iconCircleClass} h-9 w-9 text-[#E1573F] shrink-0`}>
            <Star className='h-4 w-4' strokeWidth={1.5} />
          </div>
          <div className='min-w-0'>
            <p className='text-base font-semibold text-[#1A1A1A]'>
              Trending Products
            </p>
            {dateLabel && (
              <p className='text-[11px] text-[#9A9A98] truncate'>{dateLabel}</p>
            )}
          </div>
        </div>
        <span className='text-xs text-[#9A9A98] shrink-0'>
          {products.length} total
        </span>
      </div>

      <PanelToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder='Search products…'
        filter={filter}
        onFilterChange={setFilter}
      />

      <div className='flex flex-col gap-2 overflow-y-auto max-h-[320px] pr-1'>
        {filtered.length === 0 ? (
          <div className='bg-white rounded-2xl px-4 py-8 text-center text-sm text-[#9A9A98]'>
            No products found in this period
          </div>
        ) : (
          filtered.map((product, index) => (
            <div
              key={`${product.name}-${index}`}
              className='bg-white rounded-2xl px-4 py-3 flex items-center gap-3'>
              <RankChip rank={index + 1} />
              <div className='h-9 w-9 rounded-full bg-[#F2A992]/40 flex items-center justify-center text-sm font-bold text-[#E1573F] shrink-0'>
                {product.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold text-[#1A1A1A] truncate'>
                  {product.name || "Unknown"}
                </p>
                <p className='text-xs text-[#9A9A98] truncate'>
                  {product.totalQuantity} sold
                </p>
              </div>
              <p className='text-sm font-bold text-[#E1573F] shrink-0'>
                {BRAND_CONFIG.currency} {product.totalRevenue?.toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
