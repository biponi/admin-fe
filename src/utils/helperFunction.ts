import { isExpired } from "react-jwt";

export const isValidEmail = (email: string) => {
  // Regex pattern for validating email address
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

export const isValidBangladeshiMobileNumber = (number: string) => {
  // Regex pattern for validating Bangladeshi mobile number
  const mobilePattern = /^(?:\+?88)?01[1-9]\d{8}$/;
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
  permissions: Permission[],
): boolean => {
  if (hasPagePermissionForAllActiveUsers.includes(page.trim().toLowerCase()))
    return true;

  const permission = permissions.find(
    (perm) => perm.page.trim().toLowerCase() === page.trim().toLowerCase(),
  );
  return permission?.actions.includes(action) ?? false;
};

export const setTopicsForNotifications = (
  permissions: Permission[],
): string[] => {
  let topics = ["all"];
  if (hasPagePermission("order", "view", permissions)) {
    topics.push("order_created");
    topics.push("order_status_changed");
  }

  if (hasPagePermission("order", "edit", permissions)) {
    topics.push("courier_shipped");
    topics.push("courier_delivered");
  }

  if (hasPagePermission("product", "view", permissions)) {
    topics.push("low_stock");
  }

  if (hasPagePermission("user", "view", permissions)) {
    //topics.push("custom");
    topics.push("system_alert");
    topics.push("user_registered");

    // payment topics
    topics.push("payment_failed");
    topics.push("payment_received");
  }

  return topics;
};

// Bangladesh phone validation
// Valid formats: 01XXXXXXXXX (11 digits), starting with 013-019
const BD_PHONE_REGEX = /^(?:\+88)?01[3-9]\d{8}$/;

export const normalizeBDPhone = (raw: string): string => {
  // Remove all non-numeric chars first
  let digits = raw.replace(/\D/g, "");

  // Handle country code prefix: 8801XXXXXXXXX → 01XXXXXXXXX
  if (digits.startsWith("880") && digits.length === 13) {
    digits = "0" + digits.slice(3);
  }

  // Handle +88 prefix already stripped to 8801... above
  // Ensure starts with 0 if 10 digits (missing leading 0)
  if (digits.length === 10 && digits.startsWith("1")) {
    digits = "0" + digits;
  }

  return digits;
};

export const isValidBDPhone = (phone: string): boolean => {
  const normalized = normalizeBDPhone(phone);
  return BD_PHONE_REGEX.test(normalized);
};
