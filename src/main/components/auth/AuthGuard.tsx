import { ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "../../../pages/auth";
import AccessDeniedPage from "../../../Unauthorize";
import { LoadingScreen } from "./LoadingScreen";
import { useAuthInit } from "../../hooks/useAuthInit";

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoading, isAuth } = useAuthInit();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuth) {
    return (
      <div className='min-h-screen'>
        <Routes>
          <Route path='/login' element={<SignIn />} />
          <Route path='/unauthorize' element={<AccessDeniedPage />} />
          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      </div>
    );
  }

  return <>{children}</>;
};
