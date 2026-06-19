import React, { useRef, useState } from "react";
import { useCreateCampaign } from "../hooks/useCreateCampaign";
import { toast } from "react-hot-toast";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import {
  Upload,
  ChevronRight,
  ChevronLeft,
  Tag,
  CreditCard,
  Truck,
  Calendar,
  Settings,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import placeHolder from "../../../assets/placeholder.svg";
import { DateTimePicker } from "../../../components/customComponent/DateTimePicker";
import MainView from "../../../coreComponents/mainView";
import SelectProductForCampaign from "./selectProducts";
import { cn } from "@/lib/utils";

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ icon, title, description, children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
    <div className='px-6 py-5 border-b border-gray-100 flex items-center gap-3'>
      <span className='flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600'>
        {icon}
      </span>
      <div>
        <h3 className='text-sm font-semibold text-gray-900'>{title}</h3>
        {description && (
          <p className='text-xs text-gray-500 mt-0.5'>{description}</p>
        )}
      </div>
    </div>
    <div className='px-6 py-5'>{children}</div>
  </div>
);

// ─── Field wrapper ─────────────────────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, htmlFor, children, className = "" }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <Label
      htmlFor={htmlFor}
      className='text-xs font-medium text-gray-600 uppercase tracking-wide'>
      {label}
    </Label>
    {children}
  </div>
);

