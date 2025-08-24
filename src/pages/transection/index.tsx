import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Checkbox } from "../../components/ui/checkbox";
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../components/ui/hover-card";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import {
  Edit2Icon,
  Trash2,
  CreditCard,
  Wallet,
  Copy,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  Filter,
  DollarSign,
  Hash,
  Package,
  Activity,
  Calendar,
  CalendarRange,
} from "lucide-react";
import config from "../../utils/config";
import axios from "../../api/axios";
import bkashIcon from "../../images/bkash-icon.png";
import { errorToast, successToast } from "../../utils/toast";
import useDebounce from "../../customHook/useDebounce";
import MainView from "../../coreComponents/mainView";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import dayjs from "dayjs";

const defaultParams = {
  intent: "",
  payment_from: "",
  timestamp: "",
  vendor_transaction_id: "",
  vendor_id: "",
};

// Pagination Component (matching purchase orders style)
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
    <div className='flex items-center justify-center space-x-2 py-4 z-20'>
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
        onClick={() => onPageChange(Number(currentPage) + 1)}>
        Next
      </Button>
    </div>
  );
};

// Loading Skeleton Component
const TransactionSkeleton: React.FC = () => (
  <div className='space-y-4'>
    {[...Array(5)].map((_, index) => (
      <Card key={index} className='w-full'>
        <CardContent className='p-4'>
          <div className='space-y-3'>
            <div className='flex justify-between items-start'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-3 w-32' />
              </div>
              <Skeleton className='h-6 w-20' />
            </div>
            <div className='flex gap-2'>
              <Skeleton className='h-8 w-24' />
              <Skeleton className='h-8 w-24' />
              <Skeleton className='h-8 w-16' />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const TransactionsPage: React.FC = () => {
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalPageNum, setTotalPageNum] = useState(0);
  const [limit, setLimit] = useState(10);
  const [selectedParamsType, setSelectedParamType] = useState("");
  const [searchParams, setSearchParams] = useState(defaultParams);
  const [activeTab, setActiveTab] = useState("all");
  const handleDebounce = useDebounce(inputValue, 500);

  // Track the initial render
  const isFirstRender = useRef(true);

  // Fetch transactions from the backend
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(config.transaction.search(), {
        params: {
          ...searchParams,
          limit,
          offset: currentPageNum - 1,
        },
      });
      setTransactions(response?.data?.transactions || []);
      setTotalPageNum(
        Math.ceil(response?.data?.totalTransactions / limit) || 0
      );
      setTotalTransactions(response?.data?.totalTransactions || 0);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Consolidated useEffect
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchTransactions();
    } else {
      const timeout = setTimeout(() => {
        fetchTransactions();
      }, 300);

      return () => clearTimeout(timeout);
    }
    //eslint-disable-next-line
  }, [searchParams, limit, currentPageNum]);

  // Handle debounce for search input
  useEffect(() => {
    if (selectedParamsType) {
      setSearchParams((prev) => ({
        ...prev,
        [selectedParamsType]: inputValue,
      }));
    }
    //eslint-disable-next-line
  }, [handleDebounce]);

  const handleCopy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        successToast("Copied to clipboard!");
      })
      .catch(() => {
        errorToast("Failed to copy text.");
      });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await axios.put(config.transaction.update(editingId), formData);
      } else {
        await axios.post(config.transaction.create(), formData);
      }
      setEditModalOpen(false);
      fetchTransactions();
    } catch (error) {
      console.error("Failed to save transaction", error);
    }
  };

  const handleDelete = async () => {
    try {
      if (deletingId) {
        await axios.delete(config.transaction.delete(deletingId));
        setDeleteModalOpen(false);
        fetchTransactions();
      }
    } catch (error) {
      console.error("Failed to delete transaction", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPageNum(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Updated filter logic for bKash transactions
  const getFilteredTransactions = () => {
    if (activeTab === "bkash") {
      // A transaction is bKash if vendor_transaction_id is not empty/null
      return transactions.filter(
        (t) => t.vendor_transaction_id && t.vendor_transaction_id.trim() !== ""
      );
    } else if (activeTab === "others") {
      // A transaction is others if vendor_transaction_id is empty/null
      return transactions.filter(
        (t) => !t.vendor_transaction_id || t.vendor_transaction_id.trim() === ""
      );
    }
    return transactions;
  };

  // Get transaction statistics
  const getTransactionStats = (filteredTransactions: any[]) => {
    const successful = filteredTransactions.filter((t) => t.success).length;
    const failed = filteredTransactions.filter((t) => !t.success).length;
    const totalAmount = filteredTransactions.reduce(
      (sum, t) => (Number(sum) ?? 0) + Number(t.amount || 0),
      0
    );
    const sales = filteredTransactions.filter(
      (t) => t.intent === "sale"
    ).length;
    const purchases = filteredTransactions.filter(
      (t) => t.intent === "purchase"
    ).length;

    return { successful, failed, totalAmount, sales, purchases };
  };

  const EmptyState = () => (
    <Card className='w-full'>
      <CardContent className='flex flex-col items-center justify-center py-16'>
        <div className='rounded-full bg-muted p-4 mb-4'>
          <CreditCard className='w-8 h-8 text-muted-foreground' />
        </div>
        <h3 className='text-lg font-semibold mb-2'>No Transactions Found</h3>
        <p className='text-muted-foreground text-center mb-6 max-w-md'>
          No transactions match your current filters. Try adjusting your search
          criteria or create a new transaction.
        </p>
        {hasRequiredPermission("Transaction", "create") && (
          <Button
            onClick={() => {
              setEditingId(null);
              setFormData({});
              setEditModalOpen(true);
            }}>
            <Plus className='w-4 h-4 mr-2' />
            Create Transaction
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const filteredTransactions = getFilteredTransactions();
  const stats = getTransactionStats(filteredTransactions);

  return (
    <MainView title='Transactions'>
      <div className='container mx-auto p-4 space-y-3'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Transactions</h1>
            <p className='text-muted-foreground'>
              Manage and monitor all your payment transactions
            </p>
          </div>
          {hasRequiredPermission("Transaction", "create") && (
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({});
                setEditModalOpen(true);
              }}>
              <Plus className='w-4 h-4 mr-2' />
              Create Transaction
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className='flex flex-col sm:flex-row gap-4 mt-4 p-2 border-2 border-dashed  rounded-lg'>
          <h3 className='flex text-base mr-2 md:mr-[30%] items-center gap-2'>
            <Filter className='h-5 w-5' />
            Filters & Search
          </h3>
          <Select
            value={searchParams["intent"] || "all"}
            onValueChange={(value: string) => {
              setSearchParams((prev) => ({
                ...prev,
                intent: value === "all" ? "" : value,
              }));
            }}>
            <SelectTrigger className='w-full sm:w-auto min-w-32'>
              <SelectValue placeholder='All Intents' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Filter by Intent</SelectLabel>
                <SelectItem value='all'>All Intents</SelectItem>
                <SelectItem value='sale'>Sales</SelectItem>
                <SelectItem value='purchase'>Purchases</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={selectedParamsType}
            onValueChange={(value: string) => {
              setSelectedParamType((prevOne) => {
                if (inputValue) {
                  setSearchParams((prev) => ({
                    ...prev,
                    [value]: inputValue,
                    [prevOne]: "",
                  }));
                }
                return value;
              });
            }}>
            <SelectTrigger className='w-full sm:w-auto min-w-36'>
              <SelectValue placeholder='Search by...' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Search Criteria</SelectLabel>
                <SelectItem value='vendor_id'>Vendor ID</SelectItem>
                <SelectItem value='vendor_transaction_id'>
                  Transaction ID
                </SelectItem>
                <SelectItem value='payment_from'>Payment Method</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className='relative flex-1'>
            <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
            <Input
              type='text'
              disabled={!selectedParamsType}
              placeholder='Enter search term...'
              className='pl-10'
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
            />
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && transactions.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            <Card className='shadow-none border-2 border-dashed border-sidebar/70'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
                <CardTitle className='text-sm font-medium'>
                  Successful
                </CardTitle>
                <CheckCircle className='h-4 w-4 text-green-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-green-600'>
                  {stats.successful}
                </div>
              </CardContent>
            </Card>
            <Card className='shadow-none border-2 border-dashed border-sidebar/70'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
                <CardTitle className='text-sm font-medium'>Failed</CardTitle>
                <XCircle className='h-4 w-4 text-red-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-red-600'>
                  {stats.failed}
                </div>
              </CardContent>
            </Card>
            <Card className='shadow-none border-2 border-dashed border-sidebar/70'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
                <CardTitle className='text-sm font-medium'>Sales</CardTitle>
                <TrendingUp className='h-4 w-4 text-blue-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-blue-600'>
                  {stats.sales}
                </div>
              </CardContent>
            </Card>
            <Card className='shadow-none border-2 border-dashed border-sidebar/70'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
                <CardTitle className='text-sm font-medium'>Purchases</CardTitle>
                <TrendingDown className='h-4 w-4 text-purple-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-purple-600'>
                  {stats.purchases}
                </div>
              </CardContent>
            </Card>
            <Card className='shadow-none border-2 border-dashed border-sidebar/70'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Amount
                </CardTitle>
                <DollarSign className='h-4 w-4 text-amber-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-amber-600'>
                  ৳{stats.totalAmount.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='w-full mt-4'>
          <TabsList className='grid grid-cols-3 w-full max-w-md mx-auto lg:mx-0'>
            <TabsTrigger value='all' className='flex items-center space-x-2'>
              <CreditCard className='h-4 w-4' />
              <span>All ({transactions.length})</span>
            </TabsTrigger>
            <TabsTrigger value='bkash' className='flex items-center space-x-2'>
              <img src={bkashIcon} className='h-4 w-4' alt='bKash' />
              <span>
                bKash (
                {
                  transactions.filter(
                    (t) =>
                      t.vendor_transaction_id &&
                      t.vendor_transaction_id.trim() !== ""
                  ).length
                }
                )
              </span>
            </TabsTrigger>
            <TabsTrigger value='others' className='flex items-center space-x-2'>
              <Wallet className='h-4 w-4' />
              <span>
                Others (
                {
                  transactions.filter(
                    (t) =>
                      !t.vendor_transaction_id ||
                      t.vendor_transaction_id.trim() === ""
                  ).length
                }
                )
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className='mt-4'>
            {loading ? (
              <TransactionSkeleton />
            ) : filteredTransactions.length === 0 ? (
              <EmptyState />
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-32'>
                        <div className='flex items-center gap-2'>
                          <Hash className='w-4 h-4' />
                          Transaction #
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className='flex items-center gap-2'>
                          <Activity className='w-4 h-4' />
                          Intent
                        </div>
                      </TableHead>
                      <TableHead className='w-32'>
                        <div className='flex items-center gap-2'>
                          <DollarSign className='w-4 h-4' />
                          Amount
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className='flex items-center gap-2'>
                          <CheckCircle className='w-4 h-4' />
                          Status
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className='flex items-center gap-2'>
                          <Package className='w-4 h-4' />
                          Vendor
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className='flex items-center gap-2'>
                          <CreditCard className='w-4 h-4' />
                          Payment From
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className='flex items-center gap-2'>
                          <Calendar className='w-4 h-4' />
                          Created At
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className='flex items-center gap-2'>
                          <CalendarRange className='w-4 h-4' />
                          Updated At
                        </div>
                      </TableHead>
                      {hasSomePermissionsForPage("Transaction", [
                        "edit",
                        "delete",
                      ]) && (
                        <TableHead className='w-24 text-center'>
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction?.id} className='group'>
                        <TableCell className='font-mono'>
                          <Badge variant='outline'>#{transaction?.id}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm w-fit'>
                            {transaction.intent === "sale" ? (
                              <TrendingUp className='h-3 w-3' />
                            ) : (
                              <TrendingDown className='h-3 w-3' />
                            )}
                            <span className='font-medium capitalize'>
                              {transaction.intent}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className='font-semibold'>
                          ৳{transaction.amount?.toLocaleString() || "0"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.success ? "default" : "destructive"
                            }
                            className={
                              transaction.success
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                            }>
                            {transaction.success ? (
                              <>
                                <CheckCircle className='h-3 w-3 mr-1' />
                                Success
                              </>
                            ) : (
                              <>
                                <XCircle className='h-3 w-3 mr-1' />
                                Failed
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction?.vendor_transaction_id &&
                          transaction.vendor_transaction_id.trim() !== "" ? (
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <div className='cursor-pointer flex items-center justify-start'>
                                  <img
                                    src={bkashIcon}
                                    className='h-8 w-auto hover:scale-110 transition-transform duration-200'
                                    alt='bKash'
                                  />
                                </div>
                              </HoverCardTrigger>
                              <HoverCardContent className='w-80'>
                                <div className='space-y-3'>
                                  <div className='flex items-center space-x-2'>
                                    <img
                                      src={bkashIcon}
                                      className='h-6 w-6'
                                      alt='bKash'
                                    />
                                    <h4 className='text-sm font-semibold'>
                                      bKash Transaction
                                    </h4>
                                  </div>
                                  <Separator />
                                  <div className='space-y-2'>
                                    <p className='text-xs text-gray-600'>
                                      Transaction ID:
                                    </p>
                                    <div className='flex items-center space-x-2'>
                                      <Badge
                                        variant='secondary'
                                        className='cursor-pointer hover:bg-gray-200 transition-colors font-mono text-xs'
                                        onClick={() =>
                                          handleCopy(
                                            transaction?.vendor_transaction_id
                                          )
                                        }>
                                        {transaction?.vendor_transaction_id}
                                      </Badge>
                                      <Button
                                        size='sm'
                                        variant='ghost'
                                        className='h-6 w-6 p-0'
                                        onClick={() =>
                                          handleCopy(
                                            transaction?.vendor_transaction_id
                                          )
                                        }>
                                        <Copy className='h-3 w-3' />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          ) : (
                            <Badge variant='outline' className='text-gray-500'>
                              <CreditCard className='h-3 w-3 mr-1' />
                              Manual
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline' className='capitalize'>
                            {transaction.payment_from || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {dayjs(transaction?.createdAt ?? "--").format(
                            "Do MMMM YYYY hh.mm A"
                          )}
                        </TableCell>
                        <TableCell>
                          {dayjs(transaction?.updatedAt ?? "--").format(
                            "Do MMMM YYYY hh.mm A"
                          )}
                        </TableCell>
                        {hasSomePermissionsForPage("Transaction", [
                          "edit",
                          "delete",
                        ]) && (
                          <TableCell>
                            <div className='flex items-center justify-center gap-1'>
                              {hasRequiredPermission("Transaction", "edit") && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                                  onClick={() => {
                                    setEditingId(transaction.id);
                                    setFormData(transaction);
                                    setEditModalOpen(true);
                                  }}>
                                  <Edit2Icon className='h-4 w-4' />
                                </Button>
                              )}
                              {hasRequiredPermission(
                                "Transaction",
                                "delete"
                              ) && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='text-red-600 hover:text-red-700 hover:bg-red-50'
                                  onClick={() => {
                                    setDeletingId(transaction.id);
                                    setDeleteModalOpen(true);
                                  }}>
                                  <Trash2 className='h-4 w-4' />
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
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {!loading && totalPageNum > 1 && (
          <Pagination
            currentPage={currentPageNum}
            totalPages={totalPageNum}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        )}

        {/* Page Info */}
        {!loading && transactions.length > 0 && (
          <Card className='border-0 shadow-none md:!mt-[-70px] z-10'>
            <CardContent className='flex flex-col sm:flex-row justify-between items-center py-4 space-y-4 sm:space-y-0'>
              <div className='text-sm text-gray-600'>
                Showing{" "}
                <span className='font-semibold text-gray-900'>
                  {Math.max(1, (currentPageNum - 1) * limit + 1)}-
                  {Math.min(currentPageNum * limit, totalTransactions)}
                </span>{" "}
                of{" "}
                <span className='font-semibold text-gray-900'>
                  {totalTransactions}
                </span>{" "}
                transactions
              </div>

              <div className='flex items-center space-x-2'>
                <Select
                  value={`${limit}`}
                  onValueChange={(value: string) =>
                    setLimit(parseInt(value, 10))
                  }>
                  <SelectTrigger className='w-auto'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Rows per page</SelectLabel>
                      <SelectItem value='5'>5</SelectItem>
                      <SelectItem value='10'>10</SelectItem>
                      <SelectItem value='25'>25</SelectItem>
                      <SelectItem value='50'>50</SelectItem>
                      <SelectItem value='100'>100</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit/Create Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Transaction" : "Create Transaction"}
              </DialogTitle>
            </DialogHeader>
            <div className='p-4'>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}>
                <div className='grid gap-2'>
                  <Label>Intent</Label>
                  <Select
                    value={formData.intent || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, intent: value })
                    }>
                    <SelectTrigger className='w-[180px]'>
                      <SelectValue placeholder='Select Intent' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Intent</SelectLabel>
                        <SelectItem value='sale'>Sale</SelectItem>
                        <SelectItem value='purchase'>Purchase</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-2 mt-4'>
                  <Label htmlFor='amount'>Transaction Amount</Label>
                  <Input
                    name='amount'
                    placeholder='Amount'
                    type='number'
                    value={formData.amount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className='grid gap-2 mt-4'>
                  <Label htmlFor='payment_from'>Payment From</Label>
                  <Input
                    name='payment_from'
                    placeholder='Payment From'
                    value={formData.payment_from || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_from: e.target.value })
                    }
                  />
                </div>
                <div className='flex items-center space-x-2 mt-4'>
                  <Checkbox
                    checked={formData.success || false}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, success: checked })
                    }
                  />
                  <Label>Transaction Successful</Label>
                </div>
                <div className='grid gap-2 mt-4'>
                  <Label htmlFor='vendor_transaction_id'>Transaction ID</Label>
                  {!editingId ? (
                    <Input
                      name='vendor_transaction_id'
                      placeholder='Vendor Transaction ID'
                      value={formData.vendor_transaction_id || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vendor_transaction_id: e.target.value,
                        })
                      }
                      disabled={!!editingId}
                    />
                  ) : (
                    formData?.vendor_transaction_id && (
                      <Badge variant='outline' className='w-auto text-center'>
                        {formData?.vendor_transaction_id}
                      </Badge>
                    )
                  )}
                </div>
                <div className='grid gap-2 mt-4'>
                  <Label htmlFor='vendor_id'>Vendor ID</Label>
                  <Input
                    name='vendor_id'
                    placeholder='Vendor ID'
                    type='number'
                    value={formData.vendor_id || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vendor_id: parseInt(e.target.value, 10),
                      })
                    }
                  />
                </div>
                <div className='grid gap-2 mt-4'>
                  <Label htmlFor='payment_id'>Payment ID</Label>
                  <Input
                    name='payment_id'
                    placeholder='Payment ID'
                    type='number'
                    value={formData.payment_id || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_id: e.target.value,
                      })
                    }
                  />
                </div>
                <div className='flex justify-end gap-2 mt-6'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setEditModalOpen(false)}>
                    Cancel
                  </Button>
                  {hasRequiredPermission("Transaction", "create") && (
                    <Button type='submit'>
                      {editingId ? "Update" : "Create"}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Modal */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Transaction</DialogTitle>
            </DialogHeader>
            <div className='p-4'>
              <p className='mb-6'>
                Are you sure you want to delete this transaction? This action
                cannot be undone.
              </p>
              <div className='flex justify-end gap-4'>
                <Button
                  variant='outline'
                  onClick={() => setDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant='destructive' onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainView>
  );
};

export default TransactionsPage;
