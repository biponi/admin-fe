import {
  CircleCheck,
  CircleMinusIcon,
  Edit,
  MapPin,
  MoreHorizontalIcon,
  TimerIcon,
  Truck,
  Shield,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
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
import useRoleCheck from "../../auth/hooks/useRoleCheck";
import { FraudDetection } from "../interface";
import FraudDetectionDrawer from "./FraudDetectionDrawer";

interface Props {
  id: string;
  orderNumber: number;
  customerName: string;
  CustomerPhoneNumber: string;
  status: string;
  district: string;
  totalPrice: number;
  paid: number;
  updatedAt: string;
  remaining: number;
  isBulkAdded: boolean;
  fraudDetection?: FraudDetection;
  handleViewDetails: () => void;
  handleUpdateOrder: () => void;
  handleModifyProduct: () => void;
  handleReturnProducts: () => void;
  handleBulkCheck: (val: boolean) => void;
  deleteExistingOrder: (id: string) => void;
}

const SingleItem: React.FC<Props> = ({
  id,
  orderNumber,
  customerName,
  CustomerPhoneNumber,
  status,
  totalPrice,
  district,
  paid,
  remaining,
  updatedAt,
  isBulkAdded,
  fraudDetection,
  handleBulkCheck,
  handleViewDetails,
  handleUpdateOrder,
  handleModifyProduct,
  deleteExistingOrder,
  handleReturnProducts,
}) => {
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();
  const dialogBtn = useRef(null);

  const getFraudIcon = (riskLevel?: string) => {
    switch (riskLevel) {
      case "red":
        return <AlertTriangle className='w-4 h-4 text-red-600' />;
      case "yellow":
        return <Shield className='w-4 h-4 text-yellow-600' />;
      case "green":
        return <ShieldCheck className='w-4 h-4 text-green-600' />;
      default:
        return <Shield className='w-4 h-4 text-gray-400' />;
    }
  };

  const discardDialog = () => {
    return (
      <CustomAlertDialog
        title='Are You Sure?'
        description={`Deleting #${id}?`}
        onSubmit={() => {
          deleteExistingOrder(id);
        }}>
        <Button className='hidden' ref={dialogBtn}>
          show dialog
        </Button>
      </CustomAlertDialog>
    );
  };
  return (
    <TableRow className='hover:bg-zinc-300'>
      {hasSomePermissionsForPage("order", ["edit", "delete", "documents"]) &&
        !status.includes("return") && (
          <TableCell className='hidden sm:table-cell'>
            <input
              className='border-gray-200 rounded-lg text-primary'
              type='checkbox'
              checked={isBulkAdded}
              onChange={(e) => {
                handleBulkCheck(!isBulkAdded);
              }}
            />
          </TableCell>
        )}
      <TableCell className='hidden sm:table-cell'>{orderNumber}</TableCell>
      <TableCell>{customerName}</TableCell>
      <TableCell className='font-medium'>{CustomerPhoneNumber}</TableCell>
      <TableCell>
        <Badge
          variant={
            ["cancel", "delete"].includes(status) ? "destructive" : "outline"
          }
          className={`py-1 px-3 ${
            status === "processing"
              ? ""
              : status === "shipped"
              ? "bg-blue-400 text-gray-200"
              : ["cancel", "delete"].includes(status)
              ? ""
              : "bg-green-500 text-gray-200"
          }`}>
          {status === "processing" ? (
            <TimerIcon className='w-4 h-4 mr-2  ' />
          ) : status === "shipped" ? (
            <Truck className='w-4 h-4 mr-2' />
          ) : ["cancel", "delete", "fail", "failed"].includes(status) ? (
            <CircleMinusIcon className='w-4 h-4 mr-2' />
          ) : (
            <CircleCheck className='w-4 h-4 mr-2 ' />
          )}
          {status.toUpperCase()}
        </Badge>
      </TableCell>
      <TableCell className='hidden md:table-cell'>
        <Badge variant='outline' className='py-1 px-3'>
          <MapPin className='w-4 h-4 mr-2' />
          {district}
        </Badge>
      </TableCell>
      <TableCell>{totalPrice}</TableCell>
      <TableCell className='hidden md:table-cell'>{paid}</TableCell>
      <TableCell className='hidden md:table-cell'>{remaining}</TableCell>
      <TableCell className='hidden lg:table-cell text-center'>
        <FraudDetectionDrawer
          fraudDetection={fraudDetection}
          customerName={customerName}
          phoneNumber={CustomerPhoneNumber}
          trigger={
            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
              {getFraudIcon(fraudDetection?.riskLevel)}
            </Button>
          }
        />
      </TableCell>
      <TableCell className='hidden '>
        {dayjs(updatedAt).format("DD-MM-YYYY HH:mm:ss")}
      </TableCell>
      <TableCell
        className=' cursor-pointer'
        onClick={() => handleViewDetails()}>
        <u className=' cursor-pointer'>Details</u>
      </TableCell>
      {hasRequiredPermission("order", "edit") && (
        <TableCell
          className=' cursor-pointer'
          onClick={() => handleUpdateOrder()}>
          <Edit className='w-5 h-5' />
        </TableCell>
      )}
      {hasSomePermissionsForPage("order", ["edit", "delete"]) && (
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

              {hasRequiredPermission("order", "edit") &&
                status.includes("processing") && (
                  <DropdownMenuItem onClick={() => handleModifyProduct()}>
                    Modify Product
                  </DropdownMenuItem>
                )}
              {hasRequiredPermission("order", "edit") &&
                status.includes("shipped") && (
                  <DropdownMenuItem onClick={() => handleReturnProducts()}>
                    Return Product
                  </DropdownMenuItem>
                )}
              {hasRequiredPermission("order", "delete") && (
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
