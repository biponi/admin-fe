import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { IOrderProduct } from "../product/interface";
import PlaceHolderImage from "../../assets/placeholder.svg";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import EmptyProductCard from "../../common/EmptyProductCard";
import { ITransection } from "./interface";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";

interface Props {
  transection: ITransection;
  orderProducts: IOrderProduct[];
  customerInformation: { customer: any; shipping: any };
  handleCreateOrder: () => void;
  handleBack: () => void;
}

const OrderPreview: React.FC<Props> = ({
  handleBack,
  transection,
  orderProducts,
  handleCreateOrder,
  customerInformation,
}) => {
  const renderVariantMenu = (
    type: string,
    list: string[],
    selected: string
  ) => {
    return (
      <Select value={selected} disabled>
        <SelectTrigger className='w-[80px]'>
          <SelectValue placeholder={`Select a ${type}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{type.toUpperCase()}</SelectLabel>
            {list.map((v) => (
              <SelectItem value={v}>{v.toUpperCase()}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  };

  const renderSelectedProduct = (product: IOrderProduct, index: number) => {
    const distinctColors = new Set<string>(); // Use Set for efficient storage of unique values
    const distinctSizes = new Set<string>();

    for (const item of product.variation) {
      if (!!item.color) distinctColors.add(item.color);
      if (!!item.size) distinctSizes.add(item.size);
    }

    const uniqueColors: string[] = Array.from(distinctColors) ?? []; // Convert Set to array
    const uniqueSizes: string[] = Array.from(distinctSizes) ?? [];
    return (
      <TableRow key={`${product?.id}-${index}`}>
        <TableCell className='hidden sm:block'>
          {
            <img
              alt='img'
              className='aspect-square rounded-md object-cover'
              height='64'
              src={!!product?.thumbnail ? product.thumbnail : PlaceHolderImage}
              width='64'
            />
          }
        </TableCell>
        <TableCell>
          {product?.name.length > 15
            ? product.name.slice(0, 15) + "..."
            : product.name}
        </TableCell>
        <TableCell>
          {product?.hasVariation
            ? renderVariantMenu(
                "color",
                uniqueColors,
                product.selectedVariant?.color ?? ""
              )
            : "N/A"}
        </TableCell>
        <TableCell>
          {product?.hasVariation
            ? renderVariantMenu(
                "size",
                uniqueSizes,
                product.selectedVariant?.size ?? ""
              )
            : "N/A"}
        </TableCell>
        <TableCell>{product?.selectedQuantity}</TableCell>
        <TableCell className='hidden sm:block'>{product?.totalPrice}</TableCell>
      </TableRow>
    );
  };

  const renderSelectedProductList = () => {
    return (
      <Table className='max-h-[50vh] overflow-y-auto'>
        <TableHeader>
          <TableRow>
            <TableHead className='hidden sm:block'>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>quantity</TableHead>
            <TableHead className='hidden sm:block'>Total Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(!orderProducts || orderProducts.length < 1) && (
            <TableRow>
              <TableCell colSpan={7}>
                <EmptyProductCard text='Please select a product' />
              </TableCell>
            </TableRow>
          )}
          {!!orderProducts &&
            orderProducts.map((product: IOrderProduct, index) =>
              renderSelectedProduct(product, index)
            )}
        </TableBody>
      </Table>
    );
  };

  const renderTransectionData = () => {
    return (
      <div className='w-full'>
        <div className='flex items-center justify-between'>
          <span className=' text-sm text-gray-900 font-bold'>
            Total price -
          </span>
          <span className=' text-sm text-gray-900 font-bold ml-auto'>
            {transection.totalPrice}
          </span>
        </div>
        <div className='my-4 bg-gray-300 h-[1px]' />
        <div className='grid grid-cols-5 items-center justify-between'>
          <span className=' text-sm text-gray-900 font-bold col-span-4'>
            Discount -
          </span>
          <Input type='number' disabled={true} value={transection.discount} />
        </div>
        <div className='my-4 bg-gray-300 h-[1px]' />
        <div className='grid grid-cols-5 items-center justify-between'>
          <span className=' text-sm text-gray-900 font-bold col-span-4'>
            Delivery Charge -
          </span>
          <Input
            type='number'
            disabled={true}
            value={transection.deliveryCharge}
          />
        </div>
        <div className='my-4 bg-gray-300 h-[1px]' />
        <div className='grid grid-cols-5 items-center justify-between'>
          <span className='text-sm text-gray-900 font-bold col-span-4'>
            Paid -
          </span>
          <Input type='number' value={transection.paid} disabled={true} />
        </div>
        <div className='my-4 bg-gray-300 h-[1px]' />
        <div className='flex items-center justify-between'>
          <span className=' text-sm text-gray-900 font-bold'>Reamaining -</span>
          <span className=' text-sm text-gray-900 font-bold ml-auto'>
            {transection.remaining}
          </span>
        </div>
      </div>
    );
  };

  const renderCustomerPersonalInformation = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid w-full max-w-sm items-center gap-1.5 mt-2'>
            <Label htmlFor='name'>Customer name</Label>
            <Input
              type='text'
              id='name'
              name='name'
              placeholder='Name'
              value={customerInformation.customer.name}
              disabled
            />
          </div>
          <div className='grid w-full max-w-sm items-center gap-1.5 mt-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              type='email'
              id='email'
              name='email'
              placeholder='Email'
              value={customerInformation.customer.email}
              disabled
            />
          </div>
          <div className='grid w-full max-w-sm items-center gap-1.5 mt-2'>
            <Label htmlFor='phone-number'>Phone Number</Label>
            <Input
              type='text'
              id='phone-number'
              name='phoneNumber'
              placeholder='017XXXXXXXXXXX'
              value={customerInformation.customer.phoneNumber}
              disabled
            />
          </div>
        </CardContent>
      </Card>
    );
  };
  const renderCustomerShippingInformation = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid w-full max-w-sm items-center gap-1.5 mt-2'>
            <Label htmlFor='district'>Division</Label>
            <span className='text-base font-semibold text-gray-900'>
              {customerInformation.shipping.division.name}
            </span>
          </div>

          <div className='grid w-full max-w-sm items-center gap-1.5 mt-2'>
            <Label htmlFor='district'>Districts</Label>
            <span className='text-base font-semibold text-gray-900'>
              {customerInformation.shipping.district.name}
            </span>
          </div>
          <div className='grid w-full max-w-sm items-center gap-1.5 mt-2'>
            <Label htmlFor='address'>Address</Label>
            <Textarea
              id='address'
              name='address'
              placeholder='Enter Full Address'
              value={customerInformation.shipping.address}
              disabled></Textarea>
          </div>
        </CardContent>
      </Card>
    );
  };
  const renderCustomerinforamtionPreview = () => {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>{renderCustomerPersonalInformation()}</div>
              <div>{renderCustomerShippingInformation()}</div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <div className='w-full grid grid-cols-1 sm:grid-cols-6 gap-2'>
      <div className=' col-span-1 sm:col-span-4'>
        {/* customer information */}
        {renderCustomerinforamtionPreview()}
      </div>
      <div className='col-span-1 sm:col-span-2 my-2'>
        <Card>
          <CardHeader>
            <CardTitle>Selected Product Information</CardTitle>
          </CardHeader>
          <CardContent>{renderSelectedProductList()}</CardContent>
        </Card>
        <Card className='my-2'>
          <CardHeader>
            <CardTitle>Amount</CardTitle>
          </CardHeader>
          <CardContent>{renderTransectionData()}</CardContent>
          <CardFooter>
            <div className='flex justify-end items-center ml-auto'>
              <Button
                variant={"outline"}
                className='mx-2'
                onClick={() => {
                  handleBack();
                }}>
                Back
              </Button>
              <Button
                disabled={!orderProducts || orderProducts.length < 1}
                onClick={() => {
                  handleCreateOrder();
                }}>
                Create Order
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default OrderPreview;
