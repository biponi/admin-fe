import React, { useEffect, useState } from "react";
import {
  deletePurchaseOrder,
  fetchPurchaseOrders,
  restorePurchaseOrder,
} from "./services/purchaseOrderApi";
import { PurchaseOrder } from "./types";
import { Button } from "../../components/ui/button";
import { cn } from "../../utils/functions";
import {
  ArchiveRestore,
  Bird,
  Trash2,
  Plus,
  Package,
  Calendar,
  DollarSign,
  Edit,
  Logs,
} from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "../../components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Card, CardContent } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { useIsMobile } from "../../hooks/use-mobile";
import MobilePurchaseOrderCard from "./components/MobilePurchaseOrderCard";
import MobilePurchaseOrderHeader from "./components/MobilePurchaseOrderHeader";
import MobilePurchaseOrderEmpty from "./components/MobilePurchaseOrderEmpty";
import MobilePurchaseOrderSkeleton from "./components/MobilePurchaseOrderSkeleton";
import { MobilePagination } from "../../components/mobile";

// Pagination Component
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}> = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className='flex items-center justify-center space-x-2 py-4 px-4'>
      {/* <div className='flex items-center space-x-2'>
        <span className='text-sm text-muted-foreground'>Items per page:</span>
        <select
          value={pageSize}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            onPageSizeChange(newSize);
          }}
          disabled={isLoading}
          className='border rounded px-2 py-1 text-sm bg-background'>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div> */}

      <div className='flex items-center space-x-2'>
        <Button
          variant='outline'
          size='sm'
          disabled={currentPage <= 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          className='rounded-md border-slate-300 text-slate-600 hover:bg-accent hover:text-foreground hover:border-zinc-400'>
          Previous
        </Button>

        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className='px-2 text-slate-400'>...</span>
            ) : (
              <Button
                variant='outline'
                size='sm'
                disabled={isLoading}
                onClick={() => onPageChange(page as number)}
                className={
                  currentPage === page
                    ? "rounded-md border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    : "rounded-md border-slate-300 text-slate-600 hover:bg-accent hover:text-foreground hover:border-zinc-400"
                }>
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        <Button
          variant='outline'
          size='sm'
          disabled={currentPage >= totalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className='rounded-md border-slate-300 text-slate-600 hover:bg-accent hover:text-foreground hover:border-zinc-400'>
          Next
        </Button>
      </div>
    </div>
  );
};

// Loading Skeleton Component
// Loading Skeleton Component — mirrors the table silhouette (chip + rows)
const PurchaseOrderSkeleton: React.FC = () => (
  <div className='rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(20,20,19,0.04)] overflow-hidden'>
    {[...Array(6)].map((_, index) => (
      <div
        key={index}
        className='flex items-center gap-4 border-b border-slate-200/70 px-4 py-4 last:border-b-0'>
        <Skeleton className='h-10 w-10 rounded-md bg-slate-100' />
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-40 rounded-lg bg-slate-100' />
          <Skeleton className='h-10 w-40 rounded-lg bg-slate-100' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-9 w-9 rounded-lg bg-slate-100' />
          <div className='space-y-1.5'>
            <Skeleton className='h-3.5 w-20 bg-slate-100' />
            <Skeleton className='h-2.5 w-14 bg-slate-100' />
          </div>
        </div>
        <div className='ml-auto flex items-center gap-2'>
          <Skeleton className='h-9 w-9 rounded-lg bg-slate-100' />
          <div className='space-y-1.5'>
            <Skeleton className='h-3.5 w-24 bg-slate-100' />
            <Skeleton className='h-2.5 w-14 bg-slate-100' />
          </div>
        </div>
        <div className='flex gap-1.5'>
          <Skeleton className='h-8 w-8 rounded-md bg-slate-100' />
          <Skeleton className='h-8 w-8 rounded-md bg-slate-100' />
        </div>
      </div>
    ))}
  </div>
);

