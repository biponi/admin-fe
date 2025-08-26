import {
  BarChartHorizontalBig,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Image,
  List,
  PlusCircle,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Search,
  MoreHorizontal,
  ShoppingBag,
  Archive,
  Activity,
  FilePieChart,
} from "lucide-react";
import { Button } from "../../components/ui/button";

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
import {
  Collapsible,
  CollapsibleContent,
} from "../../components/ui/collapsible";
import {
  Sheet as SheetContainer,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import CategoryFilterDropdown from "./components/FilterByCategory";
import MobileProductHeader from "./components/MobileProductHeader";
import MobileProductCard from "./components/MobileProductCard";
import MobileProductFilters from "./components/MobileProductFilters";
import MobileProductEmpty from "./components/MobileProductEmpty";
import MobileProductSummary from "./components/MobileProductSummary";

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
  const [showFilters, setShowFilters] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

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

  const renderMobileEmptyView = () => {
    if (inputValue || selectedCategory) {
      return (
        <MobileProductEmpty
          type='no-search-results'
          searchQuery={inputValue}
          onClearFilters={() => {
            setInputValue("");
            setSelectedCategory("");
          }}
          onRetry={getProductSummaryDetails}
        />
      );
    }
    return (
      <MobileProductEmpty
        type='no-products'
        hasCreatePermission={hasRequiredPermission("product", "create")}
        onCreateProduct={() => navigate("/product/create")}
        onRetry={getProductSummaryDetails}
      />
    );
  };

  const renderDesktopEmptyView = () => {
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
      <div className='grid grid-cols-8 gap-8  w-full'>
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

  const cardData = [
    {
      title: "Active Products",
      total: summary?.totalActiveProductType,
      key: "totalActiveProducts",
      description: "Products currently available for sale",
      icon: <Package className='h-6 w-6' />,
      gradient: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      textColor: "text-blue-700",
    },
    {
      title: "Total Stock",
      total: summary?.totalActiveProducts,
      key: "totalStock",
      description: "Total quantity across all products",
      icon: <Archive className='h-6 w-6' />,
      gradient: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
      textColor: "text-green-700",
    },
    {
      title: "Product Variations",
      total: summary?.totalActiveProductVariations,
      key: "totalVariants",
      description: "Different variants available",
      icon: <Activity className='h-6 w-6' />,
      gradient: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      iconColor: "text-purple-600",
      textColor: "text-purple-700",
    },
    {
      title: "Total Value",
      total: summary?.totalActiveProductPrice,
      key: "totalPrice",
      description: "Combined inventory valuation",
      icon: <TrendingUp className='h-6 w-6' />,
      gradient: "from-amber-50 to-amber-100",
      borderColor: "border-amber-200",
      iconColor: "text-amber-600",
      textColor: "text-amber-700",
    },
  ];

  const renderCategoryBreakdown = () => {
    return (
      <>
        {/* Category Breakdown Button */}
        {summary?.categories && summary.categories.length > 0 && (
          <div className='flex justify-center lg:justify-start'>
            <SheetContainer>
              <SheetTrigger asChild>
                <Button
                  variant='outline'
                  className='w-full lg:w-auto  md:bg-sidebar-foreground md:text-sidebar'>
                  <BarChartHorizontalBig className='h-4 w-4 mr-2 md: text-sidebar' />
                  View Category Breakdown
                  <ChevronRight className='h-4 w-4 ml-2 md:text-sidebar' />
                </Button>
              </SheetTrigger>
              <SheetContent className='w-full sm:max-w-2xl'>
                <SheetHeader>
                  <SheetTitle className='flex items-center space-x-2'>
                    <BarChartHorizontalBig className='h-5 w-5 text-gray-600' />
                    <span>Category Breakdown</span>
                  </SheetTitle>
                  <SheetDescription>
                    Distribution of products across different categories
                  </SheetDescription>
                </SheetHeader>
                <div className='mt-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto'>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    {cardData.map(({ title, total, key }, cardIndex) => (
                      <div key={cardIndex} className='space-y-4'>
                        <h4 className='text-lg font-semibold text-gray-700 border-b pb-2 uppercase'>
                          {title}
                        </h4>
                        <div className='space-y-3'>
                          {!summary || !summary.categories ? (
                            <div className='flex justify-center items-center p-6 text-gray-500'>
                              No category data available
                            </div>
                          ) : (
                            summary.categories.map(
                              (res: CategoryStockSummary, index: number) => (
                                <div
                                  key={index}
                                  className='space-y-2 p-3 bg-gray-200 rounded-lg'>
                                  <div className='flex items-center justify-between'>
                                    <span className='text-sm font-medium text-gray-700 truncate uppercase'>
                                      {res.categoryName}
                                    </span>
                                    <span className='text-sm font-bold text-gray-900'>
                                      {formatNumber(
                                        res[
                                          key as keyof CategoryStockSummary
                                        ] as number
                                      )}
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      ((res[
                                        key as keyof CategoryStockSummary
                                      ] as number) /
                                        (total ?? 1)) *
                                      100
                                    }
                                    className='h-2'
                                  />
                                  <div className='text-xs text-gray-500'>
                                    {(
                                      ((res[
                                        key as keyof CategoryStockSummary
                                      ] as number) /
                                        (total ?? 1)) *
                                      100
                                    ).toFixed(1)}
                                    % of total
                                  </div>
                                </div>
                              )
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </SheetContainer>
          </div>
        )}
      </>
    );
  };

  const renderCardSummaryView = () => {
    return (
      <div className='space-y-6 md:space-y-2'>
        {/* Main Stats Grid */}
        <div className='grid md:hidden grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {cardData.map(
            (
              {
                title,
                total,
                key,
                description,
                icon,
                gradient,
                borderColor,
                iconColor,
                textColor,
              },
              cardIndex
            ) => (
              <Card
                key={cardIndex}
                className={`bg-gradient-to-br ${gradient} ${borderColor}  border shadow-sm hover:shadow-md transition-shadow duration-200`}>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium text-gray-600'>
                        {title}
                      </p>
                      <p className={`text-2xl font-bold ${textColor}`}>
                        {!!summary && total !== undefined
                          ? key === "totalPrice"
                            ? `৳${formatNumber(total)}`
                            : formatNumber(total)
                          : "N/A"}
                      </p>
                      <p className='text-xs text-gray-500'>{description}</p>
                    </div>
                    <div className={`${iconColor}`}>{icon}</div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>

        <div className=' hidden md:grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {cardData.map(
            (
              {
                title,
                total,
                key,
                description,
                icon,
                gradient,
                borderColor,
                iconColor,
                textColor,
              },
              cardIndex
            ) => (
              <Card
                key={cardIndex}
                className={`bg-white  md:bg-white border-2 border-dashed border-zinc-500 shadow-sm hover:shadow-md transition-shadow duration-200`}>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <p className='text-base text-gray-600 uppercase font-semibold'>
                        {title}
                      </p>
                      <p className={`text-2xl font-bold ${textColor}`}>
                        {!!summary && total !== undefined
                          ? key === "totalPrice"
                            ? `৳${formatNumber(total)}`
                            : formatNumber(total)
                          : "N/A"}
                      </p>
                      <p className='text-xs text-gray-500'>{description}</p>
                    </div>
                    <div className={`${iconColor}`}>{icon}</div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>

        <div className='md:hidden'>{renderCategoryBreakdown()}</div>
      </div>
    );
  };

  const renderMobileView = () => {
    const getTabCounts = () => {
      const activeProducts = products.filter((p: IProduct) => p.active);
      const inStockProducts = products.filter((p: IProduct) => p.quantity > 0);
      const outOfStockProducts = products.filter(
        (p: IProduct) => p.quantity <= 0
      );

      return {
        all: products.length,
        active: activeProducts.length,
        inactive: products.length - activeProducts.length,
        instock: inStockProducts.length,
        outofstock: outOfStockProducts.length,
      };
    };

    const tabCounts = getTabCounts();

    const getFilteredProducts = () => {
      let filtered = products;

      // Filter by tab
      if (selectedTab === "active") {
        filtered = filtered.filter((p: IProduct) => p.active);
      } else if (selectedTab === "inactive") {
        filtered = filtered.filter((p: IProduct) => !p.active);
      } else if (selectedTab === "instock") {
        filtered = filtered.filter((p: IProduct) => p.quantity > 0);
      } else if (selectedTab === "outofstock") {
        filtered = filtered.filter((p: IProduct) => p.quantity <= 0);
      }

      return filtered;
    };

    const displayProducts = getFilteredProducts();

    return (
      <div className='min-h-screen bg-gray-50 sm:hidden'>
        {/* Mobile Header */}
        <MobileProductHeader
          totalProducts={totalProducts}
          hasCreatePermission={hasRequiredPermission("product", "create")}
          onCreateProduct={() => navigate("/product/create")}
          selectedTab={selectedTab}
          summary={summary}
          onOpenSummary={
            hasRequiredPermission("product", "summary")
              ? () => setIsMobileSummaryOpen(true)
              : undefined
          }
        />

        {/* Mobile Summary Sheet */}
        <MobileProductSummary
          isOpen={isMobileSummaryOpen}
          onClose={() => setIsMobileSummaryOpen(false)}
          summary={summary}
        />

        {/* Mobile Filters */}
        <MobileProductFilters
          searchValue={inputValue}
          onSearchChange={setInputValue}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          totalProducts={tabCounts.all}
          activeCount={tabCounts.active}
          inactiveCount={tabCounts.inactive}
          inStockCount={tabCounts.instock}
          outOfStockCount={tabCounts.outofstock}
          onRefresh={getProductSummaryDetails}
        />

        {/* Mobile Products List */}
        <div className='px-4 py-2'>
          {displayProducts.length === 0 ? (
            renderMobileEmptyView()
          ) : (
            <>
              <div className='grid grid-cols-2 gap-2 pb-4'>
                {displayProducts.map((product: IProduct) => (
                  <MobileProductCard
                    key={product.id}
                    id={product.id}
                    sku={product.sku}
                    image={product.thumbnail}
                    title={product.name}
                    categoryName={product.categoryName ?? "Not Added"}
                    active={product.active}
                    quantity={product.quantity}
                    unitPrice={product.unitPrice}
                    totalSold={product.sold ?? []}
                    totalReturned={product.returned ?? 0}
                    variations={product.variantList ?? ["No Variant"]}
                    updatedAt={
                      product.timestamps?.updatedAt || new Date().toISOString()
                    }
                    onEdit={handleEditProduct}
                    onDelete={deleteProductData}
                  />
                ))}
              </div>
              
              {/* Mobile Pagination */}
              {inputValue === "" && (
                <div className='bg-white rounded-xl border border-gray-200 p-4 mt-4 mb-20 shadow-sm'>
                  {/* Items count */}
                  <div className='text-center text-sm text-gray-600 mb-4'>
                    Showing{" "}
                    <span className='font-semibold text-gray-900'>
                      {Math.max(1, (currentPageNum - 1) * limit + 1)}-
                      {Math.min(currentPageNum * limit, totalProducts)}
                    </span>{" "}
                    of{" "}
                    <span className='font-semibold text-gray-900'>
                      {totalProducts}
                    </span>{" "}
                    products
                  </div>
                  
                  {/* Pagination Controls */}
                  <div className='flex items-center justify-between gap-4'>
                    <Button
                      disabled={currentPageNum < 2}
                      variant='outline'
                      size='sm'
                      onClick={() => updateCurrentPage(-1)}
                      className='flex items-center gap-2 touch-manipulation'>
                      <ChevronLeft className='h-4 w-4' />
                      Previous
                    </Button>
                    
                    {/* Page indicator */}
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium text-gray-700'>
                        Page {currentPageNum} of {totalPages}
                      </span>
                      <Select
                        value={`${limit}`}
                        onValueChange={(value: string) =>
                          setLimit(parseInt(value, 10))
                        }>
                        <SelectTrigger className='w-16 h-8'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Per page</SelectLabel>
                            <SelectItem value='10'>10</SelectItem>
                            <SelectItem value='20'>20</SelectItem>
                            <SelectItem value='50'>50</SelectItem>
                            <SelectItem value='100'>100</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button
                      disabled={currentPageNum >= totalPages}
                      variant='outline'
                      size='sm'
                      onClick={() => updateCurrentPage(1)}
                      className='flex items-center gap-2 touch-manipulation'>
                      Next
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderDesktopView = () => {
    const getTabCounts = () => {
      const activeProducts = products.filter((p: IProduct) => p.active);
      const inStockProducts = products.filter((p: IProduct) => p.quantity > 0);
      const outOfStockProducts = products.filter(
        (p: IProduct) => p.quantity <= 0
      );

      return {
        all: products.length,
        active: activeProducts.length,
        inactive: products.length - activeProducts.length,
        instock: inStockProducts.length,
        outofstock: outOfStockProducts.length,
      };
    };

    const tabCounts = getTabCounts();

    return (
      <div className='space-y-4'>
        {/* Header Section */}
        <Card className='border-0 shadow-lg bg-sidebar p-0'>
          <CardHeader className='p-2 md:p-6'>
            <div className='flex flex-row items-center justify-between  '>
              <div>
                <CardTitle className='flex items-center space-x-2 text-lg md:text-2xl text-gray-800'>
                  <ShoppingBag className='h-6 w-6 text-sidebar-foreground' />
                  <span className=' text-sidebar-foreground'>
                    Product Management
                  </span>
                </CardTitle>
                <CardDescription className=' text-sidebar-foreground mt-1 hidden md:block'>
                  Manage your inventory, track performance, and organize your
                  products
                </CardDescription>
              </div>

              <div className='flex-row gap-0'>
                {/* Mobile Summary Drawer */}
                {hasRequiredPermission("product", "summary") && (
                  <div className='flex justify-between items-center gap-4'>
                    <div>
                      <Drawer>
                        <DrawerTrigger
                          className='flex justify-center items-center gap-0'
                          asChild>
                          <Button
                            variant={"outline"}
                            className='flex items-center justify-center  bg-sidebar-foreground space-x-2  text-sidebar w-full'>
                            <FilePieChart className='h-5 w-5  text-sidebar' />
                            <span className='font-medium  text-sidebar'>
                              Summary
                            </span>
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <div className='mx-auto w-full max-w-sm md:max-w-full'>
                            <DrawerHeader>
                              <DrawerTitle className='flex items-center space-x-2'>
                                <Package className='h-5 w-5' />
                                <span>Inventory Summary</span>
                              </DrawerTitle>
                              <DrawerDescription>
                                Overview of your product inventory and
                                performance
                              </DrawerDescription>
                            </DrawerHeader>
                            <div className='px-4 pb-0 max-h-[70vh] overflow-y-auto'>
                              {renderCardSummaryView()}
                            </div>
                            <DrawerFooter>
                              <DrawerClose asChild>
                                <Button variant='outline'>Close</Button>
                              </DrawerClose>
                            </DrawerFooter>
                          </div>
                        </DrawerContent>
                      </Drawer>
                    </div>
                    <div className='hidden md:block'>
                      {renderCategoryBreakdown()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Dashboard - Desktop Only */}
        <div className='hidden '>
          {hasRequiredPermission("product", "summary") &&
            renderCardSummaryView()}
        </div>

        {/* Product Tabs */}
        <Tabs defaultValue='all' className='space-y-4'>
          <div className=' hidden md:flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
            <TabsList className='grid grid-cols-5 w-full lg:w-auto'>
              <TabsTrigger value='all' className='flex items-center space-x-1'>
                <span>All</span>
                <span className='hidden sm:inline-block'>
                  ({tabCounts.all})
                </span>
              </TabsTrigger>
              <TabsTrigger
                value='active'
                className='flex items-center space-x-1'>
                <CheckCircle className='h-3 w-3' />
                <span className='hidden sm:inline-block'>Active</span>
                <span className='sm:hidden'>✓</span>
                <span className='hidden sm:inline-block'>
                  ({tabCounts.active})
                </span>
              </TabsTrigger>
              <TabsTrigger
                value='inactive'
                className='flex items-center space-x-1'>
                <AlertCircle className='h-3 w-3' />
                <span className='hidden sm:inline-block'>Inactive</span>
                <span className='sm:hidden'>!</span>
                <span className='hidden sm:inline-block'>
                  ({tabCounts.inactive})
                </span>
              </TabsTrigger>
              <TabsTrigger
                value='instock'
                className='flex items-center space-x-1'>
                <TrendingUp className='h-3 w-3' />
                <span className='hidden sm:inline-block'>In Stock</span>
                <span className='sm:hidden'>↑</span>
                <span className='hidden sm:inline-block'>
                  ({tabCounts.instock})
                </span>
              </TabsTrigger>
              <TabsTrigger
                value='outofstock'
                className='flex items-center space-x-1'>
                <TrendingDown className='h-3 w-3' />
                <span className='hidden sm:inline-block'>Out of Stock</span>
                <span className='sm:hidden'>↓</span>
                <span className='hidden sm:inline-block'>
                  ({tabCounts.outofstock})
                </span>
              </TabsTrigger>
            </TabsList>

            <div className='flex items-center space-x-2'>
              <div className='flex items-center space-x-1 border rounded-md p-1'>
                <Button
                  size='sm'
                  variant={viewType === "list" ? "default" : "ghost"}
                  onClick={() => setViewType("list")}
                  className='h-7 w-7 p-0'>
                  <List className='h-4 w-4' />
                </Button>
                <Button
                  size='sm'
                  variant={viewType === "grid" ? "default" : "ghost"}
                  onClick={() => setViewType("grid")}
                  className='h-7 w-7 p-0'>
                  <Grid2X2 className='h-4 w-4' />
                </Button>
              </div>
              {hasRequiredPermission("product", "create") && (
                <Button
                  className='flex items-center space-x-2'
                  onClick={() => navigate("/product/create")}>
                  <PlusCircle className='h-4 w-4' />
                  <span>Create</span>
                </Button>
              )}
            </div>
          </div>

          {/* Products Table/Grid */}
          <Card className='border-0 shadow-none'>
            <CardHeader className='border-0 bg-gray-50/50 space-y-4 p-0'>
              {/* Collapsible Search and Filter Section */}
              <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                <CollapsibleContent className='space-y-4'>
                  <div className='flex flex-row gap-3 p-2 md:p-2 bg-white '>
                    <div className='flex-1'>
                      <div className='relative'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                        <Input
                          type='text'
                          placeholder='Search products by name, SKU, or category...'
                          className='pl-10 h-9'
                          value={inputValue}
                          onChange={(event) =>
                            setInputValue(event.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className='flex flex-row gap-2'>
                      <CategoryFilterDropdown
                        categories={categories}
                        setSelectedCategory={setSelectedCategory}
                        selectedCategory={selectedCategory}
                      />
                      {(inputValue || selectedCategory) && (
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => {
                            setInputValue("");
                            setSelectedCategory("");
                          }}
                          className='text-red-500 hover:text-gray-700 h-9'>
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardHeader>
            <CardContent className='p-0 md:shadow-none '>
              {/* Mobile Tabs - only show on mobile since desktop tabs are above */}
              <div className='lg:hidden p-4 border-b'>
                <TabsList className='grid grid-cols-5 w-full'>
                  <TabsTrigger value='all' className='text-xs'>
                    All
                  </TabsTrigger>
                  <TabsTrigger value='active' className='text-xs'>
                    ✓
                  </TabsTrigger>
                  <TabsTrigger value='inactive' className='text-xs'>
                    !
                  </TabsTrigger>
                  <TabsTrigger value='instock' className='text-xs'>
                    ↑
                  </TabsTrigger>
                  <TabsTrigger value='outofstock' className='text-xs'>
                    ↓
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value='all' className='m-0'>
                <div className='max-h-[600px] overflow-y-auto'>
                  {products.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-12 text-center'>
                      <Package className='h-16 w-16 text-gray-300 mb-4' />
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        No products found
                      </h3>
                      <p className='text-gray-600 mb-6 max-w-sm'>
                        {inputValue
                          ? `No products match "${inputValue}"`
                          : "Get started by adding your first product"}
                      </p>
                      {hasRequiredPermission("product", "create") &&
                        !inputValue && (
                          <Button
                            onClick={() => navigate("/product/create")}
                            className='bg-indigo-600 hover:bg-indigo-700'>
                            <PlusCircle className='h-4 w-4 mr-2' />
                            Add Your First Product
                          </Button>
                        )}
                    </div>
                  ) : (
                    <div className='py-4 px-2'>
                      {/* Mobile Grid View */}
                      <div className='md:hidden'>
                        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 max-h-[500px] overflow-y-auto'>
                          {products.map((product: IProduct, index: number) =>
                            renderMobileProductView(product, index)
                          )}
                        </div>
                      </div>

                      {/* Desktop View */}
                      <div className='hidden md:block'>
                        <div className='border rounded-lg overflow-hidden '>
                          <div className='max-h-[500px] overflow-y-auto'>
                            {viewType === "grid" ? (
                              <div className='p-4 max-h-[500px] overflow-y-auto'>
                                {renderGridView()}
                              </div>
                            ) : (
                              <Table
                                divClass='relative max-h-[499px] overflow-y-auto border-sidebar'
                                className='border-sidebar'>
                                <TableHeader className='sticky top-0 bg-white border-b z-10'>
                                  <TableRow className='bg-sidebar text-sidebar-foreground'>
                                    <TableHead className='w-12 bg-sidebar text-sidebar-foreground'>
                                      <Image className='h-4 w-4' />
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Product
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      SKU
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Category
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Price
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Variant
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Stock
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Sold
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Returned
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Last Updated At
                                    </TableHead>
                                    <TableHead className='w-16 bg-sidebar text-sidebar-foreground'>
                                      <MoreHorizontal className='h-4 w-4' />
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {products.map((product: IProduct) => (
                                    <SingleItem
                                      key={product?.id}
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
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Other Tab Contents with Scrolling */}
              <TabsContent value='active' className='m-0'>
                <div className='max-h-[600px] overflow-y-auto'>
                  {products.filter((p: IProduct) => p.active).length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-12 text-center'>
                      <CheckCircle className='h-16 w-16 text-gray-300 mb-4' />
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        No active products
                      </h3>
                      <p className='text-gray-600'>
                        All your products are currently inactive
                      </p>
                    </div>
                  ) : (
                    <div className='py-4 px-2'>
                      <div className='grid grid-cols-2 gap-3 md:hidden sm:grid-cols-3'>
                        {products
                          .filter((p: IProduct) => p.active)
                          .map((product: IProduct, index: number) =>
                            renderMobileProductView(product, index)
                          )}
                      </div>

                      {/* Desktop View */}
                      <div className='hidden md:block'>
                        <div className='border rounded-lg overflow-hidden '>
                          <div className='max-h-[500px] overflow-y-auto'>
                            {viewType === "grid" ? (
                              <div className='p-4 max-h-[500px] overflow-y-auto'>
                                {renderGridView()}
                              </div>
                            ) : (
                              <Table
                                divClass='relative max-h-[499px] overflow-y-auto border-sidebar'
                                className='border-sidebar'>
                                <TableHeader className='sticky top-0 bg-white border-b z-10'>
                                  <TableRow className='bg-sidebar text-sidebar-foreground'>
                                    <TableHead className='w-12 bg-sidebar text-sidebar-foreground'>
                                      <Image className='h-4 w-4' />
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Product
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      SKU
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Category
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Price
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Variant
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Stock
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Sold
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Returned
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Last Updated At
                                    </TableHead>
                                    <TableHead className='w-16 bg-sidebar text-sidebar-foreground'>
                                      <MoreHorizontal className='h-4 w-4' />
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {products
                                    .filter((p: IProduct) => p.active)
                                    .map((product: IProduct) => (
                                      <SingleItem
                                        key={product?.id}
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
                                        deleteExistingProduct={
                                          deleteProductData
                                        }
                                        updatedAt={
                                          product?.timestamps?.updatedAt
                                        }
                                      />
                                    ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='inactive' className='m-0'>
                <div className='max-h-[600px] overflow-y-auto'>
                  {products.filter((p: IProduct) => !p.active).length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-12 text-center'>
                      <AlertCircle className='h-16 w-16 text-gray-300 mb-4' />
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        No inactive products
                      </h3>
                      <p className='text-gray-600'>
                        All your products are currently active
                      </p>
                    </div>
                  ) : (
                    <div className='py-4 px-2'>
                      <div className='grid grid-cols-2 gap-3 lg:hidden sm:grid-cols-3'>
                        {products
                          .filter((p: IProduct) => !p.active)
                          .map((product: IProduct, index: number) =>
                            renderMobileProductView(product, index)
                          )}
                      </div>
                      {/* Desktop View */}
                      <div className='hidden md:block'>
                        <div className='border rounded-lg overflow-hidden '>
                          <div className='max-h-[500px] overflow-y-auto'>
                            {viewType === "grid" ? (
                              <div className='p-4 max-h-[500px] overflow-y-auto'>
                                {renderGridView()}
                              </div>
                            ) : (
                              <Table
                                divClass='relative max-h-[499px] overflow-y-auto border-sidebar'
                                className='border-sidebar'>
                                <TableHeader className='sticky top-0 bg-white border-b z-10'>
                                  <TableRow className='bg-sidebar text-sidebar-foreground'>
                                    <TableHead className='w-12 bg-sidebar text-sidebar-foreground'>
                                      <Image className='h-4 w-4' />
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Product
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      SKU
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Category
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Price
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Variant
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Stock
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Sold
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Returned
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Last Updated At
                                    </TableHead>
                                    <TableHead className='w-16 bg-sidebar text-sidebar-foreground'>
                                      <MoreHorizontal className='h-4 w-4' />
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {products
                                    .filter((p: IProduct) => !p.active)
                                    .map((product: IProduct) => (
                                      <SingleItem
                                        key={product?.id}
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
                                        deleteExistingProduct={
                                          deleteProductData
                                        }
                                        updatedAt={
                                          product?.timestamps?.updatedAt
                                        }
                                      />
                                    ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='instock' className='m-0'>
                <div className='max-h-[600px] overflow-y-auto'>
                  {products.filter((p: IProduct) => p.quantity > 0).length ===
                  0 ? (
                    <div className='flex flex-col items-center justify-center py-12 text-center'>
                      <TrendingUp className='h-16 w-16 text-gray-300 mb-4' />
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        No products in stock
                      </h3>
                      <p className='text-gray-600'>
                        Time to restock your inventory
                      </p>
                    </div>
                  ) : (
                    <div className='py-4 px-2'>
                      <div className='grid grid-cols-2 gap-3 lg:hidden sm:grid-cols-3'>
                        {products
                          .filter((p: IProduct) => p.quantity > 0)
                          .map((product: IProduct, index: number) =>
                            renderMobileProductView(product, index)
                          )}
                      </div>
                      {/* Desktop View */}
                      <div className='hidden md:block'>
                        <div className='border rounded-lg overflow-hidden '>
                          <div className='max-h-[500px] overflow-y-auto'>
                            {viewType === "grid" ? (
                              <div className='p-4 max-h-[500px] overflow-y-auto'>
                                {renderGridView()}
                              </div>
                            ) : (
                              <Table
                                divClass='relative max-h-[499px] overflow-y-auto border-sidebar'
                                className='border-sidebar'>
                                <TableHeader className='sticky top-0 bg-white border-b z-10'>
                                  <TableRow className='bg-sidebar text-sidebar-foreground'>
                                    <TableHead className='w-12 bg-sidebar text-sidebar-foreground'>
                                      <Image className='h-4 w-4' />
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Product
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      SKU
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Category
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Price
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Variant
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Stock
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Sold
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Returned
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Last Updated At
                                    </TableHead>
                                    <TableHead className='w-16 bg-sidebar text-sidebar-foreground'>
                                      <MoreHorizontal className='h-4 w-4' />
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {products
                                    .filter((p: IProduct) => p?.quantity > 0)
                                    .map((product: IProduct) => (
                                      <SingleItem
                                        key={product?.id}
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
                                        deleteExistingProduct={
                                          deleteProductData
                                        }
                                        updatedAt={
                                          product?.timestamps?.updatedAt
                                        }
                                      />
                                    ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='outofstock' className='m-0'>
                <div className='max-h-[600px] overflow-y-auto'>
                  {products.filter((p: IProduct) => p.quantity <= 0).length ===
                  0 ? (
                    <div className='flex flex-col items-center justify-center py-12 text-center'>
                      <TrendingDown className='h-16 w-16 text-green-400 mb-4' />
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        Great! No products out of stock
                      </h3>
                      <p className='text-gray-600'>
                        Your inventory is well stocked
                      </p>
                    </div>
                  ) : (
                    <div className='py-4 px-2'>
                      <div className='grid grid-cols-2 gap-3 lg:hidden sm:grid-cols-3'>
                        {products
                          .filter((p: IProduct) => p.quantity <= 0)
                          .map((product: IProduct, index: number) =>
                            renderMobileProductView(product, index)
                          )}
                      </div>
                      {/* Desktop View */}
                      <div className='hidden md:block'>
                        <div className='border rounded-lg overflow-hidden '>
                          <div className='max-h-[500px] overflow-y-auto'>
                            {viewType === "grid" ? (
                              <div className='p-4 max-h-[500px] overflow-y-auto'>
                                {renderGridView()}
                              </div>
                            ) : (
                              <Table
                                divClass='relative max-h-[499px] overflow-y-auto border-sidebar'
                                className='border-sidebar'>
                                <TableHeader className='sticky top-0 bg-white border-b z-10'>
                                  <TableRow className='bg-sidebar text-sidebar-foreground'>
                                    <TableHead className='w-12 bg-sidebar text-sidebar-foreground'>
                                      <Image className='h-4 w-4' />
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Product
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      SKU
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Category
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Price
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Variant
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Stock
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Sold
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Returned
                                    </TableHead>
                                    <TableHead className='font-semibold bg-sidebar text-sidebar-foreground'>
                                      Last Updated At
                                    </TableHead>
                                    <TableHead className='w-16 bg-sidebar text-sidebar-foreground'>
                                      <MoreHorizontal className='h-4 w-4' />
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {products
                                    .filter((p: IProduct) => p.quantity <= 0)
                                    .map((product: IProduct) => (
                                      <SingleItem
                                        key={product?.id}
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
                                        deleteExistingProduct={
                                          deleteProductData
                                        }
                                        updatedAt={
                                          product?.timestamps?.updatedAt
                                        }
                                      />
                                    ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>

            {/* Pagination */}
            {inputValue === "" && (
              <CardFooter className='border-0  pt-0'>
                <div className='flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 w-full'>
                  <div className='flex justify-between items-center w-full'>
                    <div className='text-sm text-gray-600'>
                      Showing{" "}
                      <span className='font-semibold text-gray-900'>
                        {Math.max(1, (currentPageNum - 1) * limit + 1)}-
                        {Math.min(currentPageNum * limit, totalProducts)}
                      </span>{" "}
                      of{" "}
                      <span className='font-semibold text-gray-900'>
                        {totalProducts}
                      </span>{" "}
                      products
                    </div>

                    <Select
                      value={`${limit}`}
                      onValueChange={(value: string) =>
                        setLimit(parseInt(value, 10))
                      }>
                      <SelectTrigger className='w-auto   md:hidden h-8'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Items per page</SelectLabel>
                          <SelectItem value='10'>10</SelectItem>
                          <SelectItem value='20'>20</SelectItem>
                          <SelectItem value='50'>50</SelectItem>
                          <SelectItem value='100'>100</SelectItem>
                          <SelectItem value='150'>150</SelectItem>
                          <SelectItem value='200'>200</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex justify-between items-center space-x-2'>
                    <Button
                      disabled={currentPageNum < 2}
                      variant='outline'
                      size='sm'
                      onClick={() => updateCurrentPage(-1)}>
                      <ChevronLeft className='h-4 w-4' />
                      Previous
                    </Button>

                    <Select
                      value={`${limit}`}
                      onValueChange={(value: string) =>
                        setLimit(parseInt(value, 10))
                      }>
                      <SelectTrigger className='w-[70px] hidden md:flex h-8 justify-between items-center '>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Items per page</SelectLabel>
                          <SelectItem value='10'>10</SelectItem>
                          <SelectItem value='20'>20</SelectItem>
                          <SelectItem value='50'>50</SelectItem>
                          <SelectItem value='100'>100</SelectItem>
                          <SelectItem value='150'>150</SelectItem>
                          <SelectItem value='200'>200</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <Button
                      disabled={currentPageNum >= totalPages}
                      variant='outline'
                      size='sm'
                      onClick={() => updateCurrentPage(1)}>
                      Next
                      <ChevronRight className='h-4 w-4 ' />
                    </Button>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        </Tabs>
      </div>
    );
  };

  const mainView = () => {
    if (productFetching) {
      return (
        <>
          {/* Mobile Loading */}
          <div className='sm:hidden'>
            <MobileProductEmpty type='loading' />
          </div>

          {/* Desktop Loading */}
          <div className='hidden sm:block space-y-4'>
            <SkeletonCard title='Loading Product Data...' />
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {[...Array(8)].map((_, i) => (
                <Card key={i} className='animate-pulse'>
                  <CardContent className='p-4'>
                    <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                    <div className='h-8 bg-gray-200 rounded w-1/2 mb-2'></div>
                    <div className='h-3 bg-gray-200 rounded w-full'></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      );
    } else if (inputValue !== "" || (products && products.length > 0)) {
      return (
        <>
          {renderMobileView()}
          <div className='hidden sm:block'>{renderDesktopView()}</div>
        </>
      );
    } else {
      return (
        <>
          {renderMobileEmptyView()}
          <div className='hidden sm:block'>{renderDesktopEmptyView()}</div>
        </>
      );
    }
  };

  return (
    <>
      {mainView()}
      {/* Desktop Container */}
      <div className='hidden sm:block w-full space-y-4 md:p-4'>
        {/* Desktop content will be shown through renderDesktopView */}
      </div>
    </>
  );
};

export default ProductList;
