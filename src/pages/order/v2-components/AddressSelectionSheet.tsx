import { useState, useEffect } from 'react';
import { MapPin, Home, Calendar, DollarSign } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '../../../components/ui/sheet';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Label } from '../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { formatDate, formatCurrency } from '../../../api/customerSearch';
import type { AddressDetails, CustomerInfo } from '../../../api/customerSearch';

interface AddressSelectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerInfo;
  addresses: AddressDetails[];
  onSelect: (address: AddressDetails) => void;
}

export function AddressSelectionSheet({
  open,
  onOpenChange,
  customer,
  addresses,
  onSelect,
}: AddressSelectionSheetProps) {
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            Select Delivery Address
          </SheetTitle>
          <SheetDescription className="text-base">
            {customer.name} has {addresses.length} address{addresses.length > 1 ? 'es' : ''} on file.
            Please select the delivery address for this order.
          </SheetDescription>
        </SheetHeader>

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
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border bg-background hover:border-border'
                      }
                    `}
                  >
                    <div className="flex-1 space-y-3">
                      {/* Address Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Home className="h-4 w-4 text-muted-foreground/70" />
                            <p className="font-semibold text-sm text-foreground">
                              {address.address}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground ml-6">
                            {address.district}, {address.division}
                          </p>
                        </div>

                        {index === 0 && (
                          <Badge className="bg-muted text-muted-foreground text-xs shrink-0 hover:bg-muted">
                            Most Recent
                          </Badge>
                        )}
                      </div>

                      {/* Address Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground ml-6">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground/70" />
                          {address.orderCount} order{address.orderCount > 1 ? 's' : ''}
                        </span>

                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-emerald-600" />
                          {formatCurrency(address.totalSpent)}
                        </span>

                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground/70" />
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
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/50 bg-background peer-checked:border-primary'
                        }
                      `}
                      >
                        {selectedAddressIndex === index.toString() && (
                          <div className="h-2.5 w-2.5 rounded-full bg-background" />
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <SheetFooter className="gap-2">
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
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Confirm Selection
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
