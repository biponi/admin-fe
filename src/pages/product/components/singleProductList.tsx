import { BoxIcon, MoreHorizontalIcon } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat.js"; // note the /plugin path
import { TableCell, TableRow } from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { useRef } from "react";
import CustomAlertDialog from "../../../coreComponents/OptionModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import useRoleCheck from "../../auth/hooks/useRoleCheck";

interface Props {
  id: string;
  sku: string;
  image: string;
  title: string;
  active: boolean;
  quantity: number;
  unitPrice: number;
  updatedAt: string;
  categoryName: string;
  variations: string[];
  totalReturned: number;
  totalSold: number;
  handleUpdateProduct: (id: string) => void;
  deleteExistingProduct: (id: string) => void;
}

dayjs.extend(advancedFormat);

const SingleItem: React.FC<Props> = ({
  id,
  sku,
  image,
  title,
  active,
  quantity,
  unitPrice,
  updatedAt,
  totalSold,
  variations,
  categoryName,
  totalReturned,
  handleUpdateProduct,
  deleteExistingProduct,
}) => {
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();
  const dialogBtn = useRef(null);

  const discardDialog = () => {
    return (
      <CustomAlertDialog
        title='Are You Sure?'
        description={`Deleting ${title}?`}
        onSubmit={() => {
          deleteExistingProduct(id);
        }}>
        <Button className='hidden' ref={dialogBtn}>
          show dialog
        </Button>
      </CustomAlertDialog>
    );
  };
  const renderVariationPopover = () => {
    if (!variations || variations.length === 0) {
      return (
        <Button variant='secondary' disabled size={"sm"}>
          No Variations
        </Button>
      );
    }
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='default' size={"sm"}>
            View
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-96'>
          <div className='grid grid-cols-3 gap-2 w-full'>
            {variations?.map((val, index) => (
              <Button key={index} variant={"secondary"} size={"sm"}>
                {val}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };
  return (
    <TableRow>
      <TableCell className='hidden sm:table-cell'>
        <img
          alt='img'
          className='aspect-square rounded-md object-cover'
          height='32'
          src={image}
          width='32'
        />
      </TableCell>
      <TableCell className='font-medium'>{title}</TableCell>
      <TableCell>{sku}</TableCell>
      <TableCell>{categoryName}</TableCell>
      <TableCell>{unitPrice}</TableCell>
      <TableCell>{renderVariationPopover()}</TableCell>
      <TableCell className='hidden text-center md:table-cell'>
        {quantity > 0 ? (
          <Badge variant={"outline"}>
            <BoxIcon className=' size-4 mr-2' />
            {quantity}
          </Badge>
        ) : (
          <Badge variant={"destructive"}>Out Of Stock</Badge>
        )}
      </TableCell>
      <TableCell>
        <Popover>
          <PopoverTrigger asChild>
            <Button size={"sm"} variant={"outline"}>
              {totalSold}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className='grid grid-cols-3 gap-2 grid-flow-row auto-rows-min'>
              {!!totalSold && totalSold > 0 ? (
                <Badge
                  variant={"outline"}
                  className='flex flex-col col-auto justify-center items-center gap-1 py-2 uppercase text-[10px]'>
                  {totalSold}
                </Badge>
              ) : (
                <Badge
                  variant={"secondary"}
                  className=' col-span-3 text-center mx-auto'>
                  No Activity Found
                </Badge>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell>{totalReturned}</TableCell>
      <TableCell className='hidden md:table-cell'>
        {dayjs(updatedAt).format("DD/MM/YYYY HH:mm A")}
      </TableCell>
      {hasSomePermissionsForPage("product", ["edit", "delete"]) && (
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup='true' size='icon' variant='ghost'>
                <MoreHorizontalIcon className='h-4 w-4' />
                <span className='sr-only'>Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {hasRequiredPermission("product", "edit") && (
                <DropdownMenuItem onClick={() => handleUpdateProduct(id)}>
                  Edit
                </DropdownMenuItem>
              )}
              {hasRequiredPermission("product", "delete") && (
                <DropdownMenuItem
                  onClick={() => {
                    //@ts-ignore
                    if (!!dialogBtn) dialogBtn.current?.click();
                  }}>
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      )}
      {discardDialog()}
    </TableRow>
  );
};

export default SingleItem;
