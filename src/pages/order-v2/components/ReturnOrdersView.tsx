/**
 * ReturnOrdersView Component
 * Self-contained return orders view with stats, search, list, pagination, and detail panel.
 * Shown when the "Returns" tab is active in the V2 order list.
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { showOrderModal } from "../../../utils/orderModal";
import {
  getReturnOrders,
  searchReturnOrders,
  getReturnOrderStats,
} from "../../../api/order";
import { ReturnOrderStats } from "../../order/components/ReturnOrderStats";
import { ReturnOrderList } from "../../order/components/ReturnOrderList";
import { ReturnOrderDetailPanel } from "../../order/components/ReturnOrderDetailPanel";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type { IReturnOrder, IReturnOrderStats } from "../../order/interface";

interface ReturnOrdersViewProps {
  onBackToOrders?: () => void;
}

const ReturnOrdersView: React.FC<ReturnOrdersViewProps> = ({
  onBackToOrders,
}) => {
  const [returnOrders, setReturnOrders] = useState<IReturnOrder[]>([]);
  const [returnOrderStats, setReturnOrderStats] =
    useState<IReturnOrderStats | null>(null);
  const [returnOrderFetching, setReturnOrderFetching] = useState(false);
  const [totalReturnOrders, setTotalReturnOrders] = useState(0);
  const [returnTotalPages, setReturnTotalPages] = useState(0);
  const [returnCurrentPage, setReturnCurrentPage] = useState(1);
  const [returnSearchQuery, setReturnSearchQuery] = useState("");
  const [limit, setLimit] = useState(50);

  const [showReturnDetails, setShowReturnDetails] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] =
    useState<IReturnOrder | null>(null);

  const fetchReturnOrderList = useCallback(async () => {
    setReturnOrderFetching(true);
    try {
      const response = await getReturnOrders(limit, returnCurrentPage, "");
      if (response?.success && response?.data) {
        const {
          returnOrders: orders,
          totalReturnOrders: total,
          totalPages: pages,
          currentPage,
          returnOrderStats: stats,
        } = response.data;
        setReturnOrders(orders || []);
        setTotalReturnOrders(total || 0);
        setReturnTotalPages(pages || 0);
        if (currentPage !== returnCurrentPage)
          setReturnCurrentPage(Number(currentPage));
        setReturnOrderStats(stats || null);
      }
    } catch (error) {
      console.error("Error fetching return orders:", error);
    } finally {
      setReturnOrderFetching(false);
    }
  }, [limit, returnCurrentPage]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getReturnOrderStats();
      if (response?.success && response?.data) {
        setReturnOrderStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching return order stats:", error);
    }
  }, []);

  const searchReturnOrderByQuery = useCallback(async () => {
    try {
      const response = await searchReturnOrders(
        returnSearchQuery,
        "",
        limit,
        returnCurrentPage,
      );
      if (response?.success && response?.data) {
        const {
          returnOrders: orders,
          totalReturnOrders: total,
          totalPages: pages,
          currentPage,
          returnOrderStats: stats,
        } = response.data;
        setReturnOrders(orders || []);
        setTotalReturnOrders(total || 0);
        setReturnTotalPages(pages || 0);
        if (currentPage !== returnCurrentPage)
          setReturnCurrentPage(Number(currentPage));
        setReturnOrderStats(stats || null);
      }
    } catch (error) {
      console.error("Error searching return orders:", error);
    }
  }, [returnSearchQuery, limit, returnCurrentPage]);

  useEffect(() => {
    fetchReturnOrderList();
    fetchStats();
  }, []);

  useEffect(() => {
    if (returnCurrentPage === 1) return;
    fetchReturnOrderList();
  }, [returnCurrentPage]);

  useEffect(() => {
    if (returnSearchQuery === "") {
      setReturnCurrentPage(1);
      fetchReturnOrderList();
    } else {
      searchReturnOrderByQuery();
    }
  }, [returnSearchQuery]);

  useEffect(() => {
    setReturnCurrentPage(1);
  }, [limit]);

  return (
    <div className='flex flex-col h-full bg-white'>
      <div className='flex-1 overflow-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5'>
        {/* Stats */}
        <div className='mb-3 sm:mb-4'>
          <ReturnOrderStats stats={returnOrderStats} />
        </div>

        {/* Search + Actions */}
        <div className='mb-3 sm:mb-4 space-y-2 sm:space-y-0 flex justify-between items-center gap-2 sm:gap-3 flex-col sm:flex-row'>
          <div className='relative w-full sm:w-1/2 lg:w-1/3'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input
              type='text'
              placeholder='Search return orders...'
              value={returnSearchQuery}
              onChange={(event) => setReturnSearchQuery(event.target.value)}
              className='pl-10 pr-4 h-10 border-2 focus:border-orange-500 rounded-xl'
            />
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                fetchReturnOrderList();
                fetchStats();
              }}
              className='flex-1 sm:flex-none border-gray-300 hover:bg-gray-50'>
              <RefreshCw className='w-4 h-4 sm:mr-1.5' />
              <span className='hidden sm:inline'>Refresh</span>
            </Button>
            {onBackToOrders && (
              <Button
                variant='outline'
                size='sm'
                onClick={onBackToOrders}
                className='flex-1 sm:flex-none border-orange-300 text-orange-700 hover:bg-orange-50'>
                <ShoppingBag className='w-4 h-4 sm:mr-1.5' />
                <span className='hidden sm:inline'>Back to Orders</span>
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        {returnOrderFetching ? (
          <div className='flex flex-col items-center justify-center py-12'>
            <Loader2 className='w-8 h-8 text-orange-600 animate-spin mb-4' />
            <p className='text-gray-600 text-sm'>Loading return orders...</p>
          </div>
        ) : (
          <>
            <ReturnOrderList
              returnOrders={returnOrders}
              onViewDetails={(order) => {
                setSelectedReturnOrder(order);
                setShowReturnDetails(true);
              }}
            />

            {/* Pagination */}
            {returnOrders.length > 0 && (
              <div className='mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-between gap-3'>
                <div className='text-xs sm:text-sm text-gray-600'>
                  Showing{" "}
                  <span className='font-semibold'>
                    {(returnCurrentPage - 1) * limit + 1}-
                    {Math.min(returnCurrentPage * limit, totalReturnOrders)}
                  </span>{" "}
                  of <span className='font-semibold'>{totalReturnOrders}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Select
                    value={`${limit}`}
                    onValueChange={(value: string) =>
                      setLimit(parseInt(value, 10))
                    }>
                    <SelectTrigger className='w-20 sm:w-24 h-8 sm:h-9'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='10'>10</SelectItem>
                      <SelectItem value='50'>50</SelectItem>
                      <SelectItem value='100'>100</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className='flex gap-1 items-center'>
                    <Button
                      disabled={returnCurrentPage < 2}
                      variant='outline'
                      size='sm'
                      className='h-8 w-8 p-0'
                      onClick={() =>
                        setReturnCurrentPage(returnCurrentPage - 1)
                      }>
                      <ChevronLeft className='h-4 w-4' />
                    </Button>
                    <span className='text-xs text-gray-500 px-1'>
                      {returnCurrentPage}/{returnTotalPages}
                    </span>
                    <Button
                      disabled={returnCurrentPage >= returnTotalPages}
                      variant='outline'
                      size='sm'
                      className='h-8 w-8 p-0'
                      onClick={() =>
                        setReturnCurrentPage(returnCurrentPage + 1)
                      }>
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ReturnOrderDetailPanel
        isOpen={showReturnDetails}
        onClose={() => setShowReturnDetails(false)}
        returnOrder={selectedReturnOrder}
        onViewOriginalOrder={() => {
          if (selectedReturnOrder?.originalOrderNumber) {
            showOrderModal(selectedReturnOrder.originalOrderNumber);
          }
        }}
      />
    </div>
  );
};

export { ReturnOrdersView };
