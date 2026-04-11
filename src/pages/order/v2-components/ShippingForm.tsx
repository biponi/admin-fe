import { MapPin, Home } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { BDDivisions, BDDistrictList } from '../../../utils/contents';
import type { IShipping } from '../../order/interface.d';

interface ShippingFormProps {
  shipping: Partial<IShipping>;
  onChange: (shipping: Partial<IShipping>) => void;
}

export function ShippingForm({ shipping, onChange }: ShippingFormProps) {
  const selectedDivision = BDDivisions.find((d) => d.name === shipping.division);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base flex items-center gap-2">
        <MapPin className="h-4 w-4 text-purple-600" />
        Shipping Information
      </h3>

      <div className="space-y-3.5">
        {/* Division */}
        <div className="space-y-2">
          <Label htmlFor="division" className="text-xs font-semibold text-gray-700">
            Division *
          </Label>
          <Select
            value={shipping.division}
            onValueChange={(value) =>
              onChange({ ...shipping, division: value, district: undefined })
            }
          >
            <SelectTrigger id="division" className="w-full h-10 border-gray-200 focus:border-purple-400 focus-visible:ring-2 focus-visible:ring-purple-400/20 transition-all">
              <SelectValue placeholder="Select division" />
            </SelectTrigger>
            <SelectContent>
              {BDDivisions.map((division) => (
                <SelectItem key={division.id} value={division.name}>
                  {division.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District */}
        <div className="space-y-2">
          <Label htmlFor="district" className="text-xs font-semibold text-gray-700">
            District *
          </Label>
          <Select
            value={shipping.district}
            onValueChange={(value) => onChange({ ...shipping, district: value })}
            disabled={!selectedDivision}
          >
            <SelectTrigger id="district" className="w-full h-10 border-gray-200 focus:border-purple-400 focus-visible:ring-2 focus-visible:ring-purple-400/20 transition-all">
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {BDDistrictList
                .filter((district) => district.division_id === selectedDivision?.id)
                .map((district) => (
                  <SelectItem key={district.id} value={district.name}>
                    {district.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-xs font-semibold text-gray-700 flex items-center gap-2">
            <Home className="h-3.5 w-3.5 text-purple-600" />
            Address *
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="Enter full address"
            value={shipping.address || ''}
            onChange={(e) => onChange({ ...shipping, address: e.target.value })}
            className="w-full h-10 border-gray-200 focus:border-purple-400 focus-visible:ring-2 focus-visible:ring-purple-400/20 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
