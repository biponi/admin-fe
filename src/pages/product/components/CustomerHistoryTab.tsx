import { useEffect, useState } from "react";
import { useIsMobile } from "../../../hooks/use-mobile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Users,
  Package,
  Send,
  Search,
  Mail,
  Phone,
  MapPin,
  User,
  CheckCircle2,
  X,
} from "lucide-react";
import { useProductAnalytics } from "../hooks/useProductAnalytics";
import { useToast } from "../../../components/ui/use-toast";
import BulkCommunicationModal from "../../bulk-communication/components/BulkCommunicationModal";
import useRoleCheck from "../../auth/hooks/useRoleCheck";

interface CustomerHistoryTabProps {
  productId: string;
  productName?: string;
}

const CustomerHistoryTab = ({
  productId,
  productName,
}: CustomerHistoryTabProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { hasRequiredPermission } = useRoleCheck();
  const { orderHistory, loading, fetchOrderHistory, orderParams } =
    useProductAnalytics(productId);

  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkCommModalOpen, setBulkCommModalOpen] = useState(false);

  useEffect(() => {
    fetchOrderHistory();
    //eslint-disable-next-line
  }, []);

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
    const customers = filteredCustomers;
    if (selectedCustomers.size === customers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(customers.map((c) => c.customerPhone)));
    }
  };

  const handleBulkAction = () => {
    if (selectedCustomers.size === 0) {
      toast({
        variant: "destructive",
        title: "No Customers Selected",
        description: "Please select at least one customer",
      });
      return;
    }
    setBulkCommModalOpen(true);
  };

  // Extract unique customers from orders
  const customers = orderHistory?.customers || [];

  // Filter customers based on search query
  const filteredCustomers = customers.filter(
    (c) =>
      searchQuery === "" ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerPhone.includes(searchQuery) ||
      c.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Get selected customer objects
  const selectedCustomersData = filteredCustomers.filter((c) =>
    selectedCustomers.has(c.customerPhone),
  );

  if (loading && !orderHistory) {
    return (
      <div className='flex flex-col items-center justify-center h-64 gap-3'>
        <div className='w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin' />
        <p className='text-sm text-slate-500'>Loading customers…</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='bg-white rounded-lg border border-slate-100 p-4 hover:border-slate-200 transition-colors'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>
                Total Customers
              </p>
              <p className='text-2xl font-bold text-slate-900'>
                {orderHistory?.summary.uniqueCustomers || 0}
              </p>
              <p className='text-xs text-slate-500'>unique buyers</p>
            </div>
            <div className='bg-indigo-100 p-2.5 rounded-lg'>
              <Users className='h-5 w-5 text-indigo-600' strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg border border-slate-100 p-4 hover:border-slate-200 transition-colors'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>
                Total Quantity
              </p>
              <p className='text-2xl font-bold text-slate-900'>
                {orderHistory?.summary.totalQuantitySold?.toLocaleString() ||
                  0}
              </p>
              <p className='text-xs text-slate-500'>units sold</p>
            </div>
            <div className='bg-emerald-100 p-2.5 rounded-lg'>
              <Package className='h-5 w-5 text-emerald-600' strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none' />
        <input
          type='text'
          placeholder='Search by name, phone, email...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm'
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'>
            <X className='h-4 w-4' />
          </button>
        )}
      </div>

      {/* Bulk Actions Panel (Desktop - Sticky) */}
      {!isMobile && selectedCustomers.size > 0 && (
        <div className='rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden z-20 sticky top-4'>
          <div className='bg-indigo-600 text-white p-3'>
            <div className='flex items-center justify-between'>
              <div className='text-sm font-semibold flex items-center gap-2'>
                <CheckCircle2 className='h-4 w-4' strokeWidth={2.5} />
                Bulk Actions
                <span className='bg-white/20 px-2 py-0.5 rounded text-xs'>
                  {selectedCustomers.size} selected
                </span>
              </div>
              <Button
                onClick={() => setSelectedCustomers(new Set())}
                variant='ghost'
                size='sm'
                className='text-white hover:bg-white/20 transition-colors h-7 px-3'>
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
          <div className='p-3 bg-slate-50'>
            <div className='space-y-2'>
              {hasRequiredPermission("BulkCommunication", "create") && (
                <Button
                  onClick={handleBulkAction}
                  className='w-full bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors'
                  size='sm'>
                  <Send className='mr-2 h-4 w-4' strokeWidth={2.5} />
                  Send Bulk SMS/Email
                </Button>
              )}
              <p className='text-xs text-slate-600 text-center'>
                Send to{" "}
                <span className='font-semibold text-slate-700'>
                  {selectedCustomers.size}
                </span>{" "}
                selected customer{selectedCustomers.size !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Customers List - Desktop Table / Mobile Cards */}
      {isMobile ? (
        <div className='space-y-4 pb-20'>
          {/* Select All Card */}
          <div className='bg-white rounded-lg border border-slate-100'>
            <div className='p-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Checkbox
                    checked={
                      selectedCustomers.size === filteredCustomers.length &&
                      filteredCustomers.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <span className='text-sm font-medium text-slate-700'>
                    Select All ({filteredCustomers.length})
                  </span>
                </div>
                {selectedCustomers.size > 0 && (
                  <span className='text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded'>
                    {selectedCustomers.size} selected
                  </span>
                )}
              </div>
            </div>
          </div>

          {filteredCustomers.map((customer) => (
            <div
              key={customer.customerPhone}
              className={`group border transition-all duration-200 hover:shadow-sm bg-white rounded-lg ${
                selectedCustomers.has(customer.customerPhone)
                  ? "border-indigo-300 bg-indigo-50/50"
                  : "border-slate-100 hover:border-slate-200"
              }`}>
              <div className='p-3'>
                <div className='space-y-3'>
                  {/* Header with Checkbox */}
                  <div className='flex items-start gap-3'>
                    <Checkbox
                      checked={selectedCustomers.has(customer.customerPhone)}
                      onCheckedChange={() =>
                        handleSelectCustomer(customer.customerPhone)
                      }
                    />
                    <div className='flex-1 space-y-1'>
                      <div className='flex items-center gap-2'>
                        <div className='bg-slate-100 p-1.5 rounded'>
                          <User className='h-3.5 w-3.5 text-slate-600' />
                        </div>
                        <span className='font-semibold text-slate-800'>
                          {customer.customerName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm bg-slate-50 px-3 py-2 rounded border border-slate-100'>
                      <Phone className='h-4 w-4 text-slate-600 flex-shrink-0' />
                      <span className='text-slate-700 font-medium'>
                        {customer.customerPhone}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-sm bg-slate-50 px-3 py-2 rounded border border-slate-100'>
                      <Mail className='h-4 w-4 text-slate-600 flex-shrink-0' />
                      <span className='text-slate-700 font-medium truncate'>
                        {customer.customerEmail}
                      </span>
                    </div>
                    {customer.customerAddress && (
                      <div className='flex items-start gap-2 text-sm bg-slate-50 px-3 py-2 rounded border border-slate-100'>
                        <MapPin className='h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5' />
                        <span className='text-slate-700 font-medium'>
                          {customer.customerAddress}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className='grid grid-cols-2 gap-3 pt-2 border-t border-slate-100'>
                    <div className='bg-white p-3 rounded border border-slate-100'>
                      <p className='text-xs text-slate-500 font-semibold mb-1'>
                        Quantity
                      </p>
                      <p className='text-lg font-semibold text-slate-800'>
                        {customer.totalQuantity}
                      </p>
                    </div>
                    <div className='bg-white p-3 rounded border border-slate-100'>
                      <p className='text-xs text-slate-500 font-semibold mb-1'>
                        Orders
                      </p>
                      <p className='text-lg font-semibold text-slate-800'>
                        {customer.totalOrders}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredCustomers.length === 0 && (
            <div className='bg-white rounded-lg border border-dashed border-slate-200'>
              <div className='py-12 text-center'>
                <div className='flex flex-col items-center gap-2 text-slate-400'>
                  <Users className='h-8 w-8 opacity-40' />
                  <p className='text-sm font-medium'>
                    {searchQuery
                      ? "No customers match your search"
                      : "No customers found"}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className='text-xs text-indigo-600 hover:underline mt-1'>
                      Clear search
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className='rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='bg-slate-50 hover:bg-slate-50 border-b border-slate-100'>
                  <TableHead className='w-12 py-3'>
                    <Checkbox
                      checked={
                        selectedCustomers.size === filteredCustomers.length &&
                        filteredCustomers.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                    Customer Name
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                    Phone
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                    Email
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                    Address
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 text-right'>
                    Quantity
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 text-right'>
                    Total Orders
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer.customerPhone}
                    className={`transition-colors border-b border-slate-50 ${
                      selectedCustomers.has(customer.customerPhone)
                        ? "bg-indigo-50 hover:bg-indigo-50/80"
                        : "hover:bg-slate-50/60"
                    }`}>
                    <TableCell className='py-3'>
                      <Checkbox
                        checked={selectedCustomers.has(
                          customer.customerPhone,
                        )}
                        onCheckedChange={() =>
                          handleSelectCustomer(customer.customerPhone)
                        }
                      />
                    </TableCell>
                    <TableCell className='py-3 font-medium text-slate-800'>
                      <div className='flex items-center gap-2'>
                        <div className='bg-slate-100 p-1 rounded'>
                          <User className='h-3 w-3 text-slate-600' />
                        </div>
                        {customer.customerName}
                      </div>
                    </TableCell>
                    <TableCell className='py-3'>
                      <div className='flex items-center gap-2'>
                        <Phone className='h-4 w-4 text-slate-500' />
                        <span className='text-sm text-slate-700'>
                          {customer.customerPhone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='py-3'>
                      <div className='flex items-center gap-2'>
                        <Mail className='h-4 w-4 text-slate-500' />
                        <span className='text-sm text-slate-700'>
                          {customer.customerEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='py-3'>
                      {customer.customerAddress ? (
                        <div className='flex items-start gap-2'>
                          <MapPin className='h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5' />
                          <span className='text-sm text-slate-600 line-clamp-2'>
                            {customer.customerAddress}
                          </span>
                        </div>
                      ) : (
                        <span className='text-sm text-slate-400'>N/A</span>
                      )}
                    </TableCell>
                    <TableCell className='py-3 text-right text-sm font-medium text-slate-700'>
                      {customer.totalQuantity}
                    </TableCell>
                    <TableCell className='py-3 text-right text-sm font-medium text-slate-700'>
                      {customer.totalOrders}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className='text-center py-16'>
                      <div className='flex flex-col items-center gap-2 text-slate-400'>
                        <Users className='h-8 w-8 opacity-40' />
                        <p className='text-sm font-medium'>
                          {searchQuery
                            ? "No customers match your search"
                            : "No customers found"}
                        </p>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className='text-xs text-indigo-600 hover:underline mt-1'>
                            Clear search
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className='border-t border-slate-100 bg-slate-50/50 p-3'>
            <div className='flex flex-col sm:flex-row items-center justify-between gap-3'>
              <div className='text-xs text-slate-500 order-2 sm:order-1'>
                Showing{" "}
                <span className='font-medium text-slate-700'>
                  {filteredCustomers.length}
                </span>{" "}
                customer{filteredCustomers.length !== 1 ? "s" : ""}
              </div>
              <div className='flex items-center gap-1 order-1 sm:order-2'>
                <button
                  disabled={!orderHistory?.pagination.hasPreviousPage}
                  onClick={() =>
                    fetchOrderHistory({ page: (orderParams.page || 1) - 1 })
                  }
                  className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'>
                  Previous
                </button>
                <span className='px-3 py-1.5 text-xs text-slate-500 font-medium'>
                  Page {orderHistory?.pagination.currentPage}
                </span>
                <button
                  disabled={!orderHistory?.pagination.hasNextPage}
                  onClick={() =>
                    fetchOrderHistory({ page: (orderParams.page || 1) + 1 })
                  }
                  className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Bulk Action Button */}
      {isMobile && selectedCustomers.size > 0 && (
        <div className='fixed bottom-4 left-4 right-4 z-50 md:hidden'>
          <div className='rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden'>
            <div className='p-3 bg-indigo-600'>
              <Button
                onClick={handleBulkAction}
                className='w-full bg-white text-indigo-600 hover:bg-slate-100 shadow-sm transition-colors font-semibold'
                size='sm'>
                <Send className='mr-2 h-4 w-4' strokeWidth={2.5} />
                Send Bulk SMS/Email ({selectedCustomers.size})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Communication Modal */}
      <BulkCommunicationModal
        open={bulkCommModalOpen}
        onOpenChange={setBulkCommModalOpen}
        customers={selectedCustomersData.map((c) => ({
          name: c.customerName,
          phone: c.customerPhone,
          email: c.customerEmail,
        }))}
        productId={productId}
        productName={productName}
      />
    </div>
  );
};

export default CustomerHistoryTab;
