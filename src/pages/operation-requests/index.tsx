import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  useOperationRequests,
  OperationRequest,
} from "./hooks/useOperationRequests";
import { RequestCard } from "./components/RequestCard";
import { RequestDetailsModal } from "./components/RequestDetailsModal";
import { RequestFilters } from "./components/RequestFilters";
import { RequestStatistics } from "./components/RequestStatistics";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ClipboardList,
  RefreshCw,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import MainView from "@/coreComponents/mainView";

const OperationRequestsPage = () => {
  const user = useSelector((state: any) => state?.user);
  const currentUserId = user?.id || "";
  const { hasRequiredPermission } = useRoleCheck();

  const canViewStatistics = hasRequiredPermission("OperationRequest", "view");
  const canApprove = hasRequiredPermission("OperationRequest", "approve");
  const canReject = hasRequiredPermission("OperationRequest", "reject");

  const {
    requests,
    statistics,
    loading,
    error,
    pagination,
    fetchRequests,
    fetchMyRequests,
    fetchStatistics,
    approveRequest,
    rejectRequest,
    cancelRequest,
    refresh,
    clearError,
  } = useOperationRequests();

  const [activeTab, setActiveTab] = useState("pending");
  const [viewingMyRequests, setViewingMyRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<OperationRequest | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const fetchData = (status = activeTab) => {
    const params = { status: status === "all" ? undefined : status };
    if (canViewStatistics && !viewingMyRequests) {
      fetchStatistics();
      fetchRequests(params);
    } else {
      fetchMyRequests(params);
    }
  };

  useEffect(() => {
    fetchData();
  }, [canViewStatistics, viewingMyRequests, activeTab]);

  useEffect(() => {
    if (activeTab !== "pending") return;
    const interval = setInterval(() => {
      const params = { status: "pending" };
      canViewStatistics && !viewingMyRequests
        ? fetchRequests(params)
        : fetchMyRequests(params);
    }, 30000);
    return () => clearInterval(interval);
  }, [
    activeTab,
    canViewStatistics,
    viewingMyRequests,
    fetchRequests,
    fetchMyRequests,
  ]);

  const handleTabChange = (tab: string) => setActiveTab(tab);

  const handleViewMyRequests = () => {
    setViewingMyRequests(true);
    setActiveTab("all");
  };
  const handleViewAllRequests = () => {
    setViewingMyRequests(false);
    setActiveTab("pending");
  };

  const handleRefresh = () => {
    fetchData();
    toast.success("Refreshed successfully");
  };

  const handleViewDetails = (request: OperationRequest) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  const handleApprove = async (requestId: string): Promise<boolean> => {
    const success = await approveRequest(requestId);
    if (success) fetchData();
    return success;
  };

  const handleReject = async (
    requestId: string,
    adminNotes?: string,
  ): Promise<boolean> => {
    const success = await rejectRequest(requestId, adminNotes);
    if (success) fetchData();
    return success;
  };

  const handleCancel = async (requestId: string): Promise<boolean> => {
    const success = await cancelRequest(requestId);
    if (success) fetchData();
    return success;
  };

  const getPendingCount = () => {
    if (!canViewStatistics) return 0;
    return (
      statistics.find((s) => s.operationType === "product_delete")?.pending || 0
    );
  };

  return (
    <MainView title='Operation Requests'>
      <div className='min-h-screen bg-slate-50/60'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
          {/* Header */}
          <div className='bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-violet-600 shadow-sm shadow-violet-200'>
                  <ClipboardList
                    className='h-5 w-5 text-white'
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <h1 className='text-xl font-semibold text-slate-900 leading-tight'>
                    {viewingMyRequests
                      ? "My Deletion Requests"
                      : "Operation Requests"}
                  </h1>
                  <p className='text-sm text-slate-500 mt-0.5'>
                    {canViewStatistics && !viewingMyRequests
                      ? "Manage and approve deletion requests"
                      : "View and track your deletion requests"}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2 shrink-0'>
                {canViewStatistics &&
                  (viewingMyRequests ? (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleViewAllRequests}
                      className='h-8 px-3 text-xs rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 gap-1.5 transition-all duration-150 shadow-sm'>
                      <Users className='w-3.5 h-3.5' />
                      All Requests
                    </Button>
                  ) : (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleViewMyRequests}
                      className='h-8 px-3 text-xs rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 gap-1.5 transition-all duration-150 shadow-sm'>
                      <User className='w-3.5 h-3.5' />
                      My Requests
                    </Button>
                  ))}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleRefresh}
                  disabled={loading}
                  className='h-8 px-3 text-xs rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 gap-1.5 transition-all duration-150 shadow-sm'>
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className='bg-white rounded-xl border border-rose-100 shadow-sm px-5 py-4'>
              <div className='flex items-start gap-3'>
                <div className='w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0 mt-0.5'>
                  <AlertCircle className='w-4 h-4 text-rose-500' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-slate-800'>
                    Failed to load requests
                  </p>
                  <p className='text-xs text-slate-500 mt-0.5'>{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className='text-xs text-slate-400 hover:text-slate-600 transition-colors shrink-0 mt-0.5'>
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Statistics */}
          {canViewStatistics && !viewingMyRequests && statistics.length > 0 && (
            <RequestStatistics statistics={statistics} isLoading={loading} />
          )}

          {/* Filters */}
          <RequestFilters
            activeTab={activeTab}
            onTabChange={handleTabChange}
            pendingCount={getPendingCount()}
            refresh={handleRefresh}
            isLoading={loading}
            showMyRequestsOnly={viewingMyRequests}
            onViewMyRequests={
              canViewStatistics ? handleViewMyRequests : undefined
            }
            onViewAllRequests={
              canViewStatistics ? handleViewAllRequests : undefined
            }
          />

          {/* Requests list */}
          {loading && requests.length === 0 ? (
            <div className='bg-white rounded-xl border border-slate-100 shadow-sm'>
              <div className='flex flex-col items-center justify-center py-20 gap-3'>
                <div className='w-8 h-8 rounded-full border-2 border-violet-200 border-t-violet-500 animate-spin' />
                <p className='text-sm font-medium text-slate-600'>
                  Loading requests…
                </p>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className='bg-white rounded-xl border border-slate-100 shadow-sm'>
              <div className='flex flex-col items-center justify-center py-20 gap-3'>
                <div className='w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center'>
                  <ClipboardList
                    className='w-7 h-7 text-violet-300'
                    strokeWidth={1.5}
                  />
                </div>
                <p className='text-sm font-semibold text-slate-700'>
                  No requests found
                </p>
                <p className='text-xs text-slate-500'>
                  {activeTab !== "all"
                    ? `There are no ${activeTab} requests right now.`
                    : "No requests have been made yet."}
                </p>
              </div>
            </div>
          ) : (
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {requests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onViewDetails={handleViewDetails}
                  showActions={canApprove || canReject || viewingMyRequests}
                  onApprove={canApprove ? handleApprove : undefined}
                  onReject={canReject ? handleReject : undefined}
                  onCancel={viewingMyRequests ? handleCancel : undefined}
                  canApprove={canApprove}
                  canReject={canReject}
                  isCurrentUserRequest={viewingMyRequests}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className='bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                <p className='text-xs text-slate-500'>
                  Page{" "}
                  <span className='font-semibold text-slate-700'>
                    {pagination.page}
                  </span>{" "}
                  of{" "}
                  <span className='font-semibold text-slate-700'>
                    {pagination.pages}
                  </span>{" "}
                  ·{" "}
                  <span className='font-semibold text-slate-700'>
                    {pagination.total}
                  </span>{" "}
                  total
                </p>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={pagination.page === 1}
                    onClick={() => {
                      const params = {
                        page: pagination.page - 1,
                        limit: pagination.limit,
                      };
                      canViewStatistics && !viewingMyRequests
                        ? fetchRequests({
                            status: activeTab === "all" ? undefined : activeTab,
                            ...params,
                          })
                        : fetchMyRequests({
                            status: activeTab === "all" ? undefined : activeTab,
                            ...params,
                          });
                    }}
                    className='h-7 px-3 text-xs rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 gap-1 transition-all duration-150'>
                    Previous
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={pagination.page === pagination.pages}
                    onClick={() => {
                      const params = {
                        page: pagination.page + 1,
                        limit: pagination.limit,
                      };
                      canViewStatistics && !viewingMyRequests
                        ? fetchRequests({
                            status: activeTab === "all" ? undefined : activeTab,
                            ...params,
                          })
                        : fetchMyRequests({
                            status: activeTab === "all" ? undefined : activeTab,
                            ...params,
                          });
                    }}
                    className='h-7 px-3 text-xs rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 gap-1 transition-all duration-150'>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Details Modal */}
          <RequestDetailsModal
            request={selectedRequest}
            open={detailsModalOpen}
            onOpenChange={setDetailsModalOpen}
            onApprove={canApprove ? handleApprove : undefined}
            onReject={canReject ? handleReject : undefined}
            onCancel={viewingMyRequests ? handleCancel : undefined}
            canApprove={canApprove}
            canReject={canReject}
            isCurrentUserRequest={viewingMyRequests}
          />
        </div>
      </div>
    </MainView>
  );
};

export default OperationRequestsPage;
