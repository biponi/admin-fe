import {
  BarChartHorizontalBig,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Image,
  List,
  ListFilter,
  PlusCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "../../components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
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
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useProductList } from "./hooks/useProductList";
import SingleItem from "./components/singleProductList";
import EmptyView from "../../coreComponents/emptyView";
import {
  CategoryStockSummary,
  IProduct,
  StockSummaryResponse,
} from "./interface";
import useCategory from "./hooks/useCategory";
import { useEffect, useState } from "react";
import { Input } from "../../components/ui/input";
import useDebounce from "../../customHook/useDebounce";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { SkeletonCard } from "../../coreComponents/sekeleton";
import SingleProductCardItem from "./components/singleProductCard";
import { getProductSummary } from "../../api/product";
import { errorToast } from "../../utils/toast";
import { Progress } from "../../components/ui/progress";
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
import useRoleCheck from "../auth/hooks/useRoleCheck";

interface Props {
  handleEditProduct: (id: string) => void;
}

const ProductList: React.FC<Props> = ({ handleEditProduct }) => {
  const {
    limit,
    setLimit,
    productFetching,
    products,
    currentPageNum,
    totalPages,
    totalProducts,
    setSearchQuery,
    updateCurrentPage,
    selectedCategory,
    deleteProductData,
    setSelectedCategory,
  } = useProductList();
  const navigate = useNavigate();
  const { hasRequiredPermission } = useRoleCheck();
  const [inputValue, setInputValue] = useState<string>("");
  const { categories, fetchCategories } = useCategory();
  const debounceHandler = useDebounce(inputValue, 500);

  const [viewType, setViewType] = useState<"list" | "grid">("list");
  const [summary, setSummary] = useState<StockSummaryResponse | null>(null);

  const getProductSummaryDetails = async () => {
    const response = await getProductSummary();
    if (response?.success) {
      setSummary(response?.data);
    } else {
      errorToast(
        response?.error ?? "Something went wrong. Please try again",
        "top-center"
      );
      setSummary(null);
    }
  };

  useEffect(() => {
    fetchCategories();
    getProductSummaryDetails();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    setSearchQuery(inputValue);
    //eslint-disable-next-line
  }, [debounceHandler]);

  const renderEmptyView = () => {
    return hasRequiredPermission("product", "create") ? (
      <EmptyView
        title='You have no products'
        description='You can start selling as soon as you add a product.'
        buttonText='Add Product'
        handleButtonClick={() => navigate("/product/create")}
      />
    ) : (
      <EmptyView
        title='You have no products'
        description='You can start selling as soon as you add a product.'
      />
    );
  };

  const renderButtonAndFilterView = () => {
    return (
      <>
        {hasRequiredPermission("product", "summary") && (
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                size='sm'
                variant={"outline"}
                className='h-7 mr-2 md:hidden '>
                <BarChartHorizontalBig className='h-3.5 w-3.5' />
                <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
                  View Summary
                </span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className='mx-auto w-full max-w-sm'>
                <DrawerHeader>
                  <DrawerTitle>Inventory Summary</DrawerTitle>
                  <DrawerDescription>
                    Set your inventory summary...
                  </DrawerDescription>
                </DrawerHeader>
                <div className='px-4 pb-0 max-h-[70vh] overflow-y-scroll'>
                  {renderCardSummaryView()}
                </div>
                <DrawerFooter className='bg-gray-100'>
                  <DrawerClose asChild>
                    <Button variant={"default"}>Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='h-7 gap-1'>
              <ListFilter className='h-3.5 w-3.5' />
              <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
                Filter
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedCategory === "all"}
              onClick={() => setSelectedCategory("all")}>
              All
            </DropdownMenuCheckboxItem>
            {categories.map((category, index) => (
              <DropdownMenuCheckboxItem
                checked={selectedCategory === category?.id}
                onClick={() => setSelectedCategory(category.id)}>
                {category?.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <Button size='sm' variant='outline' className='h-7 gap-1'>
              <File className='h-3.5 w-3.5' />
              <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
                Export
              </span>
            </Button> */}
        {hasRequiredPermission("product", "create") && (
          <Button
            size='sm'
            className='h-7 ml-2 md:ml-0 md:gap-1 '
            onClick={() => navigate("/product/create")}>
            <PlusCircle className='h-3.5 w-3.5' />
            <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
              Add Product
            </span>
          </Button>
        )}
      </>
    );
  };

  const renderMobileProductView = (product: IProduct, key: number) => {
    return (
      <SingleProductCardItem
        key={product?.id}
        id={product?.id}
        sku={product?.sku}
        image={product?.thumbnail}
        title={product?.name}
        categoryName={product?.categoryName ?? "Not Added"}
        active={product?.active}
        quantity={product?.quantity}
        unitPrice={product?.unitPrice}
        totalSold={product?.sold ?? []}
        totalReturned={product?.returned ?? 0}
        variations={product?.variantList ?? ["No Variant"]}
        handleUpdateProduct={handleEditProduct}
        deleteExistingProduct={deleteProductData}
        updatedAt={product?.timestamps?.updatedAt}
      />
    );
  };

  const renderGridView = () => {
    return (
      <div className='grid grid-cols-4 gap-2  w-full'>
        {products.map((product: IProduct, index: number) =>
          renderMobileProductView(product, index)
        )}
      </div>
    );
  };

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return "0";
    return Number(num) % 1 < 1
      ? Math.floor(num).toLocaleString()
      : num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  const renderProgressView = (
    name: string,
    value: number,
    total: number,
    index: number
  ) => (
    <div className='w-full grid grid-cols-5 gap-2 my-2' key={index}>
      <span className='text-xs text-gray-800 font-medium col-span-2 uppercase'>
        {name}
      </span>
      <Progress value={(value / total) * 100} className='col-span-2 mt-1' />
      <span className='text-xs text-gray-800 font-medium w-full text-right col-span-1'>
        {formatNumber(value)}
      </span>
    </div>
  );

  const renderCardSummaryView = () => {
    const cardData = [
      {
        title: "Total Active Products",
        total: summary?.totalActiveProductType,
        key: "totalActiveProducts",
        description:
          "Displays the total number of active products available in the inventory, ensuring an up-to-date stock count.",
      },
      {
        title: "Total Products",
        total: summary?.totalActiveProducts,
        key: "totalStock",
        description:
          "Represents the total stock count of all active products, helping track inventory levels effectively.",
      },
      {
        title: "Total Product Variations",
        total: summary?.totalActiveProductVariations,
        key: "totalVariants",
        description:
          "Indicates the number of product variations (e.g., different sizes, colors) available across all active products.",
      },
      {
        title: "Total Amount",
        total: summary?.totalActiveProductPrice,
        key: "totalPrice",
        description:
          "Calculates the total valuation of all active products (Stock Quantity × Unit Price), providing an overall monetary summary.",
      },
    ];

    return (
      <div className='grid grid-cols-1 gap-2 md:grid-cols-4 my-2'>
        {cardData.map(({ title, total, key, description }, cardIndex) => (
          <Card key={cardIndex}>
            <CardHeader>
              <CardTitle>
                {title}{" "}
                {!!summary && total ? `( ${formatNumber(total)} )` : "( N/A )"}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              {!summary || !summary.categories ? (
                <div className='flex justify-center items-center p-10'>
                  No Data Found
                </div>
              ) : (
                summary.categories.map(
                  (res: CategoryStockSummary, index: number) =>
                    renderProgressView(
                      res.categoryName,
                      res[key as keyof CategoryStockSummary] as number,
                      total ?? 1,
                      index
                    )
                )
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderProductListView = () => {
    return (
      <>
        <div className='hidden md:block'>
          {hasRequiredPermission("product", "summary") &&
            renderCardSummaryView()}
        </div>
        <Tabs defaultValue='all'>
          <div className='flex flex-col items-center w-[90vw] md:w-full md:flex-row'>
            <TabsList className='hidden md:block'>
              <TabsTrigger value='all'>All</TabsTrigger>
              <TabsTrigger value='active'>Active</TabsTrigger>
              <TabsTrigger value='inactive'>Inactive</TabsTrigger>
              <TabsTrigger value='instock'>In Stock</TabsTrigger>
              <TabsTrigger value='outofstock'>Out of stock</TabsTrigger>
            </TabsList>
            <div className='ml-auto hidden items-center gap-2 md:flex'>
              {renderButtonAndFilterView()}
            </div>
          </div>

          <Card
            x-chunk='dashboard-06-chunk-0'
            className=' mt-2 shadow-none border-0 md:shadow md:border  w-[90vw] md:mt-4 md:w-full'>
            <CardHeader className='shadow border rounded-xl md:rounded-none md:shadow-none md:border'>
              <div className='flex flex-col w-full justify-between md:flex-row  '>
                <div className='md:mr-auto'>
                  <div className='flex items-center justify-between'>
                    <CardTitle>Products</CardTitle>
                    <div className='ml-auto md:hidden'>
                      {renderButtonAndFilterView()}
                    </div>
                  </div>
                  <CardDescription className='mt-2 hidden md:block'>
                    Manage your products and view their sales performance.
                  </CardDescription>
                </div>
                <div className=' mt-2 md:mt-0 md:ml-auto'>
                  <Input
                    type='text'
                    placeholder='Search'
                    onChange={(event) => {
                      setInputValue(event.target.value);
                    }}
                  />
                </div>
                <div className=' justify-between items-center gap-2 hidden'>
                  <Button
                    variant={viewType.includes("grid") ? "default" : "outline"}
                    onClick={() => setViewType("grid")}>
                    <Grid2X2 className='size-5' />
                  </Button>
                  <Button
                    variant={viewType.includes("list") ? "default" : "outline"}
                    onClick={() => setViewType("list")}>
                    <List className='size-5' />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className='p-0'>
              <TabsList className='block md:hidden my-2'>
                <TabsTrigger value='all'>All</TabsTrigger>
                <TabsTrigger value='inactive'>Inactive</TabsTrigger>
                <TabsTrigger value='instock'>In Stock</TabsTrigger>
                <TabsTrigger value='outofstock'>Out of stock</TabsTrigger>
              </TabsList>
              <TabsContent value='all'>
                <ul className='grid grid-cols-2 max-h-[63vh] overflow-y-auto gap-x-2 gap-y-2 md:hidden sm:grid-cols-4 sm:gap-x-2 lg:grid-cols-4 xl:gap-x-8'>
                  {products.map((product: IProduct, index: number) =>
                    renderMobileProductView(product, index)
                  )}
                </ul>
                <div className='w-full max-h-[65vh] overflow-y-auto'>
                  {viewType.includes("grid") && renderGridView()}
                  {viewType.includes("list") && (
                    <Table className=' hidden md:table '>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='hidden w-[100px] sm:table-cell'>
                            <span className='sr-only'>Image</span>
                            <Image className='size-5' />
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Category Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Variations</TableHead>
                          <TableHead className='hidden md:table-cell'>
                            Total Stock
                          </TableHead>
                          <TableHead>Sold</TableHead>
                          <TableHead>Returned</TableHead>
                          <TableHead className='hidden md:table-cell'>
                            Last Updated at
                          </TableHead>
                          <TableHead>
                            <span className='sr-only'>Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className=' max-h-[70vh] overflow-y-auto '>
                        {products.map((product: IProduct) => (
                          <SingleItem
                            key={product?.id}
                            id={product?.id}
                            sku={product?.sku}
                            image={product?.thumbnail}
                            title={product?.name}
                            categoryName={product?.categoryName ?? "Not Added"}
                            active={product?.active}
                            quantity={product?.quantity}
                            unitPrice={product?.unitPrice}
                            totalSold={product?.sold ?? []}
                            totalReturned={product?.returned ?? 0}
                            variations={product?.variantList ?? ["No Variant"]}
                            handleUpdateProduct={handleEditProduct}
                            deleteExistingProduct={deleteProductData}
                            updatedAt={product?.timestamps?.updatedAt}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>
              <TabsContent value='active'>
                <ul className='grid grid-cols-2 max-h-[63vh] overflow-y-auto gap-2 md:hidden sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8'>
                  {products
                    .filter((product: IProduct) => product.active)
                    .map((product: IProduct, index: number) =>
                      renderMobileProductView(product, index)
                    )}
                </ul>
                <div className='w-full max-h-[65vh] overflow-y-auto'>
                  {viewType.includes("grid") && renderGridView()}
                  {viewType.includes("list") && (
                    <Table className=' hidden md:table '>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='hidden w-[100px] sm:table-cell'>
                            <span className='sr-only'>Image</span>
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Category Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className='hidden md:table-cell'>
                            Total Stock
                          </TableHead>
                          <TableHead className='hidden md:table-cell'>
                            Last Updated at
                          </TableHead>
                          <TableHead>
                            <span className='sr-only'>Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className=' max-h-[70vh] overflow-y-auto '>
                        {products
                          .filter((product: IProduct) => product.active)
                          .map((product: IProduct, index: number) => (
                            <SingleItem
                              key={index}
                              id={product?.id}
                              sku={product?.sku}
                              image={product?.thumbnail}
                              title={product?.name}
                              categoryName={
                                product?.categoryName ?? "Not Added"
                              }
                              active={product?.active}
                              quantity={product?.quantity}
                              unitPrice={product?.unitPrice}
                              totalSold={product?.sold ?? []}
                              totalReturned={product?.returned ?? 0}
                              variations={
                                product?.variantList ?? ["No Variant"]
                              }
                              handleUpdateProduct={handleEditProduct}
                              deleteExistingProduct={deleteProductData}
                              updatedAt={product?.timestamps?.updatedAt}
                            />
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>
              <TabsContent value='inactive'>
                <ul className='grid grid-cols-2 max-h-[63vh] overflow-y-auto gap-2  md:hidden sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8'>
                  {products
                    .filter((product: IProduct) => !product.active)
                    .map((product: IProduct, index: number) =>
                      renderMobileProductView(product, index)
                    )}
                </ul>
                <div className='w-full max-h-[65vh] overflow-y-auto'>
                  {viewType.includes("grid") && renderGridView()}
                  {viewType.includes("list") && (
                    <Table className=' hidden md:table '>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='hidden w-[100px] sm:table-cell'>
                            <span className='sr-only'>Image</span>
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Category Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className='hidden md:table-cell'>
                            Total Stock
                          </TableHead>
                          <TableHead className='hidden md:table-cell'>
                            Last Updated at
                          </TableHead>
                          <TableHead>
                            <span className='sr-only'>Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className=' max-h-[70vh] overflow-y-auto '>
                        {products
                          .filter((product: IProduct) => !product.active)
                          .map((product: IProduct, index: number) => (
                            <SingleItem
                              key={index}
                              id={product?.id}
                              sku={product?.sku}
                              image={product?.thumbnail}
                              title={product?.name}
                              categoryName={
                                product?.categoryName ?? "Not Added"
                              }
                              active={product?.active}
                              quantity={product?.quantity}
                              unitPrice={product?.unitPrice}
                              handleUpdateProduct={handleEditProduct}
                              deleteExistingProduct={deleteProductData}
                              updatedAt={product?.timestamps?.updatedAt}
                              totalSold={product?.sold ?? []}
                              totalReturned={product?.returned ?? 0}
                              variations={
                                product?.variantList ?? ["No Variant"]
                              }
                            />
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>
              <TabsContent value='instock'>
                <ul className='grid grid-cols-2 max-h-[63vh] overflow-y-auto gap-2 md:hidden sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8'>
                  {products
                    .filter((product: IProduct) => product.quantity > 0)
                    .map((product: IProduct, index: number) =>
                      renderMobileProductView(product, index)
                    )}
                </ul>
                <div className='w-full max-h-[65vh] overflow-y-auto'>
                  {viewType.includes("grid") && renderGridView()}
                  {viewType.includes("list") && (
                    <Table className=' hidden md:table '>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='hidden w-[100px] sm:table-cell'>
                            <span className='sr-only'>Image</span>
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Category Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className='hidden md:table-cell'>
                            Total Stock
                          </TableHead>
                          <TableHead className='hidden md:table-cell'>
                            Last Updated at
                          </TableHead>
                          <TableHead>
                            <span className='sr-only'>Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className=' max-h-[70vh] overflow-y-auto '>
                        {products
                          .filter((product: IProduct) => product.quantity > 3)
                          .map((product: IProduct, index: number) => (
                            <SingleItem
                              key={index}
                              id={product?.id}
                              sku={product?.sku}
                              image={product?.thumbnail}
                              title={product?.name}
                              categoryName={
                                product?.categoryName ?? "Not Added"
                              }
                              active={product?.active}
                              quantity={product?.quantity}
                              unitPrice={product?.unitPrice}
                              handleUpdateProduct={handleEditProduct}
                              deleteExistingProduct={deleteProductData}
                              updatedAt={product?.timestamps?.updatedAt}
                              totalSold={product?.sold ?? []}
                              totalReturned={product?.returned ?? 0}
                              variations={
                                product?.variantList ?? ["No Variant"]
                              }
                            />
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>
              <TabsContent value='outofstock'>
                <ul className='grid grid-cols-2 max-h-[63vh] overflow-y-auto gap-2 md:hidden sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8'>
                  {products
                    .filter((product: IProduct) => product.quantity <= 0)
                    .map((product: IProduct, index: number) =>
                      renderMobileProductView(product, index)
                    )}
                </ul>
                <div className='w-full max-h-[65vh] overflow-y-auto'>
                  {viewType.includes("grid") && renderGridView()}
                  {viewType.includes("list") && (
                    <Table className=' hidden md:table '>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='hidden w-[100px] sm:table-cell'>
                            <span className='sr-only'>Image</span>
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Category Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className='hidden md:table-cell'>
                            Total Stock
                          </TableHead>
                          <TableHead className='hidden md:table-cell'>
                            Last Updated at
                          </TableHead>
                          <TableHead>
                            <span className='sr-only'>Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className=' max-h-[70vh] overflow-y-auto '>
                        {products
                          .filter((product: IProduct) => product.quantity <= 0)
                          .map((product: IProduct, index: number) => (
                            <SingleItem
                              key={index}
                              sku={product?.sku}
                              id={product?.id}
                              image={product?.thumbnail}
                              title={product?.name}
                              categoryName={
                                product?.categoryName ?? "Not Added"
                              }
                              active={product?.active}
                              quantity={product?.quantity}
                              unitPrice={product?.unitPrice}
                              totalSold={product?.sold ?? []}
                              totalReturned={product?.returned ?? 0}
                              variations={
                                product?.variantList ?? ["No Variant"]
                              }
                              handleUpdateProduct={handleEditProduct}
                              deleteExistingProduct={deleteProductData}
                              updatedAt={product?.timestamps?.updatedAt}
                            />
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>
            </CardContent>
            {inputValue === "" && (
              <CardFooter className='mt-2 px-0'>
                <div className='w-full flex justify-between items-center border md:border-0 border-gray-300  rounded-xl  px-2 md:px-4'>
                  <div className='text-xs text-muted-foreground'>
                    Showing{" "}
                    <strong>{`${
                      (Number(currentPageNum) - 1) * limit + 1
                    }-${Math.min(
                      Number(currentPageNum) * limit,
                      totalProducts
                    )}`}</strong>{" "}
                    of <strong>{totalProducts}</strong> products
                  </div>
                  <div className='flex gap-2 items-center'>
                    <Select
                      value={`${limit}`}
                      onValueChange={(value: string) => {
                        setLimit(parseInt(value, 10));
                      }}>
                      <SelectTrigger className='w-auto border-0 md:border'>
                        <SelectValue placeholder='Select Row Limit' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Limit</SelectLabel>
                          <SelectItem value='10'>10</SelectItem>
                          <SelectItem value='20'>20</SelectItem>
                          <SelectItem value='50'>50</SelectItem>
                          <SelectItem value='100'>100</SelectItem>
                          <SelectItem value='150'>150</SelectItem>
                          <SelectItem value='200'>200</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>{" "}
                    <Button
                      disabled={currentPageNum < 2}
                      variant='outline'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() => updateCurrentPage(-1)}>
                      <ChevronLeft className='h-4 w-4' />
                      <span className='sr-only'>Back</span>
                    </Button>
                    <Button
                      disabled={currentPageNum >= totalPages}
                      variant='outline'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() => updateCurrentPage(1)}>
                      <ChevronRight className='h-4 w-4' />
                      <span className='sr-only'>Next</span>
                    </Button>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        </Tabs>
      </>
    );
  };

  const mainView = () => {
    if (productFetching) {
      return <SkeletonCard title='Loading Product Data...' />;
    } else if (inputValue !== "" || (!!products && products.length > 0)) {
      return renderProductListView();
    } else {
      return renderEmptyView();
    }
  };

  return <div className='w-full md:w-[95vw]'>{mainView()}</div>;
};

export default ProductList;
