import React, { useEffect, useState } from "react";
import {
  deletePurchaseOrder,
  fetchPurchaseOrders,
  restorePurchaseOrder,
} from "./services/purchaseOrderApi";
import { PurchaseOrder } from "./types";
import { Button } from "../../components/ui/button";
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
          <Button variant='outline' size='sm' className='h-8'>
            +{remainingProducts.length} more
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80'>
          <div className='space-y-2'>
            <h4 className='font-medium text-sm'>Additional Products</h4>
            <div className='grid gap-2 max-h-48 overflow-y-auto'>
              {remainingProducts.map((product, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-2 rounded-md bg-primary/10'>
                  <span className='text-sm font-medium truncate'>
                    {!!product.title
                      ? product.title.toUpperCase().split(" ")[0]
                      : product.title}
                    <Badge
                      variant='secondary'
                      className='text-xs bg-sky-100 text-sky-600 mx-1 shadow'>
                      {!!product.title
                        ? product.title.split(" ").slice(1).join(" ") || "N/A"
                        : product.title}
                    </Badge>
                  </span>
                  <Badge variant='secondary' className='ml-2'>
                    {product.quantity}
                  </Badge>
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
    <div className="w-full mx-auto p-6 space-y-6">
      {/* Header - Mobile */}
      {isMobile ? (
        <MobilePurchaseOrderHeader totalOrders={totalDocs} />
      ) : (
        /* Header - Desktop */
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Purchase Orders{" "}
              <Badge
                variant={"secondary"}
                className="text-base font-medium text-orange-500 bg-orange-100">
                <Logs className="w-5 h-5 mr-2" /> {totalDocs}
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Manage your purchase orders and track inventory
            </p>
          </div>
          {hasRequiredPermission("purchaseorder", "create") && (
            <Button onClick={handleCreateOrder}>
              <Plus className="w-4 h-4 mr-2" />
              Create Purchase Order
            </Button>
          )}
        </div>
      )}

      {/* Content - Mobile View */}
      {isMobile ? (
        <div className="space-y-3 pb-safe">
          {isLoading ? (
            <MobilePurchaseOrderSkeleton />
          ) : allPurchaseOrders.length === 0 ? (
            <MobilePurchaseOrderEmpty onCreateOrder={handleCreateOrder} />
          ) : (
            <>
              <div className="space-y-3">
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
                <div className="flex items-center justify-between gap-2 pt-4 px-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1 || isLoading}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="flex-1">
                    ← Previous
                  </Button>
                  <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                    {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages || isLoading}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="flex-1">
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
              className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white z-50 flex items-center justify-center">
              <Plus className="h-6 w-6" />
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
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Order #
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Products
                      </div>
                    </TableHead>
                    <TableHead className="w-32">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Total
                      </div>
                    </TableHead>
                    <TableHead className="w-48">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Created At
                      </div>
                    </TableHead>
                    {hasSomePermissionsForPage("purchaseorder", [
                      "edit",
                      "delete",
                    ]) && <TableHead className="w-24 text-center">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPurchaseOrders.map((order) => (
                    <TableRow key={order.id} className="group">
                      <TableCell className="font-mono">
                        #{order.purchaseNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {order.products?.length > 2 ? (
                            <>
                              {order.products.slice(0, 2).map((product, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                                  <span className="font-medium truncate max-w-48">
                                    {!!product.title
                                      ? product.title.toUpperCase().split(" ")[0]
                                      : product.title}
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-sky-100 text-sky-600 mx-1 shadow">
                                      {!!product.title
                                        ? product.title
                                            .split(" ")
                                            .slice(1)
                                            .join(" ") || "N/A"
                                        : product.title}
                                    </Badge>
                                  </span>
                                  <Badge variant="secondary" className="text-xs">
                                    {product.quantity}
                                  </Badge>
                                </div>
                              ))}
                              {renderProductsPopover(order)}
                            </>
                          ) : (
                            order.products?.map((product, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                                <span className="font-medium truncate max-w-48">
                                  {!!product.title
                                    ? product.title.toUpperCase().split(" ")[0]
                                    : product.title}
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-sky-100 text-sky-600 mx-1 shadow">
                                    {!!product.title
                                      ? product.title
                                          .split(" ")
                                          .slice(1)
                                          .join(" ") || "N/A"
                                      : product.title}
                                  </Badge>
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {product.quantity}
                                </Badge>
                              </div>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ৳{order.totalAmount?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      {hasSomePermissionsForPage("purchaseorder", [
                        "edit",
                        "delete",
                      ]) && (
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            {hasRequiredPermission("purchaseorder", "edit") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate(`/purchase-order/update/${order.id}`)
                                }
                                className="text-green-600 bg-green-50 hover:text-green-700 hover:bg-green-50"
                                title="Edit Purchase Order">
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}

                            {hasRequiredPermission("purchaseorder", "edit") && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isRestoring === order.id}
                                    className="text-blue-600 bg-blue-50 hover:text-blue-700 hover:bg-blue-50"
                                    title="Restore Purchase Order">
                                    <ArchiveRestore className="w-4 h-4" />
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
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
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

                            {hasRequiredPermission("purchaseorder", "delete") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isDeleting === order.id}
                                onClick={() => handleDelete(order.id)}
                                className="text-red-600 bg-red-50 hover:text-red-700 hover:bg-red-50"
                                title="Delete Purchase Order">
                                <Trash2 className="w-4 h-4" />
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
    </div>
  );
};

export default ListPurchaseOrders;
