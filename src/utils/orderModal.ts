import { useOrderModalStore } from '../store/orderModalStore';

/**
 * Opens the global order modal with the specified order number
 * Similar to Swal.fire() but for order details
 *
 * @param orderNumber - The order number to display details for
 *
 * @example
 * ```typescript
 * import { showOrderModal } from '@/utils/orderModal';
 *
 * // In a click handler
 * onClick={() => showOrderModal(12345)}
 *
 * // Or with a variable
 * const orderNumber = 67890;
 * showOrderModal(orderNumber);
 * ```
 */
export const showOrderModal = (orderNumber: number) => {
  useOrderModalStore.getState().openModal(orderNumber);
};

/**
 * Closes the global order modal
 *
 * @example
 * ```typescript
 * import { closeOrderModal } from '@/utils/orderModal';
 *
 * closeOrderModal();
 * ```
 */
export const closeOrderModal = () => {
  useOrderModalStore.getState().closeModal();
};
