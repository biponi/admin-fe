import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Eye, Filter, X, User, Megaphone } from 'lucide-react';
import { useCustomerAnalytics } from './hooks/useCustomerAnalytics';
import { Customer, CustomerQueryParams } from './interface';
import { format } from 'date-fns';
import CustomerStats from './components/CustomerStats';
import CustomerDetailsModal from './components/CustomerDetailsModal';
import BulkCommunicationModal from '../bulk-communication/components/BulkCommunicationModal';
import useRoleCheck from '../auth/hooks/useRoleCheck';
import { useIsMobile } from '../../hooks/use-mobile';

const CustomerAnalytics = () => {
  const {
    loading,
    customers,
    fetchCustomers,
  } = useCustomerAnalytics();

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string | undefined, formatString: string = 'MMM dd, yyyy') => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      // Check if date is invalid
      if (isNaN(date.getTime())) return '-';
      return format(date, formatString);
    } catch {
      return '-';
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string>('');
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [params, setParams] = useState<CustomerQueryParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Bulk actions state
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
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
      status: statusFilter !== 'all' ? statusFilter as any : undefined,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      page: 1,
    };
    setParams(newParams);
    fetchCustomers(newParams);
  };

  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    const newParams: CustomerQueryParams = {
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setParams(newParams);
    fetchCustomers(newParams);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomerPhone(customer.customerPhone);
    setSelectedCustomerEmail(customer.customerEmail || '');
    setIsModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    const newParams: CustomerQueryParams = { ...params, page: newPage };
    setParams(newParams);
    fetchCustomers(newParams);
  };

  // Bulk action handlers
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

  // Get selected customer data for modal
  const selectedCustomersData = customers?.filter((c) =>
    selectedCustomers.has(c.customerPhone)
  ) || [];

  // Handle bulk communication from Top Customers section
  const handleTopCustomersBulkComm = (customers: any[]) => {
    setTopCustomersForBulk(customers);
    setBulkCommModalOpen(true);
  };

  // Get customers for bulk communication modal
  const getBulkCommCustomers = () => {
    // If top customers are selected, use them
    if (topCustomersForBulk.length > 0) {
      return topCustomersForBulk;
    }
    // Otherwise use selected customers from main table
    return selectedCustomersData.map((c) => ({
      name: c.customerName,
      phone: c.customerPhone,
      email: c.customerEmail,
    }));
  };

  // Handle modal close to reset top customers
  const handleBulkCommModalClose = (open: boolean) => {
    if (!open) {
      setTopCustomersForBulk([]);
    }
    setBulkCommModalOpen(open);
  };

  if (loading && !customers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Analytics</h1>
        <p className="text-gray-500 mt-1">
          View and analyze customer data, order history, and statistics
        </p>
      </div>

      {/* Customer Stats */}
      <CustomerStats onBulkCommunicate={handleTopCustomersBulkComm} />

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Name, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="totalOrders">Total Orders</SelectItem>
                  <SelectItem value="totalSpent">Total Spent</SelectItem>
                  <SelectItem value="lastOrderDate">Last Order Date</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Order</label>
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end space-x-2">
              <Button onClick={handleFilter} className="flex-1">
                Apply Filters
              </Button>
              <Button onClick={handleReset} variant="outline">
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Panel - Desktop */}
      {!isMobile && selectedCustomers.size > 0 && (
        <Card className="sticky top-4 z-10 border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg">
                  <span className="font-semibold">{selectedCustomers.size}</span>
                  <span className="ml-2">Customer{selectedCustomers.size !== 1 ? 's' : ''} Selected</span>
                </div>
                {hasRequiredPermission('BulkCommunication', 'create') && (
                  <Button
                    onClick={() => setBulkCommModalOpen(true)}
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600"
                  >
                    <Megaphone className="h-4 w-4 mr-2" />
                    Send Bulk SMS/Email
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            <Table divClass="relative">
              <TableHeader className="sticky top-0 bg-white border-b z-10">
                <TableRow className="bg-sidebar">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        customers && customers.length > 0 && selectedCustomers.size === customers.length
                          ? true
                          : false
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all customers"
                    />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers && customers.map((customer, index) => (
                  <TableRow
                    key={index}
                    className={`hover:bg-gray-50 ${selectedCustomers.has(customer.customerPhone) ? 'bg-blue-50' : ''}`}
                  >
                    <TableCell className="w-12">
                      <Checkbox
                        checked={selectedCustomers.has(customer.customerPhone)}
                        onCheckedChange={() => handleSelectCustomer(customer.customerPhone)}
                        aria-label={`Select ${customer.customerName}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <span>{customer.customerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{customer.customerPhone}</TableCell>
                    <TableCell>{customer.customerEmail || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell>{customer.totalOrderCount}</TableCell>
                    <TableCell>৳{customer.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>
                      {safeFormatDate(customer.lastOrderDate)}
                    </TableCell>
                    <TableCell>
                      {safeFormatDate(customer.firstOrderDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!customers || customers.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No customers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {customers && customers.length > 0 && (
            <div className="border-t p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((params.page || 1) - 1) * (params.limit || 20) + 1}-
                  {Math.min((params.page || 1) * (params.limit || 20), customers.length)}{' '}
                  of {customers.length} customers
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(params.page || 1) === 1}
                    onClick={() => handlePageChange((params.page || 1) - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">Page {params.page || 1}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange((params.page || 1) + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Floating Action Button */}
      {isMobile && selectedCustomers.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <Button
            onClick={() => setBulkCommModalOpen(true)}
            className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-lg"
            size="lg"
          >
            <Megaphone className="h-5 w-5 mr-2" />
            Send Campaign to {selectedCustomers.size} Customer{selectedCustomers.size !== 1 ? 's' : ''}
          </Button>
        </div>
      )}

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        phone={selectedCustomerPhone}
        email={selectedCustomerEmail}
      />

      {/* Bulk Communication Modal */}
      <BulkCommunicationModal
        open={bulkCommModalOpen}
        onOpenChange={handleBulkCommModalClose}
        customers={getBulkCommCustomers()}
      />
    </div>
  );
};

export default CustomerAnalytics;
