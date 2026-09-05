import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Ban,
  Inbox,
} from "lucide-react";
import { useBulkCommunication } from "../hooks/useBulkCommunication";
import { StatusBadge, ProgressBar } from "./shared";
import {
  BulkMessageType,
  CampaignStatus,
  SMSCampaign,
  EmailCampaign,
  CampaignQueryParams,
} from "../interface";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

interface CampaignListProps {
  type: BulkMessageType;
}

const CampaignList = ({ type }: CampaignListProps) => {
  const navigate = useNavigate();
  const { campaigns, loading, fetchCampaigns, cancelCampaign, deleteCampaign } =
    useBulkCommunication(type);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [campaignToCancel, setCampaignToCancel] = useState<
    SMSCampaign | EmailCampaign | null
  >(null);
  const [params, setParams] = useState<CampaignQueryParams>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    fetchCampaigns(params);
  }, [fetchCampaigns, params]);

  const applyFilters = () => {
    const newParams: CampaignQueryParams = {
      ...params,
      status:
        statusFilter !== "all" ? (statusFilter as CampaignStatus) : undefined,
      page: 1,
    };
    setParams(newParams);
    fetchCampaigns(newParams);
  };

  const handleReset = () => {
    setStatusFilter("all");
    setSearchQuery("");
    const newParams: CampaignQueryParams = {
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setParams(newParams);
    fetchCampaigns(newParams);
  };

  const handleViewCampaign = (id: string) => {
    navigate(`/bulk-communication/${type}/${id}`);
  };

  const handleCancelCampaign = async () => {
    if (!campaignToCancel) return;
    const success = await cancelCampaign(campaignToCancel.id);
    if (success) setCampaignToCancel(null);
  };

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return;
    const success = await deleteCampaign(campaignToDelete);
    if (success) setCampaignToDelete(null);
  };

  const filteredCampaigns =
    campaigns?.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) ?? [];

  const currentPage = params.page ?? 1;
  const pageSize = params.limit ?? 20;
  const totalItems = filteredCampaigns.length;
  const rangeStart = (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);
  const hasFilters = statusFilter !== "all" || searchQuery !== "";

  return (
    <div className='space-y-4'>
      {/* Filter Bar */}
      <div className='flex flex-col sm:flex-row gap-3'>
        {/* Search */}
        <div className='relative flex-1 max-w-xs'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none' />
          <Input
            placeholder='Search campaigns...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className='pl-9 h-9 text-sm border-slate-200 bg-white focus-visible:ring-indigo-500'
          />
        </div>

        {/* Status */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full sm:w-44 h-9 text-sm border-slate-200 bg-white focus:ring-indigo-500'>
            <SelectValue placeholder='All statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            <SelectItem value='draft'>Draft</SelectItem>
            <SelectItem value='queued'>Queued</SelectItem>
            <SelectItem value='processing'>Processing</SelectItem>
            <SelectItem value='completed'>Completed</SelectItem>
            <SelectItem value='cancelled'>Cancelled</SelectItem>
            <SelectItem value='failed'>Failed</SelectItem>
          </SelectContent>
        </Select>

        <button
          onClick={applyFilters}
          className='h-9 px-4 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm'>
          Apply
        </button>

        {hasFilters && (
          <button
            onClick={handleReset}
            className='h-9 px-3 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5'>
            <X className='h-3.5 w-3.5' />
            Clear
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className='rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden'>
        {loading && !campaigns ? (
          <div className='flex flex-col items-center justify-center h-64 gap-3'>
            <div className='w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin' />
            <p className='text-sm text-slate-500'>Loading campaigns…</p>
          </div>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-slate-50 hover:bg-slate-50 border-b border-slate-100'>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                      Campaign
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                      Recipients
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                      Status
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 min-w-[140px]'>
                      Progress
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                      Scheduled
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                      Created
                    </TableHead>
                    <TableHead className='w-10' />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className='py-16 text-center'>
                        <div className='flex flex-col items-center gap-2 text-slate-400'>
                          <Inbox className='h-8 w-8 opacity-40' />
                          <p className='text-sm font-medium'>
                            No campaigns found
                          </p>
                          {hasFilters && (
                            <button
                              onClick={handleReset}
                              className='text-xs text-indigo-600 hover:underline mt-1'>
                              Clear filters
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCampaigns.map((campaign) => (
                      <TableRow
                        key={campaign.id}
                        className='border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-default group'>
                        <TableCell className='py-3.5'>
                          <span
                            className='font-medium text-slate-800 hover:text-indigo-600 cursor-pointer transition-colors'
                            onClick={() => handleViewCampaign(campaign.id)}>
                            {campaign.name}
                          </span>
                        </TableCell>
                        <TableCell className='py-3.5 text-sm tabular-nums text-slate-600'>
                          {campaign.totalRecipients.toLocaleString()}
                        </TableCell>
                        <TableCell className='py-3.5'>
                          <StatusBadge status={campaign.status} />
                        </TableCell>
                        <TableCell className='py-3.5'>
                          <ProgressBar value={campaign.progress} />
                        </TableCell>
                        <TableCell className='py-3.5 text-sm text-slate-500 whitespace-nowrap'>
                          {campaign.scheduledFor ? (
                            format(
                              new Date(campaign.scheduledFor),
                              "MMM d, yyyy · HH:mm",
                            )
                          ) : (
                            <span className='text-slate-300'>—</span>
                          )}
                        </TableCell>
                        <TableCell className='py-3.5 text-sm text-slate-500 whitespace-nowrap'>
                          {format(new Date(campaign.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className='py-3.5 text-right pr-3'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className='inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'>
                                <MoreHorizontal className='h-4 w-4' />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align='end'
                              className='w-44 shadow-lg'>
                              <DropdownMenuItem
                                onClick={() => handleViewCampaign(campaign.id)}
                                className='gap-2 cursor-pointer'>
                                <Eye className='h-3.5 w-3.5 text-slate-500' />
                                View details
                              </DropdownMenuItem>
                              {(campaign.status === "queued" ||
                                campaign.status === "processing") && (
                                <DropdownMenuItem
                                  onClick={() => setCampaignToCancel(campaign)}
                                  className='gap-2 cursor-pointer text-amber-600 focus:text-amber-700 focus:bg-amber-50'>
                                  <Ban className='h-3.5 w-3.5' />
                                  Cancel campaign
                                </DropdownMenuItem>
                              )}
                              {campaign.status !== "processing" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    setCampaignToDelete(campaign.id)
                                  }
                                  className='gap-2 cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50'>
                                  <Trash2 className='h-3.5 w-3.5' />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
              <div className='flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50'>
                <p className='text-xs text-slate-500 order-2 sm:order-1'>
                  Showing{" "}
                  <span className='font-medium text-slate-700'>
                    {rangeStart}–{rangeEnd}
                  </span>{" "}
                  of{" "}
                  <span className='font-medium text-slate-700'>
                    {totalItems}
                  </span>{" "}
                  campaigns
                </p>
                <div className='flex items-center gap-1 order-1 sm:order-2'>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      const p = { ...params, page: currentPage - 1 };
                      setParams(p);
                      fetchCampaigns(p);
                    }}
                    className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'>
                    <ChevronLeft className='h-3.5 w-3.5' />
                    Previous
                  </button>
                  <span className='px-3 py-1.5 text-xs text-slate-500 font-medium'>
                    Page {currentPage}
                  </span>
                  <button
                    onClick={() => {
                      const p = { ...params, page: currentPage + 1 };
                      setParams(p);
                      fetchCampaigns(p);
                    }}
                    className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors'>
                    Next
                    <ChevronRight className='h-3.5 w-3.5' />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancel Dialog */}
      <AlertDialog
        open={!!campaignToCancel}
        onOpenChange={() => setCampaignToCancel(null)}>
        <AlertDialogContent className='max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className='text-slate-700'>
                "{campaignToCancel?.name}"
              </strong>{" "}
              will stop sending. Messages already delivered won't be recalled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='text-sm'>
              Keep running
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelCampaign}
              className='bg-amber-500 hover:bg-amber-600 text-sm'>
              Yes, cancel it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={!!campaignToDelete}
        onOpenChange={() => setCampaignToDelete(null)}>
        <AlertDialogContent className='max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This campaign and all its data will be permanently removed. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='text-sm'>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCampaign}
              className='bg-rose-600 hover:bg-rose-700 text-sm'>
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CampaignList;
