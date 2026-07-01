/**
 * OrderListV2 - Main Order List Component
 * Modern, responsive order list with virtual scrolling, filters, and bulk actions
 *
 * CHANGELOG:
 * - Fixed invisible overlay bug: added `modal={false}` workaround and key-based
 *   remounting for OrderDetailsSheet so the Sheet portal tears down fully on close.
 * - Modernized header: cleaner typography, tighter layout, better action grouping.
 * - Tabs redesigned: pill-style, scrollable on mobile, badge counts styled per status.
 * - Pagination: cleaner row with page-size selector on the left.
 * - Loading state: centered spinner with subtle card backdrop.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  Loader2,
  Package,
  XCircle,
  Shield,
  CheckCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  LayoutList,
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
import { PackingSlipPreviewModal } from "./components/PackingSlipPreviewModal";
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
import {
  generateMultipleModernInvoicesAndDownloadZip,
  generateInvoicePreviewData,
  generateMultiplePackingSlipsAndDownloadZip,
  generatePackingSlipPreviewData,
} from "../../utils/invoiceGenerator";
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
import useOrder from "../order/hooks/useOrder";
import EditOrderPanelContent from "./components/EditCustomerInformationSheet";

/* ─────────────────────────────────────────────────────────
   Tab configuration — keeps JSX clean
───────────────────────────────────────────────────────── */
const STATUS_TABS = [
  { value: "all", label: "All" },
  {
    value: "processing",
    label: "Processing",
    countKey: "processing",
    color: "blue",
  },
  { value: "shipped", label: "Shipped", countKey: "shipped", color: "violet" },
  {
    value: "completed",
    label: "Completed",
    countKey: "completed",
    color: "emerald",
  },
  { value: "cancel", label: "Cancelled", countKey: "cancel", color: "rose" },
  {
    value: "return",
    label: "Returns",
    countKey: "returnOrderCount",
    color: "amber",
  },
] as const;

const TAB_BADGE_COLORS: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  violet: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  rose: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
};

