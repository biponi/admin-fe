import { useEffect, useState, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import AccessDeniedPage from "./Unauthorize"; // Import the unauthorized page
import DashboardPage from "./pages/dashboardV2";
import CreateCampaignForm from "./pages/campaign/components/createCampaign";
import CampaignList from "./pages/campaign/campaignList";
import UpdateCampaignForm from "./pages/campaign/components/updateCampaign";
import SignIn from "./pages/auth";
import PurchaseOrders from "./pages/purchaseOrder/purchaseOrders";
import CreatePurchaseOrder from "./pages/purchaseOrder/CreatePurchaseOrder";
import TransactionsPage from "./pages/transection";
import ModifyOrder from "./pages/order/modifyOrderProduct";
import ReserveStore from "./pages/reserve";
import SingleReserveStore from "./pages/reserve/singleReserveStore";
import { UserComponent } from "./pages/user";

// Hooks
import useLoginAuth from "./pages/auth/hooks/useLoginAuth";
import { TooltipProvider } from "./components/ui/tooltip";
import MainView from "./coreComponents/mainView";
import ProfilePage from "./pages/user/userProfile";
import RolesListPage from "./pages/role";
import EditRolePage from "./pages/role/editView";
import CreateRolePage from "./pages/role/create";
import ProtectedRoute from "./ProtectedRoute";
import ViewRolePage from "./pages/role/viewRolePage";

const App = () => {
  const { token, refreshToken, fetchUserById, signOut } = useLoginAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const { user } = useLoginAuth();
  const navigate = useNavigate();

  // Refresh or validate token
  const refreshUser = async () => {
    try {
      const response = await refreshToken();
      if (response?.success) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("refreshToken", response.refreshToken);
        setIsAuth(true);
        return { success: true, token: response?.token }; // Token refreshed successfully
      } else {
        setIsAuth(false);
        signOut(); // signOut if refresh token fails
        navigate("/login");
        return { success: false, token: "" };
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      setIsAuth(false);
      signOut(); // signOut on error
      navigate("/login");
      return { success: false, token: "" };
    }
  };

  const fetchUserData = async (id: number) => {
    try {
      await fetchUserById(id);
      setIsAuth(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsAuth(false);
      signOut(); // signOut on error
      navigate("/login");
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const authToken = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (authToken) {
        const decoded = decodeToken<{ id: number; exp: number }>(authToken);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          await fetchUserData(decoded.id);
        } else if (refreshToken) {
          const isRefreshed = await refreshUser();
          if (isRefreshed?.success) {
            const newDecoded = decodeToken<{ id: number; exp: number }>(
              isRefreshed?.token!
            );
            if (newDecoded && newDecoded.exp * 1000 > Date.now())
              await fetchUserData(newDecoded.id);
          }
        } else {
          setIsAuth(false);
          signOut(); // Logout if both tokens are expired
          navigate("/login");
        }
      } else {
        setIsAuth(false);
        navigate("/login");
      }
      setIsLoading(false);
    };

    initAuth();
    // eslint-disable-next-line
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
        {isAuth && !!user && <Navbar />}

        <Suspense fallback={<span>Loading routes...</span>}>
          <Routes>
            <Route path='/login' element={<SignIn />} />
            <Route path='/unauthorize' element={<AccessDeniedPage />} />{" "}
            {/* Unauthorized route */}
            {/* Default Landing Route */}
            <Route path='/' element={<Navigate to='/dashboard' replace />} />
            {/* Public Pages */}
            <Route path='/products' element={<ProductPage />} />
            <Route path='/product/update/:id' element={<UpdateProduct />} />
            <Route path='/product/create' element={<CreateNewProduct />} />
            <Route path='/category' element={<Category />} />
            <Route path='/order' element={<OrderPage />} />
            <Route path='/order/create' element={<CreateOrder />} />
            <Route path='/order/modify/:orderId' element={<ModifyOrder />} />
            <Route path='/campaign/create' element={<CreateCampaignForm />} />
            <Route
              path='/campaign/update/:id'
              element={<UpdateCampaignForm />}
            />
            <Route path='/campaign' element={<CampaignList />} />
            {/* Protected Routes */}
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute page='dashboard'>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/purchase-order/list'
              element={
                <ProtectedRoute page='PurchaseOrder'>
                  <PurchaseOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path='/purchase-order/create'
              element={
                <ProtectedRoute page='PurchaseOrder' requiredAction='create'>
                  <CreatePurchaseOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path='/transactions'
              element={
                <ProtectedRoute page='Transaction'>
                  <TransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/stores'
              element={
                <ProtectedRoute page='ReserveStore'>
                  <ReserveStore />
                </ProtectedRoute>
              }
            />
            <Route
              path='/store/:storeId'
              element={
                <ProtectedRoute
                  page='ReserveStore'
                  requiredAction='store_access'>
                  <SingleReserveStore />
                </ProtectedRoute>
              }
            />
            <Route
              path='/users'
              element={
                <ProtectedRoute page='user' requiredAction='view'>
                  <MainView title='User Management'>
                    <UserComponent />
                  </MainView>
                </ProtectedRoute>
              }
            />
            <Route
              path='/profile'
              element={
                <ProtectedRoute page='profile'>
                  <MainView title='User Profile'>
                    <ProfilePage />
                  </MainView>
                </ProtectedRoute>
              }
            />
            <Route
              path='/roles'
              element={
                <ProtectedRoute page='role'>
                  <MainView title='Role Management'>
                    <RolesListPage />
                  </MainView>
                </ProtectedRoute>
              }
            />
            <Route
              path='/roles/:id/edit'
              element={
                <ProtectedRoute page='role' requiredAction='edit'>
                  <MainView title='Role Edit'>
                    <EditRolePage />
                  </MainView>
                </ProtectedRoute>
              }
            />
            <Route
              path='/roles/create'
              element={
                <ProtectedRoute page='role' requiredAction='create'>
                  <MainView title='Role Create'>
                    <CreateRolePage />
                  </MainView>
                </ProtectedRoute>
              }
            />
            <Route
              path='/role/:id'
              element={
                <ProtectedRoute page='role' requiredAction='view'>
                  <MainView title='Role View'>
                    <ViewRolePage />
                  </MainView>
                </ProtectedRoute>
              }
            />
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
