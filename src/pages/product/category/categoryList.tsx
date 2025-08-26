// Updated CategoryList Component
import { PlusCircle, FolderTree } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import SingleItem from "../components/singleCategoryList";
import EmptyView from "../../../coreComponents/emptyView";
import { ICategory } from "../interface";
import useCategory from "../hooks/useCategory";
import { useEffect, useState } from "react";
import { SkeletonCard } from "../../../coreComponents/sekeleton";
import UpdateCategory from "./updateCategory";
import useRoleCheck from "../../auth/hooks/useRoleCheck";
import MobileCategoryHeader from "./components/MobileCategoryHeader";
import MobileCategoryCard from "./components/MobileCategoryCard";
import MobileCategoryFilters from "./components/MobileCategoryFilters";
import MobileCategoryEmpty from "./components/MobileCategoryEmpty";

const CategoryList = () => {
  const {
    loading,
    categories,
    fetchCategories,
    createCategory,
    editExistingCategory,
    deleteExistingCategory,
  } = useCategory();
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"flat" | "tree">("flat");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState("all");

  useEffect(() => {
    fetchCategories();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!!selectedCategory) setOpenUpdateDialog(true);
  }, [selectedCategory]);

  const getCategoryBreadcrumb = (
    parentId: string | null,
    existingCategory: ICategory
  ): string => {
    if (!parentId) return existingCategory?.name || "New Category";

    const parent = categories.find((cat) => cat.id === parentId);
    if (!parent) return "Root Category";

    const breadcrumb = parent.categoryHierarchy
      ? parent.categoryHierarchy.map((cat: any) => cat.name).join(" > ") +
        " > " +
        parent.name
      : parent.name;

    return breadcrumb + " > " + (existingCategory?.name || "New Category");
  };

  // Get unique levels for filtering
  const getUniqueLevels = () => {
    const levels =
      //@ts-ignore
      !!categories && [...new Set(categories.map((cat) => cat.level))].sort();
    return levels;
  };

  // Filter categories by level
  const getFilteredCategories = (categoryList: ICategory[]) => {
    if (levelFilter === "all") return categoryList;
    return categoryList.filter((cat) => cat.level === parseInt(levelFilter));
  };

  // Build tree structure for tree view
  const buildCategoryTree = (categories: ICategory[]): ICategory[] => {
    const categoryMap = new Map();
    const rootCategories: ICategory[] = [];

    // Create a map of all categories
    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Build the tree
    categories.forEach((category) => {
      const categoryNode = categoryMap.get(category.id);
      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId);
        parent.children.push(categoryNode);
      } else {
        rootCategories.push(categoryNode);
      }
    });

    return rootCategories;
  };

  const renderMobileEmptyView = () => {
    return (
      <MobileCategoryEmpty
        type="no-categories"
        hasCreatePermission={hasRequiredPermission("category", "create")}
        onCreateCategory={() => setOpenCreateDialog(true)}
        onRetry={fetchCategories}
      />
    );
  };

  const renderDesktopEmptyView = () => {
    return hasRequiredPermission("category", "create") ? (
      <EmptyView
        title='You have no category'
        description='You can start adding products as soon as you add a category.'
        buttonText='Add New Category'
        handleButtonClick={() => {
          setOpenCreateDialog(true);
        }}
      />
    ) : (
      <EmptyView
        title='You have no category'
        description='You can start adding products as soon as you add a category.'
      />
    );
  };

  // Render single category row with hierarchy indication
  const renderCategoryRow = (category: ICategory, isChild = false) => (
    <SingleItem
      key={category.id}
      id={category.id}
      image={category.img}
      name={category.name}
      active={category.active}
      discount={category.discount}
      totalProduct={category.totalProducts}
      level={category.level}
      parentName={category.parentCategoryName}
      breadcrumb={getCategoryBreadcrumb(category?.parentId ?? null, category)}
      isChild={isChild}
      handleEditBtnClick={() => {
        setSelectedCategory(category);
      }}
      deleteExistingCategory={deleteExistingCategory}
    />
  );

  // Render tree view recursively
  const renderTreeView = (
    categories: ICategory[],
    level = 0
  ): JSX.Element[] => {
    return categories.map((category) => (
      <div key={category.id}>
        {renderCategoryRow(category, level > 0)}
        {category.children && category.children.length > 0 && (
          <div className='ml-4'>
            {renderTreeView(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const renderCategoryTable = (categoryList: ICategory[]) =>
    viewMode === "tree" ? (
      renderTreeView(buildCategoryTree(categoryList))
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='hidden w-[100px] sm:table-cell'>
              <span className='sr-only'>Image</span>
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Hierarchy</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='hidden md:table-cell'>Level</TableHead>
            <TableHead className='hidden md:table-cell'>
              Total Products
            </TableHead>
            <TableHead className='hidden md:table-cell'>Discount</TableHead>
            {hasSomePermissionsForPage("category", ["edit", "delete"]) && (
              <TableHead>
                <span className='sr-only'>Actions</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categoryList.map((category: ICategory) =>
            renderCategoryRow(category)
          )}
        </TableBody>
      </Table>
    );

  const renderMobileView = () => {
    const filteredCategories = getFilteredCategories(categories);
    const activeCategories = categories.filter(cat => cat.active);
    const inactiveCategories = categories.filter(cat => !cat.active);
    
    let displayCategories = filteredCategories;
    if (selectedTab === "all") {
      displayCategories = filteredCategories;
    } else if (selectedTab === "active") {
      displayCategories = getFilteredCategories(activeCategories);
    } else if (selectedTab === "inactive") {
      displayCategories = getFilteredCategories(inactiveCategories);
    }

    return (
      <div className="min-h-screen bg-gray-50 sm:hidden">
        {/* Mobile Header */}
        <MobileCategoryHeader
          totalCategories={categories.length}
          activeCategories={activeCategories.length}
          inactiveCategories={inactiveCategories.length}
          hasCreatePermission={hasRequiredPermission("category", "create")}
          onCreateCategory={() => setOpenCreateDialog(true)}
          selectedTab={selectedTab}
        />

        {/* Mobile Filters */}
        <MobileCategoryFilters
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          levelFilter={levelFilter}
          onLevelFilterChange={setLevelFilter}
          uniqueLevels={getUniqueLevels()}
          totalCategories={categories.length}
          activeCount={activeCategories.length}
          inactiveCount={inactiveCategories.length}
        />

        {/* Mobile Categories List */}
        <div className="px-4 py-4">
          {displayCategories.length === 0 ? (
            <MobileCategoryEmpty
              type="no-filtered-results"
              onClearFilters={() => {
                setViewMode("flat");
                setLevelFilter("all");
              }}
              onRetry={fetchCategories}
            />
          ) : (
            <div className="space-y-4 pb-20">
              {displayCategories.map((category: ICategory) => (
                <MobileCategoryCard
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  image={category.img}
                  active={category.active}
                  discount={category.discount}
                  totalProducts={category.totalProducts || 0}
                  level={category.level || 0}
                  parentName={category.parentCategoryName}
                  breadcrumb={getCategoryBreadcrumb(category?.parentId ?? null, category)}
                  onEdit={() => setSelectedCategory(category)}
                  onDelete={deleteExistingCategory}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDesktopView = () => {
    return (
      <div className='hidden sm:block w-[80%] mx-auto my-4'>
        {renderCategoryListView()}
      </div>
    );
  };

  const renderCategoryListView = () => {
    return (
      <Tabs defaultValue='all'>
        <div className='flex items-center w-full mb-4'>
          <TabsList>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='active'>Active</TabsTrigger>
            <TabsTrigger value='inactive'>Inactive</TabsTrigger>
          </TabsList>

          <div className='ml-4 flex items-center gap-2'>
            {/* View Mode Toggle */}
            <Select
              value={viewMode}
              onValueChange={(value: "flat" | "tree") => setViewMode(value)}>
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='flat'>Flat View</SelectItem>
                <SelectItem value='tree'>Tree View</SelectItem>
              </SelectContent>
            </Select>

            {/* Level Filter */}
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className='w-32'>
                <SelectValue placeholder='All Levels' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Levels</SelectItem>
                {getUniqueLevels().map((level) => (
                  <SelectItem key={level} value={level.toString()}>
                    Level {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasRequiredPermission("category", "create") && (
            <div className='ml-auto flex items-center gap-2'>
              <Button
                size='sm'
                className='h-7 gap-1'
                onClick={() => {
                  setOpenCreateDialog(true);
                }}>
                <PlusCircle className='h-3.5 w-3.5' />
                <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
                  Add Category
                </span>
              </Button>
            </div>
          )}
        </div>

        <TabsContent value='all'>
          <Card x-chunk='dashboard-06-chunk-0'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FolderTree className='h-5 w-5' />
                Categories
                {levelFilter !== "all" && (
                  <Badge variant='secondary'>Level {levelFilter}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Manage your categories and view their sales performance.
                Categories are organized hierarchically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCategoryTable(getFilteredCategories(categories))}
            </CardContent>
            <CardFooter>
              <div className='w-full flex justify-between items-center'>
                <div className='text-xs text-muted-foreground'>
                  Showing{" "}
                  <strong>{getFilteredCategories(categories).length}</strong> of{" "}
                  {categories.length} categories
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value='active'>
          <Card x-chunk='dashboard-06-chunk-0'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FolderTree className='h-5 w-5' />
                Active Categories
              </CardTitle>
              <CardDescription>
                Currently active categories in your system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCategoryTable(
                getFilteredCategories(categories.filter((cat) => cat.active))
              )}
            </CardContent>
            <CardFooter>
              <div className='w-full flex justify-between items-center'>
                <div className='text-xs text-muted-foreground'>
                  Showing{" "}
                  <strong>
                    {
                      getFilteredCategories(
                        categories.filter((cat) => cat.active)
                      ).length
                    }
                  </strong>{" "}
                  active categories
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value='inactive'>
          <Card x-chunk='dashboard-06-chunk-0'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FolderTree className='h-5 w-5' />
                Inactive Categories
              </CardTitle>
              <CardDescription>
                Currently inactive categories in your system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCategoryTable(
                getFilteredCategories(categories.filter((cat) => !cat.active))
              )}
            </CardContent>
            <CardFooter>
              <div className='w-full flex justify-between items-center'>
                <div className='text-xs text-muted-foreground'>
                  Showing{" "}
                  <strong>
                    {
                      getFilteredCategories(
                        categories.filter((cat) => !cat.active)
                      ).length
                    }
                  </strong>{" "}
                  inactive categories
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
        categories={categories}
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
        categories={categories}
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
      return (
        <>
          {/* Mobile Loading */}
          <div className='sm:hidden'>
            <MobileCategoryEmpty type="loading" />
          </div>
          
          {/* Desktop Loading */}
          <div className='hidden sm:block'>
            <SkeletonCard title='Categories are loading...' />
          </div>
        </>
      );
    } else if (!!categories && categories.length > 0) {
      return (
        <>
          {renderMobileView()}
          {renderDesktopView()}
        </>
      );
    } else {
      return (
        <>
          {renderMobileEmptyView()}
          <div className='hidden sm:block'>
            {renderDesktopEmptyView()}
          </div>
        </>
      );
    }
  };

  return (
    <>
      {mainView()}
      {renderAddNewCategoryDialog()}
      {!!categories && categories.length > 0 && renderUpdateCategoryDialog()}
      
      {/* Desktop Container */}
      <div className='hidden sm:block w-[80%] mx-auto my-4'>
        {/* Desktop content will be shown through renderDesktopView */}
      </div>
    </>
  );
};

export default CategoryList;
