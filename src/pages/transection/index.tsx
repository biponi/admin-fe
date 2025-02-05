import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Table } from "../../components/ui/table";
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
import config from "../../utils/config";
import axios from "../../api/axios";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../components/ui/hover-card";
import bkashIcon from "../../images/bkash-icon.png";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { errorToast, successToast } from "../../utils/toast";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import useLoginAuth from "../auth/hooks/useLoginAuth";
import { ChevronLeft, ChevronRight, Edit2Icon, Trash2 } from "lucide-react";
import useDebounce from "../../customHook/useDebounce";
import MainView from "../../coreComponents/mainView";

const defaultParams = {
  intent: "",
  payment_from: "",
  timestamp: "",
  vendor_transaction_id: "",
  vendor_id: "",
};

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [currentPageNum, setCurrentPageNum] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalPageNum, setTotalPageNum] = useState(0);
  const [limit, setLimit] = useState(50);
  const [selectedParamsType, setSelectedParamType] = useState("");
  const [searchParams, setSearchParams] = useState(defaultParams);
  const handleDebounce = useDebounce(inputValue, 500);

  const { user } = useLoginAuth();

  // Track the initial render
  const isFirstRender = useRef(true);

  // Fetch transactions from the backend
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(config.transaction.search(), {
        params: { ...searchParams, limit, offset: currentPageNum },
      });
      setTransactions(response?.data?.transactions);
      setTotalPageNum(response?.data?.totalPages);
      setTotalTransactions(response?.data?.totalTransactions);
      if (currentPageNum !== response?.data?.currentPage) {
        setCurrentPageNum(response?.data?.currentPage);
      }
    } catch (error) {
      console.error("Failed to fetch transactions", error);
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
      }, 300); // Optional delay to batch updates

      return () => clearTimeout(timeout); // Cleanup
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

  const updateCurrentPage = (seq: number) => {
    if (currentPageNum + seq > totalPageNum || currentPageNum + seq < 0) {
      return;
    }
    setCurrentPageNum((prev) => prev + seq);
  };

  const renderCardView = () => {
    return (
      <Card
        x-chunk="dashboard-06-chunk-0"
        className="mt-4 border-0 rounded-none shadow-none"
      >
        <CardHeader>
          <div className="flex w-full justify-between">
            <div className="mr-auto">
              <CardTitle>Transaction</CardTitle>
              <CardDescription>
                Manage your transactions and view your transactions history.
              </CardDescription>
            </div>
            <div className="ml-auto grid grid-cols-2 gap-4 sm:flex sm:justify-between sm:items-center">
              <div className="flex justify-center items-center gap-2">
                <Select
                  value={searchParams["intent"]}
                  onValueChange={(value: string) => {
                    setSearchParams((prev) => {
                      return { ...prev, intent: value };
                    });
                  }}
                >
                  <SelectTrigger className="w-auto">
                    <SelectValue placeholder="Select an intent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Intents</SelectLabel>
                      <SelectItem value="sale">Sales</SelectItem>
                      <SelectItem value="purchase">Purchases</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedParamsType}
                  onValueChange={(value: string) => {
                    setSelectedParamType((prevOne) => {
                      if (!!inputValue)
                        setSearchParams((prev) => {
                          return {
                            ...prev,
                            [value]: inputValue,
                            [prevOne]: "",
                          };
                        });
                      return value;
                    });
                  }}
                >
                  <SelectTrigger className="w-auto">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Search By</SelectLabel>
                      <SelectItem value="vendor_id">Vendor Id</SelectItem>
                      <SelectItem value="vendor_transaction_id">
                        Transaction Id
                      </SelectItem>
                      <SelectItem value="payment_from">Payment From</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  disabled={!selectedParamsType}
                  placeholder="Search"
                  onChange={(event) => {
                    setInputValue(event.target.value);
                  }}
                />
              </div>
              {user?.role !== "admin" && (
                <Button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({});
                    setEditModalOpen(true);
                  }}
                >
                  Create Transaction
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto">
          <Table className="my-4">
            <thead className="border bg-slate-950 text-white">
              <tr>
                <th className=" border-x border-white ">ID</th>
                <th className=" border-x border-white ">Intent</th>
                <th className=" border-x border-white ">Amount</th>
                <th className=" border-x border-white ">Success</th>
                <th className=" border-x border-white ">Vendor</th>
                <th className=" border-x border-white ">Payment From</th>
                <th className=" border-x border-white ">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className=" border-b border-gray-300 ">
                  <td colSpan={6}>Loading...</td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr
                    key={transaction?.id}
                    className=" border-b border-gray-300 "
                  >
                    <td className=" border-x border-gray-300 text-center">
                      {transaction?.id}
                    </td>
                    <td className=" border-x border-gray-300 text-center">
                      {transaction.intent}
                    </td>
                    <td className=" border-x border-gray-300 text-center">
                      {transaction.amount}
                    </td>
                    <td className=" border-x border-gray-300 text-center">
                      {transaction.success ? "Yes ✅" : "No ❌"}
                    </td>
                    <td className=" border-x border-gray-300 text-center">
                      {!!transaction?.vendor_transaction_id ? (
                        <HoverCard>
                          <HoverCardTrigger>
                            <img
                              src={bkashIcon}
                              className="w-16 mx-auto"
                              alt="bkash"
                            />
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <div className="p-8">
                              <h1 className="text-lg font-semibold">
                                Transaction Id:
                              </h1>
                              <Separator />
                              <div className="flex justify-center items-center gap-2">
                                <Badge
                                  variant={"default"}
                                  className=" cursor-pointer "
                                  onClick={() =>
                                    handleCopy(
                                      transaction?.vendor_transaction_id
                                    )
                                  }
                                >
                                  {transaction?.vendor_transaction_id}
                                </Badge>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ) : (
                        <Badge variant={"outline"}>N/A</Badge>
                      )}
                    </td>
                    <td className=" border-x border-gray-300 text-center">
                      {transaction.payment_from}
                    </td>
                    <td className=" border-x border-gray-300 text-center flex items-center justify-center gap-6">
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingId(transaction.id);
                          setFormData(transaction);
                          setEditModalOpen(true);
                        }}
                      >
                        <Edit2Icon className="w-5 h-5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setDeletingId(transaction.id);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </CardContent>
        {inputValue === "" && (
          <CardFooter>
            <div className="w-full flex justify-between items-center py-4">
              <div className="text-xs text-muted-foreground">
                Showing{" "}
                <strong>{`${
                  (Number(currentPageNum) - 1) * limit + 1
                }-${Math.min(
                  Number(currentPageNum) * limit,
                  totalTransactions
                )}`}</strong>{" "}
                of <strong>{totalTransactions}</strong> transactions
              </div>
              <div className="flex gap-2 items-center">
                <Select
                  value={`${limit}`}
                  onValueChange={(value: string) => {
                    setLimit(parseInt(value, 10));
                  }}
                >
                  <SelectTrigger className="w-auto">
                    <SelectValue placeholder="Select Row Limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Limit</SelectLabel>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="150">150</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>{" "}
                Row Per Page{" "}
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
                  disabled={currentPageNum >= totalPageNum}
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
    );
  };

  return (
    <MainView title="Transactions">
      <div className="w-[95vw] pb-6">
        {renderCardView()}

        {/* Edit/Create Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Transaction" : "Create Transaction"}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <div className="grid gap-2">
                  <Label>Intent</Label>
                  <Select
                    value={formData.intent || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, intent: value })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Intent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Intent</SelectLabel>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="purchase">Purchase</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="amount">Transaction Amount</Label>
                  <Input
                    name="amount"
                    placeholder="Amount"
                    type="number"
                    value={formData.amount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="payment_from">Payment From</Label>
                  <Input
                    name="payment_from"
                    placeholder="Payment From"
                    value={formData.payment_from || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_from: e.target.value })
                    }
                  />
                </div>
                <Checkbox
                  checked={formData.success || false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, success: checked })
                  }
                  className="mt-4 mr-2"
                />
                Transaction Successful
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="vendor_transaction_id">Transaction Id</Label>
                  {!editingId && (
                    <Input
                      name="vendor_transaction_id"
                      placeholder="Vendor Transaction ID"
                      value={formData.vendor_transaction_id || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vendor_transaction_id: e.target.value,
                        })
                      }
                      disabled={!!editingId}
                    />
                  )}
                  {!!editingId && !!formData?.vendor_transaction_id ? (
                    <Badge variant={"outline"} className="w-auto text-center">
                      {formData?.vendor_transaction_id}
                    </Badge>
                  ) : (
                    ""
                  )}
                </div>
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="vendor_id">Vendor Id</Label>
                  <Input
                    name="vendor_id"
                    placeholder="Vendor ID"
                    type="number"
                    value={formData.vendor_id || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vendor_id: parseInt(e.target.value, 10),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="payment_id">Paymnent Id</Label>
                  <Input
                    name="payment_id"
                    placeholder="Payment ID"
                    type="number"
                    value={formData.payment_id || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_id: e.target.value,
                      })
                    }
                  />
                </div>
                <Button type="submit" className="mt-4">
                  {editingId ? "Update" : "Create"}
                </Button>
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
            <div className="p-4">
              <p>Are you sure you want to delete this transaction?</p>
              <div className="flex justify-end gap-4 mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
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
