import { useEffect, useState } from "react";
import { useIsMobile } from "../../../hooks/use-mobile";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
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
  ShoppingBag,
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
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='relative w-16 h-16 mx-auto mb-4'>
            <div className='absolute inset-0 rounded-full border-4 border-blue-100'></div>
            <div className='absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin'></div>
          </div>
          <p className='text-sm font-medium text-gray-600'>
            Loading customer data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <Card className='group relative overflow-hidden border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity'></div>
          <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500'></div>
          <CardContent className='pt-6 relative'>
            <div className='flex items-start justify-between'>
              <div className='space-y-2'>
                <p className='text-xs text-blue-600 font-bold uppercase tracking-wider flex items-center gap-2'>
                  <span className='w-6 h-0.5 bg-blue-400'></span>
                  Total Customers
                </p>
                <p className='text-3xl font-black text-blue-700'>
                  {orderHistory?.summary.uniqueCustomers || 0}
                </p>
                <p className='text-xs text-blue-600/70 font-medium'>
                  unique buyers
                </p>
              </div>
              <div className='bg-gradient-to-br from-blue-400 to-indigo-500 p-3 rounded-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300'>
                <Users className='h-6 w-6 text-white' strokeWidth={2.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='group relative overflow-hidden border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity'></div>
          <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500'></div>
          <CardContent className='pt-6 relative'>
            <div className='flex items-start justify-between'>
              <div className='space-y-2'>
                <p className='text-xs text-purple-600 font-bold uppercase tracking-wider flex items-center gap-2'>
                  <span className='w-6 h-0.5 bg-purple-400'></span>
                  Total Quantity
                </p>
                <p className='text-3xl font-black text-purple-700'>
                  {orderHistory?.summary.totalQuantitySold?.toLocaleString() ||
                    0}
                </p>
                <p className='text-xs text-purple-600/70 font-medium'>
                  units sold
                </p>
              </div>
              <div className='bg-gradient-to-br from-purple-400 to-fuchsia-500 p-3 rounded-xl shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300'>
                <Package className='h-6 w-6 text-white' strokeWidth={2.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Section */}
      <Card className='border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300'>
        <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'></div>
        <CardContent className='pt-6'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
            <input
              type='text'
              placeholder='Search by name, phone, email...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-sm font-medium'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'>
                <X className='h-5 w-5' />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className='text-xs text-gray-500 mt-2 ml-1'>
              Found {filteredCustomers.length} customer
              {filteredCustomers.length !== 1 ? "s" : ""}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions Panel (Desktop - Sticky) */}
      {!isMobile && selectedCustomers.size > 0 && (
        <Card className='sticky top-4 border-0 shadow-2xl overflow-hidden z-20'>
          <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'></div>
          <CardHeader className='bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white pb-4'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg font-bold flex items-center gap-3'>
                <div className='bg-white/20 p-2 rounded-lg backdrop-blur-sm'>
                  <CheckCircle2 className='h-5 w-5' strokeWidth={2.5} />
                </div>
                Bulk Actions
                <span className='bg-white/20 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm'>
                  {selectedCustomers.size} selected
                </span>
              </CardTitle>
              <Button
                onClick={() => setSelectedCustomers(new Set())}
                variant='ghost'
                size='sm'
                className='text-white hover:bg-white/20 transition-colors'>
                <X className='h-4 w-4 mr-2' />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className='p-4 bg-gradient-to-br from-slate-50 to-gray-50'>
            <div className='space-y-3'>
              {hasRequiredPermission("BulkCommunication", "create") && (
                <Button
                  onClick={handleBulkAction}
                  className='w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-200 transition-all duration-300 hover:shadow-xl'
                  size='lg'>
                  <Send className='mr-2 h-5 w-5' strokeWidth={2.5} />
                  Send Bulk SMS/Email
                </Button>
              )}
              <p className='text-xs text-gray-600 text-center'>
                Create a campaign to send SMS or email to{" "}
                <span className='font-bold text-blue-600'>
                  {selectedCustomers.size}
                </span>{" "}
                selected customer{selectedCustomers.size !== 1 ? "s" : ""} with
                scheduling options
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customers List - Desktop Table / Mobile Cards */}
      {isMobile ? (
        <div className='space-y-4 pb-20'>
          {/* Select All Card */}
          <Card className='border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Checkbox
                    checked={
                      selectedCustomers.size === filteredCustomers.length &&
                      filteredCustomers.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    className='border-2'
                  />
                  <span className='text-sm font-semibold text-gray-700'>
                    Select All ({filteredCustomers.length})
                  </span>
                </div>
                {selectedCustomers.size > 0 && (
                  <span className='text-xs font-bold text-blue-600 bg-white px-3 py-1.5 rounded-full'>
                    {selectedCustomers.size} selected
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {filteredCustomers.map((customer) => (
            <Card
              key={customer.customerPhone}
              className={`group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg ${
                selectedCustomers.has(customer.customerPhone)
                  ? "border-blue-400 bg-blue-50/50"
                  : "border-gray-100 hover:border-blue-200"
              }`}>
              <div
                className={`absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 ${
                  selectedCustomers.has(customer.customerPhone)
                    ? "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-100"
                    : "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100"
                }`}></div>
              <CardContent className='p-4'>
                <div className='space-y-4'>
                  {/* Header with Checkbox */}
                  <div className='flex items-start gap-3'>
                    <Checkbox
                      checked={selectedCustomers.has(customer.customerPhone)}
                      onCheckedChange={() =>
                        handleSelectCustomer(customer.customerPhone)
                      }
                      className='mt-1 border-2'
                    />
                    <div className='flex-1 space-y-1'>
                      <div className='flex items-center gap-2'>
                        <div className='bg-gradient-to-r from-blue-500 to-indigo-600 p-1.5 rounded-lg'>
                          <User className='h-3.5 w-3.5 text-white' />
                        </div>
                        <span className='font-bold text-gray-800'>
                          {customer.customerName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm bg-green-50 px-3 py-2 rounded-lg border border-green-100'>
                      <Phone className='h-4 w-4 text-green-600 flex-shrink-0' />
                      <span className='text-green-700 font-medium'>
                        {customer.customerPhone}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-sm bg-blue-50 px-3 py-2 rounded-lg border border-blue-100'>
                      <Mail className='h-4 w-4 text-blue-600 flex-shrink-0' />
                      <span className='text-blue-700 font-medium truncate'>
                        {customer.customerEmail}
                      </span>
                    </div>
                    {customer.customerAddress && (
                      <div className='flex items-start gap-2 text-sm bg-purple-50 px-3 py-2 rounded-lg border border-purple-100'>
                        <MapPin className='h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5' />
                        <span className='text-purple-700 font-medium'>
                          {customer.customerAddress}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className='grid grid-cols-2 gap-3 pt-2 border-t'>
                    <div className='bg-gradient-to-br from-emerald-50 to-green-50 p-3 rounded-xl border border-emerald-100'>
                      <p className='text-xs text-emerald-600 font-semibold mb-1'>
                        Quantity
                      </p>
                      <p className='text-lg font-black text-emerald-700'>
                        {customer.totalQuantity}
                      </p>
                    </div>
                    <div className='bg-gradient-to-br from-orange-50 to-amber-50 p-3 rounded-xl border border-orange-100'>
                      <p className='text-xs text-orange-600 font-semibold mb-1'>
                        Orders
                      </p>
                      <p className='text-lg font-black text-orange-700'>
                        {customer.totalOrders}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCustomers.length === 0 && (
            <Card className='border-2 border-dashed border-gray-200'>
              <CardContent className='py-12 text-center'>
                <div className='bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Users className='h-8 w-8 text-gray-400' />
                </div>
                <p className='text-gray-500 font-medium'>
                  {searchQuery
                    ? "No customers match your search"
                    : "No customers found"}
                </p>
                {searchQuery && (
                  <Button
                    onClick={() => setSearchQuery("")}
                    variant='outline'
                    size='sm'
                    className='mt-4'>
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className='border-2 border-gray-100 shadow-lg overflow-hidden'>
          <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'></div>
          <CardContent className='p-0'>
            <div className='max-h-[600px] overflow-y-auto'>
              <Table divClass='relative'>
                <TableHeader className='sticky top-0 bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 z-10 shadow-sm'>
                  <TableRow>
                    <TableHead className='w-12'>
                      <Checkbox
                        checked={
                          selectedCustomers.size === filteredCustomers.length &&
                          filteredCustomers.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                        className='border-2'
                      />
                    </TableHead>
                    <TableHead className='font-bold text-gray-700'>
                      Customer Name
                    </TableHead>
                    <TableHead className='font-bold text-gray-700'>
                      Phone
                    </TableHead>
                    <TableHead className='font-bold text-gray-700'>
                      Email
                    </TableHead>
                    <TableHead className='font-bold text-gray-700'>
                      Address
                    </TableHead>
                    <TableHead className='text-right font-bold text-gray-700'>
                      Quantity
                    </TableHead>
                    <TableHead className='text-right font-bold text-gray-700'>
                      Total Orders
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow
                      key={customer.customerPhone}
                      className={`transition-all duration-200 border-b border-gray-100 ${
                        selectedCustomers.has(customer.customerPhone)
                          ? "bg-blue-50 hover:bg-blue-100"
                          : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                      }`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCustomers.has(
                            customer.customerPhone,
                          )}
                          onCheckedChange={() =>
                            handleSelectCustomer(customer.customerPhone)
                          }
                          className='border-2'
                        />
                      </TableCell>
                      <TableCell className='font-semibold text-gray-800'>
                        <div className='flex items-center gap-2'>
                          <div className='bg-gradient-to-r from-blue-400 to-indigo-500 p-1.5 rounded-lg'>
                            <User className='h-3.5 w-3.5 text-white' />
                          </div>
                          {customer.customerName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Phone className='h-4 w-4 text-green-600' />
                          <span className='font-medium text-gray-700'>
                            {customer.customerPhone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Mail className='h-4 w-4 text-blue-600' />
                          <span className='font-medium text-gray-700'>
                            {customer.customerEmail}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.customerAddress ? (
                          <div className='flex items-start gap-2'>
                            <MapPin className='h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5' />
                            <span className='text-sm text-gray-600'>
                              {customer.customerAddress}
                            </span>
                          </div>
                        ) : (
                          <span className='text-gray-400 text-sm'>N/A</span>
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        <span className='font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-sm'>
                          {customer.totalQuantity}
                        </span>
                      </TableCell>
                      <TableCell className='text-right'>
                        <span className='font-bold text-orange-700 bg-orange-50 px-3 py-1 rounded-full text-sm'>
                          {customer.totalOrders}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center py-12'>
                        <div className='bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                          <Users className='h-8 w-8 text-gray-400' />
                        </div>
                        <p className='text-gray-500 font-medium'>
                          {searchQuery
                            ? "No customers match your search"
                            : "No customers found"}
                        </p>
                        {searchQuery && (
                          <Button
                            onClick={() => setSearchQuery("")}
                            variant='outline'
                            size='sm'
                            className='mt-4'>
                            Clear Search
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className='border-t-2 bg-gradient-to-r from-slate-50 to-gray-50 p-4'>
              <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                <div className='text-sm text-gray-600 font-medium'>
                  Showing{" "}
                  <span className='font-bold text-gray-800'>
                    {filteredCustomers.length}
                  </span>{" "}
                  customer{filteredCustomers.length !== 1 ? "s" : ""}
                </div>
                <div className='flex items-center space-x-2'>
                  <Select
                    value={`${orderParams.limit}`}
                    onValueChange={(value) =>
                      fetchOrderHistory({ limit: Number(value), page: 1 })
                    }>
                    <SelectTrigger className='w-20 border-2'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='20'>20</SelectItem>
                      <SelectItem value='50'>50</SelectItem>
                      <SelectItem value='100'>100</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={!orderHistory?.pagination.hasPreviousPage}
                    onClick={() =>
                      fetchOrderHistory({ page: (orderParams.page || 1) - 1 })
                    }
                    className='border-2'>
                    Previous
                  </Button>
                  <span className='text-sm font-semibold px-3 py-1 bg-white rounded-lg border-2'>
                    {orderHistory?.pagination.currentPage} /{" "}
                    {orderHistory?.pagination.totalPages}
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={!orderHistory?.pagination.hasNextPage}
                    onClick={() =>
                      fetchOrderHistory({ page: (orderParams.page || 1) + 1 })
                    }
                    className='border-2'>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile Floating Bulk Action Button */}
      {isMobile && selectedCustomers.size > 0 && (
        <div className='fixed bottom-4 left-4 right-4 z-50 md:hidden'>
          <Card className='border-0 shadow-2xl overflow-hidden'>
            <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'></div>
            <CardContent className='p-4 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600'>
              <Button
                onClick={handleBulkAction}
                className='w-full bg-white text-blue-600 hover:bg-gray-100 shadow-lg transition-all duration-300 font-bold'
                size='lg'>
                <Send className='mr-2 h-5 w-5' strokeWidth={2.5} />
                Send Bulk SMS/Email ({selectedCustomers.size})
              </Button>
            </CardContent>
          </Card>
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
