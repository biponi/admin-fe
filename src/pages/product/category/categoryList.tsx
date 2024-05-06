import { PlusCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import SingleItem from "../components/singleCategoryList";
import EmptyView from "../../../coreComponents/emptyView";
import { ICategory } from "../interface";
import useCategory from "../hooks/useCategory";
import { useEffect, useState } from "react";
import { SkeletonCard } from "../../../coreComponents/sekeleton";
import UpdateCategory from "./updateCategory";

const CatergoryList = () => {
  const {
    loading,
    categories,
    fetchCategories,
    createCategory,
    editExistingCategory,
    deleteExistingCategory,
  } = useCategory();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null
  );

  useEffect(() => {
    fetchCategories();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!!selectedCategory) setOpenUpdateDialog(true);
  }, [selectedCategory]);

  const renderEmptyView = () => {
    return (
      <EmptyView
        title='You have no category'
        description='You can start adding product as soon as you add a category.'
        buttonText='Add New Category'
        handleButtonClick={() => {
          //@ts-ignore
          setOpenCreateDialog(true);
        }}
      />
    );
  };

  const renderCatergoryListView = () => {
    return (
      <Tabs defaultValue='all'>
        <div className='flex items-center w-full'>
          <TabsList>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='active'>Active</TabsTrigger>
            <TabsTrigger value='inactive'>Inactive</TabsTrigger>
          </TabsList>
          <div className='ml-auto flex items-center gap-2'>
            <Button
              size='sm'
              className='h-7 gap-1'
              onClick={() => {
                //@ts-ignore
                setOpenCreateDialog(true);
              }}>
              <PlusCircle className='h-3.5 w-3.5' />
              <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
                Add Category
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value='all'>
          <Card x-chunk='dashboard-06-chunk-0'>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Manage your categories and view their sales performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='hidden w-[100px] sm:table-cell'>
                      <span className='sr-only'>Image</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>

                    <TableHead className='hidden md:table-cell'>
                      Total Products
                    </TableHead>
                    <TableHead className='hidden md:table-cell'>
                      Discount
                    </TableHead>
                    <TableHead>
                      <span className='sr-only'>Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category: ICategory, index: number) => (
                    <SingleItem
                      key={index}
                      id={category?.id}
                      image={category?.img}
                      name={category?.name}
                      active={category?.active}
                      discount={category?.discount}
                      totalProduct={category?.totalProducts}
                      handleEditBtnClick={() => {
                        setSelectedCategory(category);
                      }}
                      deleteExistingCategory={deleteExistingCategory}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className='w-full flex justify-between items-center'>
                <div className='text-xs text-muted-foreground'>
                  Showing <strong>{categories?.length}</strong> categories
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value='active'>
          <Card x-chunk='dashboard-06-chunk-0'>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Manage your categories and view their sales performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='hidden w-[100px] sm:table-cell'>
                      <span className='sr-only'>Image</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>

                    <TableHead className='hidden md:table-cell'>
                      Total Products
                    </TableHead>
                    <TableHead className='hidden md:table-cell'>
                      Discount
                    </TableHead>
                    <TableHead>
                      <span className='sr-only'>Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories
                    .filter((cat) => cat?.active)
                    .map((category: ICategory, index: number) => (
                      <SingleItem
                        key={index}
                        id={category?.id}
                        image={category?.img}
                        name={category?.name}
                        active={category?.active}
                        discount={category?.discount}
                        totalProduct={category?.totalProducts}
                        handleEditBtnClick={() => {
                          setSelectedCategory(category);
                        }}
                        deleteExistingCategory={deleteExistingCategory}
                      />
                    ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className='w-full flex justify-between items-center'>
                <div className='text-xs text-muted-foreground'>
                  Showing{" "}
                  <strong>
                    {categories.filter((cat) => cat?.active).length}
                  </strong>{" "}
                  categories
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value='inactive'>
          <Card x-chunk='dashboard-06-chunk-0'>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Manage your categories and view their sales performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='hidden w-[100px] sm:table-cell'>
                      <span className='sr-only'>Image</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>

                    <TableHead className='hidden md:table-cell'>
                      Total Products
                    </TableHead>
                    <TableHead className='hidden md:table-cell'>
                      Discount
                    </TableHead>
                    <TableHead>
                      <span className='sr-only'>Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories
                    .filter((cat) => !cat?.active)
                    .map((category: ICategory, index: number) => (
                      <SingleItem
                        key={index}
                        id={category?.id}
                        image={category?.img}
                        name={category?.name}
                        active={category?.active}
                        discount={category?.discount}
                        totalProduct={category?.totalProducts}
                        handleEditBtnClick={() => {
                          setSelectedCategory(category);
                        }}
                        deleteExistingCategory={deleteExistingCategory}
                      />
                    ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className='w-full flex justify-between items-center'>
                <div className='text-xs text-muted-foreground'>
                  Showing{" "}
                  <strong>
                    {categories.filter((cat) => !cat?.active).length}
                  </strong>{" "}
                  categories
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    );
  };

  const renderAddNewCategoryDialog = () => {
    return (
      <UpdateCategory
        loading={loading}
        createCategory={createCategory}
        editExistingCategory={editExistingCategory}
        isNewCategory={true}
        open={openCreateDialog}
        handleOpenChange={(open) => setOpenCreateDialog(open)}
      />
    );
  };

  const renderUpdateCategoryDialog = () => {
    return (
      <UpdateCategory
        loading={loading}
        createCategory={createCategory}
        editExistingCategory={editExistingCategory}
        isNewCategory={false}
        open={openUpdateDialog}
        category={selectedCategory}
        handleOpenChange={(open) => setOpenUpdateDialog(open)}
      />
    );
  };

  const mainView = () => {
    if (loading) {
      return <SkeletonCard title='Category is fetching' />;
    } else if (!!categories && categories.length > 0) {
      return renderCatergoryListView();
    } else {
      return renderEmptyView();
    }
  };

  return (
    <div className='w-full sm:w-[95vw]'>
      {mainView()}
      {renderAddNewCategoryDialog()}{" "}
      {!!categories && categories.length > 0 && renderUpdateCategoryDialog()}
    </div>
  );
};

export default CatergoryList;
