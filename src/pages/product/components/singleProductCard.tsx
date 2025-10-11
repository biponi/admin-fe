import { BoxIcon, Package, RotateCcw, ShoppingCart } from "lucide-react";
import { Badge } from "../../../components/ui/badge";

import dayjs from "dayjs";
import { Button } from "../../../components/ui/button";
import { useRef } from "react";
import CustomAlertDialog from "../../../coreComponents/OptionModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../../components/ui/drawer";
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
  onViewVariations?: () => void;
}

const SingleProductCardItem: React.FC<Props> = ({
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
  onViewVariations,
}) => {
  const { hasSomePermissionsForPage, hasRequiredPermission } = useRoleCheck();
  const dialogBtn = useRef(null);
  const variantBtn = useRef(null);

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

  const renderDrawerView = () => {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant='outline' className='hidden' ref={variantBtn}>
            Open Drawer
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className='mx-auto w-full max-w-sm'>
            <DrawerHeader>
              <DrawerTitle>Variants</DrawerTitle>
              <DrawerDescription>
                Total Variations:{" "}
                <Badge className='outline'>
                  {variations?.length === 1 && variations[0] === "No Variant"
                    ? 0
                    : variations?.length ?? 0}
                </Badge>
              </DrawerDescription>
            </DrawerHeader>
            <div className='p-4 pb-0'>
              {variations?.length === 1 && variations[0] === "No Variant" ? (
                <div className='text-center py-4 text-gray-500'>
                  <Package className='h-8 w-8 text-gray-300 mx-auto mb-2' />
                  <p className='text-sm'>No variations available</p>
                </div>
              ) : (
                <div className='grid grid-cols-2 gap-2'>
                  {variations?.map((val, index) => (
                    <Badge
                      key={index}
                      variant={"secondary"}
                      className='bg-gray-300 text-gray-900'>
                      {val}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant='outline'>Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    );
  };

  const renderCardView = () => {
    return (
      <Card>
        <CardHeader className='p-2'>
          <CardTitle className='w-full grid grid-cols-3 gap-2'>
            <img
              alt='img'
              className='aspect-square rounded-md object-cover pointer-events-none group-hover:opacity-75'
              height='64'
              src={image}
              width='64'
            />
            <div className='col-span-2 grid-cols-1 gap-2'>
              <Badge className='w-full text-center mb-1'>{categoryName}</Badge>
              <Badge
                className='w-full text-center'
                variant={quantity > 0 ? "outline" : "destructive"}>
                {quantity > 0 && (
                  <span className='relative flex size-3'>
                    <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75'></span>
                    <span className='relative inline-flex size-3 rounded-full bg-sky-500'></span>
                  </span>
                )}
                <span className='ml-2'>
                  {quantity > 0 ? "in stock" : "out of stock"}
                </span>
              </Badge>
            </div>
          </CardTitle>
          <CardDescription className='w-full'>
            <div className='grid grid-cols-2 gap-2 justify-center items-center'>
              <Badge
                variant={"outline"}
                className='text-sm font-bold uppercase text-blue-700'>
                {title}
              </Badge>
              <span className='text-sm font-medium uppercase text-gray-900 text-right'>
                {unitPrice} BDT
              </span>
            </div>
            <div className='grid grid-cols-2 gap-2 justify-center items-center'></div>
          </CardDescription>
        </CardHeader>
        <CardContent className='p-2 h-[55px]'>
          <div className='grid grid-cols-4 sm:grid-cols-4 mx-auto gap-2'>
            <Badge variant={"outline"} className=' flex flex-col '>
              <BoxIcon className=' size-4 mr-1 ' /> {quantity}
            </Badge>
            <Badge variant={"outline"} className=' flex flex-col'>
              <ShoppingCart className=' size-4 mr-1 ' />
              {totalSold}
            </Badge>
            <Badge variant={"outline"} className=' flex flex-col'>
              <RotateCcw className=' size-4 mr-1 ' /> {totalReturned}
            </Badge>

            <Badge
              variant={"outline"}
              className=' flex flex-col cursor-pointer hover:bg-gray-100 transition-colors'
              onClick={
                onViewVariations ||
                (() => {
                  //@ts-ignore
                  if (!!variantBtn) variantBtn?.current.click();
                })
              }>
              <Package className=' size-4 mr-1 ' />
              {variations?.length === 1 && variations[0] === "No Variant"
                ? 0
                : variations?.length ?? 0}
            </Badge>
          </div>
          <Badge variant={"outline"} className='my-1 hidden'>
            <span className='text-[10px] font-medium text-gray-800'>
              Updated At: {dayjs(updatedAt).format("DD-MM-YYYY HH:mm:ss")}
            </span>
          </Badge>
          {discardDialog()}
          {renderDrawerView()}
        </CardContent>
        {hasSomePermissionsForPage("product", ["edit", "delete"]) && (
          <CardFooter className='grid grid-cols-2 gap-2 p-1'>
            {hasRequiredPermission("product", "edit") && (
              <Button
                className='w-full'
                size={"sm"}
                variant={"secondary"}
                onClick={() => handleUpdateProduct(id)}>
                Edit
              </Button>
            )}
            {hasRequiredPermission("product", "delete") && (
              <Button
                className='w-full'
                size={"sm"}
                variant={"destructive"}
                onClick={() => {
                  //@ts-ignore
                  if (!!dialogBtn) dialogBtn.current?.click();
                }}>
                Delete
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    );
  };
  return renderCardView();
};

export default SingleProductCardItem;
