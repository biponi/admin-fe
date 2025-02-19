import { useEffect, useState, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { decodeToken } from "react-jwt";
import { Toaster } from "react-hot-toast";

// Import components
import Navbar from "./coreComponents/navbar";
import ProductPage from "./pages/product";
import Category from "./pages/product/category";
import CreateNewProduct from "./pages/product/newProduct";
import UpdateProduct from "./pages/product/newProduct/editProductIndex";
import CreateOrder from "./pages/order/CreateOrder";
import OrderPage from "./pages/order";
import AccessDeniedPage from "./Unauthorize";
import DashboardPage from "./pages/dashboardV2";
import CreateCampaignForm from "./pages/campaign/components/createCampaign";
import CampaignList from "./pages/campaign/campaignList";
import UpdateCampaignForm from "./pages/campaign/components/updateCampaign";
import SignIn from "./pages/auth";

// Hooks
import useLoginAuth from "./pages/auth/hooks/useLoginAuth";
import { TooltipProvider } from "./components/ui/tooltip";
import PurchaseOrders from "./pages/purchaseOrder/purchaseOrders";
import CreatePurchaseOrder from "./pages/purchaseOrder/CreatePurchaseOrder";
import TransactionsPage from "./pages/transection";
import ModifyOrder from "./pages/order/modifyOrderProduct";

// Protected Route Component
const ProtectedRoute = ({
  children,
  roles,
}: {
  children: JSX.Element;
  roles: string[];
}) => {
  const { user } = useLoginAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to='/unauthorize' />;
  }
  return children;
};

const App = () => {
  const { token, refreshToken, fetchUserById } = useLoginAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuth, setIsAuth] = useState<boolean>(false);

  // Refresh or validate token
  const refreshUser = async () => {
    const response = await refreshToken();
    if (response?.success) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("refreshToken", response.refreshToken);
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }
  };

  const fetchUserData = async (id: number) => {
    await fetchUserById(id);
    setIsAuth(true);
  };

  useEffect(() => {
    const initAuth = async () => {
      const authToken = localStorage.getItem("token");
      if (authToken) {
        const decoded = decodeToken<{ id: number; exp: number }>(authToken);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          await fetchUserData(decoded.id);
        } else {
          await refreshUser();
        }
      } else {
        setIsAuth(false);
      }
      setIsLoading(false);
    };
    initAuth();
    //eslint-disable-next-line
  }, [token]);

  if (isLoading) {
    return (
      <div className='w-full h-screen flex justify-center items-center'>
        <span className='text-lg font-semibold animate-bounce'>Loading...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className='grid min-h-[70vh] w-full pl-0 sm:pl-[53px] sm:h-screen'>
        {isAuth && <Navbar />}

        <Suspense fallback={<span>Loading routes...</span>}>
          <Routes>
            {/* Authentication Routes */}
            {!isAuth ? (
              <>
                <Route path='/login' element={<SignIn />} />
                <Route path='/unauthorize' element={<AccessDeniedPage />} />
              </>
            ) : (
              <>
                {/* Default Landing Route */}
                <Route
                  path='/'
                  element={<Navigate to='/dashboard' replace />}
                />

                {/* Public Pages */}
                <Route path='/products' element={<ProductPage />} />
                <Route path='/product/update/:id' element={<UpdateProduct />} />
                <Route path='/product/create' element={<CreateNewProduct />} />
                <Route path='/category' element={<Category />} />
                <Route path='/order' element={<OrderPage />} />
                <Route path='/order/create' element={<CreateOrder />} />
                <Route
                  path='/order/modify/:orderId'
                  element={<ModifyOrder />}
                />
                <Route
                  path='/campaign/create'
                  element={<CreateCampaignForm />}
                />
                <Route
                  path='/campaign/update/:id'
                  element={<UpdateCampaignForm />}
                />
                <Route path='/campaign' element={<CampaignList />} />

                {/* Protected Routes */}
                <Route
                  path='/dashboard'
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/purchase-order/list'
                  element={
                    <ProtectedRoute roles={["admin", "manager"]}>
                      <PurchaseOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/purchase-order/create'
                  element={
                    <ProtectedRoute roles={["admin", "manager"]}>
                      <CreatePurchaseOrder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/transactions'
                  element={
                    <ProtectedRoute roles={["admin", "manager"]}>
                      <TransactionsPage />
                    </ProtectedRoute>
                  }
                />
              </>
            )}

            {/* Fallback Route */}
            <Route path='*' element={<Navigate to='/login' replace />} />
          </Routes>
        </Suspense>
      </div>
      <Toaster />
    </TooltipProvider>
  );
};

export default App;
