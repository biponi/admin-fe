import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePackageStore } from "../../store/packageStore";
import { PackageStatusBadge } from "../../components/package/PackageStatusBadge";
import { PackageSearchBar } from "../../components/package/PackageSearchBar";
import { PackageBulkActionsBar } from "../../components/package/PackageBulkActionsBar";
import { PackagePagination } from "../../components/package/PackagePagination";
import { SelectedPackagesSheet } from "../../components/package/SelectedPackagesSheet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Loader2,
  Package,
  Package as PackageIcon,
  User,
  Phone,
  MapPin,
  DollarSign,
  Printer,
  Eye,
  Box,
  FileText,
  RefreshCw,
} from "lucide-react";
import type { PackageStatus, Package as PackageType } from "./interface";
import type { IOrderProduct } from "../order/interface.d";
import { toast } from "sonner";
import axios from "../../api/axios";
import config from "../../utils/config";
import PlaceHolderImage from "../../assets/placeholder.svg";
import { AnimatePresence } from "framer-motion";
import { generatePackingSlipPdfByOrderIdentifier } from "../../utils/reactPdfPackingSlip";
import { downloadPackagingSlip } from "../../api/package";

const statusTabs: { value: PackageStatus; label: string; color: string }[] = [
  { value: "requested", label: "Requested", color: "bg-yellow-500" },
  { value: "packing", label: "Packing", color: "bg-blue-500" },
  { value: "packed", label: "Packed", color: "bg-purple-500" },
  {
    value: "shipping_requested",
    label: "Shipping Requested",
    color: "bg-indigo-500",
  },
  { value: "shipped", label: "Shipped", color: "bg-cyan-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
  { value: "returned", label: "Returned", color: "bg-orange-500" },
];

export function PackageManagementPage() {
  const navigate = useNavigate();
  const {
    packages,
    loading,
    refreshing,
    loadPackagesByStatus,
    searchPackages,
    searchQuery,
    setSearchQuery,
    clearSearch,
    currentPage,
    totalPages,
    totalPackages,
    pageSize,
    setCurrentPage,
    setPageSize,
    selection,
    toggleSelection,
    selectAll,
    clearSelection,
    getSelectedPackages,
    getSelectedOrderNumbers,
  } = usePackageStore();

  const [activeTab, setActiveTab] = useState<PackageStatus>("requested");
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(
    null,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Bulk action progress state
  const [bulkProgress, setBulkProgress] = useState<{
    inProgress: boolean;
    completed: number;
    failed: number;
    total: number;
    errors: Array<{ id: string; error: string }>;
  } | null>(null);

  // Selected packages viewer
  const [selectedOrdersViewerOpen, setSelectedOrdersViewerOpen] =
    useState(false);

  // Products sheet state
  const [showProductsSheet, setShowProductsSheet] = useState(false);
  const [productsPackage, setProductsPackage] = useState<PackageType | null>(
    null,
  );
  const [orderProducts, setOrderProducts] = useState<IOrderProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Load packages when tab or page changes
  useEffect(() => {
    if (searchQuery) {
      searchPackages(searchQuery, currentPage);
    } else {
      loadPackagesByStatus(activeTab, currentPage, pageSize);
    }
    // Clear selection when tab changes
    clearSelection();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage, pageSize]);

  // Handle search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchPackages(searchQuery, 1);
        setCurrentPage(1);
      } else {
        loadPackagesByStatus(activeTab, currentPage, pageSize);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    searchQuery,
    activeTab,
    currentPage,
    pageSize,
    loadPackagesByStatus,
    searchPackages,
    setCurrentPage,
  ]);

  // Refresh handler
  const handleRefresh = async () => {
    if (searchQuery) {
      await searchPackages(searchQuery, currentPage);
    } else {
      await loadPackagesByStatus(activeTab, currentPage, pageSize);
    }
    toast.success("Packages refreshed");
  };

  // Handle select all (using store)
  const handleSelectAll = () => {
    selectAll();
  };

  // Handle select individual (using store)
  const handleSelectPackage = (packageId: string) => {
    toggleSelection(packageId);
  };

  // Bulk actions
  const handleBulkMarkPacked = async () => {
    const selectedPkgs = getSelectedPackages();
    if (selectedPkgs.length === 0) return;

    setBulkProgress({
      inProgress: true,
      completed: 0,
      failed: 0,
      total: selectedPkgs.length,
      errors: [],
    });

    // TODO: Implement bulk mark as packed API call
    toast.success(`Marking ${selectedPkgs.length} packages as packed...`);

    // Simulate progress
    for (let i = 0; i < selectedPkgs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setBulkProgress((prev) =>
        prev ? { ...prev, completed: prev.completed + 1 } : null,
      );
    }

    setBulkProgress((prev) => (prev ? { ...prev, inProgress: false } : null));
    clearSelection();
  };

  const handleBulkRequestShipping = () => {
    const selectedOrderNumbers = getSelectedOrderNumbers();
    navigate("/packages/bulk-shipping", {
      state: { orderNumbers: selectedOrderNumbers },
    });
  };

  const handlePrintSlips = () => {
    const selectedPkgs = getSelectedPackages();
    toast.success(
      `Preparing ${selectedPkgs.length} packing slips for printing...`,
    );
    // TODO: Implement bulk print
  };

  const handleViewSelected = () => {
    setSelectedOrdersViewerOpen(true);
  };

  const handleClearSelection = () => {
    clearSelection();
  };

  const handlePrintSlip = async (orderNumber: number) => {
    toast.success("Preparing packing slip...");
    try {
      await generatePackingSlipPdfByOrderIdentifier(`${orderNumber}`);

      // Update package status to "packing" after successful download
      const response = await downloadPackagingSlip(orderNumber);
      if (response.success) {
        toast.success("Package status updated to packing");

        // Refresh the packages list to reflect the status change
        if (searchQuery) {
          await searchPackages(searchQuery, currentPage);
        } else {
          await loadPackagesByStatus(activeTab, currentPage, pageSize);
        }
      } else {
        toast.error(response.error || "Failed to update package status");
      }
    } catch (error) {
      console.error("Error handling print slip:", error);
      toast.error("Failed to generate packing slip or update status");
    }
  };

  const handleViewDetails = (pkg: PackageType) => {
    navigate(`/packages/${pkg.orderNumber}`);
  };

  // Fetch products for a package
  const handleViewProducts = async (pkg: PackageType) => {
    if (!pkg.order?.id) {
      toast.error("Order information not available");
      return;
    }

    try {
      setLoadingProducts(true);
      setProductsPackage(pkg);
      setShowProductsSheet(true);

      const response = await axios.get<any>(
        config.order.getOrderProducts(pkg.order.id),
      );
      if (response.data?.success && response.data?.data?.products) {
        setOrderProducts(response.data.data.products);
      }
    } catch (error) {
      console.error("Error fetching order products:", error);
      toast.error("Failed to load order products");
    } finally {
      setLoadingProducts(false);
    }
  };

  if (loading && packages.length === 0) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  const selectedCount = selection.selectedIds.size;

  return (
    <div className='space-y-6 pb-24 px-4 md:px-6 lg:px-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 py-2 bg-gray-100 rounded-lg shadow-md mt-2 md:mt-0'>
        <div>
          <h1 className='text-base md:text-3xl font-bold'>
            Package Management
          </h1>
          <p className='text-gray-500 mt-1 hidden md:block'>
            Manage and track all packages across different statuses
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={handleRefresh}
            disabled={refreshing}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => navigate("/packages/scan")}>
            <Package className='mr-2 h-4 w-4' />
            Scan Barcode
          </Button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <PackageBulkActionsBar
            selectedCount={selectedCount}
            totalCount={totalPackages}
            isAllSelected={selection.isAllSelected}
            onClearSelection={handleClearSelection}
            onSelectAll={handleSelectAll}
            onMarkPacked={handleBulkMarkPacked}
            onRequestShipping={handleBulkRequestShipping}
            onPrintSlips={handlePrintSlips}
            onViewSelected={handleViewSelected}
            progress={bulkProgress}
          />
        )}
      </AnimatePresence>

      {/* Tabs for Status */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as PackageStatus)}>
        <ScrollArea className='w-full '>
          <div className='flex justify-between items-center gap-4'>
            <TabsList>
              {statusTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  <span className='flex items-center gap-2'>
                    <span className={`h-2 w-2 rounded-full ${tab.color}`} />
                    {tab.label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Search Bar */}
            <PackageSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={clearSearch}
            />
          </div>
        </ScrollArea>

        {statusTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className='mt-6'>
            {packages.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <Box className='h-12 w-12 text-gray-400 mb-4' />
                  <p className='text-gray-500'>
                    No packages in {tab.label.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className='hidden md:block'>
                  <div className='flex items-center gap-3 mb-4'>
                    <Checkbox
                      checked={selection.isAllSelected}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className='text-sm text-gray-600'>
                      {selection.isAllSelected ? "Deselect All" : "Select All"}
                    </span>
                  </div>

                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='w-12'></TableHead>
                          <TableHead>Package Code</TableHead>
                          <TableHead>Order #</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead className='text-right'>
                            COD Amount
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Product(s)</TableHead>
                          <TableHead className='text-right'>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {packages.map((pkg) => (
                          <TableRow
                            key={pkg._id}
                            className={`cursor-pointer hover:bg-gray-50 ${
                              selection.selectedIds.has(pkg._id)
                                ? "bg-blue-50"
                                : ""
                            }`}>
                            <TableCell>
                              <Checkbox
                                checked={selection.selectedIds.has(pkg._id)}
                                onCheckedChange={() =>
                                  handleSelectPackage(pkg._id)
                                }
                              />
                            </TableCell>
                            <TableCell className='font-mono text-sm'>
                              {pkg.packageCode}
                            </TableCell>
                            <TableCell className='font-medium'>
                              <Button
                                variant='secondary'
                                className='bg-purple-100 text-purple-700 font-bold'
                                onClick={() => setSelectedPackage(pkg)}>
                                #{pkg.orderNumber}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className='flex flex-col'>
                                <span className='font-medium text-gray-900'>
                                  {pkg.order?.customer.name || "N/A"}
                                </span>
                                <span className='text-xs text-gray-500'>
                                  {pkg.order?.customer.phoneNumber || "N/A"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className='max-w-[200px]'>
                              <div className='flex flex-col'>
                                <div className='flex items-start gap-1'>
                                  <MapPin className='h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0' />
                                  <span>
                                    {pkg.order?.shipping.district || "N/A"}
                                    {", "}
                                    {pkg.order?.shipping.division || "N/A"}
                                  </span>
                                </div>
                                <span className='truncate text-xs text-gray-500'>
                                  {pkg.order?.shipping.address || "N/A"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className='text-right'>
                              <div className='flex items-center justify-end gap-1'>
                                <DollarSign className='h-4 w-4 text-green-600' />
                                <span className='font-bold text-green-700'>
                                  {pkg.order?.remaining || 0}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <PackageStatusBadge status={pkg.status} />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => handleViewProducts(pkg)}>
                                <PackageIcon className='h-4 w-4' /> Show
                                Products
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center justify-end gap-2'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() =>
                                    handlePrintSlip(pkg.orderNumber)
                                  }>
                                  <Printer className='h-4 w-4' /> Slip
                                </Button>

                                <Button
                                  variant='default'
                                  size='sm'
                                  onClick={() => handleViewDetails(pkg)}>
                                  <FileText className='h-4 w-4' /> Details
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </div>

                {/* Mobile Card View */}
                <div className='md:hidden space-y-4'>
                  <div className='flex items-center gap-3 mb-4 px-1'>
                    <Checkbox
                      checked={selection.isAllSelected}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className='text-sm text-gray-600'>
                      {selection.isAllSelected ? "Deselect All" : "Select All"}
                    </span>
                  </div>

                  {packages.map((pkg) => (
                    <PackageCard
                      key={pkg._id}
                      package={pkg}
                      isSelected={selection.selectedIds.has(pkg._id)}
                      onSelect={handleSelectPackage}
                      onPrint={handlePrintSlip}
                      onViewDetails={handleViewDetails}
                      onViewProducts={handleViewProducts}
                      onOpenSheet={setSelectedPackage}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <PackagePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalPackages}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  className='mt-6'
                />
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Product Details Sheet */}
      <ProductDetailsSheet
        package={selectedPackage}
        open={!!selectedPackage}
        onOpenChange={(open) => !open && setSelectedPackage(null)}
      />

      {/* Order Products Sheet */}
      <OrderProductsSheet
        package={productsPackage}
        open={showProductsSheet}
        onOpenChange={setShowProductsSheet}
        products={orderProducts}
        loading={loadingProducts}
      />

      {/* Selected Packages Sheet */}
      <SelectedPackagesSheet
        packages={getSelectedPackages()}
        open={selectedOrdersViewerOpen}
        onOpenChange={setSelectedOrdersViewerOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Packages</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} package(s)? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success("Delete functionality not implemented yet");
                setShowDeleteDialog(false);
                clearSelection();
              }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Mobile Card Component
interface PackageCardProps {
  package: PackageType;
  isSelected: boolean;
  onSelect: (packageId: string) => void;
  onPrint: (orderNumber: number) => void;
  onViewDetails: (pkg: PackageType) => void;
  onViewProducts: (pkg: PackageType) => void;
  onOpenSheet: (pkg: PackageType) => void;
}

function PackageCard({
  package: pkg,
  isSelected,
  onSelect,
  onPrint,
  onViewDetails,
  onViewProducts,
  onOpenSheet,
}: PackageCardProps) {
  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 relative ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}>
      {/* Selection Checkbox */}
      <div className='absolute top-3 left-3 z-10'>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(pkg._id)}
          className='bg-white'
        />
      </div>

      <CardHeader className='pb-3 pl-12'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              <h3 className='text-lg font-bold'>#{pkg.orderNumber}</h3>
              <Badge variant='outline' className='font-mono text-xs'>
                {pkg.packageCode}
              </Badge>
            </div>
            <PackageStatusBadge status={pkg.status} />
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Customer Info */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-sm'>
            <User className='h-4 w-4 text-gray-500' />
            <span className='font-medium'>
              {pkg.order?.customer.name || "N/A"}
            </span>
          </div>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <Phone className='h-4 w-4' />
            <span>{pkg.order?.customer.phoneNumber || "N/A"}</span>
          </div>
          <div className='flex items-start gap-2 text-sm text-gray-600'>
            <MapPin className='h-4 w-4 mt-0.5 flex-shrink-0' />
            <span className='line-clamp-2'>
              {pkg.order?.shipping.address || "N/A"}
            </span>
          </div>
        </div>

        {/* COD Amount */}
        <div className='flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200'>
          <div className='flex items-center gap-2'>
            <DollarSign className='h-4 w-4 text-green-600' />
            <span className='text-sm font-medium text-green-900'>
              COD Amount
            </span>
          </div>
          <span className='text-lg font-bold text-green-700'>
            {pkg.order?.remaining || 0}৳
          </span>
        </div>

        {/* Actions */}
        <div className='flex gap-2 pt-2'>
          <Button
            variant='outline'
            size='sm'
            className='flex-1'
            onClick={() => onOpenSheet(pkg)}>
            <Eye className='h-4 w-4 mr-1' />
            Items
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='flex-1'
            onClick={() => onViewProducts(pkg)}>
            <PackageIcon className='h-4 w-4 mr-1' />
            Products
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='flex-1'
            onClick={() => onPrint(pkg.orderNumber)}>
            <Printer className='h-4 w-4 mr-1' />
            Print
          </Button>
          <Button
            size='sm'
            className='flex-1'
            onClick={() => onViewDetails(pkg)}>
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Product Details Sheet
interface ProductDetailsSheetProps {
  package: PackageType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ProductDetailsSheet({
  package: pkg,
  open,
  onOpenChange,
}: ProductDetailsSheetProps) {
  if (!pkg) return null;

  // Show order notes and basic info
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>Package Details</SheetTitle>
          <p className='text-sm text-gray-500'>
            Order #{pkg.orderNumber} • {pkg.packageCode}
          </p>
        </SheetHeader>

        <div className='mt-6 space-y-4'>
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Order Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div>
                <p className='text-sm text-gray-500'>Order Number</p>
                <p className='font-semibold'>
                  #{pkg.order?.orderNumber || pkg.orderNumber}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Customer Name</p>
                <p className='font-semibold'>
                  {pkg.order?.customer.name || "N/A"}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Phone</p>
                <p className='font-semibold'>
                  {pkg.order?.customer.phoneNumber || "N/A"}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Shipping Address</p>
                <p className='text-sm'>
                  {pkg.order?.shipping.address || "N/A"}
                </p>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-500'>Total Amount</p>
                  <p className='font-semibold'>{pkg.order?.totalPrice || 0}৳</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>COD Amount</p>
                  <p className='font-semibold text-green-600'>
                    {pkg.order?.remaining || 0}৳
                  </p>
                </div>
              </div>
              {pkg.order?.notes && (
                <div>
                  <p className='text-sm text-gray-500'>Special Instructions</p>
                  <p className='text-sm italic'>{pkg.order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Package Info */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Package Status</CardTitle>
            </CardHeader>
            <CardContent>
              <PackageStatusBadge status={pkg.status} />
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Order Products Sheet
interface OrderProductsSheetProps {
  package: PackageType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: IOrderProduct[];
  loading: boolean;
}

function OrderProductsSheet({
  package: pkg,
  open,
  onOpenChange,
  products,
  loading,
}: OrderProductsSheetProps) {
  if (!pkg) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>Order Products #{pkg.orderNumber}</SheetTitle>
          <p className='text-sm text-gray-500'>
            {pkg.packageCode} • {products.length} items
          </p>
        </SheetHeader>

        <div className='mt-6'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <PackageIcon className='h-12 w-12 text-gray-400 mb-4' />
                <p className='text-gray-500'>No products found</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className='h-[calc(100vh-200px)]'>
              <div className='space-y-4 pr-4'>
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardContent className='p-4'>
                      <div className='flex gap-4'>
                        {/* Product Image */}
                        <div className='flex-shrink-0'>
                          <img
                            //@ts-ignore
                            src={product.image || PlaceHolderImage}
                            alt={product.name}
                            className='w-20 h-20 object-cover rounded-md border'
                            onError={(e) => {
                              e.currentTarget.src = PlaceHolderImage;
                            }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className='flex-1 min-w-0'>
                          <div className='flex justify-start items-start flex-col'>
                            <p className='font-medium text-lg line-clamp-2 mb-1'>
                              {product.name.toUpperCase()}
                            </p>

                            {/* Variant */}
                            {product.variant &&
                              (product.variant.color ||
                                product.variant.size) && (
                                <Badge
                                  variant='outline'
                                  className='text-xs bg-rose-100 text-rose-600'>
                                  (
                                  {product.variant.color && (
                                    <span className='capitalize'>
                                      {product.variant.color}
                                    </span>
                                  )}
                                  {product.variant.color &&
                                    product.variant.size && <span> . </span>}
                                  {product.variant.size && (
                                    <span>{product.variant.size}</span>
                                  )}
                                  )
                                </Badge>
                              )}
                          </div>

                          {/* Price and Quantity */}
                          <div className='flex items-center justify-end'>
                            <Badge variant='secondary' className='text-xs'>
                              Qty: {product.quantity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
