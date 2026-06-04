import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useCommission } from "../../hooks/useCommission";
import {
  CommissionQueryParams,
  OrderCommissionQueryParams,
  UserCommissionQueryParams,
  Commission,
  OrderCommission,
  OrderCommissionDetails,
  UserCommissionSummary,
  UserCommissionHistory,
} from "../../api/commission";
import { Download, Loader2, BarChart3, FileText, Users, Layers, ChevronDown, Calendar, Filter } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "../../components/ui/drawer";
import { formatDate } from "../../utils/inventoryReportUtils";

// Product-wise components
import { ProductCommissionTable } from "./components/product-wise/ProductCommissionTable";
import { ProductCommissionDetailsModal } from "./components/product-wise/ProductCommissionDetailsModal";

// Order-wise components
import { OrderCommissionTable } from "./components/order-wise/OrderCommissionTable";
import { OrderCommissionDetailsSheet } from "./components/order-wise/OrderCommissionDetailsSheet";
import { BulkCommissionActionsBar } from "./components/order-wise/BulkCommissionActionsBar";
import { MobileBulkCommissionActions } from "./components/order-wise/MobileBulkCommissionActions";

// User-wise components
import { UserCommissionTable } from "./components/user-wise/UserCommissionTable";
import { UserCommissionDetailsSheet } from "./components/user-wise/UserCommissionDetailsSheet";

// Shared components
import { CommissionFilters } from "./components/shared/CommissionFilters";
import { UpdateCommissionDialog } from "./components/shared/UpdateCommissionDialog";
import { CommissionSummaryCards } from "./components/shared/CommissionSummaryCards";
import { CommissionSummaryBadges } from "./components/shared/CommissionSummaryBadges";

