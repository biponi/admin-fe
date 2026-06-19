import React, { useState } from "react";
import {
  Package,
  Edit,
  Trash2,
  ArchiveRestore,
  MoreVertical,
  DollarSign,
  Calendar,
  Hash,
  Eye,
  X,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../../components/ui/drawer";
import useRoleCheck from "../../auth/hooks/useRoleCheck";
import dayjs from "dayjs";

interface Product {
  title: string;
  productId: string;
  quantity: number;
  variantId?: string;
  image?: string;
  thumbnail?: string;
  sku?: string;
  unitPrice?: number;
}

interface Props {
  id: string;
  purchaseNumber: number;
  products: Product[];
  totalAmount: number;
  createdAt: string;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
  handleRestore: (id: string) => void;
  isDeleted?: boolean;
}

const MobilePurchaseOrderCard: React.FC<Props> = ({
  id,
  purchaseNumber,
  products,
  totalAmount,
  createdAt,
  handleEdit,
  handleDelete,
  handleRestore,
  isDeleted = false,
}) => {
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-BD");
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("MMM D, YYYY h:mm A");
  };

  // Display first 2 products inline
  const displayProducts = products.slice(0, 2);
  const remainingProducts = products.slice(2);
  const hasMoreProducts = remainingProducts.length > 0;

  return (
    <div className='bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 pb-3'>
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200'>
            <Hash className='h-5 w-5' />
          </div>
          <div className='flex-1 min-w-0'>
            <h3 className='font-bold text-slate-900 text-lg'>
              #{purchaseNumber}
            </h3>
            <div className='flex items-center gap-1 mt-1'>
              <Calendar className='h-3 w-3 text-slate-500' />
              <span className='text-xs text-slate-600'>
                {formatDate(createdAt)}
              </span>
            </div>
          </div>
        </div>

        {hasSomePermissionsForPage("purchaseOrder", ["edit", "delete"]) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='h-9 w-9 p-0 hover:bg-slate-100 rounded-full'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              {hasRequiredPermission("purchaseOrder", "edit") && !isDeleted && (
                <DropdownMenuItem onClick={() => handleEdit(id)}>
                  <Edit className='h-4 w-4 mr-2' />
                  Edit Order
                </DropdownMenuItem>
              )}

              {hasRequiredPermission("purchaseOrder", "delete") &&
                !isDeleted && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(id)}
                      className='text-red-600 focus:text-red-600'>
                      <Trash2 className='h-4 w-4 mr-2' />
                      Delete Order
                    </DropdownMenuItem>
                  </>
                )}

              {hasRequiredPermission("purchaseOrder", "delete") &&
                isDeleted && (
                  <DropdownMenuItem onClick={() => handleRestore(id)}>
                    <ArchiveRestore className='h-4 w-4 mr-2' />
                    Restore Order
                  </DropdownMenuItem>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Products Section - Inline Badges */}
      <div className='px-4 pb-3'>
        <div className='mb-3'>
          <div className='flex items-center gap-2 mb-2'>
            <Package className='h-4 w-4 text-indigo-600' />
            <span className='font-semibold text-sm text-slate-900'>
              Products
            </span>
            <Badge variant='secondary' className='text-xs font-medium'>
              {products.length}
            </Badge>
          </div>

          {/* Inline Product Badges */}
          <div className='space-y-2'>
            {displayProducts.map((product, index) => (
              <div
                key={`${product.productId}-${index}`}
                className='flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100'>
                <div className='flex items-center gap-2 flex-1 min-w-0'>
                  {product.image || product.thumbnail ? (
                    <img
                      src={product.image || product.thumbnail}
                      alt={product.title}
                      className='h-10 w-10 rounded-lg object-cover border border-slate-200 flex-shrink-0'
                    />
                  ) : (
                    <div className='h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0'>
                      <Package className='h-5 w-5 text-indigo-600' />
                    </div>
                  )}
                  <span className='text-sm font-medium text-slate-900 truncate'>
                    {product.title}
                  </span>
                </div>
                <Badge
                  variant='outline'
                  className='text-xs font-semibold px-2 py-0 flex-shrink-0'>
                  ×{product.quantity}
                </Badge>
              </div>
            ))}

            {/* View All Products Button */}
            {hasMoreProducts && (
              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button
                    variant='outline'
                    className='w-full h-11 text-sm font-medium border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800'>
                    <Eye className='h-4 w-4 mr-2' />
                    View All {products.length} Products
                  </Button>
                </DrawerTrigger>
                <DrawerContent className='h-[85vh]'>
                  <div className='mx-auto w-full max-w-md'>
                    <DrawerHeader className='pb-3'>
                      <div className='flex items-center justify-between'>
                        <DrawerTitle className='text-lg font-semibold'>
                          All Products (#{purchaseNumber})
                        </DrawerTitle>
                        <DrawerClose asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0 rounded-full'>
                            <X className='h-4 w-4' />
                          </Button>
                        </DrawerClose>
                      </div>
                      <DrawerDescription className='text-sm'>
                        {products.length} product
                        {products.length !== 1 ? "s" : ""} in this purchase
                        order
                      </DrawerDescription>
                    </DrawerHeader>

                    {/* Scrollable Product List */}
                    <div className='px-4 pb-4 overflow-y-auto max-h-[calc(85vh-140px)]'>
                      <div className='space-y-2'>
                        {products.map((product, index) => (
                          <div
                            key={`${product.productId}-${index}`}
                            className='flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all'>
                            <div className='flex items-center gap-3 flex-1 min-w-0'>
                              {product.image || product.thumbnail ? (
                                <img
                                  src={product.image || product.thumbnail}
                                  alt={product.title}
                                  className='h-12 w-12 rounded-lg object-cover border border-slate-200 flex-shrink-0'
                                />
                              ) : (
                                <div className='h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0'>
                                  <Package className='h-6 w-6 text-indigo-600' />
                                </div>
                              )}
                              <div className='flex-1 min-w-0'>
                                <p className='text-sm font-semibold text-slate-900 truncate'>
                                  {product.title}
                                </p>
                                <p className='text-xs text-slate-500'>
                                  Product ID: {product.productId}
                                </p>
                              </div>
                            </div>
                            <div className='flex items-center gap-2 flex-shrink-0'>
                              <div className='text-right'>
                                <p className='text-xs text-slate-500'>
                                  Quantity
                                </p>
                                <Badge
                                  variant='secondary'
                                  className='text-sm font-semibold px-3 py-1'>
                                  {product.quantity}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary Footer in Drawer */}
                      <div className='mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-xs font-medium text-indigo-700'>
                              Total Amount
                            </p>
                            <p className='text-2xl font-bold text-indigo-900'>
                              ৳{formatAmount(totalAmount)}
                            </p>
                          </div>
                          <div className='h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center'>
                            <DollarSign className='h-6 w-6 text-indigo-600' />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className='grid grid-cols-2 gap-3'>
          {/* Total Amount */}
          <div className='flex items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100'>
            <div className='h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center'>
              <DollarSign className='h-4 w-4 text-indigo-600' />
            </div>
            <div className='flex-1'>
              <p className='text-xs font-medium text-indigo-700'>Total</p>
              <p className='font-bold text-sm text-indigo-900'>
                ৳{formatAmount(totalAmount)}
              </p>
            </div>
          </div>

          {/* Product Count */}
          <div className='flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100'>
            <div className='h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center'>
              <Package className='h-4 w-4 text-slate-600' />
            </div>
            <div className='flex-1'>
              <p className='text-xs font-medium text-slate-700'>Items</p>
              <p className='font-bold text-sm text-slate-900'>
                {products.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='px-4 pb-4'>
        <div className='flex items-center justify-between pt-2 border-t border-slate-100'>
          <div className='flex items-center gap-1 text-xs text-slate-500'>
            <Calendar className='h-3 w-3' />
            <span>Created {dayjs(createdAt).fromNow()}</span>
          </div>
          {isDeleted && (
            <Badge
              variant='destructive'
              className='text-xs font-medium px-2 py-0'>
              Deleted
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobilePurchaseOrderCard;
