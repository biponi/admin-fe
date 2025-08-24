// Updated EditCustomerInformation Component for Sheet Layout
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { BDDistrictList, BDDivisions } from "../../utils/contents";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  User,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  FileText,
  Search,
  Calculator,
  Truck,
  Tag,
  Wallet,
  Save,
  X,
} from "lucide-react";
import { getLocationByFormattedString } from "../../utils/functions";

const defaultPersonalInformation = {
  name: "",
  email: "",
  phoneNumber: "",
};

const defaultShippingAddress = {
  division: {},
  district: {},
  address: "",
};

interface Props {
  shipping: any;
  customerInfo: any;
  deliveryCharge: number;
  totalPrice: number;
  paid: number;
  remaining: number;
  discount: number;
  notes: string;
  handleClose: () => void;
  handleCustomerDataChange: (information: any) => void;
}

const EditCustomerInformation: React.FC<Props> = ({
  paid,
  totalPrice,
  shipping,
  remaining,
  discount,
  notes,
  handleClose,
  customerInfo,
  deliveryCharge,
  handleCustomerDataChange,
}) => {
  const [personalInformation, setPersonalInformation] = useState(
    defaultPersonalInformation
  );
  const [shippingAddress, setShippingAddress] = useState(
    defaultShippingAddress
  );

  const [tp, setTp] = useState(totalPrice ?? 0);
  const [spaid, setPaid] = useState(paid ?? 0);
  const [sdeliveryCharge, setDeliveryCharge] = useState(deliveryCharge ?? 0);
  const [sremaining, setRemaining] = useState(remaining ?? 0);
  const [sdiscount, setDiscount] = useState(discount ?? 0);
  const [updatedNotes, setUpdatedNotes] = useState(notes ?? "");

  const [divisionQuery, setDivisionQuery] = useState("");
  const [districtQuery, setDistrictQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate final amount
  const finalAmount = Number(tp) + Number(sdeliveryCharge) - Number(sdiscount);

  useEffect(() => {
    setShippingAddress({
      ...shippingAddress,
      address: shipping?.address,
      district:
        getLocationByFormattedString(BDDistrictList, shipping.district) ?? {},
      division:
        getLocationByFormattedString(BDDivisions, shipping.division) ?? {},
    });
    //eslint-disable-next-line
  }, [shipping]);

  useEffect(() => {
    setTp(totalPrice);
    setPaid(paid);
    setDeliveryCharge(deliveryCharge);
    setRemaining(remaining);
    setDiscount(discount);
  }, [paid, totalPrice, deliveryCharge, remaining, discount]);

  useEffect(() => {
    setPersonalInformation({
      ...customerInfo,
    });
    //eslint-disable-next-line
  }, [customerInfo]);

  useEffect(() => {
    setUpdatedNotes(notes);
    //eslint-disable-next-line
  }, [notes]);

  const handlePersonalInformationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPersonalInformation({
      ...personalInformation,
      [e.target.name]: e.target.value,
    });
  };

  const handleShippingDivChange = (id: string, name: string) => {
    if (name === "division") {
      const filteredDivision = BDDivisions.filter(
        (division) => division?.id === id
      );
      if (filteredDivision.length > 0)
        setShippingAddress({
          ...shippingAddress,
          division: filteredDivision[0],
          district: {}, // Reset district when division changes
        });
    } else {
      const filteredDistrict = BDDistrictList.filter(
        (District) => District?.id === id
      );
      if (filteredDistrict.length > 0)
        setShippingAddress({
          ...shippingAddress,
          district: filteredDistrict[0],
        });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await handleCustomerDataChange({
        notes: updatedNotes,
        customer: personalInformation,
        shipping: {
          address: shippingAddress?.address,
          //@ts-ignore
          district: `${shippingAddress?.district?.name ?? ""}(${
            //@ts-ignore
            shippingAddress?.district?.bn_name ?? ""
          })`,
          //@ts-ignore
          division: `${shippingAddress?.division?.name ?? ""}(${
            //@ts-ignore
            shippingAddress?.division?.bn_name ?? ""
          })`,
        },
        discount: sdiscount,
        remaining: sremaining,
        paid: spaid,
        deliveryCharge: sdeliveryCharge,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCustomerPersonalInformation = () => {
    return (
      <Card className='border-slate-200/60 shadow-none border-x-0 border-t-0 rounded-none'>
        <CardHeader className='px-0 pb-3'>
          <CardTitle className='flex items-center gap-2 text-slate-700 text-base'>
            <div className='p-1 rounded bg-blue-100'>
              <User className='h-3.5 w-3.5 text-blue-600' />
            </div>
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className='px-0 space-y-3'>
          <div className='space-y-2'>
            <Label
              htmlFor='name'
              className='text-xs font-medium text-slate-700 flex items-center gap-1'>
              <User className='h-3 w-3' />
              Customer Name
            </Label>
            <Input
              type='text'
              id='name'
              name='name'
              placeholder='Enter customer name'
              value={personalInformation.name}
              onChange={handlePersonalInformationChange}
              className='h-9 text-sm transition-all duration-200 focus:ring-1 focus:ring-blue-500/30'
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label
                htmlFor='email'
                className='text-xs font-medium text-slate-700 flex items-center gap-1'>
                <Mail className='h-3 w-3' />
                Email
              </Label>
              <Input
                type='email'
                id='email'
                name='email'
                placeholder='email@example.com'
                value={personalInformation.email}
                onChange={handlePersonalInformationChange}
                className='h-9 text-sm transition-all duration-200 focus:ring-1 focus:ring-blue-500/30'
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='phone-number'
                className='text-xs font-medium text-slate-700 flex items-center gap-1'>
                <Phone className='h-3 w-3' />
                Phone
              </Label>
              <Input
                type='text'
                id='phone-number'
                name='phoneNumber'
                placeholder='017XXXXXXXXX'
                value={personalInformation.phoneNumber}
                onChange={handlePersonalInformationChange}
                className='h-9 text-sm transition-all duration-200 focus:ring-1 focus:ring-blue-500/30'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label
              htmlFor='notes'
              className='text-xs font-medium text-slate-700 flex items-center gap-1'>
              <FileText className='h-3 w-3' />
              Notes
            </Label>
            <Textarea
              rows={2}
              id='notes'
              name='notes'
              placeholder='Special instructions...'
              value={updatedNotes}
              onChange={(e) => setUpdatedNotes(e.target.value)}
              className='text-sm transition-all duration-200 focus:ring-1 focus:ring-blue-500/30 resize-none'
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCustomerShippingInformation = () => {
    return (
      <Card className='border-slate-200/60 shadow-none border-x-0 border-t-0 rounded-none'>
        <CardHeader className='px-0 pb-3'>
          <CardTitle className='flex items-center gap-2 text-slate-700 text-base'>
            <div className='p-1 rounded bg-green-100'>
              <MapPin className='h-3.5 w-3.5 text-green-600' />
            </div>
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className='px-0 space-y-3'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label
                htmlFor='division'
                className='text-xs font-medium text-slate-700'>
                Division
              </Label>
              <Select
                value={
                  //@ts-ignore
                  !!shippingAddress?.division?.id
                    ? //@ts-ignore
                      shippingAddress?.division?.id
                    : ""
                }
                onValueChange={(value: string) => {
                  handleShippingDivChange(value, "division");
                  setDistrictQuery("");
                }}>
                <SelectTrigger className='h-9 text-sm transition-all duration-200 focus:ring-1 focus:ring-green-500/30'>
                  <SelectValue placeholder='Select division' />
                </SelectTrigger>
                <SelectContent>
                  <div className='relative'>
                    <Search className='absolute left-2 top-2 h-3 w-3 text-gray-400' />
                    <Input
                      type='text'
                      className='h-7 pl-7 text-xs border-0 border-b border-gray-200 rounded-none focus:border-green-500 focus:ring-0'
                      placeholder='Search...'
                      value={divisionQuery}
                      onChange={(e) => setDivisionQuery(e.target.value)}
                    />
                  </div>
                  {BDDivisions.filter(
                    (division) =>
                      division.name
                        .toLowerCase()
                        .includes(divisionQuery.toLowerCase()) ||
                      division.bn_name.includes(divisionQuery)
                  ).map((division, index: number) => (
                    <SelectItem
                      key={index}
                      value={division?.id}
                      className='text-xs cursor-pointer hover:bg-green-50'>
                      {`${division?.name} (${division?.bn_name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!!shippingAddress?.division && (
              <div className='space-y-2 animate-in slide-in-from-right-2 duration-300'>
                <Label
                  htmlFor='district'
                  className='text-xs font-medium text-slate-700'>
                  District
                </Label>
                <Select
                  //@ts-ignore
                  value={
                    //@ts-ignore
                    !!shippingAddress?.district?.id
                      ? //@ts-ignore
                        shippingAddress?.district?.id
                      : ""
                  }
                  onValueChange={(value: string) => {
                    handleShippingDivChange(value, "district");
                  }}>
                  <SelectTrigger className='h-9 text-sm transition-all duration-200 focus:ring-1 focus:ring-green-500/30'>
                    <SelectValue placeholder='Select district' />
                  </SelectTrigger>
                  <SelectContent>
                    <div className='relative'>
                      <Search className='absolute left-2 top-2 h-3 w-3 text-gray-400' />
                      <Input
                        type='text'
                        className='h-7 pl-7 text-xs border-0 border-b border-gray-200 rounded-none focus:border-green-500 focus:ring-0'
                        placeholder='Search...'
                        value={districtQuery}
                        onChange={(e) => setDistrictQuery(e.target.value)}
                      />
                    </div>
                    {BDDistrictList.filter(
                      (district) =>
                        !!shippingAddress.division &&
                        //@ts-ignore
                        shippingAddress?.division.id === district.division_id &&
                        (district.name
                          .toLowerCase()
                          .includes(districtQuery.toLowerCase()) ||
                          district.bn_name.includes(districtQuery))
                    ).map((district, index: number) => (
                      <SelectItem
                        key={index}
                        value={district?.id}
                        className='text-xs cursor-pointer hover:bg-green-50'>
                        {`${district?.name} (${district?.bn_name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className='space-y-2'>
            <Label
              htmlFor='address'
              className='text-xs font-medium text-slate-700'>
              Complete Address
            </Label>
            <Textarea
              id='address'
              name='address'
              placeholder='House/Flat no., Street, Area...'
              value={shippingAddress.address}
              onChange={(e) => {
                setShippingAddress({
                  ...shippingAddress,
                  address: e.target.value,
                });
              }}
              rows={2}
              className='text-sm transition-all duration-200 focus:ring-1 focus:ring-green-500/30 resize-none'
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPaymentDetails = () => {
    return (
      <Card className='border-slate-200/60 shadow-none border-x-0 border-t-0 rounded-none'>
        <CardHeader className='px-0 pb-3'>
          <CardTitle className='flex items-center gap-2 text-slate-700 text-base'>
            <div className='p-1 rounded bg-amber-100'>
              <CreditCard className='h-3.5 w-3.5 text-amber-600' />
            </div>
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className='px-0 space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label
                htmlFor='total'
                className='text-xs font-medium text-slate-700 flex items-center gap-1'>
                <Calculator className='h-3 w-3' />
                Total Price
              </Label>
              <Input
                type='number'
                min={0}
                id='total'
                value={tp}
                placeholder='0.00'
                disabled
                className='h-9 text-sm bg-slate-50 text-slate-600'
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='dc'
                className='text-xs font-medium text-slate-700 flex items-center gap-1'>
                <Truck className='h-3 w-3' />
                Delivery
              </Label>
              <Input
                type='number'
                min={0}
                id='dc'
                value={sdeliveryCharge}
                onChange={(e) => {
                  const newDeliveryCharge = Number(e.target.value);
                  setRemaining(
                    Number(tp) +
                      newDeliveryCharge -
                      Number(spaid) -
                      Number(sdiscount)
                  );
                  setDeliveryCharge(newDeliveryCharge);
                }}
                placeholder='0.00'
                className='h-9 text-sm transition-all duration-200 focus:ring-1 focus:ring-amber-500/30'
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='discount'
                className='text-xs font-medium text-slate-700 flex items-center gap-1'>
                <Tag className='h-3 w-3' />
                Discount
              </Label>
              <Input
                type='number'
                min={0}
                id='discount'
                placeholder='0.00'
                value={sdiscount}
                onChange={(e) => {
                  const newDiscount = Number(e.target.value);
                  setRemaining(
                    Number(tp) +
                      Number(sdeliveryCharge) -
                      newDiscount -
                      Number(spaid)
                  );
                  setDiscount(newDiscount);
                }}
                className='h-9 text-sm transition-all duration-200 focus:ring-1 focus:ring-amber-500/30'
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='paid'
                className='text-xs font-medium text-slate-700 flex items-center gap-1'>
                <Wallet className='h-3 w-3' />
                Paid
              </Label>
              <Input
                type='number'
                min={0}
                id='paid'
                placeholder='0.00'
                value={spaid}
                onChange={(e) => {
                  const newPaid = Number(e.target.value);
                  setRemaining(
                    Number(tp) +
                      Number(sdeliveryCharge) -
                      newPaid -
                      Number(sdiscount)
                  );
                  setPaid(newPaid);
                }}
                className='h-9 text-sm transition-all duration-200 focus:ring-1 focus:ring-amber-500/30'
              />
            </div>
          </div>

          <Separator className='my-3' />

          {/* Compact Payment Summary */}
          <div className='bg-slate-50 p-3 rounded-md space-y-2'>
            <h4 className='text-xs font-medium text-slate-700 flex items-center gap-1'>
              <Calculator className='h-3 w-3' />
              Summary
            </h4>
            <div className='grid grid-cols-2 gap-2 text-xs'>
              <div className='flex justify-between'>
                <span className='text-slate-600'>Final:</span>
                <span className='font-medium'>
                  ৳{finalAmount.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-slate-600'>Due:</span>
                <Badge
                  variant={sremaining > 0 ? "destructive" : "secondary"}
                  className='text-xs h-5 px-2'>
                  ৳{sremaining.toLocaleString()}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto px-6 py-4 space-y-4'>
        {renderCustomerPersonalInformation()}
        {renderCustomerShippingInformation()}
        {renderPaymentDetails()}
      </div>

      {/* Fixed Footer */}
      <div className='border-t bg-slate-50/80 backdrop-blur-sm p-4'>
        <div className='flex gap-3'>
          <Button
            variant='outline'
            onClick={handleClose}
            disabled={isSubmitting}
            className='flex-1 h-9 text-sm transition-all duration-200 hover:bg-slate-100'>
            <X className='h-3.5 w-3.5 mr-1' />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className='flex-1 h-9 text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200'>
            {isSubmitting ? (
              <>
                <div className='w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin mr-1' />
                Saving...
              </>
            ) : (
              <>
                <Save className='h-3.5 w-3.5 mr-1' />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerInformation;
