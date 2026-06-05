import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MobileOrderProductDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: OrderProduct[]
  orderNumber: string
}

interface OrderProduct {
  id: number | string
  productId?: string
  name?: string
  title?: string
  image?: string
  thumbnail?: string
  quantity?: number
  price?: number
  unitPrice?: number
  totalPrice?: number
  variant?: string | {
    size?: string
    color?: string
  }
  variation?: {
    size?: string
    color?: string
  }
}

const toNumber = (value: unknown) => {
  const numericValue =
    typeof value === "number" ? value : Number(value)

  return Number.isFinite(numericValue) ? numericValue : 0
}

const formatCurrency = (value: unknown) => toNumber(value).toLocaleString()

const getUnitPrice = (product: OrderProduct) =>
  product.price ?? product.unitPrice ?? 0

const getProductTotal = (product: OrderProduct) => {
  if (product.totalPrice !== undefined && product.totalPrice !== null) {
    return product.totalPrice
  }

  return toNumber(getUnitPrice(product)) * toNumber(product.quantity)
}

const getProductName = (product: OrderProduct) =>
  product.name || product.title || "Unnamed product"

const getProductVariant = (product: OrderProduct) => {
  if (product.variant && typeof product.variant === "string") {
    return product.variant
  }

  const variant =
    product.variant && typeof product.variant === "object"
      ? product.variant
      : product.variation

  const parts = [variant?.size, variant?.color].filter(Boolean)
  return parts.join(" / ")
}

export function MobileOrderProductDrawer({
  open,
  onOpenChange,
  products,
  orderNumber,
}: MobileOrderProductDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = products.filter((product) =>
    getProductName(product).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalProducts = products.reduce((sum, p) => sum + toNumber(p.quantity), 0)
  const totalAmount = products.reduce((sum, p) => sum + toNumber(getProductTotal(p)), 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md pb-safe-bottom">
        <SheetHeader>
          <SheetTitle>Order Products</SheetTitle>
          <p className="text-sm text-gray-500">
            Order #{orderNumber} • {products.length} items
          </p>
        </SheetHeader>

        {/* Search */}
        {products.length > 5 && (
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        )}

        {/* Product List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No products found
            </div>
          ) : (
            filteredProducts.map((product, index) => {
              const productName = getProductName(product)
              const productImage = product.image || product.thumbnail
              const variant = getProductVariant(product)

              return (
                <div
                  key={product.id || product.productId || index}
                  className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  {/* Product Image */}
                  <Avatar className="h-16 w-16 rounded-xl shrink-0">
                    <AvatarImage src={productImage} alt={productName} />
                    <AvatarFallback className="rounded-xl text-xs">
                      {productName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{productName}</p>
                    {variant && (
                      <p className="text-xs text-gray-500 truncate">
                        {variant}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-gray-600">
                        Qty: {toNumber(product.quantity)}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs font-semibold text-gray-900">
                        ৳{formatCurrency(getUnitPrice(product))}
                      </span>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">
                      ৳{formatCurrency(getProductTotal(product))}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Summary Footer */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Items</span>
            <span className="font-medium">{totalProducts}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="font-semibold">Total Amount</span>
            <span className="font-bold text-lg">
              ৳{totalAmount.toLocaleString()}
            </span>
          </div>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full mt-4"
            size="lg"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
