import { useState } from 'react';
import { User, Phone, Mail, UserCheck, CheckCircle2 } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { CustomerSearchCollapsible } from './CustomerSearchCollapsible';
import { AddressSelectionSheet } from './AddressSelectionSheet';
import { customerSearchAPI } from '../../../api/customerSearch';
import type { ICustomer, IShipping } from '../../order/interface.d';
import type { CustomerInfo, AddressDetails, CustomerListItem } from '../../../api/customerSearch';
import { toast } from 'react-hot-toast';

interface CustomerSelectorProps {
  customer: Partial<ICustomer>;
  onChange: (customer: Partial<ICustomer>) => void;
  onShippingChange?: (shipping: Partial<IShipping>) => void;
}

export function CustomerSelector({
  customer,
  onChange,
  onShippingChange,
}: CustomerSelectorProps) {
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInfo | null>(null);
  const [customerAddresses, setCustomerAddresses] = useState<AddressDetails[]>([]);

  const handleCustomerSelect = async (customerItem: CustomerListItem) => {
    const customerInfo = customerItem.customer;
    setSelectedCustomer(customerInfo);

    // Update customer information
    const customerData: Partial<ICustomer> = {
      name: customerInfo.name,
      phoneNumber: customerInfo.mobile,
      email: customerInfo.email || undefined,
    };
    onChange(customerData);

    // Check if addresses are already loaded
    const addresses = customerItem.addresses || [];

    if (addresses.length > 0) {
      // If only one address, auto-fill it
      if (addresses.length === 1) {
        const address = addresses[0];
        if (onShippingChange) {
          onShippingChange({
            division: address.division,
            district: address.district,
            address: address.address,
          });
        }
        toast.success(`Customer "${customerInfo.name}" selected with address`);
      } else {
        // Multiple addresses - show sheet
        setCustomerAddresses(addresses);
        setAddressSheetOpen(true);
      }
    } else {
      // No addresses in the dropdown data, fetch them
      try {
        const response = await customerSearchAPI.getCustomerAddresses(customerInfo.mobile);

        if (response.success && response.data.addresses.length > 0) {
          const fetchedAddresses = response.data.addresses;

          if (fetchedAddresses.length === 1) {
            const address = fetchedAddresses[0];
            if (onShippingChange) {
              onShippingChange({
                division: address.division,
                district: address.district,
                address: address.address,
              });
            }
            toast.success(`Customer "${customerInfo.name}" selected with address`);
          } else {
            setCustomerAddresses(fetchedAddresses);
            setAddressSheetOpen(true);
          }
        } else {
          toast.success(`Customer "${customerInfo.name}" selected`);
        }
      } catch (error: any) {
        console.error('Error fetching addresses:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch customer addresses');
      }
    }
  };

  const handleAddressSelect = (address: AddressDetails) => {
    if (onShippingChange) {
      onShippingChange({
        division: address.division,
        district: address.district,
        address: address.address,
      });
    }
    toast.success(`Address selected for "${selectedCustomer?.name}"`);
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b p-3 rounded-xl mx-2 mt-2 shadow">
        <CardTitle className="flex items-center gap-2 text-base text-gray-800">
          <User className="w-5 h-5 text-blue-600" />
          Customer Information
        </CardTitle>
        <CardDescription className="text-xs text-gray-600">
          Enter customer details for order processing
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 space-y-4">
        <div className="space-y-3.5">
          {/* Customer Search Collapsible */}
          <CustomerSearchCollapsible onSelect={handleCustomerSelect} />

          {/* Manual Entry Separator */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs text-gray-500">Or enter manually</span>
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-1.5">
            <Label htmlFor="customer-name" className="flex items-center gap-1.5 font-medium text-sm">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              Customer Name *
            </Label>
            <div className="relative w-full">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                id="customer-name"
                type="text"
                placeholder="Enter customer name"
                value={customer.name || ''}
                onChange={(e) => onChange({ ...customer, name: e.target.value })}
                className="pl-9 h-9 text-sm border-gray-200 focus:border-blue-500 transition-all"
              />
              {customer.name && (
                <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 pointer-events-none" />
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label htmlFor="customer-phone" className="flex items-center gap-1.5 font-medium text-sm">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              Phone Number *
            </Label>
            <div className="relative w-full">
              <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                id="customer-phone"
                type="tel"
                placeholder="Enter phone number"
                value={customer.phoneNumber || ''}
                onChange={(e) => onChange({ ...customer, phoneNumber: e.target.value })}
                className="pl-9 h-9 text-sm border-gray-200 focus:border-blue-500 transition-all"
              />
              {customer.phoneNumber && (
                <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 pointer-events-none" />
              )}
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              BD mobile format (11 digits, starts with 01)
            </p>
          </div>

          {/* Email (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="customer-email" className="flex items-center gap-1.5 font-medium text-sm">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                Email
              </Label>
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                Optional
              </Badge>
            </div>
            <div className="relative w-full">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                id="customer-email"
                type="email"
                placeholder="Enter email address"
                value={customer.email || ''}
                onChange={(e) => onChange({ ...customer, email: e.target.value })}
                className="pl-9 h-9 text-sm border-gray-200 focus:border-blue-500 transition-all"
              />
              {customer.email && (
                <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 pointer-events-none" />
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Address Selection Sheet */}
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
