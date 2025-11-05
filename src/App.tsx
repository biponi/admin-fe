import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Toaster as Toaster2 } from "sonner";

import { SettingsProvider } from "./contexts/SettingsContext";
import { PageProvider } from "./contexts/PageContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import IOSErrorBoundary from "./components/IOSErrorBoundary";
import { AuthGuard } from "./main/components/auth/AuthGuard";
import { AppRoutes } from "./main/routes/AppRoutes";
import { LoadingScreen } from "./main/components/auth/LoadingScreen";

const App = () => {
  return (
    <IOSErrorBoundary>
      <SettingsProvider>
        <PageProvider>
          <NotificationProvider>
            <AuthGuard>
              <Suspense fallback={<LoadingScreen />}>
                <AppRoutes />
              </Suspense>
            </AuthGuard>
            <Toaster />
            <Toaster2 position='top-center' richColors />
          </NotificationProvider>
        </PageProvider>
      </SettingsProvider>
    </IOSErrorBoundary>
  );
};

export default App;
