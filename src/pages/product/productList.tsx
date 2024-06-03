import {
  ChevronLeft,
  ChevronRight,
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
import { IProduct } from "./interface";
import DefaultLoading from "../../coreComponents/defaultLoading";
import useCategory from "./hooks/useCategory";
import { useEffect, useState } from "react";
import { Input } from "../../components/ui/input";
import useDebounce from "../../customHook/useDebounce";
import { useNavigate } from "react-router-dom";
import SingleProductItemMobileView from "./components/singleProductMobileView";

interface Props {
  handleEditProduct: (id: string) => void;
}

const ProductList: React.FC<Props> = ({ handleEditProduct }) => {
  const {
    limit,
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
  const { categories, fetchCategories } = useCategory();
  const [inputValue, setInputValue] = useState<string>("");

  const debounceHandler = useDebounce(inputValue, 500);

  useEffect(() => {
    fetchCategories();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    setSearchQuery(inputValue);
    //eslint-disable-next-line
  }, [debounceHandler]);

  const renderEmptyView = () => {
    return (
      <EmptyView
        title='You have no products'
        description='You can start selling as soon as you add a product.'
        buttonText='Add Product'
        handleButtonClick={() => navigate("/product/create")}
      />
    );
  };

  const renderButtonAndFilterView = () => {
    return (
      <>
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
        <Button
          size='sm'
          className='h-7 ml-2 md:ml-0 md:gap-1 '
          onClick={() => navigate("/product/create")}>
          <PlusCircle className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
            Add Product
          </span>
        </Button>
      </>
    );
  };

  const renderMobileProductView = (productData: IProduct, key: number) => {
    return (
      <SingleProductItemMobileView
        key={key}
        id={productData?.id}
        image={productData?.thumbnail}
        title={productData?.name}
        quantity={productData?.quantity}
        unitPrice={productData?.unitPrice}
        handleUpdateProduct={handleEditProduct}
        deleteExistingProduct={deleteProductData}
      />
    );
  };

  const renderProductListView = () => {
    return (
      <Tabs defaultValue='all'>
        <div className='flex flex-col items-center w-[90vw] md:w-full md:flex-row'>
          <TabsList>
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
          className=' mt-2  w-[90vw] md:mt-4 md:w-full'>
          <CardHeader>
            <div className='flex flex-col w-full justify-between md:flex-row  '>
              <div className='md:mr-auto'>
                <div className='flex items-center justify-between'>
                  <CardTitle>Products</CardTitle>
                  <div className='ml-auto md:hidden'>
                    {renderButtonAndFilterView()}
                  </div>
                </div>
                <CardDescription className='mt-2'>
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
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value='all'>
              <ul className='grid grid-cols-2 gap-x-4 gap-y-8 md:hidden sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8'>
                {products.map((product: IProduct, index: number) =>
                  renderMobileProductView(product, index)
                )}
              </ul>
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
                  {products.map((product: IProduct, index: number) => (
                    <SingleItem
                      key={index}
                      id={product?.id}
                      sku={product?.sku}
                      image={product?.thumbnail}
                      title={product?.name}
                      categoryName={product?.categoryName ?? "Not Added"}
                      active={product?.active}
                      quantity={product?.quantity}
                      unitPrice={product?.unitPrice}
                      handleUpdateProduct={handleEditProduct}
                      deleteExistingProduct={deleteProductData}
                      updatedAt={product?.timestamps?.updatedAt}
                    />
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value='active'>
              <ul className='grid grid-cols-2 gap-x-4 gap-y-8 md:hidden sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8'>
                {products
                  .filter((product: IProduct) => product.active)
                  .map((product: IProduct, index: number) =>
                    renderMobileProductView(product, index)
                  )}
              </ul>
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
                        categoryName={product?.categoryName ?? "Not Added"}
                        active={product?.active}
                        quantity={product?.quantity}
                        unitPrice={product?.unitPrice}
                        handleUpdateProduct={handleEditProduct}
                        deleteExistingProduct={deleteProductData}
                        updatedAt={product?.timestamps?.updatedAt}
                      />
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value='inactive'>
              <ul className='grid grid-cols-2 gap-x-4 gap-y-8 md:hidden sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8'>
                {products
                  .filter((product: IProduct) => !product.active)
                  .map((product: IProduct, index: number) =>
                    renderMobileProductView(product, index)
                  )}
              </ul>
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
                        categoryName={product?.categoryName ?? "Not Added"}
                        active={product?.active}
                        quantity={product?.quantity}
                        unitPrice={product?.unitPrice}
                        handleUpdateProduct={handleEditProduct}
                        deleteExistingProduct={deleteProductData}
                        updatedAt={product?.timestamps?.updatedAt}
                      />
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value='instock'>
              <ul className='grid grid-cols-2 gap-x-4 gap-y-8 md:hidden sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8'>
                {products
                  .filter((product: IProduct) => product.quantity > 0)
                  .map((product: IProduct, index: number) =>
                    renderMobileProductView(product, index)
                  )}
              </ul>
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
                        categoryName={product?.categoryName ?? "Not Added"}
                        active={product?.active}
                        quantity={product?.quantity}
                        unitPrice={product?.unitPrice}
                        handleUpdateProduct={handleEditProduct}
                        deleteExistingProduct={deleteProductData}
                        updatedAt={product?.timestamps?.updatedAt}
                      />
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value='outofstock'>
              <ul className='grid grid-cols-2 gap-x-4 gap-y-8 md:hidden sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8'>
                {products
                  .filter((product: IProduct) => product.quantity <= 0)
                  .map((product: IProduct, index: number) =>
                    renderMobileProductView(product, index)
                  )}
              </ul>
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
                        categoryName={product?.categoryName ?? "Not Added"}
                        active={product?.active}
                        quantity={product?.quantity}
                        unitPrice={product?.unitPrice}
                        handleUpdateProduct={handleEditProduct}
                        deleteExistingProduct={deleteProductData}
                        updatedAt={product?.timestamps?.updatedAt}
                      />
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </CardContent>
          {inputValue === "" && (
            <CardFooter className='hidden md:block'>
              <div className='w-full flex justify-between items-center'>
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
    );
  };

  const mainView = () => {
    if (productFetching) {
      return <DefaultLoading />;
    } else if (inputValue !== "" || (!!products && products.length > 0)) {
      return renderProductListView();
    } else {
      return renderEmptyView();
    }
  };

  return <div className='w-full md:w-[95vw]'>{mainView()}</div>;
};

export default ProductList;
