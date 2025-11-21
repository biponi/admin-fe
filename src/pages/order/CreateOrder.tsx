import { useEffect, useState } from "react";
import { IOrderProduct } from "../product/interface";
import { ITransection } from "./interface";
import OrderProductList from "./productList";
import CustomerInformation from "./customerInformation";
import OrderPreview from "./preview";
import { createOrder } from "../../api/order";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  CheckCircle2,
  ShoppingCart,
  User,
  ArrowLeft,
  Loader2,
  Clock,
  Send,
} from "lucide-react";
import MobileCreateHeader from "./components/MobileCreateHeader";
import MobileStepper from "./components/MobileStepper";
import MobileCreateLoading from "./components/MobileCreateLoading";
import MobileOrderProductSearch from "./components/MobileOrderProductSearch";
import { toast } from "react-hot-toast";
import { ScrollArea } from "../../components/ui/scroll-area";

type StepStatus = "complete" | "in-progress" | "pending";

interface Step {
  id: number;
  name: string;
  description: string;
  icon: React.ElementType;
  status: StepStatus;
}

const steps: Step[] = [
  {
    id: 1,
    name: "Select Products",
    description: "Choose products for the order",
    icon: ShoppingCart,
    status: "in-progress" as const,
  },
  {
    id: 2,
    name: "Customer Details",
    description: "Enter customer information",
    icon: User,
    status: "pending" as const,
  },
  {
    id: 3,
    name: "Review & Create",
    description: "Review and confirm order",
    icon: CheckCircle2,
    status: "pending" as const,
  },
];

