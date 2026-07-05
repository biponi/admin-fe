import { useEffect } from "react";
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
  const isMobolie = useIsMobile();

  useEffect(() => {
    if (!isEditDialogOpen) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "";
        document.body.style.overflow = "";
        document.querySelectorAll("[data-radix-portal] > div").forEach((el) => {
          if (
            el.getAttribute("data-state") === "closed" ||
            el.querySelector("[data-state='closed']")
          ) {
            el.remove();
          }
        });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isEditDialogOpen]);

  if (!selectedOrder) return null;

  const handleOpenChange = (val: boolean) => {
    setEditDialogOpen(val);
  };

  return (
    <>
      {!!isMobolie ? (
        <Drawer open={isEditDialogOpen} onOpenChange={handleOpenChange}>
          <DrawerContent className='flex flex-col max-h-[90vh] sm:hidden'>
            <DrawerHeader className='px-6 py-4 border-b bg-muted/30'>
              <DrawerTitle className='text-base font-semibold text-slate-900 flex items-center gap-2.5'>
                <span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 shadow-sm ring-1 ring-blue-200/60'>
                  <Edit3 className='h-4 w-4 text-blue-600' />
                </span>
                Edit order details
              </DrawerTitle>
              <DrawerDescription className='text-slate-500 text-sm leading-snug'>
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
                          setEditDialogOpen(false);
                          setTimeout(() => {
                            if (!!refreshOrders) refreshOrders();
                          }, 400);
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
            <SheetHeader className='px-6 py-4 border-b bg-muted/30'>
              <SheetTitle className='text-base font-semibold text-slate-900 flex items-center gap-2.5'>
                <span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 shadow-sm ring-1 ring-blue-200/60'>
                  <Edit3 className='h-4 w-4 text-blue-600' />
                </span>
                Edit order details
              </SheetTitle>
              <SheetDescription className='text-slate-500 text-sm leading-snug'>
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
                          setEditDialogOpen(false);
                          setTimeout(() => {
                            if (!!refreshOrders) refreshOrders();
                          }, 400);
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
