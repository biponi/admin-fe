import { useSelector } from "react-redux";
import { hasPagePermission } from "../../../utils/helperFunction";
import {
  canPerformOnOrder,
  isOwnOnly,
} from "../../../utils/orderPermission";

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

  /**
   * Permission + ownership check: like hasRequiredPermission, but when the
   * role has an "own only" restriction on the action, the order must have
   * been created by the current user.
   */
  const canModifyOrder = (
    page: string,
    action: string,
    order?: { createdByUserId?: string | null }
  ): boolean => {
    return canPerformOnOrder(
      userStore?.permissions,
      userStore?.id,
      page,
      action,
      order
    );
  };

  /** Whether the role restricts the action to self-created orders */
  const isOwnOnlyForPage = (page: string, action: string): boolean =>
    isOwnOnly(userStore?.permissions, page, action);

  return {
    userStore,
    hasRequiredPermission,
    hasPermissionsForPage,
    hasSomePermissionsForPage,
    canModifyOrder,
    isOwnOnlyForPage,
  };
};

export default useRoleCheck;
