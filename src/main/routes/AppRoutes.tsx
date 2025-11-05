import { Routes, Route, Navigate } from "react-router-dom";
import { useSettings } from "../../contexts/SettingsContext";
import { ModernLayout } from "../../components/modern-layout";
import { LegacyLayout } from "../../components/legacy-layout";
import { publicRoutes } from "./PublicRoutes";
import { ProtectedRoutes } from "./PrivateRoutes";

export const AppRoutes = () => {
  const { layoutType } = useSettings();
  const LayoutWrapper = layoutType === "legacy" ? LegacyLayout : ModernLayout;

  return (
    <LayoutWrapper>
      <Routes>
        {/* Redirect from login if authenticated */}
        <Route path='/login' element={<Navigate to='/dashboard' replace />} />

        {/* Default redirect */}
        <Route path='/' element={<Navigate to='/dashboard' replace />} />

        {/* Public routes */}
        {publicRoutes}

        {/* Protected routes */}
        {ProtectedRoutes()}

        {/* Fallback */}
        <Route path='*' element={<Navigate to='/dashboard' replace />} />
      </Routes>
    </LayoutWrapper>
  );
};
