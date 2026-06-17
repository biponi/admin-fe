import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../../components/ui/input";
import {
  ArrowLeft,
  Calendar,
  Tag,
  Percent,
  BadgeDollarSign,
  Settings2,
  Zap,
} from "lucide-react";
import Swal from "sweetalert2";
import * as couponAPI from "../../../api/coupon";
import type { CreateGlobalCouponRequest } from "../interface";

// ── Reusable field wrapper ──────────────────────────────────────────────────
const Field = ({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className='space-y-1.5'>
    <label className='text-xs font-medium text-slate-600'>
      {label}
      {required && <span className='text-rose-500 ml-0.5'>*</span>}
    </label>
    {children}
    {error ? (
      <p className='text-xs text-rose-600'>{error}</p>
    ) : hint ? (
      <p className='text-xs text-slate-400'>{hint}</p>
    ) : null}
  </div>
);

// ── Section header ──────────────────────────────────────────────────────────
const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div className='space-y-4'>
    <div className='flex items-center gap-2 pb-3 border-b border-slate-100'>
      <div className='w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center'>
        <Icon className='h-3.5 w-3.5 text-indigo-600' />
      </div>
      <h3 className='text-sm font-semibold text-slate-700'>{title}</h3>
    </div>
    {children}
  </div>
);

// ── Toggle checkbox card ────────────────────────────────────────────────────
const ToggleCard = ({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  description: string;
}) => (
  <label
    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
      checked
        ? "border-indigo-200 bg-indigo-50/60"
        : "border-slate-100 bg-white hover:bg-slate-50"
    }`}>
    <div className='relative mt-0.5 shrink-0'>
      <input
        type='checkbox'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className='sr-only'
      />
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
          checked ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
        }`}>
        {checked && (
          <svg
            className='w-2.5 h-2.5 text-white'
            viewBox='0 0 10 8'
            fill='none'>
            <path
              d='M1 4l3 3 5-6'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        )}
      </div>
    </div>
    <div>
      <p className='text-sm font-medium text-slate-800'>{title}</p>
      <p className='text-xs text-slate-500 mt-0.5'>{description}</p>
    </div>
  </label>
);

