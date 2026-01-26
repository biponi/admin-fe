import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { IOrderProduct } from "../product/interface";
import PlaceHolderImage from "../../assets/placeholder.svg";
import { Button } from "../../components/ui/button";
import { ITransection } from "./interface";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  ShoppingCart,
  User,
  MapPin,
  Phone,
  Mail,
  Package,
  DollarSign,
  FileText,
  ArrowLeft,
  CreditCard,
  Truck,
  Calculator,
  Receipt,
  AlertCircle,
  Send,
} from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { toast } from "react-hot-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

interface Props {
  notes: string;
  transection: ITransection;
  orderProducts: IOrderProduct[];
  customerInformation: { customer: any; shipping: any };
  handleCreateOrder: () => void;
  handleBack: () => void;
  setNotes: (value: string) => void;
}

const OrderPreview: React.FC<Props> = ({
  notes,
  setNotes,
  handleBack,
  transection,
  orderProducts,
  handleCreateOrder,
  customerInformation,
}) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateOrderWithLoading = () => {
    setIsCreating(true);
    try {
      handleCreateOrder();
      toast.success("Order created successfully! 🎉");
    } catch (error) {
      toast.error("Failed to create order");
    } finally {
      setIsCreating(false);
    }
  };

  const renderSelectedProduct = (product: IOrderProduct, index: number) => {
    return (
      <Card
        key={`${product?.id}-${index}`}
        className='border border-gray-200 hover:border-blue-200 transition-all duration-200'>
        <CardContent className='p-2.5'>
          <div className='flex items-start gap-3'>
            <div className='w-14 h-14 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0'>
              <img
                alt={product?.name}
                className='w-full h-full object-cover'
                src={product?.thumbnail || PlaceHolderImage}
              />
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between'>
                <div className='flex-1 min-w-0'>
                  <h4 className='font-semibold text-sm text-gray-900 truncate'>
                    {product?.name}
                  </h4>

                  <div className='flex flex-wrap gap-1.5 mt-1.5'>
                    <Badge variant='outline' className='text-xs px-1.5 py-0'>
                      Qty: {product?.selectedQuantity}
                    </Badge>

                    {product?.hasVariation && product.selectedVariant && (
                      <Badge
                        variant='outline'
                        className='text-xs bg-blue-50 text-blue-700 border-blue-200 px-1.5 py-0'>
                        {product.selectedVariant.color}
                        {product.selectedVariant.color &&
                          product.selectedVariant.size &&
                          " • "}
                        {product.selectedVariant.size}
                      </Badge>
                    )}

                    {!product?.hasVariation && (
                      <Badge variant='secondary' className='text-xs px-1.5 py-0'>
                        No Variant
                      </Badge>
                    )}
                  </div>
                </div>

                <div className='text-right ml-3'>
                  <div className='font-bold text-sm text-gray-900'>
                    ৳{product?.totalPrice}
                  </div>
                  <div className='text-xs text-gray-500'>
                    ৳
                    {(product?.totalPrice / product?.selectedQuantity).toFixed(
                      2
                    )}{" "}
                    ea
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSelectedProductList = () => {
    if (!orderProducts || orderProducts.length < 1) {
      return (
        <Alert className='border-orange-200 bg-orange-50'>
          <AlertCircle className='h-4 w-4 text-orange-600' />
          <AlertDescription className='text-orange-800'>
            No products selected for this order. Please go back and add
            products.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <ScrollArea className='max-h-[60vh]'>
        <div className='space-y-3'>
          {orderProducts.map((product: IOrderProduct, index) =>
            renderSelectedProduct(product, index)
          )}
        </div>
      </ScrollArea>
    );
  };

  const renderTransectionData = () => {
    const totalItems =
      orderProducts?.reduce(
        (sum, product) => sum + product.selectedQuantity,
        0
      ) || 0;

    return (
      <div className='space-y-4'>
        {/* Summary Header */}
        <div className='flex items-center gap-2 mb-4'>
          <Calculator className='w-5 h-5 text-blue-600' />
          <span className='font-semibold text-gray-900'>Order Summary</span>
        </div>

        {/* Order Stats */}
        <div className='grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-600'>
              {orderProducts?.length || 0}
            </div>
            <div className='text-xs text-gray-600'>Products</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {totalItems}
            </div>
            <div className='text-xs text-gray-600'>Items</div>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between py-2'>
            <span className='text-sm text-gray-600 flex items-center gap-2'>
              <Package className='w-4 h-4' />
              Subtotal
            </span>
            <span className='font-medium text-gray-900'>
              ৳{transection.totalPrice}
            </span>
          </div>

          <div className='flex items-center justify-between py-2'>
            <span className='text-sm text-gray-600 flex items-center gap-2'>
              <Receipt className='w-4 h-4' />
              Discount
            </span>
            <span className='font-medium text-red-600'>
              -৳{transection.discount}
            </span>
          </div>

          <div className='flex items-center justify-between py-2'>
            <span className='text-sm text-gray-600 flex items-center gap-2'>
              <Truck className='w-4 h-4' />
              Delivery
            </span>
            <span className='font-medium text-gray-900'>
              ৳{transection.deliveryCharge}
            </span>
          </div>

          <Separator />

          <div className='flex items-center justify-between py-2 text-base font-semibold'>
            <span className='text-gray-900 flex items-center gap-2'>
              <DollarSign className='w-4 h-4' />
              Total Amount
            </span>
            <span className='text-gray-900'>
              ৳
              {transection.totalPrice +
                transection.deliveryCharge -
                transection.discount}
            </span>
          </div>

          <div className='flex items-center justify-between py-2 bg-green-50 px-3 rounded-lg'>
            <span className='text-sm text-green-700 flex items-center gap-2 font-medium'>
              <CreditCard className='w-4 h-4' />
              Paid Amount
            </span>
            <span className='font-semibold text-green-700'>
              ৳{transection.paid}
            </span>
          </div>

          <div
            className={`flex items-center justify-between py-2 px-3 rounded-lg ${
              transection.remaining > 0 ? "bg-red-50" : "bg-green-50"
            }`}>
            <span
              className={`text-sm font-medium flex items-center gap-2 ${
                transection.remaining > 0 ? "text-red-700" : "text-green-700"
              }`}>
              <AlertCircle className='w-4 h-4' />
              Remaining
            </span>
            <span
              className={`font-bold text-lg ${
                transection.remaining > 0 ? "text-red-700" : "text-green-700"
              }`}>
              ৳{transection.remaining}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomerPersonalInformation = () => {
    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-2 mb-4'>
          <User className='w-5 h-5 text-blue-600' />
          <span className='font-semibold text-gray-900'>Customer Details</span>
        </div>

        <div className='space-y-4'>
          <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
            <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
              <User className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <div className='font-medium text-gray-900'>
                {customerInformation.customer.name}
              </div>
              <div className='text-sm text-gray-500'>Customer Name</div>
            </div>
          </div>

          {customerInformation.customer.email && (
            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
              <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                <Mail className='w-5 h-5 text-green-600' />
              </div>
              <div>
                <div className='font-medium text-gray-900'>
                  {customerInformation.customer.email}
                </div>
                <div className='text-sm text-gray-500'>Email Address</div>
              </div>
            </div>
          )}

          <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
            <div className='w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center'>
              <Phone className='w-5 h-5 text-purple-600' />
            </div>
            <div>
              <div className='font-medium text-gray-900'>
                {customerInformation.customer.phoneNumber}
              </div>
              <div className='text-sm text-gray-500'>Phone Number</div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderCustomerShippingInformation = () => {
    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-2 mb-4'>
          <MapPin className='w-5 h-5 text-orange-600' />
          <span className='font-semibold text-gray-900'>Shipping Address</span>
        </div>

        <div className='p-4 bg-orange-50 rounded-lg border border-orange-200'>
          <div className='space-y-3'>
            <div>
              <div className='text-sm text-orange-700 font-medium'>
                Division
              </div>
              <div className='text-gray-900 font-semibold'>
                {customerInformation.shipping.division.name}
              </div>
            </div>

            <div>
              <div className='text-sm text-orange-700 font-medium'>
                District
              </div>
              <div className='text-gray-900 font-semibold'>
                {customerInformation.shipping.district.name}
              </div>
            </div>

            <div>
              <div className='text-sm text-orange-700 font-medium'>
                Full Address
              </div>
              <div className='text-gray-900 mt-1 p-3 bg-white rounded border border-orange-100'>
                {customerInformation.shipping.address}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderCustomerinforamtionPreview = () => {
    return (
      <Card className='border-2 border-gray-200 shadow-sm'>
        <CardHeader className='bg-gradient-to-r from-gray-50 to-gray-100 border-b rounded-lg m-2'>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <ShoppingCart className='w-6 h-6 text-blue-600' />
            Order Preview
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <div>{renderCustomerPersonalInformation()}</div>
            <div>{renderCustomerShippingInformation()}</div>
          </div>

          <Separator className='my-8' />

          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <FileText className='w-5 h-5 text-gray-600' />
              <Label className='font-semibold text-gray-900'>Order Notes</Label>
            </div>
            <Textarea
              className='w-full min-h-[120px] border-2 focus:border-blue-500 rounded-lg'
              value={notes}
              onChange={(e: any) => setNotes(e.target.value)}
              placeholder='Add any special instructions or notes for this order...'
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='min-h-screen border-2 border-dashed border-gray-200 rounded-lg bg-white'>
      <div className='container max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-3 md:py-4'>
        {/* Header */}
        <div className='mb-3 md:mb-4 hidden md:block'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md'>
              <ShoppingCart className='w-5 h-5 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Order Preview
              </h1>
              <p className='text-xs text-gray-600 mt-0.5'>
                Review order details before confirmation
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          {/* Left Column - Customer Information */}
          <div className='md:col-span-2 space-y-3'>
            <Tabs defaultValue='products' className='w-full'>
              <TabsList className='h-9'>
                <TabsTrigger value='products' className='text-sm'>Selected Products</TabsTrigger>
                <TabsTrigger value='customer' className='text-sm'>Customer Information</TabsTrigger>
              </TabsList>
              <TabsContent value='products' className='mt-2'>
                {/* Products Card */}
                <Card className='border border-gray-200 shadow-sm'>
                  <CardHeader className='bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-3'>
                    <CardTitle className='flex items-center gap-2 text-base text-green-800'>
                      <ShoppingCart className='w-4 h-4' />
                      Selected Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-3'>
                    {renderSelectedProductList()}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value='customer' className='mt-2'>
                {renderCustomerinforamtionPreview()}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Products & Summary */}
          <div className='md:col-span-1 md:mt-9'>
            {/* Summary Card */}
            <Card className='border border-blue-200 shadow-sm bg-gradient-to-br from-blue-50/50 to-purple-50/50'>
              <CardHeader className='bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3'>
                <CardTitle className='flex items-center gap-2 text-white text-base'>
                  <Calculator className='w-4 h-4' />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='p-3'>
                {renderTransectionData()}
              </CardContent>

              {/* Action Buttons */}
              <div className='p-3 border-t bg-white rounded-b-lg'>
                <div className='flex flex-col gap-2'>
                  <Button
                    variant='outline'
                    onClick={handleBack}
                    className='flex-1 border-gray-300 hover:bg-gray-50 h-9 text-sm'>
                    <ArrowLeft className='w-3.5 h-3.5 mr-1.5' />
                    Back to Edit
                  </Button>
                  <Button
                    disabled={
                      !orderProducts || orderProducts.length < 1 || isCreating
                    }
                    onClick={handleCreateOrderWithLoading}
                    className='flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md h-9 text-sm'>
                    {isCreating ? (
                      <>
                        <div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5' />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className='w-4 h-4 mr-1.5' />
                        Create Order Now
                      </>
                    )}
                  </Button>
                </div>

                {(!orderProducts || orderProducts.length < 1) && (
                  <Alert className='mt-2 border-red-200 bg-red-50 py-1.5 px-2.5'>
                    <AlertCircle className='h-3.5 w-3.5 text-red-600' />
                    <AlertDescription className='text-red-800 text-xs'>
                      Please add at least one product to create an order.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPreview;
