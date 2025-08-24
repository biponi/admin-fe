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
} from "lucide-react";
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isValidating, setIsValidating] = useState(false);

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
      handleCustomerDataChange({
        customer: personalInfomation,
        shipping: shippingAddress,
      });
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
        setShippingAddress({
          ...shippingAddress,
          district: filteredDistrict[0],
        });
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
        <CardHeader className='bg-gradient-to-r from-blue-50 to-purple-50 border-b rounded-lg'>
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
  return (
    <div className='space-y-6'>
      {/* Form Progress Indicator */}
      <div className='bg-white rounded-lg p-4 border-2 border-gray-200'>
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
