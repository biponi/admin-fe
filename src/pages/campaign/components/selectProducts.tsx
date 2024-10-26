import { useEffect, useState } from "react";
import useOrder from "../../order/hooks/useOrder";
import { IProduct } from "../../product/interface";
import useDebounce from "../../../customHook/useDebounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import EmptyProductCard from "../../../common/EmptyProductCard";
import PlaceHolderImage from "../../../assets/placeholder.svg";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { ICampaingProducts } from "../interface";

interface Props {
  productList: ICampaingProducts[];
  updateProductList: (products: string[]) => void;
}
const SelectProductForCampaign: React.FC<Props> = ({
  productList,
  updateProductList,
}) => {
  const { getProductByQuery } = useOrder();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<IProduct[] | []>([]);
  const [selectedProducts, setSelectedProducts] = useState<
    IProduct[] | ICampaingProducts[] | []
  >([]);

  useEffect(() => {
    if (!!productList && productList?.length > 0)
      setSelectedProducts(productList);
  }, [productList]);

  useEffect(() => {
    const listOfProductId = selectedProducts.map(
      (product: IProduct | ICampaingProducts) =>
        typeof product !== "string" ? product?.id : ""
    );
    updateProductList(listOfProductId);
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
    const prod: ICampaingProducts = {
      id: product?.id,
      name: product?.name,
      description: product?.description,
      thumbnail: product?.thumbnail,
      quantity: product?.quantity,
      active: product?.active,
      unitPrice: product?.unitPrice,
    };
    setSelectedProducts([...selectedProducts, prod]);
  };

  const renderProductList = () => {
    return (
      <Table className="max-h-[300px] overflow-y-auto">
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
            <TableHead>Unit Price</TableHead>
            <TableHead>Quantity</TableHead>
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
              products
                .filter(
                  (obj1) =>
                    !selectedProducts.some((obj2) => obj1.id === obj2.id)
                )
                .map((product: IProduct, index: number) => (
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
                    <TableCell>{product?.unitPrice}</TableCell>
                    <TableCell className="w-[10px] sm:w-[20px] sm:truncate">
                      {product?.quantity}
                    </TableCell>
                    <TableCell className="flex justify-end items-center">
                      {product?.quantity > 0 && product?.active ? (
                        <Button onClick={() => handleSelect(product)}>
                          Select
                        </Button>
                      ) : (
                        <Badge
                          variant={product?.active ? "default" : "destructive"}
                        >
                          {product?.active ? "Inactive" : "Out Of Stock"}
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

  const renderSelectedProduct = (
    product: IProduct | ICampaingProducts,
    index: number
  ) => {
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
        <TableCell>{product?.quantity}</TableCell>
        <TableCell>{product?.unitPrice}</TableCell>
        <TableCell>
          <Trash
            className="text-red-500 w-4 h-4"
            onClick={() =>
              setSelectedProducts(
                selectedProducts.filter(
                  (pd: IProduct | ICampaingProducts) => pd?.id !== product?.id
                )
              )
            }
          />
        </TableCell>
      </TableRow>
    );
  };

  const renderSelectedProductList = () => {
    return (
      <Table className="max-h-[300px] overflow-y-auto">
        <TableHeader>
          <TableRow>
            <TableHead className="hidden sm:inline-block">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>quantity</TableHead>
            <TableHead className="hidden sm:inline-block">Unit Price</TableHead>
            <TableHead className="text-right">
              <Trash className="w-5 h-5" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(!selectedProducts || selectedProducts.length < 1) && (
            <TableRow className="h-[50vh]">
              <TableCell colSpan={7}>
                <EmptyProductCard text="Please select a product" />
              </TableCell>
            </TableRow>
          )}
          {!!selectedProducts &&
            selectedProducts.map(
              (product: IProduct | ICampaingProducts, index) =>
                renderSelectedProduct(product, index)
            )}
        </TableBody>
      </Table>
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
          <CardContent className="max-h-[70vh] overflow-y-auto h-[50vh]">
            {renderProductList()}
          </CardContent>
        </Card>
      </div>
      <div className="col-span-1 sm:col-span-3 my-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Selected Product Information {`(${selectedProducts?.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[70vh] overflow-y-auto h-[50vh]">
            {renderSelectedProductList()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SelectProductForCampaign;
