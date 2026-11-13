import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import {
  Eye,
  X,
  User,
  UsersRound,
  Megaphone,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import { useCustomerAnalytics } from "./hooks/useCustomerAnalytics";
import { Customer, CustomerQueryParams } from "./interface";
import { format } from "date-fns";
import CustomerStats from "./components/CustomerStats";
import CustomerInsights from "./components/CustomerInsights";
import CustomerDetailsModal from "./components/CustomerDetailsModal";
import BulkCommunicationModal from "../bulk-communication/components/BulkCommunicationModal";
import MobileCustomerAnalytics from "./components/mobile/MobileCustomerAnalytics";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { useIsMobile } from "../../hooks/use-mobile";
import { PageHeader } from "../../components/PageHeader";
import { claude } from "@/lib/claude";
import { statusColors } from "@/lib/claudeChart";

const CustomerAnalytics = () => {
  const { loading, customers, pagination, fetchCustomers } =
    useCustomerAnalytics();

  const safeFormatDate = (
    dateString: string | undefined,
    formatString: string = "MMM dd, yyyy",
  ) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "—";
      return format(date, formatString);
    } catch {
      return "—";
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCustomerPhone, setSelectedCustomerPhone] =
    useState<string>("");
  const [selectedCustomerEmail, setSelectedCustomerEmail] =
    useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [params, setParams] = useState<CustomerQueryParams>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(
    new Set(),
  );
  const [bulkCommModalOpen, setBulkCommModalOpen] = useState(false);
  const [topCustomersForBulk, setTopCustomersForBulk] = useState<any[]>([]);
  const isMobile = useIsMobile();
  const { hasRequiredPermission } = useRoleCheck();

  useEffect(() => {
    fetchCustomers(params);
  }, [fetchCustomers, params]);

  // API may send numerics as strings — coerce before any math/format
  const rows = (Array.isArray(customers) ? customers : []).map((c) => ({
    ...c,
    totalOrderCount: Number(c.totalOrderCount) || 0,
    totalSpent: Number(c.totalSpent) || 0,
  }));

  const handleFilter = () => {
    const newParams: CustomerQueryParams = {
      ...params,
      search: searchQuery || undefined,
      status: statusFilter !== "all" ? (statusFilter as any) : undefined,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      page: 1,
    };
    setParams(newParams);
    fetchCustomers(newParams);
  };

  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    const newParams: CustomerQueryParams = {
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setParams(newParams);
    fetchCustomers(newParams);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomerPhone(customer.customerPhone);
    setSelectedCustomerEmail(customer.customerEmail || "");
    setIsModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    const newParams: CustomerQueryParams = { ...params, page: newPage };
    setParams(newParams);
    fetchCustomers(newParams);
  };

  const handleSelectCustomer = (phone: string) => {
    const newSelection = new Set(selectedCustomers);
    if (newSelection.has(phone)) {
      newSelection.delete(phone);
    } else {
      newSelection.add(phone);
    }
    setSelectedCustomers(newSelection);
  };

  const handleSelectAll = () => {
    if (!rows.length) return;
    if (selectedCustomers.size === rows.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(rows.map((c) => c.customerPhone)));
    }
  };

  const handleClearSelection = () => {
    setSelectedCustomers(new Set());
  };

  const selectedCustomersData = rows.filter((c) =>
    selectedCustomers.has(c.customerPhone),
  );

  const handleTopCustomersBulkComm = (customers: any[]) => {
    setTopCustomersForBulk(customers);
    setBulkCommModalOpen(true);
  };

  const getBulkCommCustomers = () => {
    if (topCustomersForBulk.length > 0) {
      return topCustomersForBulk;
    }
    return selectedCustomersData.map((c) => ({
      name: c.customerName,
      phone: c.customerPhone,
      email: c.customerEmail,
    }));
  };

  const handleBulkCommModalClose = (open: boolean) => {
    if (!open) {
      setTopCustomersForBulk([]);
    }
    setBulkCommModalOpen(open);
  };

  const initials = (name?: string) =>
    (name || "?")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");

  const canBulkCommunicate = hasRequiredPermission("BulkCommunication", "create");
  const activeFilterCount =
    (searchQuery ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);
  const totalCustomers = pagination.total || rows.length;
  // Share-of-top-spender bars in the Total spent column
  const maxSpent = Math.max(...rows.map((c) => c.totalSpent), 0);
  // Defensive: fall back to "has a next page" when the API omits pagination
  const totalPages =
    pagination.totalPages ||
    (rows.length >= (params.limit || 20) ? (params.page || 1) + 1 : params.page || 1);

  if (loading && !customers) {
    return (
      <div className='flex items-center justify-center h-[70vh]'>
        <div
          className={
            claude.card +
            " flex flex-col items-center gap-3 text-center px-12 py-10"
          }>
          <div className={claude.spinner} />
          <p className='text-sm font-medium text-[#141413]'>
            Loading customers…
          </p>
          <p className='text-xs text-[#8A877D]'>This won't take long</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     Shared modals — rendered once for both trees
  ═══════════════════════════════════════════════════════ */
  const modals = (
    <>
      <CustomerDetailsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        phone={selectedCustomerPhone}
        email={selectedCustomerEmail}
      />
      <BulkCommunicationModal
        open={bulkCommModalOpen}
        onOpenChange={handleBulkCommModalClose}
        customers={getBulkCommCustomers()}
      />
    </>
  );

  /* ═══════════════════════════════════════════════════════
     MOBILE — Material tree (mobile kit)
  ═══════════════════════════════════════════════════════ */
  if (isMobile) {
    return (
      <>
        <div className='px-3 sm:px-4'>
          <CustomerStats onBulkCommunicate={handleTopCustomersBulkComm} />
          <div className='mt-4'>
            <MobileCustomerAnalytics
              customers={rows}
              pagination={pagination}
              params={params}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              selectedCustomers={selectedCustomers}
              onToggleCustomer={handleSelectCustomer}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onApplyFilters={handleFilter}
              onReset={handleReset}
              onPageChange={handlePageChange}
              onViewCustomer={handleViewCustomer}
              onBulkCommunicate={() => setBulkCommModalOpen(true)}
              onRefresh={() => fetchCustomers(params)}
              canBulkCommunicate={canBulkCommunicate}
              loading={loading}
            />
          </div>
        </div>
        {modals}
      </>
    );
  }

  /* ═══════════════════════════════════════════════════════
     DESKTOP — Claude tree
  ═══════════════════════════════════════════════════════ */
  return (
    <>
      <div className='flex flex-col h-full bg-[#FAF9F6] text-[#141413]'>
        {/* ── Sticky Header ──────────────────────────────────── */}
        <div className='bg-[#FAF9F6]/95 lg:container sticky top-0 z-40'>
          <div className='px-4 sm:px-6 lg:px-6'>
            <div className='py-3'>
              <PageHeader
                icon={<UsersRound className='h-5 w-5' />}
                title='Customer Analytics'
                subtitle='Analyze customer behaviour, orders and lifetime value'
                count={
                  <span className='text-base font-semibold text-[#8A877D] tabular-nums'>
                    {totalCustomers} total
                  </span>
                }
                actions={
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleReset}
                    className='hidden sm:flex items-center gap-1.5 h-9 text-[#57554D] border-[#E8E4DC] hover:bg-[#F5F1EA]'>
                    <X className='h-3.5 w-3.5' />
                    <span>Reset</span>
                  </Button>
                }
              />
            </div>
          </div>
        </div>
        {/* ── Content ────────────────────────────────────────── */}
        <div className='flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-5'>
          <div className='max-w-7xl mx-auto space-y-5'>
            {/* Stats */}
            <CustomerStats onBulkCommunicate={handleTopCustomersBulkComm} />
            {/* Charts + payment health */}
            <CustomerInsights customers={rows} />
            {/* Filter toolbar — compact single row, wraps on narrow widths */}
            <div className={claude.card + " px-4 py-3"}>
              <div className='flex flex-wrap items-center gap-2'>
                <div className='flex items-center gap-2 mr-1'>
                  <span className={claude.iconTile}>
                    <SlidersHorizontal className='h-4 w-4' />
                  </span>
                  <span className='text-sm font-semibold text-[#141413]'>
                    Filters
                  </span>
                  {activeFilterCount > 0 && (
                    <span className={claude.badge}>{activeFilterCount}</span>
                  )}
                </div>
                <div className='relative flex-1 min-w-[200px]'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A877D]' />
                  <Input
                    className={claude.input + " pl-9"}
                    placeholder='Search name, phone, email…'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='h-9 w-[140px] text-[13px] border-[#E8E4DC] bg-white'>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All statuses</SelectItem>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='inactive'>Inactive</SelectItem>
                    <SelectItem value='blocked'>Blocked</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className='h-9 w-[160px] text-[13px] border-[#E8E4DC] bg-white'>
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
                <Select
                  value={sortOrder}
                  onValueChange={(v) => setSortOrder(v as "asc" | "desc")}>
                  <SelectTrigger className='h-9 w-[130px] text-[13px] border-[#E8E4DC] bg-white'>
                    <SelectValue placeholder='Order' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='asc'>Ascending</SelectItem>
                    <SelectItem value='desc'>Descending</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleFilter} className={claude.btnDeep + " h-9 px-5"}>
                  Apply
                </Button>
                <Button
                  onClick={handleReset}
                  variant='outline'
                  className='h-9 border-[#E8E4DC] text-[#57554D] hover:bg-[#F5F1EA]'>
                  <X className='h-3.5 w-3.5 mr-1.5' />
                  Reset
                </Button>
              </div>
            </div>
            {/* Bulk Actions Bar */}
            {selectedCustomers.size > 0 && (
              <div className='sticky top-16 z-10 rounded-xl border border-[#D97757]/30 bg-[#FAF9F6] px-5 py-3'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <div className='flex items-center gap-3 flex-wrap'>
                    <div className='bg-[#B85A3D] text-white px-3.5 py-1.5 rounded-full text-sm font-medium'>
                      {selectedCustomers.size} selected
                    </div>
                    {canBulkCommunicate && (
                      <Button
                        onClick={() => setBulkCommModalOpen(true)}
                        className='bg-[#141413] hover:bg-[#57554D] h-9 text-sm'
                        size='sm'>
                        <Megaphone className='h-4 w-4 mr-2' />
                        Send bulk SMS/Email
                      </Button>
                    )}
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleClearSelection}
                    className='text-[#57554D] hover:text-[#141413] h-9'>
                    <X className='h-4 w-4 mr-1.5' />
                    Clear selection
                  </Button>
                </div>
              </div>
            )}
            {/* Table */}
            <div className={claude.card + " overflow-hidden"}>
              {/* Card header strip */}
              <div
                className={
                  claude.cardHeader +
                  " flex flex-wrap items-center justify-between gap-2 px-5 py-3"
                }>
                <div className='flex items-center gap-2.5'>
                  <span className={claude.iconTile}>
                    <User className='h-4 w-4' />
                  </span>
                  <span>
                    <span className='block text-sm font-semibold text-[#141413]'>
                      Customer directory
                    </span>
                    <span className='block text-xs text-[#8A877D]'>
                      {rows.length} on this page · {totalCustomers} total
                    </span>
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  {selectedCustomers.size > 0 && (
                    <span className={claude.badge}>
                      {selectedCustomers.size} selected
                    </span>
                  )}
                  <Checkbox
                    checked={
                      rows.length > 0 && selectedCustomers.size === rows.length
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label='Select all customers'
                  />
                  <span className='text-xs text-[#57554D]'>Select all</span>
                </div>
              </div>

              <div className='max-h-[600px] overflow-auto'>
                <Table divClass='relative'>
                  <TableHeader className='sticky top-0 bg-[#FAF9F6] border-b border-[#E8E4DC] z-10'>
                    <TableRow className='hover:bg-transparent'>
                      <TableHead className='w-12' />
                      <TableHead className={claude.microLabel}>
                        Customer
                      </TableHead>
                      <TableHead className={claude.microLabel}>Email</TableHead>
                      <TableHead className={claude.microLabel}>
                        Status
                      </TableHead>
                      <TableHead className={claude.microLabel + " text-right"}>
                        Orders
                      </TableHead>
                      <TableHead className={claude.microLabel + " text-right"}>
                        Total spent
                      </TableHead>
                      <TableHead className={claude.microLabel}>
                        Last order
                      </TableHead>
                      <TableHead className={claude.microLabel}>
                        Joined
                      </TableHead>
                      <TableHead className={claude.microLabel + " text-right"}>
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((customer, index) => {
                      const spentShare =
                        maxSpent > 0
                          ? Math.min((customer.totalSpent / maxSpent) * 100, 100)
                          : 0;
                      return (
                        <TableRow
                          key={customer.customerPhone || index}
                          className={
                            "transition-colors hover:bg-[#F5F1EA] " +
                            (selectedCustomers.has(customer.customerPhone)
                              ? "bg-[#D97757]/[0.06] hover:bg-[#D97757]/[0.09]"
                              : "")
                          }>
                          <TableCell className='w-12'>
                            <Checkbox
                              checked={selectedCustomers.has(
                                customer.customerPhone,
                              )}
                              onCheckedChange={() =>
                                handleSelectCustomer(customer.customerPhone)
                              }
                              aria-label={`Select ${customer.customerName}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-3 min-w-[180px]'>
                              <div className='w-9 h-9 shrink-0 rounded-full bg-[#D97757]/10 border border-[#D97757]/20 flex items-center justify-center text-[11px] font-semibold text-[#9A4B2E]'>
                                {initials(customer.customerName)}
                              </div>
                              <div className='min-w-0'>
                                <p className='font-medium text-sm text-[#141413] truncate max-w-[200px]'>
                                  {customer.customerName}
                                </p>
                                <p className='text-xs text-[#8A877D] whitespace-nowrap'>
                                  {customer.customerPhone}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='text-[#57554D] text-[13px]'>
                            <span className='block max-w-[200px] truncate'>
                              {customer.customerEmail || "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className='inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap'
                              style={{
                                color: statusColors.good.text,
                                backgroundColor: statusColors.good.bg,
                                borderColor: statusColors.good.border,
                              }}>
                              <Check className='h-3 w-3' />
                              Active
                            </span>
                          </TableCell>
                          <TableCell className='text-right tabular-nums text-[#57554D]'>
                            {customer.totalOrderCount.toLocaleString()}
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='inline-flex flex-col items-end gap-1 min-w-[120px]'>
                              <span className='font-medium text-sm text-[#141413] tabular-nums whitespace-nowrap'>
                                ৳{customer.totalSpent.toLocaleString()}
                              </span>
                              {/* Share of top spender on this page */}
                              <div className='h-1 w-24 rounded-full bg-[#F5F1EA] overflow-hidden'>
                                <div
                                  className='h-full rounded-full bg-[#C96442]'
                                  style={{ width: `${spentShare}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='text-[#57554D] text-sm whitespace-nowrap'>
                            {safeFormatDate(customer.lastOrderDate)}
                          </TableCell>
                          <TableCell className='text-[#57554D] text-sm whitespace-nowrap'>
                            {safeFormatDate(customer.firstOrderDate)}
                          </TableCell>
                          <TableCell className='text-right'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleViewCustomer(customer)}
                              className='h-8 w-8 p-0 hover:bg-[#F5F1EA] hover:text-[#B85A3D]'>
                              <Eye className='h-4 w-4' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className='text-center py-14'>
                          <div className='flex flex-col items-center gap-3 text-center'>
                            <div className='h-14 w-14 rounded-2xl bg-[#F5F1EA] flex items-center justify-center'>
                              <User className='h-7 w-7 text-[#8A877D]' />
                            </div>
                            <div>
                              <p className='text-sm font-medium text-[#141413]'>
                                No customers found
                              </p>
                              <p className='text-xs text-[#57554D] mt-0.5'>
                                Try adjusting your filters
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {rows.length > 0 && (
                <div className='border-t border-[#E8E4DC] px-5 py-3'>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <div className='text-xs text-[#57554D]'>
                      Showing{" "}
                      <span className='font-medium text-[#141413]'>
                        {(params.page || 1) * (params.limit || 20) -
                          (params.limit || 20) +
                          1}
                        –
                        {Math.min(
                          (params.page || 1) * (params.limit || 20),
                          totalCustomers,
                        )}
                      </span>{" "}
                      of{" "}
                      <span className='font-medium text-[#141413]'>
                        {totalCustomers}
                      </span>{" "}
                      customers
                    </div>
                    <div className='flex items-center gap-1'>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={(params.page || 1) === 1}
                        onClick={() => handlePageChange((params.page || 1) - 1)}
                        className='h-8 w-8 p-0 border-[#E8E4DC]'>
                        <ChevronLeft className='h-4 w-4' />
                      </Button>
                      <span className='text-xs text-[#57554D] px-2'>
                        Page{" "}
                        <span className='font-medium text-[#141413]'>
                          {params.page || 1}
                        </span>{" "}
                        of{" "}
                        <span className='font-medium text-[#141413]'>
                          {totalPages}
                        </span>
                      </span>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={(params.page || 1) >= totalPages}
                        onClick={() => handlePageChange((params.page || 1) + 1)}
                        className='h-8 w-8 p-0 border-[#E8E4DC]'>
                        <ChevronRight className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {modals}
    </>
  );
};

export default CustomerAnalytics;
