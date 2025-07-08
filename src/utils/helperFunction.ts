import { isExpired } from "react-jwt";

export const isValidEmail = (email: string) => {
  // Regex pattern for validating email address
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

export const isValidBangladeshiMobileNumber = (number: string) => {
  // Regex pattern for validating Bangladeshi mobile number
  const mobilePattern = /^(?:\+?88)?01[3-9]\d{8}$/;
  return mobilePattern.test(number);
};

export const decodeTokenFunction = (authToken: string) => {
  return isExpired(authToken);
};

const hasPagePermissionForAllActiveUsers = ["profile"];

type Permission = {
  page: string;
  actions: string[];
};

export const hasPagePermission = (
  page: string,
  action: string,
  permissions: Permission[]
): boolean => {
  if (hasPagePermissionForAllActiveUsers.includes(page.trim().toLowerCase()))
    return true;

  const permission = permissions.find(
    (perm) => perm.page.trim().toLowerCase() === page.trim().toLowerCase()
  );
  return permission?.actions.includes(action) ?? false;
};