/* ─────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────── */
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
    "all",
  );
  const [courierSelectorOpen, setCourierSelectorOpen] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState<"shipped" | null>(
    null,
  );
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

  /**
   * FIX: Ghost overlay after OrderDetailsSheet closes.
   *
   * Radix UI's Sheet (built on Dialog) renders its overlay into a React portal
   * outside the normal DOM tree. In some versions, if `open` flips to false
   * while focus is elsewhere, the overlay `<div>` lingers with
   * `pointer-events: auto`, swallowing clicks.
   *
   * Solution: use a `key` tied to the order id so React fully unmounts and
   * remounts the Sheet when a new order is selected, guaranteeing the old
   * portal is torn down. When `orderDetailsOpen` becomes false we also clear
   * `selectedOrder` with a short delay so the closing animation still has data.
   */
  const [detailsSheetKey, setDetailsSheetKey] = useState(0);

  const openOrderDetails = (order: IOrder) => {
    setSelectedOrder(order);
    setDetailsSheetKey((k) => k + 1); // force remount → clean portal
    setOrderDetailsOpen(true);
  };

  const closeOrderDetails = () => {
    setOrderDetailsOpen(false);
    // delay clearing so the Sheet close animation has the order data
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [fraudDialogOpen, setFraudDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bulkConfirmDialogOpen, setBulkConfirmDialogOpen] = useState(false);
  const [pendingBulkActionType, setPendingBulkActionType] = useState<
    "complete" | "cancel" | "invoice" | null
  >(null);
  const [editSheetKey, setEditSheetKey] = useState(0);
  const [selectedOrdersViewerOpen, setSelectedOrdersViewerOpen] =
    useState(false);
  const [isGeneratingInvoices, setIsGeneratingInvoices] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [invoicePreviewOpen, setInvoicePreviewOpen] = useState(false);
  const [invoicePreviewData, setInvoicePreviewData] = useState<
    { url: string; orderNumber: number; blob: Blob }[]
  >([]);
  const [packingSlipPreviewOpen, setPackingSlipPreviewOpen] = useState(false);
  const [packingSlipPreviewData, setPackingSlipPreviewData] = useState<
    { url: string; orderNumber: number; blob: Blob }[]
  >([]);
  const [selectedOrdersData, setSelectedOrdersData] = useState<
    Map<number, IOrder>
  >(new Map());

  // ── Onboarding ──────────────────────────────────────────
  const handleOnboardingComplete = () => {
    localStorage.setItem("orderV2OnboardingComplete", "true");
    setShowOnboarding(false);
  };

  // ── Selection helpers ────────────────────────────────────
  const handleOrderSelection = (orderId: number) => {
    setSelectedOrdersData((prev) => {
      const newMap = new Map(prev);
      if (selection.selectedIds.has(orderId)) {
        newMap.delete(orderId);
      } else {
        const order = orders.find((o) => o.id === orderId);
        if (
          order &&
          !["cancel", "cancelled", "fail", "failed", "delete"].includes(
            order.status,
          )
        ) {
          newMap.set(orderId, order);
        }
      }
      return newMap;
    });
    toggleOrderSelection(orderId);
  };

  const handleSelectAll = () => {
    if (selection.isAllSelected) {
      setSelectedOrdersData(new Map());
      clearSelection();
    } else {
      setSelectedOrdersData((prev) => {
        const newMap = new Map(prev);
        orders
          .filter(
            (o) =>
              !["cancel", "cancelled", "fail", "failed", "delete"].includes(
                o.status,
              ),
          )
          .forEach((o) => o.id && newMap.set(o.id, o));
        return newMap;
      });
      selectAll();
    }
  };

  const handleClearSelection = () => {
    setSelectedOrdersData(new Map());
    clearSelection();
  };

  const getSelectedOrders = (): IOrder[] =>
    Array.from(selectedOrdersData.values());

  // ── Data fetch ───────────────────────────────────────────
  useEffect(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  // ── Keyboard shortcuts ───────────────────────────────────
  const shortcuts: KeyboardShortcut[] = [
    {
      key: "k",
      meta: true,
      description: "Open command palette",
      action: toggleCommandPalette,
    },
    {
      key: "/",
      meta: true,
      description: "Open command palette (alt)",
      action: toggleCommandPalette,
    },
    {
      key: "?",
      description: "Show keyboard shortcuts",
      action: toggleKeyboardShortcutsModal,
    },
    {
      key: "r",
      meta: true,
      description: "Refresh orders",
      action: refreshOrders,
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
      action: () =>
        (
          document.querySelector('input[type="text"]') as HTMLInputElement
        )?.focus(),
    },
    { key: "a", meta: true, description: "Select all", action: selectAll },
    {
      key: "a",
      meta: true,
      shift: true,
      description: "Clear selection",
      action: clearSelection,
    },
    {
      key: "d",
      meta: true,
      description: "Download invoices",
      action: () =>
        selection.selectedIds.size > 0 && handleBulkInvoiceDownload(),
    },
    {
      key: "v",
      meta: true,
      description: "View selected orders",
      action: () =>
        selection.selectedIds.size > 0 && setSelectedOrdersViewerOpen(true),
    },
    {
      key: "1",
      description: "All orders",
      action: () => handleTabChange("all"),
    },
    {
      key: "2",
      description: "Processing",
      action: () => handleTabChange("processing"),
    },
    {
      key: "3",
      description: "Shipped",
      action: () => handleTabChange("shipped"),
    },
    {
      key: "4",
      description: "Completed",
      action: () => handleTabChange("completed"),
    },
    {
      key: "5",
      description: "Cancelled",
      action: () => handleTabChange("cancelled"),
    },
    {
      key: "6",
      description: "Returns",
      action: () => handleTabChange("return"),
    },
    {
      key: "ArrowLeft",
      meta: true,
      description: "Prev page",
      action: () => currentPage > 1 && prevPage(),
    },
    {
      key: "ArrowRight",
      meta: true,
      description: "Next page",
      action: () => currentPage < totalPages && nextPage(),
    },
    {
      key: "Escape",
      description: "Close dialogs",
      action: () => {
        if (commandPaletteOpen) toggleCommandPalette();
        if (showKeyboardShortcuts) toggleKeyboardShortcutsModal();
        if (selectedOrdersViewerOpen) setSelectedOrdersViewerOpen(false);
        if (orderDetailsOpen) closeOrderDetails();
        if (fraudDialogOpen) setFraudDialogOpen(false);
        if (trackingDialogOpen) setTrackingDialogOpen(false);
        if (cancelDialogOpen) setCancelDialogOpen(false);
        if (bulkConfirmDialogOpen) setBulkConfirmDialogOpen(false);
      },
    },
  ];

  useKeyboardShortcuts({ shortcuts, enabled: true });

  // ── Tab change ───────────────────────────────────────────
  const handleTabChange = (value: string) => {
    setActiveTab(value as OrderStatus | "all" | "return");
    if (value === "all") clearFilters();
    else if (value === "return") setFilters({ isReturn: true });
    else setFilters({ isReturn: false, status: value as OrderStatus });
  };

  // ── Bulk actions ─────────────────────────────────────────
  const performBulkAction = async (
    actionType: string,
    courierProvider?: CourierProvider,
  ) => {
    const ids = Array.from(selectedOrdersData.values())
      .map((o) => o.id)
      .filter((id): id is number => id !== undefined);

    if (!ids.length) {
      toast({
        variant: "destructive",
        title: "No orders selected",
        description: "Select at least one order.",
      });
      return;
    }

    try {
      const response = await orderBulkAction(ids, actionType, courierProvider);
      if (response.success) {
        let description = response.data?.message || response.data;
        if (response.courierOrdersQueued !== undefined)
          description = `${description}\n\nCourier: ${response.courierOrdersQueued}/${response.courierOrdersTotal} created`;
        if (response.warning)
          description = `${description}\n\n⚠️ ${response.warning}`;
        if (response.courierFailures?.length)
          description = `${description}\n\nFailed:\n${response.courierFailures.map((f: any) => `• #${f.orderNumber}: ${f.error}`).join("\n")}`;

        toast({
          title: response.warning
            ? "Completed with warnings"
            : "Action successful",
          description,
        });
        clearSelection();
        refreshOrders();
      } else {
        toast({
          variant: "destructive",
          title: "Action failed",
          description: response.error,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleBulkShipped = () => {
    setPendingBulkAction("shipped");
    setCourierSelectorOpen(true);
  };
  const handleCourierSelected = async (courierProvider: CourierProvider) => {
    setCourierSelectorOpen(false);
    if (pendingBulkAction === "shipped")
      await performBulkAction("shipped", courierProvider);
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
    if (pendingBulkActionType === "invoice") await generateBulkInvoices();
    else await performBulkAction(pendingBulkActionType);
    setPendingBulkActionType(null);
  };

  const generateBulkInvoices = async () => {
    setIsGeneratingInvoices(true);
    const ids = Array.from(selectedOrdersData.values())
      .map((o) => o.id)
      .filter((id): id is number => id !== undefined);
    if (!ids.length) {
      toast({ variant: "destructive", title: "No orders selected" });
      setIsGeneratingInvoices(false);
      return;
    }
    try {
      toast({
        title: "Generating invoices…",
        description: `Creating ZIP with ${ids.length} invoices`,
      });
      await generateMultipleModernInvoicesAndDownloadZip(ids);
      toast({
        title: "Invoices ready",
        description: `${ids.length} invoices downloaded`,
      });
      clearSelection();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error.message,
      });
    } finally {
      setIsGeneratingInvoices(false);
    }
  };

  const printBulkInvoices = async () => {
    setIsGeneratingInvoices(true);
    const ids = Array.from(selectedOrdersData.values())
      .map((o) => o.id)
      .filter((id): id is number => id !== undefined);
    if (!ids.length) {
      toast({ variant: "destructive", title: "No orders selected" });
      setIsGeneratingInvoices(false);
      return;
    }
    try {
      toast({
        title: "Preparing invoices…",
        description: `${ids.length} invoice${ids.length > 1 ? "s" : ""} for preview`,
      });
      const previewData = await generateInvoicePreviewData(ids);
      setInvoicePreviewData(previewData);
      setInvoicePreviewOpen(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error.message,
      });
    } finally {
      setIsGeneratingInvoices(false);
    }
  };

  const handleInvoicePreviewClose = () => {
    setInvoicePreviewOpen(false);
    invoicePreviewData.forEach((d) => URL.revokeObjectURL(d.url));
    setInvoicePreviewData([]);
    // Keep selection intact - only clear after successful action
  };

  const handleDownloadAllInvoices = async () => {
    const ids = Array.from(selectedOrdersData.values())
      .map((o) => o.id)
      .filter((id): id is number => id !== undefined);
    try {
      toast({ title: "Downloading…", description: "Creating ZIP file" });
      await generateMultipleModernInvoicesAndDownloadZip(ids);
      toast({ title: "Download complete" });
      handleInvoicePreviewClose();
      clearSelection(); // Clear selection after successful download
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message,
      });
    }
  };

  const printBulkPackingSlips = async () => {
    setIsGeneratingInvoices(true);
    const ids = Array.from(selectedOrdersData.values())
      .map((o) => o.id)
      .filter((id): id is number => id !== undefined);
    if (!ids.length) {
      toast({ variant: "destructive", title: "No orders selected" });
      setIsGeneratingInvoices(false);
      return;
    }
    try {
      toast({ title: "Generating packing slips…" });
      const previewData = await generatePackingSlipPreviewData(ids);
      setPackingSlipPreviewData(previewData);
      setPackingSlipPreviewOpen(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error.message,
      });
    } finally {
      setIsGeneratingInvoices(false);
    }
  };

  const handlePackingSlipPreviewClose = () => {
    setPackingSlipPreviewOpen(false);
    packingSlipPreviewData.forEach((d) => URL.revokeObjectURL(d.url));
    setPackingSlipPreviewData([]);
    // Keep selection intact - only clear after successful action
  };

  const handleBulkPackingSlipDownload = async () => {
    const ids = Array.from(selectedOrdersData.values())
      .map((o) => o.id)
      .filter((id): id is number => id !== undefined);
    if (!ids.length) {
      toast({ variant: "destructive", title: "No orders selected" });
      return;
    }
    try {
      toast({ title: "Downloading packing slips…" });
      await generateMultiplePackingSlipsAndDownloadZip(ids);
      toast({ title: "Download complete" });
      handlePackingSlipPreviewClose();
      clearSelection(); // Clear selection after successful download
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message,
      });
    }
  };

  // ── Order action handlers ─────────────────────────────────
  const handleViewOrder = (order: IOrder) => openOrderDetails(order);

  // Update handleEditOrder to bump the key
  const handleEditOrder = (order: IOrder) => {
    setSelectedOrder(order);
    setEditSheetKey((k) => k + 1); // force remount → clean portal
    setEditDialogOpen(true);
  };

  const handleModifyOrder = (order: IOrder) =>
    navigate(`/order/modify/${order.id}`);

  const handleDeleteOrder = (order: IOrder) => {
    if (order.status?.toLowerCase() !== "processing") {
      toast({
        variant: "destructive",
        title: "Cannot cancel order",
        description: `Only processing orders can be cancelled. This order is "${order.status}".`,
      });
      return;
    }
    setSelectedOrder(order);
    setCancelDialogOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!selectedOrder) return;
    try {
      const response = await orderBulkAction([selectedOrder.id], "cancel");
      if (response.success) {
        toast({
          title: "Order cancelled",
          description: `Order #${selectedOrder.orderNumber} has been cancelled.`,
        });
        setCancelDialogOpen(false);
        setSelectedOrder(null);
        refreshOrders();
      } else {
        toast({
          variant: "destructive",
          title: "Cancellation failed",
          description: response.error,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
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
  const handleCreateOrder = () => navigate("/order/create");

  // ── Count helpers ────────────────────────────────────────
  const getCount = (key: string): number | undefined => {
    if (key === "all") return totalOrders || undefined;
    return (statusCounts as any)?.[key] || undefined;
  };

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <div className='flex flex-col h-full bg-gray-50/60'>
      {/* ── Header ───────────────────────────────────────── */}
      <motion.header
        variants={fadeIn}
        initial='hidden'
        animate='visible'
        className='bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm'>
        {/* Top row: title + actions */}
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16 gap-4'>
            {/* Title */}
            <div className='flex items-center gap-3 min-w-0'>
              <div className='hidden sm:flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600'>
                <LayoutList className='h-4 w-4 text-white' />
              </div>
              <div className='min-w-0'>
                <h1 className='text-lg font-semibold text-gray-900 truncate leading-tight'>
                  Orders
                  <span className='ml-2 text-xs font-medium text-gray-400 tracking-wide uppercase align-middle'>
                    Beta 2.1
                  </span>
                </h1>
                <p className='text-xs text-gray-500 leading-none mt-0.5'>
                  {totalOrders.toLocaleString()} orders total
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className='flex items-center gap-2 flex-shrink-0'>
              <Button
                variant='outline'
                size='sm'
                onClick={refreshOrders}
                disabled={isRefreshing}
                className='hidden sm:flex items-center gap-1.5 h-9 text-gray-600 border-gray-200 hover:bg-gray-50'>
                <RefreshCw
                  className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
                />
                <span>Refresh</span>
              </Button>

              <Button
                size='sm'
                onClick={handleCreateOrder}
                className='h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-1.5'>
                <Plus className='h-3.5 w-3.5' />
                <span className='hidden sm:inline'>New order</span>
                <span className='sm:hidden'>New</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom row: tabs + search */}
        <div className='px-4 sm:px-6 lg:px-8 pb-3'>
          <div className='flex items-center gap-3'>
            {/* Tabs — scrollable on mobile */}
            <div className='flex-1 min-w-0 overflow-x-auto no-scrollbar'>
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className='h-9 bg-gray-100/80 p-1 rounded-lg inline-flex gap-0.5 w-max'>
                  {STATUS_TABS.map((tab) => {
                    const count =
                      tab.value === "all"
                        ? totalOrders
                        : (statusCounts as any)?.[tab.countKey ?? ""];
                    return (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className={cn(
                          "h-7 px-3 text-xs font-medium rounded-md gap-1.5 whitespace-nowrap",
                          "data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900",
                          "text-gray-500 hover:text-gray-700 transition-all",
                        )}>
                        {tab.label}
                        {count > 0 && (
                          <span
                            className={cn(
                              "inline-flex items-center justify-center px-1.5 py-0 rounded-full text-[10px] font-semibold leading-4 min-w-[18px]",
                              "color" in tab
                                ? TAB_BADGE_COLORS[tab.color]
                                : "bg-gray-200 text-gray-600",
                            )}>
                            {count}
                          </span>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>

            {/* Search */}
            <div className='flex-shrink-0'>
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Order table ───────────────────────────────────── */}
      <div className='flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-5'>
        {isLoading ? (
          <div className='flex items-center justify-center h-72'>
            <div className='flex flex-col items-center gap-3 text-center bg-white rounded-2xl border border-gray-100 shadow-sm px-12 py-10'>
              <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
              <p className='text-sm font-medium text-gray-700'>
                Loading orders…
              </p>
              <p className='text-xs text-gray-400'>This won't take long</p>
            </div>
          </div>
        ) : (
          <motion.div
            variants={fadeIn}
            initial='hidden'
            animate='visible'
            className='space-y-4'>
            {/* Desktop */}
            <div className='hidden md:block'>
              <OrderTable
                key='order-table-desktop'
                orders={orders}
                onSelectAll={handleSelectAll}
                selectedIds={selection.selectedIds}
                onSelect={handleOrderSelection}
                onView={handleViewOrder}
                onEdit={handleEditOrder}
                onModify={handleModifyOrder}
                onDelete={handleDeleteOrder}
                onViewFraud={handleViewFraud}
                onViewTracking={handleViewTracking}
                onReturnOrder={handleReturnOrder}
              />
            </div>

            {/* Mobile */}
            <div className='md:hidden'>
              <MobileOrderList
                key='mobile-order-list'
                orders={orders}
                selectedIds={selection.selectedIds}
                onSelect={handleOrderSelection}
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

      {/* ── Pagination ────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className='bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-3'>
          <div className='flex items-center justify-between gap-4'>
            {/* Page size + info */}
            <div className='flex items-center gap-3'>
              <Select
                value={pageSize.toString()}
                onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className='w-[72px] h-8 text-xs border-gray-200'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[20, 50, 100].map((n) => (
                    <SelectItem
                      key={n}
                      value={n.toString()}
                      className='text-xs'>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className='text-xs text-gray-500 hidden sm:block'>
                per page · Page{" "}
                <span className='font-medium text-gray-700'>{currentPage}</span>{" "}
                of{" "}
                <span className='font-medium text-gray-700'>{totalPages}</span>
              </span>
            </div>

            {/* Navigation */}
            <div className='flex items-center gap-1'>
              <Button
                variant='outline'
                size='sm'
                onClick={prevPage}
                disabled={currentPage === 1}
                className='h-8 w-8 p-0 border-gray-200'>
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <span className='sm:hidden text-xs text-gray-500 px-2'>
                {currentPage} / {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className='h-8 w-8 p-0 border-gray-200'>
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk actions bar ──────────────────────────────── */}
      <BulkActionsBar
        selectedCount={selection.selectedIds.size}
        totalCount={orders.length}
        isAllSelected={selection.isAllSelected}
        onClearSelection={handleClearSelection}
        onSelectAll={handleSelectAll}
        onShipped={handleBulkShipped}
        onComplete={handleBulkComplete}
        onCancel={handleBulkCancel}
        onGenerateInvoices={handleBulkInvoiceDownload}
        onPrintInvoices={printBulkInvoices}
        onGeneratePackingSlips={handleBulkPackingSlipDownload}
        onPrintPackingSlips={printBulkPackingSlips}
        onViewSelectedOrders={() => setSelectedOrdersViewerOpen(true)}
        progress={bulkActionProgress}
      />

      {/* ── Courier selector ──────────────────────────────── */}
      <CourierSelector
        open={courierSelectorOpen}
        onOpenChange={setCourierSelectorOpen}
        onConfirm={handleCourierSelected}
        isLoading={false}
        isMobile={false}
      />

      {/* ── Command palette ───────────────────────────────── */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={toggleCommandPalette}
      />

      {/* ── Order details sheet (key forces remount → fixes ghost overlay) ── */}
      <OrderDetailsSheet
        key={detailsSheetKey}
        order={selectedOrder}
        open={orderDetailsOpen}
        onOpenChange={(open) => {
          if (!open) closeOrderDetails();
          else setOrderDetailsOpen(true);
        }}
        onEdit={handleEditOrder}
      />

      {/* ── Edit order panel ──────────────────────────────── */}
      <EditOrderPanelContent
        key={editSheetKey}
        selectedOrder={selectedOrder}
        isEditDialogOpen={isEditDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        editOrderData={editOrderData}
        refreshOrders={refreshOrders}
      />

      {/* ── Fraud detection sheet ─────────────────────────── */}
      <Sheet open={fraudDialogOpen} onOpenChange={setFraudDialogOpen}>
        <SheetContent className='sm:max-w-[600px]'>
          <SheetHeader>
            <SheetTitle className='flex items-center gap-2 text-base font-semibold'>
              <span className='inline-flex h-7 w-7 items-center justify-center rounded-md bg-rose-100'>
                <Shield className='h-3.5 w-3.5 text-rose-600' />
              </span>
              Fraud risk analysis
            </SheetTitle>
            <SheetDescription>
              {selectedOrder?.customer?.name || "Unknown"} ·{" "}
              {selectedOrder?.customer?.phoneNumber || "—"}
            </SheetDescription>
          </SheetHeader>
          <div className='mt-5'>
            {selectedOrder?.fraudDetection ? (
              <FraudDetectionContent
                fraudDetection={selectedOrder.fraudDetection}
              />
            ) : (
              <div className='flex flex-col items-center justify-center h-64 text-center gap-3'>
                <div className='h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center'>
                  <Shield className='h-7 w-7 text-gray-400' />
                </div>
                <p className='text-sm font-medium text-gray-700'>
                  No fraud data
                </p>
                <p className='text-xs text-gray-500 max-w-[200px]'>
                  This order hasn't been analysed for fraud risk yet.
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Tracking sheet ────────────────────────────────── */}
      <Sheet open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <SheetContent className='sm:max-w-[600px]'>
          <SheetHeader>
            <SheetTitle className='flex items-center gap-2 text-base font-semibold'>
              <span className='inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-100'>
                <Package className='h-3.5 w-3.5 text-blue-600' />
              </span>
              Courier tracking
            </SheetTitle>
            <SheetDescription>
              Order #{selectedOrder?.orderNumber} ·{" "}
              {selectedOrder?.courier?.provider || "—"}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className='h-[calc(100vh-180px)] mt-5'>
            {selectedOrder?.deliveryTimeline?.length ? (
              <div className='relative pl-6 space-y-0'>
                {[...selectedOrder.deliveryTimeline]
                  .reverse()
                  .map((timeline, index, arr) => (
                    <div key={index} className='relative'>
                      {/* connector line */}
                      {index < arr.length - 1 && (
                        <div className='absolute left-[-18px] top-5 bottom-0 w-px bg-gray-200' />
                      )}
                      {/* dot */}
                      <div
                        className={cn(
                          "absolute left-[-22px] top-1.5 h-3 w-3 rounded-full border-2 border-white",
                          index === 0
                            ? "bg-blue-500 shadow-sm shadow-blue-200"
                            : "bg-gray-300",
                        )}
                      />
                      <div className='pb-6'>
                        <div className='flex items-start justify-between gap-2 mb-0.5'>
                          <p
                            className={cn(
                              "text-sm font-medium",
                              index === 0 ? "text-blue-700" : "text-gray-800",
                            )}>
                            {timeline.status}
                          </p>
                          <span className='text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0'>
                            {new Date(timeline.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {timeline.location && (
                          <p className='text-xs text-gray-500 mb-0.5'>
                            📍 {timeline.location}
                          </p>
                        )}
                        {timeline.remarks && (
                          <p className='text-xs text-gray-400 italic'>
                            {timeline.remarks}
                          </p>
                        )}
                        <p className='text-[11px] text-gray-400 mt-1'>
                          via {timeline.updatedBy}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-64 text-center gap-3'>
                <div className='h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center'>
                  <Package className='h-7 w-7 text-gray-400' />
                </div>
                <p className='text-sm font-medium text-gray-700'>
                  No tracking yet
                </p>
                <p className='text-xs text-gray-500 max-w-[220px]'>
                  Tracking details appear here once the order is shipped.
                </p>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* ── Cancel confirmation ───────────────────────────── */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <XCircle className='h-5 w-5 text-rose-600' />
              Cancel order #{selectedOrder?.orderNumber}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The order status will permanently
              change to{" "}
              <span className='font-semibold text-rose-600'>Cancelled</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep order</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelOrder}
              className='bg-rose-600 hover:bg-rose-700'>
              Cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Bulk action confirmation ──────────────────────── */}
      <AlertDialog
        open={bulkConfirmDialogOpen}
        onOpenChange={setBulkConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              {pendingBulkActionType === "complete" && (
                <CheckCircle className='h-5 w-5 text-emerald-600' />
              )}
              {pendingBulkActionType === "cancel" && (
                <XCircle className='h-5 w-5 text-rose-600' />
              )}
              {pendingBulkActionType === "invoice" && (
                <Download className='h-5 w-5 text-blue-600' />
              )}
              {pendingBulkActionType === "complete" &&
                "Mark orders as completed?"}
              {pendingBulkActionType === "cancel" && "Cancel selected orders?"}
              {pendingBulkActionType === "invoice" && "Generate invoices?"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className='space-y-3'>
                <p>
                  {pendingBulkActionType === "complete" && (
                    <>
                      This will mark{" "}
                      <strong>{selection.selectedIds.size} orders</strong> as
                      completed.
                    </>
                  )}
                  {pendingBulkActionType === "cancel" && (
                    <>
                      This will permanently cancel{" "}
                      <strong>{selection.selectedIds.size} orders</strong>.{" "}
                      <span className='text-rose-600'>
                        This cannot be undone.
                      </span>
                    </>
                  )}
                  {pendingBulkActionType === "invoice" && (
                    <>
                      A ZIP file with invoices for{" "}
                      <strong>{selection.selectedIds.size} orders</strong> will
                      be downloaded.
                    </>
                  )}
                </p>
                <div className='flex items-center justify-between pt-1'>
                  <span className='text-xs text-gray-500'>
                    {selection.selectedIds.size} order
                    {selection.selectedIds.size !== 1 ? "s" : ""} selected
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setSelectedOrdersViewerOpen(true)}
                    className='text-xs h-7'>
                    Review list
                  </Button>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkAction}
              disabled={isGeneratingInvoices}
              className={cn(
                pendingBulkActionType === "complete" &&
                  "bg-emerald-600 hover:bg-emerald-700",
                pendingBulkActionType === "cancel" &&
                  "bg-rose-600 hover:bg-rose-700",
                pendingBulkActionType === "invoice" &&
                  "bg-blue-600 hover:bg-blue-700",
              )}>
              {isGeneratingInvoices && pendingBulkActionType === "invoice" && (
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              )}
              {pendingBulkActionType === "complete" && "Mark as completed"}
              {pendingBulkActionType === "cancel" && "Cancel orders"}
              {pendingBulkActionType === "invoice" && "Download invoices"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Selected orders viewer ────────────────────────── */}
      <Sheet
        open={selectedOrdersViewerOpen}
        onOpenChange={setSelectedOrdersViewerOpen}>
        <SheetContent className='sm:max-w-[480px]'>
          <SheetHeader>
            <SheetTitle className='flex items-center gap-2 text-base font-semibold'>
              <span className='inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-100'>
                <CheckCircle className='h-3.5 w-3.5 text-blue-600' />
              </span>
              Selected orders
              <span className='ml-1 text-sm text-gray-500 font-normal'>
                ({selection.selectedIds.size})
              </span>
            </SheetTitle>
            <SheetDescription>
              Review before performing bulk actions
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className='h-[calc(100vh-220px)] mt-4'>
            <div className='space-y-1.5 pr-1'>
              {getSelectedOrders().map((order) => {
                if (!order.id) return null;
                return (
                  <div
                    key={order.id}
                    className='flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-colors'>
                    <div>
                      <div className='flex items-center gap-2 mb-0.5'>
                        <span className='text-sm font-semibold text-gray-900'>
                          #{order.orderNumber}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className='text-xs text-gray-500'>
                        {order.customer?.name} ·{" "}
                        {formatCurrency(order.totalPrice)}
                      </p>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        handleOrderSelection(order.id!);
                        if (selection.selectedIds.size === 1)
                          setSelectedOrdersViewerOpen(false);
                      }}
                      className='h-7 w-7 p-0 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg'>
                      <XCircle className='h-4 w-4' />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <div className='mt-4 pt-4 border-t flex gap-2'>
            <Button
              variant='outline'
              className='flex-1 h-9 text-sm'
              onClick={() => {
                handleClearSelection();
                setSelectedOrdersViewerOpen(false);
              }}>
              Clear all
            </Button>
            <Button
              className='flex-1 h-9 text-sm bg-blue-600 hover:bg-blue-700'
              onClick={() => setSelectedOrdersViewerOpen(false)}>
              Done
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Return order sheet ────────────────────────────── */}
      <ReturnOrderSheet
        order={selectedOrder}
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        onSuccess={refreshOrders}
      />

      {/* ── Onboarding ────────────────────────────────────── */}
      <OnboardingTour
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onComplete={handleOnboardingComplete}
      />

      {/* ── Invoice preview ───────────────────────────────── */}
      <InvoicePreviewModal
        open={invoicePreviewOpen}
        onOpenChange={handleInvoicePreviewClose}
        pdfUrls={invoicePreviewData}
        onPrintAll={() => toast({ title: "Printing all invoices…" })}
        onPrintCurrent={() => toast({ title: "Printing invoice…" })}
        onDownloadAll={handleDownloadAllInvoices}
      />

      {/* ── Packing slip preview ──────────────────────────── */}
      <PackingSlipPreviewModal
        open={packingSlipPreviewOpen}
        onOpenChange={handlePackingSlipPreviewClose}
        pdfUrls={packingSlipPreviewData}
        onPrintAll={() => toast({ title: "Printing all packing slips…" })}
        onPrintCurrent={() => toast({ title: "Printing packing slip…" })}
        onDownloadAll={handleBulkPackingSlipDownload}
      />
    </div>
  );
};
