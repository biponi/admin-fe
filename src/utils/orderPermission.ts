import { hasPagePermission } from "./helperFunction";

type Permission = {
  page: string;
  actions: string[];
  ownOnly?: string[];
};

type OrderLike = {
  createdByUserId?: string | number | null;
};

/**
 * Whether the user's role restricts the given action to resources they
 * created themselves ("own only" toggle in the role permission matrix).
 */
export const isOwnOnly = (
  permissions: Permission[] | undefined,
  page: string,
  action: string,
): boolean =>
  !!permissions
    ?.find((p) => p.page.trim().toLowerCase() === page.trim().toLowerCase())
    ?.ownOnly?.includes(action.toLowerCase());

/**
 * Whether the user may perform `action` on `order`:
 * base permission must exist, and if the action is "own only",
 * the order must have been created by this user.
 *
 * Orders with no known creator (customer-placed or un-backfilled) never
 * count as "own".
 */
export const canPerformOnOrder = (
  permissions: Permission[] | undefined,
  userId: string | number | undefined,
  page: string,
  action: string,
  order?: OrderLike,
): boolean => {
  if (!hasPagePermission(page, action, permissions ?? [])) return false;
  if (!isOwnOnly(permissions, page, action)) return true;
  return (
    !!order?.createdByUserId &&
    !!userId &&
    String(order.createdByUserId) === String(userId)
  );
};

/**
 * Whether ANY order in a bulk selection is foreign to the user — used to
 * disable bulk actions when the role has an "own only" restriction.
 */
export const selectionHasForeignOrders = (
  permissions: Permission[] | undefined,
  userId: string | number | undefined,
  page: string,
  action: string,
  orders: OrderLike[],
): boolean =>
  isOwnOnly(permissions, page, action) &&
  orders.some(
    (o) =>
      !o?.createdByUserId ||
      String(o.createdByUserId) !== String(userId),
  );
