/**
 * Mobile customer analytics — Material tree (<768px).
 *
 * Content-only shell: the route already wraps the page in MainView, so no
 * MobilePage app bar here. Toolbar (search + filter trigger + refresh),
 * claude-toned customer cards, MobileFilterSheet, MobileStickyActions bulk
 * bar and MobilePagination.
 */
import { useState } from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  Mail,
  Megaphone,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Checkbox } from "../../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  MobileEmptyState,
  MobileFilterSheet,
  MobileFilterTrigger,
  MobilePagination,
  MobileStaggeredList,
  MobileStickyActions,
} from "../../../../components/mobile";
import { claude } from "../../../../lib/claude";
import { statusColors } from "../../../../lib/claudeChart";
import { Customer, CustomerQueryParams } from "../../interface";

interface PaginationState {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface MobileCustomerAnalyticsProps {
  customers: Customer[] | null;
  pagination: PaginationState;
  params: CustomerQueryParams;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (v: "asc" | "desc") => void;
  selectedCustomers: Set<string>;
  onToggleCustomer: (phone: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onApplyFilters: () => void;
  onReset: () => void;
  onPageChange: (page: number) => void;
  onViewCustomer: (customer: Customer) => void;
  onBulkCommunicate: () => void;
  onRefresh: () => void;
  canBulkCommunicate: boolean;
  loading: boolean;
}

const initials = (name?: string) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const safeNum = (v: number | string | undefined) => {
  const n = Number(v);
  return (Number.isNaN(n) ? 0 : n).toLocaleString();
};

const safeFormatDate = (dateString: string | undefined, fmt: "short" | "long") => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(
    "en-US",
    fmt === "short"
      ? { month: "short", day: "numeric" }
      : { year: "numeric", month: "short", day: "numeric" },
  );
};

export const MobileCustomerAnalytics = ({
  customers,
  pagination,
  params,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  selectedCustomers,
  onToggleCustomer,
  onSelectAll,
  onClearSelection,
  onApplyFilters,
  onReset,
  onPageChange,
  onViewCustomer,
  onBulkCommunicate,
  onRefresh,
  canBulkCommunicate,
  loading,
}: MobileCustomerAnalyticsProps) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const rows = Array.isArray(customers) ? customers : [];
  const activeFilterCount =
    (searchQuery ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);
  const allSelected = rows.length > 0 && selectedCustomers.size === rows.length;
  // Defensive: fall back to "has a next page" when the API omits pagination
  const totalPages =
    pagination.totalPages ||
    (rows.length >= (params.limit || 20) ? (params.page || 1) + 1 : params.page || 1);

  const applyFilters = () => {
    onApplyFilters();
    setFiltersOpen(false);
  };

