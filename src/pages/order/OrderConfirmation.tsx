import React from "react";
import { useNavigate } from "react-router-dom";
import MainView from "../../coreComponents/mainView";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
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
} from "lucide-react";
import { useOrderConfirmation } from "./hooks/useOrderConfirmation";
import { OrderConfirmationCard } from "./components/OrderConfirmationCard";
import { CustomerVerificationDialog } from "./components/CustomerVerificationDialog";
import { CancelOrderDialog } from "./components/CancelOrderDialog";
import { useToast } from "../../components/ui/use-toast";

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
    toast({
      title: "Refreshed",
      description: "Order list has been updated",
    });
  };

  const handleOrderUpdated = async () => {
    await refresh();
  };

  return (
    <MainView title='Order Confirmation'>
      <>
        <div className='space-y-6 mx-4 md:mx-6'>
          {/* Header */}
          <div className='flex items-center justify-between px-4 py-2 bg-gray-100 rounded-lg shadow-md mt-2 md:mt-0'>
            <div className='flex items-center gap-4'>
              <Button
                variant='secondary'
                size='icon'
                className='bg-white'
                onClick={() => navigate("/order")}>
                <ChevronLeft className='h-5 w-5' />
              </Button>
              <div>
                <h1 className='text-base md:text-2xl font-bold'>
                  Order Confirmation
                </h1>
                <p className='text-sm text-muted-foreground hidden md:block'>
                  Verify processing orders before packaging
                </p>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Pending Confirmation
                </CardTitle>
                <Package className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{processingCount}</div>
                <p className='text-xs text-muted-foreground'>
                  Orders awaiting verification
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Current Page
                </CardTitle>
                <CheckCircle2 className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{orders.length}</div>
                <p className='text-xs text-muted-foreground'>
                  Page {currentPage + 1} of {totalPages}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Processing
                </CardTitle>
                <AlertCircle className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{totalCount}</div>
                <p className='text-xs text-muted-foreground'>
                  Orders in processing status
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>
                Showing {orders.length} of {totalCount} orders
              </span>
            </div>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>
                  Items per page:
                </span>
                <Select
                  value={String(limit)}
                  onValueChange={(value) => handleLimitChange(Number(value))}>
                  <SelectTrigger className='h-8 w-[100px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='6'>6</SelectItem>
                    <SelectItem value='12'>12</SelectItem>
                    <SelectItem value='24'>24</SelectItem>
                    <SelectItem value='48'>48</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>Sort by:</span>
                <Badge variant='outline'>Oldest First</Badge>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className='space-y-4'>
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className='p-4'>
                    <div className='space-y-4'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <Skeleton className='h-6 w-32 mb-2' />
                          <Skeleton className='h-4 w-48' />
                        </div>
                        <Skeleton className='h-6 w-20' />
                      </div>
                      <Skeleton className='h-16 w-full' />
                      <div className='flex gap-2'>
                        <Skeleton className='h-9 flex-1' />
                        <Skeleton className='h-9 flex-1' />
                        <Skeleton className='h-9 flex-1' />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className='py-12 text-center'>
                <Package className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-semibold mb-2'>
                  No Processing Orders
                </h3>
                <p className='text-sm text-muted-foreground'>
                  There are currently no orders awaiting confirmation.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 xl:gap-12 gap-8'>
              {orders.map((order) => (
                <OrderConfirmationCard
                  key={order.id}
                  order={order}
                  onConfirm={(order) => {
                    openVerificationDialog(order);
                  }}
                  onCancel={(order) => {
                    openCancelDialog(order);
                  }}
                  onOrderUpdated={handleOrderUpdated}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between'>
              <div className='text-sm text-muted-foreground'>
                Page {currentPage + 1} of {totalPages}
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || loading}>
                  Previous
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || loading}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Verification Dialog */}
        <CustomerVerificationDialog
          order={selectedOrder}
          open={verificationDialogOpen}
          onOpenChange={setVerificationDialogOpen}
          onConfirm={handleConfirmOrder}
          onCancel={closeDialogs}
          loading={loading}
        />

        {/* Cancel Dialog */}
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
