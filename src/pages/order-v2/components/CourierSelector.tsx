import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../../../components/ui/drawer";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import {
  Truck,
  Package,
  AlertCircle,
  Panda,
  TreePalm,
  Hop,
} from "lucide-react";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { CourierProvider } from "../types";
import {
  getProviderConfig,
  COURIER_LIST,
} from "../../../config/courierProviders";

interface CourierSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (courierProvider: CourierProvider) => void;
  isLoading?: boolean;
  isMobile?: boolean;
}

export const CourierSelector: React.FC<CourierSelectorProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  isMobile = false,
}) => {
  const [selectedCourier, setSelectedCourier] = useState<CourierProvider>(
    CourierProvider.MANUAL,
  );

  const handleConfirm = () => {
    onConfirm(selectedCourier);
  };

  const fallbackIcons: Record<string, any> = {
    manual: TreePalm,
    self: Panda,
  };

  const courierOptions = COURIER_LIST.map((cfg) => ({
    value: cfg.slug as CourierProvider,
    label: cfg.label,
    description: cfg.description || "",
    icon: fallbackIcons[cfg.slug] || Package,
    color: cfg.iconColor,
    bgColor: cfg.iconBgColor,
    image: cfg.image,
  }));

  const content = (
    <>
      <div className='space-y-4'>
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Select a courier provider to create the shipping order. This action
            will mark the order as shipped.
          </AlertDescription>
        </Alert>

        <RadioGroup
          value={selectedCourier}
          onValueChange={(value) =>
            setSelectedCourier(value as CourierProvider)
          }
          className='space-y-3'>
          {courierOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div key={option.value} className='relative'>
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className='peer sr-only'
                />
                <Label
                  htmlFor={option.value}
                  className={`flex items-center gap-4 rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all`}>
                  <div
                    className={`${!!option?.image ? "" : "p-3"} rounded-full ${option.bgColor}`}>
                    {!!option?.image ? (
                      <img
                        src={option.image}
                        alt={option.label}
                        className='w-8 h-8 rounded-full'
                      />
                    ) : (
                      <Icon className={`w-6 h-6 ${option.color}`} />
                    )}
                  </div>
                  <div className='flex-1'>
                    <div className='font-semibold text-gray-900'>
                      {option.label}
                    </div>
                    <div className='text-sm text-gray-600'>
                      {option.description}
                    </div>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Select Courier Provider</DrawerTitle>
            <DrawerDescription>
              Choose a courier service to ship this order
            </DrawerDescription>
          </DrawerHeader>
          <div className='px-4 py-6'>{content}</div>
          <DrawerFooter>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className='w-full'>
              {isLoading ? "Processing..." : "Confirm & Ship Order"}
            </Button>
            <DrawerClose asChild>
              <Button variant='outline' className='w-full'>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Select Courier Provider</DialogTitle>
          <DialogDescription>
            Choose a courier service to ship this order
          </DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Processing..." : "Confirm & Ship Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
