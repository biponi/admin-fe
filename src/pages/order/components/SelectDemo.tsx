"use client";
import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { Variation } from "../data/types";
import { toast } from "react-hot-toast";
import { Palette, Shirt, AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  type: "size" | "color";
  selectedProduct: any;
  list: string[];
  selected: string;
  selectedVariant: Variation | null;
  onVariantChange: (variant: Variation) => void;
}

const SelectDemo: React.FC<Props> = ({
  type,
  selectedProduct,
  list,
  selected,
  selectedVariant,
  onVariantChange,
}) => {
  const [variations, setVariations] = React.useState<any[]>([]);
  React.useEffect(() => {
    if (!!selectedProduct && !!selectedProduct?.variation) {
      setVariations(selectedProduct?.variation ?? []);
    }
    //eslint-disable-next-line
  }, [selectedProduct]);
  const handleVariantChange = (value: string) => {
    const vType: "size" | "color" = type;

    const rType = vType === "color" ? "size" : "color";
    const selectedRev = !!selectedVariant ? selectedVariant[rType] ?? "" : "";

    const filteredVariants = variations.filter((variant: Variation) => {
      return (
        variant[vType].includes(value) && variant[rType].includes(selectedRev)
      );
    });

    if (filteredVariants.length > 0) {
      const selectedVariantData = filteredVariants[0];
      onVariantChange(selectedVariantData);
      toast.success(`${type === 'color' ? 'Color' : 'Size'} updated! ✨`);
    } else {
      toast.error(`This ${type} combination is out of stock`);
    }
  };

  const getVariantIcon = () => {
    return type === 'color' ? (
      <Palette className="w-4 h-4 text-purple-600" />
    ) : (
      <Shirt className="w-4 h-4 text-blue-600" />
    );
  };

  const getVariantColor = (variant: string) => {
    if (type === 'color') {
      // Return color-specific styling
      const colorMap: {[key: string]: string} = {
        'red': 'bg-red-100 text-red-800 border-red-200',
        'blue': 'bg-blue-100 text-blue-800 border-blue-200', 
        'green': 'bg-green-100 text-green-800 border-green-200',
        'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'purple': 'bg-purple-100 text-purple-800 border-purple-200',
        'pink': 'bg-pink-100 text-pink-800 border-pink-200',
        'black': 'bg-gray-100 text-gray-800 border-gray-200',
        'white': 'bg-gray-50 text-gray-800 border-gray-300'
      };
      return colorMap[variant.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  if (!list || list.length === 0) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
        <AlertCircle className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">No {type}s available</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        {getVariantIcon()}
        <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
        {selected && (
          <Badge className={`text-xs ${getVariantColor(selected)}`}>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {selected}
          </Badge>
        )}
      </div>
      
      <Select
        value={selected}
        onValueChange={(value: string) => {
          //@ts-ignore
          handleVariantChange(value);
        }}
      >
        <SelectTrigger className={`w-full h-11 border-2 transition-all ${
          selected 
            ? 'border-green-300 bg-green-50 hover:border-green-400' 
            : 'border-gray-200 hover:border-blue-300'
        }`}>
          <div className="flex items-center gap-2 w-full">
            {getVariantIcon()}
            <SelectValue
              placeholder={`Choose ${type}...`}
              className="text-gray-700"
            />
          </div>
        </SelectTrigger>
        
        <SelectContent position="popper" className="z-30 min-w-[200px] border-2 border-gray-200">
          <SelectGroup>
            <SelectLabel className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wide text-gray-600 font-semibold">
              {getVariantIcon()}
              Available {type}s
            </SelectLabel>
            
            <div className="px-2 pb-2">
              <div className="grid grid-cols-2 gap-2">
                {list
                  .filter((l) => !!l)
                  .map((variant, i) => {
                    const isSelected = selected === variant;
                    return (
                      <SelectItem
                        key={i}
                        value={variant}
                        className={`relative cursor-pointer rounded-lg border-2 transition-all hover:shadow-md ${
                          isSelected
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="flex items-center justify-between w-full p-2">
                          <div className="flex items-center gap-2">
                            {type === 'color' && (
                              <div 
                                className={`w-4 h-4 rounded-full border-2 border-gray-300`}
                                style={{ 
                                  backgroundColor: variant.toLowerCase() === 'black' ? '#000' : 
                                                 variant.toLowerCase() === 'white' ? '#fff' :
                                                 variant.toLowerCase() === 'red' ? '#ef4444' :
                                                 variant.toLowerCase() === 'blue' ? '#3b82f6' :
                                                 variant.toLowerCase() === 'green' ? '#10b981' :
                                                 variant.toLowerCase() === 'yellow' ? '#f59e0b' :
                                                 variant.toLowerCase() === 'purple' ? '#8b5cf6' :
                                                 variant.toLowerCase() === 'pink' ? '#ec4899' : '#6b7280'
                                }}
                              />
                            )}
                            <span className="font-medium text-gray-700 capitalize">{variant}</span>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
              </div>
            </div>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectDemo;
