import { useEffect, useState } from "react";
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
  const [personalInfomation, setPersonalInformation] = useState(
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
          <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
            <Label htmlFor="name">Customer name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              placeholder="Name"
              value={personalInfomation.name}
              onChange={handlePersonalInfomationChange}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={personalInfomation.email}
              onChange={handlePersonalInfomationChange}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
            <Label htmlFor="phone-number">Phone Number</Label>
            <Input
              type="text"
              id="phone-number"
              name="phoneNumber"
              placeholder="017XXXXXXXXXXX"
              value={personalInfomation.phoneNumber}
              onChange={handlePersonalInfomationChange}
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              rows={5}
              id="notes"
              name="notes"
              placeholder="Write a note..."
              value={updatedNotes}
              onChange={(e) => {
                setUpdatedNotes(e.target.value);
              }}
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
          <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
            <Label htmlFor="district">Division</Label>
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
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Division" />
              </SelectTrigger>
              <SelectContent>
                <Input
                  type="text"
                  className="mb-2"
                  placeholder="search"
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
                    value={division?.id}
                  >{`${division?.name}(${division?.bn_name})`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!!shippingAddress?.division && (
            <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
              <Label htmlFor="district">Districts</Label>
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
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent>
                  <Input
                    type="text"
                    className="mb-2"
                    placeholder="search"
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
                      value={division?.id}
                    >{`${division?.name}(${division?.bn_name})`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Enter Full Address"
              value={shippingAddress.address}
              onChange={(e) => {
                setShippingAddress({
                  ...shippingAddress,
                  address: e.target.value,
                });
              }}
            ></Textarea>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPaymentDetails = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="total">Total Price</Label>
            <Input
              type="number"
              min={0}
              id="total"
              value={tp}
              placeholder="Total Price"
              disabled
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
            <Label htmlFor="dc">Delivery Charge</Label>
            <Input
              type="number"
              min={0}
              id="dc"
              value={sdeliveryCharge}
              onChange={(e) => {
                setRemaining(
                  Number(tp) +
                    Number(e.target.value) -
                    Number(spaid) -
                    Number(discount)
                );
                setDeliveryCharge(Number(e.target.value));
              }}
              placeholder="Delivery Charge"
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
            <Label htmlFor="discount">Discount</Label>
            <Input
              type="number"
              min={0}
              id="discount"
              placeholder="Discount"
              value={sdiscount}
              onChange={(e) => {
                setRemaining(
                  Number(tp) +
                    Number(sdeliveryCharge) -
                    Number(e.target.value) -
                    Number(spaid)
                );
                setDiscount(Number(e.target.value));
              }}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
            <Label htmlFor="paid">Paid</Label>
            <Input
              type="number"
              min={0}
              id="paid"
              placeholder="Paid"
              value={spaid}
              onChange={(e) => {
                setRemaining(
                  Number(tp) +
                    Number(sdeliveryCharge) -
                    Number(e.target.value) -
                    Number(discount)
                );
                setPaid(Number(e.target.value));
              }}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
            <Label htmlFor="remaining">Remaining</Label>
            <Input
              type="number"
              min={0}
              id="remaining"
              placeholder="Remaining"
              disabled
              value={sremaining}
            />
          </div>
        </CardContent>
      </Card>
    );
  };
  return (
    <>
      <Card className="border-0 shadow-none p-0 h-[88vh]">
        <CardContent className="max-h-[80vh] overflow-y-auto p-0">
          <div className="grid grid-cols-1 gap-4">
            <div>{renderCustomerPersonalInformation()}</div>
            <div>{renderCustomerShippingInformation()}</div>
            <div>{renderPaymentDetails()}</div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full justify-center items-center py-4">
            <Button
              className="w-full mr-2"
              variant="destructive"
              onClick={() => {
                setPersonalInformation(defaultPersonalInformation);
                setShippingAddress(defaultShippingAddress);
                handleClose();
              }}
            >
              Close
            </Button>
            <Button
              className=" w-full"
              onClick={() =>
                handleCustomerDataChange({
                  notes: updatedNotes,
                  customer: personalInfomation,
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
                })
              }
            >
              Submit
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default EditCustomerInformation;
