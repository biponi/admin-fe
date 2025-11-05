import { Route } from "react-router-dom";
import { useSettings } from "../../contexts/SettingsContext";
import ProtectedRoute from "../../ProtectedRoute";
import MainView from "../../coreComponents/mainView";
import LegacyMainView from "../../coreComponents/legacyMainView";
import DashboardPage from "../../pages/dashboardV2";
import PurchaseOrders from "../../pages/purchaseOrder/purchaseOrders";
import CreatePurchaseOrder from "../../pages/purchaseOrder/CreatePurchaseOrder";
import UpdatePurchaseOrder from "../../pages/purchaseOrder/UpdatePurchaseOrder";
import TransactionsPage from "../../pages/transection";
import ReserveStore from "../../pages/reserve";
import SingleReserveStore from "../../pages/reserve/singleReserveStore";
import { UserComponent } from "../../pages/user";
import ProfilePage from "../../pages/user/userProfile";
import RolesListPage from "../../pages/role";
import EditRolePage from "../../pages/role/editView";
import CreateRolePage from "../../pages/role/create";
import ViewRolePage from "../../pages/role/viewRolePage";
import ChatPage from "../../pages/chat";
import { JobsManagement } from "../../pages/settings";
import ReportPage from "../../pages/report";
import DeliveryPage from "../../pages/delivery";

export const ProtectedRoutes = () => {
  const { layoutType } = useSettings();
  const MainViewComponent = layoutType === "legacy" ? LegacyMainView : MainView;

  return (
    <>
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute page='all'>
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
        path='/purchase-order/update/:id'
        element={
          <ProtectedRoute page='PurchaseOrder' requiredAction='edit'>
            <UpdatePurchaseOrder />
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
          <ProtectedRoute page='ReserveStore' requiredAction='store_access'>
            <SingleReserveStore />
          </ProtectedRoute>
        }
      />
      <Route
        path='/users'
        element={
          <ProtectedRoute page='user' requiredAction='view'>
            <MainViewComponent title='User Management'>
              <UserComponent />
            </MainViewComponent>
          </ProtectedRoute>
        }
      />
      <Route
        path='/profile'
        element={
          <ProtectedRoute page='profile'>
            <MainViewComponent title='User Profile'>
              <ProfilePage />
            </MainViewComponent>
          </ProtectedRoute>
        }
      />
      <Route
        path='/roles'
        element={
          <ProtectedRoute page='role'>
            <MainViewComponent title='Role Management'>
              <RolesListPage />
            </MainViewComponent>
          </ProtectedRoute>
        }
      />
      <Route
        path='/roles/:id/edit'
        element={
          <ProtectedRoute page='role' requiredAction='edit'>
            <MainViewComponent title='Role Edit'>
              <EditRolePage />
            </MainViewComponent>
          </ProtectedRoute>
        }
      />
      <Route
        path='/roles/create'
        element={
          <ProtectedRoute page='role' requiredAction='create'>
            <MainViewComponent title='Role Create'>
              <CreateRolePage />
            </MainViewComponent>
          </ProtectedRoute>
        }
      />
      <Route
        path='/role/:id'
        element={
          <ProtectedRoute page='role' requiredAction='view'>
            <MainViewComponent title='Role View'>
              <ViewRolePage />
            </MainViewComponent>
          </ProtectedRoute>
        }
      />
      <Route
        path='/chat'
        element={
          <ProtectedRoute page='Chat' requiredAction='view'>
            <MainViewComponent title='Support'>
              <ChatPage />
            </MainViewComponent>
          </ProtectedRoute>
        }
      />
      <Route
        path='/settings/jobs'
        element={
          <ProtectedRoute page='settings' requiredAction='jobs_management'>
            <MainViewComponent title='Action Settings'>
              <JobsManagement />
            </MainViewComponent>
          </ProtectedRoute>
        }
      />
      <Route
        path='/reports'
        element={
          <ProtectedRoute page='Report' requiredAction='view'>
            <MainViewComponent title='Reports & Analytics'>
              <ReportPage />
            </MainViewComponent>
          </ProtectedRoute>
        }
      />
      <Route
        path='/order/delivery'
        element={
          <ProtectedRoute page='order' requiredAction='view'>
            <MainViewComponent title='Delivery Management'>
              <DeliveryPage />
            </MainViewComponent>
          </ProtectedRoute>
        }
      />
    </>
  );
};
