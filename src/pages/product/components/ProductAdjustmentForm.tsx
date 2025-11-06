import React, { useState } from "react";
import { useProductAdjustment } from "../../../hooks/useProductAdjustment";
import { AdjustmentType } from "../../../api/productAdjustment";

interface ProductAdjustmentFormProps {
  productId: string;
  productName: string;
  currentStock: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Example component for adjusting product stock
 * Demonstrates proper usage of the Product Adjustment API
 */
export const ProductAdjustmentForm: React.FC<ProductAdjustmentFormProps> = ({
  productId,
  productName,
  currentStock,
  onSuccess,
  onCancel,
}) => {
  const { adjustStock, isLoading, error } = useProductAdjustment();

  const [formData, setFormData] = useState({
    adjustmentType: "add" as AdjustmentType,
    quantity: 0,
    reason: "",
    notes: "",
    referenceNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate reason field
    if (formData.reason.length < 5) {
      alert("Reason must be at least 5 characters long");
      return;
    }

    // Validate quantity
    if (formData.quantity <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    const result = await adjustStock({
      productId,
      adjustmentType: formData.adjustmentType,
      quantity: formData.quantity,
      reason: formData.reason,
      notes: formData.notes || undefined,
      referenceNumber: formData.referenceNumber || undefined,
    });

    if (result) {
      alert(
        `Stock adjusted successfully!\nOld quantity: ${result.product.oldQuantity}\nNew quantity: ${result.product.newQuantity}`
      );
      onSuccess?.();
    }
  };

  return (
    <div className="product-adjustment-form">
      <h3>Adjust Stock: {productName}</h3>
      <p>Current Stock: {currentStock}</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Adjustment Type:</label>
          <select
            value={formData.adjustmentType}
            onChange={(e) =>
              setFormData({
                ...formData,
                adjustmentType: e.target.value as AdjustmentType,
              })
            }
            disabled={isLoading}
          >
            <option value="add">Add Stock</option>
            <option value="remove">Remove Stock</option>
            <option value="set">Set Exact Stock</option>
          </select>
          <small>
            {formData.adjustmentType === "add" &&
              "Increase stock by specified quantity"}
            {formData.adjustmentType === "remove" &&
              "Decrease stock by specified quantity"}
            {formData.adjustmentType === "set" &&
              "Set stock to exact quantity"}
          </small>
        </div>

        <div className="form-group">
          <label>Quantity: *</label>
          <input
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: parseInt(e.target.value) })
            }
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Reason: * (min 5 characters)</label>
          <input
            type="text"
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            placeholder="e.g., Received new stock from supplier XYZ"
            minLength={5}
            required
            disabled={isLoading}
          />
          <small>
            Provide a clear reason for this adjustment (e.g., stock received,
            damaged goods, inventory count)
          </small>
        </div>

        <div className="form-group">
          <label>Notes:</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes (optional)"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Reference Number:</label>
          <input
            type="text"
            value={formData.referenceNumber}
            onChange={(e) =>
              setFormData({ ...formData, referenceNumber: e.target.value })
            }
            placeholder="e.g., PO-2024-001, INV-12345"
            disabled={isLoading}
          />
          <small>
            Optional reference number (PO number, invoice number, etc.)
          </small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Adjusting..." : "Adjust Stock"}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} disabled={isLoading}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

/**
 * Best Practices for Stock Adjustments:
 *
 * 1. Always provide clear, descriptive reasons
 * 2. Include reference numbers for traceability (PO numbers, invoice numbers)
 * 3. Use 'add' type for receiving stock
 * 4. Use 'remove' type for damage, theft, or returns
 * 5. Use 'set' type only when doing physical inventory counts
 *
 * Example Usage in Parent Component:
 *
 * const ProductDetailPage = ({ productId }) => {
 *   const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
 *   const [product, setProduct] = useState(null);
 *
 *   const handleAdjustmentSuccess = () => {
 *     setShowAdjustmentForm(false);
 *     // Refresh product data
 *     loadProductData();
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={() => setShowAdjustmentForm(true)}>
 *         Adjust Stock
 *       </button>
 *
 *       {showAdjustmentForm && (
 *         <ProductAdjustmentForm
 *           productId={product.id}
 *           productName={product.name}
 *           currentStock={product.quantity}
 *           onSuccess={handleAdjustmentSuccess}
 *           onCancel={() => setShowAdjustmentForm(false)}
 *         />
 *       )}
 *     </div>
 *   );
 * };
 */
