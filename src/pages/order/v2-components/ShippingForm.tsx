import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { MapPin, Home, Truck, CheckCircle2 } from "lucide-react";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../components/ui/command";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../components/ui/card";
import { BDDivisions, BDDistrictList } from "../../../utils/contents";
import { calculateDeliveryCharge } from "../../../utils/deliveryCharge";
import type { IShipping } from "../../order/interface.d";

interface ShippingFormProps {
  shipping: Partial<IShipping>;
  onChange: (shipping: Partial<IShipping>) => void;
  onDeliveryChargeChange?: (charge: number) => void;
}

export function ShippingForm({
  shipping,
  onChange,
  onDeliveryChargeChange,
}: ShippingFormProps) {
  const [districtSearch, setDistrictSearch] = useState("");
  const [divisionOpen, setDivisionOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);

  // Reset district search when popover opens
  useEffect(() => {
    if (districtOpen) {
      setDistrictSearch("");
    }
  }, [districtOpen]);

  // Store callbacks in refs so effects/handlers never need them as deps.
  // This prevents "new function reference on every render" from causing
  // infinite loops when these are in dependency arrays or called in effects.
  const onChangeRef = useRef(onChange);
  const onDeliveryChargeChangeRef = useRef(onDeliveryChargeChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  useEffect(() => {
    onDeliveryChargeChangeRef.current = onDeliveryChargeChange;
  });

  const selectedDivision = useMemo(
    () => BDDivisions.find((d) => d.name === shipping.division),
    [shipping.division],
  );

  // Track last calculated charge to prevent duplicate calls
  const lastChargeRef = useRef<number | null>(null);

  // Auto-calculate delivery charge when both fields are set.
  // Uses refs for callbacks so this effect ONLY re-runs when the actual
  // location values change — not when the callback reference changes.
  useEffect(() => {
    if (
      shipping.division &&
      shipping.district &&
      onDeliveryChargeChangeRef.current
    ) {
      const chargeInfo = calculateDeliveryCharge(
        shipping.district,
        shipping.division,
      );
      const newCharge = chargeInfo.charge;

      // Only call callback if charge actually changed (idempotency guard)
      if (lastChargeRef.current !== newCharge) {
        lastChargeRef.current = newCharge;
        onDeliveryChargeChangeRef.current(newCharge);
      }
    }
  }, [shipping.division, shipping.district]); // ← safe: only location values

  // FIX: Send ONLY the changed field — never spread `shipping` here.
  // The store's setShippingInfo already merges: { ...state.shippingInfo, ...incoming }
  // Spreading shipping inside the handler creates a new object every render,
  // which makes the store think something changed and triggers another render → loop.
  const handleDivisionChange = useCallback((value: string) => {
    onChangeRef.current({ division: value, district: undefined });
    setDistrictSearch("");
  }, []);

  const handleDistrictChange = useCallback((value: string) => {
    onChangeRef.current({ district: value });
  }, []);

  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChangeRef.current({ address: e.target.value });
    },
    [],
  );

  const filteredDistricts = useMemo(() => {
    const base = BDDistrictList.filter(
      (d) => d.division_id === selectedDivision?.id,
    );
    if (!districtSearch) return base;
    const q = districtSearch.toLowerCase();
    return base.filter((d) => d.name.toLowerCase().includes(q));
  }, [selectedDivision, districtSearch]);

  return (
    <Card className='border shadow-sm'>
      <CardHeader className='bg-gradient-to-r from-green-50 to-blue-50 border-b p-3 rounded-xl mx-2 mt-2 shadow'>
        <CardTitle className='flex items-center gap-2 text-base text-gray-800'>
          <Truck className='w-5 h-5 text-green-600' />
          Shipping Information
        </CardTitle>
        <CardDescription className='text-xs text-gray-600'>
          Select delivery location and address details
        </CardDescription>
      </CardHeader>

      <CardContent className='p-3 space-y-4'>
        <div className='space-y-3.5'>
          {/* Division / District */}
          <div className='space-y-1.5'>
            <Label
              htmlFor='division'
              className='flex items-center gap-1.5 font-medium text-sm'>
              <MapPin className='w-3.5 h-3.5 text-green-600' />
              District *
            </Label>
            <Popover open={divisionOpen} onOpenChange={setDivisionOpen}>
              <PopoverTrigger asChild>
                <Button
                  id='division'
                  variant='outline'
                  className='w-full justify-start h-9 border-gray-200 focus:border-green-500 transition-all font-normal'>
                  {shipping.division || "Select division"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[300px] p-0' align='start'>
                <Command>
                  <CommandInput placeholder='Search divisions...' />
                  <CommandList>
                    <CommandEmpty>No divisions found.</CommandEmpty>
                    <CommandGroup>
                      {BDDivisions.map((division) => (
                        <CommandItem
                          key={division.id}
                          value={division.name}
                          onSelect={(value) => {
                            handleDivisionChange(value);
                            setDivisionOpen(false);
                          }}>
                          {division.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Area */}
          <div className='space-y-1.5'>
            <Label
              htmlFor='district'
              className='flex items-center gap-1.5 font-medium text-sm'>
              <Home className='w-3.5 h-3.5 text-green-600' />
              Area *
            </Label>
            <Popover open={districtOpen} onOpenChange={setDistrictOpen}>
              <PopoverTrigger asChild>
                <Button
                  id='district'
                  variant='outline'
                  className='w-full justify-start h-9 border-gray-200 focus:border-green-500 transition-all font-normal'>
                  {shipping.district ||
                    (selectedDivision
                      ? "Select district"
                      : "Select division first")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[300px] p-0' align='start'>
                <Command>
                  <CommandInput placeholder='Search districts...' />
                  <CommandList>
                    <CommandEmpty>No districts found.</CommandEmpty>
                    <CommandGroup>
                      {filteredDistricts.map((district) => (
                        <CommandItem
                          key={district.id}
                          value={district.name}
                          className='font-semibold text-black'
                          onSelect={(value) => {
                            handleDistrictChange(value);
                            setDistrictOpen(false);
                          }}>
                          {district.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Location summary */}
          {shipping.division && shipping.district && (
            <div className='mt-4 p-3 bg-green-50 rounded-lg border border-green-200'>
              <h4 className='font-medium text-green-800 text-sm flex items-center gap-2'>
                <CheckCircle2 className='w-4 h-4' />
                Selected Delivery Location
              </h4>
              <div className='text-sm text-green-700 mt-2 space-y-0.5'>
                <p>
                  <strong>District:</strong> {shipping.division}
                </p>
                <p>
                  <strong>Area:</strong> {shipping.district}
                </p>
              </div>
            </div>
          )}

          {/* Address */}
          <div className='space-y-1.5'>
            <Label
              htmlFor='address'
              className='flex items-center gap-1.5 font-medium text-sm'>
              <MapPin className='w-3.5 h-3.5 text-green-600' />
              Full Address *
            </Label>
            <Textarea
              id='address'
              placeholder='Enter detailed address including house number, road, area, landmarks, etc.'
              value={shipping.address ?? ""}
              onChange={handleAddressChange}
              className='min-h-24 resize-none text-sm border-gray-200 focus:border-green-500 transition-all'
              rows={3}
              maxLength={500}
            />
            <div className='flex items-center justify-between'>
              <p className='text-xs text-gray-500'>
                Be specific to ensure successful delivery
              </p>
              <span className='text-xs text-gray-400'>
                {(shipping.address ?? "").length}/500
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
