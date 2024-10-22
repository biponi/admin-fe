import React, { useRef, useState } from "react";
import { useCreateCampaign } from "../hooks/useCreateCampaign";
import { toast } from "react-hot-toast";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { Upload } from "lucide-react";
import placeHolder from "../../../assets/placeholder.svg";
import { DateTimePicker } from "../../../components/customComponent/DateTimePicker";
import MainView from "../../../coreComponents/mainView";
import SelectProductForCampaign from "./selectProducts";

const CreateCampaignForm: React.FC = () => {
  const { createCampaign, loading } = useCreateCampaign();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<string>("-");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [active, setActive] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [step, setStep] = useState(1);

  const fileRef = useRef(null);

  // Image handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Validation
    if (!products.length || products?.length < 3) {
      toast.error("Please select at least three products.");
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("products", JSON.stringify(products));
    formData.append("discount", discount.toString());
    formData.append("discountType", discountType);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("active", active.toString());
    if (image) {
      formData.append("image", image);
    }

    // API call
    const response = await createCampaign(formData);
    if (response) {
      toast.success("Campaign created successfully!");
    }
  };

  const handleStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!title || !description || !startDate || !endDate) {
        toast.error("Please fill all the required fields.");
        return;
      }
      setStep(2);
    } else setStep(1);
  };

  const renderCampaignDetailsView = () => {
    return (
      <div className="w-full sm:w-[95vw]">
        <div className="mx-auto grid max-w-full flex-1 auto-rows-max gap-4">
          <form onSubmit={handleStep} className="space-y-4">
            <div className="grid gap-2 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-4">
              <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Card x-chunk="dashboard-07-chunk-2">
                      <CardHeader>Campaign Details</CardHeader>
                      <CardContent>
                        <div className="grid gap-6">
                          <div className="grid gap-3">
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              type="text"
                              placeholder="Enter campaign title"
                              value={title}
                              className="w-full"
                              defaultValue=""
                              onChange={(e) => setTitle(e.target.value)}
                              required
                            />
                          </div>

                          <div className="grid gap-3">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              placeholder="Enter campaign description"
                              value={description}
                              className="w-full"
                              defaultValue=""
                              rows={5}
                              onChange={(e) => setDescription(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className="overflow-hidden mt-4"
                      x-chunk="dashboard-07-chunk-4"
                    >
                      <CardHeader>
                        <CardTitle>
                          <div className="flex justify-between items-center">
                            <h3 className="text-md font-semibold text-gray-800">
                              Campaign Image
                            </h3>
                            <div className="ml-auto">
                              <Input
                                id="picture"
                                type="file"
                                className="hidden"
                                ref={fileRef}
                                name="image"
                                accept=".png, .jpg, .jpeg"
                                onChange={handleImageChange}
                              />
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      if (!!fileRef) {
                                        //@ts-ignore
                                        fileRef.current.click();
                                      }
                                    }}
                                  >
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={5}>
                                  Change Image
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </CardTitle>
                        <CardDescription>
                          This is a visual representation of the Campaign Image
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2">
                          <img
                            alt="Product_image"
                            className="rounded-md object-fill w-full h-64"
                            src={!!imagePreview ? imagePreview : placeHolder}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
              <div className="grid auto-rows-max items-start gap-4 lg:gap-4">
                <Card x-chunk="dashboard-07-chunk-2">
                  <CardHeader>
                    <CardTitle>Campaign Discount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="grid gap-3">
                        <Label htmlFor="discount-type">Discount Type</Label>
                        <Select
                          onValueChange={(value) => {
                            setDiscountType(value);
                          }}
                        >
                          <SelectTrigger
                            id="discount-type"
                            aria-label="Select Discount Type"
                          >
                            <SelectValue placeholder="Select Discount Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="%">Percentage (%)</SelectItem>
                            <SelectItem value="-">Fixed Amount (-)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="discount">Discount</Label>
                        <Input
                          id="discount"
                          name="discount"
                          type="number"
                          value={discount}
                          className="w-full"
                          defaultValue=""
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className=" grid grid-cols-1 gap-2  md:my-4">
                  <Card
                    x-chunk="dashboard-07-chunk-4"
                    className="col-span-1 md:col-span-2 w-full"
                  >
                    <CardHeader>
                      <CardTitle>Campaign Start & End Date-time</CardTitle>
                    </CardHeader>
                    <CardContent className="w-full mt-6 mb-2">
                      <div className="grid gap-2 mb-2">
                        <div className="grid gap-3">
                          <Label className="mb-1">Start</Label>
                          <DateTimePicker
                            onChange={(value: any) => setStartDate(value)}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <div className="grid gap-3">
                          <Label className="mb-1">End</Label>
                          <DateTimePicker
                            onChange={(value: any) => setEndDate(value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card x-chunk="dashboard-07-chunk-3" className="col-span-1">
                    <CardHeader>
                      <CardTitle>Campaign Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6">
                        <div className="grid gap-3">
                          <Label>Status</Label>
                          <Select
                            onValueChange={(value) => {
                              setActive(Boolean(value));
                            }}
                          >
                            <SelectTrigger
                              id="status"
                              aria-label="Select status"
                            >
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value="true"
                                className="text-green-500 "
                              >
                                Active
                              </SelectItem>
                              <SelectItem
                                value="false"
                                className="text-red-500"
                              >
                                Inactive
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <Button size="sm" type="submit" disabled={loading}>
                      Select Products
                    </Button>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderProductListView = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Products for campaign</CardTitle>
          <CardDescription>
            <div className="flex justify-between items-end">
              <span className="text-sm font-semibold">
                This campaign discount will be added to the selected products.
              </span>
              <div className="flex justify-center items-center">
                <Button
                  variant={"secondary"}
                  className="mr-2"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {" "}
                  {loading ? "Creating" : " Create Campaign"}
                </Button>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SelectProductForCampaign
            productList={[]}
            updateProductList={(list: string[]) => setProducts(list)}
          />
        </CardContent>
      </Card>
    );
  };

  const renderMainView = () => {
    return (
      <div>
        {step === 1 && renderCampaignDetailsView()}
        {step === 2 && (
          <div className="w-full sm:w-[95vw] my-2">
            {renderProductListView()}
          </div>
        )}
      </div>
    );
  };

  return <MainView title="Create a campaign">{renderMainView()}</MainView>;
};

export default CreateCampaignForm;
