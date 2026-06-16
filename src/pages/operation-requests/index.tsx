import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useOperationRequests, OperationRequest } from "./hooks/useOperationRequests";
import { RequestCard } from "./components/RequestCard";
import { RequestDetailsModal } from "./components/RequestDetailsModal";
import { RequestFilters } from "./components/RequestFilters";
import { RequestStatistics } from "./components/RequestStatistics";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import useRoleCheck from "../auth/hooks/useRoleCheck";

const OperationRequestsPage = () => {
  const user = useSelector((state: any) => state?.user);
  const currentUserId = user?.id || "";
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();

  // Check permissions
  const canViewStatistics = hasRequiredPermission("OperationRequest", "view");
  const canApprove = hasRequiredPermission("OperationRequest", "approve");
  const canReject = hasRequiredPermission("OperationRequest", "reject");

  // Debug logging
  console.log("=== Operation Requests Page Debug ===");
  console.log("User:", user);
  console.log("User Permissions:", user?.permissions);
  console.log("Can View Statistics:", canViewStatistics);
  console.log("Can Approve:", canApprove);
  console.log("Can Reject:", canReject);
  console.log("Current User ID:", currentUserId);

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
  const [selectedRequest, setSelectedRequest] = useState<OperationRequest | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Debug: Log requests when they change
  useEffect(() => {
    console.log("Requests updated:", requests.length);
    console.log("Sample request:", requests[0]);
    console.log("Pending requests:", requests.filter(r => r.status === "pending").length);
  }, [requests]);

  // Fetch requests and statistics on mount
  useEffect(() => {
    if (canViewStatistics && !viewingMyRequests) {
      fetchStatistics();
      fetchRequests({ status: activeTab === "all" ? undefined : activeTab });
    } else {
      fetchMyRequests({ status: activeTab === "all" ? undefined : activeTab });
    }
  }, [canViewStatistics, viewingMyRequests, activeTab]);

  // Auto-refresh pending requests every 30 seconds
  useEffect(() => {
    if (activeTab === "pending") {
      const interval = setInterval(() => {
        if (canViewStatistics && !viewingMyRequests) {
          fetchRequests({ status: "pending" });
        } else {
          fetchMyRequests({ status: "pending" });
        }
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeTab, canViewStatistics, viewingMyRequests, fetchRequests, fetchMyRequests]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
  };

  const handleViewMyRequests = () => {
    setViewingMyRequests(true);
    setActiveTab("all");
  };

  const handleViewAllRequests = () => {
    setViewingMyRequests(false);
    setActiveTab("pending");
  };

  const handleRefresh = () => {
    if (canViewStatistics && !viewingMyRequests) {
      fetchStatistics();
      fetchRequests({ status: activeTab === "all" ? undefined : activeTab });
    } else {
      fetchMyRequests({ status: activeTab === "all" ? undefined : activeTab });
    }
    toast.success("Refreshed successfully");
  };

  const handleViewDetails = (request: OperationRequest) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  const handleApprove = async (requestId: string): Promise<boolean> => {
    const success = await approveRequest(requestId);
    if (success) {
      // Refresh statistics and list
      if (canViewStatistics) {
        fetchStatistics();
        fetchRequests({ status: activeTab === "all" ? undefined : activeTab });
      } else {
        fetchMyRequests({ status: activeTab === "all" ? undefined : activeTab });
      }
    }
    return success;
  };

  const handleReject = async (requestId: string, adminNotes?: string): Promise<boolean> => {
    const success = await rejectRequest(requestId, adminNotes);
    if (success) {
      // Refresh statistics and list
      if (canViewStatistics) {
        fetchStatistics();
        fetchRequests({ status: activeTab === "all" ? undefined : activeTab });
      } else {
        fetchMyRequests({ status: activeTab === "all" ? undefined : activeTab });
      }
    }
    return success;
  };

  const handleCancel = async (requestId: string): Promise<boolean> => {
    const success = await cancelRequest(requestId);
    if (success) {
      // Refresh list
      if (canViewStatistics && !viewingMyRequests) {
        fetchRequests({ status: activeTab === "all" ? undefined : activeTab });
      } else {
        fetchMyRequests({ status: activeTab === "all" ? undefined : activeTab });
      }
    }
    return success;
  };

  const getPendingCount = () => {
    if (!canViewStatistics) return 0;
    const productStats = statistics.find((s) => s.operationType === "product_delete");
    return productStats?.pending || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {viewingMyRequests ? "My Deletion Requests" : "Operation Requests"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {canViewStatistics && !viewingMyRequests
              ? "Manage and approve deletion requests"
              : "View your deletion requests"}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Error loading requests</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={clearError}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Statistics (Admin only, not in my requests view) */}
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
        onViewMyRequests={canViewStatistics ? handleViewMyRequests : undefined}
        onViewAllRequests={canViewStatistics ? handleViewAllRequests : undefined}
      />

      {/* Requests List */}
      {loading && requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No requests found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

      {/* Pagination (if needed) */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => {
                const params = { page: pagination.page - 1, limit: pagination.limit };
                if (canViewStatistics && !viewingMyRequests) {
                  fetchRequests({ status: activeTab === "all" ? undefined : activeTab, ...params });
                } else {
                  fetchMyRequests({ status: activeTab === "all" ? undefined : activeTab, ...params });
                }
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.pages}
              onClick={() => {
                const params = { page: pagination.page + 1, limit: pagination.limit };
                if (canViewStatistics && !viewingMyRequests) {
                  fetchRequests({ status: activeTab === "all" ? undefined : activeTab, ...params });
                } else {
                  fetchMyRequests({ status: activeTab === "all" ? undefined : activeTab, ...params });
                }
              }}
            >
              Next
            </Button>
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
  );
};

export default OperationRequestsPage;
