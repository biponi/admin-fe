import { useEffect } from "react";
import { useCreateOrderLayoutStore } from "../createOrderLayoutStore";
import { isValidBangladeshiMobileNumber } from "../../../utils/helperFunction";
import { refreshCustomerBlock } from "../../../utils/fraudBlock";

/**
 * Keeps the shared create-order store's `activeManualFraud` in sync with the
 * given customer phone number: fetches the fraud risk profile whenever a
 * valid number is present and clears it otherwise. No debounce needed — the
 * validity gate means requests only fire on complete numbers. A cancelled
 * flag guards against a stale response landing after the phone changes.
 */
export const useCustomerBlockCheck = (phoneNumber?: string) => {
  useEffect(() => {
    const setActiveManualFraud =
      useCreateOrderLayoutStore.getState().setActiveManualFraud;

    if (!phoneNumber || !isValidBangladeshiMobileNumber(phoneNumber)) {
      setActiveManualFraud(null);
      return;
    }

    let cancelled = false;
    (async () => {
      const active = await refreshCustomerBlock(phoneNumber);
      if (!cancelled) setActiveManualFraud(active);
    })();
    return () => {
      cancelled = true;
    };
  }, [phoneNumber]);
};
