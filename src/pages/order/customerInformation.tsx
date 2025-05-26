import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
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
import { isValidBangladeshiMobileNumber } from "../../utils/helperFunction";
import { errorToast } from "../../utils/toast";
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
  handleBack: () => void;
  handleCustomerDataChange: (information: any) => void;
}
const CustomerInformation: React.FC<Props> = ({
  handleCustomerDataChange,
  handleBack,
}) => {
  const [personalInfomation, setPersonalInformation] = useState(
    defaultPersonalInformation
  );
  const [shippingAddress, setShippingAddress] = useState(
    defaultShippingAddress
  );

  const [divisionQuery, setDivisionQuery] = useState("");
  const [districtQuery, setDistrictQuery] = useState("");

  const handleSubmit = () => {
    if (
      !!personalInfomation?.phoneNumber &&
      !isValidBangladeshiMobileNumber(personalInfomation?.phoneNumber)
    ) {
      return errorToast("Please enter a valid Bangladeshi phone number.");
    }
    if (!shippingAddress?.division) {
      return errorToast("Please select a division.");
    }
    if (!shippingAddress?.district) {
      return errorToast("Please select a district.");
    }

    handleCustomerDataChange({
      customer: personalInfomation,
      shipping: shippingAddress,
    });
  };

  const handlePersonalInfomationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPersonalInformation({
      ...personalInfomation,
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
              value={personalInfomation.name}
              onChange={handlePersonalInfomationChange}
            />
          </div>
          <div className='grid w-full max-w-sm items-center gap-1.5 mt-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              type='email'
              id='email'
              name='email'
              placeholder='Email'
              value={personalInfomation.email}
              onChange={handlePersonalInfomationChange}
            />
          </div>
          <div className='grid w-full max-w-sm items-center gap-1.5 mt-2'>
            <Label htmlFor='phone-number'>Phone Number</Label>
            <Input
              type='text'
              id='phone-number'
              name='phoneNumber'
              placeholder='017XXXXXXXXXXX'
              value={personalInfomation.phoneNumber}
              onChange={handlePersonalInfomationChange}
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
            <Select
              onValueChange={(value: string) => {
                handleShippingDivChange(value, "division");
              }}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Division' />
              </SelectTrigger>
              <SelectContent>
                <Input
                  type='text'
                  className='mb-2'
                  placeholder='search'
                  value={divisionQuery}
                  onChange={(e) => setDivisionQuery(e.target.value)}
                />
                {BDDivisions.filter(
                  (division) =>
                    division.name
                      .toLowerCase()
                      .includes(divisionQuery.toLowerCase()) ||
                    division.bn_name.includes(divisionQuery)
                ).map((division, index: number) => (
                  <SelectItem
                    key={index}
                    value={
                      division?.id
                    }>{`${division?.name}(${division?.bn_name})`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!!shippingAddress?.division && (
            <div className='grid w-full max-w-sm items-center gap-1.5 mt-2'>
              <Label htmlFor='district'>Districts</Label>
              <Select
                onValueChange={(value: string) => {
                  handleShippingDivChange(value, "district");
                }}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='District' />
                </SelectTrigger>
                <SelectContent>
                  <Input
                    type='text'
                    className='mb-2'
                    placeholder='search'
                    value={districtQuery}
                    onChange={(e) => setDistrictQuery(e.target.value)}
                  />
                  {BDDistrictList.filter(
                    (district) =>
                      !!shippingAddress.division &&
                      //@ts-ignore
                      shippingAddress?.division.id === district.division_id &&
                      (district.name
                        .toLowerCase()
                        .includes(districtQuery.toLowerCase()) ||
                        district.bn_name.includes(districtQuery))
                  ).map((division, index: number) => (
                    <SelectItem
                      key={index}
                      value={
                        division?.id
                      }>{`${division?.name}(${division?.bn_name})`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className='grid w-full max-w-sm items-center gap-1.5 mt-2'>
            <Label htmlFor='address'>Address</Label>
            <Textarea
              id='address'
              name='address'
              placeholder='Enter Full Address'
              value={shippingAddress.address}
              onChange={(e) => {
                setShippingAddress({
                  ...shippingAddress,
                  address: e.target.value,
                });
              }}></Textarea>
          </div>
        </CardContent>
      </Card>
    );
  };
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
        <CardFooter>
          <div className='flex w-full justify-center items-center sm:w-auto sm:justify-end sm:ml-auto'>
            <Button
              className='w-full mr-2'
              variant='destructive'
              onClick={() => {
                setPersonalInformation(defaultPersonalInformation);
                setShippingAddress(defaultShippingAddress);
              }}>
              Reset
            </Button>
            <Button
              className='w-full mr-2'
              variant='outline'
              onClick={() => {
                handleBack();
              }}>
              Back
            </Button>
            <Button className=' w-full' onClick={() => handleSubmit()}>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default CustomerInformation;
