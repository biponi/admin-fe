import { Navigate } from "react-router-dom";
import { hasPagePermission } from "./utils/helperFunction"; // adjust path as needed
import { useSelector } from "react-redux";

type ProtectedRouteProps = {
  children: JSX.Element;
  page: string; // NEW: Page name, like 'Dashboard'
  requiredAction?: string; // Optional: defaults to 'view'
};

const ProtectedRoute = ({
  children,
  page,
  requiredAction = "view",
}: ProtectedRouteProps) => {
  const user = useSelector((state: any) => state?.user);

  if (!user) {
    return <Navigate to='/login' />;
  }

  if (page !== "all") {
    const userPermissions = user.permissions || [];

    const hasPermission = hasPagePermission(
      page,
      requiredAction,
      userPermissions
    );

    if (!hasPermission) {
      return <Navigate to='/unauthorize' />;
    }
  }

  return children;
};
export default ProtectedRoute;
