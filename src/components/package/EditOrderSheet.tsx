import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
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
  Loader2,
} from "lucide-react";
import { BDDistrictList, BDDivisions } from "../../utils/contents";
import { getLocationByFormattedString } from "../../utils/functions";
import type { OrderSummary } from "../../pages/package/interface";
import axios from "../../api/axios";
import config from "../../utils/config";
import { toast } from "sonner";

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

interface EditOrderSheetProps {
  order: OrderSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated: () => void;
}

interface CustomerInfo {
  name: string;
  email: string;
  phoneNumber: string;
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
  <div className="border-b border-gray-200 pb-4 last:border-0">
    <div className="flex items-center gap-2 mb-3">
      <div className={`p-1.5 rounded ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <h3 className="font-semibold text-sm text-gray-700">{title}</h3>
    </div>
    <div className="space-y-3 pl-9">{children}</div>
  </div>
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
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-gray-700 flex items-center gap-1">
      {Icon && <Icon className="h-3 w-3" />}
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
      opt.bn_name.includes(query)
  );

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-9 text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="relative">
          <Search className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
          <Input
            type="text"
            className="h-7 pl-7 text-xs border-0 border-b rounded-none focus:border-green-500 focus:ring-0"
            placeholder="Search..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
        {filtered.map((opt) => (
          <SelectItem key={opt.id} value={opt.id} className="text-xs cursor-pointer">
            {`${opt.name} (${opt.bn_name})`}
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
  const [payment, setPayment] = useState<PaymentInfo>(initial);

  const remaining = useMemo(
    () =>
      payment.totalPrice +
      payment.deliveryCharge -
      payment.discount -
      payment.paid,
    [payment]
  );

  const finalAmount = useMemo(
    () => payment.totalPrice + payment.deliveryCharge - payment.discount,
    [payment]
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

export function EditOrderSheet({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}: EditOrderSheetProps) {
  const [personalInfo, setPersonalInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    division: null,
    district: null,
    address: "",
  });
  const [updatedNotes, setUpdatedNotes] = useState("");
  const [divisionQuery, setDivisionQuery] = useState("");
  const [districtQuery, setDistrictQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { payment, remaining, finalAmount, updateField } =
    usePaymentCalculations({
      totalPrice: order?.totalPrice || 0,
      deliveryCharge: 0,
      discount: order?.totalPrice && order?.paid && order?.remaining
        ? order.totalPrice + 0 - order.paid - order.remaining
        : 0,
      paid: order?.paid || 0,
    });

  // Sync props to state
  useEffect(() => {
    if (order) {
      setPersonalInfo({
        name: order.customer.name || "",
        email: order.customer.email || "",
        phoneNumber: order.customer.phoneNumber || "",
      });
      setUpdatedNotes(order.notes || "");
      setShippingAddress({
        address: order.shipping?.address ?? "",
        district:
          getLocationByFormattedString(
            BDDistrictList,
            order.shipping?.district ?? ""
          ) ?? null,
        division:
          getLocationByFormattedString(BDDivisions, order.shipping?.division ?? "") ??
          null,
      });
    }
  }, [order]);

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

  const formatLocation = (loc: Location | null) =>
    loc ? `${loc.name}(${loc.bn_name})` : "";

  const handleSubmit = async () => {
    if (!order) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(config.order.editOrder(), {
        orderId: order.id,
        customer: personalInfo,
        shipping: {
          address: shippingAddress.address,
          district: formatLocation(shippingAddress.district),
          division: formatLocation(shippingAddress.division),
        },
        notes: updatedNotes,
        discount: payment.discount,
        remaining,
        paid: payment.paid,
        deliveryCharge: payment.deliveryCharge,
      });

      if (response.data?.success) {
        toast.success("Order updated successfully");
        onOpenChange(false);
        onOrderUpdated();
      } else {
        toast.error(response.data?.error || "Failed to update order");
      }
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast.error(error.response?.data?.error || "Failed to update order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDistricts = useMemo(
    () =>
      BDDistrictList.filter(
        (d) => d.division_id === shippingAddress.division?.id
      ),
    [shippingAddress.division?.id]
  );

  if (!order) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Order Information</SheetTitle>
          <p className="text-sm text-gray-500">
            Order #{order.orderNumber}
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Customer Information */}
          <SectionCard
            icon={User}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            title="Customer Information"
          >
            <FormField label="Customer Name" icon={User}>
              <Input
                name="name"
                value={personalInfo.name}
                onChange={handlePersonalChange}
                placeholder="Enter customer name"
                className="h-9 text-sm"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Email" icon={Mail}>
                <Input
                  name="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={handlePersonalChange}
                  placeholder="email@example.com"
                  className="h-9 text-sm"
                />
              </FormField>
              <FormField label="Phone" icon={Phone}>
                <Input
                  name="phoneNumber"
                  value={personalInfo.phoneNumber}
                  onChange={handlePersonalChange}
                  placeholder="017XXXXXXXXX"
                  className="h-9 text-sm"
                />
              </FormField>
            </div>

            <FormField label="Notes" icon={FileText}>
              <Textarea
                rows={2}
                value={updatedNotes}
                onChange={(e) => setUpdatedNotes(e.target.value)}
                placeholder="Special instructions..."
                className="text-sm resize-none"
              />
            </FormField>
          </SectionCard>

          {/* Shipping Address */}
          <SectionCard
            icon={MapPin}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            title="Shipping Address"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Division">
                <SearchableSelect
                  value={shippingAddress.division?.id ?? ""}
                  onValueChange={handleDivisionChange}
                  options={BDDivisions}
                  placeholder="Select division"
                  query={divisionQuery}
                  onQueryChange={setDivisionQuery}
                />
              </FormField>

              {shippingAddress.division && (
                <FormField label="District">
                  <SearchableSelect
                    value={shippingAddress.district?.id ?? ""}
                    onValueChange={handleDistrictChange}
                    options={filteredDistricts}
                    placeholder="Select district"
                    query={districtQuery}
                    onQueryChange={setDistrictQuery}
                  />
                </FormField>
              )}
            </div>

            <FormField label="Complete Address">
              <Textarea
                rows={2}
                value={shippingAddress.address}
                onChange={(e) =>
                  setShippingAddress((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="House/Flat no., Street, Area..."
                className="text-sm resize-none"
              />
            </FormField>
          </SectionCard>

          {/* Payment Details */}
          <SectionCard
            icon={CreditCard}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            title="Payment Details"
          >
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Total Price" icon={Calculator}>
                <Input
                  type="number"
                  value={payment.totalPrice}
                  disabled
                  className="h-9 text-sm bg-gray-50"
                />
              </FormField>
              <FormField label="Delivery" icon={Truck}>
                <Input
                  type="number"
                  min={0}
                  value={payment.deliveryCharge}
                  onChange={(e) =>
                    updateField("deliveryCharge", Number(e.target.value))
                  }
                  className="h-9 text-sm"
                />
              </FormField>
              <FormField label="Discount" icon={Tag}>
                <Input
                  type="number"
                  min={0}
                  value={payment.discount}
                  onChange={(e) =>
                    updateField("discount", Number(e.target.value))
                  }
                  className="h-9 text-sm"
                />
              </FormField>
              <FormField label="Paid" icon={Wallet}>
                <Input
                  type="number"
                  min={0}
                  value={payment.paid}
                  onChange={(e) => updateField("paid", Number(e.target.value))}
                  className="h-9 text-sm"
                />
              </FormField>
            </div>

            <Separator className="my-3" />

            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1 mb-2">
                <Calculator className="h-3 w-3" /> Summary
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Final:</span>
                  <span className="font-medium">
                    ৳{finalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Due:</span>
                  <Badge
                    variant={remaining > 0 ? "destructive" : "secondary"}
                    className="text-xs h-5 px-2"
                  >
                    ৳{remaining.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