  return (
    <div className='space-y-4 pb-4'>
      {/* ── Toolbar: search + filters + refresh ──────────────────── */}
      <div className='flex items-center gap-2'>
        <div className='relative flex-1 min-w-0'>
          <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A877D]' />
          <Input
            className='h-10 rounded-full pl-10 pr-4 bg-card border-[#E8E4DC] text-sm'
            placeholder='Search name, phone, email…'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <MobileFilterTrigger
          onClick={() => setFiltersOpen(true)}
          activeCount={activeFilterCount}
        />
        <Button
          variant='ghost'
          size='icon'
          className='h-10 w-10 rounded-full shrink-0'
          onClick={onRefresh}
          disabled={loading}
          aria-label='Refresh customers'>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* ── Select-all / count row ───────────────────────────────── */}
      <div className='flex items-center justify-between px-0.5'>
        <button
          onClick={onSelectAll}
          className='flex items-center gap-2 text-[13px] text-[#57554D]'>
          <Checkbox checked={allSelected} aria-label='Select all customers' />
          Select all
        </button>
        <span className='text-[13px] text-[#8A877D] tabular-nums'>
          {pagination.total || rows.length} customers
        </span>
      </div>

      {/* ── Customer cards ───────────────────────────────────────── */}
      {rows.length > 0 ? (
        <MobileStaggeredList key={rows.length + "-" + params.page}>
          {rows.map((customer) => {
            const isSelected = selectedCustomers.has(customer.customerPhone);
            return (
              <div
                key={customer.customerPhone}
                onClick={() => onToggleCustomer(customer.customerPhone)}
                className={`m3-ripple relative w-full rounded-2xl border bg-card px-3.5 py-3 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "border-[#D97757]/40 bg-[#D97757]/[0.06]"
                    : "border-[#E8E4DC] active:bg-[#F5F1EA]"
                }`}>
                <div className='flex items-start gap-3'>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleCustomer(customer.customerPhone)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select ${customer.customerName}`}
                    className='mt-1.5'
                  />
                  <div className='h-10 w-10 shrink-0 rounded-full bg-[#D97757]/10 border border-[#D97757]/20 grid place-items-center text-[11px] font-semibold text-[#9A4B2E]'>
                    {initials(customer.customerName)}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between gap-2'>
                      <p className='font-medium text-[15px] text-[#141413] truncate'>
                        {customer.customerName}
                      </p>
                      <span
                        className='shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium'
                        style={{
                          color: statusColors.good.text,
                          backgroundColor: statusColors.good.bg,
                          borderColor: statusColors.good.border,
                        }}>
                        <Check className='h-2.5 w-2.5' />
                        Active
                      </span>
                    </div>
                    <div className='mt-1 space-y-0.5 text-xs text-[#57554D]'>
                      <div className='flex items-center gap-1.5'>
                        <Phone className='h-3 w-3 shrink-0' />
                        <span className='truncate'>{customer.customerPhone}</span>
                      </div>
                      {customer.customerEmail && (
                        <div className='flex items-center gap-1.5'>
                          <Mail className='h-3 w-3 shrink-0' />
                          <span className='truncate'>{customer.customerEmail}</span>
                        </div>
                      )}
                    </div>

                    {/* Mini stats */}
                    <div className='mt-2.5 grid grid-cols-3 gap-2'>
                      <div className='rounded-xl bg-[#FAF9F6] border border-[#F0EDE6] py-2 text-center'>
                        <ShoppingBag className='mx-auto h-3 w-3 text-[#8A877D]' />
                        <p className='text-[13px] font-semibold text-[#141413] mt-0.5 tabular-nums'>
                          {safeNum(customer.totalOrderCount)}
                        </p>
                        <p className='text-[10px] text-[#8A877D]'>Orders</p>
                      </div>
                      <div className='rounded-xl bg-[#FAF9F6] border border-[#F0EDE6] py-2 text-center'>
                        <Wallet className='mx-auto h-3 w-3 text-[#8A877D]' />
                        <p className='text-[13px] font-semibold text-[#141413] mt-0.5 tabular-nums'>
                          ৳{safeNum(customer.totalSpent)}
                        </p>
                        <p className='text-[10px] text-[#8A877D]'>Spent</p>
                      </div>
                      <div className='rounded-xl bg-[#FAF9F6] border border-[#F0EDE6] py-2 text-center'>
                        <Calendar className='mx-auto h-3 w-3 text-[#8A877D]' />
                        <p className='text-[13px] font-semibold text-[#141413] mt-0.5'>
                          {safeFormatDate(customer.lastOrderDate, "short")}
                        </p>
                        <p className='text-[10px] text-[#8A877D]'>Last order</p>
                      </div>
                    </div>

                    <Button
                      variant='outline'
                      size='sm'
                      className='w-full mt-2.5 h-9 border-[#E8E4DC] text-[#57554D] hover:bg-[#F5F1EA]'
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewCustomer(customer);
                      }}>
                      View details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </MobileStaggeredList>
      ) : (
        <MobileEmptyState
          icon={<UserRound className='h-7 w-7' />}
          title='No customers found'
          description='Try adjusting your search or filters'
          action={
            activeFilterCount > 0 ? (
              <Button
                variant='outline'
                size='sm'
                onClick={onReset}
                className='border-[#E8E4DC] text-[#57554D]'>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      )}

      {/* ── Pagination ───────────────────────────────────────────── */}
      <MobilePagination
        page={params.page || 1}
        totalPages={totalPages}
        onChange={onPageChange}
      />

      {/* ── Bulk selection bar ───────────────────────────────────── */}
      {selectedCustomers.size > 0 && (
        <MobileStickyActions>
          <div className='flex items-center gap-2'>
            <button
              onClick={onClearSelection}
              className='h-10 w-10 shrink-0 rounded-full grid place-items-center text-[#8A877D] hover:bg-[#F5F1EA]'
              aria-label='Clear selection'>
              <X className='h-4 w-4' />
            </button>
            {canBulkCommunicate && (
              <Button
                onClick={onBulkCommunicate}
                className='flex-1 h-10 bg-[#141413] hover:bg-[#57554D] text-white text-sm'>
                <Megaphone className='h-4 w-4 mr-2' />
                Message {selectedCustomers.size} customer
                {selectedCustomers.size !== 1 ? "s" : ""}
              </Button>
            )}
          </div>
        </MobileStickyActions>
      )}

      {/* ── Filter sheet ─────────────────────────────────────────── */}
      <MobileFilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title='Filters'
        onApply={applyFilters}
        onReset={onReset}>
        <div className='space-y-4'>
          <div>
            <label className={claude.microLabel + " mb-1.5 block"}>Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='h-10 text-sm border-[#E8E4DC] bg-white'>
                <SelectValue placeholder='All statuses' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All statuses</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
                <SelectItem value='blocked'>Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className={claude.microLabel + " mb-1.5 block"}>
                Sort by
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className='h-10 text-sm border-[#E8E4DC] bg-white'>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='name'>Name</SelectItem>
                  <SelectItem value='totalOrders'>Total orders</SelectItem>
                  <SelectItem value='totalSpent'>Total spent</SelectItem>
                  <SelectItem value='lastOrderDate'>Last order</SelectItem>
                  <SelectItem value='createdAt'>Created date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={claude.microLabel + " mb-1.5 block"}>
                Order
              </label>
              <Select
                value={sortOrder}
                onValueChange={(v) => setSortOrder(v as "asc" | "desc")}>
                <SelectTrigger className='h-10 text-sm border-[#E8E4DC] bg-white'>
                  <SelectValue placeholder='Order' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='asc'>Ascending</SelectItem>
                  <SelectItem value='desc'>Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                onReset();
                setFiltersOpen(false);
              }}
              className='flex items-center gap-1 text-xs font-medium text-[#57554D] hover:text-[#141413]'>
              <ChevronDown className='h-3.5 w-3.5 rotate-[-90deg]' />
              Clear all filters
            </button>
          )}
        </div>
      </MobileFilterSheet>
    </div>
  );
};

export default MobileCustomerAnalytics;