// ─── Step indicator ────────────────────────────────────────────────────────────
const StepIndicator: React.FC<{ step: number }> = ({ step }) => (
  <div className='flex items-center gap-3 mb-8'>
    {[
      { n: 1, label: "Campaign Details" },
      { n: 2, label: "Select Products" },
    ].map(({ n, label }, idx) => (
      <React.Fragment key={n}>
        <div className='flex items-center gap-2'>
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
              step === n
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : step > n
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-400"
            }`}>
            {step > n ? <CheckCircle2 className='w-4 h-4' /> : n}
          </span>
          <span
            className={`text-sm font-medium hidden sm:block ${step === n ? "text-gray-900" : "text-gray-400"}`}>
            {label}
          </span>
        </div>
        {idx < 1 && (
          <div
            className={`flex-1 h-px transition-all duration-300 ${step > n ? "bg-emerald-400" : "bg-gray-200"}`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const CreateCampaignForm: React.FC = () => {
  const { createCampaign, loading } = useCreateCampaign();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  const [discount, setDiscount] = useState<string>("0");
  const [discountType, setDiscountType] = useState<string>("-");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [active, setActive] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [prepaymentAmount, setPrepaymentAmount] = useState<string>("0");
  const [prepaymentType, setPrepaymentType] = useState<string>("fixed");
  const [minOrderAmount, setMinOrderAmount] = useState<string>("0");
  const [maxPrepaymentAmount, setMaxPrepaymentAmount] = useState<string | null>(
    null,
  );
  const [deliveryDiscountType, setDeliveryDiscountType] = useState<
    "none" | "free" | "fixed" | "percentage"
  >("none");
  const [deliveryDiscountAmount, setDeliveryDiscountAmount] =
    useState<string>("0");
  const [step, setStep] = useState(1);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!products.length || products.length < 3) {
      toast.error("Select at least 3 products to continue.");
      return;
    }
    if (
      deliveryDiscountType === "fixed" &&
      Number(deliveryDiscountAmount) <= 0
    ) {
      toast.error("Fixed delivery discount must be a positive amount.");
      return;
    }
    if (
      deliveryDiscountType === "percentage" &&
      (Number(deliveryDiscountAmount) < 0 ||
        Number(deliveryDiscountAmount) > 100)
    ) {
      toast.error("Delivery discount percentage must be between 0 and 100.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("products", JSON.stringify(products));
    formData.append("discount", discount);
    formData.append("discountType", discountType);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("prepaymentAmount", prepaymentAmount);
    formData.append("minOrderAmount", minOrderAmount);
    if (maxPrepaymentAmount)
      formData.append("maxPrepaymentAmount", maxPrepaymentAmount);
    formData.append("prepaymentType", prepaymentType);
    formData.append(
      "prepaymentRequired",
      Number(prepaymentAmount) > 0 || prepaymentType.includes("deliverycharge")
        ? "true"
        : "false",
    );
    formData.append("deliveryDiscountType", deliveryDiscountType);
    formData.append("deliveryDiscountAmount", deliveryDiscountAmount);
    formData.append("active", active.toString());
    if (image) formData.append("image", image);

    const response = await createCampaign(formData);
    if (response) toast.success("Campaign created successfully!");
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !startDate || !endDate) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setStep(2);
  };

  // Delivery discount preview
  const deliveryPreview = (() => {
    const base = 60;
    if (deliveryDiscountType === "free") return 0;
    if (deliveryDiscountType === "percentage")
      return Math.max(0, base - (base * Number(deliveryDiscountAmount)) / 100);
    if (deliveryDiscountType === "fixed")
      return Math.max(0, base - Number(deliveryDiscountAmount));
    return base;
  })();

  const stepOneComponent = () => {
    return (
      <form onSubmit={handleNext}>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Left column */}
          <div className='md:col-span-2 flex flex-col gap-4'>
            {/* Basic Info */}
            <Section
              icon={<Tag className='w-4 h-4' />}
              title='Campaign Info'
              description='Name and describe your campaign'>
              <div className='flex flex-col gap-5'>
                <Field label='Campaign Title' htmlFor='title'>
                  <Input
                    id='title'
                    type='text'
                    placeholder='e.g. Summer Sale 2025'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className='h-10 text-sm rounded-lg border-gray-200 focus:border-indigo-400 focus:ring-indigo-100'
                    required
                  />
                </Field>
                <Field label='Description' htmlFor='description'>
                  <Textarea
                    id='description'
                    placeholder="Describe what this campaign offers and who it's for…"
                    value={description}
                    rows={4}
                    onChange={(e) => setDescription(e.target.value)}
                    className='text-sm rounded-lg border-gray-200 focus:border-indigo-400 focus:ring-indigo-100 resize-none'
                    required
                  />
                </Field>
              </div>
            </Section>

            {/* Image */}
            <Section
              icon={<ImageIcon className='w-4 h-4' />}
              title='Campaign Image'
              description='Shown on campaign listings and banners'>
              <div
                className='relative group cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-indigo-300 transition-colors'
                onClick={() => fileRef.current?.click()}>
                <img
                  alt='Campaign preview'
                  src={imagePreview || placeHolder}
                  className='w-full h-52 object-cover'
                />
                <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2'>
                  <Upload className='w-6 h-6 text-white' />
                  <span className='text-white text-sm font-medium'>
                    Change image
                  </span>
                </div>
              </div>
              <input
                id='picture'
                type='file'
                className='hidden'
                ref={fileRef}
                name='image'
                accept='.png,.jpg,.jpeg'
                onChange={handleImageChange}
              />
              <p className='text-xs text-gray-400 mt-2 text-center'>
                PNG, JPG, JPEG accepted
              </p>
            </Section>
          </div>

          {/* Right column */}
          <div className='flex flex-col gap-6'>
            {/* Discount */}
            <Section
              icon={<Tag className='w-4 h-4' />}
              title='Discount'
              description='Applied to all campaign products'>
              <div className='grid grid-cols-2 gap-4'>
                <Field label='Type' htmlFor='discount-type'>
                  <Select value={discountType} onValueChange={setDiscountType}>
                    <SelectTrigger
                      id='discount-type'
                      className='h-10 text-sm rounded-lg border-gray-200'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='%'>Percentage (%)</SelectItem>
                      <SelectItem value='-'>Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label='Value' htmlFor='discount'>
                  <Input
                    id='discount'
                    type='text'
                    value={discount}
                    onChange={(e) =>
                      setDiscount(
                        isNaN(Number(e.target.value)) ? "" : e.target.value,
                      )
                    }
                    className='h-10 text-sm rounded-lg border-gray-200'
                    required
                  />
                </Field>
              </div>
            </Section>

            {/* Pre-payment */}
            <Section
              icon={<CreditCard className='w-4 h-4' />}
              title='Pre-payment'
              description='Require upfront payment from customers'>
              <div className='flex flex-col gap-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <Field label='Payment Type'>
                    <Select
                      value={prepaymentType}
                      onValueChange={setPrepaymentType}>
                      <SelectTrigger className='h-10 text-sm rounded-lg border-gray-200'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='percentage'>
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value='fixed'>Fixed Amount</SelectItem>
                        <SelectItem value='deliverycharge'>
                          Delivery Charge
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  {!prepaymentType.includes("deliverycharge") && (
                    <Field label='Amount'>
                      <Input
                        type='text'
                        value={prepaymentAmount}
                        onChange={(e) =>
                          setPrepaymentAmount(
                            isNaN(Number(e.target.value)) ? "" : e.target.value,
                          )
                        }
                        className='h-10 text-sm rounded-lg border-gray-200'
                        max={prepaymentType === "percentage" ? 100 : undefined}
                      />
                    </Field>
                  )}
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <Field label='Min Order'>
                    <Input
                      type='text'
                      value={minOrderAmount}
                      onChange={(e) =>
                        setMinOrderAmount(
                          isNaN(Number(e.target.value)) ? "" : e.target.value,
                        )
                      }
                      className='h-10 text-sm rounded-lg border-gray-200'
                    />
                  </Field>
                  <Field label='Max Amount'>
                    <Input
                      type='text'
                      value={maxPrepaymentAmount ?? ""}
                      placeholder='Optional'
                      onChange={(e) =>
                        setMaxPrepaymentAmount(
                          isNaN(Number(e.target.value)) ? "" : e.target.value,
                        )
                      }
                      className='h-10 text-sm rounded-lg border-gray-200'
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Delivery Discount */}
            <Section
              icon={<Truck className='w-4 h-4' />}
              title='Delivery Discount'
              description='Reduce or waive delivery fees'>
              <div className='flex flex-col gap-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <Field label='Discount Type'>
                    <Select
                      value={deliveryDiscountType}
                      onValueChange={(
                        v: "none" | "free" | "fixed" | "percentage",
                      ) => {
                        setDeliveryDiscountType(v);
                        if (v === "none" || v === "free")
                          setDeliveryDiscountAmount("0");
                      }}>
                      <SelectTrigger className='h-10 text-sm rounded-lg border-gray-200'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='none'>No Discount</SelectItem>
                        <SelectItem value='free'>Free Delivery</SelectItem>
                        <SelectItem value='fixed'>Fixed Amount</SelectItem>
                        <SelectItem value='percentage'>
                          Percentage (%)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  {deliveryDiscountType !== "none" &&
                    deliveryDiscountType !== "free" && (
                      <Field
                        label={
                          deliveryDiscountType === "percentage"
                            ? "Percentage"
                            : "Amount"
                        }>
                        <Input
                          type='text'
                          value={deliveryDiscountAmount}
                          placeholder={
                            deliveryDiscountType === "percentage"
                              ? "0–100"
                              : "0.00"
                          }
                          onChange={(e) =>
                            setDeliveryDiscountAmount(
                              isNaN(Number(e.target.value))
                                ? "0"
                                : e.target.value,
                            )
                          }
                          className='h-10 text-sm rounded-lg border-gray-200'
                        />
                      </Field>
                    )}
                </div>

                {deliveryDiscountType !== "none" && (
                  <div className='rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-xs text-indigo-800'>
                    <p className='font-semibold mb-2 text-indigo-900'>
                      Preview (based on ৳60 delivery)
                    </p>
                    <div className='flex justify-between mb-1'>
                      <span>Original charge</span>
                      <span className='font-medium'>৳60</span>
                    </div>
                    <div className='flex justify-between mb-1'>
                      <span>Discount</span>
                      <span className='font-medium text-emerald-600'>
                        {deliveryDiscountType === "free"
                          ? "100% off"
                          : deliveryDiscountType === "percentage"
                            ? `${deliveryDiscountAmount}% off`
                            : `৳${deliveryDiscountAmount} off`}
                      </span>
                    </div>
                    <div className='flex justify-between pt-2 border-t border-indigo-200 font-semibold'>
                      <span>Customer pays</span>
                      <span className='text-indigo-700'>
                        ৳{deliveryPreview}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* Dates */}
            <Section
              icon={<Calendar className='w-4 h-4' />}
              title='Schedule'
              description='Set campaign start and end dates'>
              <div className='flex flex-col gap-4'>
                <Field label='Start Date & Time'>
                  <DateTimePicker onChange={(v: any) => setStartDate(v)} />
                </Field>
                <Field label='End Date & Time'>
                  <DateTimePicker onChange={(v: any) => setEndDate(v)} />
                </Field>
              </div>
            </Section>

            {/* Status */}
            <Section icon={<Settings className='w-4 h-4' />} title='Status'>
              <Field label='Campaign Status'>
                <Select onValueChange={(v) => setActive(Boolean(v))}>
                  <SelectTrigger className='h-10 text-sm rounded-lg border-gray-200'>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='true'>
                      <span className='flex items-center gap-2'>
                        <span className='w-2 h-2 rounded-full bg-emerald-500 inline-block' />
                        Active
                      </span>
                    </SelectItem>
                    <SelectItem value='false'>
                      <span className='flex items-center gap-2'>
                        <span className='w-2 h-2 rounded-full bg-red-400 inline-block' />
                        Inactive
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </Section>

            {/* CTA */}
            <Button
              type='submit'
              disabled={loading}
              className='w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold gap-2 shadow-md shadow-indigo-100 transition-all'>
              Continue to Products
              <ChevronRight className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </form>
    );
  };

  const stepTwoComponent = () => {
    return (
      <div className='flex flex-col gap-4'>
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
          {/* ─── Header ─── */}
          <div className='px-6 pt-5 pb-4'>
            <div className='flex items-center gap-2 mb-3'>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100'>
                Step 2 / 2
              </span>
            </div>
            <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
              <div>
                <h3 className='text-base font-semibold text-gray-900 leading-snug'>
                  Select Products
                </h3>
                <p className='text-sm text-gray-500 mt-0.5'>
                  Choose at least 3 products to include in this campaign.
                </p>
              </div>
              <div className='flex items-center gap-2 shrink-0'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setStep(1)}
                  className='gap-1.5 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors'>
                  <ChevronLeft className='w-4 h-4' />
                  Back
                </Button>
                <Button
                  size='sm'
                  onClick={handleSubmit}
                  disabled={loading || products.length < 3}
                  className={cn(
                    "gap-2 rounded-lg font-medium transition-all",
                    products.length >= 3
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-100"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed",
                  )}>
                  {loading ? (
                    <>
                      <span className='w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin' />
                      Creating…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className='w-4 h-4' />
                      Create Campaign
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* ─── Progress bar ─── */}
          <div className='px-6 pb-4'>
            <div className='w-full bg-gray-100 rounded-full h-1.5'>
              <div
                className='bg-indigo-600 h-1.5 rounded-full transition-all duration-500'
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* ─── Selection status banner ─── */}
          <div
            className={cn(
              "mx-6 mb-4 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 border text-sm font-medium transition-all duration-300",
              products.length === 0
                ? "bg-orange-50 border-orange-100 text-orange-700"
                : products.length < 3
                  ? "bg-amber-50 border-amber-100 text-amber-700"
                  : "bg-emerald-50 border-emerald-100 text-emerald-700",
            )}>
            <div className='flex items-center gap-2'>
              {products.length >= 3 ? (
                <CheckCircle2 className='w-4 h-4 shrink-0' />
              ) : (
                <AlertCircle className='w-4 h-4 shrink-0' />
              )}
              <span>
                {products.length === 0
                  ? "No products selected yet — pick at least 3 to continue."
                  : products.length < 3
                    ? `${products.length} selected — add ${3 - products.length} more to continue.`
                    : `${products.length} product${products.length !== 1 ? "s" : ""} selected — good to go!`}
              </span>
            </div>
            <span className='tabular-nums text-xs font-semibold opacity-80 shrink-0'>
              {products.length} / 3 min
            </span>
          </div>

          {/* ─── Product selector ─── */}
          <div className='border-t border-gray-100'>
            <SelectProductForCampaign
              productList={[]}
              updateProductList={(list: string[]) => setProducts(list)}
            />
          </div>
        </div>

        {/* ─── Bottom action row (sticky-feel alternative) ─── */}
        <div className='flex items-center justify-between px-1'>
          <p className='text-xs text-gray-400'>
            {products.length >= 3
              ? "Ready to launch your campaign."
              : `${Math.max(0, 3 - products.length)} more product${3 - products.length !== 1 ? "s" : ""} needed.`}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={loading || products.length < 3}
            className={cn(
              "gap-2 rounded-xl px-5 font-medium transition-all",
              products.length >= 3
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100"
                : "bg-gray-100 text-gray-400 cursor-not-allowed",
            )}>
            {loading ? (
              <>
                <span className='w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin' />
                Creating…
              </>
            ) : (
              <>
                <CheckCircle2 className='w-4 h-4' />
                Create Campaign
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <MainView title='Create Campaign'>
      <div className='bg-gray-50/60 px-4 min-h-0 flex-1 overflow-y-auto'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>
              Create Campaign
            </h1>
            <p className='text-sm text-gray-500 mt-1'>
              Set up a new promotional campaign with discounts and product
              selections.
            </p>
          </div>

          <StepIndicator step={step} />

          {/* ── STEP 1 ── */}
          {step === 1 && stepOneComponent()}

          {/* ── STEP 2 ── */}
          {step === 2 && stepTwoComponent()}
        </div>
      </div>
    </MainView>
  );
};

export default CreateCampaignForm;
