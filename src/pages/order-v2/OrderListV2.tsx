/**
 * OrderListV2 - Main Order List Component
 * Modern, responsive order list with virtual scrolling, filters, and bulk actions
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  Loader2,
  Edit3,
  Package,
  XCircle,
  Shield,
  CheckCircle,
  Download,
} from "lucide-react";
import { useOrderStore } from "./store/orderStore";
import { useUIStore } from "./store/uiStore";
import { OrderTable } from "./components/OrderTable";
import { MobileOrderList } from "./components/MobileOrderList";
import { SearchBar } from "./components/SearchBar";
import { BulkActionsBar } from "./components/BulkActionsBar";
import { CourierSelector } from "./components/CourierSelector";
import { CommandPalette } from "./components/CommandPalette";
import { KeyboardShortcutsModal } from "./components/KeyboardShortcutsModal";
import { OrderDetailsSheet } from "./components/OrderDetailsSheet";
import { StatusBadge } from "./components/StatusBadge";
import { FloatingHelpButton } from "./components/FloatingHelpButton";
import { OnboardingTour } from "./components/OnboardingTour";
import { FraudDetectionContent } from "./components/FraudDetectionContent";
import { ReturnOrderSheet } from "./components/ReturnOrderSheet";
import { InvoicePreviewModal } from "./components/InvoicePreviewModal";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { cn, formatCurrency } from "./lib/utils";
import { fadeIn } from "./lib/animations";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { orderBulkAction } from "../../api/order";
import { useToast } from "../../components/ui/use-toast";
import { generateMultipleModernInvoicesAndDownloadZip, generateInvoicePreviewData } from "../../utils/invoiceGenerator";
import type {
  OrderStatus,
  KeyboardShortcut,
  IOrder,
  CourierProvider,
} from "./types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { ScrollArea } from "../../components/ui/scroll-area";
import EditCustomerInformation from "../order/editOrderCustomer";
import useOrder from "../order/hooks/useOrder";

export const OrderListV2: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { editOrderData } = useOrder();

  // Zustand stores
  const {
    orders,
    statusCounts,
    isLoading,
    isRefreshing,
    currentPage,
    totalPages,
    totalOrders,
    searchQuery,
    pageSize,
    selection,
    bulkActionProgress,
    fetchOrders,
    refreshOrders,
    setSearchQuery,
    setFilters,
    clearFilters,
    toggleOrderSelection,
    selectAll,
    clearSelection,
    setPageSize,
    nextPage,
    prevPage,
  } = useOrderStore();

  const {
    commandPaletteOpen,
    toggleCommandPalette,
    showKeyboardShortcuts,
    toggleKeyboardShortcutsModal,
  } = useUIStore();

  // Local state
  const [activeTab, setActiveTab] = useState<OrderStatus | "all" | "return">(
    "all"
  );
  const [courierSelectorOpen, setCourierSelectorOpen] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState<"shipped" | null>(
    null
  );
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [fraudDialogOpen, setFraudDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bulkConfirmDialogOpen, setBulkConfirmDialogOpen] = useState(false);
  const [pendingBulkActionType, setPendingBulkActionType] = useState<
    "complete" | "cancel" | "invoice" | null
  >(null);
  const [selectedOrdersViewerOpen, setSelectedOrdersViewerOpen] =
    useState(false);
  const [isGeneratingInvoices, setIsGeneratingInvoices] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [invoicePreviewOpen, setInvoicePreviewOpen] = useState(false);
  const [invoicePreviewData, setInvoicePreviewData] = useState<
    { url: string; orderNumber: number; blob: Blob }[]
  >([]);

  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("orderV2OnboardingComplete");
    if (!hasSeenOnboarding) {
      // Show onboarding after a short delay
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    localStorage.setItem("orderV2OnboardingComplete", "true");
    setShowOnboarding(false);
  };

  // Fetch data on mount
  useEffect(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    // Command Palette & Help
    {
      key: "k",
      meta: true,
      description: "Open command palette",
      action: () => toggleCommandPalette(),
    },
    {
      key: "/",
      meta: true,
      description: "Open command palette (alternative)",
      action: () => toggleCommandPalette(),
    },
    {
      key: "?",
      description: "Show keyboard shortcuts",
      action: () => toggleKeyboardShortcutsModal(),
    },

    // General Actions
    {
      key: "r",
      meta: true,
      description: "Refresh orders",
      action: () => refreshOrders(),
    },
    {
      key: "n",
      meta: true,
      description: "Create new order",
      action: () => handleCreateOrder(),
    },
    {
      key: "f",
      meta: true,
      description: "Focus search",
      action: () => {
        const searchInput = document.querySelector(
          'input[type="text"]'
        ) as HTMLInputElement;
        searchInput?.focus();
      },
    },

    // Selection & Bulk Actions
    {
      key: "a",
      meta: true,
      description: "Select all orders",
      action: () => selectAll(),
    },
    {
      key: "a",
      meta: true,
      shift: true,
      description: "Clear selection",
      action: () => clearSelection(),
    },
    {
      key: "d",
      meta: true,
      description: "Download invoices for selected orders",
      action: () => {
        if (selection.selectedIds.size > 0) {
          handleBulkInvoiceDownload();
        }
      },
    },
    {
      key: "v",
      meta: true,
      description: "View selected orders list",
      action: () => {
        if (selection.selectedIds.size > 0) {
          setSelectedOrdersViewerOpen(true);
        }
      },
    },

    // Status Tabs (Number keys)
    {
      key: "1",
      description: "Show all orders",
      action: () => handleTabChange("all"),
    },
    {
      key: "2",
      description: "Show processing orders",
      action: () => handleTabChange("processing"),
    },
    {
      key: "3",
      description: "Show shipped orders",
      action: () => handleTabChange("shipped"),
    },
    {
      key: "4",
      description: "Show completed orders",
      action: () => handleTabChange("completed"),
    },
    {
      key: "5",
      description: "Show cancelled orders",
      action: () => handleTabChange("cancelled"),
    },
    {
      key: "6",
      description: "Show return orders",
      action: () => handleTabChange("return"),
    },

    // Pagination
    {
      key: "ArrowLeft",
      meta: true,
      description: "Previous page",
      action: () => {
        if (currentPage > 1) prevPage();
      },
    },
    {
      key: "ArrowRight",
      meta: true,
      description: "Next page",
      action: () => {
        if (currentPage < totalPages) nextPage();
      },
    },

    // Close Dialogs
    {
      key: "Escape",
      description: "Close dialogs/modals",
      action: () => {
        // Close any open dialogs
        if (commandPaletteOpen) toggleCommandPalette();
        if (showKeyboardShortcuts) toggleKeyboardShortcutsModal();
        if (selectedOrdersViewerOpen) setSelectedOrdersViewerOpen(false);
        if (orderDetailsOpen) setOrderDetailsOpen(false);
        if (fraudDialogOpen) setFraudDialogOpen(false);
        if (trackingDialogOpen) setTrackingDialogOpen(false);
        if (cancelDialogOpen) setCancelDialogOpen(false);
        if (bulkConfirmDialogOpen) setBulkConfirmDialogOpen(false);
      },
    },
  ];

  // Enable keyboard shortcuts
  useKeyboardShortcuts({ shortcuts, enabled: true });

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as OrderStatus | "all" | "return");
    if (value === "all") {
      clearFilters();
    } else if (value === "return") {
      setFilters({ isReturn: true });
    } else {
      setFilters({ status: value as OrderStatus });
    }
  };

  // Bulk actions handlers
  const performBulkAction = async (
    actionType: string,
    courierProvider?: CourierProvider
  ) => {
    const selectedOrderIds = Array.from(selection.selectedIds)
      .map((id) => {
        const order = orders.find((o) => o._id === id);
        return order?.id;
      })
      .filter((id): id is number => id !== undefined);

    if (selectedOrderIds.length === 0) {
      toast({
        variant: "destructive",
        title: "No orders selected",
        description: "Please select at least one order to perform this action.",
      });
      return;
    }

    try {
      const response = await orderBulkAction(
        selectedOrderIds,
        actionType,
        courierProvider
      );

      if (response.success) {
        let description = response.data?.message || response.data;

        if (
          response.courierOrdersQueued !== undefined &&
          response.courierOrdersTotal !== undefined
        ) {
          description = `${description}\n\nCourier Orders: ${response.courierOrdersQueued}/${response.courierOrdersTotal} created`;
        }

        if (response.warning) {
          description = `${description}\n\n⚠️ ${response.warning}`;
        }

        if (response.courierFailures && response.courierFailures.length > 0) {
          const failuresList = response.courierFailures
            .map((f) => `• Order #${f.orderNumber}: ${f.error}`)
            .join("\n");
          description = `${description}\n\nFailed Orders:\n${failuresList}`;
        }

        toast({
          variant: response.warning ? "default" : "default",
          title: response.warning
            ? "Bulk Action Completed with Warnings"
            : "Bulk Action Success",
          description: description,
        });

        clearSelection();
        refreshOrders();
      } else {
        toast({
          variant: "destructive",
          title: "Bulk Action Failed",
          description:
            response.error ||
            "An error occurred while performing the bulk action.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  const handleBulkShipped = () => {
    setPendingBulkAction("shipped");
    setCourierSelectorOpen(true);
  };

  const handleCourierSelected = async (courierProvider: CourierProvider) => {
    setCourierSelectorOpen(false);
    if (pendingBulkAction === "shipped") {
      await performBulkAction("shipped", courierProvider);
    }
    setPendingBulkAction(null);
  };

  const handleBulkComplete = () => {
    setPendingBulkActionType("complete");
    setBulkConfirmDialogOpen(true);
  };

  const handleBulkCancel = () => {
    setPendingBulkActionType("cancel");
    setBulkConfirmDialogOpen(true);
  };

  const handleBulkInvoiceDownload = () => {
    setPendingBulkActionType("invoice");
    setBulkConfirmDialogOpen(true);
  };

  const confirmBulkAction = async () => {
    if (!pendingBulkActionType) return;

    setBulkConfirmDialogOpen(false);

    if (pendingBulkActionType === "invoice") {
      await generateBulkInvoices();
    } else {
      await performBulkAction(pendingBulkActionType);
    }

    setPendingBulkActionType(null);
  };

  const generateBulkInvoices = async () => {
    setIsGeneratingInvoices(true);

    try {
      const selectedOrderIds = Array.from(selection.selectedIds)
        .map((id) => {
          const order = orders.find((o) => o._id === id);
          return order?.id;
        })
        .filter((id): id is number => id !== undefined);

      if (selectedOrderIds.length === 0) {
        toast({
          variant: "destructive",
          title: "No orders selected",
          description: "Please select at least one order to generate invoices.",
        });
        return;
      }

      toast({
        title: "Generating invoices...",
        description: `Creating ZIP file with ${selectedOrderIds.length} invoices`,
      });

      // Use the existing invoice generator utility
      await generateMultipleModernInvoicesAndDownloadZip(selectedOrderIds);

      toast({
        title: "Invoices Generated",
        description: `Successfully generated ${selectedOrderIds.length} invoices`,
      });

      clearSelection();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to generate invoices",
        description:
          error.message || "An error occurred while generating invoices.",
      });
    } finally {
      setIsGeneratingInvoices(false);
    }
  };

  const printBulkInvoices = async () => {
    setIsGeneratingInvoices(true);

    try {
      const selectedOrderIds = Array.from(selection.selectedIds)
        .map((id) => {
          const order = orders.find((o) => o._id === id);
          return order?.id;
        })
        .filter((id): id is number => id !== undefined);

      if (selectedOrderIds.length === 0) {
        toast({
          variant: "destructive",
          title: "No orders selected",
          description: "Please select at least one order to print invoices.",
        });
        setIsGeneratingInvoices(false);
        return;
      }

      toast({
        title: "Generating invoices...",
        description: `Preparing ${selectedOrderIds.length} invoice${selectedOrderIds.length > 1 ? 's' : ''} for preview`,
      });

      // Generate preview data
      const previewData = await generateInvoicePreviewData(selectedOrderIds);

      setInvoicePreviewData(previewData);
      setInvoicePreviewOpen(true);

      toast({
        title: "Invoices Ready",
        description: `${selectedOrderIds.length} invoice${selectedOrderIds.length > 1 ? 's' : ''} ready for preview`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to prepare invoices",
        description:
          error.message || "An error occurred while preparing invoices for print.",
      });
    } finally {
      setIsGeneratingInvoices(false);
    }
  };

  const handleInvoicePreviewClose = () => {
    setInvoicePreviewOpen(false);
    // Clean up blob URLs
    invoicePreviewData.forEach(data => URL.revokeObjectURL(data.url));
    setInvoicePreviewData([]);
    clearSelection();
  };

  const handlePrintAllInvoices = () => {
    toast({
      title: "Printing invoices...",
      description: "Opening print dialogs for all invoices",
    });
  };

  const handlePrintCurrentInvoice = () => {
    toast({
      title: "Printing invoice...",
      description: "Opening print dialog",
    });
  };

  const handleDownloadAllInvoices = async () => {
    try {
      const selectedOrderIds = Array.from(selection.selectedIds)
        .map((id) => {
          const order = orders.find((o) => o._id === id);
          return order?.id;
        })
        .filter((id): id is number => id !== undefined);

      toast({
        title: "Downloading invoices...",
        description: "Creating ZIP file",
      });

      await generateMultipleModernInvoicesAndDownloadZip(selectedOrderIds);

      toast({
        title: "Download complete",
        description: "Invoices downloaded as ZIP file",
      });

      handleInvoicePreviewClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message || "Failed to download invoices",
      });
    }
  };

  // Order action handlers
  const handleViewOrder = (order: IOrder) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleEditOrder = (order: IOrder) => {
    // Navigate to modify order page
    setSelectedOrder(order);
    setEditDialogOpen(true);
  };

  const handleModifyOrder = (order: IOrder) => {
    // Navigate to modify order page
    navigate(`/order/modify/${order.id}`);
  };

  const handleDeleteOrder = (order: IOrder) => {
    // Only allow cancellation if order is in processing status
    if (order.status?.toLowerCase() !== "processing") {
      toast({
        variant: "destructive",
        title: "Cannot Cancel Order",
        description: `Only orders in 'Processing' status can be cancelled. This order is currently ${order.status}.`,
      });
      return;
    }
    setSelectedOrder(order);
    setCancelDialogOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      // Call bulk action API to cancel the order
      const response = await orderBulkAction([selectedOrder.id], "cancel");

      if (response.success) {
        toast({
          title: "Order Cancelled",
          description: `Order #${selectedOrder.orderNumber} has been cancelled successfully.`,
        });
        setCancelDialogOpen(false);
        setSelectedOrder(null);
        refreshOrders();
      } else {
        toast({
          variant: "destructive",
          title: "Cancellation Failed",
          description: response.error || "Failed to cancel the order.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  const handleViewFraud = (order: IOrder) => {
    setSelectedOrder(order);
    setFraudDialogOpen(true);
  };

  const handleViewTracking = (order: IOrder) => {
    setSelectedOrder(order);
    setTrackingDialogOpen(true);
  };

  const handleReturnOrder = (order: IOrder) => {
    setSelectedOrder(order);
    setReturnDialogOpen(true);
  };

  const handleCreateOrder = () => {
    navigate("/order/create");
  };

  // Parent Component - Sheet Implementation
  const EditOrderPanel = () => {
    // Add safety check
    if (!selectedOrder) {
      return null;
    }

    return (
      <Sheet
        open={isEditDialogOpen}
        onOpenChange={(val: boolean) => setEditDialogOpen(val)}>
        <SheetContent className='p-0 flex flex-col'>
          <SheetHeader className='px-6 py-4 border-b bg-gradient-to-r from-blue-50/80 to-green-50/80'>
            <SheetTitle className='text-xl font-semibold text-slate-800 flex items-center gap-2'>
              <div className='p-1.5 rounded-lg bg-blue-100'>
                <Edit3 className='h-4 w-4 text-blue-600' />
              </div>
              Edit Order Details
            </SheetTitle>
            <SheetDescription className='text-slate-600 text-sm'>
              Update customer information, shipping details, and payment data.
              <span className='block text-red-500 font-medium mt-1'>
                ⚠️ Changes will be saved immediately
              </span>
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className='w-full'>
            <EditCustomerInformation
              notes={selectedOrder.notes ?? ""}
              customerInfo={selectedOrder.customer}
              shipping={selectedOrder.shipping}
              deliveryCharge={selectedOrder.deliveryCharge ?? 0}
              totalPrice={selectedOrder.totalPrice ?? 0}
              paid={selectedOrder.paid ?? 0}
              remaining={selectedOrder.remaining ?? 0}
              discount={selectedOrder.discount ?? 0}
              handleClose={() => setEditDialogOpen(false)}
              handleCustomerDataChange={(data) => {
                if (selectedOrder?.id) {
                  editOrderData(
                    { ...data, id: selectedOrder.id },
                    (success: boolean) => {
                      if (success) {
                        refreshOrders();
                        setEditDialogOpen(false);
                      }
                    }
                  );
                }
              }}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <div className='flex flex-col h-full bg-gray-50'>
      {/* Header */}
      <motion.div
        variants={fadeIn}
        initial='hidden'
        animate='visible'
        className='bg-white border-b border-gray-200 sticky top-0 z-40'>
        <div className='px-4 sm:px-6 lg:px-8 py-4'>
          {/* Title & Actions */}
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                Orders V2 (Beta 1.7)
              </h1>
              <p className='text-sm text-gray-600 mt-1'>
                {totalOrders} total orders
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={refreshOrders}
                disabled={isRefreshing}
                className='hidden sm:flex'>
                <RefreshCw
                  className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
                />
                Refresh
              </Button>

              <Button
                size='sm'
                className='bg-gradient-to-r from-blue-600 to-purple-600'
                onClick={handleCreateOrder}>
                <Plus className='h-4 w-4 mr-2' />
                <span className='hidden sm:inline'>New Order</span>
                <span className='sm:hidden'>New</span>
              </Button>
            </div>
          </div>

          <div className='flex justify-between items-center gap-4'>
            {/* Status Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className='w-full mr-2'>
              <TabsList className='w-full sm:w-auto grid grid-cols-3 sm:inline-flex gap-1'>
                <TabsTrigger value='all' className='flex items-center gap-2'>
                  All
                  {totalOrders > 0 && (
                    <span className='bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs'>
                      {totalOrders}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value='processing'
                  className='flex items-center gap-2'>
                  Processing
                  {statusCounts?.processing && statusCounts.processing > 0 && (
                    <span className='bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs'>
                      {statusCounts.processing}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value='shipped'
                  className='flex items-center gap-2'>
                  Shipped
                  {statusCounts?.shipped && statusCounts.shipped > 0 && (
                    <span className='bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs'>
                      {statusCounts.shipped}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value='completed'
                  className='flex items-center gap-2'>
                  Completed
                  {statusCounts?.completed && statusCounts.completed > 0 && (
                    <span className='bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs'>
                      {statusCounts.completed}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value='cancel' className='flex items-center gap-2'>
                  Cancelled
                  {statusCounts?.cancel && statusCounts.cancel > 0 && (
                    <span className='bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs'>
                      {statusCounts.cancel}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value='return' className='flex items-center gap-2'>
                  Return Orders
                  {statusCounts?.returnOrderCount &&
                    statusCounts.returnOrderCount > 0 && (
                      <span className='bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs'>
                        {statusCounts.returnOrderCount}
                      </span>
                    )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {/* Search Bar */}
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      </motion.div>

      {/* Order Table */}
      <div className='flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-6'>
        {isLoading && orders.length === 0 ? (
          <div className='flex items-center justify-center h-64'>
            <div className='text-center'>
              <Loader2 className='h-8 w-8 animate-spin text-blue-600 mx-auto mb-4' />
              <p className='text-gray-600'>Loading orders...</p>
            </div>
          </div>
        ) : (
          <motion.div variants={fadeIn} initial='hidden' animate='visible'>
            {/* Desktop Table View */}
            <div className='hidden md:block'>
              <OrderTable
                orders={orders}
                onSelectAll={(isChecked) => {
                  if (isChecked) {
                    selectAll();
                  } else {
                    clearSelection();
                  }
                }}
                selectedIds={selection.selectedIds}
                onSelect={toggleOrderSelection}
                onView={handleViewOrder}
                onEdit={handleEditOrder}
                onModify={handleModifyOrder}
                onDelete={handleDeleteOrder}
                onViewFraud={handleViewFraud}
                onViewTracking={handleViewTracking}
                onReturnOrder={handleReturnOrder}
              />
            </div>

            {/* Mobile Card View */}
            <div className='md:hidden'>
              <MobileOrderList
                orders={orders}
                selectedIds={selection.selectedIds}
                onSelect={toggleOrderSelection}
                onView={handleViewOrder}
                onEdit={handleEditOrder}
                onDelete={handleDeleteOrder}
                onViewFraud={handleViewFraud}
                onViewTracking={handleViewTracking}
                onReturnOrder={handleReturnOrder}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='bg-white border-t border-gray-200 px-4 py-3 sm:px-6'>
          <div className='flex items-center justify-between'>
            <div className='flex-1 flex justify-between sm:hidden'>
              <Button
                variant='outline'
                size='sm'
                onClick={prevPage}
                disabled={currentPage === 1}>
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={nextPage}
                disabled={currentPage === totalPages}>
                Next
              </Button>
            </div>
            <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
              <div className='flex items-center gap-4'>
                <p className='text-sm text-gray-700'>
                  Page <span className='font-medium'>{currentPage}</span> of{" "}
                  <span className='font-medium'>{totalPages}</span>
                </p>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-600'>Show</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => setPageSize(Number(value))}>
                    <SelectTrigger className='w-[70px] h-8'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='20'>20</SelectItem>
                      <SelectItem value='50'>50</SelectItem>
                      <SelectItem value='100'>100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className='text-sm text-gray-600'>per page</span>
                </div>
              </div>
              <div className='flex gap-2 mr-14'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={prevPage}
                  disabled={currentPage === 1}>
                  Previous
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={nextPage}
                  disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selection.selectedIds.size}
        totalCount={orders.length}
        isAllSelected={selection.isAllSelected}
        onClearSelection={clearSelection}
        onSelectAll={selectAll}
        onShipped={handleBulkShipped}
        onComplete={handleBulkComplete}
        onCancel={handleBulkCancel}
        onGenerateInvoices={handleBulkInvoiceDownload}
        onPrintInvoices={printBulkInvoices}
        onViewSelectedOrders={() => setSelectedOrdersViewerOpen(true)}
        progress={bulkActionProgress}
      />

      {/* Courier Selector for Bulk Shipped */}
      <CourierSelector
        open={courierSelectorOpen}
        onOpenChange={setCourierSelectorOpen}
        onConfirm={handleCourierSelected}
        isLoading={false}
        isMobile={false}
      />

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={toggleCommandPalette}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        open={showKeyboardShortcuts}
        onOpenChange={toggleKeyboardShortcutsModal}
      />

      {/* Order Details Sheet */}
      <OrderDetailsSheet
        order={selectedOrder}
        open={orderDetailsOpen}
        onOpenChange={setOrderDetailsOpen}
        onEdit={handleEditOrder}
      />

      <EditOrderPanel />

      {/* Fraud Detection Dialog */}
      <Sheet open={fraudDialogOpen} onOpenChange={setFraudDialogOpen}>
        <SheetContent className='sm:max-w-[600px] '>
          <SheetHeader>
            <SheetTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              Fraud Risk Analysis
            </SheetTitle>
            <SheetDescription>
              Customer: {selectedOrder?.customer?.name || "Unknown"} •{" "}
              {selectedOrder?.customer?.phoneNumber || "N/A"}
            </SheetDescription>
          </SheetHeader>
          <div className='mt-4 '>
            {selectedOrder && selectedOrder.fraudDetection ? (
              <FraudDetectionContent
                fraudDetection={selectedOrder.fraudDetection}
              />
            ) : (
              <div className='flex flex-col items-center justify-center h-64 text-center'>
                <Shield className='h-16 w-16 text-gray-300 mb-4' />
                <p className='text-gray-600 font-medium'>
                  No fraud detection data
                </p>
                <p className='text-sm text-gray-500 mt-2'>
                  This order has not been analyzed for fraud risk yet.
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Tracking Dialog */}
      <Sheet open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <SheetContent className='sm:max-w-[600px]'>
          <SheetHeader>
            <SheetTitle className='flex items-center gap-2'>
              <Package className='h-5 w-5 text-blue-600' />
              Courier Tracking
            </SheetTitle>
            <SheetDescription>
              Order #{selectedOrder?.orderNumber} -{" "}
              {selectedOrder?.courier?.provider || "N/A"}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className='h-[calc(100vh-200px)] mt-4'>
            {selectedOrder?.deliveryTimeline &&
            selectedOrder.deliveryTimeline.length > 0 ? (
              <div className='space-y-4'>
                {[...selectedOrder.deliveryTimeline]
                  .reverse()
                  .map((timeline, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className='flex gap-4'>
                      <div className='flex flex-col items-center'>
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full",
                            index === 0
                              ? "bg-blue-500 ring-4 ring-blue-100"
                              : "bg-gray-300"
                          )}
                        />
                        {index < selectedOrder.deliveryTimeline.length - 1 && (
                          <div className='w-0.5 h-full min-h-[40px] bg-gray-200' />
                        )}
                      </div>
                      <div className='flex-1 pb-6'>
                        <div className='flex items-start justify-between mb-1'>
                          <p
                            className={cn(
                              "font-semibold text-sm",
                              index === 0 ? "text-blue-600" : "text-gray-900"
                            )}>
                            {timeline.status}
                          </p>
                          <span className='text-xs text-gray-500'>
                            {new Date(timeline.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {timeline.location && (
                          <p className='text-xs text-gray-600 mb-1'>
                            📍 {timeline.location}
                          </p>
                        )}
                        {timeline.remarks && (
                          <p className='text-xs text-gray-500 italic'>
                            {timeline.remarks}
                          </p>
                        )}
                        <p className='text-xs text-gray-400 mt-1'>
                          Updated by: {timeline.updatedBy}
                        </p>
                      </div>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-64 text-center'>
                <Package className='h-16 w-16 text-gray-300 mb-4' />
                <p className='text-gray-600 font-medium'>
                  No tracking information available
                </p>
                <p className='text-sm text-gray-500 mt-2'>
                  Tracking details will appear here once the order is shipped.
                </p>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Cancel Order Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <XCircle className='h-5 w-5 text-red-600' />
              Cancel Order?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order #
              {selectedOrder?.orderNumber}?
              <br />
              <span className='text-red-600 font-medium mt-2 block'>
                This action cannot be undone. The order status will be changed
                to "Cancelled".
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelOrder}
              className='bg-red-600 hover:bg-red-700'>
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog
        open={bulkConfirmDialogOpen}
        onOpenChange={setBulkConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              {pendingBulkActionType === "complete" && (
                <CheckCircle className='h-5 w-5 text-green-600' />
              )}
              {pendingBulkActionType === "cancel" && (
                <XCircle className='h-5 w-5 text-red-600' />
              )}
              {pendingBulkActionType === "invoice" && (
                <Download className='h-5 w-5 text-blue-600' />
              )}
              Confirm Bulk Action
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingBulkActionType === "complete" && (
                <>
                  Are you sure you want to mark{" "}
                  <span className='font-bold'>
                    {selection.selectedIds.size} orders
                  </span>{" "}
                  as completed?
                  <br />
                  <span className='text-green-600 font-medium mt-2 block'>
                    This will update all selected orders to "Completed" status.
                  </span>
                </>
              )}
              {pendingBulkActionType === "cancel" && (
                <>
                  Are you sure you want to cancel{" "}
                  <span className='font-bold'>
                    {selection.selectedIds.size} orders
                  </span>
                  ?
                  <br />
                  <span className='text-red-600 font-medium mt-2 block'>
                    ⚠️ This action cannot be undone. All selected orders will be
                    cancelled.
                  </span>
                </>
              )}
              {pendingBulkActionType === "invoice" && (
                <>
                  Generate invoices for{" "}
                  <span className='font-bold'>
                    {selection.selectedIds.size} selected orders
                  </span>
                  ?
                  <br />
                  <span className='text-blue-600 font-medium mt-2 block'>
                    📦 A ZIP file containing all invoices will be downloaded.
                  </span>
                </>
              )}
              <div className='mt-4 flex justify-between items-center'>
                <span className='text-sm text-gray-500'>
                  {selection.selectedIds.size} order
                  {selection.selectedIds.size !== 1 ? "s" : ""} selected
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setSelectedOrdersViewerOpen(true)}
                  className='text-xs'>
                  View Selected Orders
                </Button>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkAction}
              disabled={isGeneratingInvoices}
              className={cn(
                pendingBulkActionType === "complete" &&
                  "bg-green-600 hover:bg-green-700",
                pendingBulkActionType === "cancel" &&
                  "bg-red-600 hover:bg-red-700",
                pendingBulkActionType === "invoice" &&
                  "bg-blue-600 hover:bg-blue-700"
              )}>
              {isGeneratingInvoices && pendingBulkActionType === "invoice" && (
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              )}
              {pendingBulkActionType === "complete" && "Yes, Mark as Completed"}
              {pendingBulkActionType === "cancel" && "Yes, Cancel Orders"}
              {pendingBulkActionType === "invoice" && "Generate Invoices"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Selected Orders Viewer Dialog */}
      <Sheet
        open={selectedOrdersViewerOpen}
        onOpenChange={setSelectedOrdersViewerOpen}>
        <SheetContent className='sm:max-w-[500px]'>
          <SheetHeader>
            <SheetTitle className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-blue-600' />
              Selected Orders ({selection.selectedIds.size})
            </SheetTitle>
            <SheetDescription>
              Review the list of selected orders before performing bulk actions
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className='h-[calc(100vh-200px)] mt-4'>
            <div className='space-y-2'>
              {Array.from(selection.selectedIds).map((orderId) => {
                const order = orders.find((o) => o._id === orderId);
                if (!order) return null;

                return (
                  <motion.div
                    key={orderId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:shadow-md transition-all'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='font-semibold text-sm text-gray-900'>
                          #{order.orderNumber}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className='text-xs text-gray-600'>
                        {order.customer?.name} •{" "}
                        {formatCurrency(order.totalPrice)}
                      </p>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        toggleOrderSelection(orderId);
                        if (selection.selectedIds.size === 1) {
                          setSelectedOrdersViewerOpen(false);
                        }
                      }}
                      className='text-red-600 hover:text-red-700 hover:bg-red-50'>
                      <XCircle className='h-4 w-4' />
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
          <div className='mt-4 pt-4 border-t flex gap-2'>
            <Button
              variant='outline'
              className='flex-1'
              onClick={() => {
                clearSelection();
                setSelectedOrdersViewerOpen(false);
              }}>
              Clear All
            </Button>
            <Button
              className='flex-1'
              onClick={() => setSelectedOrdersViewerOpen(false)}>
              Done
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Return Order Sheet */}
      <ReturnOrderSheet
        order={selectedOrder}
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        onSuccess={() => {
          refreshOrders();
        }}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onComplete={handleOnboardingComplete}
      />

      {/* Floating Help Button */}
      <FloatingHelpButton
        onShowKeyboardShortcuts={toggleKeyboardShortcutsModal}
        onShowOnboarding={() => setShowOnboarding(true)}
      />

      {/* Invoice Preview Modal */}
      <InvoicePreviewModal
        open={invoicePreviewOpen}
        onOpenChange={handleInvoicePreviewClose}
        pdfUrls={invoicePreviewData}
        onPrintAll={handlePrintAllInvoices}
        onPrintCurrent={handlePrintCurrentInvoice}
        onDownloadAll={handleDownloadAllInvoices}
      />
    </div>
  );
};
