import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../components/ui/command";
import {
  User,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  FileText,
  Calculator,
  Truck,
  Tag,
  Wallet,
  Save,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronsUpDown,
  Check,
  Package,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { BDDistrictList, BDDivisions } from "../../utils/contents";
import { getLocationByFormattedString } from "../../utils/functions";
import { calculateDeliveryCharge } from "../../utils/deliveryCharge";
import { ICustomer } from "./interface";
import { isValidBDPhone, normalizeBDPhone } from "@/utils/helperFunction";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Location {
  id: string;
  name: string;
  bn_name: string;
  division_id?: string;
}

interface ShippingAddress {
  division: Location | null;
  district: Location | null;
  address: string;
}

interface PaymentInfo {
  totalPrice: number;
  deliveryCharge: number;
  discount: number;
  paid: number;
}

interface Props {
  shipping: { division?: string; district?: string; address?: string };
  customerInfo: ICustomer;
  deliveryCharge: number;
  totalPrice: number;
  paid: number;
  remaining: number;
  discount: number;
  notes: string;
  handleClose: () => void;
  handleCustomerDataChange: (data: any) => void | Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Avatar initials helper
// ─────────────────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

// ─────────────────────────────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────────────────────────────

const Section = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
  <div className='space-y-3'>
    <p className='flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
      <Icon className='h-3 w-3' />
      {label}
    </p>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Labelled field wrapper
// ─────────────────────────────────────────────────────────────────────────────

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className='space-y-1.5'>
    <Label className='text-xs font-medium text-muted-foreground'>
      {label}
      {required && <span className='ml-0.5 text-destructive'>*</span>}
    </Label>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Command-based location dropdown (inline, no popover)
// ─────────────────────────────────────────────────────────────────────────────

const LocationCombobox = ({
  value,
  onValueChange,
  options,
  placeholder,
  disabled = false,
}: {
  value: string;
  onValueChange: (id: string) => void;
  options: Location[];
  placeholder: string;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className='relative' ref={containerRef}>
      <Button
        variant='outline'
        role='combobox'
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "h-9 w-full justify-between border-border/50 text-sm font-normal",
          "hover:bg-accent/50 disabled:opacity-50",
          !selected && "text-muted-foreground",
        )}>
        <span className='truncate'>{selected?.name ?? placeholder}</span>
        <ChevronsUpDown className='ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground' />
      </Button>

      {open && (
        <div className='absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg'>
          <Command>
            <CommandInput
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              className='h-8 text-xs'
            />
            <CommandList className='max-h-48'>
              <CommandEmpty className='py-6 text-center text-xs text-muted-foreground'>
                No results found.
              </CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.id}
                    value={`${opt.name} ${opt.bn_name}`}
                    onSelect={() => {
                      onValueChange(opt.id);
                      setOpen(false);
                    }}
                    className='cursor-pointer text-xs'>
                    <Check
                      className={cn(
                        "mr-2 h-3 w-3",
                        value === opt.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span>{opt.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────
// Payment hook
// ─────────────────────────────────────────────────────────────────────────────

const usePaymentCalculations = (initial: PaymentInfo) => {
  const [payment, setPayment] = useState(initial);

  const remaining = useMemo(
    () =>
      payment.totalPrice +
      payment.deliveryCharge -
      payment.discount -
      payment.paid,
    [payment],
  );

  const finalAmount = useMemo(
    () => payment.totalPrice + payment.deliveryCharge - payment.discount,
    [payment],
  );

  const updateField = useCallback((field: keyof PaymentInfo, value: number) => {
    setPayment((prev) => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    setPayment(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initial.totalPrice,
    initial.deliveryCharge,
    initial.discount,
    initial.paid,
  ]);

  return { payment, remaining, finalAmount, updateField };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const EditCustomerInformation: React.FC<Props> = ({
  paid,
  totalPrice,
  shipping,
  discount,
  notes,
  handleClose,
  customerInfo,
  deliveryCharge,
  handleCustomerDataChange,
}) => {
  const [personalInfo, setPersonalInfo] = useState<ICustomer>({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    division: null,
    district: null,
    address: "",
  });
  const [updatedNotes, setUpdatedNotes] = useState(notes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const { payment, remaining, finalAmount, updateField } =
    usePaymentCalculations({ totalPrice, deliveryCharge, discount, paid });

  // ── Sync props → state ──────────────────────────────────────────────────
  useEffect(() => setPersonalInfo(customerInfo), [customerInfo]);
  useEffect(() => setUpdatedNotes(notes), [notes]);
  useEffect(() => {
    setShippingAddress({
      address: shipping?.address ?? "",
      district:
        getLocationByFormattedString(
          BDDistrictList,
          shipping?.district ?? "",
        ) ?? null,
      division:
        getLocationByFormattedString(BDDivisions, shipping?.division ?? "") ??
        null,
    });
  }, [shipping]);

  // ── Phone handlers ──────────────────────────────────────────────────────
  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "");
      setPersonalInfo((prev) => ({ ...prev, phoneNumber: digits }));
    },
    [],
  );

  const handlePhonePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const normalized = normalizeBDPhone(e.clipboardData.getData("text"));
      if (normalized) {
        setPersonalInfo((prev) => ({ ...prev, phoneNumber: normalized }));
      }
    },
    [],
  );

  const handlePhoneBlur = useCallback(() => {
    setPhoneTouched(true);
    setPersonalInfo((prev) => ({
      ...prev,
      phoneNumber: normalizeBDPhone(prev.phoneNumber ?? ""),
    }));
  }, []);

  // null = untouched, true = valid, false = invalid
  const phoneValidity: boolean | null = useMemo(() => {
    if (!phoneTouched || !personalInfo.phoneNumber) return null;
    return isValidBDPhone(personalInfo.phoneNumber);
  }, [phoneTouched, personalInfo.phoneNumber]);

  // ── Location handlers ───────────────────────────────────────────────────
  const handleDivisionChange = useCallback((id: string) => {
    const division = BDDivisions.find((d) => d.id === id) ?? null;
    setShippingAddress((prev) => ({ ...prev, division, district: null }));
  }, []);

  const handleDistrictChange = useCallback((id: string) => {
    const district = BDDistrictList.find((d) => d.id === id) ?? null;
    setShippingAddress((prev) => ({ ...prev, district }));
  }, []);

  const filteredDistricts = useMemo(
    () =>
      BDDistrictList.filter(
        (d) => d.division_id === shippingAddress.division?.id,
      ),
    [shippingAddress.division?.id],
  );

  // Auto-calculate delivery charge when district/area changes
  useEffect(() => {
    if (shippingAddress.division && shippingAddress.district) {
      const chargeInfo = calculateDeliveryCharge(
        shippingAddress.district.name,
        shippingAddress.division.name,
      );
      updateField("deliveryCharge", chargeInfo.charge);
    }
  }, [shippingAddress.division, shippingAddress.district, updateField]);

  const formatLocation = (loc: Location | null) => loc?.name ?? "";

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await handleCustomerDataChange({
        notes: updatedNotes,
        customer: personalInfo,
        shipping: {
          address: shippingAddress.address,
          district: formatLocation(shippingAddress.district),
          division: formatLocation(shippingAddress.division),
        },
        discount: payment.discount,
        remaining,
        paid: payment.paid,
        deliveryCharge: payment.deliveryCharge,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = getInitials(personalInfo.name || "?");

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className='flex flex-col min-h-full bg-background'>
      {/* ── Customer identity strip ── */}
      <div className='flex items-center gap-3 px-6 py-4 border-b border-border/50 bg-muted/30'>
        <div className='h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0'>
          <span className='text-xs font-semibold text-blue-700'>
            {initials}
          </span>
        </div>
        <div className='min-w-0'>
          <p className='text-sm font-medium text-foreground truncate'>
            {personalInfo.name || "New customer"}
          </p>
          <p className='text-[11px] text-muted-foreground truncate'>
            {personalInfo.phoneNumber || "No phone set"}
          </p>
        </div>
        <Badge
          variant='secondary'
          className='ml-auto shrink-0 text-[10px] h-5 px-2'>
          <Package className='h-2.5 w-2.5 mr-1' />
          Edit order
        </Badge>
      </div>

      {/* ── Scrollable body ── */}
      <div className='flex-1 overflow-y-auto'>
        <div className='px-6 py-5 space-y-6'>
          {/* Personal info */}
          <Section icon={User} label='Customer information'>
            <Field label='Full name'>
              <div className='relative'>
                <User className='absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none' />
                <Input
                  name='name'
                  value={personalInfo.name}
                  onChange={(e) =>
                    setPersonalInfo((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder='Enter customer name'
                  className='pl-8 h-9 text-sm border-border/50 focus-visible:ring-blue-500/20'
                />
              </div>
            </Field>

            <div className='grid grid-cols-2 gap-3'>
              <Field label='Email'>
                <div className='relative'>
                  <Mail className='absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none' />
                  <Input
                    name='email'
                    type='email'
                    value={personalInfo.email}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder='email@example.com'
                    className='pl-8 h-9 text-sm border-border/50 focus-visible:ring-blue-500/20'
                  />
                </div>
              </Field>

              <Field label='Phone' required>
                <div className='relative'>
                  <Phone className='absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none' />
                  <Input
                    name='phoneNumber'
                    type='text'
                    inputMode='numeric'
                    pattern='[0-9]*'
                    maxLength={11}
                    value={personalInfo.phoneNumber ?? ""}
                    onChange={handlePhoneChange}
                    onPaste={handlePhonePaste}
                    onBlur={handlePhoneBlur}
                    placeholder='01XXXXXXXXX'
                    className={cn(
                      "pl-8 pr-8 h-9 text-sm transition-colors border-border/50",
                      phoneValidity === true &&
                        "border-emerald-500 bg-emerald-50/50 focus-visible:ring-emerald-500/20",
                      phoneValidity === false &&
                        "border-red-400 bg-red-50/50 focus-visible:ring-red-400/20",
                    )}
                  />
                  {phoneValidity === true && (
                    <CheckCircle2 className='absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500 pointer-events-none' />
                  )}
                  {phoneValidity === false && (
                    <XCircle className='absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-red-400 pointer-events-none' />
                  )}
                </div>
                {phoneValidity === false && (
                  <p className='flex items-center gap-1 text-[11px] text-red-500'>
                    <AlertCircle className='h-3 w-3 shrink-0' />
                    Valid BD number required (e.g. 01712345678)
                  </p>
                )}
              </Field>
            </div>

            <Field label='Order notes'>
              <Textarea
                rows={2}
                value={updatedNotes}
                onChange={(e) => setUpdatedNotes(e.target.value)}
                placeholder='Special instructions, fragile items, delivery preferences...'
                className='text-sm resize-none border-border/50 focus-visible:ring-blue-500/20'
              />
            </Field>
          </Section>

          <Separator className='bg-border/50' />

          {/* Shipping */}
          <Section icon={MapPin} label='Shipping address'>
            <div className='grid grid-cols-2 gap-3'>
              <Field label={`District / City (${shipping?.division})`}>
                <LocationCombobox
                  value={
                    shippingAddress.division?.id ?? shipping?.division ?? ""
                  }
                  onValueChange={handleDivisionChange}
                  options={BDDivisions}
                  placeholder='Select division'
                />
              </Field>
              <Field label={`Area (${shipping?.district})`}>
                <LocationCombobox
                  value={
                    shippingAddress.district?.id ?? shipping?.district ?? ""
                  }
                  onValueChange={handleDistrictChange}
                  options={filteredDistricts}
                  placeholder='Select district'
                  disabled={!shippingAddress.division}
                />
              </Field>
            </div>

            <Field label='Complete address'>
              <Textarea
                rows={2}
                value={shippingAddress.address}
                onChange={(e) =>
                  setShippingAddress((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder='House/Flat no., Road, Area...'
                className='text-sm resize-none border-border/50 focus-visible:ring-blue-500/20'
              />
            </Field>
          </Section>

          <Separator className='bg-border/50' />

          {/* Payment */}
          <Section icon={CreditCard} label='Payment details'>
            <div className='grid grid-cols-2 gap-3'>
              <Field label='Total price'>
                <div className='relative'>
                  <span className='absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium'>
                    ৳
                  </span>
                  <Input
                    type='number'
                    value={payment.totalPrice}
                    disabled
                    className='pl-7 h-9 text-sm bg-muted/50 border-border/50 text-muted-foreground cursor-not-allowed'
                  />
                </div>
              </Field>

              <Field label='Delivery charge'>
                <div className='relative'>
                  <Truck className='absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none' />
                  <Input
                    type='number'
                    min={0}
                    value={payment.deliveryCharge}
                    onChange={(e) =>
                      updateField("deliveryCharge", Number(e.target.value))
                    }
                    className='pl-8 h-9 text-sm border-border/50 focus-visible:ring-blue-500/20'
                  />
                </div>
              </Field>

              <Field label='Discount'>
                <div className='relative'>
                  <Tag className='absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none' />
                  <Input
                    type='number'
                    min={0}
                    value={payment.discount}
                    onChange={(e) =>
                      updateField("discount", Number(e.target.value))
                    }
                    className='pl-8 h-9 text-sm border-border/50 focus-visible:ring-blue-500/20'
                  />
                </div>
              </Field>

              <Field label='Amount paid'>
                <div className='relative'>
                  <Wallet className='absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none' />
                  <Input
                    type='number'
                    min={0}
                    value={payment.paid}
                    onChange={(e) =>
                      updateField("paid", Number(e.target.value))
                    }
                    className='pl-8 h-9 text-sm border-border/50 focus-visible:ring-blue-500/20'
                  />
                </div>
              </Field>
            </div>

            {/* Summary card */}
            <div className='rounded-lg bg-muted/40 border border-border/40 p-3.5 space-y-2.5 mt-1'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-muted-foreground flex items-center gap-1.5'>
                  <Calculator className='h-3 w-3' />
                  Final amount
                </span>
                <span className='font-semibold text-foreground'>
                  ৳{finalAmount.toLocaleString()}
                </span>
              </div>
              <Separator className='bg-border/50' />
              <div className='flex items-center justify-between text-xs'>
                <span className='text-muted-foreground'>Amount due</span>
                <Badge
                  variant={remaining > 0 ? "destructive" : "secondary"}
                  className={cn(
                    "text-[11px] h-5 px-2.5 font-medium",
                    remaining === 0 &&
                      "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
                  )}>
                  {remaining > 0
                    ? `৳${remaining.toLocaleString()} due`
                    : "Paid in full"}
                </Badge>
              </div>
            </div>
          </Section>

          {/* Bottom breathing room */}
          <div className='h-2' />
        </div>
      </div>

      {/* ── Footer ── */}
      <div className='shrink-0 border-t border-border/50 bg-background/95 backdrop-blur-sm px-6 py-4 flex gap-3'>
        <Button
          variant='outline'
          onClick={handleClose}
          disabled={isSubmitting}
          className='flex-1 h-9 text-sm border-border/50 hover:bg-muted/60'>
          <X className='h-3.5 w-3.5 mr-1.5' />
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className='flex-[2] h-9 text-sm bg-blue-600 hover:bg-blue-700 text-white'>
          {isSubmitting ? (
            <>
              <div className='h-3.5 w-3.5 rounded-full border border-white border-t-transparent animate-spin mr-1.5' />
              Saving...
            </>
          ) : (
            <>
              <Save className='h-3.5 w-3.5 mr-1.5' />
              Save changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EditCustomerInformation;
