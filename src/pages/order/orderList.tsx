import { ChevronLeft, ChevronRight, Copy } from "lucide-react";
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

const OrderList = () => {
  const {
    limit,
    orderFetching,
    orders,
    currentPageNum,
    totalPages,
    analytics,
    totalOrders,
    getAnalytics,
    setSearchQuery,
    updateCurrentPage,
    deleteOrderData,
  } = useOrderList();

  const [inputValue, setInputValue] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  const debounceHandler = useDebounce(inputValue, 500);

  useEffect(() => {
    getAnalytics();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!!orders && orders.length > 0) setSelectedOrder(orders[0]);
  }, [orders]);

  useEffect(() => {
    setSearchQuery(inputValue);
    //eslint-disable-next-line
  }, [debounceHandler]);

  const navigate = useNavigate();

  const renderEmptyView = () => {
    return (
      <EmptyView
        title='You have no orders'
        description='You can start selling as soon as you add a product.'
        buttonText='Create Order'
        handleButtonClick={() => navigate("/order/create")}
      />
    );
  };

  const renderProductListView = () => {
    return (
      <Tabs defaultValue='all'>
        <div className='flex items-center w-full'>
          <div className='grid gap-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4'>
            <Card x-chunk='dashboard-05-chunk-0'>
              <CardHeader className='pb-3'>
                <CardTitle>Your Orders</CardTitle>
                <CardDescription className='max-w-lg text-balance leading-relaxed'>
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
            <Card x-chunk='dashboard-05-chunk-1'>
              <CardHeader className='pb-2'>
                <CardDescription>This Month Completed Orders</CardDescription>
                <CardTitle className='text-4xl'>
                  {analytics.totalCompletedOrders}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-xs text-muted-foreground'>
                  last 30 days
                </div>
              </CardContent>
              <CardFooter>
                <Progress value={25} aria-label='25% increase' />
              </CardFooter>
            </Card>
            <Card x-chunk='dashboard-05-chunk-2'>
              <CardHeader className='pb-2'>
                <CardDescription>Total Paid</CardDescription>
                <CardTitle className='text-4xl'>
                  {analytics.totalPaid}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-xs text-muted-foreground'>
                  last 30 days
                </div>
              </CardContent>
              <CardFooter>
                <Progress value={12} aria-label='12% increase' />
              </CardFooter>
            </Card>
            <Card x-chunk='dashboard-05-chunk-2'>
              <CardHeader className='pb-2'>
                <CardDescription>Total Price Of Order</CardDescription>
                <CardTitle className='text-4xl'>
                  {analytics.totalPrice}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-xs text-muted-foreground'>
                  last 30 days
                </div>
              </CardContent>
              <CardFooter>
                <Progress value={12} aria-label='12% increase' />
              </CardFooter>
            </Card>
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
        <div className='grid grid-1 md:grid-cols-3 md:gap-4'>
          <div className='md:col-span-2'>
            <Card x-chunk='dashboard-06-chunk-0' className='mt-4'>
              <CardHeader>
                <div className='flex w-full justify-between'>
                  <div className='mr-auto'>
                    <CardTitle>Order</CardTitle>
                    <CardDescription>
                      Manage your orders and view your sales performance.
                    </CardDescription>
                  </div>
                  <div className='ml-auto'>
                    <Input
                      type='text'
                      placeholder='Search'
                      onChange={(event) => {
                        setInputValue(event.target.value);
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TabsContent value='all'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='hidden w-[100px] sm:table-cell'>
                          ID
                        </TableHead>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className='hidden md:table-cell'>
                          Paid
                        </TableHead>
                        <TableHead className='hidden md:table-cell'>
                          Remaining
                        </TableHead>
                        <TableHead className='hidden '>
                          Last Updated at
                        </TableHead>
                        <TableHead>
                          <span className='sr-only'>Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order: IOrder, index: number) => (
                        <SingleItem
                          key={index}
                          id={`${order?.id}`}
                          paid={order?.paid}
                          status={order?.status}
                          district={order?.shipping.district}
                          totalPrice={order?.totalPrice ?? 0}
                          remaining={order?.remaining}
                          customerName={order?.customer?.name}
                          CustomerPhoneNumber={order?.customer?.phoneNumber}
                          handleUpdateOrder={(id: string) =>
                            console.log("order id:", id)
                          }
                          handleViewDetails={() => {
                            setSelectedOrder(order);
                          }}
                          deleteExistingOrder={deleteOrderData}
                          updatedAt={order?.timestamps?.updatedAt}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </CardContent>
              {inputValue === "" && (
                <CardFooter>
                  <div className='w-full flex justify-between items-center'>
                    <div className='text-xs text-muted-foreground'>
                      Showing{" "}
                      <strong>{`${
                        (Number(currentPageNum) - 1) * limit + 1
                      }-${Math.min(
                        Number(currentPageNum) * limit,
                        totalOrders
                      )}`}</strong>{" "}
                      of <strong>{totalOrders}</strong> orders
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Button
                        disabled={currentPageNum < 2}
                        variant='outline'
                        size='icon'
                        className='h-7 w-7'
                        onClick={() => updateCurrentPage(-1)}>
                        <ChevronLeft className='h-4 w-4' />
                        <span className='sr-only'>Back</span>
                      </Button>

                      <Button
                        disabled={currentPageNum >= totalPages}
                        variant='outline'
                        size='icon'
                        className='h-7 w-7'
                        onClick={() => updateCurrentPage(1)}>
                        <ChevronRight className='h-4 w-4' />
                        <span className='sr-only'>Next</span>
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
          <div className='mt-4'>{renderOrderDetailsPanel()}</div>
        </div>
      </Tabs>
    );
  };

  const renderOrderDetailsPanel = () => {
    return (
      <Card className='overflow-hidden' x-chunk='dashboard-05-chunk-4'>
        <CardHeader className='flex flex-row items-start bg-muted/50'>
          <div className='grid gap-0.5'>
            <CardTitle className='group flex items-center gap-2 text-lg'>
              Order {selectedOrder?.id}
              <Button
                size='icon'
                variant='outline'
                className='h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'>
                <Copy className='h-3 w-3' />
                <span className='sr-only'>Copy Order ID</span>
              </Button>
            </CardTitle>
            <CardDescription>
              Date:{" "}
              {dayjs(selectedOrder?.timestamps.createdAt).format(
                "MMMM D, YYYY"
              )}
            </CardDescription>
          </div>
          <div className='ml-auto flex items-center gap-1'>
            {/* <Button size='sm' variant='outline' className='h-8 gap-1'>
              <Truck className='h-3.5 w-3.5' />
              <span className='lg:sr-only xl:not-sr-only xl:whitespace-nowrap'>
                Track Order
              </span>
            </Button> */}
          </div>
        </CardHeader>
        <CardContent className='p-6 text-sm'>
          <div className='grid gap-3'>
            <div className='font-semibold'>Order Details</div>
            <ul className='grid gap-3'>
              {selectedOrder?.products.map((product, index) => (
                <li key={index} className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>
                    {product?.name} x <span>{product?.quantity}</span>
                  </span>
                  <span>{product?.totalPrice}</span>
                </li>
              ))}
            </ul>
            <Separator className='my-2' />
            <ul className='grid gap-3'>
              <li className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Subtotal</span>
                <span>{selectedOrder?.totalPrice}</span>
              </li>

              <li className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Paid</span>
                <span>{selectedOrder?.paid}</span>
              </li>
              <li className='flex items-center justify-between font-semibold'>
                <span className='text-muted-foreground'>Remaining</span>
                <span>{selectedOrder?.remaining}</span>
              </li>
            </ul>
          </div>
          <Separator className='my-2' />
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-3'>
              <div className='font-semibold'>Shipping Information</div>
              <address className='grid gap-0.5 not-italic text-muted-foreground'>
                <span>{selectedOrder?.shipping.division}, </span>
                <span>{selectedOrder?.shipping.district}</span>
                <span>{selectedOrder?.shipping.address}</span>
              </address>
            </div>
          </div>
          <Separator className='my-2' />
          <div className='grid gap-3'>
            <div className='font-semibold'>Customer Information</div>
            <dl className='grid gap-3'>
              <div className='flex items-center justify-between'>
                <dt className='text-muted-foreground'>Customer</dt>
                <dd>{selectedOrder?.customer.name}</dd>
              </div>
              <div className='flex items-center justify-between'>
                <dt className='text-muted-foreground'>Email</dt>
                <dd>
                  <a href='mailto:'>{selectedOrder?.customer.email}</a>
                </dd>
              </div>
              <div className='flex items-center justify-between'>
                <dt className='text-muted-foreground'>Phone</dt>
                <dd>
                  <a href='tel:'>{selectedOrder?.customer.phoneNumber}</a>
                </dd>
              </div>
            </dl>
          </div>
        </CardContent>
        <CardFooter className='flex flex-row items-center border-t bg-muted/50 px-6 py-3'>
          <div className='text-xs text-muted-foreground'>
            Updated{" "}
            <time dateTime='2023-11-23'>
              {dayjs(selectedOrder?.timestamps.updatedAt).format(
                "MMMM D, YYYY"
              )}
            </time>
          </div>
        </CardFooter>
      </Card>
    );
  };

  const mainView = () => {
    if (orderFetching) {
      return <DefaultLoading />;
    } else if (inputValue !== "" || (!!orders && orders.length > 0)) {
      return renderProductListView();
    } else {
      return renderEmptyView();
    }
  };

  return <div className='w-full sm:w-[95vw]'>{mainView()}</div>;
};

export default OrderList;
