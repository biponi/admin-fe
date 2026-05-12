import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  User,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  FileText,
  Search,
  Calculator,
  Truck,
  Tag,
  Wallet,
  Save,
  X,
} from "lucide-react";
import { BDDistrictList, BDDivisions } from "../../utils/contents";
import { getLocationByFormattedString } from "../../utils/functions";
import { ICustomer } from "./interface";

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
  division: any;
  district: any;
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
// Reusable Components
// ─────────────────────────────────────────────────────────────────────────────

const SectionCard = ({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  children,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}) => (
  <Card className='border-slate-200/60 shadow-none border-x-0 border-t-0 rounded-none'>
    <CardHeader className='px-0 pb-3'>
      <CardTitle className='flex items-center gap-2 text-slate-700 text-base'>
        <div className={`p-1 rounded ${iconBg}`}>
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className='px-0 space-y-3'>{children}</CardContent>
  </Card>
);

const FormField = ({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className='space-y-2'>
    <Label className='text-xs font-medium text-slate-700 flex items-center gap-1'>
      {Icon && <Icon className='h-3 w-3' />}
      {label}
    </Label>
    {children}
  </div>
);

const SearchableSelect = ({
  value,
  onValueChange,
  options,
  placeholder,
  query,
  onQueryChange,
  colorClass = "green",
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: Location[];
  placeholder: string;
  query: string;
  onQueryChange: (query: string) => void;
  colorClass?: string;
}) => {
  const filtered = options.filter(
    (opt) =>
      opt.name.toLowerCase().includes(query.toLowerCase()) ||
      opt.bn_name.includes(query),
  );

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={`h-9 text-sm focus:ring-1 focus:ring-${colorClass}-500/30`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className='relative'>
          <Search className='absolute left-2 top-2 h-3 w-3 text-gray-400' />
          <Input
            type='text'
            className={`h-7 pl-7 text-xs border-0 border-b rounded-none focus:border-${colorClass}-500 focus:ring-0`}
            placeholder='Search...'
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
        {filtered.map((opt) => (
          <SelectItem
            key={opt.id}
            value={opt.id}
            className={`text-xs cursor-pointer hover:bg-${colorClass}-50`}>
            {`${opt.name}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom Hooks
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
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initial.totalPrice,
    initial.deliveryCharge,
    initial.discount,
    initial.paid,
  ]);

  return { payment, remaining, finalAmount, updateField };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
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
  const [divisionQuery, setDivisionQuery] = useState("");
  const [districtQuery, setDistrictQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { payment, remaining, finalAmount, updateField } =
    usePaymentCalculations({
      totalPrice,
      deliveryCharge,
      discount,
      paid,
    });

  // Sync props to state
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

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDivisionChange = (id: string) => {
    const division = BDDivisions.find((d) => d.id === id) ?? null;
    setShippingAddress((prev) => ({ ...prev, division, district: null }));
    setDistrictQuery("");
  };

  const handleDistrictChange = (id: string) => {
    const district = BDDistrictList.find((d) => d.id === id) ?? null;
    setShippingAddress((prev) => ({ ...prev, district }));
  };

  const formatLocation = (loc: Location | null) => (loc ? `${loc.name}` : "");

  const handleSubmit = () => {
    setIsSubmitting(true);
    try {
      handleCustomerDataChange({
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

  const filteredDistricts = useMemo(
    () =>
      BDDistrictList.filter(
        (d) => d.division_id === shippingAddress.division?.id,
      ),
    [shippingAddress.division?.id],
  );

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto px-6 py-4 space-y-4'>
        {/* Customer Information */}
        <SectionCard
          icon={User}
          iconBg='bg-blue-100'
          iconColor='text-blue-600'
          title='Customer Information'>
          <FormField label='Customer Name' icon={User}>
            <Input
              name='name'
              value={personalInfo.name}
              onChange={handlePersonalChange}
              placeholder='Enter customer name'
              className='h-9 text-sm'
            />
          </FormField>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <FormField label='Email' icon={Mail}>
              <Input
                name='email'
                type='email'
                value={personalInfo.email}
                onChange={handlePersonalChange}
                placeholder='email@example.com'
                className='h-9 text-sm'
              />
            </FormField>
            <FormField label='Phone' icon={Phone}>
              <Input
                name='phoneNumber'
                value={personalInfo.phoneNumber}
                onChange={handlePersonalChange}
                placeholder='017XXXXXXXXX'
                className='h-9 text-sm'
              />
            </FormField>
          </div>

          <FormField label='Notes' icon={FileText}>
            <Textarea
              rows={2}
              value={updatedNotes}
              onChange={(e) => setUpdatedNotes(e.target.value)}
              placeholder='Special instructions...'
              className='text-sm resize-none'
            />
          </FormField>
        </SectionCard>

        {/* Shipping Address */}
        <SectionCard
          icon={MapPin}
          iconBg='bg-green-100'
          iconColor='text-green-600'
          title='Shipping Address'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <FormField label='Division'>
              <SearchableSelect
                value={shippingAddress.division?.id ?? ""}
                onValueChange={handleDivisionChange}
                options={BDDivisions}
                placeholder='Select division'
                query={divisionQuery}
                onQueryChange={setDivisionQuery}
              />
            </FormField>

            {shippingAddress.division && (
              <FormField label='District'>
                <SearchableSelect
                  value={shippingAddress.district?.id ?? ""}
                  onValueChange={handleDistrictChange}
                  options={filteredDistricts}
                  placeholder='Select district'
                  query={districtQuery}
                  onQueryChange={setDistrictQuery}
                />
              </FormField>
            )}
          </div>

          <FormField label='Complete Address'>
            <Textarea
              rows={2}
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              placeholder='House/Flat no., Street, Area...'
              className='text-sm resize-none'
            />
          </FormField>
        </SectionCard>

        {/* Payment Details */}
        <SectionCard
          icon={CreditCard}
          iconBg='bg-amber-100'
          iconColor='text-amber-600'
          title='Payment Details'>
          <div className='grid grid-cols-2 gap-3'>
            <FormField label='Total Price' icon={Calculator}>
              <Input
                type='number'
                value={payment.totalPrice}
                disabled
                className='h-9 text-sm bg-slate-50'
              />
            </FormField>
            <FormField label='Delivery' icon={Truck}>
              <Input
                type='number'
                min={0}
                value={payment.deliveryCharge}
                onChange={(e) =>
                  updateField("deliveryCharge", Number(e.target.value))
                }
                className='h-9 text-sm'
              />
            </FormField>
            <FormField label='Discount' icon={Tag}>
              <Input
                type='number'
                min={0}
                value={payment.discount}
                onChange={(e) =>
                  updateField("discount", Number(e.target.value))
                }
                className='h-9 text-sm'
              />
            </FormField>
            <FormField label='Paid' icon={Wallet}>
              <Input
                type='number'
                min={0}
                value={payment.paid}
                onChange={(e) => updateField("paid", Number(e.target.value))}
                className='h-9 text-sm'
              />
            </FormField>
          </div>

          <Separator className='my-3' />

          <div className='bg-slate-50 p-3 rounded-md'>
            <h4 className='text-xs font-medium text-slate-700 flex items-center gap-1 mb-2'>
              <Calculator className='h-3 w-3' /> Summary
            </h4>
            <div className='grid grid-cols-2 gap-2 text-xs'>
              <div className='flex justify-between'>
                <span className='text-slate-600'>Final:</span>
                <span className='font-medium'>
                  ৳{finalAmount.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-slate-600'>Due:</span>
                <Badge
                  variant={remaining > 0 ? "destructive" : "secondary"}
                  className='text-xs h-5 px-2'>
                  ৳{remaining.toLocaleString()}
                </Badge>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Footer */}
      <div className='border-t bg-slate-50/80 backdrop-blur-sm p-4 flex gap-3'>
        <Button
          variant='outline'
          onClick={handleClose}
          disabled={isSubmitting}
          className='flex-1 h-9 text-sm'>
          <X className='h-3.5 w-3.5 mr-1' /> Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className='flex-1 h-9 text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'>
          {isSubmitting ? (
            <>
              <div className='w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin mr-1' />{" "}
              Saving...
            </>
          ) : (
            <>
              <Save className='h-3.5 w-3.5 mr-1' /> Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EditCustomerInformation;