const CreateOrder = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [orderSteps, setOrderSteps] = useState<Step[]>(steps);
  const [currentStep, setCurrentStep] = useState(0);
  const [orderProducts, setOrderProduct] = useState<IOrderProduct[]>([]);
  const [transectionData, setTransectionData] = useState<ITransection | null>(
    null
  );
  const [customerInformation, setCustomerInformation] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const updatedSteps = steps.map((step, index) => {
      if (index < currentStep) {
        return { ...step, status: "complete" as const };
      } else if (index === currentStep) {
        return { ...step, status: "in-progress" as const };
      } else {
        return { ...step, status: "pending" as const };
      }
    });
    setOrderSteps(updatedSteps);
  }, [currentStep]);
  const handleProductDataSubmit = (
    productData: IOrderProduct[],
    transectionData: ITransection
  ) => {
    setOrderProduct(productData);
    setTransectionData(transectionData);
    setCurrentStep(1);
  };

  const handleCustomerDataChange = (customerData: any, transaction: ITransection) => {
    setCustomerInformation(customerData);
    setTransectionData(transaction);
    setCurrentStep(2);
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitCreateOrder = async () => {
    setIsCreating(true);
    try {
      const products = orderProducts.map((op: IOrderProduct) => {
        let { variation, ...newOp } = op;
        if (!!op.selectedVariant) {
          //@ts-ignore
          newOp = { ...newOp, variation: op.selectedVariant };
        }
        newOp = { ...newOp, quantity: op.selectedQuantity };
        return newOp;
      });
      //@ts-ignore
      const { district, division, ...newCustomerInformation } =
        //@ts-ignore
        customerInformation.shipping;
      const orderData = {
        customerInformation: {
          //@ts-ignore
          customer: customerInformation.customer,
          shipping: {
            ...newCustomerInformation,
            division: `${division.name}(${division.bn_name})`,
            district: `${district.name}(${district.bn_name})`,
          },
        },
        transectionData,
        products,
        notes,
      };

      const response = await createOrder(orderData);
      if (response.success) {
        toast.success("Order created successfully! ✅");
        navigate("/order");
      } else {
        toast.error(response?.error || "Failed to create order");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            {/* Mobile Product Search - Optimized for touch */}
            <div className='sm:hidden'>
              <div className='space-y-4'>
                <MobileOrderProductSearch
                  onProductsSubmit={handleProductDataSubmit}
                  initialProducts={orderProducts}
                  initialTransaction={transectionData}
                />
              </div>
            </div>
            {/* Desktop Product List */}
            <div className='hidden sm:block'>
              <OrderProductList
                handleProductDataSubmit={handleProductDataSubmit}
                initialProducts={orderProducts}
                initialTransection={transectionData}
              />
            </div>
          </>
        );
      case 1:
        return (
          <div className='space-y-4'>
            <CustomerInformation
              handleBack={handleStepBack}
              handleCustomerDataChange={handleCustomerDataChange}
              initialTransaction={transectionData}
              orderTotal={transectionData?.totalPrice || 0}
            />
          </div>
        );
      case 2:
        return (
          <div className='space-y-4'>
            <OrderPreview
              notes={notes}
              setNotes={(value: string) => setNotes(value)}
              //@ts-ignore
              customerInformation={customerInformation}
              orderProducts={orderProducts}
              //@ts-ignore
              transection={transectionData}
              handleBack={handleStepBack}
              handleCreateOrder={handleSubmitCreateOrder}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderModernStepper = () => {
    return (
      <Card className='mb-6 border border-gray-200 shadow-sm bg-white'>
        <CardContent className='p-4'>
          {/* Steps */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
            {orderSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`relative flex items-center p-3 rounded-lg transition-all duration-300 border ${
                    step.status === "complete"
                      ? "bg-violet-50 border-violet-200"
                      : step.status === "in-progress"
                      ? "bg-violet-50 border-violet-300 shadow-sm"
                      : "bg-gray-50 border-gray-200"
                  }`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                      step.status === "complete"
                        ? "bg-violet-600 text-white"
                        : step.status === "in-progress"
                        ? "bg-violet-600 text-white"
                        : "bg-gray-300 text-white"
                    }`}>
                    {step.status === "complete" ? (
                      <CheckCircle2 className='w-5 h-5' />
                    ) : (
                      <Icon className='w-5 h-5' />
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3
                      className={`font-medium text-sm md:text-base truncate ${
                        step.status === "complete"
                          ? "text-violet-900"
                          : step.status === "in-progress"
                          ? "text-violet-900"
                          : "text-gray-500"
                      }`}>
                      {step.name}
                    </h3>
                    <p
                      className={`text-xs hidden md:block ${
                        step.status === "complete"
                          ? "text-violet-600"
                          : step.status === "in-progress"
                          ? "text-violet-600"
                          : "text-gray-400"
                      }`}>
                      {step.description}
                    </p>
                  </div>
                  {step.status === "complete" && (
                    <div className='ml-2 hidden md:block'>
                      <span className='text-xs font-medium text-violet-600'>
                        ✓
                      </span>
                    </div>
                  )}
                  {step.status === "in-progress" && (
                    <div className='ml-2 hidden md:block'>
                      <span className='text-xs font-medium text-violet-600'>
                        Active
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Get current step info for mobile header
  const getCurrentStepInfo = () => {
    return {
      title: orderSteps[currentStep]?.name || "Create Order",
      description: orderSteps[currentStep]?.description || "Build your order",
    };
  };

  // Render loading state when creating order
  if (isCreating) {
    return (
      <>
        {/* Mobile Loading */}
        <div className='sm:hidden'>
          <MobileCreateLoading />
        </div>

        {/* Desktop Loading */}
        <div className='hidden sm:flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 items-center justify-center'>
          <div className='max-w-md mx-auto p-8'>
            <Card className='border-2 border-blue-200 shadow-2xl bg-white'>
              <CardContent className='p-8 text-center'>
                <div className='mb-6'>
                  <div className='w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
                    <Loader2 className='w-10 h-10 text-white animate-spin' />
                  </div>
                  <div className='w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto -mt-10 ml-12 shadow-lg animate-pulse'>
                    <Send className='w-8 h-8 text-white' />
                  </div>
                </div>

                <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                  Creating Your Order
                </h2>
                <p className='text-gray-600 mb-6 flex items-center justify-center gap-2'>
                  <Clock className='w-4 h-4' />
                  Please wait while we process your order...
                </p>

                <div className='space-y-3 text-left'>
                  <div className='flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200'>
                    <CheckCircle2 className='w-5 h-5 text-green-600' />
                    <span className='text-sm text-green-800'>
                      Validating products
                    </span>
                  </div>
                  <div className='flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200'>
                    <Loader2 className='w-4 h-4 text-blue-600 animate-spin' />
                    <span className='text-sm text-blue-800'>
                      Processing order details
                    </span>
                  </div>
                  <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200'>
                    <Clock className='w-4 h-4 text-gray-500' />
                    <span className='text-sm text-gray-600'>
                      Finalizing order
                    </span>
                  </div>
                </div>

                <div className='mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200'>
                  <p className='text-sm text-yellow-800 flex items-center gap-2'>
                    <Clock className='w-4 h-4' />
                    <strong>Almost done!</strong> Your order is being created...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const stepInfo = getCurrentStepInfo();

  return (
    <>
      {/* Mobile View */}
      <div className='min-h-screen bg-gray-50 sm:hidden'>
        {/* Mobile Header with better safe area */}
        <div className='relative z-50'>
          <MobileCreateHeader
            currentStep={currentStep}
            totalSteps={steps.length}
            onBack={() => navigate("/order")}
            stepTitle={stepInfo.title}
            stepDescription={stepInfo.description}
          />
        </div>

        {/* Mobile Stepper */}
        <MobileStepper steps={orderSteps} currentStep={currentStep} />

        {/* Mobile Content with proper spacing and touch-friendly design */}
        <ScrollArea className='h-[calc(100vh-140px)]'>
          <div className='flex-1 min-h-0'>
            <div className='px-4 py-4 pb-safe-or-6'>{renderStepContent()}</div>
          </div>
        </ScrollArea>

        {/* Mobile Safe Area Bottom Padding */}
        <div className='h-safe-bottom bg-gray-50' />
      </div>

      {/* Desktop View - Medusa Style */}
      <div className='hidden sm:block min-h-screen bg-gray-50'>
        <div className='max-w-[1600px] mx-auto px-6 py-8'>
          {/* Header - Medusa style */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-2'>
              <div>
                <h1 className='text-2xl font-semibold text-gray-900'>
                  Create Order
                </h1>
                <p className='text-sm text-gray-500 mt-1'>
                  Create a new order for your customer
                </p>
              </div>

              <Button
                variant='outline'
                onClick={() => navigate("/order")}
                className='h-10 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50'
                disabled={isCreating}>
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back to Orders
              </Button>
            </div>
          </div>

          {/* Medusa Stepper */}
          {renderModernStepper()}

          {/* Step Content */}
          <div>{renderStepContent()}</div>
        </div>
      </div>
    </>
  );
};

export default CreateOrder;
