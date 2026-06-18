import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../../components/ui/use-toast";
import MainView from "../../coreComponents/mainView";
import { Button } from "../../components/ui/button";
import {
  ArrowLeft,
  Package,
  BarChart3,
  Users,
  ShoppingCart,
  RefreshCw,
  History,
} from "lucide-react";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { getProductById } from "../../api/product";
import { IProductUpdateData } from "./interface";
import DefaultLoading from "../../coreComponents/defaultLoading";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import ProductInfoCard from "./components/ProductInfoCard";
import OrderHistoryTab from "./components/OrderHistoryTab";
import CustomerHistoryTab from "./components/CustomerHistoryTab";
import PurchaseOrderHistoryTab from "./components/PurchaseOrderHistoryTab";
import AdjustmentHistoryTab from "./components/AdjustmentHistoryTab";
import StoreReserveHistoryTab from "./components/StoreReserveHistoryTab";

const ProductDetails = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { hasRequiredPermission } = useRoleCheck();

  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState<IProductUpdateData | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!hasRequiredPermission("product", "view")) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You do not have permission to view product details",
      });
      navigate("/products");
      return;
    }

    const fetchProduct = async () => {
      if (!id) return;
      const response = await getProductById(id);
      if (response?.success && response?.data) {
        setProductData(response.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response?.error || "Failed to fetch product",
        });
      }
      setLoading(false);
    };

    fetchProduct();
    //eslint-disable-next-line
  }, [id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const response = await getProductById(id!);
    if (response?.success && response?.data) {
      setProductData(response.data);
      toast({
        title: "Success",
        description: "Product data refreshed",
      });
    }
    setRefreshing(false);
  };

  if (loading) {
    return <DefaultLoading title='Loading product details' />;
  }

  if (!productData || !id) {
    return (
      <MainView title='Product Not Found'>
        <div className='text-center py-12'>
          <p className='text-gray-500 mb-4'>Product not found</p>
          <Button onClick={() => navigate("/products")}>
            Back to Products
          </Button>
        </div>
      </MainView>
    );
  }

  return (
    <MainView title='Product Details'>
      <div className='mx-2 md:container space-y-6'>
        {/* Header with Back Button and Refresh */}
        <div className='flex items-center justify-between'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate("/products")}
            className='text-slate-600 hover:text-slate-900 hover:bg-slate-100'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Products
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={refreshing}
            className='border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Product Information Card (Read-only) */}
        <ProductInfoCard product={productData} />

        {/* Analytics Tabs */}
        <Tabs
          defaultValue='orders'
          className='w-full rounded-lg border border-slate-200 bg-white shadow'>
          <TabsList className='h-auto bg-transparent p-0 rounded-none border-b flex justify-start w-full overflow-x-auto'>
            <TabsTrigger
              value='orders'
              className='relative flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all whitespace-nowrap'>
              <ShoppingCart className='h-4 w-4' />
              Orders
            </TabsTrigger>
            <TabsTrigger
              value='customers'
              className='relative flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all whitespace-nowrap'>
              <Users className='h-4 w-4' />
              Customers
            </TabsTrigger>
            <TabsTrigger
              value='purchase-orders'
              className='relative flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all whitespace-nowrap'>
              <Package className='h-4 w-4' />
              Purchase Orders
            </TabsTrigger>
            <TabsTrigger
              value='adjustments'
              className='relative flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all whitespace-nowrap'>
              <BarChart3 className='h-4 w-4' />
              Adjustments
            </TabsTrigger>
            <TabsTrigger
              value='store-reserve'
              className='relative flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all whitespace-nowrap'>
              <History className='h-4 w-4' />
              Store Reserve
            </TabsTrigger>
          </TabsList>

          <TabsContent value='orders' className='p-2 md:p-4'>
            <OrderHistoryTab productId={id} />
          </TabsContent>

          <TabsContent value='customers' className='p-2 md:p-4'>
            <CustomerHistoryTab productId={id} productName={productData.name} />
          </TabsContent>

          <TabsContent value='purchase-orders' className='p-2 md:p-4'>
            <PurchaseOrderHistoryTab productId={id} />
          </TabsContent>

          <TabsContent value='adjustments' className='p-2 md:p-4'>
            <AdjustmentHistoryTab productId={id} />
          </TabsContent>

          <TabsContent value='store-reserve' className='p-2 md:p-4'>
            <StoreReserveHistoryTab productId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </MainView>
  );
};

export default ProductDetails;
