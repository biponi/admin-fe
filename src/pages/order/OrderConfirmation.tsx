import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainView from "../../coreComponents/mainView";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../../components/ui/drawer";
import {
  ChevronLeft,
  RefreshCw,
  Package,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  ChevronLeft as PrevIcon,
  ChevronRight,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { useOrderConfirmation } from "./hooks/useOrderConfirmation";
import { OrderConfirmationCard } from "./components/OrderConfirmationCard";
import { CustomerVerificationDialog } from "./components/CustomerVerificationDialog";
import { CancelOrderDialog } from "./components/CancelOrderDialog";
import { useToast } from "../../components/ui/use-toast";
import { cn } from "../../lib/utils";

export const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const {
    orders,
    loading,
    totalCount,
    totalPages,
    currentPage,
    limit,
    selectedOrder,
    verificationDialogOpen,
    cancelDialogOpen,
    processingCount,
    searchQuery,
    handleConfirmOrder,
    handleCancelOrder,
    openVerificationDialog,
    openCancelDialog,
    closeDialogs,
    handlePageChange,
    handleLimitChange,
    refresh,
    setVerificationDialogOpen,
    setCancelDialogOpen,
    setSearchQuery,
  } = useOrderConfirmation();

  const handleRefresh = async () => {
    await refresh();
    toast({ title: "Refreshed", description: "Order list has been updated" });
  };

  const handleOrderUpdated = async () => {
    await refresh();
  };

  const stats = [
    {
      label: "Pending confirmation",
      value: processingCount,
      icon: Package,
      accent: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "This page",
      value: orders.length,
      icon: CheckCircle2,
      accent: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Total processing",
      value: totalCount,
      icon: AlertCircle,
      accent: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  // Compact page-number window shared by the desktop pager
  const pageWindow = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    return totalPages <= 5
      ? i
      : currentPage <= 2
        ? i
        : currentPage >= totalPages - 3
          ? totalPages - 5 + i
          : currentPage - 2 + i;
  });

  return (
    <MainView title='Order Confirmation'>
      <>
        <div className='pb-8 space-y-3 sm:space-y-5 bg-slate-50'>
          {/* ─── Mobile app-bar (native-app style) ─── */}
          <div className='sm:hidden sticky top-0 z-20 -mx-3 px-3 py-3 bg-white/95 backdrop-blur border-b border-gray-100 flex items-center justify-between'>
            <div className='flex items-center gap-2.5 min-w-0'>
              <button
                onClick={() => navigate("/order")}
                aria-label='Back'
                className='w-9 h-9 shrink-0 rounded-full border border-gray-200 bg-white active:bg-gray-100
                           flex items-center justify-center transition-colors'>
                <ChevronLeft className='w-4.5 h-4.5 text-gray-700' />
              </button>
              <h1 className='text-[15px] font-bold text-gray-900 truncate'>
                Order Confirmation
              </h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              aria-label='Refresh'
              className='w-9 h-9 shrink-0 rounded-full border border-gray-200 bg-white active:bg-gray-100
                         flex items-center justify-center disabled:opacity-50 transition-colors'>
              <RefreshCw
                className={cn(
                  "w-4 h-4 text-gray-600",
                  loading && "animate-spin",
                )}
              />
            </button>
          </div>

          {/* ─── Desktop page header ─── */}
          <div className='sticky top-0 bg-white/70 pb-4 px-40 backdrop-blur border-b border-gray-100 hidden sm:flex items-center justify-between pt-4'>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => navigate("/order")}
                className='w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50
                           flex items-center justify-center transition-colors shadow-sm'>
                <ChevronLeft className='w-4 h-4 text-gray-600' />
              </button>
              <div>
                <h1 className='text-lg font-bold text-gray-900 leading-none'>
                  Order Confirmation
                </h1>
                <p className='text-xs text-gray-400 mt-1'>
                  Verify processing orders before packaging
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200
                         bg-white hover:bg-gray-50 text-sm font-medium text-gray-600
                         disabled:opacity-50 transition-colors shadow-sm'>
              <RefreshCw
                className={cn("w-3.5 h-3.5", loading && "animate-spin")}
              />
              <span>Refresh</span>
            </button>
          </div>

          {/* ─── Panel: the whole workspace lives inside one cohesive surface ─── */}
          <div className=' w-full md:max-w-7xl mx-auto rounded-2xl border bg-white sm:shadow-sm overflow-hidden '>
            {/* Stats strip */}
            <div className='grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100'>
              {stats.map(({ label, value, icon: Icon, accent, bg }) => (
                <div
                  key={label}
                  className='flex items-center gap-2 sm:gap-3 px-2.5 sm:px-5 py-3 sm:py-4 min-w-0'>
                  <div
                    className={cn(
                      "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0",
                      bg,
                    )}>
                    <Icon className={cn("w-4 h-4", accent)} />
                  </div>
                  <div className='min-w-0'>
                    <p className='text-lg sm:text-xl font-bold text-gray-900 leading-none tabular-nums'>
                      {value}
                    </p>
                    <p className='text-[10px] sm:text-[11px] font-medium text-gray-500 mt-1 truncate'>
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Toolbar — desktop */}
            <div className='hidden sm:flex items-center justify-between flex-wrap gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/40'>
              <p className='text-xs text-gray-400 font-medium'>
                Showing{" "}
                <span className='text-gray-700 font-semibold'>
                  {orders.length}
                </span>{" "}
                of{" "}
                <span className='text-gray-700 font-semibold'>
                  {totalCount}
                </span>{" "}
                orders
              </p>

              <div className='flex items-center gap-3'>
                {/* Search */}
                <div className='relative'>
                  <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400' />
                  <Input
                    type='text'
                    placeholder='Search by order # or phone...'
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handlePageChange(0);
                    }}
                    className='pl-8 pr-8 h-8 w-52 text-xs rounded-lg border-gray-200 bg-white shadow-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400'
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                      <X className='w-3 h-3' />
                    </button>
                  )}
                </div>

                {/* Sort indicator */}
                <div className='flex items-center gap-1.5 px-2.5 py-1  cursor-not-allowed'>
                  <ArrowUpDown className='w-3 h-3 text-gray-400' />
                  <span className='text-[11px] text-gray-700 font-semibold'>
                    Oldest first
                  </span>
                </div>

                {/* Page size */}
                <div className='flex items-center gap-1.5'>
                  <span className='text-xs text-gray-400'>Per page</span>
                  <Select
                    value={String(limit)}
                    onValueChange={(v) => handleLimitChange(Number(v))}>
                    <SelectTrigger className='h-8 w-[68px] text-xs rounded-lg border-gray-200 bg-white shadow-sm'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[6, 12, 24, 48].map((n) => (
                        <SelectItem
                          key={n}
                          value={String(n)}
                          className='text-xs'>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Toolbar — mobile */}
            <div className='sm:hidden flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-gray-50/40'>
              <div className='relative flex-1'>
                <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400' />
                <Input
                  type='text'
                  placeholder='Search order # or phone'
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handlePageChange(0);
                  }}
                  className='pl-8 pr-8 h-9 text-sm rounded-xl border-gray-200 bg-white'
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400'>
                    <X className='w-3.5 h-3.5' />
                  </button>
                )}
              </div>
              <button
                onClick={() => setMobileFilterOpen(true)}
                aria-label='Sort and display options'
                className='w-9 h-9 shrink-0 rounded-xl border border-gray-200 bg-white active:bg-gray-100
                           flex items-center justify-center transition-colors'>
                <SlidersHorizontal className='w-4 h-4 text-gray-600' />
              </button>
            </div>

            <p className='sm:hidden px-3 pt-2.5 text-[11px] text-gray-400 font-medium'>
              Showing{" "}
              <span className='text-gray-700 font-semibold'>
                {orders.length}
              </span>{" "}
              of{" "}
              <span className='text-gray-700 font-semibold'>{totalCount}</span>{" "}
              orders
            </p>

            {/* ─── Orders ─── */}
            <div className='p-3 sm:p-5'>
              {loading ? (
                <div className='flex flex-col sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4'>
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className='rounded-xl border border-gray-100 bg-white p-4 space-y-3'>
                      <div className='flex items-start justify-between'>
                        <div className='space-y-1.5'>
                          <Skeleton className='h-5 w-28' />
                          <Skeleton className='h-3.5 w-40' />
                        </div>
                        <Skeleton className='h-5 w-16 rounded-full' />
                      </div>
                      <Skeleton className='h-14 w-full rounded-lg' />
                      <div className='flex gap-2'>
                        <Skeleton className='h-8 flex-1 rounded-lg' />
                        <Skeleton className='h-8 flex-1 rounded-lg' />
                        <Skeleton className='h-8 w-8 rounded-lg' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-16 sm:py-20 gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50'>
                  <div className='w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center'>
                    <ClipboardList className='w-6 h-6 text-gray-300' />
                  </div>
                  <div className='text-center px-4'>
                    <p className='text-sm font-semibold text-gray-700'>
                      No orders pending confirmation
                    </p>
                    <p className='text-xs text-gray-400 mt-1'>
                      All processing orders have been handled.
                    </p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className='mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors'>
                    Check for new orders →
                  </button>
                </div>
              ) : (
                <div className='flex flex-col sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:max-h-[49.5vh] md:overflow-y-auto'>
                  {orders.map((order) => (
                    <OrderConfirmationCard
                      key={order.id}
                      order={order}
                      onConfirm={(order) => openVerificationDialog(order)}
                      onCancel={(order) => openCancelDialog(order)}
                      onOrderUpdated={handleOrderUpdated}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ─── Pagination footer ─── */}
            {totalPages > 1 && (
              <div className='flex items-center justify-between px-3 sm:px-5 py-3 border-t border-gray-100 bg-gray-50/40'>
                {/* Desktop pager */}
                <p className='hidden sm:block text-xs text-gray-400 tabular-nums'>
                  Page{" "}
                  <span className='font-semibold text-gray-700'>
                    {currentPage + 1}
                  </span>{" "}
                  of{" "}
                  <span className='font-semibold text-gray-700'>
                    {totalPages}
                  </span>
                </p>

                <div className='hidden sm:flex items-center gap-1 ml-auto'>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0 || loading}
                    className='w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center
                               text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                               transition-colors shadow-sm'>
                    <PrevIcon className='w-4 h-4' />
                  </button>

                  <div className='flex items-center gap-1 px-1'>
                    {pageWindow.map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        disabled={loading}
                        className={cn(
                          "w-8 h-8 rounded-lg text-xs font-semibold transition-colors",
                          page === currentPage
                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100"
                            : "border border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
                        )}>
                        {page + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1 || loading}
                    className='w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center
                               text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                               transition-colors shadow-sm'>
                    <ChevronRight className='w-4 h-4' />
                  </button>
                </div>

                {/* Mobile pager — simple, full-width, app-like */}
                <div className='sm:hidden flex items-center gap-2 w-full'>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0 || loading}
                    className='flex-1 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center gap-1
                               text-sm font-medium text-gray-600 active:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed
                               transition-colors'>
                    <PrevIcon className='w-4 h-4' />
                    Prev
                  </button>
                  <span className='text-xs font-semibold text-gray-500 tabular-nums px-2 shrink-0'>
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1 || loading}
                    className='flex-1 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center gap-1
                               text-sm font-medium text-gray-600 active:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed
                               transition-colors'>
                    Next
                    <ChevronRight className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Mobile sort & display drawer ─── */}
        <Drawer open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
          <DrawerContent>
            <DrawerHeader className='text-left'>
              <DrawerTitle>Sort & display</DrawerTitle>
            </DrawerHeader>
            <div className='px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-3'>
              <div className='flex items-center justify-between rounded-xl border border-gray-200 px-3.5 py-3'>
                <div>
                  <p className='text-xs font-semibold text-gray-700'>
                    Sort order
                  </p>
                  <p className='text-[11px] text-gray-400 mt-0.5'>
                    Oldest orders first
                  </p>
                </div>
                <span className='text-[11px] font-medium text-gray-400'>
                  Default
                </span>
              </div>
              <div className='flex items-center justify-between rounded-xl border border-gray-200 px-3.5 py-3'>
                <p className='text-xs font-semibold text-gray-700'>
                  Orders per page
                </p>
                <Select
                  value={String(limit)}
                  onValueChange={(v) => handleLimitChange(Number(v))}>
                  <SelectTrigger className='h-9 w-[80px] text-sm rounded-lg'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 12, 24, 48].map((n) => (
                      <SelectItem key={n} value={String(n)} className='text-sm'>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        {/* ─── Dialogs ─── */}
        <CustomerVerificationDialog
          order={selectedOrder}
          open={verificationDialogOpen}
          onOpenChange={setVerificationDialogOpen}
          onConfirm={handleConfirmOrder}
          onCancel={closeDialogs}
          loading={loading}
        />

        <CancelOrderDialog
          order={selectedOrder}
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          onCancel={handleCancelOrder}
          loading={loading}
        />
      </>
    </MainView>
  );
};

export default OrderConfirmation;
