import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
} from "lucide-react";
import { useCourierOrders } from "./hooks/useCourierOrders";
import { useCourierActions } from "./hooks/useCourierActions";
import CourierOrderCard from "./components/CourierOrderCard";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { CourierOrder } from "../../services/courierApi";
import { DeliveryStatus } from "./types";
import DeliveryTimeline from "./components/DeliveryTimeline";
import { ScrollArea } from "../../components/ui/scroll-area";

export const CourierOrdersList: React.FC = () => {
  const {
    orders,
    pagination,
    isLoading,
    error,
    currentPage,
    pageLimit,
    provider,
    statusFilter,
    searchQuery,
    nextPage,
    prevPage,
    changeLimit,
    filterByProvider,
    filterByStatus,
    search,
    clearFilters,
    refresh,
  } = useCourierOrders();

  const { checkDeliveryStatus } = useCourierActions();

  const [searchInput, setSearchInput] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<CourierOrder | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState<boolean>(false);
  const [deliveryStatusData, setDeliveryStatusData] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);

  const handleSearch = () => {
    search(searchInput);
  };

  const handleViewDetails = async (order: CourierOrder) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
    setIsLoadingStatus(true);
    setDeliveryStatusData(null);

    // Fetch real-time delivery status
    try {
      const statusData = await checkDeliveryStatus(
        order.consignmentId,
        order?.provider,
        "consignment"
      );
      setDeliveryStatusData(statusData);
    } catch (error) {
      console.error("Failed to fetch delivery status:", error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // Create timeline from current order status and fetched status data
  const createTimeline = () => {
    if (!selectedOrder) return [];

    const timeline = [];

    // Add creation entry
    timeline.push({
      status: "pending" as DeliveryStatus,
      timestamp: selectedOrder.timestamps.createdAt,
      location: "",
      remarks: "Courier order created",
      updatedBy: "system" as const,
    });

    // Add current status if different from pending
    if (selectedOrder.deliveryStatus !== "pending") {
      timeline.push({
        status:
          (selectedOrder.deliveryStatus as DeliveryStatus) ||
          ("unknown" as DeliveryStatus),
        timestamp: selectedOrder.timestamps.updatedAt,
        location: deliveryStatusData?.location || "",
        remarks: deliveryStatusData?.remarks || "Status updated",
        updatedBy: "webhook" as const,
      });
    }

    // Sort by timestamp descending (newest first)
    return timeline.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const renderSearchBar = () => {
    return (
      <div className='flex flex-col md:flex-row gap-4 mb-6'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <Input
            type='text'
            placeholder='Search by invoice, consignment ID, tracking code, name, or phone...'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className='pl-10 pr-4'
          />
        </div>
        <Button onClick={handleSearch} className='gap-2'>
          <Search className='w-4 h-4' />
          Search
        </Button>
      </div>
    );
  };

  const renderFilters = () => {
    return (
      <div className='flex flex-col md:flex-row gap-4 mb-6'>
        <Select
          value={statusFilter || "all"}
          onValueChange={(val) => filterByStatus(val === "all" ? "" : val)}>
          <SelectTrigger className='w-full md:w-[200px]'>
            <SelectValue placeholder='All Statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Delivery Status</SelectLabel>
              <SelectItem value='all'>All Statuses</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='in_transit'>In Transit</SelectItem>
              <SelectItem value='delivered'>Delivered</SelectItem>
              <SelectItem value='cancelled'>Cancelled</SelectItem>
              <SelectItem value='hold'>On Hold</SelectItem>
              <SelectItem value='in_review'>In Review</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={provider || "all"}
          onValueChange={(val) => filterByProvider(val === "all" ? "" : val)}>
          <SelectTrigger className='w-full md:w-[200px]'>
            <SelectValue placeholder='All Couriers' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Couriers</SelectLabel>
              <SelectItem value='all'>All Couriers</SelectItem>
              <SelectItem value='pathao'>Pathao</SelectItem>
              <SelectItem value='steadfast'>Steadfast</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className='flex gap-2 flex-1 md:flex-none'>
          <Button variant='outline' onClick={clearFilters} className='flex-1'>
            Clear Filters
          </Button>
          <Button onClick={refresh} className='flex-1 gap-2'>
            <RefreshCw className='w-4 h-4' />
            Refresh
          </Button>
        </div>
      </div>
    );
  };

  const renderLoading = () => {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className='p-4'>
              <Skeleton className='h-64 w-full' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderError = () => {
    return (
      <Card className='border-red-200 bg-red-50'>
        <CardContent className='p-6 text-center'>
          <p className='text-red-600 mb-4'>{error}</p>
          <Button onClick={refresh} variant='outline' className='gap-2'>
            <RefreshCw className='w-4 h-4' />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderEmptyState = () => {
    return (
      <Card className='border-dashed border-2'>
        <CardContent className='flex flex-col items-center justify-center py-16 text-center'>
          <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6'>
            <Package className='w-10 h-10 text-gray-400' />
          </div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>
            {searchQuery ? "No Orders Found" : "No Courier Orders Yet"}
          </h3>
          <p className='text-gray-600 mb-6 max-w-sm'>
            {searchQuery
              ? `No courier orders match your search for "${searchQuery}".`
              : "You haven't created any courier orders yet."}
          </p>
          {searchQuery && (
            <Button
              onClick={() => {
                setSearchInput("");
                search("");
              }}
              variant='outline'>
              Clear Search
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderPagination = () => {
    return (
      <CardFooter className='flex flex-col sm:flex-row justify-between items-center gap-4 mt-4'>
        <div className='text-sm text-gray-600'>
          Showing{" "}
          <span className='font-semibold'>
            {(currentPage - 1) * pageLimit + 1}-
            {Math.min(currentPage * pageLimit, pagination.total)}
          </span>{" "}
          of <span className='font-semibold'>{pagination.total}</span> orders
        </div>
        <div className='flex items-center gap-2'>
          <Select
            value={`${pageLimit}`}
            onValueChange={(value) => changeLimit(parseInt(value))}>
            <SelectTrigger className='w-24'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Per page</SelectLabel>
                <SelectItem value='10'>10</SelectItem>
                <SelectItem value='20'>20</SelectItem>
                <SelectItem value='50'>50</SelectItem>
                <SelectItem value='100'>100</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className='flex gap-1'>
            <Button
              disabled={currentPage <= 1}
              variant='outline'
              size='sm'
              onClick={prevPage}>
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              disabled={currentPage >= pagination.totalPages}
              variant='outline'
              size='sm'
              onClick={nextPage}>
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardFooter>
    );
  };

  const renderDetailsDialog = () => {
    if (!selectedOrder) return null;

    const timeline = createTimeline();

    return (
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className='max-w-2xl max-h-[90vh]'>
          <DialogHeader>
            <DialogTitle>
              Order #{selectedOrder.orderNumber} - Delivery Details
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className='h-[70vh] pr-4'>
            <div className='space-y-6'>
              {/* Order Info */}
              <CourierOrderCard
                order={selectedOrder}
                onViewDetails={undefined}
              />

              {/* Delivery Status Info */}
              {deliveryStatusData && (
                <Card className='bg-blue-50 border-blue-200'>
                  <CardContent className='p-4'>
                    <h4 className='font-semibold text-blue-900 mb-2'>
                      Latest Status Update
                    </h4>
                    <div className='space-y-1 text-sm'>
                      <p className='text-blue-800'>
                        <span className='font-medium'>Status:</span>{" "}
                        {deliveryStatusData.delivery_status}
                      </p>
                      {deliveryStatusData.location && (
                        <p className='text-blue-800'>
                          <span className='font-medium'>Location:</span>{" "}
                          {deliveryStatusData.location}
                        </p>
                      )}
                      {deliveryStatusData.remarks && (
                        <p className='text-blue-800'>
                          <span className='font-medium'>Remarks:</span>{" "}
                          {deliveryStatusData.remarks}
                        </p>
                      )}
                      <p className='text-blue-600 text-xs mt-2'>
                        Last updated:{" "}
                        {new Date(
                          deliveryStatusData.updated_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              <div>
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                  <Package className='w-5 h-5' />
                  Delivery Timeline
                </h3>
                <p className='text-sm text-gray-600 mb-4'>
                  Track the delivery status updates for this order.
                </p>

                {isLoadingStatus ? (
                  <div className='flex items-center justify-center py-8'>
                    <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
                    <span className='ml-3 text-gray-600'>
                      Fetching latest status...
                    </span>
                  </div>
                ) : timeline.length > 0 ? (
                  <DeliveryTimeline
                    timeline={timeline}
                    provider={selectedOrder?.provider}
                  />
                ) : (
                  <div className='text-center text-gray-500 py-8 bg-gray-50 rounded-lg border-2 border-dashed'>
                    <Package className='w-12 h-12 mx-auto mb-3 text-gray-400' />
                    <p>No timeline data available yet.</p>
                    <p className='text-sm mt-2'>
                      Status updates will appear here as the order progresses.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle>Courier Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {renderSearchBar()}
            {renderFilters()}
            {renderLoading()}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle>Courier Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {renderSearchBar()}
            {renderFilters()}
            {renderError()}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <Package className='w-5 h-5' />
              Courier Orders
            </CardTitle>
            <p className='text-sm text-gray-600'>
              Total: {pagination.total} orders
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {renderSearchBar()}
          {renderFilters()}

          {orders.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {orders.map((order, index) => (
                  <CourierOrderCard
                    key={index}
                    order={order}
                    onViewDetails={() => handleViewDetails(order)}
                  />
                ))}
              </div>
              {renderPagination()}
            </>
          )}
        </CardContent>
      </Card>

      {renderDetailsDialog()}
    </div>
  );
};

export default CourierOrdersList;
