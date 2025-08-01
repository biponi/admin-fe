// Updated SingleItem component for hierarchical categories
import {
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronRight,
  Folder,
  FolderOpen,
} from "lucide-react";
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
import { Badge } from "../../../components/ui/badge";
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

  // Create indentation for tree view
  const getIndentation = () => {
    if (!isChild) return null;
    return (
      <div className='flex items-center'>
        <div className='w-4 h-4 border-l border-b border-gray-300 mr-2' />
        <ChevronRight className='h-3 w-3 text-gray-400 mr-1' />
      </div>
    );
  };

  // Get level-based styling
  const getLevelStyling = () => {
    const baseClass = "transition-colors";
    switch (level) {
      case 0:
        return `${baseClass} bg-blue-50 hover:bg-blue-100`;
      case 1:
        return `${baseClass} bg-green-50 hover:bg-green-100`;
      case 2:
        return `${baseClass} bg-yellow-50 hover:bg-yellow-100`;
      default:
        return `${baseClass} bg-gray-50 hover:bg-gray-100`;
    }
  };

  return (
    <TableRow className={getLevelStyling()}>
      {/* Image */}
      <TableCell className='hidden sm:table-cell'>
        <div className='flex items-center'>
          {getIndentation()}
          <img
            alt='Category_image'
            className='aspect-square rounded-md object-cover'
            height='40'
            src={image || PlaceHolderImage}
            width='40'
          />
        </div>
      </TableCell>

      {/* Name with hierarchy indication */}
      <TableCell className='font-medium'>
        <div className='flex items-center space-x-2'>
          {level === 0 ? (
            <FolderOpen className='h-4 w-4 text-blue-600' />
          ) : (
            <Folder className='h-4 w-4 text-green-600' />
          )}
          <div>
            <div className='font-medium'>{name}</div>
            {parentName && (
              <div className='text-xs text-muted-foreground'>
                Parent: {parentName}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      {/* Hierarchy/Breadcrumb */}
      <TableCell>
        <div className='flex flex-col space-y-1'>
          {breadcrumb && (
            <div className='text-xs text-muted-foreground max-w-xs truncate'>
              {breadcrumb}
            </div>
          )}
          <Badge
            variant='outline'
            className={`w-fit text-xs ${
              level === 0
                ? "border-blue-200 text-blue-700"
                : level === 1
                ? "border-green-200 text-green-700"
                : level === 2
                ? "border-yellow-200 text-yellow-700"
                : "border-gray-200 text-gray-700"
            }`}>
            Level {level}
          </Badge>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge variant={active ? "default" : "secondary"}>
          {active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>

      {/* Level (hidden on mobile) */}
      <TableCell className='hidden md:table-cell'>
        <div className='flex items-center space-x-2'>
          <span className='font-mono text-sm'>{level}</span>
          {level === 0 && (
            <Badge variant='outline' className='text-xs'>
              Root
            </Badge>
          )}
        </div>
      </TableCell>

      {/* Total Products */}
      <TableCell className='hidden md:table-cell'>
        <div className='flex items-center space-x-1'>
          <span>{totalProduct || 0}</span>
          {totalProduct === 0 && (
            <Badge variant='outline' className='text-xs'>
              Empty
            </Badge>
          )}
        </div>
      </TableCell>

      {/* Discount */}
      <TableCell className='hidden md:table-cell'>
        {discount > 0 ? (
          <Badge variant='secondary'>{discount}%</Badge>
        ) : (
          <span className='text-muted-foreground'>No discount</span>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup='true' size='icon' variant='ghost'>
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
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className='h-4 w-4 mr-2' />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{name}"?
                      {totalProduct && totalProduct > 0 && (
                        <div className='mt-2 p-2 bg-yellow-50 rounded'>
                          <strong>Warning:</strong> This category has{" "}
                          {totalProduct} products.
                        </div>
                      )}
                      <div className='mt-2'>
                        <label className='flex items-center space-x-2'>
                          <input
                            type='checkbox'
                            checked={forceDelete}
                            onChange={(e) => setForceDelete(e.target.checked)}
                            className='rounded'
                          />
                          <span className='text-sm'>
                            Force delete (removes all child categories and
                            products)
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

export default SingleItem;
