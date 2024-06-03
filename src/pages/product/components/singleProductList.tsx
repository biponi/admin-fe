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
import { TableCell, TableRow } from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { useRef } from "react";
import CustomAlertDialog from "../../../coreComponents/OptionModal";

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
  handleUpdateProduct: (id: string) => void;
  deleteExistingProduct: (id: string) => void;
}

const SingleItem: React.FC<Props> = ({
  id,
  sku,
  image,
  title,
  active,
  quantity,
  unitPrice,
  updatedAt,
  categoryName,
  handleUpdateProduct,
  deleteExistingProduct,
}) => {
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
  return (
    <TableRow>
      <TableCell className='hidden sm:table-cell'>
        <img
          alt='img'
          className='aspect-square rounded-md object-cover'
          height='64'
          src={image}
          width='64'
        />
      </TableCell>
      <TableCell className='font-medium'>{title}</TableCell>
      <TableCell>{sku}</TableCell>
      <TableCell>
        <Badge variant={active ? "outline" : "destructive"}>
          {active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell>{categoryName}</TableCell>
      <TableCell>{unitPrice}</TableCell>
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
      <TableCell className='hidden md:table-cell'>
        {dayjs(updatedAt).format("DD-MM-YYYY HH:mm:ss")}
      </TableCell>
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
            <DropdownMenuItem onClick={() => handleUpdateProduct(id)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                //@ts-ignore
                if (!!dialogBtn) dialogBtn.current?.click();
              }}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      {discardDialog()}
    </TableRow>
  );
};

export default SingleItem;
