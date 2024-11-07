import {
  Check,
  CheckCircleIcon,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  MinusCircleIcon,
  TimerReset,
  Trash2,
  TruckIcon,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent } from "../../components/ui/tabs";
import dayjs from "dayjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useOrderList } from "./hooks/useOrderList";
import SingleItem from "./components/SingleOrderItem";
import EmptyView from "../../coreComponents/emptyView";
import DefaultLoading from "../../coreComponents/defaultLoading";
import { useEffect, useState } from "react";
import { Input } from "../../components/ui/input";
import useDebounce from "../../customHook/useDebounce";
import { IOrder } from "./interface";
import { useNavigate } from "react-router-dom";
import { Progress } from "../../components/ui/progress";
import { Separator } from "../../components/ui/separator";
import EditCustomerInformation from "./editOrderCustomer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import useOrder from "./hooks/useOrder";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";

import CustomAlertDialog from "../../coreComponents/OptionModal";
import useLoginAuth from "../auth/hooks/useLoginAuth";
import { generateInvoice } from "../../utils/invoiceGenerator";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../../components/ui/drawer";
import UpdateProductData from "./updateProductData";

const OrderList = () => {
  const {
    limit,
    refresh,
    orderFetching,
    orders,
    currentPageNum,
    totalPages,
    analytics,
    bulkOrders,
    totalOrders,
    getOrderList,
    setBulkOrders,
    setSearchQuery,
    updateCurrentPage,
    deleteOrderData,
    performOrderBulkUpdate,
  } = useOrderList();

  const { user } = useLoginAuth();

  const { editOrderData, updateOrderStatus } = useOrder();

  const [isCopied, setIsCopied] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [bulkAction, setBulkAction] = useState<string>("");
  const [isEditDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [modifyDialogOpen, setModifyDialogOpen] = useState<boolean>(false);

  const debounceHandler = useDebounce(inputValue, 500);

  useEffect(() => {
    if (!!orders && orders.length > 0) setSelectedOrder(orders[0]);
  }, [orders]);

  useEffect(() => {
    setSearchQuery(inputValue);
    //eslint-disable-next-line
  }, [debounceHandler]);

  const handleCopy = () => {
    if (!selectedOrder) return;
    const trackUrl = `https://priorbd.com/order/${selectedOrder?.id}`;
    navigator.clipboard.writeText(trackUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Hide "Copied!" after 2 seconds
    });
  };

  const navigate = useNavigate();

  const handleGenerateInvoice = async () => {
    if (!!selectedOrder) await generateInvoice(selectedOrder);
  };

  const renderEmptyView = () => {
    return (
      <EmptyView
        title="You have no orders"
        description="You can start selling as soon as you add a product."
        buttonText="Create Order"
        handleButtonClick={() => navigate("/order/create")}
      />
    );
  };

  const renderProductListView = () => {
    return (
      <Tabs defaultValue="all">
        {drawerDialog()}
        <div className="flex items-center w-full">
          <div className="grid gap-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {user?.role === "admin" && (
              <Card x-chunk="dashboard-05-chunk-0">
                <CardHeader className="pb-3">
                  <CardTitle>Your Orders</CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-relaxed">
                    Introducing Our Dynamic Orders Dashboard for Seamless
                    Management and Insightful Analysis.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => navigate("/order/create")}>
                    Create New Order
                  </Button>
                </CardFooter>
              </Card>
            )}
            {user?.role === "admin" && (
              <Card x-chunk="dashboard-05-chunk-1">
                <CardHeader className="pb-2">
                  <CardDescription>This Month Completed Orders</CardDescription>
                  <CardTitle className="text-4xl">
                    {analytics.totalCompletedOrders}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    last 30 days
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={25} aria-label="25% increase" />
                </CardFooter>
              </Card>
            )}
            {user?.role === "admin" && (
              <Card x-chunk="dashboard-05-chunk-2">
                <CardHeader className="pb-2">
                  <CardDescription>Total Paid</CardDescription>
                  <CardTitle className="text-4xl">
                    {analytics.totalPaid}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    last 30 days
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={12} aria-label="12% increase" />
                </CardFooter>
              </Card>
            )}
            {user?.role === "admin" && (
              <Card x-chunk="dashboard-05-chunk-2">
                <CardHeader className="pb-2">
                  <CardDescription>Total Price Of Order</CardDescription>
                  <CardTitle className="text-4xl">
                    {analytics.totalPrice}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    last 30 days
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={12} aria-label="12% increase" />
                </CardFooter>
              </Card>
            )}
          </div>
          {/* <div className='ml-auto flex items-center gap-2'>
            <Button
              size='sm'
              className='h-7 gap-1'
              onClick={() => navigate("/order/create")}>
              <PlusCircle className='h-3.5 w-3.5' />
              <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
                Add Product
              </span>
            </Button>
          </div> */}
        </div>
        <div className="grid grid-1 md:grid-cols-3 md:gap-4">
          <div className="md:col-span-2">
            <Card x-chunk="dashboard-06-chunk-0" className="mt-4">
              <CardHeader>
                <div className="flex w-full justify-between">
                  <div className="mr-auto">
                    <CardTitle>Order</CardTitle>
                    <CardDescription>
                      Manage your orders and view your sales performance.
                    </CardDescription>
                  </div>
                  <div className="ml-auto grid grid-cols-2 gap-4 sm:flex sm:justify-between sm:items-center">
                    <Input
                      type="text"
                      placeholder="Search"
                      onChange={(event) => {
                        setInputValue(event.target.value);
                      }}
                    />
                    {user?.role !== "admin" && (
                      <Button onClick={() => navigate("/order/create")}>
                        Create New Order
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TabsContent value="all">
                  <div className="max-h-[50vh] overflow-y-auto">
                    <Table>
                      <TableHeader className=" sticky  ">
                        <TableRow>
                          <TableHead>
                            <input
                              className="border-gray-200 rounded-lg text-primary"
                              type="checkbox"
                              onChange={(event) => {
                                const check = event?.target?.checked;
                                setBulkOrders(
                                  check
                                    ? orders?.map((order: IOrder) => order?.id)
                                    : []
                                );
                              }}
                            />
                          </TableHead>
                          <TableHead className="hidden w-[100px] sm:table-cell">
                            NO.
                          </TableHead>
                          <TableHead>Customer Name</TableHead>
                          <TableHead>Phone Number</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden md:table-cell">
                            District
                          </TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="hidden md:table-cell">
                            Paid
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Remaining
                          </TableHead>
                          <TableHead className="hidden ">
                            Last Updated at
                          </TableHead>
                          <TableHead>
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {!!orders &&
                          orders.map((order: IOrder, index: number) => (
                            <SingleItem
                              key={index}
                              orderNumber={order?.orderNumber}
                              id={`${order?.id}`}
                              paid={order?.paid}
                              status={order?.status}
                              isBulkAdded={bulkOrders.includes(order?.id)}
                              handleBulkCheck={(val: boolean) => {
                                val
                                  ? setBulkOrders([...bulkOrders, order?.id])
                                  : setBulkOrders(
                                      bulkOrders.filter((b) => b !== order?.id)
                                    );
                              }}
                              district={order?.shipping.district}
                              totalPrice={order?.totalPrice ?? 0}
                              remaining={order?.remaining}
                              customerName={order?.customer?.name}
                              CustomerPhoneNumber={order?.customer?.phoneNumber}
                              handleUpdateOrder={() => {
                                setSelectedOrder(order);
                                setEditDialogOpen(true);
                              }}
                              handleModifyProduct={() => {
                                setSelectedOrder(order);
                                setModifyDialogOpen(true);
                              }}
                              handleViewDetails={() => {
                                setSelectedOrder(order);
                              }}
                              deleteExistingOrder={deleteOrderData}
                              updatedAt={order?.timestamps?.updatedAt}
                            />
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </CardContent>
              {inputValue === "" && (
                <CardFooter>
                  <div className="w-full flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      Showing{" "}
                      <strong>{`${
                        (Number(currentPageNum) - 1) * limit + 1
                      }-${Math.min(
                        Number(currentPageNum) * limit,
                        totalOrders
                      )}`}</strong>{" "}
                      of <strong>{totalOrders}</strong> orders
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button
                        disabled={currentPageNum < 2}
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateCurrentPage(-1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                      </Button>

                      <Button
                        disabled={currentPageNum >= totalPages}
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateCurrentPage(1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next</span>
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
          {(!bulkOrders || bulkOrders?.length < 1) && (
            <div className="mt-4">{renderOrderDetailsPanel()}</div>
          )}
          {!!bulkOrders && bulkOrders.length > 0 && (
            <div className="mt-4">{renderBulkActionPanel()}</div>
          )}
        </div>
      </Tabs>
    );
  };

  const renderOrderDetailsPanel = () => {
    return (
      <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
        <CardHeader className="flex flex-row items-start bg-muted/50">
          <div className="grid gap-0.5">
            <CardTitle className="group flex items-center gap-2 text-lg w-full">
              Order #{selectedOrder?.orderNumber}
              {selectedOrder?.status === "processing" && (
                <CustomAlertDialog
                  title="Order Status Change"
                  description="Are You Sure Change the status to SHIPPED???"
                  cancelButtonText="NO"
                  submitButtonText="YES"
                  onSubmit={() => {
                    updateOrderStatus(`${selectedOrder?.id}`, "shipped", () =>
                      refresh()
                    );
                  }}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 "
                        >
                          <TruckIcon className="h-3 w-3" />
                          <span className="sr-only">Copy Order ID</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Change Status to shipped</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CustomAlertDialog>
              )}
              {selectedOrder?.status === "shipped" && (
                <CustomAlertDialog
                  title="Order Status Change"
                  description="Are You Sure Change the status to Complete???"
                  cancelButtonText="NO"
                  submitButtonText="YES"
                  onSubmit={() => {
                    updateOrderStatus(`${selectedOrder?.id}`, "completed", () =>
                      refresh()
                    );
                  }}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 "
                        >
                          <CheckCircleIcon className="h-3 w-3" />
                          <span className="sr-only">Copy Order ID</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Complete the order</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CustomAlertDialog>
              )}
              {selectedOrder?.status !== "processing" && (
                <CustomAlertDialog
                  title="Order Status Change"
                  description="Are You Sure Change the status to Processing??? Use for return or other"
                  cancelButtonText="NO"
                  submitButtonText="YES"
                  onSubmit={() => {
                    updateOrderStatus(
                      `${selectedOrder?.id}`,
                      "processing",
                      () => refresh()
                    );
                  }}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 "
                        >
                          <TimerReset className="h-3 w-3" />
                          <span className="sr-only">Copy Order ID</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Reset the order to processing
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CustomAlertDialog>
              )}
              <div className="ml-auto">
                {" "}
                <Button
                  size="sm"
                  variant="outline"
                  className="float-right ml-auto"
                  onClick={() => handleGenerateInvoice()}
                >
                  Invoice
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              <span className="text-sm font-medium text-gray-500 block mt-2 mb-1">
                Track Id: {selectedOrder?.id}
                <button
                  onClick={handleCopy}
                  className="ml-2 relative inline-flex items-center"
                  title="Copy URL"
                >
                  {isCopied ? (
                    <Check size={18} className="text-green-500" />
                  ) : (
                    <Clipboard
                      size={18}
                      className="text-gray-500 hover:text-gray-700"
                    />
                  )}
                  {isCopied && (
                    <span className="absolute -top-3 left-5 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                      Copied!
                    </span>
                  )}
                </button>
              </span>
              Date:{" "}
              {dayjs(selectedOrder?.timestamps.createdAt).format(
                "MMMM D, YYYY"
              )}
            </CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {/* <Button size='sm' variant='outline' className='h-8 gap-1'>
              <Truck className='h-3.5 w-3.5' />
              <span className='lg:sr-only xl:not-sr-only xl:whitespace-nowrap'>
                Track Order
              </span>
            </Button> */}
          </div>
        </CardHeader>
        <CardContent className="p-6 text-sm">
          <div className="grid gap-3">
            <div className="font-semibold">Order Details</div>
            <ul className="grid gap-3">
              {selectedOrder?.products.map((product, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {product?.name} x <span>{product?.quantity}</span>
                  </span>
                  <span>{product?.totalPrice}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-2" />
            <ul className="grid gap-3">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{selectedOrder?.totalPrice}</span>
              </li>

              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Delivery Charge</span>
                <span>{selectedOrder?.deliveryCharge}</span>
              </li>

              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span>{selectedOrder?.paid}</span>
              </li>
              <li className="flex items-center justify-between font-semibold">
                <span className="text-muted-foreground">Remaining</span>
                <span>{selectedOrder?.remaining}</span>
              </li>
            </ul>
          </div>
          <Separator className="my-2" />
          <div className="grid grid-cols-1 gap-4">
            <div className="grid gap-3">
              <div className="font-semibold">Shipping Information</div>
              <address className="grid gap-0.5 not-italic text-muted-foreground">
                <span>{selectedOrder?.shipping.division}, </span>
                <span>{selectedOrder?.shipping.district}</span>
                <span>{selectedOrder?.shipping.address}</span>
              </address>
            </div>
          </div>
          <Separator className="my-2" />
          <div className="grid gap-3">
            <div className="font-semibold">Customer Information</div>
            <dl className="grid gap-3">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Customer</dt>
                <dd>{selectedOrder?.customer.name}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Email</dt>
                <dd>
                  <a href="mailto:">{selectedOrder?.customer.email}</a>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Phone</dt>
                <dd>
                  <a href="tel:">{selectedOrder?.customer.phoneNumber}</a>
                </dd>
              </div>
            </dl>
          </div>
        </CardContent>
        <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
          <div className="text-xs text-muted-foreground">
            Updated{" "}
            <time dateTime="2023-11-23">
              {dayjs(selectedOrder?.timestamps.updatedAt).format(
                "MMMM D, YYYY"
              )}
            </time>
          </div>
        </CardFooter>
      </Card>
    );
  };

  const renderBulkActionPanel = () => {
    return (
      <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
        <CardHeader className="flex flex-row items-start bg-muted/50">
          <div className="grid gap-0.5">
            <CardTitle className="group flex items-center gap-2 text-lg w-full">
              Bulk Action
            </CardTitle>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {/* <Button size='sm' variant='outline' className='h-8 gap-1'>
              <Truck className='h-3.5 w-3.5' />
              <span className='lg:sr-only xl:not-sr-only xl:whitespace-nowrap'>
                Track Order
              </span>
            </Button> */}
          </div>
        </CardHeader>
        <CardContent className="p-6 text-sm">
          <div className="flex flex-col justify-center items-center gap-4">
            <div className="w-full grid grid-cols-3 gap-2">
              {" "}
              <Button
                variant="default"
                className="w-full bg-blue-700"
                onClick={() => setBulkAction("shipped")}
              >
                {" "}
                <TruckIcon className="size-5 text-white mr-2" />
                Shipped
              </Button>
              <Button
                variant="default"
                className="w-full bg-green-700"
                onClick={() => setBulkAction("complete")}
              >
                {" "}
                <CheckCircleIcon className="size-5 text-white mr-2" />
                Complete
              </Button>
              <Button
                variant="default"
                className="w-full"
                onClick={() => setBulkAction("processing")}
              >
                {" "}
                <TimerReset className="size-5 text-white mr-2" />
                Processing
              </Button>
            </div>
            <div className="w-full grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setBulkAction("cancel")}
              >
                {" "}
                <MinusCircleIcon className="size-5 text-red-600 mr-2" /> Cancel
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setBulkAction("delete")}
              >
                {" "}
                <Trash2 className="size-5 text-white mr-2" /> Delete
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
          <div className="text-xs text-muted-foreground">
            {bulkOrders?.length} of {orders?.length} selected
          </div>
        </CardFooter>
      </Card>
    );
  };

  const drawerDialog = () => {
    return (
      <Sheet
        open={isEditDialogOpen}
        onOpenChange={(val) => setEditDialogOpen(val)}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Order</SheetTitle>
            <SheetDescription className="text-red-400">
              This action cannot be undone.
            </SheetDescription>
          </SheetHeader>
          <br />
          <EditCustomerInformation
            customerInfo={selectedOrder?.customer}
            shipping={selectedOrder?.shipping}
            deliveryCharge={selectedOrder?.deliveryCharge ?? 0}
            totalPrice={selectedOrder?.totalPrice ?? 0}
            paid={selectedOrder?.paid ?? 0}
            remaining={selectedOrder?.remaining ?? 0}
            discount={selectedOrder?.discount ?? 0}
            handleClose={() => setEditDialogOpen(false)}
            handleCustomerDataChange={(data) => {
              editOrderData(
                { ...data, id: selectedOrder?.id },
                (success: boolean) => {
                  if (success) refresh();
                  setEditDialogOpen(false);
                }
              );
            }}
          />
        </SheetContent>
      </Sheet>
    );
  };

  const renderBulkActionDrawer = () => {
    return (
      <Drawer
        open={
          !!bulkOrders &&
          bulkOrders?.length > 0 &&
          ["shipped", "complete", "processing", "delete", "cancel"].includes(
            bulkAction
          )
        }
      >
        <DrawerContent className="p-20">
          <DrawerHeader className="mx-auto">
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="container">
            <div className="flex justify-center items-center gap-6">
              <DrawerClose>
                <Button
                  variant="destructive"
                  onClick={() => {
                    performOrderBulkUpdate(bulkAction);
                    setBulkAction("");
                  }}
                >
                  I'm Sure
                </Button>
              </DrawerClose>
              <DrawerClose>
                <Button variant="outline" onClick={() => setBulkAction("")}>
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  };

  const mainView = () => {
    if (orderFetching) {
      return <DefaultLoading />;
    } else if (modifyDialogOpen && !!selectedOrder) {
      return (
        <UpdateProductData
          order={selectedOrder}
          handleBack={() => {
            setModifyDialogOpen(false);
            setSelectedOrder(null);
            getOrderList();
          }}
        />
      );
    } else if (inputValue !== "" || (!!orders && orders.length > 0)) {
      return renderProductListView();
    } else {
      return renderEmptyView();
    }
  };

  return (
    <div className="w-full sm:w-[95vw]">
      {mainView()}
      {renderBulkActionDrawer()}
    </div>
  );
};

export default OrderList;
