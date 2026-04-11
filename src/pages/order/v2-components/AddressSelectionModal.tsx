import { useState, useEffect } from 'react';
import { MapPin, Home, Calendar, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Label } from '../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { formatDate, formatCurrency } from '../../../api/customerSearch';
import type { AddressDetails, CustomerInfo } from '../../../api/customerSearch';

interface AddressSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerInfo;
  addresses: AddressDetails[];
  onSelect: (address: AddressDetails) => void;
}

export function AddressSelectionModal({
  open,
  onOpenChange,
  customer,
  addresses,
  onSelect,
}: AddressSelectionModalProps) {
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<string>('0');

  // Pre-select the most recent address (first one, as they're sorted by lastOrderDate)
  useEffect(() => {
    if (addresses.length > 0) {
      setSelectedAddressIndex('0');
    }
  }, [addresses]);

  const handleConfirm = () => {
    const index = parseInt(selectedAddressIndex);
    if (index >= 0 && index < addresses.length) {
      onSelect(addresses[index]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            Select Delivery Address
          </DialogTitle>
          <DialogDescription className="text-base">
            {customer.name} has {addresses.length} address{addresses.length > 1 ? 'es' : ''} on file.
            Please select the delivery address for this order.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={selectedAddressIndex} onValueChange={setSelectedAddressIndex}>
            <div className="space-y-3">
              {addresses.map((address, index) => (
                <div
                  key={`${address.division}-${address.district}-${index}`}
                  className="relative"
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`address-${index}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`address-${index}`}
                    className={`
                      flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4
                      transition-all hover:shadow-md
                      ${
                        selectedAddressIndex === index.toString()
                          ? 'border-purple-500 bg-purple-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-purple-300'
                      }
                    `}
                  >
                    <div className="flex-1 space-y-3">
                      {/* Address Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Home className="h-4 w-4 text-purple-600" />
                            <p className="font-semibold text-sm text-gray-900">
                              {address.address}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground ml-6">
                            {address.district}, {address.division}
                          </p>
                        </div>

                        {index === 0 && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs shrink-0">
                            Most Recent
                          </Badge>
                        )}
                      </div>

                      {/* Address Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground ml-6">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-purple-600" />
                          {address.orderCount} order{address.orderCount > 1 ? 's' : ''}
                        </span>

                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-green-600" />
                          {formatCurrency(address.totalSpent)}
                        </span>

                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-blue-600" />
                          {formatDate(address.lastOrderDate)}
                        </span>
                      </div>
                    </div>

                    {/* Radio Indicator */}
                    <div className="mt-1">
                      <div
                        className={`
                        h-5 w-5 rounded-full border-2 flex items-center justify-center
                        ${
                          selectedAddressIndex === index.toString()
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-300 bg-white peer-checked:border-purple-600'
                        }
                      `}
                      >
                        {selectedAddressIndex === index.toString() && (
                          <div className="h-2.5 w-2.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
