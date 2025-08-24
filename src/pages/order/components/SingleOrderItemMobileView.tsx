import { MoreHorizontalIcon } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "../../../components/ui/drawer";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../../../components/ui/card";
import dayjs from "dayjs";
import { Button } from "../../../components/ui/button";
import { useRef } from "react";
import CustomAlertDialog from "../../../coreComponents/OptionModal";
import useRoleCheck from "../../auth/hooks/useRoleCheck";

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
  handleViewDetails: () => void;
  handleUpdateOrder: () => void;
  handleModifyProduct: () => void;
  handleReturnProducts: () => void;
  handleBulkCheck: (val: boolean) => void;
  deleteExistingOrder: (id: string) => void;
}

const SingleItemMobileView: React.FC<Props> = ({
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
  handleBulkCheck,
  handleViewDetails,
  handleUpdateOrder,
  handleModifyProduct,
  deleteExistingOrder,
  handleReturnProducts,
}) => {
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();
  const dialogBtn = useRef(null);

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
    <Card className=' w-full  rounded-none'>
      <CardHeader className='flex flex-row items-center justify-between p-2'>
        <div className='flex items-center space-x-2'>
          {hasSomePermissionsForPage("order", [
            "edit",
            "delete",
            "documents",
          ]) &&
            !status.includes("return") && (
              <input
                className='border-gray-200 rounded-lg text-primary'
                type='checkbox'
                checked={isBulkAdded}
                onChange={(e) => {
                  handleBulkCheck(!isBulkAdded);
                }}
              />
            )}
          <span className='font-medium'>#{orderNumber}</span>
        </div>

        {/* Drawer Trigger */}
      </CardHeader>

      <CardContent className='px-2 pb-2'>
        {/* Status and District */}
        <div className='flex items-center space-x-2 mb-4'>
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
            {status.toUpperCase()}
          </Badge>
          <Badge variant='outline' className='py-1 px-3'>
            {district}
          </Badge>
        </div>

        {/* Customer Details */}
        <div className='mb-4'>
          <p className='font-medium'>{customerName}</p>
          <p className='text-sm text-gray-600'>{CustomerPhoneNumber}</p>
        </div>

        {/* Price Details */}
        <div className='grid grid-cols-3 gap-4 mb-4'>
          <div>
            <p className='text-sm text-gray-600'>Total Price</p>
            <p className='font-medium'>{totalPrice}</p>
          </div>
          <div>
            <p className='text-sm text-gray-600'>Paid</p>
            <p className='font-medium'>{paid}</p>
          </div>
          <div>
            <p className='text-sm text-gray-600'>Remaining</p>
            <p className='font-medium'>{remaining}</p>
          </div>
        </div>

        {/* Updated At and Details */}
        <div className='flex justify-between items-center'>
          <p className='text-sm text-gray-600'>
            Updated: {dayjs(updatedAt).format("DD-MM-YYYY HH:mm:ss")}
          </p>
        </div>
      </CardContent>

      <CardFooter className='grid grid-cols-2 gap-4 p-2'>
        <Button variant={"outline"} onClick={() => handleViewDetails()}>
          Details
        </Button>
        {hasSomePermissionsForPage("order", ["edit", "delete"]) && (
          <Drawer>
            <DrawerTrigger asChild>
              <Button>
                <MoreHorizontalIcon className='h-4 w-4' />
                <span className='sr-only'>Toggle menu</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Actions</DrawerTitle>
                <DrawerDescription>
                  Choose an action for this order.
                </DrawerDescription>
              </DrawerHeader>
              <div className='p-4 space-y-2'>
                {hasRequiredPermission("order", "edit") && (
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={() => handleUpdateOrder()}>
                    Edit
                  </Button>
                )}
                {hasRequiredPermission("order", "edit") &&
                  status.includes("processing") && (
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={() => handleModifyProduct()}>
                      Modify Product
                    </Button>
                  )}
                {hasRequiredPermission("order", "edit") &&
                  status.includes("shipped") && (
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={() => handleReturnProducts()}>
                      Return Product
                    </Button>
                  )}
                {hasRequiredPermission("order", "delete") && (
                  <Button
                    variant='destructive'
                    className='w-full'
                    onClick={() => {
                      //@ts-ignore
                      if (!!dialogBtn) dialogBtn.current?.click();
                    }}>
                    Delete
                  </Button>
                )}
              </div>
              {hasRequiredPermission("order", "edit") && (
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant='outline'>Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              )}
            </DrawerContent>
          </Drawer>
        )}
      </CardFooter>

      {/* Discard Dialog */}
      {discardDialog()}
    </Card>
  );
};

export default SingleItemMobileView;
