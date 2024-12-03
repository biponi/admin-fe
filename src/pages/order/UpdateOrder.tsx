import { useEffect, useState } from "react";
import useOrder from "./hooks/useOrder";
import useDebounce from "../../customHook/useDebounce";
import {
  Card,
  CardContent,
  CardDescription,
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
import { IOrderProduct, IProduct, IVariation } from "../product/interface";
import PlaceHolderImage from "../../assets/placeholder.svg";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../components/ui/use-toast";
import { Input } from "../../components/ui/input";
import { Trash } from "lucide-react";
import EmptyProductCard from "../../common/EmptyProductCard";
import { IOrder, ITransection } from "./interface";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";

const defaultTransaction = {
  totalPrice: 0.0,
  paid: 0.0,
  remaining: 0.0,
  discount: 0.0,
  deliveryCharge: 100.0,
};

interface Props {
  order: IOrder;
  handleBack: () => void;
  handleProductDataSubmit: (
    productData: IOrderProduct[],
    transectionData: ITransection
  ) => void;
}

const UpdateOrderProductList: React.FC<Props> = ({
  order,
  handleBack,
  handleProductDataSubmit,
}) => {
  const { getProductByQuery, getProductsByIdList } = useOrder();
  const [query, setQuery] = useState("");
  const { toast } = useToast();
  const [products, setProducts] = useState<IProduct[] | []>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[] | []>([]);

  const [transection, setTransection] = useState(defaultTransaction);

  const getSelectedProductList = async () => {
    const productsX = await getProductsByIdList(order);
    if (!productsX) return;

    const pxSelectedList: any[] = [];

    order?.products?.forEach((product) => {
      const { variation, ...productInfo } = product;
      const matchedProduct = productsX.find((px) => px?.id === product?.id);
      if (!matchedProduct) return;

      const commonData = {
        ...matchedProduct,
        ...productInfo,
        selectedQuantity: product?.quantity,
        totalPrice: product?.totalPrice,
      };

      if (product.hasVariation) {
        const selectedVariant = matchedProduct.variation.find(
          (variant) => variant?.id === variation?.id
        );

        if (selectedVariant) {
          pxSelectedList.push({
            ...commonData,
            selectedVariant,
            quantity: matchedProduct?.quantity + product?.quantity,
          });
        } else {
          toast({ title: "No available variant found" });
        }
      } else {
        pxSelectedList.push({
          ...commonData,
          quantity: matchedProduct?.quantity + product?.quantity,
        });
      }
    });

    setSelectedProducts(pxSelectedList);
  };

  useEffect(() => {
    if (!!order) {
      getSelectedProductList();
      setTransection({
        totalPrice: order?.totalPrice,
        discount: order?.discount,
        deliveryCharge: order?.deliveryCharge,
        remaining: order?.remaining,
        paid: order?.paid,
      });
    }
    //eslint-disable-next-line
  }, [order]);

  useEffect(() => {
    if (!!selectedProducts) {
      let totalPrice = 0;
      let discount = 0;
      selectedProducts.forEach((product) => {
        totalPrice = Number(totalPrice) + Number(product.totalPrice);
        discount = Number(discount) + Number(product.discount);
      });
      const deliveryCharge = !!order.deliveryCharge
        ? order?.deliveryCharge
        : transection?.deliveryCharge;
      setTransection({
        ...transection,
        totalPrice,
        discount,
        deliveryCharge,
        remaining:
          totalPrice +
          Number(deliveryCharge) -
          (Number(transection.paid) || 0 + Number(discount) || 0),
      });
    }
    //eslint-disable-next-line
  }, [selectedProducts]);

  const debounce = useDebounce(query, 500);

  const fetchProduct = async () => {
    const products = await getProductByQuery(query);
    setProducts(products);
  };
  useEffect(() => {
    fetchProduct();
    //eslint-disable-next-line
  }, [debounce]);

  const handleSelect = (product: IProduct) => {
    if (!!product.hasVariation) {
      const variant = product.variation.filter(
        (variant) => variant?.quantity > 0
      );
      if (variant.length > 0)
        setSelectedProducts([
          ...selectedProducts,
          {
            ...product,
            selectedQuantity: 1,
            selectedVariant: variant[0],
            totalPrice: variant[0].unitPrice * 1,
          },
        ]);
      else {
        toast({ title: "No Available variant found" });
      }
    } else {
      setSelectedProducts([
        ...selectedProducts,
        { ...product, selectedQuantity: 1, totalPrice: product.unitPrice * 1 },
      ]);
    }
  };

  const renderProductList = () => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden sm:inline-block">#</TableHead>
            <TableHead className="hidden sm:w-[100px] sm:inline-block">
              Image
            </TableHead>
            <TableHead className="hidden sm:truncate sm:inline-block">
              Name
            </TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        {(!products || products.length === 0) && (
          <TableBody>
            <TableRow>
              <TableCell colSpan={6}>
                <EmptyProductCard />
              </TableCell>
            </TableRow>
          </TableBody>
        )}
        {!!products && products.length > 0 && (
          <TableBody>
            {!!products &&
              products.map((product: IProduct, index: number) => (
                <TableRow key={product?.id}>
                  <TableCell className="hidden sm:inline-block">
                    {Number(index) + 1}
                  </TableCell>
                  <TableCell className="hidden sm:w-[100px] sm:inline-block">
                    <img
                      alt="img"
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={
                        !!product?.thumbnail
                          ? product.thumbnail
                          : PlaceHolderImage
                      }
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="hidden sm:inline-block sm:truncate">
                    {product?.name}
                  </TableCell>
                  <TableCell>{product?.sku}</TableCell>
                  <TableCell className="w-[30px] sm:w-[20px] sm:truncate">
                    {product?.quantity}
                  </TableCell>
                  <TableCell>{product?.unitPrice}</TableCell>
                  <TableCell className="flex justify-end items-center">
                    {product?.quantity > 0 && product?.active ? (
                      <Button onClick={() => handleSelect(product)}>
                        Select
                      </Button>
                    ) : (
                      <Badge variant={"destructive"}>
                        {!product?.active ? "Inactive" : "Out Of Stock"}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        )}
      </Table>
    );
  };

  const renderVariantMenu = (
    type: string,
    index: number,
    list: string[],
    selected: string
  ) => {
    const handleVariantChange = (value: string, vType: "color" | "size") => {
      const selectedProduct = selectedProducts[index];

      if (!selectedProduct || !selectedProduct.selectedVariant) {
        return;
      }

      const rType = vType === "color" ? "size" : "color";
      const selectedRev = selectedProduct.selectedVariant[rType] ?? "";

      const filteredVariants = selectedProduct.variation.filter(
        (variant: IVariation) => {
          return (
            variant[vType] === value &&
            (variant[rType] === selectedRev || variant.quantity > 0)
          );
        }
      );

      if (filteredVariants.length > 0) {
        const selectedVariant = filteredVariants[0];
        selectedProduct.selectedVariant = selectedVariant;
        selectedProduct.selectedQuantity = Math.min(
          selectedProduct.selectedQuantity,
          selectedVariant.quantity
        );
        selectedProduct.totalPrice =
          selectedProduct.selectedQuantity * selectedVariant.unitPrice;
        setSelectedProducts([...selectedProducts]);
      } else {
        toast({
          title: "This variant is out of stock",
          variant: "destructive",
        });
      }
    };
    return (
      <Select
        value={selected}
        onValueChange={(value: string) =>
          //@ts-ignore
          handleVariantChange(value, type.toLowerCase())
        }
      >
        <SelectTrigger className="w-[80px]">
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

    if (!!product?.variation)
      for (const item of product.variation) {
        if (!!item.color) distinctColors.add(item.color);
        if (!!item.size) distinctSizes.add(item.size);
      }

    const uniqueColors: string[] = Array.from(distinctColors) ?? []; // Convert Set to array
    const uniqueSizes: string[] = Array.from(distinctSizes) ?? [];
    return (
      <TableRow key={`${product?.id}`}>
        <TableCell className="hidden sm:inline-block">
          {
            <img
              alt="img"
              className="aspect-square rounded-md object-cover"
              height="64"
              src={!!product?.thumbnail ? product.thumbnail : PlaceHolderImage}
              width="64"
            />
          }
        </TableCell>
        <TableCell>
          {product?.name.length > 15
            ? product.name.slice(0, 15) + "..."
            : product.name}
        </TableCell>
        <TableCell>
          {!!product?.hasVariation
            ? renderVariantMenu(
                "color",
                index,
                uniqueColors,
                product.selectedVariant?.color ?? ""
              )
            : "N/A"}
        </TableCell>
        <TableCell>
          {!!product?.hasVariation
            ? renderVariantMenu(
                "size",
                index,
                uniqueSizes,
                product.selectedVariant?.size ?? ""
              )
            : "N/A"}
        </TableCell>
        <TableCell>
          <Input
            type="number"
            value={product?.selectedQuantity}
            onChange={(e) => {
              const num = Number(e.target.value);
              if (
                num > 0 &&
                num <=
                  (product?.hasVariation
                    ? product?.selectedVariant?.quantity ?? 0
                    : product?.quantity)
              ) {
                selectedProducts[index].discount =
                  num * (product?.discount / product?.selectedQuantity);
                selectedProducts[index].selectedQuantity = num;
                selectedProducts[index].totalPrice =
                  num *
                  (product?.hasVariation
                    ? product?.selectedVariant?.unitPrice ?? 0
                    : product?.unitPrice);

                setSelectedProducts([...selectedProducts]);
              }
            }}
          />
        </TableCell>
        <TableCell className="hidden sm:inline-block">
          {product?.totalPrice}
        </TableCell>
        <TableCell>
          <Trash
            className="text-red-500 w-4 h-4 cursor-pointer"
            onClick={() =>
              setSelectedProducts(
                selectedProducts.filter((_, i) => i !== index)
              )
            }
          />
        </TableCell>
      </TableRow>
    );
  };

  const renderSelectedProductList = () => {
    return (
      <Table className="max-h-[50vh] overflow-y-auto">
        <TableHeader>
          <TableRow>
            <TableHead className="hidden sm:inline-block">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>quantity</TableHead>
            <TableHead className="hidden sm:inline-block">
              Total Price (No Discount)
            </TableHead>
            <TableHead className="text-right">
              <Trash className="w-5 h-5" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(!selectedProducts || selectedProducts.length < 1) && (
            <TableRow>
              <TableCell colSpan={7}>
                <EmptyProductCard text="Please select a product" />
              </TableCell>
            </TableRow>
          )}
          {!!selectedProducts &&
            selectedProducts.map((product: IOrderProduct, index) =>
              renderSelectedProduct(product, index)
            )}
        </TableBody>
      </Table>
    );
  };

  const renderTransectionData = () => {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between">
          <span className=" text-sm text-gray-900 font-bold">Total price</span>
          <span className=" text-sm text-gray-900 font-bold ml-auto">
            {transection.totalPrice}
          </span>
        </div>
        <div className="my-4 bg-gray-300 h-[1px]" />
        <div className="grid grid-cols-5 items-center justify-between">
          <span className=" text-sm text-gray-900 font-bold col-span-4">
            {"Discount (-)"}
          </span>
          <Input
            type="number"
            disabled
            value={transection.discount}
            onChange={(e) => {
              const discount = Number(e.target.value);
              if (transection.totalPrice >= 0) {
                setTransection({
                  ...transection,
                  discount,
                  remaining: Math.max(
                    transection.totalPrice +
                      transection?.deliveryCharge -
                      (transection.paid + discount),
                    0
                  ),
                });
              }
            }}
          />
        </div>
        <div className="my-4 bg-gray-300 h-[1px]" />
        <div className="grid grid-cols-5 items-center justify-between">
          <span className=" text-sm text-gray-900 font-bold col-span-4">
            {"Delivery Charge (+)"}
          </span>
          <Input
            type="number"
            min={0}
            disabled
            value={transection.deliveryCharge}
            onChange={(e) => {
              const deliveryCharge = Number(e.target.value);
              if (transection.totalPrice >= 0) {
                setTransection({
                  ...transection,
                  deliveryCharge,
                  remaining: Math.max(
                    transection.totalPrice +
                      deliveryCharge -
                      (transection.paid + transection.discount),
                    0
                  ),
                });
              }
            }}
          />
        </div>
        <div className="my-4 bg-gray-300 h-[1px]" />
        <div className="grid grid-cols-5 items-center justify-between">
          <span className="text-sm text-gray-900 font-bold col-span-4">
            {"Paid (-)"}
          </span>
          <Input
            type="number"
            value={transection.paid}
            disabled={transection.totalPrice < 1}
            onChange={(e) => {
              const paid = Number(e.target.value);
              if (transection.totalPrice + transection.deliveryCharge >= paid) {
                transection.remaining = transection.totalPrice - paid;
                transection.paid = paid;
                setTransection({
                  ...transection,
                  paid,
                  remaining: Math.max(
                    (transection.totalPrice, transection.deliveryCharge) -
                      (paid + transection.discount),
                    0
                  ),
                });
              }
            }}
          />
        </div>
        <div className="my-4 bg-gray-300 h-[1px]" />
        <div className="flex items-center justify-between">
          <span className=" text-sm text-gray-900 font-bold">Reamaining =</span>
          <span className=" text-sm text-gray-900 font-bold ml-auto">
            {transection.remaining}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-4 gap-2">
      <div className=" col-span-1 sm:col-span-2">
        <Card className="my-2">
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              <div className="w-full">
                <Input
                  type="text"
                  placeholder="Search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                  }}
                />
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>{renderProductList()}</CardContent>
        </Card>
      </div>
      <div className="col-span-1 sm:col-span-2 my-2">
        <Card>
          <CardHeader>
            <CardTitle>Selected Product Information</CardTitle>
          </CardHeader>
          <CardContent>{renderSelectedProductList()}</CardContent>
        </Card>
        <Card className="my-2">
          <CardHeader>
            <CardTitle>Amount</CardTitle>
          </CardHeader>
          <CardContent>{renderTransectionData()}</CardContent>
          <CardFooter>
            <div className=" w-full flex justify-center gap-2 items-center border rounded-md shadow-sm p-10">
              <Button
                variant={"outline"}
                className="w-full"
                onClick={() => {
                  handleBack();
                }}
              >
                Back
              </Button>
              <Button
                variant={"destructive"}
                className="w-full"
                onClick={() => {
                  getSelectedProductList();
                }}
              >
                Cancel
              </Button>
              <Drawer>
                <DrawerTrigger asChild>
                  <Button
                    className="w-full"
                    disabled={!selectedProducts || selectedProducts.length < 1}
                  >
                    Update
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle className="text-center">
                      Are you sure?
                    </DrawerTitle>
                    <DrawerDescription className="text-center">
                      You want to save the changes?
                    </DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter className=" w-full flex flex-row justify-center items-center gap-2">
                    <DrawerClose>
                      <Button
                        variant={"destructive"}
                        onClick={() => {
                          handleProductDataSubmit(
                            selectedProducts,
                            transection
                          );
                        }}
                      >
                        Yes, i'm sure
                      </Button>
                    </DrawerClose>
                    <DrawerClose>
                      <Button variant={"outline"}>Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default UpdateOrderProductList;
