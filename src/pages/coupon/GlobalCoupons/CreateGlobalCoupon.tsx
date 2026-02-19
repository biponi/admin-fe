import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";
import Swal from "sweetalert2";
import * as couponAPI from "../../../api/coupon";
import type { CreateGlobalCouponRequest } from "../interface";

export default function CreateGlobalCoupon() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discountType: "fixed" as "fixed" | "percentage",
    discountValue: "",
    maxUsesPerCustomer: "1",
    totalUsageLimit: "",
    validFrom: "",
    validUntil: "",
    minOrderAmount: "0",
    maxDiscountAmount: "",
    firstOrderOnly: false,
    autoApply: false,
    priority: "0",
    applicableProducts: [] as string[],
    applicableCategories: [] as string[],
  });

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};

    if (!formData.code || formData.code.length < 3 || formData.code.length > 20) {
      newErrors.code = "Code must be 3-20 characters (alphanumeric only)";
    }
    if (!formData.name || formData.name.length < 3 || formData.name.length > 100) {
      newErrors.name = "Name must be 3-100 characters";
    }
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      newErrors.discountValue = "Discount value must be greater than 0";
    }
    if (!formData.maxUsesPerCustomer || Number(formData.maxUsesPerCustomer) < 1 || Number(formData.maxUsesPerCustomer) > 5) {
      newErrors.maxUsesPerCustomer = "Max uses per customer must be 1-5";
    }
    if (!formData.validFrom) {
      newErrors.validFrom = "Valid from date is required";
    }
    if (!formData.validUntil) {
      newErrors.validUntil = "Valid until date is required";
    }
    if (formData.validFrom && formData.validUntil && new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      newErrors.validUntil = "Valid until must be after valid from";
    }
    if (formData.discountType === "percentage" && Number(formData.discountValue) > 100) {
      newErrors.discountValue = "Percentage discount cannot exceed 100%";
    }
    if (Number(formData.minOrderAmount) < 0) {
      newErrors.minOrderAmount = "Minimum order amount cannot be negative";
    }
    if (Number(formData.priority) < 0) {
      newErrors.priority = "Priority cannot be negative";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fix the errors in the form",
      });
      return;
    }

    // Prepare API request
    const request: CreateGlobalCouponRequest = {
      code: formData.code.toUpperCase(),
      name: formData.name,
      description: formData.description || undefined,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      maxUsesPerCustomer: Number(formData.maxUsesPerCustomer),
      totalUsageLimit: formData.totalUsageLimit ? Number(formData.totalUsageLimit) : undefined,
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString(),
      minOrderAmount: Number(formData.minOrderAmount),
      maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
      firstOrderOnly: formData.firstOrderOnly,
      autoApply: formData.autoApply,
      priority: Number(formData.priority),
      applicableProducts: formData.applicableProducts,
      applicableCategories: formData.applicableCategories,
    };

    setLoading(true);

    try {
      const response = await couponAPI.createGlobalCoupon(request);

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Created",
          text: `Coupon ${formData.code.toUpperCase()} has been created successfully`,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/coupons/global");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: response?.error || "Failed to create coupon",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Failed to create coupon",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/coupons/global")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Global Coupon</h1>
          <p className="text-muted-foreground mt-2">
            Create a public coupon available to all customers
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coupon Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., SUMMER2025"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })}
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  3-20 characters, uppercase letters and numbers only
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Coupon Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., Summer Sale 2025"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe this coupon..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              </div>

            {/* Discount Configuration */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Discount Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="discountType"
                        checked={formData.discountType === "fixed"}
                        onChange={() => setFormData({ ...formData, discountType: "fixed" as any })}
                      />
                      <span>Fixed Amount (BDT)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="discountType"
                        checked={formData.discountType === "percentage"}
                        onChange={() => setFormData({ ...formData, discountType: "percentage" as any })}
                      />
                      <span>Percentage (%)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder={formData.discountType === "fixed" ? "e.g., 100" : "e.g., 15"}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className={errors.discountValue ? "border-red-500" : ""}
                  />
                  {errors.discountValue && (
                    <p className="text-sm text-red-500">{errors.discountValue}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.discountType === "fixed" ? "Amount in BDT" : "Percentage (e.g., 15 for 15%)"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Max Uses Per Customer <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.maxUsesPerCustomer}
                    onChange={(e) => setFormData({ ...formData, maxUsesPerCustomer: e.target.value })}
                    className={errors.maxUsesPerCustomer ? "border-red-500" : ""}
                  />
                  {errors.maxUsesPerCustomer && (
                    <p className="text-sm text-red-500">{errors.maxUsesPerCustomer}</p>
                  )}
                  <p className="text-xs text-muted-foreground">1-5 uses allowed</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Usage Limit (Optional)</label>
                  <Input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={formData.totalUsageLimit}
                    onChange={(e) => setFormData({ ...formData, totalUsageLimit: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Empty = unlimited usage</p>
                </div>

                {formData.discountType === "percentage" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Discount Amount (Optional)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 500"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Cap in BDT</p>
                  </div>
                )}
              </div>
            </div>

            {/* Validity Period */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                <Calendar className="w-5 h-5 inline mr-2" />
                Validity Period
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Valid From <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className={errors.validFrom ? "border-red-500" : ""}
                  />
                  {errors.validFrom && (
                    <p className="text-sm text-red-500">{errors.validFrom}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Valid Until <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className={errors.validUntil ? "border-red-500" : ""}
                  />
                  {errors.validUntil && (
                    <p className="text-sm text-red-500">{errors.validUntil}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Additional Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Order Amount (BDT)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className={errors.minOrderAmount ? "border-red-500" : ""}
                  />
                  {errors.minOrderAmount && (
                    <p className="text-sm text-red-500">{errors.minOrderAmount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Default: 0 (no minimum)</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Auto-Apply Priority</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className={errors.priority ? "border-red-500" : ""}
                  />
                  {errors.priority && (
                    <p className="text-sm text-red-500">{errors.priority}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Higher = applied first (default: 0)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <label className="flex items-center gap-2 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                  <input
                    type="checkbox"
                    checked={formData.firstOrderOnly}
                    onChange={(e) => setFormData({ ...formData, firstOrderOnly: e.target.checked })}
                  />
                  <div>
                    <div className="font-medium">First Order Only</div>
                    <p className="text-sm text-muted-foreground">Valid only for customer's first order</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                  <input
                    type="checkbox"
                    checked={formData.autoApply}
                    onChange={(e) => setFormData({ ...formData, autoApply: e.target.checked })}
                  />
                  <div>
                    <div className="font-medium">Auto Apply</div>
                    <p className="text-sm text-muted-foreground">Automatically apply best coupon at checkout</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/coupons/global")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Coupon"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
