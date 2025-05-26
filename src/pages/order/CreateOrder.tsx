import { useEffect, useState } from "react";
import MainView from "../../coreComponents/mainView";
import Stepper from "../../coreComponents/Stepper";
import { IOrderProduct } from "../product/interface";
import { ITransection } from "./interface";
import OrderProductList from "./productList";
import CustomerInformation from "./customerInformation";
import OrderPreview from "./preview";
import { createOrder } from "../../api/order";
import { useToast } from "../../components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const steps = [
  { id: "01", name: "Product Selection", status: "in-progress" },
  { id: "02", name: "Customer Information", status: "pending" },
  { id: "03", name: "Preview", status: "pending" },
];

const CreateOrder = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [orderSteps, setOrderSteps] = useState(steps);
  const [currentStep, setCurrentStep] = useState(0);
  const [orderProducts, setOrderProduct] = useState([]);
  const [transectionData, setTransectionData] = useState();
  const [customerInformation, setCustomerInformation] = useState();

  const { toast } = useToast();

  useEffect(() => {
    if (currentStep === 0) {
      setOrderSteps(steps);
    } else if (currentStep === 1) {
      setOrderSteps([
        { id: "01", name: "Product Selection", status: "complete" },
        { id: "02", name: "Customer Information", status: "in-progress" },
        { id: "03", name: "Preview", status: "pending" },
      ]);
    } else {
      setOrderSteps([
        { id: "01", name: "Product Selection", status: "complete" },
        { id: "02", name: "Customer Information", status: "complete" },
        { id: "03", name: "Preview", status: "in-progress" },
      ]);
    }
  }, [currentStep]);
  const handleProductDataSubmit = (
    productData: IOrderProduct[],
    transectionData: ITransection
  ) => {
    //@ts-ignore
    setOrderProduct(productData);
    //@ts-ignore
    setTransectionData(transectionData);
    setCurrentStep(1);
  };

  const handleCustomerDataChange = (customerData: any) => {
    setCustomerInformation(customerData);
    setCurrentStep(2);
  };

  const handleSubmitCreateOrder = async () => {
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
      toast({
        title: "Order created..",
        description: "Please check all order details",
      });
      navigate("/order");
    } else {
      toast({
        title: "Order Creation Failed",
        description: response?.error,
        variant: "destructive",
      });
    }
  };

  const renderContentView = () => {
    if (currentStep === 0) {
      return (
        <OrderProductList handleProductDataSubmit={handleProductDataSubmit} />
      );
    } else if (currentStep === 1) {
      return (
        <CustomerInformation
          handleBack={() => setCurrentStep(1)}
          handleCustomerDataChange={handleCustomerDataChange}
        />
      );
    } else {
      return (
        <OrderPreview
          notes={notes}
          setNotes={(value: string) => setNotes(value)}
          //@ts-ignore
          customerInformation={customerInformation}
          orderProducts={orderProducts}
          //@ts-ignore
          transection={transectionData}
          handleBack={() => setCurrentStep(2)}
          handleCreateOrder={() => {
            handleSubmitCreateOrder();
          }}
        />
      );
    }
  };

  const renderMainView = () => {
    return (
      <MainView title='Order Creation'>
        <div className='w-full sm:w-[95vw]'>
          <Stepper steps={orderSteps} />
          <br />
          <div className='my-2' />
          {renderContentView()}
        </div>
      </MainView>
    );
  };

  return <>{renderMainView()}</>;
};

export default CreateOrder;
