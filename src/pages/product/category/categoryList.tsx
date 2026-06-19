// Updated CategoryList Component
import { PlusCircle, FolderTree, RefreshCw, Search } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";

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
import { Input } from "../../../components/ui/input";
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
import MainView from "../../../coreComponents/mainView";

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
    null,
  );
  const [viewMode, setViewMode] = useState<"flat" | "tree">("flat");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchCategories();
    //eslint-disable-next-line
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCategories();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Calculate statistics
  const totalCategories = categories.length;
  const activeCategories = categories.filter((cat) => cat.active).length;
  const inactiveCategories = categories.filter((cat) => !cat.active).length;
  const totalProducts = categories.reduce(
    (sum, cat) => sum + (cat.totalProducts || 0),
    0,
  );

  // Filter categories by search query
  const getFilteredBySearch = (categoryList: ICategory[]) => {
    if (!searchQuery.trim()) return categoryList;
    return categoryList.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  useEffect(() => {
    if (!!selectedCategory) setOpenUpdateDialog(true);
  }, [selectedCategory]);

  const getCategoryBreadcrumb = (
    parentId: string | null,
    existingCategory: ICategory,
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
        type='no-categories'
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
    level = 0,
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
      <div className='p-4 sm:p-6'>
        {renderTreeView(buildCategoryTree(categoryList))}
      </div>
    ) : (
      <Table>
        <TableHeader>
          <TableRow className='bg-slate-50 hover:bg-slate-50 border-b border-slate-100'>
            <TableHead className='hidden w-[100px] sm:table-cell'>
              <span className='sr-only'>Image</span>
            </TableHead>
            <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
              Name
            </TableHead>
            <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
              Hierarchy
            </TableHead>
            <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
              Status
            </TableHead>
            <TableHead className='hidden md:table-cell text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
              Level
            </TableHead>
            <TableHead className='hidden md:table-cell text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
              Total Products
            </TableHead>
            <TableHead className='hidden md:table-cell text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
              Discount
            </TableHead>
            {hasSomePermissionsForPage("category", ["edit", "delete"]) && (
              <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                <span className='sr-only'>Actions</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categoryList.map((category: ICategory) =>
            renderCategoryRow(category),
          )}
        </TableBody>
      </Table>
    );

  const renderMobileView = () => {
    const filteredCategories = getFilteredBySearch(
      getFilteredCategories(categories),
    );

    let displayCategories = filteredCategories;
    if (activeTab === "all") {
      displayCategories = filteredCategories;
    } else if (activeTab === "active") {
      displayCategories = getFilteredBySearch(
        getFilteredCategories(categories.filter((cat) => cat.active)),
      );
    } else if (activeTab === "inactive") {
      displayCategories = getFilteredBySearch(
        getFilteredCategories(categories.filter((cat) => !cat.active)),
      );
    }

    return (
      <div className='min-h-screen bg-gray-50 sm:hidden'>
        {/* Mobile Header */}
        <MobileCategoryHeader
          totalCategories={totalCategories}
          activeCategories={activeCategories}
          inactiveCategories={inactiveCategories}
          hasCreatePermission={hasRequiredPermission("category", "create")}
          onCreateCategory={() => setOpenCreateDialog(true)}
          selectedTab={activeTab}
        />

        {/* Mobile Filters */}
        <MobileCategoryFilters
          selectedTab={activeTab}
          onTabChange={setActiveTab}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          levelFilter={levelFilter}
          onLevelFilterChange={setLevelFilter}
          uniqueLevels={getUniqueLevels()}
          totalCategories={totalCategories}
          activeCount={activeCategories}
          inactiveCount={inactiveCategories}
        />

        {/* Mobile Categories List */}
        <div className='px-4 py-4'>
          {displayCategories.length === 0 ? (
            <MobileCategoryEmpty
              type='no-filtered-results'
              onClearFilters={() => {
                setViewMode("flat");
                setLevelFilter("all");
              }}
              onRetry={fetchCategories}
            />
          ) : (
            <div className='space-y-4 pb-20'>
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
                  breadcrumb={getCategoryBreadcrumb(
                    category?.parentId ?? null,
                    category,
                  )}
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
      <div className='hidden sm:block'>
        <div className='min-h-screen bg-slate-50/60'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
            {/* Page Header */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 shadow-sm shadow-blue-200'>
                  <FolderTree className='h-5 w-5 text-white' />
                </div>
                <div>
                  <h1 className='text-xl font-semibold text-slate-900 leading-tight'>
                    Categories
                  </h1>
                  <p className='text-sm text-slate-500 mt-0.5'>
                    Organize and manage product categories
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className='inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 disabled:opacity-50 shadow-sm'>
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  <span className='hidden sm:inline'>Refresh</span>
                </button>

                {hasRequiredPermission("category", "create") && (
                  <button
                    onClick={() => setOpenCreateDialog(true)}
                    className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-150 shadow-sm shadow-blue-200'>
                    <PlusCircle className='h-4 w-4' />
                    Add Category
                  </button>
                )}
              </div>
            </div>

            {/* Summary Stats Strip */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              {[
                {
                  label: "Total Categories",
                  value: totalCategories.toString(),
                  accent: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  label: "Active Categories",
                  value: activeCategories.toString(),
                  accent: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  label: "Inactive Categories",
                  value: inactiveCategories.toString(),
                  accent: "text-rose-600",
                  bg: "bg-rose-50",
                },
                {
                  label: "Total Products",
                  value: totalProducts.toString(),
                  accent: "text-amber-600",
                  bg: "bg-amber-50",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className='flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm'>
                  <div
                    className={`w-2 h-2 rounded-full ${stat.bg.replace("bg-", "bg-").replace("50", "400")}`}
                  />
                  <div className='min-w-0'>
                    <p
                      className={`text-lg font-semibold ${stat.accent} leading-none`}>
                      {stat.value}
                    </p>
                    <p className='text-xs text-slate-500 mt-0.5 truncate'>
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className='w-full'>
                {/* Tab Bar */}
                <div className='border-b border-slate-100'>
                  <TabsList className='h-auto bg-transparent p-0 gap-0 rounded-none flex justify-start'>
                    <TabsTrigger
                      value='all'
                      className='
                        relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent
                        text-slate-500 hover:text-slate-700
                        data-[state=active]:text-blue-600 data-[state=active]:border-blue-600
                        data-[state=active]:bg-transparent
                        transition-all duration-150
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                      '>
                      <FolderTree className='h-4 w-4' />
                      All Categories
                    </TabsTrigger>
                    <TabsTrigger
                      value='active'
                      className='
                        relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent
                        text-slate-500 hover:text-slate-700
                        data-[state=active]:text-blue-600 data-[state=active]:border-blue-600
                        data-[state=active]:bg-transparent
                        transition-all duration-150
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                      '>
                      <FolderTree className='h-4 w-4' />
                      Active
                    </TabsTrigger>
                    <TabsTrigger
                      value='inactive'
                      className='
                        relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent
                        text-slate-500 hover:text-slate-700
                        data-[state=active]:text-blue-600 data-[state=active]:border-blue-600
                        data-[state=active]:bg-transparent
                        transition-all duration-150
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                      '>
                      <FolderTree className='h-4 w-4' />
                      Inactive
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab Contents */}
                <TabsContent
                  value='all'
                  className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
                  {renderCategoryTabContent(
                    getFilteredBySearch(getFilteredCategories(categories)),
                  )}
                </TabsContent>

                <TabsContent
                  value='active'
                  className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
                  {renderCategoryTabContent(
                    getFilteredBySearch(
                      getFilteredCategories(
                        categories.filter((cat) => cat.active),
                      ),
                    ),
                  )}
                </TabsContent>

                <TabsContent
                  value='inactive'
                  className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
                  {renderCategoryTabContent(
                    getFilteredBySearch(
                      getFilteredCategories(
                        categories.filter((cat) => !cat.active),
                      ),
                    ),
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryTabContent = (categoryList: ICategory[]) => {
    if (categoryList.length === 0) {
      return (
        <div className='text-center py-12'>
          <FolderTree className='mx-auto h-12 w-12 text-slate-300 mb-4' />
          <h3 className='text-lg font-semibold text-slate-900 mb-2'>
            No categories found
          </h3>
          <p className='text-sm text-slate-500'>
            {searchQuery || levelFilter !== "all"
              ? "Try adjusting your filters or search query"
              : "Get started by creating your first category"}
          </p>
          {hasRequiredPermission("category", "create") &&
            !searchQuery &&
            levelFilter === "all" && (
              <button
                onClick={() => setOpenCreateDialog(true)}
                className='mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-150 shadow-sm shadow-blue-200'>
                <PlusCircle className='h-4 w-4' />
                Add Category
              </button>
            )}
        </div>
      );
    }

    return (
      <div className='space-y-4'>
        {/* Filter Bar */}
        <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between'>
          <div className='flex flex-col sm:flex-row gap-3 flex-1'>
            {/* Search */}
            <div className='relative flex-1 max-w-xs'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400' />
              <Input
                placeholder='Search categories...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9 h-9 text-sm border-slate-200 bg-white focus-visible:ring-blue-500'
              />
            </div>

            {/* Level Filter */}
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className='w-full sm:w-44 h-9 text-sm border-slate-200 bg-white focus:ring-blue-500'>
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

            {/* View Mode Toggle */}
            <Select
              value={viewMode}
              onValueChange={(value: "flat" | "tree") => setViewMode(value)}>
              <SelectTrigger className='w-full sm:w-36 h-9 text-sm border-slate-200 bg-white focus:ring-blue-500'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='flat'>Flat View</SelectItem>
                <SelectItem value='tree'>Tree View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || levelFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setLevelFilter("all");
              }}
              className='text-sm text-slate-600 hover:text-slate-800 font-medium'>
              Clear filters
            </button>
          )}
        </div>

        {/* Table Container */}
        <div className='rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden'>
          {renderCategoryTable(categoryList)}
        </div>

        {/* Footer Count */}
        <div className='text-xs text-slate-500'>
          Showing <strong>{categoryList.length}</strong> of{" "}
          <strong>{categories.length}</strong> categories
        </div>
      </div>
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
            <MobileCategoryEmpty type='loading' />
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
          <div className='hidden sm:block'>{renderDesktopEmptyView()}</div>
        </>
      );
    }
  };

  return (
    <MainView title='Categories'>
      <>
        {mainView()}
        {renderAddNewCategoryDialog()}
        {!!categories && categories.length > 0 && renderUpdateCategoryDialog()}
      </>
    </MainView>
  );
};

export default CategoryList;
