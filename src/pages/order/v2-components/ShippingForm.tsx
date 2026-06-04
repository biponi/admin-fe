import { useState, useMemo, useEffect } from "react";
import { MapPin, Home, Truck, Search, CheckCircle2 } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
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
  const [divisionSearch, setDivisionSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");

  const selectedDivision = BDDivisions.find(
    (d) => d.name === shipping.division,
  );

  // Auto-calculate delivery charge when division and district are set
  useEffect(() => {
    if (shipping.division && shipping.district && onDeliveryChargeChange) {
      const chargeInfo = calculateDeliveryCharge(
        shipping.district,
        shipping.division
      );
      onDeliveryChargeChange(chargeInfo.charge);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipping.division, shipping.district]);

  // Filter divisions based on search
  const filteredDivisions = useMemo(() => {
    if (!divisionSearch) return BDDivisions;
    return BDDivisions.filter((division) =>
      division.name.toLowerCase().includes(divisionSearch.toLowerCase()),
    );
  }, [divisionSearch]);

  // Filter districts based on search and selected division
  const filteredDistricts = useMemo(() => {
    let districts = BDDistrictList.filter(
      (district) => district.division_id === selectedDivision?.id,
    );

    if (districtSearch) {
      districts = districts.filter((district) =>
        district.name.toLowerCase().includes(districtSearch.toLowerCase()),
      );
    }

    return districts;
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
          {/* District */}
          <div className='space-y-1.5'>
            <Label
              htmlFor='division'
              className='flex items-center gap-1.5 font-medium text-sm'>
              <MapPin className='w-3.5 h-3.5 text-green-600' />
              District *
            </Label>
            <Select
              value={shipping.division}
              onValueChange={(value) => {
                onChange({ ...shipping, division: value, district: undefined });
                setDistrictSearch("");
              }}>
              <SelectTrigger
                id='division'
                className='h-9 border-gray-200 focus:border-green-500 transition-all'>
                <SelectValue placeholder='Select division' />
              </SelectTrigger>
              <SelectContent className='max-h-64'>
                {/* Search Input in Dropdown */}
                <div className='px-2 pt-2 pb-1'>
                  <div className='relative'>
                    <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' />
                    <Input
                      placeholder='Search divisions...'
                      value={divisionSearch}
                      onChange={(e) => setDivisionSearch(e.target.value)}
                      className='pl-9 h-9 text-sm'
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className='max-h-48 overflow-y-auto'>
                  {filteredDivisions.map((division) => (
                    <SelectItem
                      key={division.id}
                      value={division.name}
                      className='text-sm'>
                      {division.name}
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Area */}
          <div className='space-y-1.5'>
            <Label
              htmlFor='district'
              className='flex items-center gap-1.5 font-medium text-sm'>
              <Home className='w-3.5 h-3.5 text-green-600' />
              Area *
            </Label>
            <Select
              value={shipping.district}
              onValueChange={(value) => {
                const newShipping = { ...shipping, district: value };
                onChange(newShipping);

                // Auto-calculate delivery charge when district is selected
                if (shipping.division && value && onDeliveryChargeChange) {
                  const chargeInfo = calculateDeliveryCharge(
                    value,
                    shipping.division,
                  );
                  onDeliveryChargeChange(chargeInfo.charge);
                }
              }}
              disabled={!selectedDivision}>
              <SelectTrigger
                id='district'
                className='h-9 border-gray-200 focus:border-green-500 transition-all'>
                <SelectValue
                  placeholder={
                    selectedDivision
                      ? "Select district"
                      : "Select division first"
                  }
                />
              </SelectTrigger>
              <SelectContent className='max-h-64'>
                {/* Search Input in Dropdown */}
                <div className='px-2 pt-2 pb-1'>
                  <div className='relative'>
                    <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' />
                    <Input
                      placeholder='Search districts...'
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      className='pl-9 h-9 text-sm'
                      onClick={(e) => e.stopPropagation()}
                      disabled={!selectedDivision}
                    />
                  </div>
                </div>
                <div className='max-h-48 overflow-y-auto'>
                  {filteredDistricts.map((district) => (
                    <SelectItem
                      key={district.id}
                      value={district.name}
                      className='text-sm hover:bg-green-50'>
                      {district.name}
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Location Summary */}
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
              value={shipping.address || ""}
              onChange={(e) =>
                onChange({ ...shipping, address: e.target.value })
              }
              className='min-h-24 resize-none text-sm border-gray-200 focus:border-green-500 transition-all'
              rows={3}
              maxLength={500}
            />
            <div className='flex items-center justify-between'>
              <p className='text-xs text-gray-500'>
                Be specific to ensure successful delivery
              </p>
              <span className='text-xs text-gray-400'>
                {(shipping.address || "").length}/500
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
