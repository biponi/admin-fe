import { useState } from 'react';
import { User, Phone } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { CustomerSearchDropdown } from './CustomerSearchDropdown';
import { AddressSelectionModal } from './AddressSelectionModal';
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
  const [addressModalOpen, setAddressModalOpen] = useState(false);
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
        // Multiple addresses - show modal
        setCustomerAddresses(addresses);
        setAddressModalOpen(true);
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
            setAddressModalOpen(true);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" />
          Customer Information
        </h3>
      </div>

      <div className="space-y-3.5">
        {/* Customer Search Dropdown */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-700">
            Search Existing Customer
          </Label>
          <CustomerSearchDropdown onSelect={handleCustomerSelect} />
        </div>

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
        <div className="space-y-2">
          <Label htmlFor="customer-name" className="text-xs font-semibold text-gray-700">
            Customer Name *
          </Label>
          <div className="relative group w-full">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
            <Input
              id="customer-name"
              type="text"
              placeholder="Enter customer name"
              value={customer.name || ''}
              onChange={(e) => onChange({ ...customer, name: e.target.value })}
              className="w-full pl-11 h-10 border-gray-200 focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400/20 transition-all"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="customer-phone" className="text-xs font-semibold text-gray-700">
            Phone Number *
          </Label>
          <div className="relative group w-full">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-green-600 transition-colors" />
            <Input
              id="customer-phone"
              type="tel"
              placeholder="Enter phone number"
              value={customer.phoneNumber || ''}
              onChange={(e) => onChange({ ...customer, phoneNumber: e.target.value })}
              className="w-full pl-11 h-10 border-gray-200 focus:border-green-400 focus-visible:ring-2 focus-visible:ring-green-400/20 transition-all"
            />
          </div>
        </div>

        {/* Email (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="customer-email" className="text-xs font-semibold text-gray-700">
            Email (Optional)
          </Label>
          <Input
            id="customer-email"
            type="email"
            placeholder="Enter email address"
            value={customer.email || ''}
            onChange={(e) => onChange({ ...customer, email: e.target.value })}
            className="w-full h-10 border-gray-200 focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400/20 transition-all"
          />
        </div>
      </div>

      {/* Address Selection Modal */}
      {selectedCustomer && (
        <AddressSelectionModal
          open={addressModalOpen}
          onOpenChange={setAddressModalOpen}
          customer={selectedCustomer}
          addresses={customerAddresses}
          onSelect={handleAddressSelect}
        />
      )}
    </div>
  );
}