const ListPurchaseOrders: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();

  const [allPurchaseOrders, setAllPurchaseOrders] = useState<PurchaseOrder[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);

  // Server-side pagination state
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchPurchaseOrders(currentPage, pageSize);
      if (response) {
        // Handle both old and new response formats
        const orders = response.purchaseOrders || response || [];
        setAllPurchaseOrders(orders);
        setTotalDocs(response.totalDocs || 0);
        setTotalPages(response.totalPages || 0);
        // Sync currentPage from response in case it's out of bounds
        if (response.currentPage && response.currentPage !== currentPage) {
          setCurrentPage(response.currentPage);
        }
      } else {
        setAllPurchaseOrders([]);
        setTotalDocs(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error(err);
      setAllPurchaseOrders([]);
      setTotalDocs(0);
      setTotalPages(0);
      toast.error("Failed to fetch purchase orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deletePurchaseOrder(id);

      // Check if we're on the last page and it has only one item
      const isLastPage = currentPage === totalPages;
      const isOnlyItem = allPurchaseOrders.length === 1;

      // If deleting the last item on the last page, go to previous page
      if (isLastPage && isOnlyItem && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        // Otherwise refetch current page
        await fetchData();
      }

      toast.success("Purchase order deleted successfully!");
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message);
      } else {
        toast.error("Couldn't delete the purchase order");
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRestorePurchaseOrder = async (id: string) => {
    setIsRestoring(id);
    try {
      await restorePurchaseOrder(id);

      // Check if we're on the last page and it has only one item
      const isLastPage = currentPage === totalPages;
      const isOnlyItem = allPurchaseOrders.length === 1;

      // If restoring the last item on the last page, go to previous page
      if (isLastPage && isOnlyItem && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        // Otherwise refetch current page
        await fetchData();
      }

      toast.success("Purchase order restored successfully!");
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message);
      } else {
        toast.error("Couldn't restore the purchase order");
      }
    } finally {
      setIsRestoring(null);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/purchase-order/update/${id}`);
  };

  const handleCreateOrder = () => {
    navigate("/purchase-order/create");
  };

  const renderProductsPopover = (order: PurchaseOrder) => {
    const remainingProducts = order.products?.slice(3);
    if (!remainingProducts || remainingProducts.length === 0) return null;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 rounded-md  px-2.5 text-[11px] font-medium text-slate-500 hover:border-zinc-400 hover:text-foreground transition-colors duration-200'>
            +{remainingProducts.length} more
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-96 rounded-lg border border-slate-200 p-0'>
          <div className='space-y-0'>
            <div className='px-4 py-3 border-b border-slate-200/70 bg-muted/50'>
              <h4 className='font-semibold text-sm text-foreground flex items-center gap-2'>
                <span className='flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground'>
                  <Package className='h-3.5 w-3.5 text-white' />
                </span>
                Additional Products ({remainingProducts.length})
              </h4>
            </div>
            <div className='max-h-80 overflow-y-auto bg-muted/40 p-3 space-y-2'>
              {remainingProducts.map((product, index) => (
                <div
                  key={index}
                  className='flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 hover:border-zinc-400 transition-colors duration-200'>
                  {product.image || product.thumbnail ? (
                    <div className='relative shrink-0'>
                      <img
                        src={product.image || product.thumbnail}
                        alt={product.title}
                        className='h-10 w-10 rounded-lg object-cover border border-slate-200'
                      />
                      <div className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-semibold tabular-nums'>
                        {product.quantity}
                      </div>
                    </div>
                  ) : (
                    <div className='h-10 w-10 rounded-lg bg-muted flex items-center justify-center border border-slate-200 relative shrink-0'>
                      <Package className='h-5 w-5 text-slate-400' />
                      <div className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-semibold tabular-nums'>
                        {product.quantity}
                      </div>
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='text-[13px] font-semibold text-foreground truncate leading-tight'>
                      {!!product.title
                        ? product.title.split(" ")[0]
                        : product.title}
                    </p>
                    <div className='flex items-center gap-2 mt-1'>
                      {!!product.title &&
                        product.title.split(" ").slice(1).join(" ") && (
                          <Badge
                            variant='secondary'
                            className='rounded-md border border-slate-200 bg-muted text-[10px] px-2 py-0.5 font-medium text-slate-500'>
                            {product.title.split(" ").slice(1).join(" ")}
                          </Badge>
                        )}
                      <Badge
                        variant='outline'
                        className='rounded-md text-[10px] px-2 py-0.5 text-slate-500 font-medium'>
                        Qty: {product.quantity}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const EmptyState = () => (
    <Card className='w-full rounded-xl border border-dashed border-slate-200 bg-white shadow-none'>
      <CardContent className='flex flex-col items-center justify-center py-16'>
        <div className='rounded-xl bg-muted ring-1 ring-border p-4 mb-4'>
          <Bird className='w-8 h-8 text-slate-400' />
        </div>
        <h3 className='text-base font-semibold text-foreground mb-2'>
          No Purchase Orders Found
        </h3>
        <p className='text-[13px] text-slate-500 text-center mb-6 max-w-md'>
          You haven't created any purchase orders yet. Get started by creating
          your first purchase order.
        </p>
        {hasRequiredPermission("purchaseorder", "create") && (
          <Button
            onClick={() => navigate("/purchase-order/create")}
            className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md'>
            <Plus className='w-4 h-4 mr-2' />
            Create Purchase Order
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className='min-h-screen'>
      <div className='mx-auto sm:px-6 lg:px-8 md:py-6 space-y-6'>
        {/* Header - Mobile */}
        {isMobile ? (
          <MobilePurchaseOrderHeader totalOrders={totalDocs} />
        ) : (
          /* Header - Desktop */
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground shadow-sm'>
                <Package className='h-5 w-5 text-white' />
              </div>
              <div>
                <h1 className='text-[18px] font-semibold text-foreground tracking-tight leading-tight'>
                  Purchase Orders
                </h1>
                <p className='text-[13px] text-slate-400 mt-0.5'>
                  Manage your purchase orders and track inventory
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <span className='rounded-md  px-2.5 py-1 text-base font-semibold text-slate-500 tabular-nums'>
                {totalDocs} total
              </span>
              {hasRequiredPermission("purchaseorder", "create") && (
                <Button
                  onClick={handleCreateOrder}
                  className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md'>
                  <Plus className='w-4 h-4 mr-2' />
                  Create Purchase Order
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Content - Mobile View */}
        {isMobile ? (
          <div className='space-y-3 pb-safe px-2 mt-2'>
            {isLoading ? (
              <MobilePurchaseOrderSkeleton />
            ) : allPurchaseOrders.length === 0 ? (
              <MobilePurchaseOrderEmpty onCreateOrder={handleCreateOrder} />
            ) : (
              <>
                <div className='space-y-3'>
                  {allPurchaseOrders.map((order) => (
                    <MobilePurchaseOrderCard
                      key={order.id}
                      id={order.id}
                      purchaseNumber={order.purchaseNumber}
                      products={order.products || []}
                      totalAmount={order.totalAmount}
                      createdAt={order.createdAt}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                      handleRestore={handleRestorePurchaseOrder}
                      isDeleted={false}
                    />
                  ))}
                </div>

                {/* Mobile Pagination */}
                {!isLoading && totalPages > 1 && (
                  <MobilePagination
                    page={currentPage}
                    totalPages={totalPages}
                    onChange={handlePageChange}
                  />
                )}
              </>
            )}

            {/* Floating Action Button */}
            {hasRequiredPermission("purchaseorder", "create") && (
              <Button
                onClick={handleCreateOrder}
                className='fixed bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] right-4 h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white z-30 flex items-center justify-center shadow-sm shadow-indigo-200'>
                <Plus className='h-6 w-6' />
              </Button>
            )}

            {/* Clearance for the global bottom tab bar */}
            <div className='h-[calc(4rem+env(safe-area-inset-bottom))]' />
          </div>
        ) : (
          /* Content - Desktop View */
          <>
            {isLoading ? (
              <PurchaseOrderSkeleton />
            ) : allPurchaseOrders.length === 0 ? (
              <EmptyState />
            ) : (
              <Card className='rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(20,20,19,0.04)] overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-muted/50 border-b border-slate-200 hover:bg-muted/50'>
                      <TableHead className='w-40 text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>
                        Order Number
                      </TableHead>
                      <TableHead className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>
                        Products
                      </TableHead>
                      <TableHead className='w-36 text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>
                        Total Amount
                      </TableHead>
                      <TableHead className='w-44 text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>
                        Created Date
                      </TableHead>
                      {hasSomePermissionsForPage("purchaseorder", [
                        "edit",
                        "delete",
                      ]) && (
                        <TableHead className='w-28 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPurchaseOrders.map((order, index) => (
                      <TableRow
                        key={order.id}
                        className='group hover:bg-muted/50 transition-colors duration-200 border-b border-slate-200/70'>
                        <TableCell className='py-4 px-4'>
                          <div className='flex flex-col justify-start items-start gap-0'>
                            <div className='h-10 w-10  flex items-center justify-center text-primary font-mono font-semibold text-sm'>
                              #{order.purchaseNumber}
                            </div>
                            <div className='hidden lg:block'>
                              <p className='text-[10px] text-slate-400 font-mono'>
                                ID: {order.id.slice(-8)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='py-4 px-4'>
                          <div className='space-y-2'>
                            {order.products?.length > 3 ? (
                              <>
                                <div className='flex flex-wrap gap-4'>
                                  {order.products
                                    .slice(0, 3)
                                    .map((product, index) => (
                                      <div
                                        key={index}
                                        className='group/product flex items-center gap-3 p-1   transition-colors duration-200'>
                                        {product.image || product.thumbnail ? (
                                          <div className='relative'>
                                            <img
                                              src={
                                                product.image ||
                                                product.thumbnail
                                              }
                                              alt={product.title}
                                              className='h-12 w-12 rounded-lg object-cover border border-slate-200'
                                            />
                                            <div className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-semibold tabular-nums'>
                                              {product.quantity}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className='h-10 w-10 rounded-lg bg-muted flex items-center justify-center border border-slate-200 relative'>
                                            <Package className='h-5 w-5 text-slate-400' />
                                            <div className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-semibold tabular-nums'>
                                              {product.quantity}
                                            </div>
                                          </div>
                                        )}
                                        <div className='flex-1 min-w-0 max-w-[200px]'>
                                          <p className='text-[13px] font-semibold uppercase text-foreground truncate leading-tight'>
                                            {!!product.title
                                              ? product.title.split(" ")[0]
                                              : product.title}
                                          </p>
                                          <div className='flex items-center  mt-1'>
                                            {!!product.title &&
                                              product.title
                                                .split(" ")
                                                .slice(1)
                                                .join(" ") && (
                                                <Badge
                                                  variant='default'
                                                  className='rounded-md hover:bg-transparent border-0 bg-transparent shadow-none italic text-[10px] pr-2 pl-0 py-0.5 font-medium text-slate-500'>
                                                  {product.title
                                                    .split(" ")
                                                    .slice(1)
                                                    .join(" ")}
                                                </Badge>
                                              )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                                {renderProductsPopover(order)}
                              </>
                            ) : (
                              <div className='flex flex-wrap gap-2'>
                                {order.products?.map((product, index) => (
                                  <div
                                    key={index}
                                    className='group/product flex items-center gap-2 px-3 py-2 rounded-lg  bg-white hover:border-zinc-400 transition-colors duration-200'>
                                    {product.image || product.thumbnail ? (
                                      <div className='relative'>
                                        <img
                                          src={
                                            product.image || product.thumbnail
                                          }
                                          alt={product.title}
                                          className='h-12 w-12 rounded-lg object-cover border border-slate-200'
                                        />
                                        <div className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-semibold tabular-nums'>
                                          {product.quantity}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className='h-12 w-12  flex items-center justify-center border border-slate-200 relative'>
                                        <Package className='h-5 w-5 text-slate-400' />
                                        <div className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-semibold tabular-nums'>
                                          {product.quantity}
                                        </div>
                                      </div>
                                    )}
                                    <div className='flex-1 min-w-0 max-w-[200px]'>
                                      <p className='text-[13px] font-semibold text-foreground truncate uppercase leading-tight'>
                                        {!!product.title
                                          ? product.title.split(" ")[0]
                                          : product.title}
                                      </p>
                                      <div className='flex items-center  mt-1 uppercase'>
                                        {!!product.title &&
                                          product.title
                                            .split(" ")
                                            .slice(1)
                                            .join(" ") && (
                                            <Badge
                                              variant='secondary'
                                              className='rounded-md hover:bg-transparent shadow-none border-0 italic bg-transparent text-[10px] px-2 py-0.5 font-medium text-slate-500'>
                                              {product.title
                                                .split(" ")
                                                .slice(1)
                                                .join(" ")}
                                            </Badge>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className='py-4 px-4'>
                          <div className='flex items-center gap-2'>
                            <div>
                              <p className='text-sm font-semibold text-foreground tabular-nums'>
                                <span className='text-primary'>৳</span>
                                {order.totalAmount?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='py-4 px-4'>
                          <div className='flex items-center gap-2'>
                            <div className='h-9 w-9 rounded-lg flex bg-primary/10 items-center justify-center border border-primary'>
                              <Calendar className='h-4 w-4  text-primary  ' />
                            </div>
                            <div>
                              <p className='text-[13px] font-semibold text-foreground'>
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                              <p className='text-[10px] text-slate-400 font-mono tabular-nums'>
                                {new Date(order.createdAt).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        {hasSomePermissionsForPage("purchaseorder", [
                          "edit",
                          "delete",
                        ]) && (
                          <TableCell className='py-4 px-4'>
                            <div className='flex items-center justify-center gap-1.5'>
                              {hasRequiredPermission(
                                "purchaseorder",
                                "edit",
                              ) && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() =>
                                    navigate(
                                      `/purchase-order/update/${order.id}`,
                                    )
                                  }
                                  className='h-8 w-8 p-0 rounded-md hover:bg-accent hover:text-foreground text-slate-400 transition-colors duration-200'
                                  title='Edit Purchase Order'>
                                  <Edit className='w-4 h-4' />
                                </Button>
                              )}

                              {hasRequiredPermission(
                                "purchaseorder",
                                "edit",
                              ) && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      disabled={isRestoring === order.id}
                                      className='h-8 w-8 p-0 rounded-md hover:bg-blue-50 hover:text-blue-700 text-slate-400 transition-colors duration-200'
                                      title='Restore Purchase Order'>
                                      <ArchiveRestore className='w-4 h-4' />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Restore Purchase Order
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to restore this
                                        purchase order? This will make it active
                                        again.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleRestorePurchaseOrder(order.id)
                                        }>
                                        Restore
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              {hasRequiredPermission(
                                "purchaseorder",
                                "delete",
                              ) && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  disabled={isDeleting === order.id}
                                  onClick={() => handleDelete(order.id)}
                                  className='h-8 w-8 p-0 rounded-md hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors duration-200'
                                  title='Delete Purchase Order'>
                                  <Trash2 className='w-4 h-4 ' />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}

            {/* Desktop Pagination */}
            {!isLoading && allPurchaseOrders.length > 0 && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                isLoading={false}
              />
            )}
          </>
        )}
        {/* End of desktop section */}
      </div>
      {/* End of max-w-7xl container */}
    </div>
  );
};

export default ListPurchaseOrders;
