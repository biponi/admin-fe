import { getCustomerRiskProfile } from "../api/fraud";
import { isValidBangladeshiMobileNumber } from "./helperFunction";
import type { CustomerRiskProfile, ManualFraud } from "../pages/order/interface.d";

/**
 * Expiry-aware check on a manual fraud-group entry: the customer is blocked
 * while `expiresAt` is null (permanent) or still in the future.
 */
export const isManualFraudActive = (
  manualFraud?: ManualFraud | null,
): boolean =>
  !!manualFraud?.flagged &&
  (!manualFraud.expiresAt || new Date(manualFraud.expiresAt) > new Date());

/**
 * The active manual-fraud entry for a risk profile (banner data: reason +
 * expiry), or null when the customer isn't blocked. Trusts the server's
 * computed `blocked` flag first, falling back to the local expiry check —
 * same idiom as FraudDetailPanel.
 */
export const extractActiveManualFraud = (
  profile?: CustomerRiskProfile | null,
): ManualFraud | null => {
  const manualFraud = profile?.manualFraud;
  if (!manualFraud) return null;
  const blocked = profile?.blocked ?? isManualFraudActive(manualFraud);
  return blocked ? manualFraud : null;
};

/**
 * Fresh block check for submit time — re-fetches the risk profile so a stale
 * UI state can't slip an order through after a mid-flow block/unblock.
 * Fail-open: on a fetch error it returns null (the error is already toasted
 * by handleApiError) and the backend rejects blocked customers anyway.
 */
export const refreshCustomerBlock = async (
  phoneNumber?: string,
): Promise<ManualFraud | null> => {
  if (!phoneNumber || !isValidBangladeshiMobileNumber(phoneNumber)) return null;
  const result = await getCustomerRiskProfile(phoneNumber);
  if (!result.success) return null;
  return extractActiveManualFraud(result.data);
};