export default function CreateGlobalCoupon() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (patch: Partial<typeof formData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.code || formData.code.length < 3 || formData.code.length > 20)
      newErrors.code = "Code must be 3–20 characters (alphanumeric only)";
    if (
      !formData.name ||
      formData.name.length < 3 ||
      formData.name.length > 100
    )
      newErrors.name = "Name must be 3–100 characters";
    if (formData.description && formData.description.length > 500)
      newErrors.description = "Description must be less than 500 characters";
    if (!formData.discountValue || Number(formData.discountValue) <= 0)
      newErrors.discountValue = "Discount value must be greater than 0";
    if (
      !formData.maxUsesPerCustomer ||
      Number(formData.maxUsesPerCustomer) < 1 ||
      Number(formData.maxUsesPerCustomer) > 5
    )
      newErrors.maxUsesPerCustomer = "Max uses per customer must be 1–5";
    if (!formData.validFrom)
      newErrors.validFrom = "Valid from date is required";
    if (!formData.validUntil)
      newErrors.validUntil = "Valid until date is required";
    if (
      formData.validFrom &&
      formData.validUntil &&
      new Date(formData.validFrom) >= new Date(formData.validUntil)
    )
      newErrors.validUntil = "Valid until must be after valid from";
    if (
      formData.discountType === "percentage" &&
      Number(formData.discountValue) > 100
    )
      newErrors.discountValue = "Percentage discount cannot exceed 100%";
    if (Number(formData.minOrderAmount) < 0)
      newErrors.minOrderAmount = "Minimum order amount cannot be negative";
    if (Number(formData.priority) < 0)
      newErrors.priority = "Priority cannot be negative";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fix the errors in the form",
      });
      return;
    }

    const request: CreateGlobalCouponRequest = {
      code: formData.code.toUpperCase(),
      name: formData.name,
      description: formData.description || undefined,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      maxUsesPerCustomer: Number(formData.maxUsesPerCustomer),
      totalUsageLimit: formData.totalUsageLimit
        ? Number(formData.totalUsageLimit)
        : undefined,
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString(),
      minOrderAmount: Number(formData.minOrderAmount),
      maxDiscountAmount: formData.maxDiscountAmount
        ? Number(formData.maxDiscountAmount)
        : undefined,
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
        }).then(() => navigate("/coupons/global"));
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
    <div className='min-h-screen bg-slate-50/60'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
        {/* Page header */}
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => navigate("/coupons/global")}
            className='inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors'>
            <ArrowLeft className='h-4 w-4' />
            Back
          </button>
          <span className='text-slate-300'>/</span>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm'>
              <Tag className='h-4 w-4 text-white' />
            </div>
            <div>
              <h1 className='text-lg font-semibold text-slate-900 leading-tight'>
                Create Global Coupon
              </h1>
              <p className='text-xs text-slate-500'>
                Public coupon available to all customers
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-5'>
          {/* Basic info */}
          <div className='bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5'>
            <Section icon={Tag} title='Basic information'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                <Field
                  label='Coupon code'
                  required
                  hint='3–20 characters, uppercase letters and numbers only'
                  error={errors.code}>
                  <Input
                    placeholder='e.g. SUMMER2025'
                    value={formData.code}
                    onChange={(e) =>
                      set({
                        code: e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, ""),
                      })
                    }
                    className={`h-9 text-sm font-mono tracking-widest border-slate-200 focus-visible:ring-indigo-500 ${errors.code ? "border-rose-400" : ""}`}
                  />
                </Field>

                <Field label='Coupon name' required error={errors.name}>
                  <Input
                    placeholder='e.g. Summer Sale 2025'
                    value={formData.name}
                    onChange={(e) => set({ name: e.target.value })}
                    className={`h-9 text-sm border-slate-200 focus-visible:ring-indigo-500 ${errors.name ? "border-rose-400" : ""}`}
                  />
                </Field>
              </div>

              <Field
                label='Description'
                hint='Optional — up to 500 characters'
                error={errors.description}>
                <textarea
                  rows={3}
                  placeholder='Describe this coupon…'
                  value={formData.description}
                  onChange={(e) => set({ description: e.target.value })}
                  className='w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none text-slate-800 placeholder:text-slate-400'
                />
              </Field>
            </Section>
          </div>

          {/* Discount config */}
          <div className='bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5'>
            <Section icon={Percent} title='Discount configuration'>
              {/* Type toggle */}
              <Field label='Discount type' required>
                <div className='grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl w-full sm:w-72'>
                  {(["fixed", "percentage"] as const).map((type) => (
                    <button
                      key={type}
                      type='button'
                      onClick={() => set({ discountType: type })}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        formData.discountType === type
                          ? "bg-white text-indigo-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}>
                      {type === "fixed" ? (
                        <>
                          <BadgeDollarSign className='h-3.5 w-3.5' />
                          Fixed (BDT)
                        </>
                      ) : (
                        <>
                          <Percent className='h-3.5 w-3.5' />
                          Percentage
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </Field>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-5'>
                <Field
                  label='Discount value'
                  required
                  hint={
                    formData.discountType === "fixed"
                      ? "Amount in BDT"
                      : "e.g. 15 for 15%"
                  }
                  error={errors.discountValue}>
                  <Input
                    type='number'
                    placeholder={
                      formData.discountType === "fixed" ? "100" : "15"
                    }
                    value={formData.discountValue}
                    onChange={(e) => set({ discountValue: e.target.value })}
                    className={`h-9 text-sm border-slate-200 focus-visible:ring-indigo-500 ${errors.discountValue ? "border-rose-400" : ""}`}
                  />
                </Field>

                <Field
                  label='Max uses per customer'
                  required
                  hint='1–5 uses allowed'
                  error={errors.maxUsesPerCustomer}>
                  <Input
                    type='number'
                    min='1'
                    max='5'
                    value={formData.maxUsesPerCustomer}
                    onChange={(e) =>
                      set({ maxUsesPerCustomer: e.target.value })
                    }
                    className={`h-9 text-sm border-slate-200 focus-visible:ring-indigo-500 ${errors.maxUsesPerCustomer ? "border-rose-400" : ""}`}
                  />
                </Field>

                <Field
                  label='Total usage limit'
                  hint='Leave empty for unlimited'>
                  <Input
                    type='number'
                    placeholder='Unlimited'
                    value={formData.totalUsageLimit}
                    onChange={(e) => set({ totalUsageLimit: e.target.value })}
                    className='h-9 text-sm border-slate-200 focus-visible:ring-indigo-500'
                  />
                </Field>
              </div>

              {formData.discountType === "percentage" && (
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-5'>
                  <Field
                    label='Max discount cap'
                    hint='Maximum discount in BDT'>
                    <Input
                      type='number'
                      placeholder='e.g. 500'
                      value={formData.maxDiscountAmount}
                      onChange={(e) =>
                        set({ maxDiscountAmount: e.target.value })
                      }
                      className='h-9 text-sm border-slate-200 focus-visible:ring-indigo-500'
                    />
                  </Field>
                </div>
              )}
            </Section>
          </div>

          {/* Validity */}
          <div className='bg-white rounded-2xl border border-slate-100 shadow-sm p-6'>
            <Section icon={Calendar} title='Validity period'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                <Field label='Valid from' required error={errors.validFrom}>
                  <Input
                    type='datetime-local'
                    value={formData.validFrom}
                    onChange={(e) => set({ validFrom: e.target.value })}
                    className={`h-9 text-sm border-slate-200 focus-visible:ring-indigo-500 ${errors.validFrom ? "border-rose-400" : ""}`}
                  />
                </Field>

                <Field label='Valid until' required error={errors.validUntil}>
                  <Input
                    type='datetime-local'
                    value={formData.validUntil}
                    onChange={(e) => set({ validUntil: e.target.value })}
                    className={`h-9 text-sm border-slate-200 focus-visible:ring-indigo-500 ${errors.validUntil ? "border-rose-400" : ""}`}
                  />
                </Field>
              </div>
            </Section>
          </div>

          {/* Additional settings */}
          <div className='bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5'>
            <Section icon={Settings2} title='Additional settings'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                <Field
                  label='Minimum order amount (BDT)'
                  hint='Default: 0 — no minimum'
                  error={errors.minOrderAmount}>
                  <Input
                    type='number'
                    min='0'
                    value={formData.minOrderAmount}
                    onChange={(e) => set({ minOrderAmount: e.target.value })}
                    className={`h-9 text-sm border-slate-200 focus-visible:ring-indigo-500 ${errors.minOrderAmount ? "border-rose-400" : ""}`}
                  />
                </Field>

                <Field
                  label='Auto-apply priority'
                  hint='Higher = applied first (default: 0)'
                  error={errors.priority}>
                  <Input
                    type='number'
                    min='0'
                    value={formData.priority}
                    onChange={(e) => set({ priority: e.target.value })}
                    className={`h-9 text-sm border-slate-200 focus-visible:ring-indigo-500 ${errors.priority ? "border-rose-400" : ""}`}
                  />
                </Field>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <ToggleCard
                  checked={formData.firstOrderOnly}
                  onChange={(v) => set({ firstOrderOnly: v })}
                  title='First order only'
                  description="Valid only for a customer's first order"
                />
                <ToggleCard
                  checked={formData.autoApply}
                  onChange={(v) => set({ autoApply: v })}
                  title='Auto apply'
                  description='Automatically apply best coupon at checkout'
                />
              </div>
            </Section>
          </div>

          {/* Actions */}
          <div className='flex items-center justify-end gap-3 pt-1'>
            <button
              type='button'
              onClick={() => navigate("/coupons/global")}
              className='h-10 px-5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors'>
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='h-10 px-6 flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-200'>
              {loading ? (
                <>
                  <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Creating…
                </>
              ) : (
                <>
                  <Zap className='h-4 w-4' />
                  Create Coupon
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
