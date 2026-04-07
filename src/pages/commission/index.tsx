import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
import { Button } from "../../components/ui/button";
import { useCommission } from "../../hooks/useCommission";
import { CommissionDashboard } from "./components/CommissionDashboard";
import { CommissionTable } from "./components/CommissionTable";
import { CommissionFilters } from "./components/CommissionFilters";
import { UpdateCommissionDialog } from "./components/UpdateCommissionDialog";
import { CommissionDetailsModal } from "./components/CommissionDetailsModal";
import { formatCurrency } from "../../utils/inventoryReportUtils";
import { CommissionQueryParams, Commission } from "../../api/commission";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";

export const CommissionManagementPage = () => {
  const [activeTab, setActiveTab] = useState("all-commissions");
  const [filters, setFilters] = useState<CommissionQueryParams>({});
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedCommission, setSelectedCommission] =
    useState<Commission | null>(null);
  const [viewDetailsCommission, setViewDetailsCommission] =
    useState<Commission | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  //eslint-disable-next-line
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const { fetchCommissions, fetchCommissionSummary, updateStatus, isLoading } =
    useCommission();
  const { toast } = useToast();

  // Wrap setFilters in useCallback to prevent infinite re-renders
  // Support both direct object and functional updates
  const handleFiltersChange = useCallback(
    (
      newFiltersOrUpdater:
        | CommissionQueryParams
        | ((prev: CommissionQueryParams) => CommissionQueryParams),
    ) => {
      setFilters((prev) => {
        if (typeof newFiltersOrUpdater === "function") {
          return newFiltersOrUpdater(prev);
        }
        return newFiltersOrUpdater;
      });
    },
    [],
  );

  // Fetch data on mount and filter change
  useEffect(() => {
    const loadData = async () => {
      const [commissionsData, summaryData] = await Promise.all([
        fetchCommissions(filters),
        fetchCommissionSummary(filters),
      ]);

      if (commissionsData) {
        setCommissions(commissionsData.commissions);
        setPagination(commissionsData.pagination);
      }

      if (summaryData) {
        setSummary(summaryData);
      }
    };

    loadData();
    //eslint-disable-next-line
  }, [filters]);

  const handleUpdateStatus = async (
    id: string,
    status: string,
    notes?: string,
  ) => {
    const result = await updateStatus(id, status, notes);
    if (result) {
      toast({
        title: "Success",
        description: "Commission status updated successfully",
      });
      // Refresh data
      const commissionsData = await fetchCommissions(filters);
      if (commissionsData) {
        setCommissions(commissionsData.commissions);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update commission status",
      });
    }
  };

  // const handlePageChange = (page: number) => {
  //   setFilters((prev) => ({ ...prev, page }));
  // };

  const handleExport = () => {
    toast({
      title: "Info",
      description: "Export feature coming soon!",
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Clear status filter for "all-commissions" and "top-performers"
    // Set status filter for status tabs
    if (value === "all-commissions" || value === "top-performers") {
      setFilters((prev) => ({ ...prev, status: undefined }));
    } else {
      // value is the status (pending, unpaid, paid, etc.)
      setFilters((prev) => ({ ...prev, status: value }));
    }
  };

  return (
    <div className='space-y-6 mx-2 md:container'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            Commission Management
          </h2>
          <p className='text-muted-foreground'>
            Track and manage all commissions in one place
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={handleExport}>
            <Download className='w-4 h-4 mr-2' />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && <CommissionDashboard summary={summary.overview} />}

      {/* Filters */}
      <CommissionFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Main Content */}
      <Tabs
        defaultValue='all-commissions'
        className='space-y-4'
        onValueChange={handleTabChange}>
        {/* Mobile: Dropdown for tabs */}
        <div className='md:hidden'>
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className='w-full h-12'>
              <SelectValue placeholder='Select tab' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all-commissions'>All Commissions</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='unpaid'>Unpaid</SelectItem>
              <SelectItem value='paid'>Paid</SelectItem>
              <SelectItem value='hold'>Hold</SelectItem>
              <SelectItem value='cancelled'>Cancelled</SelectItem>
              <SelectItem value='removed'>Removed</SelectItem>
              <SelectItem value='top-performers'>Top Performers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Horizontal tabs */}
        <TabsList className='hidden md:flex overflow-x-auto'>
          <TabsTrigger value='all-commissions'>All Commissions</TabsTrigger>
          <TabsTrigger value='pending'>Pending</TabsTrigger>
          <TabsTrigger value='unpaid'>Unpaid</TabsTrigger>
          <TabsTrigger value='paid'>Paid</TabsTrigger>
          <TabsTrigger value='hold'>Hold</TabsTrigger>
          <TabsTrigger value='cancelled'>Cancelled</TabsTrigger>
          <TabsTrigger value='removed'>Removed</TabsTrigger>
          <TabsTrigger value='top-performers'>Top Performers</TabsTrigger>
        </TabsList>

        <TabsContent value='all-commissions' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>All Commissions</CardTitle>
              <CardDescription>
                View and manage all commission records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='flex justify-center items-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
              ) : (
                <CommissionTable
                  commissions={commissions}
                  onViewDetails={(commission) => {
                    setViewDetailsCommission(commission);
                  }}
                  onUpdateStatus={(commission) => {
                    setSelectedCommission(commission);
                    setIsUpdateDialogOpen(true);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status tabs - will use same table with filtered data */}
        <TabsContent value='pending' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Pending Commissions</CardTitle>
              <CardDescription>Commissions awaiting review</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='flex justify-center items-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
              ) : (
                <CommissionTable
                  commissions={commissions}
                  onViewDetails={(commission) => {
                    setViewDetailsCommission(commission);
                  }}
                  onUpdateStatus={(commission) => {
                    setSelectedCommission(commission);
                    setIsUpdateDialogOpen(true);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='unpaid' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Unpaid Commissions</CardTitle>
              <CardDescription>
                Commissions that are approved but not yet paid
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='flex justify-center items-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
              ) : (
                <CommissionTable
                  commissions={commissions}
                  onViewDetails={(commission) => {
                    setViewDetailsCommission(commission);
                  }}
                  onUpdateStatus={(commission) => {
                    setSelectedCommission(commission);
                    setIsUpdateDialogOpen(true);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='paid' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Paid Commissions</CardTitle>
              <CardDescription>Successfully paid commissions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='flex justify-center items-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
              ) : (
                <CommissionTable
                  commissions={commissions}
                  onViewDetails={(commission) => {
                    setViewDetailsCommission(commission);
                  }}
                  onUpdateStatus={(commission) => {
                    setSelectedCommission(commission);
                    setIsUpdateDialogOpen(true);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='hold' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>On Hold Commissions</CardTitle>
              <CardDescription>Commissions currently on hold</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='flex justify-center items-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
              ) : (
                <CommissionTable
                  commissions={commissions}
                  onViewDetails={(commission) => {
                    setViewDetailsCommission(commission);
                  }}
                  onUpdateStatus={(commission) => {
                    setSelectedCommission(commission);
                    setIsUpdateDialogOpen(true);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='cancelled' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Cancelled Commissions</CardTitle>
              <CardDescription>
                Commissions that have been cancelled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='flex justify-center items-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
              ) : (
                <CommissionTable
                  commissions={commissions}
                  onViewDetails={(commission) => {
                    setViewDetailsCommission(commission);
                  }}
                  onUpdateStatus={(commission) => {
                    setSelectedCommission(commission);
                    setIsUpdateDialogOpen(true);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='removed' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Removed Commissions</CardTitle>
              <CardDescription>
                Commissions that have been removed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='flex justify-center items-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
              ) : (
                <CommissionTable
                  commissions={commissions}
                  onViewDetails={(commission) => {
                    setViewDetailsCommission(commission);
                  }}
                  onUpdateStatus={(commission) => {
                    setSelectedCommission(commission);
                    setIsUpdateDialogOpen(true);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Performers Tab - keep existing implementation */}
        <TabsContent value='top-performers'>
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>
                View users with the highest commission earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summary && summary.topUsers && summary.topUsers.length > 0 ? (
                <div className='space-y-4'>
                  {summary.topUsers.map((user: any, index: number) => (
                    <div
                      key={user.userId}
                      className='flex items-center justify-between p-4 border rounded-lg'>
                      <div className='flex items-center gap-4'>
                        <div className='text-2xl font-bold text-muted-foreground'>
                          #{index + 1}
                        </div>
                        <div>
                          <div className='font-medium'>{user.userName}</div>
                          <div className='text-sm text-muted-foreground'>
                            {user.commissionCount} commissions
                          </div>
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='text-lg font-bold'>
                          {formatCurrency(user.totalCommission)}
                        </div>
                        <div className='text-sm text-green-600'>
                          {formatCurrency(user.paidAmount)} paid
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground'>
                  No top performers data available.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Details Modal */}
      <CommissionDetailsModal
        commission={viewDetailsCommission}
        open={!!viewDetailsCommission}
        onOpenChange={(open) => !open && setViewDetailsCommission(null)}
        onEdit={(commission) => {
          setViewDetailsCommission(null);
          setSelectedCommission(commission);
          setIsUpdateDialogOpen(true);
        }}
      />

      {/* Update Dialog */}
      <UpdateCommissionDialog
        commission={selectedCommission}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        onUpdate={handleUpdateStatus}
      />
    </div>
  );
};
