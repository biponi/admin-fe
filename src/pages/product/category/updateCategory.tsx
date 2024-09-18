import { ReactElement, useEffect, useState } from "react";
import { ICategory, IChangeEvent, ICreateCategory } from "../interface";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Switch } from "../../../components/ui/switch";
import PlaceHolderImage from "../../../assets/placeholder.svg";
import { Button } from "../../../components/ui/button";

interface Props {
  open?: boolean;
  isNewCategory: boolean;
  children?: ReactElement;
  handleOpenChange: (open: boolean) => void;
  category?: ICategory | ICreateCategory | null;
  loading: boolean;
  createCategory: (data: ICreateCategory) => Promise<boolean>;
  editExistingCategory: (data: ICategory) => Promise<boolean>;
}

const defaultCategory = {
  name: "",
  img: "",
  description: "",
  discount: 0.0,
  active: true,
};

const UpdateCategory: React.FC<Props> = ({
  open = false,
  isNewCategory,
  category = null,
  children = null,
  handleOpenChange,
  loading,
  createCategory,
  editExistingCategory,
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [existingCategory, setExistingCategory] = useState<
    ICategory | ICreateCategory | null
  >(null);

  useEffect(() => {
    return setImage(null);
  }, []);

  useEffect(() => {
    if (!!category) {
      setExistingCategory(category);
    }
  }, [category]);

  const handleSubmit = async () => {
    if (isNewCategory) {
      if (!!existingCategory) {
        const res = await createCategory(
          !!image && image !== null
            ? { ...existingCategory, img: image }
            : existingCategory
        );
        if (!!res) handleOpenChange(false);
      }
    } else {
      //@ts-ignore
      if (!!existingCategory?.id) {
        //@ts-ignore
        const res = await editExistingCategory({
          //@ts-ignore
          ...(!!image && image !== null
            ? { ...existingCategory, img: image }
            : existingCategory),
        });
        if (!!res) handleOpenChange(false);
      }
    }
  };

  const handleChange = (e: IChangeEvent) => {
    const { name, value } = e.target;
    if (isNewCategory) {
      const updatedCategoryData = !!existingCategory
        ? { ...existingCategory, [name]: value }
        : { ...defaultCategory, [name]: value };
      setExistingCategory(updatedCategoryData);
    } else if (!!existingCategory) {
      setExistingCategory({ ...existingCategory, [name]: value });
    }
  };

  const renderFormView = () => {
    return (
      <Card>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="col-span-1 sm:col-span-2 ">
              <div className="grid w-full max-w-sm items-center gap-1.5 my-5">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  name="name"
                  onChange={handleChange}
                  placeholder="Enter a name"
                  value={existingCategory?.name ?? ""}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5 my-5">
                <Label htmlFor="discount">Description</Label>
                <Input
                  type="text"
                  name="description"
                  placeholder="Enter a description"
                  onChange={handleChange}
                  value={existingCategory?.description ?? ""}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5 my-5">
                <Label htmlFor="discount">Discount</Label>
                <Input
                  type="number"
                  name="discount"
                  placeholder="0.00"
                  onChange={handleChange}
                  value={existingCategory?.discount ?? ""}
                />
              </div>
              <div className="flex items-center space-x-2 my-2">
                <Switch
                  id="airplane-mode"
                  checked={existingCategory?.active ?? false}
                  onCheckedChange={(value) => {
                    if (!!existingCategory) {
                      setExistingCategory({
                        ...existingCategory,
                        active: value,
                      });
                    }
                  }}
                />
                <Label htmlFor="airplane-mode">Activate</Label>
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5 my-5">
                <Label htmlFor="picture">Picture</Label>
                <Input
                  id="picture"
                  type="file"
                  onChange={(e) => {
                    //@ts-ignore
                    const file = e.target.files[0];
                    if (!!existingCategory && !!file) setImage(file);
                  }}
                />
              </div>
            </div>
            <div className="w-full mt-5">
              <Card>
                <CardHeader>
                  <CardTitle>Category Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <img
                      alt="Product_image"
                      className="aspect-square w-full rounded-md object-fill"
                      height="200"
                      src={
                        !!existingCategory &&
                        !!existingCategory?.img &&
                        typeof existingCategory?.img === "string"
                          ? existingCategory?.img
                          : !!image
                          ? URL.createObjectURL(image)
                          : PlaceHolderImage
                      }
                      width="200"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(open) => handleOpenChange(open)}>
      {!!children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className=" w-[90vw] max-w-[95vw] sm:w-[60vw] sm:max-w-[80vw] ">
        <DialogHeader>
          <DialogTitle>
            {isNewCategory ? "Create a category" : "Update category"}
          </DialogTitle>
          <DialogDescription>
            {`Make changes to your category here. Click ${
              isNewCategory ? "create" : "update"
            } when you're done.`}
          </DialogDescription>
        </DialogHeader>
        {renderFormView()}
        <DialogFooter>
          <Button
            disabled={!!!existingCategory || loading}
            onClick={() => handleSubmit()}
          >
            {isNewCategory ? "Create" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCategory;
