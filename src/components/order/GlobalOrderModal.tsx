import { useEffect } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
} from '../ui/drawer';
import { Button } from '../ui/button';
import { Tabs, TabsContent as UITabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { X, RefreshCw } from 'lucide-react';
import { useOrderModalStore } from '../../store/orderModalStore';
import { useOrderDetails } from '../../hooks/useOrderDetails';
import { OrderOverview } from './OrderOverview';
import { OrderProducts } from './OrderProducts';
import { OrderPayment } from './OrderPayment';
import { OrderTimeline } from './OrderTimeline';
import { OrderAudit } from './OrderAudit';
import DefaultLoading from '../../coreComponents/defaultLoading';
import { ScrollArea } from '../ui/scroll-area';

export const GlobalOrderModal = () => {
  const isMobile = useIsMobile();
  const { isOpen, orderNumber, closeModal } = useOrderModalStore();
  const { order, loading, fetchOrder, refresh, clearOrder } = useOrderDetails();

  useEffect(() => {
    if (isOpen && orderNumber) {
      fetchOrder(orderNumber);
    } else if (!isOpen) {
      clearOrder();
    }
  }, [isOpen, orderNumber, fetchOrder, clearOrder]);

  const handleRefresh = async () => {
    await refresh();
  };

  const handleClose = () => {
    closeModal();
    clearOrder();
  };

  const HeaderContent = () => (
    <div className="flex items-center justify-between">
      <div>
        <DialogTitle className="text-2xl">
          {order ? `Order #${order.orderNumber}` : 'Loading...'}
        </DialogTitle>
        {order && (
          <p className="text-sm text-gray-500 mt-1 capitalize">
            Status: {order.status}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={loading || !order}
          title="Refresh order data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const OrderTabsContent = () => (
    <>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <DefaultLoading />
        </div>
      ) : order ? (
        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="products" className="text-sm">Products</TabsTrigger>
            <TabsTrigger value="payment" className="text-sm">Payment</TabsTrigger>
            <TabsTrigger value="timeline" className="text-sm">Timeline</TabsTrigger>
            <TabsTrigger value="audit" className="text-sm">Audit</TabsTrigger>
          </TabsList>

          <UITabsContent value="overview" className="mt-4">
            <ScrollArea className="h-[calc(90vh-220px)] pr-4">
              <OrderOverview order={order} />
            </ScrollArea>
          </UITabsContent>

          <UITabsContent value="products" className="mt-4">
            <ScrollArea className="h-[calc(90vh-220px)] pr-4">
              <OrderProducts order={order} />
            </ScrollArea>
          </UITabsContent>

          <UITabsContent value="payment" className="mt-4">
            <ScrollArea className="h-[calc(90vh-220px)] pr-4">
              <OrderPayment order={order} />
            </ScrollArea>
          </UITabsContent>

          <UITabsContent value="timeline" className="mt-4">
            <ScrollArea className="h-[calc(90vh-220px)] pr-4">
              <OrderTimeline order={order} />
            </ScrollArea>
          </UITabsContent>

          <UITabsContent value="audit" className="mt-4">
            <ScrollArea className="h-[calc(90vh-220px)] pr-4">
              <OrderAudit order={order} />
            </ScrollArea>
          </UITabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No order data available</p>
        </div>
      )}
    </>
  );

  // Mobile: Use Drawer
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[95vh]">
          <ScrollArea className="px-4 h-full">
            <DrawerHeader className="pb-4">
              <HeaderContent />
            </DrawerHeader>
            <OrderTabsContent />
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use Dialog
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="p-6">
          <DialogHeader>
            <HeaderContent />
          </DialogHeader>
        </div>
        <div className="px-6 pb-6">
          <OrderTabsContent />
        </div>
      </DialogContent>
    </Dialog>
  );
};