export const CommissionManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = searchParams.get("view") || "product-wise";

  // Product-wise state
  const [productActiveTab, setProductActiveTab] = useState("all-commissions");
  const [productFilters, setProductFilters] = useState<CommissionQueryParams>(
    {},
  );
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [productSummary, setProductSummary] = useState<any>(null);
  const [selectedCommission, setSelectedCommission] =
    useState<Commission | null>(null);
  const [viewDetailsCommission, setViewDetailsCommission] =
    useState<Commission | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [, setProductPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  // Order-wise state
  const [orderFilters, setOrderFilters] = useState<OrderCommissionQueryParams>(
    {},
  );
  const [orderCommissions, setOrderCommissions] = useState<OrderCommission[]>(
    [],
  );
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [viewOrderDetails, setViewOrderDetails] =
    useState<OrderCommissionDetails | null>(null);
  const [, setOrderPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkErrors, setBulkErrors] = useState(0);
  const [desktopSummaryOpen, setDesktopSummaryOpen] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMode, setExportMode] = useState<"order-wise" | "user-wise" | "combined" | null>(null);

  // User-wise state
  const [userFilters, setUserFilters] = useState<UserCommissionQueryParams>({});
  const [userCommissions, setUserCommissions] = useState<
    UserCommissionSummary[]
  >([]);
  const [userSummary, setUserSummary] = useState<any>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [viewUserDetails, setViewUserDetails] =
    useState<UserCommissionHistory | null>(null);

  const [, setUserPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const {
    fetchCommissions,
    fetchCommissionSummary,
    fetchOrderCommissions,
    fetchOrderCommissionDetails,
    updateStatus,
    submitBulkOrderCommissionUpdate,
    fetchUserCommissionsList,
    fetchUserCommissionHistory,
    fetchUserWiseSummaryStats,
    downloadCommissionReport,
    isLoading,
  } = useCommission();
  const { toast } = useToast();

  // Update URL when view mode changes
  const setViewMode = (view: string) => {
    setSearchParams({ view });
  };

  // Wrap setFilters in useCallback to prevent infinite re-renders
  const handleProductFiltersChange = useCallback(
    (
      newFiltersOrUpdater:
        | CommissionQueryParams
        | ((prev: CommissionQueryParams) => CommissionQueryParams),
    ) => {
      setProductFilters((prev) => {
        if (typeof newFiltersOrUpdater === "function") {
          return newFiltersOrUpdater(prev);
        }
        return newFiltersOrUpdater;
      });
    },
    [],
  );

  const handleOrderFiltersChange = useCallback(
    (
      newFiltersOrUpdater:
        | OrderCommissionQueryParams
        | ((prev: OrderCommissionQueryParams) => OrderCommissionQueryParams),
    ) => {
      setOrderFilters((prev) => {
        if (typeof newFiltersOrUpdater === "function") {
          return newFiltersOrUpdater(prev);
        }
        return newFiltersOrUpdater;
      });
    },
    [],
  );

  // Fetch product-wise data
  useEffect(() => {
    if (viewMode !== "product-wise") return;

    const loadProductData = async () => {
      const [commissionsData, summaryData] = await Promise.all([
        fetchCommissions(productFilters),
        fetchCommissionSummary(productFilters),
      ]);

      if (commissionsData) {
        setCommissions(commissionsData.commissions);
        setProductPagination(commissionsData.pagination);
      }

      if (summaryData) {
        setProductSummary(summaryData);
      }
    };

    loadProductData();
  }, [productFilters, viewMode, fetchCommissions, fetchCommissionSummary]);

  // Fetch order-wise data
  useEffect(() => {
    if (viewMode !== "order-wise") return;

    const loadOrderData = async () => {
      const ordersData = await fetchOrderCommissions(orderFilters);

      if (ordersData) {
        setOrderCommissions(ordersData.commissions);
        setOrderPagination(ordersData.pagination);
        setOrderSummary(ordersData.summary);
      }
    };

    loadOrderData();
  }, [orderFilters, viewMode, fetchOrderCommissions]);

  // User-wise filter handler
  const handleUserFiltersChange = useCallback(
    (
      newFiltersOrUpdater:
        | UserCommissionQueryParams
        | ((prev: UserCommissionQueryParams) => UserCommissionQueryParams),
    ) => {
      setUserFilters((prev) => {
        if (typeof newFiltersOrUpdater === "function") {
          return newFiltersOrUpdater(prev);
        }
        return newFiltersOrUpdater;
      });
    },
    [],
  );

  // Fetch user-wise data
  useEffect(() => {
    if (viewMode !== "user-wise") return;

    const loadUserData = async () => {
      const [usersData, summaryData] = await Promise.all([
        fetchUserCommissionsList(userFilters),
        fetchUserWiseSummaryStats(userFilters),
      ]);

      if (usersData) {
        setUserCommissions(usersData.data);
        setUserPagination(usersData.pagination);
      }

      if (summaryData) {
        setUserSummary(summaryData);
      }
    };

    loadUserData();
  }, [
    userFilters,
    viewMode,
    fetchUserCommissionsList,
    fetchUserWiseSummaryStats,
  ]);

  const handleUpdateStatus = async (
    id: string,
    status: string,
    notes?: string,
  ) => {
    const result = await updateStatus(id, status, notes);
    if (result) {
      toast({
        title: "Success",
        description: "Commission status updated successfully",
      });
      // Refresh data
      if (viewMode === "product-wise") {
        const commissionsData = await fetchCommissions(productFilters);
        if (commissionsData) {
          setCommissions(commissionsData.commissions);
        }
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update commission status",
      });
    }
  };

  const handleProductTabChange = (value: string) => {
    setProductActiveTab(value);
    if (value === "all-commissions" || value === "top-performers") {
      setProductFilters((prev) => ({ ...prev, status: undefined }));
    } else {
      setProductFilters((prev) => ({ ...prev, status: value }));
    }
  };

  const handleExport = async (
    mode: "order-wise" | "user-wise" | "combined"
  ) => {
    if (isExporting) return;

    setExportMode(mode);
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Get current filters based on active view
      let filters: any = {};

      if (viewMode === "product-wise" && productFilters) {
        filters = {
          startDate: productFilters.startDate,
          endDate: productFilters.endDate,
          status: productFilters.status,
        };
      } else if (viewMode === "order-wise" && orderFilters) {
        filters = {
          startDate: orderFilters.startDate,
          endDate: orderFilters.endDate,
          status: orderFilters.status,
        };
      } else if (viewMode === "user-wise" && userFilters) {
        filters = {
          startDate: userFilters.startDate,
          endDate: userFilters.endDate,
          status: userFilters.status,
        };
      }

      const result = await downloadCommissionReport(
        mode,
        filters,
        (progress) => {
          setExportProgress(progress);
        }
      );

      if (result.success) {
        toast({
          title: "Success",
          description: `${mode} commission report exported: ${result.filename}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Export Failed",
          description: result.error || "Failed to export commission report",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description:
          error.message || "An error occurred while exporting the report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportMode(null);
      setExportProgress(0);
    }
  };

  // Order selection handlers
  const handleSelectOrder = (orderId: string, selected: boolean) => {
    setSelectedOrderIds((prev) =>
      selected ? [...prev, orderId] : prev.filter((id) => id !== orderId),
    );
  };

  const handleSelectAllOrders = (selected: boolean) => {
    setSelectedOrderIds(selected ? orderCommissions.map((c) => c.orderId) : []);
  };

  // View order details
  const handleViewOrderDetails = async (orderCommission: OrderCommission) => {
    const details = await fetchOrderCommissionDetails(orderCommission.orderId);
    if (details) {
      setViewOrderDetails(details);
    }
  };

  // User selection handlers
  const handleSelectUser = (userId: string, selected: boolean) => {
    setSelectedUserIds((prev) =>
      selected ? [...prev, userId] : prev.filter((id) => id !== userId),
    );
  };

  const handleSelectAllUsers = (selected: boolean) => {
    setSelectedUserIds(selected ? userCommissions.map((c) => c.userId) : []);
  };

  // View user details
  const handleViewUserDetails = async (
    userCommission: UserCommissionSummary,
  ) => {
    const details = await fetchUserCommissionHistory(userCommission.userId, {
      interval: "daily",
      includePerformance: true,
    });
    if (details) {
      setViewUserDetails(details);
    }
  };

  // Bulk action handlers
  const handleBulkAction = async (action: string) => {
    if (selectedOrderIds.length === 0) return;

    setBulkProcessing(true);
    setBulkProgress(0);
    setBulkErrors(0);

    // Get order numbers from selected IDs
    const selectedOrders = orderCommissions.filter((c) =>
      selectedOrderIds.includes(c.orderId),
    );
    const orderNumbers = selectedOrders.map((c) => c.orderNumber);

    const result = await submitBulkOrderCommissionUpdate({
      orderNumbers,
      status: action,
    });

    if (result.success) {
      // Simulate progress for queue-based operations
      if (result.jobId) {
        const interval = setInterval(() => {
          setBulkProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setBulkProcessing(false);
              // Refresh data after interval is cleared
              setTimeout(async () => {
                const ordersData = await fetchOrderCommissions(orderFilters);
                if (ordersData) {
                  setOrderCommissions(ordersData.commissions);
                  setOrderSummary(ordersData.summary);
                }
                setSelectedOrderIds([]);
              }, 0);
              toast({
                title: "Success",
                description: `Bulk ${action} completed successfully`,
              });
              return 100;
            }
            return prev + 10;
          });
        }, 500);
      } else {
        // Direct update completed
        setBulkProcessing(false);
        const ordersData = await fetchOrderCommissions(orderFilters);
        if (ordersData) {
          setOrderCommissions(ordersData.commissions);
          setOrderSummary(ordersData.summary);
        }
        setSelectedOrderIds([]);
        toast({
          title: "Success",
          description: `Bulk ${action} completed successfully`,
        });
      }
    } else {
      setBulkProcessing(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Bulk action failed",
      });
    }
  };

  return (
    <div className='space-y-6 mx-2 md:container'>
      {/* Mobile Report Header */}
      <div className='md:hidden space-y-4'>
        {/* Professional mobile header matching PDF style */}
        <div className='border-b pb-4 space-y-3'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Commission Report
            </h2>
            <p className='text-sm text-muted-foreground'>
              {viewMode === 'product-wise' ? 'Product-wise Analysis' :
               viewMode === 'order-wise' ? 'Order-wise Analysis' :
               'Combined Commission Analysis'}
            </p>
          </div>

          {/* Report Metadata */}
          <div className='space-y-2 text-xs text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-3.5 w-3.5' />
              <span>Generated: {formatDate(new Date().toISOString())}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Filter className='h-3.5 w-3.5' />
              <span>
                {(() => {
                  const filters = viewMode === 'product-wise' ? productFilters :
                                  viewMode === 'order-wise' ? orderFilters : userFilters;
                  if (filters?.startDate || filters?.endDate) {
                    return `${filters.startDate ? formatDate(filters.startDate) : 'Start'} – ${filters.endDate ? formatDate(filters.endDate) : 'Present'}`;
                  }
                  return 'All time';
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className='flex gap-2'>
          {/* Summary Button - Opens Drawer with cards */}
          <Drawer
            open={mobileSummaryOpen}
            onOpenChange={setMobileSummaryOpen}>
            <DrawerTrigger asChild>
              <Button variant='outline' className='flex-1'>
                <BarChart3 className='w-4 h-4 mr-2' />
                Summary
              </Button>
            </DrawerTrigger>
            <DrawerContent className='h-auto max-h-[80vh]'>
              <div className='p-4'>
                <h3 className='text-lg font-semibold mb-4'>
                  Commission Summary
                </h3>
                <CommissionSummaryCards
                  type={
                    viewMode === "product-wise"
                      ? "product"
                      : viewMode === "order-wise"
                        ? "order"
                        : "user"
                  }
                  summary={
                    viewMode === "product-wise"
                      ? productSummary?.overview
                      : viewMode === "order-wise"
                        ? orderSummary
                        : userSummary
                  }
                />
              </div>
            </DrawerContent>
          </Drawer>

          {/* Export Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' disabled={isExporting} className='flex-1'>
                {isExporting ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Exporting
                  </>
                ) : (
                  <>
                    <Download className='w-4 h-4 mr-2' />
                    Export
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuItem onClick={() => handleExport('order-wise')}>
                <FileText className='mr-2 h-4 w-4' />
                <span>Order-wise</span>
                <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('user-wise')}>
                <Users className='mr-2 h-4 w-4' />
                <span>User-wise</span>
                <DropdownMenuShortcut>⌘U</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('combined')}>
                <Layers className='mr-2 h-4 w-4' />
                <span>Combined Report</span>
                <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop Header */}
      <div className='hidden md:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            Commission Management
          </h2>
          <p className='text-muted-foreground'>
            Manage and review commissions by product or order
          </p>
        </div>
        <div className='flex gap-2'>
          {/* Summary Button - Desktop Popover */}
          <Popover
            open={desktopSummaryOpen}
            onOpenChange={setDesktopSummaryOpen}>
            <PopoverTrigger asChild>
              <Button variant='outline'>
                <BarChart3 className='w-4 h-4 mr-2' />
                Summary
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-4' align='end'>
              <CommissionSummaryBadges
                type={
                  viewMode === "product-wise"
                    ? "product"
                    : viewMode === "order-wise"
                      ? "order"
                      : "user"
                }
                summary={
                  viewMode === "product-wise"
                    ? productSummary?.overview
                    : viewMode === "order-wise"
                      ? orderSummary
                      : userSummary
                }
              />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Exporting {exportMode && `${exportMode} `}
                    {exportProgress > 0 && `(${exportProgress}%)`}
                  </>
                ) : (
                  <>
                    <Download className='w-4 h-4 mr-2' />
                    Export
                    <ChevronDown className='w-4 h-4 ml-2' />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleExport('order-wise')}>
                <FileText className='w-4 h-4 mr-2' />
                Order-wise only
                <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('user-wise')}>
                <Users className='w-4 h-4 mr-2' />
                User-wise only
                <DropdownMenuShortcut>⌘U</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('combined')}>
                <Layers className='w-4 h-4 mr-2' />
                Combined (Order + User)
                <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={setViewMode} className='space-y-4'>
        <TabsList className='grid w-full max-w-md grid-cols-3'>
          <TabsTrigger value='product-wise'>Product Wise</TabsTrigger>
          <TabsTrigger value='order-wise'>Order Wise</TabsTrigger>
          <TabsTrigger value='user-wise'>User Wise</TabsTrigger>
        </TabsList>

        {/* PRODUCT-WISE TAB CONTENT */}
        <TabsContent value='product-wise' className='space-y-4'>
          {/* Filters */}
          <CommissionFilters
            filters={productFilters}
            onFiltersChange={handleProductFiltersChange}
          />

          {/* Status-based Tabs (existing functionality) */}
          <Tabs
            defaultValue='all-commissions'
            className='space-y-4'
            onValueChange={handleProductTabChange}>
            {/* Mobile: Dropdown for tabs */}
            <div className='md:hidden'>
              <Select
                value={productActiveTab}
                onValueChange={handleProductTabChange}>
                <SelectTrigger className='w-full h-12'>
                  <SelectValue placeholder='Select tab' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all-commissions'>
                    All Commissions
                  </SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='unpaid'>Unpaid</SelectItem>
                  <SelectItem value='paid'>Paid</SelectItem>
                  <SelectItem value='hold'>Hold</SelectItem>
                  <SelectItem value='cancelled'>Cancelled</SelectItem>
                  <SelectItem value='removed'>Removed</SelectItem>
                  <SelectItem value='top-performers'>Top Performers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Desktop: Horizontal tabs */}
            <TabsList className='hidden md:flex overflow-x-auto'>
              <TabsTrigger value='all-commissions'>All Commissions</TabsTrigger>
              <TabsTrigger value='pending'>Pending</TabsTrigger>
              <TabsTrigger value='unpaid'>Unpaid</TabsTrigger>
              <TabsTrigger value='paid'>Paid</TabsTrigger>
              <TabsTrigger value='hold'>Hold</TabsTrigger>
              <TabsTrigger value='cancelled'>Cancelled</TabsTrigger>
              <TabsTrigger value='removed'>Removed</TabsTrigger>
              <TabsTrigger value='top-performers'>Top Performers</TabsTrigger>
            </TabsList>

            <TabsContent value='all-commissions' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>All Commissions</CardTitle>
                  <CardDescription>
                    View and manage all commission records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className='flex justify-center items-center py-12'>
                      <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                    </div>
                  ) : (
                    <ProductCommissionTable
                      commissions={commissions}
                      onViewDetails={(commission) => {
                        setViewDetailsCommission(commission);
                      }}
                      onUpdateStatus={(commission) => {
                        setSelectedCommission(commission);
                        setIsUpdateDialogOpen(true);
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='pending' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Pending Commissions</CardTitle>
                  <CardDescription>Commissions awaiting review</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className='flex justify-center items-center py-12'>
                      <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                    </div>
                  ) : (
                    <ProductCommissionTable
                      commissions={commissions}
                      onViewDetails={(commission) => {
                        setViewDetailsCommission(commission);
                      }}
                      onUpdateStatus={(commission) => {
                        setSelectedCommission(commission);
                        setIsUpdateDialogOpen(true);
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='unpaid' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Unpaid Commissions</CardTitle>
                  <CardDescription>
                    Commissions that are approved but not yet paid
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className='flex justify-center items-center py-12'>
                      <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                    </div>
                  ) : (
                    <ProductCommissionTable
                      commissions={commissions}
                      onViewDetails={(commission) => {
                        setViewDetailsCommission(commission);
                      }}
                      onUpdateStatus={(commission) => {
                        setSelectedCommission(commission);
                        setIsUpdateDialogOpen(true);
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='paid' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Paid Commissions</CardTitle>
                  <CardDescription>
                    Successfully paid commissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className='flex justify-center items-center py-12'>
                      <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                    </div>
                  ) : (
                    <ProductCommissionTable
                      commissions={commissions}
                      onViewDetails={(commission) => {
                        setViewDetailsCommission(commission);
                      }}
                      onUpdateStatus={(commission) => {
                        setSelectedCommission(commission);
                        setIsUpdateDialogOpen(true);
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='hold' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>On Hold Commissions</CardTitle>
                  <CardDescription>
                    Commissions currently on hold
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className='flex justify-center items-center py-12'>
                      <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                    </div>
                  ) : (
                    <ProductCommissionTable
                      commissions={commissions}
                      onViewDetails={(commission) => {
                        setViewDetailsCommission(commission);
                      }}
                      onUpdateStatus={(commission) => {
                        setSelectedCommission(commission);
                        setIsUpdateDialogOpen(true);
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='cancelled' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Cancelled Commissions</CardTitle>
                  <CardDescription>
                    Commissions that have been cancelled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className='flex justify-center items-center py-12'>
                      <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                    </div>
                  ) : (
                    <ProductCommissionTable
                      commissions={commissions}
                      onViewDetails={(commission) => {
                        setViewDetailsCommission(commission);
                      }}
                      onUpdateStatus={(commission) => {
                        setSelectedCommission(commission);
                        setIsUpdateDialogOpen(true);
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='removed' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Removed Commissions</CardTitle>
                  <CardDescription>
                    Commissions that have been removed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className='flex justify-center items-center py-12'>
                      <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                    </div>
                  ) : (
                    <ProductCommissionTable
                      commissions={commissions}
                      onViewDetails={(commission) => {
                        setViewDetailsCommission(commission);
                      }}
                      onUpdateStatus={(commission) => {
                        setSelectedCommission(commission);
                        setIsUpdateDialogOpen(true);
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='top-performers'>
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>
                    View users with the highest commission earnings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {productSummary &&
                  productSummary.topUsers &&
                  productSummary.topUsers.length > 0 ? (
                    <>
                      {/* Mobile: Card Grid */}
                      <div className='md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        {productSummary.topUsers.map(
                          (user: any, index: number) => (
                            <Card key={user.userId} className='hover:shadow-md transition-shadow'>
                              <CardContent className='p-4'>
                                <div className='flex items-start justify-between mb-3'>
                                  <div className='flex items-center gap-3'>
                                    <div className='text-2xl font-bold text-muted-foreground'>
                                      #{index + 1}
                                    </div>
                                    <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm'>
                                      {user.userName.slice(0, 2).toUpperCase()}
                                    </div>
                                  </div>
                                  <div className='text-right'>
                                    <div className='text-lg font-bold text-primary'>
                                      {formatCurrency(user.totalCommission)}
                                    </div>
                                    <div className='text-xs text-green-600'>
                                      {formatCurrency(user.paidAmount)} paid
                                    </div>
                                  </div>
                                </div>
                                <div className='space-y-1'>
                                  <div className='font-medium text-sm'>{user.userName}</div>
                                  <div className='text-xs text-muted-foreground'>
                                    {user.commissionCount} commission{user.commissionCount !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ),
                        )}
                      </div>

                      {/* Desktop: List View */}
                      <div className='hidden md:block space-y-4'>
                        {productSummary.topUsers.map(
                          (user: any, index: number) => (
                            <div
                              key={user.userId}
                              className='flex items-center justify-between p-4 border rounded-lg'>
                              <div className='flex items-center gap-4'>
                                <div className='text-2xl font-bold text-muted-foreground'>
                                  #{index + 1}
                                </div>
                                <div>
                                  <div className='font-medium'>
                                    {user.userName}
                                  </div>
                                  <div className='text-sm text-muted-foreground'>
                                    {user.commissionCount} commissions
                                  </div>
                                </div>
                              </div>
                              <div className='text-right'>
                                <div className='text-lg font-bold'>
                                  {formatCurrency(user.totalCommission)}
                                </div>
                                <div className='text-sm text-green-600'>
                                  {formatCurrency(user.paidAmount)} paid
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </>
                  ) : (
                    <p className='text-muted-foreground'>
                      No top performers data available.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ORDER-WISE TAB CONTENT */}
        <TabsContent value='order-wise' className='space-y-4'>
          {/* Filters */}
          <CommissionFilters
            filters={orderFilters}
            onFiltersChange={handleOrderFiltersChange}
          />

          {/* Order Commission Table */}
          <Card>
            <CardHeader>
              <CardTitle>Order Commissions</CardTitle>
              <CardDescription>
                View commissions grouped by order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderCommissionTable
                commissions={orderCommissions}
                selectedIds={selectedOrderIds}
                onSelect={handleSelectOrder}
                onSelectAll={handleSelectAllOrders}
                onViewDetails={handleViewOrderDetails}
                loading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Bulk Actions (Desktop) */}
          {selectedOrderIds.length > 0 && (
            <BulkCommissionActionsBar
              selectedCount={selectedOrderIds.length}
              processing={bulkProcessing}
              progress={bulkProgress}
              errors={bulkErrors}
              onApprove={() => handleBulkAction("paid")}
              onMarkPaid={() => handleBulkAction("paid")}
              onMarkUnpaid={() => handleBulkAction("unpaid")}
              onHold={() => handleBulkAction("hold")}
              onExport={() => handleExport("order-wise")}
              onCancel={() => handleBulkAction("cancelled")}
              onClearSelection={() => setSelectedOrderIds([])}
            />
          )}

          {/* Bulk Actions (Mobile) */}
          {selectedOrderIds.length > 0 && (
            <MobileBulkCommissionActions
              selectedCount={selectedOrderIds.length}
              processing={bulkProcessing}
              progress={bulkProgress}
              errors={bulkErrors}
              onApprove={() => handleBulkAction("paid")}
              onMarkPaid={() => handleBulkAction("paid")}
              onMarkUnpaid={() => handleBulkAction("unpaid")}
              onHold={() => handleBulkAction("hold")}
              onExport={() => handleExport("order-wise")}
              onCancel={() => handleBulkAction("cancelled")}
              onClearSelection={() => setSelectedOrderIds([])}
            />
          )}
        </TabsContent>

        {/* USER-WISE TAB CONTENT */}
        <TabsContent value='user-wise' className='space-y-4'>
          {/* Filters */}
          <CommissionFilters
            filters={userFilters}
            onFiltersChange={handleUserFiltersChange}
          />

          {/* User Commission Table */}
          <Card>
            <CardHeader>
              <CardTitle>User Commissions</CardTitle>
              <CardDescription>
                View commissions grouped by user with performance metrics and
                analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='flex justify-center items-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
              ) : (
                <UserCommissionTable
                  commissions={userCommissions}
                  selectedIds={selectedUserIds}
                  onSelect={handleSelectUser}
                  onSelectAll={handleSelectAllUsers}
                  onViewDetails={handleViewUserDetails}
                  loading={isLoading}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product-wise Details Modal */}
      <ProductCommissionDetailsModal
        commission={viewDetailsCommission}
        open={!!viewDetailsCommission}
        onOpenChange={(open) => !open && setViewDetailsCommission(null)}
        onEdit={(commission) => {
          setViewDetailsCommission(null);
          setSelectedCommission(commission);
          setIsUpdateDialogOpen(true);
        }}
      />

      {/* Order-wise Details Sheet */}
      <OrderCommissionDetailsSheet
        orderDetails={viewOrderDetails}
        open={!!viewOrderDetails}
        onClose={() => setViewOrderDetails(null)}
      />

      {/* User-wise Details Sheet */}
      <UserCommissionDetailsSheet
        userDetails={viewUserDetails}
        open={!!viewUserDetails}
        onClose={() => setViewUserDetails(null)}
      />

      {/* Update Status Dialog (shared) */}
      <UpdateCommissionDialog
        commission={selectedCommission}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        onUpdate={handleUpdateStatus}
      />
    </div>
  );
};

// Helper function
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
