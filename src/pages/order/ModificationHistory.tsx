/**
 * ModificationHistory Component
 *
 * Displays the complete modification history for an order.
 * Shows all changes made to the order with timestamps, user info, and detailed change summaries.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getModificationHistory,
  ModificationHistoryEntry,
} from "../../api/order";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Alert, AlertDescription } from "../../components/ui/alert";
import {
  ArrowLeft,
  Clock,
  User,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  Edit3,
  DollarSign,
  Loader2,
  AlertCircle,
  History,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { Badge } from "../../components/ui/badge";

const ModificationHistory = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      fetchHistory();
    }

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchHistory = async () => {
    if (!orderId) return;
    setLoading(true);

    try {
      const response = await getModificationHistory(orderId);

      if (response.success && response.data) {
        setHistoryData(response.data);
      } else {
        toast.error(response.error || "Failed to load modification history");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load modification history");
    } finally {
      setLoading(false);
    }
  };

  const renderModificationEntry = (
    entry: ModificationHistoryEntry,
    index: number
  ) => {
    const modifiedDate = new Date(entry.timestamps.createdAt);

    // Calculate summary from oldState and newState
    const oldProductCount = entry.oldState?.products?.length || 0;
    const newProductCount = entry.newState?.products?.length || 0;
    const oldTotalPrice = entry.oldState?.totalPrice || 0;
    const newTotalPrice = entry.newState?.totalPrice || 0;
    const priceDiff = newTotalPrice - oldTotalPrice;

    return (
      <Card
        key={entry.id}
        className='border-2 border-gray-200 shadow-sm rounded-t-lg'>
        <CardHeader className='bg-gradient-to-r from-gray-50 to-gray-100 border-b pb-4 rounded-t-lg px-6 pt-6 mb-4'>
          <div className='flex items-start justify-between rounded-t-lg'>
            <div className='flex items-start gap-3'>
              <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                <User className='w-5 h-5 text-blue-600' />
              </div>
              <div>
                <CardTitle className='text-base font-semibold text-gray-900'>
                  Modified by {entry.performedBy.userName}
                </CardTitle>
                <CardDescription className='text-sm text-gray-600 mt-1'>
                  {entry.performedBy.userEmail}
                </CardDescription>
              </div>
            </div>
            <div className='text-right'>
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <Clock className='w-4 h-4' />
                {format(modifiedDate, "MMM dd, yyyy")}
              </div>
              <div className='text-xs text-gray-500 mt-1'>
                {format(modifiedDate, "hh:mm a")}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-6'>
          {/* Summary */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='bg-blue-50 rounded-lg p-3 border border-blue-200'>
              <div className='flex items-center gap-2 text-blue-700 text-sm mb-1'>
                <Package className='w-4 h-4' />
                Products
              </div>
              <div className='font-semibold text-gray-900'>
                {oldProductCount} → {newProductCount}
              </div>
            </div>

            <div className='bg-purple-50 rounded-lg p-3 border border-purple-200'>
              <div className='flex items-center gap-2 text-purple-700 text-sm mb-1'>
                <DollarSign className='w-4 h-4' />
                Total Price
              </div>
              <div className='font-semibold text-gray-900'>
                ৳{oldTotalPrice} → ৳{newTotalPrice}
              </div>
            </div>

            <div
              className={`rounded-lg p-3 border ${
                priceDiff > 0
                  ? "bg-green-50 border-green-200"
                  : priceDiff < 0
                  ? "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"
              }`}>
              <div
                className={`flex items-center gap-2 text-sm mb-1 ${
                  priceDiff > 0
                    ? "text-green-700"
                    : priceDiff < 0
                    ? "text-red-700"
                    : "text-gray-700"
                }`}>
                {priceDiff > 0 ? (
                  <TrendingUp className='w-4 h-4' />
                ) : priceDiff < 0 ? (
                  <TrendingDown className='w-4 h-4' />
                ) : (
                  <Minus className='w-4 h-4' />
                )}
                Difference
              </div>
              <div
                className={`font-semibold ${
                  priceDiff > 0
                    ? "text-green-700"
                    : priceDiff < 0
                    ? "text-red-700"
                    : "text-gray-900"
                }`}>
                {priceDiff > 0 ? "+" : ""}৳{priceDiff}
              </div>
            </div>
          </div>

          <Separator className='my-4' />

          {/* Changes */}
          <div>
            <h4 className='font-semibold text-gray-900 mb-3 flex items-center gap-2'>
              <Edit3 className='w-4 h-4' />
              Changes Made ({entry.changesummary.length})
            </h4>
            <div className='space-y-3'>
              {/* Show reason summary */}
              {entry.reason && (
                <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                  <div className='text-sm font-medium text-blue-900'>
                    {entry.reason}
                  </div>
                </div>
              )}

              {/* Show detailed changes */}
              {entry.changesummary.map((change, idx) => {
                const isProductChange = change.field === "products";

                return (
                  <div
                    key={idx}
                    className='p-3 rounded-lg border bg-gray-50 border-gray-200'>
                    <div className='flex-1'>
                      <div className='font-medium text-sm text-gray-900 mb-2'>
                        {change.field.charAt(0).toUpperCase() +
                          change.field.slice(1).replace(/([A-Z])/g, " $1")}
                      </div>

                      {isProductChange ? (
                        // Special rendering for product changes
                        <div className='space-y-2'>
                          <div className='text-xs text-gray-500'>
                            Old Products:
                          </div>
                          {Array.isArray(change.oldValue) &&
                            change.oldValue.map((product: any, i: number) => (
                              <div
                                key={i}
                                className='text-sm bg-white p-2 rounded border border-gray-200'>
                                <div className='font-medium'>
                                  {product.name} x{product.quantity}
                                </div>
                                {product.variation && (
                                  <div className='text-xs text-gray-600'>
                                    {product.variation.color &&
                                      `Color: ${product.variation.color}`}
                                    {product.variation.size &&
                                      ` Size: ${product.variation.size}`}
                                  </div>
                                )}
                                <div className='text-xs text-gray-600'>
                                  ৳{product.unitPrice}
                                </div>
                              </div>
                            ))}

                          <div className='text-xs text-gray-500 mt-2'>
                            New Products:
                          </div>
                          {Array.isArray(change.newValue) &&
                            change.newValue.map((product: any, i: number) => (
                              <div
                                key={i}
                                className='text-sm bg-white p-2 rounded border border-green-200'>
                                <div className='font-medium'>
                                  {product.name} x{product.quantity}
                                </div>
                                {product.variation && (
                                  <div className='text-xs text-gray-600'>
                                    {product.variation.color &&
                                      `Color: ${product.variation.color}`}
                                    {product.variation.size &&
                                      ` Size: ${product.variation.size}`}
                                  </div>
                                )}
                                <div className='text-xs text-gray-600'>
                                  ৳{product.unitPrice}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        // Regular field changes
                        <div className='text-sm'>
                          <span className='text-gray-600'>
                            <span className='font-medium text-red-700'>
                              {typeof change.oldValue === "object"
                                ? JSON.stringify(change.oldValue)
                                : change.oldValue}
                            </span>
                          </span>
                          <span className='text-gray-500 mx-2'>→</span>
                          <span className='text-gray-600'>
                            <span className='font-medium text-green-700'>
                              {typeof change.newValue === "object"
                                ? JSON.stringify(change.newValue)
                                : change.newValue}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin text-blue-600 mx-auto mb-4' />
          <p className='text-gray-600'>Loading modification history...</p>
        </div>
      </div>
    );
  }

  if (!historyData) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Alert className='max-w-md border-red-200 bg-red-50'>
          <AlertCircle className='h-4 w-4 text-red-600' />
          <AlertDescription className='text-red-800'>
            Failed to load modification history. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <Button
            variant='outline'
            onClick={() => navigate("/order")}
            className='mb-4 h-10 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Orders
          </Button>

          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center'>
              <History className='w-6 h-6 text-white' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Modification History
              </h1>
              <p className='text-gray-600 mt-1'>
                Order #{historyData.modifications[0]?.orderNumber || "N/A"} •{" "}
                <Badge variant={"destructive"}>
                  {historyData.modifications.length} modification
                  {historyData.modifications.length !== 1 ? "s" : ""}
                </Badge>
              </p>
            </div>
          </div>
        </div>

        {/* Modifications List */}
        {historyData.modifications.length === 0 ? (
          <Card className='border-2 border-dashed border-gray-300'>
            <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
              <History className='w-16 h-16 text-gray-300 mb-4' />
              <h3 className='text-xl font-semibold text-gray-700 mb-2'>
                No Modifications Yet
              </h3>
              <p className='text-gray-500 max-w-sm'>
                This order hasn't been modified yet. Any changes will appear
                here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 gap-6  max-h-[70vh] overflow-y-auto'>
            {historyData.modifications.map(
              (entry: ModificationHistoryEntry, index: number) =>
                renderModificationEntry(entry, index)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModificationHistory;
