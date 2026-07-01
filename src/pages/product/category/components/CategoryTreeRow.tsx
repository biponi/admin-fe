// CategoryTreeRow.tsx
// Replaces SingleItem — renders one row of a category tree with
// file-explorer-style connector lines instead of flat per-level colors.
import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import PlaceHolderImage from "@/assets/placeholder.svg";
import type { ICategory } from "../../interface";
import useRoleCheck from "@/pages/auth/hooks/useRoleCheck";

interface CategoryTreeRowProps {
  category: ICategory;
  level: number;
  /** true if this node is the last child among its siblings */
  isLast: boolean;
  /** for each ancestor level, whether that ancestor still has more siblings below it (draws a continuing vertical line) */
  ancestorHasMore: boolean[];
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  breadcrumb?: string;
  handleEditBtnClick: () => void;
  deleteExistingCategory: (id: string, force?: boolean) => Promise<boolean>;
}

const GUIDE_WIDTH = 20; // px per indent level

const CategoryTreeRow: React.FC<CategoryTreeRowProps> = ({
  category,
  level,
  isLast,
  ancestorHasMore,
  hasChildren,
  isExpanded,
  onToggleExpand,
  breadcrumb,
  handleEditBtnClick,
  deleteExistingCategory,
}) => {
  const { hasRequiredPermission } = useRoleCheck();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);

  const {
    id,
    img,
    name,
    active,
    discount,
    totalProducts = 0,
    parentCategoryName,
  } = category;

  const handleDelete = async (force: boolean = false) => {
    setDeleteLoading(true);
    try {
      await deleteExistingCategory(id, force);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <TableRow className='group border-slate-100 hover:bg-slate-50/80 transition-colors'>
      {/* Tree guide + expand toggle + name */}
      <TableCell className='py-2.5'>
        <div className='flex items-stretch'>
          {/* Ancestor connector lines */}
          <div className='flex shrink-0'>
            {ancestorHasMore.map((hasMore, i) => (
              <div
                key={i}
                className='relative shrink-0'
                style={{ width: GUIDE_WIDTH }}>
                {hasMore && (
                  <span className='absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-slate-200' />
                )}
              </div>
            ))}

            {/* Current level elbow connector */}
            {level > 0 && (
              <div className='relative shrink-0' style={{ width: GUIDE_WIDTH }}>
                <span className='absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2 bg-slate-200' />
                {!isLast && (
                  <span className='absolute left-1/2 top-1/2 bottom-0 w-px -translate-x-1/2 bg-slate-200' />
                )}
                <span className='absolute left-1/2 top-1/2 h-px w-2.5 -translate-y-1/2 bg-slate-200' />
              </div>
            )}
          </div>

          {/* Expand / collapse toggle */}
          <div className='flex items-center justify-center shrink-0 w-5'>
            {hasChildren ? (
              <button
                type='button'
                onClick={onToggleExpand}
                aria-label={isExpanded ? "Collapse" : "Expand"}
                className='flex h-5 w-5 items-center justify-center rounded-md text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors'>
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform duration-150 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </button>
            ) : (
              <span className='block h-1 w-1 rounded-full bg-slate-300' />
            )}
          </div>

          {/* Image + name */}
          <div className='flex items-center gap-2.5 min-w-0 py-0.5'>
            <img
              alt={name}
              src={img || PlaceHolderImage}
              className='h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-slate-100'
            />
            <div className='min-w-0'>
              <div className='flex items-center gap-1.5'>
                <span className='font-medium text-sm text-slate-800 truncate'>
                  {name}
                </span>
                {level === 0 && (
                  <span className='shrink-0 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-indigo-600'>
                    Root
                  </span>
                )}
              </div>
              {parentCategoryName && (
                <div className='text-[11px] text-slate-400 truncate'>
                  under {parentCategoryName}
                </div>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Breadcrumb */}
      <TableCell className='hidden lg:table-cell'>
        {breadcrumb ? (
          <span className='text-[11px] text-slate-400 truncate max-w-[220px] block'>
            {breadcrumb}
          </span>
        ) : (
          <span className='text-slate-300'>—</span>
        )}
      </TableCell>

      {/* Status */}
      <TableCell>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${
            active
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-slate-50 text-slate-500"
          }`}>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              active ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {active ? "Active" : "Inactive"}
        </span>
      </TableCell>

      {/* Depth */}
      <TableCell className='hidden md:table-cell'>
        <span className='inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-slate-200 px-1.5 font-mono text-[11px] text-slate-500'>
          L{level}
        </span>
      </TableCell>

      {/* Total products */}
      <TableCell className='hidden md:table-cell'>
        <div className='flex items-center gap-1.5'>
          <span className='text-sm text-slate-600'>{totalProducts}</span>
          {totalProducts === 0 && (
            <span className='text-[10px] uppercase tracking-widest text-slate-300'>
              Empty
            </span>
          )}
        </div>
      </TableCell>

      {/* Discount */}
      <TableCell className='hidden md:table-cell'>
        {discount > 0 ? (
          <span className='inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700'>
            {discount}% off
          </span>
        ) : (
          <span className='text-xs text-slate-300'>—</span>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-haspopup='true'
              size='icon'
              variant='ghost'
              className='h-8 w-8 text-slate-400 hover:text-slate-700'>
              <MoreHorizontal className='h-4 w-4' />
              <span className='sr-only'>Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {hasRequiredPermission("category", "edit") && (
              <DropdownMenuItem onClick={handleEditBtnClick}>
                <Edit className='h-4 w-4 mr-2' />
                Edit
              </DropdownMenuItem>
            )}
            {hasRequiredPermission("category", "delete") && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e: Event) => e.preventDefault()}
                    className='text-red-600 focus:text-red-600'>
                    <Trash2 className='h-4 w-4 mr-2' />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete category</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className='space-y-3'>
                        <p>
                          Are you sure you want to delete{" "}
                          <span className='font-medium text-slate-700'>
                            "{name}"
                          </span>
                          ?
                        </p>
                        {totalProducts > 0 && (
                          <div className='rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-800'>
                            <strong>Warning:</strong> This category has{" "}
                            {totalProducts} products.
                          </div>
                        )}
                        {hasChildren && (
                          <div className='rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-800'>
                            <strong>Warning:</strong> This category has child
                            categories.
                          </div>
                        )}
                        <label className='flex items-center gap-2 pt-1'>
                          <input
                            type='checkbox'
                            checked={forceDelete}
                            onChange={(e) => setForceDelete(e.target.checked)}
                            className='rounded border-slate-300 text-indigo-600 focus:ring-indigo-500'
                          />
                          <span className='text-[11px] uppercase tracking-widest text-slate-500'>
                            Force delete children &amp; products
                          </span>
                        </label>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(forceDelete)}
                      disabled={deleteLoading}
                      className='bg-red-600 hover:bg-red-700'>
                      {deleteLoading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default CategoryTreeRow;
