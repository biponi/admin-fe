import React from "react";
import { useNavigate } from "react-router-dom";
import MainView from "../../coreComponents/mainView";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  ChevronLeft,
  RefreshCw,
  Package,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  ChevronLeft as PrevIcon,
  ChevronRight,
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
      sub: "Awaiting verification",
      icon: Package,
      accent: "text-amber-500",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      label: "This page",
      value: orders.length,
      sub: `Page ${currentPage + 1} of ${totalPages}`,
      icon: CheckCircle2,
      accent: "text-indigo-500",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
    },
    {
      label: "Total processing",
      value: totalCount,
      sub: "In processing status",
      icon: AlertCircle,
      accent: "text-rose-500",
      bg: "bg-rose-50",
      border: "border-rose-100",
    },
  ];

  return (
    <MainView title='Order Confirmation'>
      <>
        <div className='space-y-5 px-4 md:px-6 pb-8'>
          {/* ─── Page header ─── */}
          <div className='flex items-center justify-between pt-4'>
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
                <p className='text-xs text-gray-400 mt-1 hidden sm:block'>
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
              <span className='hidden sm:inline'>Refresh</span>
            </button>
          </div>

          {/* ─── Stats row ─── */}
          <div className='grid grid-cols-3 gap-3'>
            {stats.map(
              ({ label, value, sub, icon: Icon, accent, bg, border }) => (
                <div
                  key={label}
                  className={cn(
                    "rounded-xl border p-3 sm:p-4 bg-white transition-shadow hover:shadow-sm",
                    border,
                  )}>
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <p className='text-[11px] sm:text-xs font-medium text-gray-500 leading-snug'>
                        {label}
                      </p>
                      <p className='text-2xl sm:text-3xl font-bold text-gray-900 mt-1 tabular-nums'>
                        {value}
                      </p>
                      <p className='text-[11px] text-gray-400 mt-0.5 hidden sm:block'>
                        {sub}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        bg,
                      )}>
                      <Icon className={cn("w-4 h-4", accent)} />
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* ─── Toolbar ─── */}
          <div className='flex items-center justify-between flex-wrap gap-3'>
            <p className='text-xs text-gray-400 font-medium'>
              Showing{" "}
              <span className='text-gray-700 font-semibold'>
                {orders.length}
              </span>{" "}
              of{" "}
              <span className='text-gray-700 font-semibold'>{totalCount}</span>{" "}
              orders
            </p>

            <div className='flex items-center gap-3'>
              {/* Sort indicator */}
              <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200'>
                <span className='text-[11px] text-gray-400 font-medium'>
                  Sort:
                </span>
                <span className='text-[11px] text-gray-700 font-semibold'>
                  Oldest first
                </span>
              </div>

              {/* Page size */}
              <div className='flex items-center gap-1.5'>
                <span className='text-xs text-gray-400 hidden sm:inline'>
                  Per page
                </span>
                <Select
                  value={String(limit)}
                  onValueChange={(v) => handleLimitChange(Number(v))}>
                  <SelectTrigger className='h-8 w-[68px] text-xs rounded-lg border-gray-200 bg-white shadow-sm'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 12, 24, 48].map((n) => (
                      <SelectItem key={n} value={String(n)} className='text-xs'>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ─── Orders grid ─── */}
          {loading ? (
            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
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
            <div className='flex flex-col items-center justify-center py-20 gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50'>
              <div className='w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center'>
                <ClipboardList className='w-6 h-6 text-gray-300' />
              </div>
              <div className='text-center'>
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
            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
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

          {/* ─── Pagination ─── */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between pt-1'>
              <p className='text-xs text-gray-400 tabular-nums'>
                Page{" "}
                <span className='font-semibold text-gray-700'>
                  {currentPage + 1}
                </span>{" "}
                of{" "}
                <span className='font-semibold text-gray-700'>
                  {totalPages}
                </span>
              </p>

              <div className='flex items-center gap-1'>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || loading}
                  className='w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center
                             text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                             transition-colors shadow-sm'>
                  <PrevIcon className='w-4 h-4' />
                </button>

                {/* Page number pills */}
                <div className='flex items-center gap-1 px-1'>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page =
                      totalPages <= 5
                        ? i
                        : currentPage <= 2
                          ? i
                          : currentPage >= totalPages - 3
                            ? totalPages - 5 + i
                            : currentPage - 2 + i;
                    return (
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
                    );
                  })}
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
            </div>
          )}
        </div>

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
