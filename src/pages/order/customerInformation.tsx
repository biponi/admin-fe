import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Separator } from "../../components/ui/separator";
import { BDDistrictList, BDDivisions } from "../../utils/contents";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { isValidBangladeshiMobileNumber } from "../../utils/helperFunction";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Search,
  Truck,
  RotateCcw,
  UserCheck,
  Globe,
  Calculator,
  Percent,
  CreditCard,
  Edit3,
  DollarSign,
  Receipt,
  Clock,
} from "lucide-react";
import { ITransection } from "./interface";
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
  handleCustomerDataChange: (
    information: any,
    transaction: ITransection
  ) => void;
  initialTransaction?: ITransection | null;
  orderTotal: number;
}
const CustomerInformation: React.FC<Props> = ({
  handleCustomerDataChange,
  handleBack,
  initialTransaction,
  orderTotal,
}) => {
  const [personalInfomation, setPersonalInformation] = useState(
    defaultPersonalInformation
  );
  const [shippingAddress, setShippingAddress] = useState(
    defaultShippingAddress
  );

  const [divisionQuery, setDivisionQuery] = useState("");
  const [districtQuery, setDistrictQuery] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isValidating, setIsValidating] = useState(false);

  // Transaction state
  const defaultTransaction = {
    totalPrice: orderTotal,
    paid: 0.0,
    remaining: 0.0,
    discount: 0.0,
    deliveryCharge: 100.0,
  };

  const [transaction, setTransaction] = useState<ITransection>(
    initialTransaction || defaultTransaction
  );

  // Mobile transaction editing states
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [isEditingPaid, setIsEditingPaid] = useState(false);
  const [tempDiscount, setTempDiscount] = useState(
    initialTransaction?.discount?.toString() || "0"
  );
  const [tempDeliveryCharge, setTempDeliveryCharge] = useState(
    initialTransaction?.deliveryCharge?.toString() || "100"
  );
  const [tempPaidAmount, setTempPaidAmount] = useState(
    initialTransaction?.paid?.toString() || "0"
  );

  // Calculate delivery charge based on location
  const calculateDeliveryCharge = (
    district: string,
    division: string
  ): number => {
    let deliveryChargeX = 150; // Default charge

    if (
      district.toLowerCase().includes("dhaka") &&
      division.toLowerCase().includes("dhaka")
    ) {
      deliveryChargeX = 80;
    } else if (
      division.toLowerCase().includes("dhaka") &&
      ["gazipur", "tongi", "narayanganj", "savar"].includes(
        district.replace(/\s*\(.*?\)\s*/g, "").toLowerCase()
      )
    ) {
      deliveryChargeX = 130;
    } else {
      deliveryChargeX = 150;
    }

    return deliveryChargeX;
  };

  // Update delivery charge when division/district changes
  const updateDeliveryCharge = (shippingData: any) => {
    if (shippingData?.district?.name && shippingData?.division?.name) {
      const calculatedCharge = calculateDeliveryCharge(
        shippingData.district.name,
        shippingData.division.name
      );

      setTransaction((prev) => ({
        ...prev,
        deliveryCharge: calculatedCharge,
      }));
      setTempDeliveryCharge(calculatedCharge.toString());
    }
  };

  // Mobile transaction editing functions
  const handleDiscountEdit = () => setIsEditingDiscount(true);
  const handleDiscountSave = () => {
    const discount = parseFloat(tempDiscount) || 0;
    setTransaction((prev) => ({ ...prev, discount }));
    setIsEditingDiscount(false);
  };
  const handleDiscountCancel = () => {
    setTempDiscount(transaction.discount.toString());
    setIsEditingDiscount(false);
  };

  const handleDeliveryEdit = () => setIsEditingDelivery(true);
  const handleDeliverySave = () => {
    const deliveryCharge = parseFloat(tempDeliveryCharge) || 0;
    setTransaction((prev) => ({ ...prev, deliveryCharge }));
    setIsEditingDelivery(false);
  };
  const handleDeliveryCancel = () => {
    setTempDeliveryCharge(transaction.deliveryCharge.toString());
    setIsEditingDelivery(false);
  };

  const handlePaidEdit = () => setIsEditingPaid(true);
  const handlePaidSave = () => {
    const paid = parseFloat(tempPaidAmount) || 0;
    setTransaction((prev) => ({ ...prev, paid }));
    setIsEditingPaid(false);
  };
  const handlePaidCancel = () => {
    setTempPaidAmount(transaction.paid.toString());
    setIsEditingPaid(false);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate name
    if (!personalInfomation.name.trim()) {
      newErrors.name = "Customer name is required";
    } else if (personalInfomation.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Validate email if provided
    if (
      personalInfomation.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfomation.email)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate phone number
    if (!personalInfomation.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (
      !isValidBangladeshiMobileNumber(personalInfomation.phoneNumber)
    ) {
      newErrors.phoneNumber =
        "Please enter a valid Bangladeshi phone number (e.g., 01712345678)";
    }

    // Validate division
    //@ts-ignore
    if (!shippingAddress?.division?.id) {
      newErrors.division = "Please select a division";
    }

    // Validate district
    //@ts-ignore
    if (!shippingAddress?.district?.id) {
      newErrors.district = "Please select a district";
    }

    // Validate address
    if (!shippingAddress.address.trim()) {
      newErrors.address = "Delivery address is required";
    } else if (shippingAddress.address.trim().length < 10) {
      newErrors.address =
        "Please provide a detailed address (at least 10 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setIsValidating(true);

    if (!validateForm()) {
      toast.error("Please fix the errors before proceeding");
      setIsValidating(false);
      return;
    }

    try {
      // Update transaction remaining amount before submitting
      const finalTransaction = {
        ...transaction,
        remaining:
          transaction.totalPrice +
          transaction.deliveryCharge -
          transaction.discount -
          transaction.paid,
      };

      handleCustomerDataChange(
        {
          customer: personalInfomation,
          shipping: shippingAddress,
        },
        finalTransaction
      );
      toast.success("Customer information saved! Proceeding to review... 🚀");
    } catch (error) {
      toast.error("Failed to save customer information");
    } finally {
      setIsValidating(false);
    }
  };

  const handlePersonalInfomationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPersonalInformation({
      ...personalInfomation,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleShippingDivChange = (id: string, name: string) => {
    if (name === "division") {
      const filteredDivision = BDDivisions.filter(
        (division) => division?.id === id
      );
      if (filteredDivision.length > 0) {
        setShippingAddress({
          ...shippingAddress,
          division: filteredDivision[0],
          district: {}, // Reset district when division changes
        });
        setDistrictQuery(""); // Clear district search
        // Clear division error
        if (errors.division) {
          setErrors({ ...errors, division: "" });
        }
      }
    } else {
      const filteredDistrict = BDDistrictList.filter(
        (District) => District?.id === id
      );
      if (filteredDistrict.length > 0) {
        const newShippingData = {
          ...shippingAddress,
          district: filteredDistrict[0],
        };
        setShippingAddress(newShippingData);

        // Update delivery charge when district is selected
        updateDeliveryCharge(newShippingData);

        // Clear district error
        if (errors.district) {
          setErrors({ ...errors, district: "" });
        }
      }
    }
  };

  const handleAddressChange = (value: string) => {
    setShippingAddress({
      ...shippingAddress,
      address: value,
    });

    // Clear address error when user starts typing
    if (errors.address) {
      setErrors({ ...errors, address: "" });
    }
  };

  const renderCustomerPersonalInformation = () => {
    return (
      <Card className='border-2 border-blue-200 shadow-lg'>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-purple-50 border-b rounded-lg '>
          <CardTitle className='flex items-center gap-2 text-xl text-gray-800'>
            <User className='w-6 h-6 text-blue-600' />
            Customer Information
          </CardTitle>
          <CardDescription className='text-gray-600'>
            Enter customer details for order processing
          </CardDescription>
        </CardHeader>
        <CardContent className='p-6 space-y-6'>
          {/* Customer Name */}
          <div className='space-y-2'>
            <Label
              htmlFor='name'
              className='flex items-center gap-2 font-medium'>
              <UserCheck className='w-4 h-4 text-blue-600' />
              Customer Name *
            </Label>
            <div className='relative'>
              <User className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <Input
                type='text'
                id='name'
                name='name'
                placeholder='Enter customer full name'
                value={personalInfomation.name}
                onChange={handlePersonalInfomationChange}
                className={`pl-10 h-12 ${
                  errors.name
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-500"
                }`}
              />
              {personalInfomation.name && !errors.name && (
                <CheckCircle2 className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500' />
              )}
            </div>
            {errors.name && (
              <Alert className='border-red-200 bg-red-50'>
                <AlertCircle className='w-4 h-4 text-red-500' />
                <AlertDescription className='text-red-700 text-sm'>
                  {errors.name}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Email */}
          <div className='space-y-2'>
            <Label
              htmlFor='email'
              className='flex items-center gap-2 font-medium'>
              <Mail className='w-4 h-4 text-blue-600' />
              Email Address
              <Badge variant='outline' className='text-xs'>
                Optional
              </Badge>
            </Label>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <Input
                type='email'
                id='email'
                name='email'
                placeholder='customer@example.com'
                value={personalInfomation.email}
                onChange={handlePersonalInfomationChange}
                className={`pl-10 h-12 ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-500"
                }`}
              />
              {personalInfomation.email && !errors.email && (
                <CheckCircle2 className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500' />
              )}
            </div>
            {errors.email && (
              <Alert className='border-red-200 bg-red-50'>
                <AlertCircle className='w-4 h-4 text-red-500' />
                <AlertDescription className='text-red-700 text-sm'>
                  {errors.email}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Phone Number */}
          <div className='space-y-2'>
            <Label
              htmlFor='phone-number'
              className='flex items-center gap-2 font-medium'>
              <Phone className='w-4 h-4 text-blue-600' />
              Phone Number *
            </Label>
            <div className='relative'>
              <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <Input
                type='tel'
                id='phone-number'
                name='phoneNumber'
                placeholder='01712345678'
                value={personalInfomation.phoneNumber}
                onChange={handlePersonalInfomationChange}
                className={`pl-10 h-12 ${
                  errors.phoneNumber
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-500"
                }`}
              />
              {personalInfomation.phoneNumber &&
                !errors.phoneNumber &&
                isValidBangladeshiMobileNumber(
                  personalInfomation.phoneNumber
                ) && (
                  <CheckCircle2 className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500' />
                )}
            </div>
            {errors.phoneNumber && (
              <Alert className='border-red-200 bg-red-50'>
                <AlertCircle className='w-4 h-4 text-red-500' />
                <AlertDescription className='text-red-700 text-sm'>
                  {errors.phoneNumber}
                </AlertDescription>
              </Alert>
            )}
            {!errors.phoneNumber && (
              <p className='text-xs text-gray-500 flex items-center gap-1'>
                <Globe className='w-3 h-3' />
                Bangladesh mobile number format (11 digits starting with 01)
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  const renderCustomerShippingInformation = () => {
    //@ts-ignore
    const selectedDivision = shippingAddress?.division?.id || "";
    //@ts-ignore
    const selectedDistrict = shippingAddress?.district?.id || "";

    return (
      <Card className='border-2 border-green-200 shadow-lg'>
        <CardHeader className='bg-gradient-to-r from-green-50 to-blue-50 border-b rounded-lg'>
          <CardTitle className='flex items-center gap-2 text-xl text-gray-800'>
            <Truck className='w-6 h-6 text-green-600' />
            Shipping Information
          </CardTitle>
          <CardDescription className='text-gray-600'>
            Select delivery location and address details
          </CardDescription>
        </CardHeader>
        <CardContent className='p-6 space-y-6'>
          {/* Division Selection */}
          <div className='space-y-2'>
            <Label
              htmlFor='division'
              className='flex items-center gap-2 font-medium'>
              <MapPin className='w-4 h-4 text-green-600' />
              Division *
            </Label>
            <Select
              value={selectedDivision ? `${selectedDivision}` : ""}
              onValueChange={(value: string) => {
                handleShippingDivChange(value, "division");
              }}>
              <SelectTrigger
                className={`h-12 ${
                  errors.division ? "border-red-500" : "border-gray-200"
                }`}>
                <SelectValue
                  className='text-sidebar'
                  placeholder='Select Division'
                />
              </SelectTrigger>
              <SelectContent className='max-h-64'>
                <div className='p-2'>
                  <div className='relative'>
                    <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <Input
                      type='text'
                      className='pl-8'
                      placeholder='Search division...'
                      value={divisionQuery}
                      onChange={(e) => setDivisionQuery(e.target.value)}
                    />
                  </div>
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
                    className='hover:bg-blue-50'>
                    <div className='flex items-center justify-between w-full'>
                      <span>{`${division?.name}`}</span>
                      <Badge variant='outline' className='text-xs ml-2'>
                        {division?.bn_name}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.division && (
              <Alert className='border-red-200 bg-red-50'>
                <AlertCircle className='w-4 h-4 text-red-500' />
                <AlertDescription className='text-red-700 text-sm'>
                  {errors.division}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* District Selection */}
          {
            //@ts-ignore
            !!shippingAddress?.division?.id && (
              <div className='space-y-2'>
                <Label
                  htmlFor='district'
                  className='flex items-center gap-2 font-medium'>
                  <Home className='w-4 h-4 text-green-600' />
                  District *
                </Label>
                <Select
                  value={selectedDistrict ? `${selectedDistrict}` : ""}
                  onValueChange={(value: string) => {
                    handleShippingDivChange(value, "district");
                  }}>
                  <SelectTrigger
                    className={`h-12 ${
                      errors.district ? "border-red-500" : "border-gray-200"
                    }`}>
                    <SelectValue placeholder='Select District' />
                  </SelectTrigger>
                  <SelectContent className='max-h-64'>
                    <div className='p-2'>
                      <div className='relative'>
                        <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                        <Input
                          type='text'
                          className='pl-8'
                          placeholder='Search district...'
                          value={districtQuery}
                          onChange={(e) => setDistrictQuery(e.target.value)}
                        />
                      </div>
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
                        className='hover:bg-green-50'>
                        <div className='flex items-center justify-between w-full'>
                          <span>{`${district?.name}`}</span>
                          <Badge variant='outline' className='text-xs ml-2'>
                            {district?.bn_name}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.district && (
                  <Alert className='border-red-200 bg-red-50'>
                    <AlertCircle className='w-4 h-4 text-red-500' />
                    <AlertDescription className='text-red-700 text-sm'>
                      {errors.district}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )
          }

          {/* Full Address */}
          <div className='space-y-2'>
            <Label
              htmlFor='address'
              className='flex items-center gap-2 font-medium'>
              <MapPin className='w-4 h-4 text-green-600' />
              Full Delivery Address *
            </Label>
            <Textarea
              id='address'
              name='address'
              placeholder='Enter detailed address including house number, road, area, landmarks, etc.'
              value={shippingAddress.address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className={`min-h-24 resize-none ${
                errors.address
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 focus:border-green-500"
              }`}
              rows={3}
            />
            <div className='flex items-center justify-between'>
              {errors.address ? (
                <Alert className='border-red-200 bg-red-50 flex-1'>
                  <AlertCircle className='w-4 h-4 text-red-500' />
                  <AlertDescription className='text-red-700 text-sm'>
                    {errors.address}
                  </AlertDescription>
                </Alert>
              ) : (
                <p className='text-xs text-gray-500'>
                  Be specific to ensure successful delivery
                </p>
              )}
              <span className='text-xs text-gray-400 ml-2'>
                {shippingAddress.address.length}/500
              </span>
            </div>
          </div>

          {/* Location Summary */}
          {
            //@ts-ignore
            selectedDivision && selectedDistrict && (
              <div className='mt-4 p-4 bg-green-50 rounded-lg border border-green-200'>
                <h4 className='font-medium text-green-800 mb-2 flex items-center gap-2'>
                  <CheckCircle2 className='w-4 h-4' />
                  Selected Delivery Location
                </h4>
                <div className='text-sm text-green-700'>
                  <p>
                    <strong>Division:</strong>{" "}
                    {
                      //@ts-ignore
                      shippingAddress.division.name
                    }{" "}
                    (
                    {
                      //@ts-ignore
                      shippingAddress.division.bn_name
                    }
                    )
                  </p>
                  <p>
                    <strong>District:</strong>{" "}
                    {
                      //@ts-ignore
                      shippingAddress.district.name
                    }{" "}
                    (
                    {
                      //@ts-ignore
                      shippingAddress.district.bn_name
                    }
                    )
                  </p>
                </div>
              </div>
            )
          }
        </CardContent>
      </Card>
    );
  };

  const renderTransactionControls = () => {
    const isDisabled = transaction.totalPrice < 1;
    const grandTotal =
      transaction.totalPrice +
      transaction.deliveryCharge -
      transaction.discount;

    return (
      <Card className='border-2 border-blue-200 shadow-sm'>
        <CardHeader className='bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg m-2'>
          <CardTitle className='flex items-center gap-2 text-white'>
            <Calculator className='w-5 h-5' />
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          {/* Desktop View - Full Input Fields */}
          <div className='hidden md:block'>
            <div className='space-y-5'>
              {/* Summary Header */}
              <div className='flex items-center gap-3 pb-3 border-b border-slate-200'>
                <div className='w-8 h-8 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center'>
                  <Calculator className='w-4 h-4 text-slate-600' />
                </div>
                <h3 className='font-semibold text-slate-800'>Order Summary</h3>
              </div>

              {/* Subtotal */}
              <div className='flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200'>
                <span className='font-medium text-slate-700'>Subtotal</span>
                <span className='text-lg font-bold text-slate-800'>
                  ৳{transaction.totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Discount */}
              <div className='space-y-3'>
                <Label className='flex items-center gap-2 text-sm font-medium text-slate-700'>
                  <div className='w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center'>
                    <Percent className='w-3 h-3 text-amber-600' />
                  </div>
                  Discount Amount
                </Label>
                <div className='relative'>
                  <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
                  <Input
                    type='number'
                    max={transaction.totalPrice}
                    disabled={isDisabled}
                    value={
                      transaction.discount === 0 ? "" : transaction.discount
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      const discount =
                        value === "" ? 0 : Math.max(0, Number(value));

                      setTransaction({
                        ...transaction,
                        discount,
                      });
                    }}
                    className='pl-10 bg-white border-slate-200 focus:border-amber-400 focus:ring-amber-100'
                    placeholder='0.00'
                  />
                </div>
              </div>

              {/* Delivery Charge */}
              <div className='space-y-3'>
                <Label className='flex items-center gap-2 text-sm font-medium text-slate-700'>
                  <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center'>
                    <Truck className='w-3 h-3 text-blue-600' />
                  </div>
                  Delivery Charge
                </Label>
                <div className='relative'>
                  <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
                  <Input
                    type='number'
                    disabled={isDisabled}
                    value={
                      transaction.deliveryCharge === 0
                        ? ""
                        : transaction.deliveryCharge
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      const deliveryCharge =
                        value === "" ? 0 : Math.max(0, Number(value));

                      setTransaction({
                        ...transaction,
                        deliveryCharge,
                      });
                    }}
                    className='pl-10 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                    placeholder='0.00'
                  />
                </div>
              </div>

              {/* Paid Amount */}
              <div className='space-y-3'>
                <Label className='flex items-center gap-2 text-sm font-medium text-slate-700'>
                  <div className='w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center'>
                    <CreditCard className='w-3 h-3 text-emerald-600' />
                  </div>
                  Paid Amount
                </Label>
                <div className='relative'>
                  <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
                  <Input
                    type='number'
                    max={transaction.totalPrice + transaction.deliveryCharge}
                    disabled={isDisabled}
                    value={transaction.paid === 0 ? "" : transaction.paid}
                    onChange={(e) => {
                      const value = e.target.value;
                      const paid =
                        value === "" ? 0 : Math.max(0, Number(value));

                      setTransaction({
                        ...transaction,
                        paid,
                      });
                    }}
                    className='pl-10 bg-white border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
                    placeholder='0.00'
                  />
                </div>
              </div>

              <Separator className='my-5 border-slate-200' />

              {/* Summary Cards */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 rounded-xl border border-slate-200 shadow-sm'>
                  <div className='flex items-center gap-2'>
                    <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center'>
                      <Receipt className='w-3 h-3 text-blue-600' />
                    </div>
                    <span className='font-semibold text-slate-700'>
                      Grand Total
                    </span>
                  </div>
                  <span className='text-xl font-bold text-slate-800'>
                    ৳{grandTotal.toFixed(2)}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between p-4 rounded-xl border shadow-sm ${
                    grandTotal - transaction.paid > 0
                      ? "bg-gradient-to-r from-rose-50 via-orange-50 to-rose-50 border-rose-200"
                      : "bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border-emerald-200"
                  }`}>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        grandTotal - transaction.paid > 0
                          ? "bg-orange-100"
                          : "bg-emerald-100"
                      }`}>
                      {grandTotal - transaction.paid > 0 ? (
                        <AlertCircle className='w-3 h-3 text-orange-600' />
                      ) : (
                        <CheckCircle2 className='w-3 h-3 text-emerald-600' />
                      )}
                    </div>
                    <span className='font-semibold text-slate-700'>
                      {grandTotal - transaction.paid > 0
                        ? "Due Amount"
                        : "Fully Paid"}
                    </span>
                  </div>
                  <span
                    className={`text-xl font-bold ${
                      grandTotal - transaction.paid > 0
                        ? "text-orange-700"
                        : "text-emerald-700"
                    }`}>
                    ৳{(grandTotal - transaction.paid).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Status Indicator */}
              {transaction.totalPrice > 0 && (
                <div
                  className={`p-3 rounded-lg border-l-4 ${
                    grandTotal - transaction.paid === 0
                      ? "bg-emerald-50 border-l-emerald-500 border border-emerald-200"
                      : transaction.paid > 0
                      ? "bg-amber-50 border-l-amber-500 border border-amber-200"
                      : "bg-slate-50 border-l-slate-400 border border-slate-200"
                  }`}>
                  <div className='flex items-center gap-2'>
                    {grandTotal - transaction.paid === 0 ? (
                      <>
                        <CheckCircle2 className='w-4 h-4 text-emerald-600' />
                        <span className='text-sm font-medium text-emerald-800'>
                          Payment Complete
                        </span>
                      </>
                    ) : transaction.paid > 0 ? (
                      <>
                        <AlertCircle className='w-4 h-4 text-amber-600' />
                        <span className='text-sm font-medium text-amber-800'>
                          Partial Payment
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className='w-4 h-4 text-slate-500' />
                        <span className='text-sm font-medium text-slate-600'>
                          Pending Payment
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile View - Inline Editing */}
          <div className='block md:hidden'>
            <div className='space-y-4'>
              {/* Order Summary */}
              <div className='grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border'>
                <div className='text-center'>
                  <div className='text-lg font-bold text-blue-600'>
                    {transaction.totalPrice.toFixed(2)}
                  </div>
                  <div className='text-xs text-gray-600'>Subtotal (৳)</div>
                </div>
                <div className='text-center'>
                  <div className='text-lg font-bold text-green-600'>
                    {grandTotal.toFixed(2)}
                  </div>
                  <div className='text-xs text-gray-600'>Final Total (৳)</div>
                </div>
              </div>

              {/* Mobile Transaction Controls */}
              <div className='space-y-3 p-3 bg-gray-50 rounded-lg border'>
                {/* Discount Row */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Percent className='h-4 w-4 text-orange-600' />
                    <span className='text-sm font-medium text-gray-700'>
                      Discount
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    {isEditingDiscount ? (
                      <div className='flex items-center gap-2'>
                        <Input
                          type='number'
                          value={tempDiscount}
                          onChange={(e) => setTempDiscount(e.target.value)}
                          className='w-16 h-7 text-sm'
                          placeholder='0'
                        />
                        <Button
                          size='sm'
                          onClick={handleDiscountSave}
                          className='h-7 px-2 text-xs bg-green-600 hover:bg-green-700'>
                          ✓
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={handleDiscountCancel}
                          className='h-7 px-2 text-xs'>
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-semibold text-orange-700'>
                          ৳{transaction.discount.toFixed(2)}
                        </span>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={handleDiscountEdit}
                          className='h-6 w-6 p-0 rounded-full hover:bg-orange-100'>
                          <Edit3 className='h-3 w-3 text-orange-600' />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Charge Row */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Truck className='h-4 w-4 text-blue-600' />
                    <span className='text-sm font-medium text-gray-700'>
                      Delivery
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    {isEditingDelivery ? (
                      <div className='flex items-center gap-2'>
                        <Input
                          type='number'
                          value={tempDeliveryCharge}
                          onChange={(e) =>
                            setTempDeliveryCharge(e.target.value)
                          }
                          className='w-16 h-7 text-sm'
                          placeholder='100'
                        />
                        <Button
                          size='sm'
                          onClick={handleDeliverySave}
                          className='h-7 px-2 text-xs bg-green-600 hover:bg-green-700'>
                          ✓
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={handleDeliveryCancel}
                          className='h-7 px-2 text-xs'>
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-semibold text-blue-700'>
                          ৳{transaction.deliveryCharge.toFixed(2)}
                        </span>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={handleDeliveryEdit}
                          className='h-6 w-6 p-0 rounded-full hover:bg-blue-100'>
                          <Edit3 className='h-3 w-3 text-blue-600' />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Paid Amount Row */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <CreditCard className='h-4 w-4 text-green-600' />
                    <span className='text-sm font-medium text-gray-700'>
                      Paid Amount
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    {isEditingPaid ? (
                      <div className='flex items-center gap-2'>
                        <Input
                          type='number'
                          value={tempPaidAmount}
                          onChange={(e) => setTempPaidAmount(e.target.value)}
                          className='w-16 h-7 text-sm'
                          placeholder='0'
                        />
                        <Button
                          size='sm'
                          onClick={handlePaidSave}
                          className='h-7 px-2 text-xs bg-green-600 hover:bg-green-700'>
                          ✓
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={handlePaidCancel}
                          className='h-7 px-2 text-xs'>
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-semibold text-green-700'>
                          ৳{transaction.paid.toFixed(2)}
                        </span>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={handlePaidEdit}
                          className='h-6 w-6 p-0 rounded-full hover:bg-green-100'>
                          <Edit3 className='h-3 w-3 text-green-600' />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Remaining Balance */}
                <div
                  className={`flex items-center justify-between pt-2 px-2 py-1 rounded border-t border-gray-200 ${
                    grandTotal - transaction.paid > 0
                      ? "bg-red-50 border border-red-200"
                      : "bg-green-50 border border-green-200"
                  }`}>
                  <span
                    className={`text-sm font-bold ${
                      grandTotal - transaction.paid > 0
                        ? "text-red-700"
                        : "text-green-700"
                    }`}>
                    Remaining Balance
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      grandTotal - transaction.paid > 0
                        ? "text-red-700"
                        : "text-green-700"
                    }`}>
                    ৳{(grandTotal - transaction.paid).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Form Progress Indicator */}
      <div className='bg-white rounded-lg p-4 border-2 border-gray-200 hidden md:block'>
        <div className='flex items-center gap-4'>
          <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
            <User className='w-6 h-6 text-blue-600' />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              Customer Details
            </h2>
            <p className='text-gray-600'>
              Complete customer and shipping information
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div>{renderCustomerPersonalInformation()}</div>
        <div>{renderCustomerShippingInformation()}</div>
      </div>

      {/* Transaction Controls */}
      {renderTransactionControls()}

      {/* Action Buttons */}
      <Card className='border-2 border-gray-200'>
        <CardFooter className='bg-gray-50 border-t p-6 rounded-lg'>
          <div className='flex flex-col sm:flex-row gap-3 w-full'>
            <Button
              variant='outline'
              onClick={() => {
                setPersonalInformation(defaultPersonalInformation);
                setShippingAddress(defaultShippingAddress);
                setErrors({});
                setDivisionQuery("");
                setDistrictQuery("");
                toast.success("Form reset successfully");
              }}
              className='flex items-center gap-2 border-gray-300 hover:bg-gray-50'
              disabled={isValidating}>
              <RotateCcw className='w-4 h-4' />
              Reset Form
            </Button>

            <Button
              variant='outline'
              onClick={() => {
                handleBack();
              }}
              className='flex items-center gap-2 border-gray-300 hover:bg-gray-50'
              disabled={isValidating}>
              <ArrowLeft className='w-4 h-4' />
              Back to Products
            </Button>

            <Button
              onClick={() => handleSubmit()}
              disabled={isValidating}
              className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none sm:ml-auto'
              size='lg'>
              {isValidating ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Validating...
                </>
              ) : (
                <>
                  <ArrowRight className='w-5 h-5' />
                  Continue to Review
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CustomerInformation;
