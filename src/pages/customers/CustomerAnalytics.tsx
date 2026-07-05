import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
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
import { Badge } from "../../components/ui/badge";
import {
  Eye,
  X,
  User,
  Megaphone,
  Search,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  Wallet,
  SlidersHorizontal,
} from "lucide-react";
import { useCustomerAnalytics } from "./hooks/useCustomerAnalytics";
import { Customer, CustomerQueryParams } from "./interface";
import { format } from "date-fns";
import CustomerStats from "./components/CustomerStats";
import CustomerDetailsModal from "./components/CustomerDetailsModal";
import BulkCommunicationModal from "../bulk-communication/components/BulkCommunicationModal";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { useIsMobile } from "../../hooks/use-mobile";

const CustomerAnalytics = () => {
  const { loading, customers, fetchCustomers } = useCustomerAnalytics();

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
  const [filtersOpen, setFiltersOpen] = useState(false);
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
    setFiltersOpen(false);
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
    if (!customers) return;
    if (selectedCustomers.size === customers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(customers.map((c) => c.customerPhone)));
    }
  };

  const handleClearSelection = () => {
    setSelectedCustomers(new Set());
  };

  const selectedCustomersData =
    customers?.filter((c) => selectedCustomers.has(c.customerPhone)) || [];

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

  if (loading && !customers) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-3 text-center bg-white rounded-2xl border border-slate-100 shadow-sm px-12 py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-700">
            Loading customers…
          </p>
          <p className="text-xs text-slate-400">This won't take long</p>
        </div>
      </div>
    );
  }

  const activeFilterCount =
    (searchQuery ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  /* ═══════════════════════════════════════════════════════
     DESKTOP
  ═══════════════════════════════════════════════════════ */
  if (!isMobile) {
    return (
      <div className="flex flex-col h-full bg-slate-50/60">
        {/* ── Sticky Header ──────────────────────────────────── */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="hidden sm:flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-slate-900 truncate leading-tight">
                    Customer Analytics
                  </h1>
                  <p className="text-xs text-slate-500 leading-none mt-0.5">
                    {customers?.length || 0} customers total
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="hidden sm:flex items-center gap-1.5 h-9 text-slate-600 border-slate-200 hover:bg-slate-50">
                  <X className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="max-w-7xl mx-auto space-y-5">
            {/* Stats */}
            <CustomerStats onBulkCommunicate={handleTopCustomersBulkComm} />

            {/* Filters */}
            <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm font-medium text-slate-800">
                      Filters
                    </span>
                    {activeFilterCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {activeFilterCount} active
                      </span>
                    )}
                  </div>
                  {(searchQuery || statusFilter !== "all") && (
                    <button
                      onClick={handleReset}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium">
                      Clear all
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        className="pl-9 h-9 text-sm border-slate-200 bg-white focus-visible:ring-indigo-500"
                        placeholder="Name, phone, email…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      Status
                    </label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-9 text-sm border-slate-200">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      Sort by
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-9 text-sm border-slate-200">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="totalOrders">
                          Total orders
                        </SelectItem>
                        <SelectItem value="totalSpent">
                          Total spent
                        </SelectItem>
                        <SelectItem value="lastOrderDate">
                          Last order date
                        </SelectItem>
                        <SelectItem value="createdAt">
                          Created date
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      Order
                    </label>
                    <Select
                      value={sortOrder}
                      onValueChange={(v) =>
                        setSortOrder(v as "asc" | "desc")
                      }>
                      <SelectTrigger className="h-9 text-sm border-slate-200">
                        <SelectValue placeholder="Sort order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    onClick={handleFilter}
                    className="h-9 px-6 bg-indigo-600 hover:bg-indigo-700 text-sm">
                    Apply filters
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="h-9 text-sm">
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedCustomers.size > 0 && (
              <div className="sticky top-16 z-10 rounded-xl border border-indigo-100 shadow-md shadow-indigo-100/50 bg-gradient-to-r from-indigo-50 via-white to-white px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600 text-white px-3.5 py-1.5 rounded-full text-sm font-medium">
                      {selectedCustomers.size} selected
                    </div>
                    {hasRequiredPermission(
                      "BulkCommunication",
                      "create",
                    ) && (
                      <Button
                        onClick={() => setBulkCommModalOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 h-9 text-sm"
                        size="sm">
                        <Megaphone className="h-4 w-4 mr-2" />
                        Send bulk SMS/Email
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    className="text-slate-500 hover:text-slate-900 h-9">
                    <X className="h-4 w-4 mr-1.5" />
                    Clear selection
                  </Button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                <Table divClass="relative">
                  <TableHeader className="sticky top-0 bg-slate-50/95 backdrop-blur border-b border-slate-200 z-10">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            !!customers &&
                            customers.length > 0 &&
                            selectedCustomers.size === customers.length
                          }
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all customers"
                        />
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        Customer
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        Phone
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        Email
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        Status
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        Orders
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        Total spent
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        Last order
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        Joined
                      </TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers &&
                      customers.map((customer, index) => (
                        <TableRow
                          key={index}
                          className={`transition-colors hover:bg-slate-50 ${
                            selectedCustomers.has(customer.customerPhone)
                              ? "bg-indigo-50/60 hover:bg-indigo-50/80"
                              : ""
                          }`}>
                          <TableCell className="w-12">
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
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[11px] font-semibold text-indigo-700">
                                {initials(customer.customerName)}
                              </div>
                              <span className="text-slate-800">
                                {customer.customerName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {customer.customerPhone}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {customer.customerEmail || "—"}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors bg-emerald-50 text-emerald-700 border-emerald-100 px-2.5 py-0.5 text-xs">
                              <span className="text-[10px]">✓</span>
                              Active
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-700">
                            {customer.totalOrderCount}
                          </TableCell>
                          <TableCell className="font-medium text-slate-900">
                            ৳{customer.totalSpent.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {safeFormatDate(customer.lastOrderDate)}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {safeFormatDate(customer.firstOrderDate)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                              className="h-8 w-8 p-0 hover:bg-indigo-50 hover:text-indigo-700">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {(!customers || customers.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-14">
                          <div className="flex flex-col items-center gap-3 text-center">
                            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                              <User className="h-7 w-7 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                No customers found
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
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
              {customers && customers.length > 0 && (
                <div className="border-t border-slate-200 px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      Showing{" "}
                      <span className="font-medium text-slate-700">
                        {((params.page || 1) - 1) * (params.limit || 20) + 1}–
                        {Math.min(
                          (params.page || 1) * (params.limit || 20),
                          customers.length,
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-slate-700">
                        {customers.length}
                      </span>{" "}
                      customers
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={(params.page || 1) === 1}
                        onClick={() =>
                          handlePageChange((params.page || 1) - 1)
                        }
                        className="h-8 w-8 p-0 border-slate-200">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-slate-500 px-2">
                        Page{" "}
                        <span className="font-medium text-slate-700">
                          {params.page || 1}
                        </span>
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange((params.page || 1) + 1)
                        }
                        className="h-8 w-8 p-0 border-slate-200">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     MOBILE
  ═══════════════════════════════════════════════════════ */
  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Customer Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View and analyze customer data, order history, and statistics
          </p>
        </div>
      </div>

      {/* Stats */}
      <CustomerStats onBulkCommunicate={handleTopCustomersBulkComm} />

      {/* Filters */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader
          className="cursor-pointer py-4"
          onClick={() => setFiltersOpen((v) => !v)}>
          <CardTitle className="flex items-center justify-between text-base font-medium text-slate-800">
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border border-indigo-100 font-normal">
                  {activeFilterCount} active
                </Badge>
              )}
            </span>
            <ChevronRight
              className={`h-4 w-4 text-slate-400 transition-transform ${
                filtersOpen ? "rotate-90" : ""
              }`}
            />
          </CardTitle>
        </CardHeader>
        <CardContent
          className={`${!filtersOpen ? "hidden" : "block"} pt-0`}>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="Name, phone, email…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Sort by
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="totalOrders">Total orders</SelectItem>
                    <SelectItem value="totalSpent">Total spent</SelectItem>
                    <SelectItem value="lastOrderDate">
                      Last order date
                    </SelectItem>
                    <SelectItem value="createdAt">Created date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Order
                </label>
                <Select
                  value={sortOrder}
                  onValueChange={(v) => setSortOrder(v as "asc" | "desc")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button
              onClick={handleFilter}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              Apply filters
            </Button>
            <Button onClick={handleReset} variant="outline">
              <X className="h-4 w-4 mr-1.5" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions - Mobile */}
      {selectedCustomers.size > 0 && (
        <Card className="sticky top-4 z-10 border border-indigo-100 shadow-md shadow-indigo-100/50 bg-gradient-to-r from-indigo-50 via-white to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-600 text-white px-3.5 py-1.5 rounded-full text-sm font-medium">
                  {selectedCustomers.size} selected
                </div>
                {hasRequiredPermission("BulkCommunication", "create") && (
                  <Button
                    onClick={() => setBulkCommModalOpen(true)}
                    className="bg-slate-900 hover:bg-slate-800">
                    <Megaphone className="h-4 w-4 mr-2" />
                    Send bulk SMS/Email
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="text-slate-500 hover:text-slate-900">
                <X className="h-4 w-4 mr-1.5" />
                Clear selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={
                !!customers &&
                customers.length > 0 &&
                selectedCustomers.size === customers.length
              }
              onCheckedChange={handleSelectAll}
              aria-label="Select all customers"
            />
            <span className="text-sm text-slate-500">Select all</span>
          </div>
          <span className="text-sm text-slate-400">
            {customers?.length || 0} customers
          </span>
        </div>

        {customers && customers.length > 0 ? (
          customers.map((customer, index) => {
            const isSelected = selectedCustomers.has(customer.customerPhone);
            return (
              <Card
                key={index}
                className={`border-slate-200/80 shadow-sm transition-colors ${
                  isSelected ? "border-indigo-300 bg-indigo-50/50" : ""
                }`}
                onClick={() => handleSelectCustomer(customer.customerPhone)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() =>
                        handleSelectCustomer(customer.customerPhone)
                      }
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${customer.customerName}`}
                      className="mt-1"
                    />
                    <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                      {initials(customer.customerName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-slate-900 truncate">
                          {customer.customerName}
                        </p>
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-50 font-normal shrink-0">
                          Active
                        </Badge>
                      </div>
                      <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3" />
                          <span>{customer.customerPhone}</span>
                        </div>
                        {customer.customerEmail && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {customer.customerEmail}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-slate-50 py-2">
                          <div className="flex items-center justify-center gap-1 text-slate-400">
                            <ShoppingBag className="h-3 w-3" />
                          </div>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">
                            {customer.totalOrderCount}
                          </p>
                          <p className="text-[10px] text-slate-400">Orders</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 py-2">
                          <div className="flex items-center justify-center gap-1 text-slate-400">
                            <Wallet className="h-3 w-3" />
                          </div>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">
                            ৳{customer.totalSpent.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-slate-400">Spent</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 py-2">
                          <div className="flex items-center justify-center gap-1 text-slate-400">
                            <Calendar className="h-3 w-3" />
                          </div>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">
                            {safeFormatDate(
                              customer.lastOrderDate,
                              "MMM dd",
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Last order
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCustomer(customer);
                        }}>
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="py-14 text-center text-slate-400">
              No customers found
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {customers && customers.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={(params.page || 1) === 1}
              onClick={() => handlePageChange((params.page || 1) - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-500">
              Page {params.page || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange((params.page || 1) + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Floating Action Bar */}
      {selectedCustomers.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <Card className="border-slate-200 shadow-xl shadow-slate-900/10">
            <CardContent className="p-3 flex items-center gap-2">
              <button
                onClick={handleClearSelection}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"
                aria-label="Clear selection">
                <X className="h-4 w-4" />
              </button>
              <Button
                onClick={() => setBulkCommModalOpen(true)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                size="lg">
                <Megaphone className="h-5 w-5 mr-2" />
                Message {selectedCustomers.size} customer
                {selectedCustomers.size !== 1 ? "s" : ""}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

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
    </div>
  );
};

export default CustomerAnalytics;
