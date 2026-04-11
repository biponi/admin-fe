import { X, Package, ShoppingCart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';
import PlaceHolderImage from '../../../assets/placeholder.svg';
import type { IProduct, IVariation } from '../../product/interface';

interface VariationModalProps {
  product: IProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectVariation: (product: IProduct, variation: IVariation) => void;
  isLoading?: boolean;
}

export function VariationModal({
  product,
  open,
  onOpenChange,
  onSelectVariation,
  isLoading = false,
}: VariationModalProps) {
  if (!product) return null;

  const availableVariations = product.variation?.filter((v) => v.quantity > 0) || [];

  const getImageUrl = (variation?: IVariation): string => {
    // 1. Try variation image first
    if (variation?.images && variation.images.length > 0) {
      const image = variation.images[0];
      // Handle both string URLs and File objects
      if (typeof image === 'string') {
        return image;
      }
      // If it's a File object, create object URL for display
      if (image instanceof File) {
        return URL.createObjectURL(image);
      }
    }
    // 2. Fallback to product thumbnail
    if (product.thumbnail) {
      return product.thumbnail;
    }
    // 3. Final fallback to placeholder
    return PlaceHolderImage;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">Select Variation</DialogTitle>
              <DialogDescription className="text-base mt-1">
                {product.name}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {availableVariations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No variations available</h3>
              <p className="text-sm text-muted-foreground">
                All variations are currently out of stock.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableVariations.map((variation) => (
                <div
                  key={variation.id}
                  className="border rounded-lg p-4 space-y-3 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  {/* Variation Image */}
                  <div className="aspect-square w-full overflow-hidden bg-gray-100 rounded">
                    <img
                      src={getImageUrl(variation)}
                      alt={`${product.name} - ${variation.color} ${variation.size}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PlaceHolderImage;
                      }}
                    />
                  </div>

                  {/* Variation Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{variation.name || variation.title}</h4>
                      {variation.quantity <= 5 && (
                        <Badge variant="destructive" className="text-xs">
                          Only {variation.quantity} left
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {variation.color && (
                        <Badge variant="outline" className="text-xs">
                          Color: {variation.color}
                        </Badge>
                      )}
                      {variation.size && (
                        <Badge variant="outline" className="text-xs">
                          Size: {variation.size}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">SKU: {variation.sku}</p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-bold">
                        ৳{variation.unitPrice.toFixed(2)}
                      </span>

                      <Button
                        size="sm"
                        disabled={isLoading || variation.quantity === 0}
                        onClick={() => onSelectVariation(product, variation)}
                        className="shrink-0"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
