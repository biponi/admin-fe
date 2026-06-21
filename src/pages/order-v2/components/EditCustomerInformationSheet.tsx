import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { IOrder } from "../types";
import { Edit3 } from "lucide-react";
import EditCustomerInformation from "@/pages/order/editOrderCustomer";
import { useIsMobile } from "@/hooks/use-mobile";

// Move this OUTSIDE OrderListV2, above the main component
const EditOrderPanelContent = ({
  selectedOrder,
  isEditDialogOpen,
  setEditDialogOpen,
  editOrderData,
  refreshOrders = () => {},
}: {
  selectedOrder: IOrder | null;
  isEditDialogOpen: boolean;
  setEditDialogOpen: (val: boolean) => void;
  editOrderData: any;
  refreshOrders?: () => void;
}) => {
  if (!selectedOrder) return null;

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      // Force remove any stuck overlay after close animation
      setTimeout(() => {
        document.body.style.pointerEvents = "";
        document.body.style.overflow = "";
        // Remove any lingering radix overlay portals
        document
          .querySelectorAll("[data-radix-popper-content-wrapper]")
          .forEach((el) => el.remove());
      }, 300);
    }
    setEditDialogOpen(val);
  };

  const isMobolie = useIsMobile();

  return (
    <>
      {!!isMobolie ? (
        <Drawer open={isEditDialogOpen} onOpenChange={handleOpenChange}>
          <DrawerContent className='flex flex-col max-h-[90vh] sm:hidden'>
            <DrawerHeader className='px-6 py-5 border-b'>
              <DrawerTitle className='text-base font-semibold text-slate-900 flex items-center gap-2.5'>
                <span className='inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-100'>
                  <Edit3 className='h-3.5 w-3.5 text-blue-600' />
                </span>
                Edit order details
              </DrawerTitle>
              <DrawerDescription className='text-slate-500 text-sm leading-relaxed'>
                Update customer info, shipping details, and payment data.{" "}
                <span className='text-amber-600 font-medium'>
                  Changes save immediately.
                </span>
              </DrawerDescription>
            </DrawerHeader>
            <div className='flex-1 overflow-y-auto'>
              <EditCustomerInformation
                notes={selectedOrder.notes ?? ""}
                customerInfo={selectedOrder.customer}
                shipping={selectedOrder.shipping}
                deliveryCharge={selectedOrder.deliveryCharge ?? 0}
                totalPrice={selectedOrder.totalPrice ?? 0}
                paid={selectedOrder.paid ?? 0}
                remaining={selectedOrder.remaining ?? 0}
                discount={selectedOrder.discount ?? 0}
                handleClose={() => setEditDialogOpen(false)}
                handleCustomerDataChange={(data) => {
                  if (selectedOrder?.id) {
                    editOrderData(
                      { ...data, id: selectedOrder.id },
                      (success: boolean) => {
                        if (success) {
                          if (!!refreshOrders) refreshOrders();
                          setEditDialogOpen(false);
                        }
                      },
                    );
                  }
                }}
              />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={isEditDialogOpen} onOpenChange={handleOpenChange}>
          <SheetContent
            className='p-0 flex-col hidden sm:flex'
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}>
            <SheetHeader className='px-6 py-5 border-b'>
              <SheetTitle className='text-base font-semibold text-slate-900 flex items-center gap-2.5'>
                <span className='inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-100'>
                  <Edit3 className='h-3.5 w-3.5 text-blue-600' />
                </span>
                Edit order details
              </SheetTitle>
              <SheetDescription className='text-slate-500 text-sm leading-relaxed'>
                Update customer info, shipping details, and payment data.{" "}
                <span className='text-amber-600 font-medium'>
                  Changes save immediately.
                </span>
              </SheetDescription>
            </SheetHeader>
            <div className='flex-1 overflow-y-auto'>
              <EditCustomerInformation
                notes={selectedOrder.notes ?? ""}
                customerInfo={selectedOrder.customer}
                shipping={selectedOrder.shipping}
                deliveryCharge={selectedOrder.deliveryCharge ?? 0}
                totalPrice={selectedOrder.totalPrice ?? 0}
                paid={selectedOrder.paid ?? 0}
                remaining={selectedOrder.remaining ?? 0}
                discount={selectedOrder.discount ?? 0}
                handleClose={() => setEditDialogOpen(false)}
                handleCustomerDataChange={(data) => {
                  if (selectedOrder?.id) {
                    editOrderData(
                      { ...data, id: selectedOrder.id },
                      (success: boolean) => {
                        if (success) {
                          refreshOrders();
                          setEditDialogOpen(false);
                        }
                      },
                    );
                  }
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default EditOrderPanelContent;
