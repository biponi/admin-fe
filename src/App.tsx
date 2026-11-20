import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Toaster as Toaster2 } from "sonner";

import { SettingsProvider } from "./contexts/SettingsContext";
import { PageProvider } from "./contexts/PageContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { WeatherProvider } from "./contexts/WeatherContext";
import IOSErrorBoundary from "./components/IOSErrorBoundary";
import { AuthGuard } from "./main/components/auth/AuthGuard";
import { AppRoutes } from "./main/routes/AppRoutes";
import { LoadingScreen } from "./main/components/auth/LoadingScreen";
import { GlobalOrderModal } from "./components/order/GlobalOrderModal";
import { useOverlaySafetyNet } from "./lib/overlay-safety-net";

const App = () => {
  // Unfreezes the page if a modal/drawer scroll-lock leaks (body stuck at
  // pointer-events: none with no overlay open) — see the hook for details.
  useOverlaySafetyNet();

  return (
    <IOSErrorBoundary>
      <SettingsProvider>
        <PageProvider>
          <NotificationProvider>
            <AuthGuard>
              {/* Inside AuthGuard: weather requests use the authenticated
                  axios instance and must not fire pre-login */}
              <WeatherProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <AppRoutes />
                </Suspense>
              </WeatherProvider>
            </AuthGuard>
            <GlobalOrderModal />
            <Toaster />
            <Toaster2 position='top-center' richColors />
          </NotificationProvider>
        </PageProvider>
      </SettingsProvider>
    </IOSErrorBoundary>
  );
};

export default App;
