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
  Hash,
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
import { Card, CardContent, CardHeader } from "../../components/ui/card";
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
          onClick={() => onPageChange(currentPage - 1)}>
          Previous
        </Button>

        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className='px-2 text-muted-foreground'>...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size='sm'
                disabled={isLoading}
                onClick={() => onPageChange(page as number)}>
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        <Button
          variant='outline'
          size='sm'
          disabled={currentPage >= totalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const PurchaseOrderSkeleton: React.FC = () => (
  <div className='space-y-4'>
    {[...Array(5)].map((_, index) => (
      <Card key={index} className='w-full'>
        <CardHeader className='pb-3'>
          <div className='flex justify-between items-start'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-3 w-32' />
            </div>
            <Skeleton className='h-6 w-20' />
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='flex gap-2'>
              <Skeleton className='h-8 w-24' />
              <Skeleton className='h-8 w-24' />
              <Skeleton className='h-8 w-16' />
            </div>
            <div className='flex justify-between items-center'>
              <Skeleton className='h-4 w-28' />
              <div className='flex gap-2'>
                <Skeleton className='h-8 w-8' />
                <Skeleton className='h-8 w-8' />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
    const remainingProducts = order.products?.slice(2);
    if (!remainingProducts || remainingProducts.length === 0) return null;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='h-8 px-3 rounded-lg text-xs font-medium border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200'>
            +{remainingProducts.length} more
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-96 p-0'>
          <div className='space-y-0'>
            <div className='px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'>
              <h4 className='font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2'>
                <Package className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
                Additional Products ({remainingProducts.length})
              </h4>
            </div>
            <div className='max-h-80 overflow-y-auto p-3 space-y-2'>
              {remainingProducts.map((product, index) => (
                <div
                  key={index}
                  className='flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm transition-all duration-200'>
                  {product.image || product.thumbnail ? (
                    <div className='relative shrink-0'>
                      <img
                        src={product.image || product.thumbnail}
                        alt={product.title}
                        className='h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-slate-600'
                      />
                      <div className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold'>
                        {product.quantity}
                      </div>
                    </div>
                  ) : (
                    <div className='h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 relative shrink-0'>
                      <Package className='h-5 w-5 text-slate-400' />
                      <div className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold'>
                        {product.quantity}
                      </div>
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight'>
                      {!!product.title
                        ? product.title.split(" ")[0]
                        : product.title}
                    </p>
                    <div className='flex items-center gap-2 mt-1'>
                      {!!product.title &&
                        product.title.split(" ").slice(1).join(" ") && (
                          <Badge
                            variant='secondary'
                            className='text-[10px] px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 font-medium'>
                            {product.title.split(" ").slice(1).join(" ")}
                          </Badge>
                        )}
                      <Badge
                        variant='outline'
                        className='text-[10px] px-2 py-0.5 text-slate-600 dark:text-slate-400 font-medium'>
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
    <Card className='w-full'>
      <CardContent className='flex flex-col items-center justify-center py-16'>
        <div className='rounded-full bg-muted p-4 mb-4'>
          <Bird className='w-8 h-8 text-muted-foreground' />
        </div>
        <h3 className='text-lg font-semibold mb-2'>No Purchase Orders Found</h3>
        <p className='text-muted-foreground text-center mb-6 max-w-md'>
          You haven't created any purchase orders yet. Get started by creating
          your first purchase order.
        </p>
        {hasRequiredPermission("purchaseorder", "create") && (
          <Button onClick={() => navigate("/purchase-order/create")}>
            <Plus className='w-4 h-4 mr-2' />
            Create Purchase Order
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className='min-h-screen bg-slate-50/60'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
        {/* Header - Mobile */}
        {isMobile ? (
          <MobilePurchaseOrderHeader totalOrders={totalDocs} />
        ) : (
          /* Header - Desktop */
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200'>
                <Package className='h-5 w-5 text-white' />
              </div>
              <div>
                <h1 className='text-xl font-semibold text-slate-900 leading-tight'>
                  Purchase Orders
                </h1>
                <p className='text-sm text-slate-500 mt-0.5'>
                  Manage your purchase orders and track inventory
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Badge
                variant={"secondary"}
                className='text-sm font-medium text-slate-600 bg-slate-100 border-slate-200'>
                {totalDocs} total
              </Badge>
              {hasRequiredPermission("purchaseorder", "create") && (
                <Button
                  onClick={handleCreateOrder}
                  className='bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'>
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

                {/* Simplified Mobile Pagination */}
                {totalPages > 1 && (
                  <div className='flex items-center justify-between gap-2 pt-4 px-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={currentPage <= 1 || isLoading}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className='flex-1'>
                      ← Previous
                    </Button>
                    <div className='px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700'>
                      {currentPage} / {totalPages}
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={currentPage >= totalPages || isLoading}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className='flex-1'>
                      Next →
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Floating Action Button */}
            {hasRequiredPermission("purchaseorder", "create") && (
              <Button
                onClick={handleCreateOrder}
                className='fixed bottom-20 right-4 h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white z-50 flex items-center justify-center shadow-sm shadow-indigo-200'>
                <Plus className='h-6 w-6' />
              </Button>
            )}
          </div>
        ) : (
          /* Content - Desktop View */
          <>
            {isLoading ? (
              <PurchaseOrderSkeleton />
            ) : allPurchaseOrders.length === 0 ? (
              <EmptyState />
            ) : (
              <Card className='border shadow-sm'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700'>
                      <TableHead className='w-40 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider'>
                        <div className='flex items-center gap-2'>
                          <div className='h-6 w-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center'>
                            <Hash className='w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400' />
                          </div>
                          Order Number
                        </div>
                      </TableHead>
                      <TableHead className='text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider'>
                        <div className='flex items-center gap-2'>
                          <div className='h-6 w-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center'>
                            <Package className='w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400' />
                          </div>
                          Products
                        </div>
                      </TableHead>
                      <TableHead className='w-36 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider'>
                        <div className='flex items-center gap-2'>
                          <div className='h-6 w-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center'>
                            <DollarSign className='w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400' />
                          </div>
                          Total Amount
                        </div>
                      </TableHead>
                      <TableHead className='w-44 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider'>
                        <div className='flex items-center gap-2'>
                          <div className='h-6 w-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center'>
                            <Calendar className='w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400' />
                          </div>
                          Created Date
                        </div>
                      </TableHead>
                      {hasSomePermissionsForPage("purchaseorder", [
                        "edit",
                        "delete",
                      ]) && (
                        <TableHead className='w-28 text-center text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider'>
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPurchaseOrders.map((order, index) => (
                      <TableRow
                        key={order.id}
                        className='group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors duration-200 border-b border-slate-200 dark:border-slate-700'>
                        <TableCell className='py-4 px-4'>
                          <div className='flex items-center gap-3'>
                            <div className='h-10 w-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm'>
                              #{order.purchaseNumber}
                            </div>
                            <div className='hidden lg:block'>
                              <p className='text-xs text-slate-500 dark:text-slate-400 font-medium'>
                                Purchase Order
                              </p>
                              <p className='text-xs text-slate-400 dark:text-slate-500'>
                                ID: {order.id.slice(-8)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='py-4 px-4'>
                          <div className='space-y-2'>
                            {order.products?.length > 2 ? (
                              <>
                                <div className='flex flex-wrap gap-2'>
                                  {order.products
                                    .slice(0, 2)
                                    .map((product, index) => (
                                      <div
                                        key={index}
                                        className='group/product flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-sm transition-all duration-200'>
                                        {product.image || product.thumbnail ? (
                                          <div className='relative'>
                                            <img
                                              src={
                                                product.image ||
                                                product.thumbnail
                                              }
                                              alt={product.title}
                                              className='h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-slate-600'
                                            />
                                            <div className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold'>
                                              {product.quantity}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className='h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 relative'>
                                            <Package className='h-5 w-5 text-slate-400' />
                                            <div className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold'>
                                              {product.quantity}
                                            </div>
                                          </div>
                                        )}
                                        <div className='flex-1 min-w-0 max-w-[200px]'>
                                          <p className='text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight'>
                                            {!!product.title
                                              ? product.title.split(" ")[0]
                                              : product.title}
                                          </p>
                                          <div className='flex items-center gap-1.5 mt-1'>
                                            {!!product.title &&
                                              product.title
                                                .split(" ")
                                                .slice(1)
                                                .join(" ") && (
                                                <Badge
                                                  variant='secondary'
                                                  className='text-[10px] px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 font-medium'>
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
                                    className='group/product flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-sm transition-all duration-200'>
                                    {product.image || product.thumbnail ? (
                                      <div className='relative'>
                                        <img
                                          src={
                                            product.image || product.thumbnail
                                          }
                                          alt={product.title}
                                          className='h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-slate-600'
                                        />
                                        <div className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold'>
                                          {product.quantity}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className='h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 relative'>
                                        <Package className='h-5 w-5 text-slate-400' />
                                        <div className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold'>
                                          {product.quantity}
                                        </div>
                                      </div>
                                    )}
                                    <div className='flex-1 min-w-0 max-w-[200px]'>
                                      <p className='text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight'>
                                        {!!product.title
                                          ? product.title.split(" ")[0]
                                          : product.title}
                                      </p>
                                      <div className='flex items-center gap-1.5 mt-1'>
                                        {!!product.title &&
                                          product.title
                                            .split(" ")
                                            .slice(1)
                                            .join(" ") && (
                                            <Badge
                                              variant='secondary'
                                              className='text-[10px] px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 font-medium'>
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
                            <div className='h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-200 dark:border-indigo-800'>
                              <DollarSign className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
                            </div>
                            <div>
                              <p className='text-sm font-bold text-slate-900 dark:text-white tabular-nums'>
                                ৳{order.totalAmount?.toLocaleString()}
                              </p>
                              <p className='text-[10px] text-slate-500 dark:text-slate-400 font-medium'>
                                Total Value
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='py-4 px-4'>
                          <div className='flex items-center gap-2'>
                            <div className='h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-200 dark:border-indigo-800'>
                              <Calendar className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
                            </div>
                            <div>
                              <p className='text-xs font-semibold text-slate-900 dark:text-white'>
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                              <p className='text-[10px] text-slate-500 dark:text-slate-400 font-medium'>
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
                                  className='h-8 w-8 p-0 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 transition-all duration-200'
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
                                      className='h-8 w-8 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-700 text-slate-500 transition-all duration-200'
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
                                  className='h-8 w-8 p-0 rounded-lg hover:bg-red-50 hover:text-red-700 text-slate-500 transition-all duration-200'
                                  title='Delete Purchase Order'>
                                  <Trash2 className='w-4 h-4' />
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
