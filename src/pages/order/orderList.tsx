import {
  Check,
  CheckCircleIcon,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  File,
  MinusCircleIcon,
  PlusCircle,
  Settings,
  TimerReset,
  Trash2,
  TruckIcon,
  Search,
  Download,
  RefreshCw,
  Package,
  Users,
  DollarSign,
  Clock,
  MoreVertical,
  ShoppingBag,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Grid3X3,
  List,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Truck,
  Edit3,
  Filter,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
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
import { useEffect, useState } from "react";
import { Input } from "../../components/ui/input";
import useDebounce from "../../customHook/useDebounce";
import { IOrder } from "./interface";
import { useNavigate } from "react-router-dom";
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
  generateModernInvoice,
  generateMultipleModernInvoicesAndDownloadZip,
} from "../../utils/invoiceGenerator";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";
import UpdateProductData from "./updateProductData";
import { Badge } from "../../components/ui/badge";
import AdjustReturnProduct from "./orderReturn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Skeleton } from "../../components/ui/skeleton";
import { Alert, AlertDescription } from "../../components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import SingleItemMobileView from "./components/SingleOrderItemMobileView";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";

const OrderList = () => {
  const {
    limit,
    refresh,
    setLimit,
    orderFetching,
    orders,
    currentPageNum,
    totalPages,
    bulkOrders,
    totalOrders,
    getOrderList,
    setBulkOrders,
    setSearchQuery,
    updateCurrentPage,
    deleteOrderData,
    selectedStatus,
    setSelectedStatus,
    performOrderBulkUpdate,
  } = useOrderList();

  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();

  const { editOrderData, updateOrderStatus } = useOrder();

  const [isCopied, setIsCopied] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [bulkAction, setBulkAction] = useState<string>("");
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isReturnProduct, setIsReturnProduct] = useState<boolean>(false);
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
    if (!!selectedOrder) await generateModernInvoice(selectedOrder);
  };

  const renderEmptyView = () => {
    return (
      <Card className='border-dashed border-2 border-gray-200'>
        <CardContent className='flex flex-col items-center justify-center py-24 text-center'>
          <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6'>
            <ShoppingBag className='w-10 h-10 text-gray-400' />
          </div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>
            {inputValue ? "No Orders Found" : "No Orders Yet"}
          </h3>
          <p className='text-gray-600 mb-6 max-w-sm'>
            {inputValue
              ? `No orders match your search for "${inputValue}". Try adjusting your search terms.`
              : "You haven't received any orders yet. Start by creating your first order or wait for customers to place orders."}
          </p>
          {hasRequiredPermission("order", "create") && !inputValue && (
            <Button
              onClick={() => navigate("/order/create")}
              size='lg'
              className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'>
              <PlusCircle className='w-5 h-5 mr-2' />
              Create First Order
            </Button>
          )}
          {inputValue && (
            <Button
              onClick={() => setInputValue("")}
              variant='outline'
              size='lg'>
              <XCircle className='w-4 h-4 mr-2' />
              Clear Search
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderStatusButtonView = () => {
    const statusConfig = [
      { key: "", label: "All", icon: Grid3X3, color: "bg-slate-500" },
      {
        key: "processing",
        label: "Processing",
        icon: Clock,
        color: "bg-blue-500",
      },
      {
        key: "shipped",
        label: "Shipped",
        icon: TruckIcon,
        color: "bg-purple-500",
      },
      {
        key: "completed",
        label: "Completed",
        icon: CheckCircle,
        color: "bg-green-500",
      },
      { key: "cancel", label: "Cancelled", icon: XCircle, color: "bg-red-500" },
      {
        key: "return",
        label: "Return",
        icon: RefreshCw,
        color: "bg-orange-500",
      },
    ];

    return (
      <div className='p-1 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200'>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button
              variant={"ghost"}
              className='w-full flex justify-between items-center border border-dashed bg-white'>
              {" "}
              <Filter className='w-4 h-4' />
              <span>
                Status Filter{" "}
                <span className='ml-[2px] px-1.5 py-1 bg-gray-100 uppercase font-semibold text-xs rounded-md'>
                  {selectedStatus || "All"}
                </span>
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className='grid grid-cols-2 gap-3 mt-1'>
              {statusConfig.map(({ key, label, icon: Icon, color }) => (
                <Button
                  key={key}
                  variant={selectedStatus === key ? "default" : "ghost"}
                  onClick={() => setSelectedStatus(key)}
                  className={`h-12 flex flex-col items-center gap-1 text-xs font-medium transition-all duration-200 ${
                    selectedStatus === key
                      ? `${color} text-white shadow-lg hover:shadow-xl`
                      : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md"
                  }`}>
                  <Icon className='w-4 h-4' />
                  {label}
                </Button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  const renderStatusTabsView = () => {
    const statusConfig = [
      { key: "", label: "All Orders", icon: Grid3X3, count: totalOrders },
      { key: "processing", label: "Processing", icon: Clock, count: 0 },
      { key: "shipped", label: "Shipped", icon: TruckIcon, count: 0 },
      { key: "completed", label: "Completed", icon: CheckCircle, count: 0 },
      { key: "cancel", label: "Cancelled", icon: XCircle, count: 0 },
      { key: "return", label: "Return", icon: RefreshCw, count: 0 },
    ];

    return (
      <div className='py-2 border-0 rounded-md  shadow-none flex justify-between items-center'>
        <Tabs
          value={selectedStatus}
          onValueChange={(value: string) => setSelectedStatus(value)}>
          <TabsList className='grid w-full grid-cols-6 bg-gray-100 rounded-xl p-1'>
            {statusConfig.map(({ key, label, icon: Icon, count }) => (
              <TabsTrigger
                key={key}
                value={key}
                className='flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200'>
                <Icon className='w-4 h-4' />
                <span className='hidden lg:inline'>{label}</span>
                <span className='lg:hidden'>{label.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {/* Action Buttons */}
        <div className='flex items-center gap-3 justify-between md:justify-normal'>
          <Button
            variant='outline'
            onClick={() => getOrderList()}
            className='border-gray-300 hover:bg-gray-50 w-full md:w-auto'>
            <RefreshCw className='w-4 h-4 mr-2' />
            Refresh
          </Button>
          {hasRequiredPermission("order", "create") && (
            <Button
              onClick={() => navigate("/order/create")}
              className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
              size='lg'>
              <PlusCircle className='w-5 h-5 mr-2' />
              Create Order
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderProductListView = () => {
    return (
      <div className='min-h-screen md:min-h-[80vh] bg-white'>
        <div className='max-w-full mx-auto px-0 sm:px-6 lg:px-8'>
          {/* Header Section */}
          <div className='mb-2 px-4 md:px-0'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
              <div className='space-y-2'>
                <div className='flex items-center gap-3'>
                  <div className=' w-6 h-6 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center'>
                    <ShoppingBag className=' w-4 h-4 md:w-6 md:h-6 text-white' />
                  </div>
                  <div>
                    <h1 className=' text-lg md:text-3xl font-bold text-gray-900'>
                      Order Management
                    </h1>
                    <p className='text-gray-600 hidden md:block'>
                      Manage orders and track sales performance
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className=' grid-cols-2 lg:grid-cols-4 gap-4 mt-6 hidden'>
                  <Card className='bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0'>
                    <CardContent className='p-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-blue-100 text-sm font-medium'>
                            Total Orders
                          </p>
                          <p className='text-2xl font-bold'>{totalOrders}</p>
                        </div>
                        <ShoppingBag className='w-8 h-8 text-blue-200' />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className='bg-gradient-to-r from-green-500 to-green-600 text-white border-0'>
                    <CardContent className='p-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-green-100 text-sm font-medium'>
                            This Month
                          </p>
                          <p className='text-2xl font-bold'>
                            {orders?.length || 0}
                          </p>
                        </div>
                        <Calendar className='w-8 h-8 text-green-200' />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className='bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0'>
                    <CardContent className='p-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-purple-100 text-sm font-medium'>
                            Revenue
                          </p>
                          <p className='text-2xl font-bold'>
                            ৳
                            {orders
                              ? orders
                                  .reduce(
                                    (sum: number, order: IOrder) =>
                                      sum + (order.totalPrice || 0),
                                    0
                                  )
                                  .toLocaleString()
                              : 0}
                          </p>
                        </div>
                        <DollarSign className='w-8 h-8 text-purple-200' />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className='bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0'>
                    <CardContent className='p-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-orange-100 text-sm font-medium'>
                            Customers
                          </p>
                          <p className='text-2xl font-bold'>
                            {orders
                              ? new Set(
                                  orders.map(
                                    (o: IOrder) => o.customer?.phoneNumber
                                  )
                                ).size
                              : 0}
                          </p>
                        </div>
                        <Users className='w-8 h-8 text-orange-200' />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex items-center gap-3 justify-between md:justify-normal md:hidden'>
                <Button
                  variant='outline'
                  onClick={() => getOrderList()}
                  className='border-gray-300 hover:bg-gray-50 w-full md:w-auto'>
                  <RefreshCw className='w-4 h-4 mr-2' />
                  Refresh
                </Button>
                {hasRequiredPermission("order", "create") && (
                  <Button
                    onClick={() => navigate("/order/create")}
                    className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                    size='lg'>
                    <PlusCircle className='w-5 h-5 mr-2' />
                    Create Order
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className=' mb-2 md:mb-0 px-4 md:px-0'>
            <div className='md:hidden'>{renderStatusButtonView()}</div>
            <div className='hidden md:block'>{renderStatusTabsView()}</div>
          </div>

          {/* Search and Filters Bar */}
          <div className='mb-2 px-4 md:px-0'>
            <div className='flex flex-row sm:flex-row gap-4 items-center justify-between'>
              <div className='relative flex-1 max-w-full md:hidden'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Input
                  type='text'
                  placeholder='Search orders, customers, or order numbers...'
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  className='pl-10 pr-4 h-11 border-2 focus:border-blue-500 rounded-xl'
                />
              </div>
              <div className='flex items-center gap-3'>
                {hasSomePermissionsForPage("order", [
                  "edit",
                  "delete",
                  "documents",
                ]) &&
                  !selectedStatus.includes("return") &&
                  !!bulkOrders &&
                  bulkOrders.length > 0 && (
                    <div className='block md:hidden'>
                      {renderMobileBulkActionPanel()}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className='grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-8'>
            {/* Orders List Section */}
            <div
              className={`xl:col-span-3 ${
                !selectedStatus.includes("return") &&
                !!bulkOrders &&
                bulkOrders.length > 0
                  ? "xl:col-span-3"
                  : "xl:col-span-4"
              }`}>
              {(!orders || orders.length < 1) && renderEmptyView()}
              {!!orders && orders.length > 0 && (
                <Card className='border-0 shadow-none overflow-hidden'>
                  {/* Mobile View */}
                  <div className='block md:hidden'>
                    <CardHeader className='bg-gradient-to-r from-gray-50 to-gray-100 border-b'>
                      <div className='flex items-center justify-between'>
                        <CardTitle className='flex items-center gap-2'>
                          <List className='w-5 h-5' />
                          Orders
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <ScrollArea className='h-[60vh]'>
                      <div className='space-y-4'>
                        {orders.map((order: IOrder, index: number) => (
                          <SingleItemMobileView
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
                              setEditDialogOpen(true);
                              setSelectedOrder(order);
                            }}
                            handleModifyProduct={() => {
                              navigate(`/order/modify/${order?.id}`);
                            }}
                            handleReturnProducts={() => {
                              setSelectedOrder(order);
                              setIsReturnProduct(true);
                            }}
                            handleViewDetails={() => {
                              setShowDetails(true);
                              setSelectedOrder(order);
                            }}
                            deleteExistingOrder={deleteOrderData}
                            updatedAt={order?.timestamps?.updatedAt}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Desktop Table View */}
                  <div className='hidden md:block'>
                    <CardHeader className='bg-white border-0  px-4 md:px-0 py-2  '>
                      <div className='flex items-center justify-between'>
                        <div>
                          <CardTitle className='flex items-center gap-2 text-gray-800'>
                            <Grid3X3 className='w-5 h-5' />
                            Orders List
                          </CardTitle>
                        </div>
                        <div className='relative flex-1 max-w-md'>
                          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                          <Input
                            type='text'
                            placeholder='Search orders, customers, or order numbers...'
                            value={inputValue}
                            onChange={(event) =>
                              setInputValue(event.target.value)
                            }
                            className='pl-10 pr-4 h-9 border border-sidebar focus:border-sidebar rounded-md bg-white'
                          />
                        </div>
                      </div>
                    </CardHeader>

                    <div className='overflow-hidden'>
                      <ScrollArea className='h-[65vh] border  border-gray-200 rounded-lg'>
                        <Table
                          divClass='max-h-[65vh] overflow-y-auto'
                          className='relative'>
                          <TableHeader className='sticky top-0  border-b-2 border-gray-100 bg-sidebar'>
                            <TableRow className='w-full'>
                              {!selectedStatus.includes("return") && (
                                <TableHead className='w-12  bg-sidebar'>
                                  <input
                                    className='w-4 h-4 text-sidebar-foreground border-sidebar-foreground border rounded focus:ring-sidebar'
                                    type='checkbox'
                                    onChange={(event) => {
                                      const check = event?.target?.checked;
                                      setBulkOrders(
                                        check
                                          ? orders?.map(
                                              (order: IOrder) => order?.id
                                            )
                                          : []
                                      );
                                    }}
                                  />
                                </TableHead>
                              )}
                              <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                <div className='flex items-center gap-2'>
                                  <Package className='w-4 h-4' />
                                  Order #
                                </div>
                              </TableHead>
                              <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                <div className='flex items-center gap-2'>
                                  <Users className='w-4 h-4' />
                                  Customer
                                </div>
                              </TableHead>
                              <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                <div className='flex items-center gap-2'>
                                  <Phone className='w-4 h-4' />
                                  Contact
                                </div>
                              </TableHead>
                              <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                Status
                              </TableHead>
                              <TableHead className='font-semibold bg-sidebar text-sidebar-foreground hidden lg:table-cell'>
                                <div className='flex items-center gap-2'>
                                  <MapPin className='w-4 h-4' />
                                  Location
                                </div>
                              </TableHead>
                              <TableHead className='font-semibold bg-sidebar text-sidebar-foreground text-right'>
                                <div className='flex items-center gap-2 justify-end'>
                                  <DollarSign className='w-4 h-4' />
                                  Total
                                </div>
                              </TableHead>
                              <TableHead className='font-semibold bg-sidebar text-sidebar-foreground text-right hidden lg:table-cell'>
                                <div className='flex items-center gap-2 justify-end'>
                                  <CreditCard className='w-4 h-4' />
                                  Paid
                                </div>
                              </TableHead>
                              <TableHead className='font-semibold bg-sidebar text-sidebar-foreground text-right hidden lg:table-cell'>
                                Due
                              </TableHead>
                              <TableHead className='font-semibold bg-sidebar text-sidebar-foreground text-center'>
                                Information
                              </TableHead>
                              {hasRequiredPermission("order", "edit") && (
                                <TableHead className='font-semibold bg-sidebar text-sidebar-foreground text-center'>
                                  Edit
                                </TableHead>
                              )}
                              <TableHead className='font-semibold bg-sidebar text-sidebar-foreground text-center'>
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orders.map((order: IOrder, index: number) => (
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
                                        bulkOrders.filter(
                                          (b) => b !== order?.id
                                        )
                                      );
                                }}
                                district={order?.shipping.district}
                                totalPrice={order?.totalPrice ?? 0}
                                remaining={order?.remaining}
                                customerName={order?.customer?.name}
                                CustomerPhoneNumber={
                                  order?.customer?.phoneNumber
                                }
                                handleUpdateOrder={() => {
                                  setEditDialogOpen(true);
                                  setSelectedOrder(order);
                                }}
                                handleModifyProduct={() => {
                                  navigate(`/order/modify/${order?.id}`);
                                }}
                                handleReturnProducts={() => {
                                  setSelectedOrder(order);
                                  setIsReturnProduct(true);
                                }}
                                handleViewDetails={() => {
                                  setShowDetails(true);
                                  setSelectedOrder(order);
                                }}
                                deleteExistingOrder={deleteOrderData}
                                updatedAt={order?.timestamps?.updatedAt}
                              />
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  </div>

                  {/* Pagination Footer */}
                  {inputValue === "" && (
                    <CardFooter className='bg-white border-0 pt-2'>
                      <div className='w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
                        <div className='text-sm text-gray-800'>
                          Showing{" "}
                          <span className='font-semibold'>
                            {(Number(currentPageNum) - 1) * limit + 1}-
                            {Math.min(
                              Number(currentPageNum) * limit,
                              totalOrders
                            )}
                          </span>{" "}
                          of{" "}
                          <span className='font-semibold'>{totalOrders}</span>{" "}
                          orders
                        </div>
                        <div className='flex items-center gap-2'>
                          <Select
                            value={`${limit}`}
                            onValueChange={(value: string) =>
                              setLimit(parseInt(value, 10))
                            }>
                            <SelectTrigger className='w-24'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Per page</SelectLabel>
                                <SelectItem value='10'>10</SelectItem>
                                <SelectItem value='50'>50</SelectItem>
                                <SelectItem value='100'>100</SelectItem>
                                <SelectItem value='150'>150</SelectItem>
                                <SelectItem value='200'>200</SelectItem>
                                <SelectItem value='500'>500</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <div className='flex gap-1'>
                            <Button
                              disabled={currentPageNum < 2}
                              variant='outline'
                              size='sm'
                              onClick={() => updateCurrentPage(-1)}>
                              <ChevronLeft className='h-4 w-4' />
                            </Button>
                            <Button
                              disabled={currentPageNum >= totalPages}
                              variant='outline'
                              size='sm'
                              onClick={() => updateCurrentPage(1)}>
                              <ChevronRight className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              )}
            </div>

            {/* Bulk Actions Sidebar */}
            {!selectedStatus.includes("return") &&
              !!bulkOrders &&
              bulkOrders.length > 0 && (
                <div className='xl:col-span-1 hidden md:block'>
                  {renderBulkActionPanel()}
                </div>
              )}
          </div>

          {/* Order Details Panel */}
          {renderOrderDetailsPanel()}
        </div>
      </div>
    );
  };

  const renderOrderDetailsPanel = () => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "processing":
          return "bg-blue-500";
        case "shipped":
          return "bg-purple-500";
        case "completed":
          return "bg-green-500";
        case "cancel":
          return "bg-red-500";
        case "return":
          return "bg-orange-500";
        default:
          return "bg-gray-500";
      }
    };

    console.log("Selected Order: wowow");

    return (
      <Sheet
        open={showDetails}
        onOpenChange={(value: boolean) => setShowDetails(value)}>
        <SheetContent className=' px-0'>
          <ScrollArea className='h-full'>
            <div className='px-4 py-6 w-[425px] sm:w-full '>
              {/* Header */}
              <div className='space-y-4 pb-6 border-b'>
                <div className='flex items-start justify-between'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`w-10 h-10 ${getStatusColor(
                          selectedOrder?.status || ""
                        )} rounded-xl flex items-center justify-center`}>
                        <Package className='w-5 h-5 text-white' />
                      </div>
                      <div>
                        <h2 className='text-xl font-bold text-gray-900'>
                          Order #{selectedOrder?.orderNumber}
                        </h2>
                        <div className='flex items-center gap-2 mt-1'>
                          <Badge
                            className={`${getStatusColor(
                              selectedOrder?.status || ""
                            )} text-white border-0`}>
                            {selectedOrder?.status?.toUpperCase()}
                          </Badge>
                          <span className='text-sm text-gray-500'>
                            {dayjs(selectedOrder?.timestamps.createdAt).format(
                              "MMM D, YYYY"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 p-3 bg-gray-50 rounded-lg'>
                      <span className='text-sm font-medium text-gray-600'>
                        Tracking ID:
                      </span>
                      <code className='text-sm bg-white px-2 py-1 rounded border'>
                        {selectedOrder?.id}
                      </code>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={handleCopy}
                        className='p-1 h-auto'>
                        {isCopied ? (
                          <Check className='w-4 h-4 text-green-600' />
                        ) : (
                          <Clipboard className='w-4 h-4 text-gray-500' />
                        )}
                      </Button>
                      {isCopied && (
                        <span className='text-xs text-green-600 font-medium'>
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex items-center gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleGenerateInvoice()}
                      className='gap-2'>
                      <Download className='w-4 h-4' />
                      <span className='hidden sm:inline'>Invoice</span>
                    </Button>

                    {/* Status Change Actions */}
                    {!selectedOrder?.status.includes("return") && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size='sm' variant='outline'>
                            <MoreVertical className='w-4 h-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-48'>
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {selectedOrder?.status === "processing" && (
                            <DropdownMenuItem
                              onClick={() => {
                                updateOrderStatus(
                                  `${selectedOrder?.id}`,
                                  "shipped",
                                  () => {
                                    refresh();
                                    setShowDetails(false);
                                  }
                                );
                              }}
                              className='gap-2'>
                              <Truck className='w-4 h-4 text-purple-600' />
                              Mark as Shipped
                            </DropdownMenuItem>
                          )}
                          {selectedOrder?.status === "shipped" && (
                            <DropdownMenuItem
                              onClick={() => {
                                updateOrderStatus(
                                  `${selectedOrder?.id}`,
                                  "completed",
                                  () => {
                                    refresh();
                                    setShowDetails(false);
                                  }
                                );
                              }}
                              className='gap-2'>
                              <CheckCircle className='w-4 h-4 text-green-600' />
                              Mark as Completed
                            </DropdownMenuItem>
                          )}
                          {selectedOrder?.status !== "processing" && (
                            <DropdownMenuItem
                              onClick={() => {
                                updateOrderStatus(
                                  `${selectedOrder?.id}`,
                                  "processing",
                                  () => {
                                    refresh();
                                    setShowDetails(false);
                                  }
                                );
                              }}
                              className='gap-2'>
                              <Clock className='w-4 h-4 text-blue-600' />
                              Reset to Processing
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className='space-y-4 py-6 border-b'>
                <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                  <ShoppingBag className='w-5 h-5' />
                  Order Items
                </h3>
                <div className='space-y-3'>
                  {selectedOrder?.products.map((product, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                      <div className='flex-1 space-y-1'>
                        <div className='font-medium text-gray-900 uppercase'>
                          {product?.name}
                        </div>
                        {product?.hasVariation && (
                          <div className='text-sm w-auto'>
                            <Badge className='border-0 bg-orange-100 text-orange-600'>
                              {product?.variation.color}{" "}
                              {product?.variation.color &&
                                product?.variation.size &&
                                "•"}{" "}
                              {product?.variation.size}
                            </Badge>
                          </div>
                        )}
                        <div className='text-sm text-gray-500'>
                          Quantity: {product?.quantity}
                        </div>
                      </div>
                      <div className='text-right space-y-6'>
                        <div className='font-semibold text-gray-900'>
                          ৳{product?.totalPrice}
                        </div>
                        <div className='text-sm text-gray-500'>
                          ৳
                          {(product?.totalPrice / product?.quantity).toFixed(2)}{" "}
                          each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className='space-y-4 py-6 border-b'>
                <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                  <DollarSign className='w-5 h-5' />
                  Order Summary
                </h3>
                <div className='space-y-3 bg-gray-50 p-4 rounded-lg'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Subtotal</span>
                    <span className='font-medium'>
                      ৳{selectedOrder?.totalPrice}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Delivery Charge</span>
                    <span className='font-medium'>
                      ৳{selectedOrder?.deliveryCharge}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Discount</span>
                    <span className='font-medium text-red-600'>
                      -৳{selectedOrder?.discount}
                    </span>
                  </div>
                  <Separator />
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Paid Amount</span>
                    <span className='font-medium text-green-600'>
                      ৳{selectedOrder?.paid}
                    </span>
                  </div>
                  <div className='flex justify-between text-lg font-semibold'>
                    <span className='text-gray-900'>Remaining</span>
                    <span
                      className={`${
                        (selectedOrder?.remaining || 0) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}>
                      ৳{selectedOrder?.remaining || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className='space-y-4 py-6 border-b'>
                <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                  <Users className='w-5 h-5' />
                  Customer Details
                </h3>
                <div className='grid grid-cols-1 gap-4'>
                  <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                    <Avatar className='w-10 h-10'>
                      <AvatarFallback className='bg-blue-100 text-blue-600 font-semibold'>
                        {selectedOrder?.customer.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className='font-medium text-gray-900'>
                        {selectedOrder?.customer.name}
                      </div>
                      <div className='text-sm text-gray-600 flex items-center gap-1'>
                        <Phone className='w-3 h-3' />
                        {selectedOrder?.customer.phoneNumber}
                      </div>
                      {selectedOrder?.customer.email && (
                        <div className='text-sm text-gray-600 flex items-center gap-1'>
                          <Mail className='w-3 h-3' />
                          {selectedOrder?.customer.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className='space-y-4 py-6'>
                <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                  <MapPin className='w-5 h-5' />
                  Shipping Address
                </h3>
                <div className='p-3 bg-gray-50 rounded-lg'>
                  <div className='text-gray-900 font-medium'>
                    {selectedOrder?.shipping.division}
                  </div>
                  <div className='text-gray-700'>
                    {selectedOrder?.shipping.district}
                  </div>
                  <div className='text-gray-600 text-sm'>
                    {selectedOrder?.shipping.address}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder?.notes && (
                <div className='space-y-4 py-6 border-t'>
                  <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                    <AlertCircle className='w-5 h-5' />
                    Order Notes
                  </h3>
                  <Alert>
                    <AlertDescription>{selectedOrder.notes}</AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Footer */}
              <div className='pt-6 border-t'>
                <div className='text-xs text-gray-500 flex items-center gap-2'>
                  <Clock className='w-3 h-3' />
                  Last updated{" "}
                  {dayjs(selectedOrder?.timestamps.updatedAt).format(
                    "MMM D, YYYY [at] h:mm A"
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  };

  const renderBulkActionPanel = () => {
    return (
      <div className='sticky top-8'>
        <Card className='border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg'>
          <CardHeader className='bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg'>
            <CardTitle className='flex items-center gap-2 text-white'>
              <Settings className='w-5 h-5' />
              Bulk Actions
            </CardTitle>
            <CardDescription className='text-blue-100'>
              Perform actions on {bulkOrders?.length} selected orders
            </CardDescription>
          </CardHeader>
          <CardContent className='p-6 space-y-4'>
            {/* Generate Documents */}
            {hasRequiredPermission("order", "documents") && (
              <div className='space-y-2'>
                <div className='text-sm font-medium text-gray-700'>
                  Documents
                </div>
                <Button
                  variant='outline'
                  className='w-full justify-start gap-2 bg-white hover:bg-gray-50 border-gray-200'
                  onClick={() =>
                    generateMultipleModernInvoicesAndDownloadZip(bulkOrders)
                  }>
                  <Download className='w-4 h-4 text-blue-600' />
                  Generate Invoices
                </Button>
              </div>
            )}

            {/* Status Changes */}
            {hasRequiredPermission("order", "edit") && (
              <div className='space-y-2'>
                <div className='text-sm font-medium text-gray-700'>
                  Change Status
                </div>
                <div className='grid grid-cols-1 gap-2'>
                  <Button
                    variant='default'
                    className='w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white'
                    onClick={() => setBulkAction("shipped")}>
                    <TruckIcon className='w-4 h-4' />
                    Mark as Shipped
                  </Button>
                  <Button
                    variant='default'
                    className='w-full justify-start gap-2 bg-green-600 hover:bg-green-700 text-white'
                    onClick={() => setBulkAction("complete")}>
                    <CheckCircle className='w-4 h-4' />
                    Mark as Complete
                  </Button>
                  <Button
                    variant='default'
                    className='w-full justify-start gap-2 bg-orange-600 hover:bg-orange-700 text-white'
                    onClick={() => setBulkAction("processing")}>
                    <Clock className='w-4 h-4' />
                    Reset to Processing
                  </Button>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            <div className='space-y-2 pt-4 border-t border-gray-200'>
              <div className='text-sm font-medium text-red-700 flex items-center gap-2'>
                <AlertCircle className='w-4 h-4' />
                Danger Zone
              </div>
              <div className='grid grid-cols-1 gap-2'>
                {hasRequiredPermission("order", "edit") && (
                  <Button
                    variant='outline'
                    className='w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50'
                    onClick={() => setBulkAction("cancel")}>
                    <XCircle className='w-4 h-4' />
                    Cancel Orders
                  </Button>
                )}
                {hasRequiredPermission("order", "delete") && (
                  <Button
                    variant='destructive'
                    className='w-full justify-start gap-2'
                    onClick={() => setBulkAction("delete")}>
                    <Trash2 className='w-4 h-4' />
                    Delete Orders
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className='bg-gray-50 border-t px-6 py-4 rounded-b-lg'>
            <div className='text-sm text-gray-600 flex items-center gap-2'>
              <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
              {bulkOrders?.length} of {orders?.length} orders selected
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  };

  const renderMobileBulkActionPanel = () => {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant='outline' size='default'>
            <Settings className='size-5' />
          </Button>
        </DrawerTrigger>
        <DrawerContent className='p-6'>
          <DrawerHeader>
            <DrawerTitle>Bulk Action</DrawerTitle>
          </DrawerHeader>
          <div className='grid grid-cols-2 justify-center items-center gap-4 my-2'>
            {hasRequiredPermission("order", "documents") && (
              <Button
                variant='secondary'
                className='w-full'
                onClick={() => {
                  generateMultipleModernInvoicesAndDownloadZip(bulkOrders);
                }}>
                <File className='size-5 text-gray-900 mr-2' /> Generate Invoices
              </Button>
            )}

            {hasRequiredPermission("order", "edit") && (
              <Button
                variant='default'
                className='w-full bg-blue-700'
                onClick={() => setBulkAction("shipped")}>
                <TruckIcon className='size-5 text-white mr-2' /> Shipped
              </Button>
            )}
            {hasRequiredPermission("order", "edit") && (
              <Button
                variant='default'
                className='w-full bg-green-700'
                onClick={() => setBulkAction("complete")}>
                <CheckCircleIcon className='size-5 text-white mr-2' /> Complete
              </Button>
            )}
            {hasRequiredPermission("order", "edit") && (
              <Button
                variant='default'
                className='w-full'
                onClick={() => setBulkAction("processing")}>
                <TimerReset className='size-5 text-white mr-2' /> Processing
              </Button>
            )}
            {hasRequiredPermission("order", "edit") && (
              <Button
                variant='outline'
                className='w-full'
                onClick={() => setBulkAction("cancel")}>
                <MinusCircleIcon className='size-5 text-red-600 mr-2' /> Cancel
              </Button>
            )}
            {hasRequiredPermission("order", "delete") && (
              <Button
                variant='destructive'
                className='w-full'
                onClick={() => setBulkAction("delete")}>
                <Trash2 className='size-5 text-white mr-2' /> Delete
              </Button>
            )}
          </div>
          <DrawerFooter className='flex flex-row items-center border-t bg-muted/50 px-6 py-3'>
            <div className='text-xs text-muted-foreground'>
              {bulkOrders?.length} of {orders?.length} selected
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  };

  // Parent Component - Sheet Implementation
  const drawerDialog = () => {
    console.log("Selected Order: called");

    // Add safety check
    if (!selectedOrder) {
      return null;
    }

    return (
      <Sheet
        open={isEditDialogOpen}
        onOpenChange={(val: boolean) => setEditDialogOpen(val)}>
        <SheetContent className='p-0 flex flex-col'>
          <SheetHeader className='px-6 py-4 border-b bg-gradient-to-r from-blue-50/80 to-green-50/80'>
            <SheetTitle className='text-xl font-semibold text-slate-800 flex items-center gap-2'>
              <div className='p-1.5 rounded-lg bg-blue-100'>
                <Edit3 className='h-4 w-4 text-blue-600' />
              </div>
              Edit Order Details
            </SheetTitle>
            <SheetDescription className='text-slate-600 text-sm'>
              Update customer information, shipping details, and payment data.
              <span className='block text-red-500 font-medium mt-1'>
                ⚠️ Changes will be saved immediately
              </span>
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className='w-full'>
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
                      if (success) refresh();
                    }
                  );
                }
              }}
            />
          </ScrollArea>
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
        }>
        <DrawerContent className='p-20'>
          <DrawerHeader className='mx-auto'>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className='container'>
            <div className='flex justify-center items-center gap-6'>
              <DrawerClose>
                <Button
                  variant='destructive'
                  onClick={() => {
                    performOrderBulkUpdate(bulkAction);
                    setBulkAction("");
                  }}>
                  I'm Sure
                </Button>
              </DrawerClose>
              <DrawerClose>
                <Button variant='outline' onClick={() => setBulkAction("")}>
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  };

  const returnModal = () => {
    return (
      <Dialog
        open={isReturnProduct && !!selectedOrder}
        onOpenChange={(open) => setIsReturnProduct(open)}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Return Product</DialogTitle>
          </DialogHeader>
          <div className='w-auto'>
            <AdjustReturnProduct
              // @ts-ignore
              order={selectedOrder}
              handleClose={() => {
                refresh();
                setIsReturnProduct(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const mainView = () => {
    if (orderFetching) {
      return (
        <div className='min-h-[80vh] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center'>
          <Card className='w-full max-w-md mx-4'>
            <CardContent className='flex flex-col items-center justify-center py-16 text-center'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6'>
                <Loader2 className='w-8 h-8 text-blue-600 animate-spin' />
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                Loading Orders
              </h3>
              <p className='text-gray-600 mb-6'>
                Please wait while we fetch your order data...
              </p>
              <div className='space-y-2 w-full'>
                <Skeleton className='h-4 w-3/4 mx-auto' />
                <Skeleton className='h-4 w-1/2 mx-auto' />
                <Skeleton className='h-4 w-2/3 mx-auto' />
              </div>
            </CardContent>
          </Card>
        </div>
      );
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
    } else {
      return renderProductListView();
    }
  };

  return (
    <>
      {mainView()}
      {renderBulkActionDrawer()}
      {returnModal()}
      {drawerDialog()}
    </>
  );
};

export default OrderList;
