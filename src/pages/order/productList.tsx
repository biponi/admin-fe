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

import { IOrderProduct, IProduct } from "../product/interface";
import PlaceHolderImage from "../../assets/placeholder.svg";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../components/ui/use-toast";
import { Input } from "../../components/ui/input";
import { Trash } from "lucide-react";
import EmptyProductCard from "../../common/EmptyProductCard";
import { ITransection } from "./interface";
import SelectDemo from "./components/SelectDemo";
import { Variation } from "./data/types";

const defaultTransaction = {
  totalPrice: 0.0,
  paid: 0.0,
  remaining: 0.0,
  discount: 0.0,
  deliveryCharge: 100.0,
};

interface Props {
  handleProductDataSubmit: (
    productData: IOrderProduct[],
    transectionData: ITransection
  ) => void;
}

const OrderProductList: React.FC<Props> = ({ handleProductDataSubmit }) => {
  const { getProductByQuery } = useOrder();
  const [query, setQuery] = useState("");
  const { toast } = useToast();
  const [products, setProducts] = useState<IProduct[] | []>([]);
  const [selectedProducts, setSelectedProducts] = useState<
    IOrderProduct[] | []
  >([]);

  const [transection, setTransection] = useState(defaultTransaction);

  useEffect(() => {
    if (!!selectedProducts) {
      let totalPrice = 0;
      let discount = 0;
      selectedProducts.forEach((product) => {
        totalPrice = Number(totalPrice) + Number(product.totalPrice);
        discount = Number(discount) + Number(product.discount);
      });
      const deliveryCharge = transection?.deliveryCharge;
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
                  <TableCell className="w-[10px] sm:w-[20px] sm:truncate">
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
    type: "color" | "size",
    index: number,
    list: string[]
  ) => {
    const handleVariantChange = (variant: Variation) => {
      if (!!variant) {
        const selectedVariant = variant;
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
    const selectedProduct = selectedProducts[index];
    const selectedVariant = selectedProducts[index]?.selectedVariant ?? null;
    return (
      <SelectDemo
        type={type}
        list={list}
        selectedProduct={selectedProduct}
        selectedVariant={selectedVariant}
        selected={!!selectedVariant ? selectedVariant[`${type}`] ?? "" : ""}
        onVariantChange={(variant: Variation) => {
          handleVariantChange(variant);
        }}
      />
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
      <TableRow key={`${product?.id}-${index}`}>
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
          {product?.hasVariation
            ? renderVariantMenu("color", index, uniqueColors)
            : "N/A"}
        </TableCell>
        <TableCell>
          {product?.hasVariation
            ? renderVariantMenu("size", index, uniqueSizes)
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
              Total Price
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
            disabled={transection.totalPrice < 1}
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
            disabled={transection.totalPrice < 1}
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
                    transection.totalPrice +
                      transection?.deliveryCharge -
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
    <div className="w-full grid grid-cols-1 sm:grid-cols-6 gap-2">
      <div className=" col-span-1 sm:col-span-3">
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
      <div className="col-span-1 sm:col-span-3 my-2">
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
            <div className="flex justify-end items-center ml-auto">
              <Button
                variant={"outline"}
                className="mx-2"
                onClick={() => {
                  setSelectedProducts([]);
                  setTransection(defaultTransaction);
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={!selectedProducts || selectedProducts.length < 1}
                onClick={() => {
                  handleProductDataSubmit(selectedProducts, transection);
                }}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default OrderProductList;
