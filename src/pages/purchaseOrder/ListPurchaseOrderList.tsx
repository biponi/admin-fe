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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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

// Pagination Component
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}> = ({ currentPage, totalPages, onPageChange, isLoading = false }) => {
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
    <div className='flex items-center justify-center space-x-2 py-4'>
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
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();

  const [allPurchaseOrders, setAllPurchaseOrders] = useState<PurchaseOrder[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);

  // Pagination settings
  const itemsPerPage = 10;
  const totalPages = Math.ceil(allPurchaseOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPurchaseOrders = allPurchaseOrders.slice(startIndex, endIndex);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchPurchaseOrders();
      if (response) {
        // Handle both old and new response formats
        const orders = response.purchaseOrders || response || [];
        setAllPurchaseOrders(orders);
      } else {
        setAllPurchaseOrders([]);
      }
    } catch (err) {
      console.error(err);
      setAllPurchaseOrders([]);
      toast.error("Failed to fetch purchase orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deletePurchaseOrder(id);
      setAllPurchaseOrders((prev) => prev.filter((order) => order.id !== id));

      // Adjust current page if needed after deletion
      const newTotal = allPurchaseOrders.length - 1;
      const newTotalPages = Math.ceil(newTotal / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
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
      setAllPurchaseOrders((prev) => prev.filter((order) => order.id !== id));

      // Adjust current page if needed after restoration
      const newTotal = allPurchaseOrders.length - 1;
      const newTotalPages = Math.ceil(newTotal / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
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
                  className='flex items-center justify-between p-2 rounded-md bg-muted/50'>
                  <span className='text-sm font-medium truncate'>
                    {product.title}
                  </span>
                  <Badge variant='secondary' className='ml-2'>
                    x{product.quantity}
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
    <div className='container mx-auto p-6 space-y-6 '>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Purchase Orders</h1>
          <p className='text-muted-foreground'>
            Manage your purchase orders and track inventory
          </p>
        </div>
        {hasRequiredPermission("purchaseorder", "create") && (
          <Button onClick={() => navigate("/purchase-order/create")}>
            <Plus className='w-4 h-4 mr-2' />
            Create Purchase Order
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {!isLoading && allPurchaseOrders.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Orders
              </CardTitle>
              <Package className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {allPurchaseOrders.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Current Page
              </CardTitle>
              <Hash className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {currentPage} of {totalPages}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>This Page</CardTitle>
              <Package className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {currentPurchaseOrders.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Per Page</CardTitle>
              <Hash className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{itemsPerPage}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <PurchaseOrderSkeleton />
      ) : allPurchaseOrders.length === 0 ? (
        <EmptyState />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-32'>
                  <div className='flex items-center gap-2'>
                    <Hash className='w-4 h-4' />
                    Order #
                  </div>
                </TableHead>
                <TableHead>
                  <div className='flex items-center gap-2'>
                    <Package className='w-4 h-4' />
                    Products
                  </div>
                </TableHead>
                <TableHead className='w-32'>
                  <div className='flex items-center gap-2'>
                    <DollarSign className='w-4 h-4' />
                    Total
                  </div>
                </TableHead>
                <TableHead className='w-48'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='w-4 h-4' />
                    Created At
                  </div>
                </TableHead>
                {hasSomePermissionsForPage("purchaseorder", [
                  "edit",
                  "delete",
                ]) && (
                  <TableHead className='w-24 text-center'>Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPurchaseOrders.map((order) => (
                <TableRow key={order.id} className='group'>
                  <TableCell className='font-mono'>
                    #{order.purchaseNumber}
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1'>
                      {order.products?.length > 2 ? (
                        <>
                          {order.products.slice(0, 2).map((product, index) => (
                            <div
                              key={index}
                              className='flex items-center gap-2 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm'>
                              <span className='font-medium truncate max-w-24'>
                                {product.title}
                              </span>
                              <Badge variant='secondary' className='text-xs'>
                                x{product.quantity}
                              </Badge>
                            </div>
                          ))}
                          {renderProductsPopover(order)}
                        </>
                      ) : (
                        order.products?.map((product, index) => (
                          <div
                            key={index}
                            className='flex items-center gap-2 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm'>
                            <span className='font-medium truncate max-w-32'>
                              {product.title}
                            </span>
                            <Badge variant='secondary' className='text-xs'>
                              x{product.quantity}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='font-semibold'>
                    ৳{order.totalAmount?.toLocaleString()}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
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
                      <div className='flex items-center justify-center gap-1'>
                        {hasRequiredPermission("purchaseorder", "edit") && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              navigate(`/purchase-order/update/${order.id}`)
                            }
                            className='text-green-600 bg-green-50 hover:text-green-700 hover:bg-green-50'
                            title='Edit Purchase Order'>
                            <Edit className='w-4 h-4' />
                          </Button>
                        )}

                        {hasRequiredPermission("purchaseorder", "edit") && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                disabled={isRestoring === order.id}
                                className='text-blue-600 bg-blue-50 hover:text-blue-700 hover:bg-blue-50'
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
                                  Are you sure you want to restore this purchase
                                  order? This will make it active again.
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
                            variant='ghost'
                            size='sm'
                            disabled={isDeleting === order.id}
                            onClick={() => handleDelete(order.id)}
                            className='text-red-600 bg-red-50 hover:text-red-700 hover:bg-red-50'
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

      {/* Pagination */}
      {!isLoading && allPurchaseOrders.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={false}
        />
      )}
    </div>
  );
};

export default ListPurchaseOrders;
