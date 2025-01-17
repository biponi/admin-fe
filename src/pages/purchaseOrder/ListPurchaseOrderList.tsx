import React, { useEffect, useState } from "react";
import {
  deletePurchaseOrder,
  fetchPurchaseOrders,
  restorePurchaseOrder,
} from "./services/purchaseOrderApi";
import { PurchaseOrder } from "./types";
import { Table } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { ArchiveRestore, Bird, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "../../components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ListPurchaseOrders: React.FC = () => {
  const naviagate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    fetchPurchaseOrders()
      .then((res) => {
        if (!!res) {
          setPurchaseOrders(res.purchaseOrders ?? []);
        } else setPurchaseOrders([]);
      })
      .catch((err) => {
        console.error(err);
        setPurchaseOrders([]);
      });
  }, []);

  const handleDelete = (id: string) => {
    deletePurchaseOrder(id)
      .then(() => {
        setPurchaseOrders((prev) => prev.filter((order) => order.id !== id));
        toast.success("Purchase order deleted successfully!");
      })
      .catch((err) => {
        console.error(err);
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data?.message);
        } else toast.error("Couldn't delete the purchase order");
      });
  };

  const handleRestorePurchaseOrder = (id: string) => {
    restorePurchaseOrder(id)
      .then(() => {
        setPurchaseOrders((prev) => prev.filter((order) => order.id !== id));
        toast.success("Purchase order restore successfully!");
      })
      .catch((err) => {
        console.error(err);
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data?.message);
        } else toast.error("Couldn't restore the purchase order");
      });
  };

  return (
    <div className="p-6 w-[90vw]">
      <div className="flex justify-between items-center w-full mb-4">
        <h1 className="text-2xl font-bold mb-4">Purchase Orders</h1>
        <Button onClick={() => naviagate("/purchase-order/create")}>
          Create Purchase Order
        </Button>
      </div>
      {!purchaseOrders ||
        (purchaseOrders.length === 0 && (
          <div className="w-full p-10 flex justify-center items-center bg-gray-200">
            <div className="text-center">
              <Bird className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg">No data found</p>
            </div>
          </div>
        ))}
      {!!purchaseOrders && purchaseOrders.length > 0 && (
        <Table className="border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="text-lg border border-gray-300 p-2">ID</th>
              <th className="text-lg border border-gray-300 p-2">Products</th>
              <th className="text-lg border border-gray-300 p-2">
                Total Amount
              </th>
              <th className="text-lg border border-gray-300 p-2">Created At</th>
              <th className="text-lg border border-gray-300 p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.map((order) => (
              <tr key={order?.id} className="border border-gray-300">
                <td className="border border-gray-300 p-2">
                  {order?.purchaseNumber}
                </td>
                <td className="border border-gray-300 p-2">
                  <div className="flex flex-wrap gap-1">
                    {order.products.map((product) => (
                      <Badge key={product?.productId} className="mr-1 mb-1">
                        {product?.title} {`(${product?.quantity})`}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="border border-gray-300 p-2">
                  {order?.totalAmount}
                </td>
                <td className="border border-gray-300 p-2">
                  {new Date(order?.createdAt).toLocaleString()}
                </td>
                <td className="border border-gray-300 p-2">
                  <div className="w-full grid grid-cols-2 gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <ArchiveRestore className=" text-purple-500 cursor-pointer mx-auto" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your purchase order and remove the product
                            data from the list.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleRestorePurchaseOrder(order?.id)
                            }
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Trash2
                      onClick={() => handleDelete(order?.id)}
                      className="text-red-500 cursor-pointer mx-auto"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ListPurchaseOrders;
