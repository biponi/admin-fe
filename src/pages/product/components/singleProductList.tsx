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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";

interface Props {
  id: string;
  sku: string;
  image: string;
  title: string;
  active: boolean;
  quantity: number;
  unitPrice: number;
  updatedAt: string;
  totalSold: number;
  categoryName: string;
  variations: string[];
  totalReturned: number;
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
  totalSold,
  variations,
  categoryName,
  totalReturned,
  handleUpdateProduct,
  deleteExistingProduct,
}) => {
  const dialogBtn = useRef(null);

  const discardDialog = () => {
    return (
      <CustomAlertDialog
        title="Are You Sure?"
        description={`Deleting ${title}?`}
        onSubmit={() => {
          deleteExistingProduct(id);
        }}
      >
        <Button className="hidden" ref={dialogBtn}>
          show dialog
        </Button>
      </CustomAlertDialog>
    );
  };
  const renderVariationPopover = () => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="default" size={"sm"}>
            View More
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96">
          <div className="grid grid-cols-3 gap-2 w-full">
            {variations?.slice(2, variations?.length).map((val, index) => (
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
      <TableCell className="hidden sm:table-cell">
        <img
          alt="img"
          className="aspect-square rounded-md object-cover"
          height="32"
          src={image}
          width="32"
        />
      </TableCell>
      <TableCell className="font-medium">{title}</TableCell>
      <TableCell>{sku}</TableCell>
      <TableCell>{categoryName}</TableCell>
      <TableCell>{unitPrice}</TableCell>
      <TableCell className="grid grid-cols-3 gap-2">
        {variations?.length > 3 ? (
          <>
            {variations?.slice(0, 2).map((val, index) => (
              <Button key={index} variant={"secondary"} size={"sm"}>
                {val}
              </Button>
            ))}{" "}
            {renderVariationPopover()}
          </>
        ) : (
          variations?.map((val, index) => (
            <Button key={index} variant={"secondary"} size={"sm"}>
              {val}
            </Button>
          ))
        )}
      </TableCell>
      <TableCell className="hidden text-center md:table-cell">
        {quantity > 0 ? (
          <Badge variant={"outline"}>
            <BoxIcon className=" size-4 mr-2" />
            {quantity}
          </Badge>
        ) : (
          <Badge variant={"destructive"}>Out Of Stock</Badge>
        )}
      </TableCell>
      <TableCell>{totalSold}</TableCell>
      <TableCell>{totalReturned}</TableCell>
      <TableCell className="hidden md:table-cell">
        {dayjs(updatedAt).format("DD-MM-YYYY HH:mm:ss")}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontalIcon className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleUpdateProduct(id)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                //@ts-ignore
                if (!!dialogBtn) dialogBtn.current?.click();
              }}
            >
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
