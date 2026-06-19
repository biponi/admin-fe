import { useEffect, useRef, useState } from "react";
import useCampaign from "./hooks/useCampaign";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { ICampaign } from "./interface";
import dayjs from "dayjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Ellipsis,
  Plus,
  RefreshCw,
  Search,
  Zap,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
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
import { Button } from "../../components/ui/button";
import MainView from "../../coreComponents/mainView";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { useIsMobile } from "../../hooks/use-mobile";
import MobileCampaignCard from "./components/MobileCampaignCard";
import MobileCampaignHeader from "./components/MobileCampaignHeader";
import MobileCampaignEmpty from "./components/MobileCampaignEmpty";
const DATE_FORMAT = "DD/MM/YYYY HH:mm";

const CampaignList = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();
  const { fetchCampaignList, deleteACampaign } = useCampaign();
  const [campaigns, setCampaigns] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCamIdToDelete, setSelectedCamIdToDelete] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const deleteBtnRef = useRef<any>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCampaignList().then((list) => {
      setCampaigns(list);
      setTimeout(() => setIsRefreshing(false), 800);
    });
  };

  // Calculate statistics
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c: ICampaign) => {
    const now = new Date();
    const startDate = new Date(c.startDate);
    const endDate = new Date(c.endDate);
    return c.active && now >= startDate && now <= endDate;
  }).length;

  const upcomingCampaigns = campaigns.filter((c: ICampaign) => {
    const now = new Date();
    const startDate = new Date(c.startDate);
    return c.active && now < startDate;
  }).length;

  const expiredCampaigns = campaigns.filter((c: ICampaign) => {
    const now = new Date();
    const endDate = new Date(c.endDate);
    return now > endDate;
  }).length;

  // Filter campaigns by tab and status
  const getFilteredCampaigns = () => {
    let filtered = campaigns;

    // Apply tab filter
    if (activeTab === "active") {
      const now = new Date();
      filtered = campaigns.filter((c: ICampaign) => {
        const startDate = new Date(c.startDate);
        const endDate = new Date(c.endDate);
        return c.active && now >= startDate && now <= endDate;
      });
    } else if (activeTab === "upcoming") {
      const now = new Date();
      filtered = campaigns.filter((c: ICampaign) => {
        const startDate = new Date(c.startDate);
        return c.active && now < startDate;
      });
    } else if (activeTab === "expired") {
      const now = new Date();
      filtered = campaigns.filter((c: ICampaign) => {
        const endDate = new Date(c.endDate);
        return now > endDate;
      });
    }

    // Apply search query
    filtered = filtered.filter(
      (c: ICampaign) =>
        c?.title.toLowerCase().includes(query.toLowerCase()) ||
        c?.id?.toLowerCase().includes(query.toLowerCase()),
    );

    return filtered;
  };

  useEffect(() => {
    const getCampaigns = async () => {
      setLoading(true);
      const list = await fetchCampaignList();
      setCampaigns(list);
      setLoading(false);
    };
    getCampaigns();

    //eslint-disable-next-line
  }, []);
  const handleCampaignDelete = async (id: string) => {
    const isDeleted = await deleteACampaign(id);
    if (isDeleted) {
      toast.success("Campaign Deleted Successfully");
      const list = await fetchCampaignList();
      setCampaigns(list);
    }
  };

  const handleUpdateCampaign = (id: string) => {
    navigate(`/campaign/update/${id}`);
  };

  const handleCreateCampaign = () => {
    navigate("/campaign/create");
  };

  const filteredCampaigns = getFilteredCampaigns();

  const renderDeleteDrawerView = () => {
    return (
      <Drawer>
        <DrawerTrigger>
          <button ref={deleteBtnRef} className='hidden'>
            delete
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className='mx-auto'>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className='container'>
            <div className='flex justify-center items-center gap-6'>
              <DrawerClose>
                <Button
                  variant='destructive'
                  onClick={() => {
                    handleCampaignDelete(selectedCamIdToDelete);
                  }}>
                  I'm Sure
                </Button>
              </DrawerClose>
              <DrawerClose>
                <Button
                  variant='outline'
                  onClick={() => setSelectedCamIdToDelete("")}>
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  };
  const renderSingleCampaign = () => {
    if (!filteredCampaigns || filteredCampaigns.length < 1) {
      return (
        <TableRow>
          <TableCell colSpan={6} className='text-center'>
            <Badge variant={"secondary"}>No Campaign Found</Badge>
          </TableCell>
        </TableRow>
      );
    } else {
      return filteredCampaigns.map((cam: ICampaign, index: number) => (
        <TableRow>
          <TableCell className='font-medium'>{index + 1}</TableCell>
          <TableCell>{cam?.title}</TableCell>
          <TableCell>{cam?.products?.length ?? 0}</TableCell>
          <TableCell>
            {!cam?.deliveryDiscountType ||
            cam?.deliveryDiscountType === "none" ? (
              <Badge variant='secondary'>None</Badge>
            ) : cam?.deliveryDiscountType === "free" ? (
              <Badge className='bg-green-100 text-green-800 border-green-300'>
                Free Delivery
              </Badge>
            ) : cam?.deliveryDiscountType === "percentage" ? (
              <Badge className='bg-blue-100 text-blue-800 border-blue-300'>
                {cam?.deliveryDiscountAmount}% off
              </Badge>
            ) : cam?.deliveryDiscountType === "fixed" ? (
              <Badge className='bg-orange-100 text-orange-800 border-orange-300'>
                {cam?.deliveryDiscountAmount} off
              </Badge>
            ) : (
              <Badge variant='secondary'>None</Badge>
            )}
          </TableCell>
          <TableCell>{dayjs(cam?.startDate).format(DATE_FORMAT)}</TableCell>
          <TableCell>{dayjs(cam?.endDate).format(DATE_FORMAT)}</TableCell>
          {hasSomePermissionsForPage("campaign", ["edit", "delete"]) && (
            <TableCell className='text-right'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Ellipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {hasRequiredPermission("campaign", "edit") && (
                    <DropdownMenuItem
                      onClick={() => handleUpdateCampaign(cam?.id)}>
                      Edit
                    </DropdownMenuItem>
                  )}
                  {hasRequiredPermission("campaign", "delete") && (
                    <DropdownMenuItem
                      className='text-red-600'
                      onClick={() => {
                        if (!!deleteBtnRef) {
                          setSelectedCamIdToDelete(cam?.id);
                          deleteBtnRef?.current?.click();
                        }
                      }}>
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          )}
        </TableRow>
      ));
    }
  };
  const renderCampaignList = () => {
    return (
      <Table>
        <TableCaption>A list of your recent campaigns.</TableCaption>
        <TableHeader>
          <TableRow className='bg-slate-50 hover:bg-slate-50 border-b border-slate-100'>
            <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
              #
            </TableHead>
            <TableHead className='w-[100px] truncate text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
              Title
            </TableHead>
            <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
              Total Products
            </TableHead>
            <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
              Delivery Discount
            </TableHead>
            <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
              Start Date
            </TableHead>
            <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
              End Date
            </TableHead>
            {hasSomePermissionsForPage("campaign", ["edit", "delete"]) && (
              <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                Action
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>{renderSingleCampaign()}</TableBody>
      </Table>
    );
  };

  const renderCampaignContent = () => {
    if (filteredCampaigns.length === 0) {
      return (
        <div className='text-center py-12'>
          <Zap className='mx-auto h-12 w-12 text-slate-300 mb-4' />
          <h3 className='text-lg font-semibold text-slate-900 mb-2'>
            No campaigns found
          </h3>
          <p className='text-sm text-slate-500'>
            {query
              ? "Try adjusting your search query"
              : "Get started by creating your first campaign"}
          </p>
          {hasRequiredPermission("campaign", "create") && !query && (
            <button
              onClick={handleCreateCampaign}
              className='mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all duration-150 shadow-sm shadow-purple-200'>
              <Plus className='h-4 w-4' />
              Create Campaign
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
                placeholder='Search campaigns...'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className='pl-9 h-9 text-sm border-slate-200 bg-white focus-visible:ring-purple-500'
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {query && (
            <button
              onClick={() => setQuery("")}
              className='text-sm text-slate-600 hover:text-slate-800 font-medium'>
              Clear search
            </button>
          )}
        </div>

        {/* Table Container */}
        <div className='rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden'>
          {renderCampaignList()}
        </div>

        {/* Footer Count */}
        <div className='text-xs text-slate-500'>
          Showing <strong>{filteredCampaigns.length}</strong> of{" "}
          <strong>{campaigns.length}</strong> campaigns
        </div>
      </div>
    );
  };

  return (
    <MainView title='Campaign'>
      <div className='w-full mb-2 md:my-2'>
        {loading && (
          <div className='flex justify-center items-center py-12'>
            <div className='text-center'>
              <RefreshCw className='h-8 w-8 text-purple-600 animate-spin mx-auto mb-3' />
              <p className='text-sm text-slate-600'>Loading campaigns...</p>
            </div>
          </div>
        )}

        {!loading && isMobile ? (
          /* Mobile View */
          <div className='space-y-3 pb-safe'>
            <MobileCampaignHeader
              searchValue={query}
              onSearchChange={(value) => setQuery(value)}
            />

            {filteredCampaigns.length === 0 ? (
              <MobileCampaignEmpty
                searchValue={query}
                onCreateCampaign={handleCreateCampaign}
              />
            ) : (
              <div className='mx-2 space-y-3'>
                {filteredCampaigns.map((campaign: ICampaign, index: number) => (
                  <MobileCampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    index={index}
                    handleUpdateCampaign={handleUpdateCampaign}
                    deleteExistingCampaign={handleCampaignDelete}
                  />
                ))}
              </div>
            )}

            {/* Floating Action Button */}
            {hasRequiredPermission("campaign", "create") && (
              <Button
                onClick={handleCreateCampaign}
                className='fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white z-50 flex items-center justify-center'>
                <Plus className='h-6 w-6' />
              </Button>
            )}
          </div>
        ) : (
          /* Desktop View - Modern Layout */
          !loading && (
            <div className='min-h-auto bg-slate-50/60'>
              <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
                {/* Page Header */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-purple-600 shadow-sm shadow-purple-200'>
                      <Zap className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <h1 className='text-xl font-semibold text-slate-900 leading-tight'>
                        Campaigns
                      </h1>
                      <p className='text-sm text-slate-500 mt-0.5'>
                        Manage promotional campaigns and discounts
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

                    {hasRequiredPermission("campaign", "create") && (
                      <button
                        onClick={handleCreateCampaign}
                        className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-all duration-150 shadow-sm shadow-purple-200'>
                        <Plus className='h-4 w-4' />
                        New Campaign
                      </button>
                    )}
                  </div>
                </div>

                {/* Summary Stats Strip */}
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                  {[
                    {
                      label: "Total Campaigns",
                      value: totalCampaigns.toString(),
                      accent: "text-purple-600",
                      bg: "bg-purple-50",
                    },
                    {
                      label: "Active",
                      value: activeCampaigns.toString(),
                      accent: "text-emerald-600",
                      bg: "bg-emerald-50",
                    },
                    {
                      label: "Upcoming",
                      value: upcomingCampaigns.toString(),
                      accent: "text-blue-600",
                      bg: "bg-blue-50",
                    },
                    {
                      label: "Expired",
                      value: expiredCampaigns.toString(),
                      accent: "text-rose-600",
                      bg: "bg-rose-50",
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
                            data-[state=active]:text-purple-600 data-[state=active]:border-purple-600
                            data-[state=active]:bg-transparent
                            transition-all duration-150
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2
                          '>
                          <Zap className='h-4 w-4' />
                          All Campaigns
                        </TabsTrigger>
                        <TabsTrigger
                          value='active'
                          className='
                            relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent
                            text-slate-500 hover:text-slate-700
                            data-[state=active]:text-purple-600 data-[state=active]:border-purple-600
                            data-[state=active]:bg-transparent
                            transition-all duration-150
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2
                          '>
                          <CheckCircle className='h-4 w-4' />
                          Active
                        </TabsTrigger>
                        <TabsTrigger
                          value='upcoming'
                          className='
                            relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent
                            text-slate-500 hover:text-slate-700
                            data-[state=active]:text-purple-600 data-[state=active]:border-purple-600
                            data-[state=active]:bg-transparent
                            transition-all duration-150
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2
                          '>
                          <Clock className='h-4 w-4' />
                          Upcoming
                        </TabsTrigger>
                        <TabsTrigger
                          value='expired'
                          className='
                            relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent
                            text-slate-500 hover:text-slate-700
                            data-[state=active]:text-purple-600 data-[state=active]:border-purple-600
                            data-[state=active]:bg-transparent
                            transition-all duration-150
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2
                          '>
                          <XCircle className='h-4 w-4' />
                          Expired
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Tab Contents */}
                    <TabsContent
                      value='all'
                      className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
                      {renderCampaignContent()}
                    </TabsContent>

                    <TabsContent
                      value='active'
                      className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
                      {renderCampaignContent()}
                    </TabsContent>

                    <TabsContent
                      value='upcoming'
                      className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
                      {renderCampaignContent()}
                    </TabsContent>

                    <TabsContent
                      value='expired'
                      className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
                      {renderCampaignContent()}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )
        )}

        {hasRequiredPermission("campaign", "delete") &&
          renderDeleteDrawerView()}
      </div>
    </MainView>
  );
};

export default CampaignList;
