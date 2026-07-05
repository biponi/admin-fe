import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePackageStore } from "../../store/packageStore";
import { PackageStatusBadge } from "../../components/package/PackageStatusBadge";
import { PackageSearchBar } from "../../components/package/PackageSearchBar";
import { PackageBulkActionsBar } from "../../components/package/PackageBulkActionsBar";
import { PackagePagination } from "../../components/package/PackagePagination";
import { SelectedPackagesSheet } from "../../components/package/SelectedPackagesSheet";
import { Card, CardContent } from "../../components/ui/card";
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
  Barcode,
  Search,
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
import { cn } from "../../lib/utils";

const statusTabs: { value: PackageStatus; label: string; color: string }[] = [
  { value: "requested", label: "Requested", color: "bg-amber-500" },
  { value: "packing", label: "Packing", color: "bg-blue-500" },
  { value: "packed", label: "Packed", color: "bg-violet-500" },
  {
    value: "shipping_requested",
    label: "Shipping Requested",
    color: "bg-indigo-500",
  },
  { value: "shipped", label: "Shipped", color: "bg-cyan-500" },
  { value: "completed", label: "Completed", color: "bg-emerald-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-rose-500" },
  { value: "returned", label: "Returned", color: "bg-orange-500" },
];

const STATUS_BADGE_COLORS: Record<string, string> = {
  amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  blue: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  violet: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  cyan: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  rose: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  orange: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
};

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

  // Track whether the initial load has completed so we can
  // differentiate "first load" (full-page spinner) from "tab switch" (inline spinner).
  const [initialLoaded, setInitialLoaded] = useState(false);

  // This effect handles tab, page, and page size changes only.
  useEffect(() => {
    if (searchQuery) {
      searchPackages(searchQuery, currentPage);
    } else {
      loadPackagesByStatus(activeTab, currentPage, pageSize);
    }
    clearSelection();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage, pageSize]);

  // Mark initial load as complete once packages arrive
  useEffect(() => {
    if (packages.length > 0 && !initialLoaded) {
      setInitialLoaded(true);
    }
  }, [packages, initialLoaded]);

  // FIX: Search effect only watches searchQuery (debounced).
  // Removed activeTab, currentPage, pageSize to prevent double API calls.
  useEffect(() => {
    if (!searchQuery) return;

    const timeoutId = setTimeout(() => {
      searchPackages(searchQuery, 1);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

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

    toast.success(`Marking ${selectedPkgs.length} packages as packed...`);

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

      const response = await downloadPackagingSlip(orderNumber);
      if (response.success) {
        toast.success("Package status updated to packing");

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

  if (loading && !initialLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
          <div className="relative h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        </div>
        <p className="mt-6 text-lg font-semibold text-slate-900">
          Loading packages...
        </p>
        <p className="text-sm text-slate-500 mt-1">
          Please wait while we fetch the data
        </p>
      </div>
    );
  }

  const selectedCount = selection.selectedIds.size;

  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 leading-tight">
                Package Management
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage and track all packages across different statuses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-9 text-slate-600 border-slate-200 hover:bg-slate-50">
              <RefreshCw
                className={cn(
                  "h-3.5 w-3.5 mr-1.5",
                  refreshing && "animate-spin",
                )}
              />
              Refresh
            </Button>
            <Button
              onClick={() => navigate("/packages/scan")}
              className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 gap-1.5">
              <Barcode className="h-3.5 w-3.5" />
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as PackageStatus)}
            className="w-full">
            {/* Tab Bar */}
            <div className="border-b border-slate-100">
              <ScrollArea className="w-full">
                <TabsList className="h-auto bg-transparent p-0 gap-0 rounded-none flex justify-start">
                  {statusTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 whitespace-nowrap">
                      <span
                        className={cn("h-2 w-2 rounded-full", tab.color)}
                      />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
              <PackageSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={clearSearch}
              />
            </div>

            {statusTabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="p-4 sm:p-6 mt-0 focus-visible:outline-none relative">
                {/* Tab-level loading overlay for tab switches */}
                {loading && initialLoaded && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                      <p className="text-sm font-medium text-slate-600">
                        Loading {tab.label.toLowerCase()}...
                      </p>
                    </div>
                  </div>
                )}
                {packages.length === 0 && !loading ? (
                  <div className="py-20 px-4 text-center">
                    <div className="mx-auto h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                      <Box className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-xl font-bold text-slate-900 mb-2">
                      No packages found
                    </p>
                    <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                      {searchQuery
                        ? "Try adjusting your search criteria"
                        : `No packages in ${tab.label.toLowerCase()} status`}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                      <div className="flex items-center gap-3 mb-4">
                        <Checkbox
                          checked={selection.isAllSelected}
                          onCheckedChange={handleSelectAll}
                        />
                        <span className="text-sm text-slate-500">
                          {selection.isAllSelected
                            ? "Deselect All"
                            : "Select All"}
                        </span>
                      </div>

                      <Card className="border border-slate-200 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50/80 hover:bg-slate-50">
                              <TableHead className="w-12"></TableHead>
                              <TableHead className="font-semibold text-slate-700">
                                Package Code
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700">
                                Order #
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700">
                                Customer
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700">
                                Address
                              </TableHead>
                              <TableHead className="text-right font-semibold text-slate-700">
                                COD Amount
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700">
                                Status
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700">
                                Product(s)
                              </TableHead>
                              <TableHead className="text-right font-semibold text-slate-700">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {packages.map((pkg) => (
                              <TableRow
                                key={pkg._id}
                                className={cn(
                                  "cursor-pointer transition-colors",
                                  selection.selectedIds.has(pkg._id)
                                    ? "bg-indigo-50/50 hover:bg-indigo-50"
                                    : "hover:bg-slate-50",
                                )}>
                                <TableCell>
                                  <Checkbox
                                    checked={selection.selectedIds.has(pkg._id)}
                                    onCheckedChange={() =>
                                      handleSelectPackage(pkg._id)
                                    }
                                  />
                                </TableCell>
                                <TableCell className="font-mono text-sm text-slate-600">
                                  {pkg.packageCode}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="secondary"
                                    className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold h-7 text-xs px-2.5 rounded-lg"
                                    onClick={() => setSelectedPackage(pkg)}>
                                    #{pkg.orderNumber}
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-slate-900 text-sm">
                                      {pkg.order?.customer.name || "N/A"}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {pkg.order?.customer.phoneNumber || "N/A"}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-[200px]">
                                  <div className="flex flex-col">
                                    <div className="flex items-start gap-1">
                                      <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-slate-700">
                                        {pkg.order?.shipping.district || "N/A"}
                                        {", "}
                                        {pkg.order?.shipping.division || "N/A"}
                                      </span>
                                    </div>
                                    <span className="truncate text-xs text-slate-500 ml-4.5">
                                      {pkg.order?.shipping.address || "N/A"}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <span className="text-sm font-semibold text-emerald-600">
                                      {pkg.order?.remaining || 0}
                                      <span className="text-xs font-normal text-slate-400 ml-0.5">
                                        BDT
                                      </span>
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <PackageStatusBadge status={pkg.status} />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewProducts(pkg)}
                                    className="h-7 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 gap-1">
                                    <PackageIcon className="h-3.5 w-3.5" />
                                    Products
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end gap-1.5">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handlePrintSlip(pkg.orderNumber)
                                      }
                                      className="h-7 w-7 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg"
                                      title="Print Slip">
                                      <Printer className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleViewDetails(pkg)}
                                      className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-1 rounded-lg">
                                      <FileText className="h-3.5 w-3.5" />
                                      Details
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
                    <div className="md:hidden space-y-3">
                      <div className="flex items-center gap-3 mb-4 px-1">
                        <Checkbox
                          checked={selection.isAllSelected}
                          onCheckedChange={handleSelectAll}
                        />
                        <span className="text-sm text-slate-500">
                          {selection.isAllSelected
                            ? "Deselect All"
                            : "Select All"}
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
                      className="mt-6"
                    />
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

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
        <AlertDialogContent className="sm:max-w-[440px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-xl bg-rose-600 flex items-center justify-center shadow-sm">
                <PackageIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-semibold text-slate-900">
                  Delete Selected Packages
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-sm text-slate-600 pl-1">
              Are you sure you want to delete {selectedCount} package(s)? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="h-10 border border-slate-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success("Delete functionality not implemented yet");
                setShowDeleteDialog(false);
                clearSelection();
              }}
              className="h-10 bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-200">
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
      className={cn(
        "overflow-hidden rounded-xl border transition-all duration-200",
        isSelected
          ? "border-indigo-200 bg-indigo-50/30 shadow-md shadow-indigo-500/5"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md",
      )}>
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(pkg._id)}
          className="bg-white"
        />
      </div>

      <div className="p-4 pl-12">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-base font-bold text-slate-900">
                #{pkg.orderNumber}
              </h3>
              <Badge
                variant="outline"
                className="font-mono text-[10px] bg-slate-50 text-slate-600 border-slate-200 rounded-md">
                {pkg.packageCode}
              </Badge>
            </div>
            <PackageStatusBadge status={pkg.status} />
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-800">
              {pkg.order?.customer.name || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Phone className="h-3.5 w-3.5" />
            <span>{pkg.order?.customer.phoneNumber || "N/A"}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">
              {pkg.order?.shipping.address || "N/A"}
            </span>
          </div>
        </div>

        {/* COD Amount */}
        <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-xl border border-emerald-100 mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">
              COD Amount
            </span>
          </div>
          <span className="text-base font-bold text-emerald-700">
            {pkg.order?.remaining || 0}
            <span className="text-xs font-normal text-emerald-500 ml-0.5">
              BDT
            </span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 gap-1"
            onClick={() => onOpenSheet(pkg)}>
            <Eye className="h-3.5 w-3.5" />
            Items
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 gap-1"
            onClick={() => onViewProducts(pkg)}>
            <PackageIcon className="h-3.5 w-3.5" />
            Products
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 gap-1"
            onClick={() => onPrint(pkg.orderNumber)}>
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-1 rounded-lg"
            onClick={() => onViewDetails(pkg)}>
            Details
          </Button>
        </div>
      </div>
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-base font-semibold">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100">
              <PackageIcon className="h-3.5 w-3.5 text-indigo-600" />
            </span>
            Package Details
          </SheetTitle>
          <p className="text-sm text-slate-500">
            Order #{pkg.orderNumber} &bull; {pkg.packageCode}
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Order Info */}
          <Card className="border border-slate-200">
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Order Number
                </p>
                <p className="font-semibold text-slate-900">
                  #{pkg.order?.orderNumber || pkg.orderNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Customer Name
                </p>
                <p className="font-semibold text-slate-900">
                  {pkg.order?.customer.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Phone
                </p>
                <p className="font-semibold text-slate-900">
                  {pkg.order?.customer.phoneNumber || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Shipping Address
                </p>
                <p className="text-sm text-slate-700">
                  {pkg.order?.shipping.address || "N/A"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    Total Amount
                  </p>
                  <p className="font-semibold text-slate-900">
                    {pkg.order?.totalPrice || 0}
                    <span className="text-xs font-normal text-slate-400 ml-0.5">
                      BDT
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    COD Amount
                  </p>
                  <p className="font-semibold text-emerald-600">
                    {pkg.order?.remaining || 0}
                    <span className="text-xs font-normal text-slate-400 ml-0.5">
                      BDT
                    </span>
                  </p>
                </div>
              </div>
              {pkg.order?.notes && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    Special Instructions
                  </p>
                  <p className="text-sm italic text-slate-700">
                    {pkg.order.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Package Info */}
          <Card className="border border-slate-200">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
                Package Status
              </p>
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
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-base font-semibold">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100">
              <PackageIcon className="h-3.5 w-3.5 text-indigo-600" />
            </span>
            Order Products #{pkg.orderNumber}
          </SheetTitle>
          <p className="text-sm text-slate-500">
            {pkg.packageCode} &bull; {products.length} items
          </p>
        </SheetHeader>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="text-sm font-medium text-slate-700">
                  Loading products...
                </p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <PackageIcon className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-lg font-bold text-slate-900 mb-1">
                No products found
              </p>
              <p className="text-sm text-slate-500">
                No products associated with this order
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-3 pr-4">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="border border-slate-200 overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            //@ts-ignore
                            src={product.image || PlaceHolderImage}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                            onError={(e) => {
                              e.currentTarget.src = PlaceHolderImage;
                            }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-900 line-clamp-2 mb-1">
                            {product.name.toUpperCase()}
                          </p>

                          {product.variant &&
                            (product.variant.color ||
                              product.variant.size) && (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-rose-50 text-rose-600 border-rose-200 rounded-md mb-1.5">
                                (
                                {product.variant.color && (
                                  <span className="capitalize">
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

                          <div className="flex items-center justify-end">
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-slate-100 text-slate-600 rounded-md">
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
