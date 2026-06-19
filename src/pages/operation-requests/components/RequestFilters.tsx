import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle, Ban, List } from "lucide-react";

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
          <TabsList className="bg-slate-100/80 p-1 rounded-xl gap-1">
            <TabsTrigger
              value="pending"
              className="relative data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 gap-1.5 transition-all duration-150 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
              Pending
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 gap-1.5 transition-all duration-150 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5" />
              Approved
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-rose-600 gap-1.5 transition-all duration-150 rounded-lg">
              <XCircle className="w-3.5 h-3.5" />
              Rejected
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-600 gap-1.5 transition-all duration-150 rounded-lg">
              <Ban className="w-3.5 h-3.5" />
              Cancelled
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-600 gap-1.5 transition-all duration-150 rounded-lg">
              <List className="w-3.5 h-3.5" />
              All
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {showMyRequestsOnly && onViewAllRequests && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewAllRequests}
              className="flex-1 sm:flex-none h-8 px-3 gap-1.5 text-[13px] font-medium text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150">
              View All Requests
            </Button>
          )}
          {!showMyRequestsOnly && onViewMyRequests && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewMyRequests}
              className="flex-1 sm:flex-none h-8 px-3 gap-1.5 text-[13px] font-medium text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150">
              My Requests
            </Button>
          )}
          {refresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              className="flex-1 sm:flex-none h-8 px-3 gap-1.5 text-[13px] font-medium text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150">
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          )}
        </div>
      </div>

      {pendingCount > 0 && activeTab === "pending" && (
        <div className="text-[12px] text-slate-500">
          Showing {pendingCount} pending request{pendingCount !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};
