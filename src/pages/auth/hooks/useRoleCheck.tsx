import { useSelector } from "react-redux";
import { hasPagePermission } from "../../../utils/helperFunction";

const useRoleCheck = () => {
  const userStore = useSelector((state: any) => state?.user);

  const hasRequiredPermission = (page: string, action: string): boolean => {
    if (!userStore?.permissions || userStore?.permissions.length < 1)
      return false;

    return hasPagePermission(page, action, userStore?.permissions);
  };

  const hasPermissionsForPage = (page: string, actions: string[]): boolean => {
    if (!userStore?.permissions || userStore?.permissions.length < 1)
      return false;

    return actions.every((action) =>
      hasPagePermission(page, action, userStore?.permissions)
    );
  };

  const hasSomePermissionsForPage = (
    page: string,
    actions: string[]
  ): boolean => {
    if (!userStore?.permissions || userStore?.permissions.length < 1)
      return false;

    return actions.some((action) =>
      hasPagePermission(page, action, userStore?.permissions)
    );
  };

  return {
    hasRequiredPermission,
    hasPermissionsForPage,
    hasSomePermissionsForPage,
  };
};

export default useRoleCheck;
