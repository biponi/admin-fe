import { Navigate } from "react-router-dom";
import useLoginAuth from "./pages/auth/hooks/useLoginAuth";

interface Props {
  roles: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ roles, children }) => {
  const { user } = useLoginAuth();
  if (roles.includes(user?.role)) {
    return <>{children}</>;
  } else {
    return <Navigate to='/unauthorize' />;
  }
  // User is authenticated, render children
};

export default ProtectedRoute;
