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
        <CardContent className='p-4'>
          <div className='flex items-start gap-4'>
            <div className='w-16 h-16 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0'>
              <img
                alt={product?.name}
                className='w-full h-full object-cover'
                src={product?.thumbnail || PlaceHolderImage}
              />
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between'>
                <div className='flex-1 min-w-0'>
                  <h4 className='font-semibold text-gray-900 truncate text-base'>
                    {product?.name}
                  </h4>

                  <div className='flex flex-wrap gap-2 mt-2'>
                    <Badge variant='outline' className='text-xs'>
                      Qty: {product?.selectedQuantity}
                    </Badge>

                    {product?.hasVariation && product.selectedVariant && (
                      <Badge
                        variant='outline'
                        className='text-xs bg-blue-50 text-blue-700 border-blue-200'>
                        {product.selectedVariant.color}
                        {product.selectedVariant.color &&
                          product.selectedVariant.size &&
                          " • "}
                        {product.selectedVariant.size}
                      </Badge>
                    )}

                    {!product?.hasVariation && (
                      <Badge variant='secondary' className='text-xs'>
                        No Variant
                      </Badge>
                    )}
                  </div>
                </div>

                <div className='text-right ml-4'>
                  <div className='font-bold text-lg text-gray-900'>
                    ৳{product?.totalPrice}
                  </div>
                  <div className='text-sm text-gray-500'>
                    ৳
                    {(product?.totalPrice / product?.selectedQuantity).toFixed(
                      2
                    )}{" "}
                    each
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
    <div className='min-h-screen border-4 border-dashed rounded-xl'>
      <div className=' container max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center'>
              <ShoppingCart className='w-6 h-6 text-white' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Order Preview
              </h1>
              <p className='text-gray-600 mt-1'>
                Review order details before confirmation
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Left Column - Customer Information */}
          <div className='md:col-span-2 space-y-6'>
            <Tabs defaultValue='products' className='w-full'>
              <TabsList>
                <TabsTrigger value='products'>Selected Products</TabsTrigger>
                <TabsTrigger value='customer'>Customer Information</TabsTrigger>
              </TabsList>
              <TabsContent value='products'>
                {/* Products Card */}
                <Card className='border-2 border-gray-200 shadow-sm'>
                  <CardHeader className='bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 rounded-lg m-2'>
                    <CardTitle className='flex items-center gap-2 text-green-800'>
                      <ShoppingCart className='w-5 h-5' />
                      Selected Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-6'>
                    {renderSelectedProductList()}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value='customer'>
                {renderCustomerinforamtionPreview()}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Products & Summary */}
          <div className='md:col-span-1 md:mt-11 '>
            {/* Summary Card */}
            <Card className='border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50'>
              <CardHeader className='bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg m-2'>
                <CardTitle className='flex items-center gap-2 text-white'>
                  <Calculator className='w-5 h-5' />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                {renderTransectionData()}
              </CardContent>

              {/* Action Buttons */}
              <div className='p-6 border-t bg-white rounded-b-lg'>
                <div className='flex flex-col sm:flex-row gap-3'>
                  <Button
                    variant='outline'
                    onClick={handleBack}
                    className='flex-1 border-gray-300 hover:bg-gray-50'
                    size='lg'>
                    <ArrowLeft className='w-4 h-4 mr-2' />
                    Back to Edit
                  </Button>
                  <Button
                    disabled={
                      !orderProducts || orderProducts.length < 1 || isCreating
                    }
                    onClick={handleCreateOrderWithLoading}
                    className='flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                    size='lg'>
                    {isCreating ? (
                      <>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        <Send className='w-5 h-5 mr-2' />
                        Create Order Now
                      </>
                    )}
                  </Button>
                </div>

                {(!orderProducts || orderProducts.length < 1) && (
                  <Alert className='mt-4 border-red-200 bg-red-50'>
                    <AlertCircle className='h-4 w-4 text-red-600' />
                    <AlertDescription className='text-red-800'>
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
