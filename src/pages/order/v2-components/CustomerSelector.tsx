import { useState, useCallback, useRef, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { CustomerSearchCollapsible } from "./CustomerSearchCollapsible";
import { AddressSelectionSheet } from "./AddressSelectionSheet";
import { customerSearchAPI } from "../../../api/customerSearch";
import type { ICustomer, IShipping } from "../../order/interface.d";
import type {
  CustomerInfo,
  AddressDetails,
  CustomerListItem,
} from "../../../api/customerSearch";
import { toast } from "react-hot-toast";
import { isValidBDPhone, normalizeBDPhone } from "@/utils/helperFunction";
import { cn } from "@/lib/utils";

interface CustomerSelectorProps {
  customer: Partial<ICustomer>;
  onChange: (customer: Partial<ICustomer>) => void;
  onShippingChange?: (shipping: Partial<IShipping>) => void;
  validationErrors?: Record<string, string[]>;
}

export function CustomerSelector({
  customer,
  onChange,
  onShippingChange,
  validationErrors,
}: CustomerSelectorProps) {
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInfo | null>(
    null,
  );
  const [customerAddresses, setCustomerAddresses] = useState<AddressDetails[]>(
    [],
  );

  // Stable refs — never stale, never cause re-renders
  const onChangeRef = useRef(onChange);
  const onShippingChangeRef = useRef(onShippingChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  useEffect(() => {
    onShippingChangeRef.current = onShippingChange;
  });

  // FIX: send only the changed field — store merges internally.
  // Never spread `customer` here; that creates a new object every render
  // which makes every downstream component think props changed.
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeRef.current({ name: e.target.value });
    },
    [],
  );

  // Handle typing - only allow digits, auto-normalize on the fly
  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Strip non-digits while typing
      const digits = raw.replace(/\D/g, "");
      onChangeRef.current({ phoneNumber: digits });
    },
    [],
  );

  // Handle paste event - normalize and clean
  const handlePhonePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      const pastedData = e.clipboardData.getData("text");
      const normalized = normalizeBDPhone(pastedData);

      if (normalized) {
        onChangeRef.current({ phoneNumber: normalized });
      }
    },
    [],
  );

  // Handle blur - full normalization pass
  const handlePhoneBlur = useCallback(() => {
    if (customer.phoneNumber) {
      const normalized = normalizeBDPhone(customer.phoneNumber);
      onChangeRef.current({ phoneNumber: normalized });
    }
  }, [customer.phoneNumber]);

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeRef.current({ email: e.target.value });
    },
    [],
  );

  const applyAddress = useCallback((address: AddressDetails) => {
    onShippingChangeRef.current?.({
      division: address.division.replace("(", "--").split("--")[0],
      district: address.district.replace("(", "--").split("--")[0],
      address: address.address,
    });
  }, []);

  const handleCustomerSelect = useCallback(
    async (customerItem: CustomerListItem) => {
      const customerInfo = customerItem.customer;
      setSelectedCustomer(customerInfo);

      onChangeRef.current({
        name: customerInfo.name,
        phoneNumber: customerInfo.mobile,
        email: customerInfo.email || undefined,
      });

      const addresses = customerItem.addresses || [];

      if (addresses.length === 1) {
        applyAddress(addresses[0]);
        toast.success(`Customer "${customerInfo.name}" selected with address`);
      } else if (addresses.length > 1) {
        setCustomerAddresses(addresses);
        setAddressSheetOpen(true);
      } else {
        try {
          const response = await customerSearchAPI.getCustomerAddresses(
            customerInfo.mobile,
          );
          if (response.success && response.data.addresses.length > 0) {
            const fetched = response.data.addresses;
            if (fetched.length === 1) {
              applyAddress(fetched[0]);
              toast.success(
                `Customer "${customerInfo.name}" selected with address`,
              );
            } else {
              setCustomerAddresses(fetched);
              setAddressSheetOpen(true);
            }
          } else {
            toast.success(`Customer "${customerInfo.name}" selected`);
          }
        } catch (error: any) {
          console.error("Error fetching addresses:", error);
          toast.error(
            error.response?.data?.message ||
              "Failed to fetch customer addresses",
          );
        }
      }
    },
    [applyAddress],
  );

  const handleAddressSelect = useCallback(
    (address: AddressDetails) => {
      applyAddress(address);
      toast.success(`Address selected for "${selectedCustomer?.name}"`);
    },
    [applyAddress, selectedCustomer?.name],
  );

  const renderPhoneNumberField = () => {
    const phoneIsValid = customer.phoneNumber
      ? isValidBDPhone(customer.phoneNumber)
      : null; // null = untouched
    return (
      <div className='space-y-1.5'>
        <Label
          htmlFor='customer-phone'
          className='flex items-center gap-1.5 font-medium text-xs text-foreground'>
          <Phone className='w-3.5 h-3.5 text-muted-foreground/70' />
          Phone Number *
        </Label>
        <div className='relative w-full'>
          <Phone className='absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none' />
          <Input
            id='customer-phone'
            type='text'
            inputMode='numeric'
            pattern='[0-9]*'
            placeholder='01XXXXXXXXX'
            value={customer.phoneNumber || ""}
            onChange={handlePhoneChange}
            onPaste={handlePhonePaste}
            onBlur={handlePhoneBlur}
            maxLength={11}
            className={cn(
              "pl-9 pr-9 h-9 text-sm transition-all",
              phoneIsValid === true &&
                "border-emerald-500 focus:border-emerald-500",
              phoneIsValid === false && "border-red-400 focus:border-red-400",
              phoneIsValid === null && "border-border",
            )}
          />
          {/* Right icon: valid / invalid / empty */}
          {phoneIsValid === true && (
            <CheckCircle2 className='absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none' />
          )}
          {phoneIsValid === false && (
            <XCircle className='absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400 pointer-events-none' />
          )}
        </div>
        {phoneIsValid === false && (
          <p className='text-xs text-red-500 flex items-center gap-1'>
            <AlertCircle className='w-3 h-3' />
            Enter a valid BD number (e.g. 01712345678)
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className='rounded-xl border-border shadow-none overflow-hidden'>
      <CardHeader className='flex flex-row items-center gap-2 border-b border-border/60 bg-muted/50 px-4 py-2.5 rounded-none m-0'>
        <User className='h-3.5 w-3.5 text-muted-foreground/70' />
        <CardTitle className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70'>
          Customer Information
        </CardTitle>
      </CardHeader>

      <CardContent className='p-4 space-y-4'>
        <div className='space-y-3.5'>
          <CustomerSearchCollapsible onSelect={handleCustomerSelect} />

          <div className='relative py-1'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border/60' />
            </div>
            <div className='relative flex justify-center'>
              <span className='bg-background px-2 text-[11px] text-muted-foreground/70'>
                Or enter manually
              </span>
            </div>
          </div>

          {/* Name */}
          <div className='space-y-1.5'>
            <Label
              htmlFor='customer-name'
              className='flex items-center gap-1.5 font-medium text-xs text-foreground'>
              <UserCheck className='w-3.5 h-3.5 text-muted-foreground/70' />
              Customer Name *
            </Label>
            <div className='relative w-full'>
              <User className='absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none' />
              <Input
                id='customer-name'
                type='text'
                placeholder='Enter customer name'
                value={customer.name || ""}
                onChange={handleNameChange}
                className='pl-9 h-9 text-sm border-border focus-visible:ring-ring transition-all'
              />
              {customer.name && (
                <CheckCircle2 className='absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none' />
              )}
            </div>
            {/* Name error */}
            {validationErrors?.customerName && (
              <Alert className='mt-2 border-red-200 bg-red-50 py-2'>
                <AlertCircle className='w-4 h-4 text-red-500' />
                <AlertDescription className='text-red-700 text-sm'>
                  {validationErrors.customerName[0]}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Phone */}
          {renderPhoneNumberField()}

          {/* Email */}
          <div className='space-y-1.5'>
            <div className='flex items-center gap-2'>
              <Label
                htmlFor='customer-email'
                className='flex items-center gap-1.5 font-medium text-xs text-foreground'>
                <Mail className='w-3.5 h-3.5 text-muted-foreground/70' />
                Email
              </Label>
              <Badge
                variant='outline'
                className='text-[10px] px-1.5 py-0 border-border text-muted-foreground/70'>
                Optional
              </Badge>
            </div>
            <div className='relative w-full'>
              <Mail className='absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none' />
              <Input
                id='customer-email'
                type='email'
                placeholder='Enter email address'
                value={customer.email || ""}
                onChange={handleEmailChange}
                className='pl-9 h-9 text-sm border-border focus-visible:ring-ring transition-all'
              />
              {customer.email && (
                <CheckCircle2 className='absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none' />
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {selectedCustomer && (
        <AddressSelectionSheet
          open={addressSheetOpen}
          onOpenChange={setAddressSheetOpen}
          customer={selectedCustomer}
          addresses={customerAddresses}
          onSelect={handleAddressSelect}
        />
      )}
    </Card>
  );
}
