import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RequestFiltersProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount?: number;
  refresh?: () => void;
  isLoading?: boolean;
  showMyRequestsOnly?: boolean;
  onViewMyRequests?: () => void;
  onViewAllRequests?: () => void;
}

export const RequestFilters = ({
  activeTab,
  onTabChange,
  pendingCount = 0,
  refresh,
  isLoading = false,
  showMyRequestsOnly = false,
  onViewMyRequests,
  onViewAllRequests,
}: RequestFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {showMyRequestsOnly && onViewAllRequests && (
            <Button variant="outline" size="sm" onClick={onViewAllRequests} className="flex-1 sm:flex-none">
              View All Requests
            </Button>
          )}
          {!showMyRequestsOnly && onViewMyRequests && (
            <Button variant="outline" size="sm" onClick={onViewMyRequests} className="flex-1 sm:flex-none">
              My Requests
            </Button>
          )}
          {refresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          )}
        </div>
      </div>

      {pendingCount > 0 && activeTab === "pending" && (
        <div className="text-sm text-muted-foreground">
          Showing {pendingCount} pending request{pendingCount !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};
