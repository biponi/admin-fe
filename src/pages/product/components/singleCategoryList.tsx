// Updated SingleItem component for hierarchical categories (flat view)
import { MoreHorizontal, Edit, Trash2, CornerDownRight } from "lucide-react";
import { ButtonLoadingText } from "@/components/loaders";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
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
} from "../../../components/ui/alert-dialog";
import { Button } from "../../../components/ui/button";
import { TableCell, TableRow } from "../../../components/ui/table";
import PlaceHolderImage from "../../../assets/placeholder.svg";
import useRoleCheck from "../../auth/hooks/useRoleCheck";
import { useState } from "react";

interface Props {
  id: string;
  image?: string;
  name: string;
  active: boolean;
  discount: number;
  totalProduct?: number;
  level?: number;
  parentName?: string;
  breadcrumb?: string;
  isChild?: boolean;
  handleEditBtnClick: () => void;
  deleteExistingCategory: (id: string, force?: boolean) => Promise<boolean>;
}

const SingleItem: React.FC<Props> = ({
  id,
  image,
  name,
  active,
  discount,
  totalProduct = 0,
  level = 0,
  parentName,
  breadcrumb,
  isChild = false,
  handleEditBtnClick,
  deleteExistingCategory,
}) => {
  const { hasRequiredPermission } = useRoleCheck();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);

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
      {/* Image */}
      <TableCell className='hidden sm:table-cell py-2.5'>
        <div className='flex items-center'>
          {isChild && (
            <CornerDownRight className='h-3.5 w-3.5 text-slate-300 mr-2 shrink-0' />
          )}
          <img
            alt={name}
            className='h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-slate-100'
            src={image || PlaceHolderImage}
          />
        </div>
      </TableCell>

      {/* Name with hierarchy indication */}
      <TableCell className='font-medium py-2.5'>
        <div className='flex items-center gap-1.5'>
          <span className='text-sm text-slate-800 truncate'>{name}</span>
          {level === 0 && (
            <span className='shrink-0 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-indigo-600'>
              Root
            </span>
          )}
        </div>
        {parentName && (
          <div className='text-[11px] text-slate-400 mt-0.5'>
            under {parentName}
          </div>
        )}
      </TableCell>

      {/* Hierarchy/Breadcrumb */}
      <TableCell>
        <div className='flex flex-col gap-1'>
          {breadcrumb && (
            <span className='text-[11px] text-slate-400 max-w-xs truncate'>
              {breadcrumb}
            </span>
          )}
          <span className='inline-flex w-fit items-center rounded-md border border-slate-200 px-1.5 py-0.5 font-mono text-[11px] text-slate-500'>
            L{level}
          </span>
        </div>
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

      {/* Level (hidden on mobile) */}
      <TableCell className='hidden md:table-cell'>
        <span className='inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-slate-200 px-1.5 font-mono text-[11px] text-slate-500'>
          {level}
        </span>
      </TableCell>

      {/* Total Products */}
      <TableCell className='hidden md:table-cell'>
        <div className='flex items-center gap-1.5'>
          <span className='text-sm text-slate-600'>{totalProduct || 0}</span>
          {totalProduct === 0 && (
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
                    onSelect={(e) => e.preventDefault()}
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
                        {totalProduct > 0 && (
                          <div className='rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-800'>
                            <strong>Warning:</strong> This category has{" "}
                            {totalProduct} products.
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
                      {deleteLoading ? (
                        <ButtonLoadingText text='Deleting…' />
                      ) : (
                        'Delete'
                      )}
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

export default SingleItem;
