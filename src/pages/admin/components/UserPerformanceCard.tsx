import React, { useEffect, useState } from "react";
import { useAdminAudit } from "../../../hooks/useAdminAudit";
import { UserPerformanceSummary } from "../../../api/adminAudit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import {
  Package,
  ShoppingCart,
  User,
  TrendingUp,
  Activity,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { UserPerformanceDialog } from "./UserPerformanceDialog";

dayjs.extend(relativeTime);

interface UserPerformanceCardProps {
  startDate: string;
  endDate: string;
}

export const UserPerformanceCard: React.FC<UserPerformanceCardProps> = ({
  startDate,
  endDate,
}) => {
  const { fetchUserPerformance, isLoading, error } = useAdminAudit();
  const [users, setUsers] = useState<UserPerformanceSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserPerformanceSummary | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line
  }, [startDate, endDate]);

  const loadUsers = async () => {
    const data = await fetchUserPerformance({
      startDate,
      endDate,
      limit: 100,
    });

    if (data) {
      setUsers(data.users);
      if (data.users.length > 0 && !selectedUserId) {
        setSelectedUserId(data.users[0].userId);
        setSelectedUser(data.users[0]);
      }
    }
  };

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find((u) => u.userId === userId);
    setSelectedUser(user || null);
  };

  const handleViewDetails = () => {
    if (selectedUser) {
      setDialogOpen(true);
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              Loading User Performance
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Please wait while we gather the data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
        <p className="text-sm text-rose-700">Error: {error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">
            User Performance Overview
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Select a user to view their performance metrics
          </p>
        </div>
        <div className="p-5">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
            <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-600">
              No users found in the selected date range
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">
            User Performance Overview
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Select a user to view their performance metrics
          </p>
        </div>
        <div className="p-5 space-y-6">
          {/* User Selection Dropdown */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700 min-w-fit">
              Select User:
            </label>
            <Select value={selectedUserId} onValueChange={handleUserChange}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.userId} value={user.userId}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {user.userName}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({user.userEmail})
                      </span>
                      <Badge
                        variant="outline"
                        className="ml-2 bg-slate-50 border-slate-200">
                        {user.userType}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected User Stats */}
          {selectedUser && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total Actions */}
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500">Total Actions</p>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50">
                      <Activity className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {(
                      selectedUser.orderOperations.total +
                      selectedUser.productAdjustments.total
                    ).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Combined activities
                  </p>
                </div>

                {/* Order Operations */}
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500">Order Operations</p>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50">
                      <ShoppingCart className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedUser.orderOperations.total.toLocaleString()}
                  </p>
                  <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Creates:</span>
                      <span className="font-medium text-emerald-600">
                        {selectedUser.orderOperations.creates}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium text-slate-700">
                        {selectedUser.orderOperations.statusUpdates}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payments:</span>
                      <span className="font-medium text-slate-700">
                        {selectedUser.orderOperations.paymentUpdates}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product Adjustments */}
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500">Stock Adjustments</p>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50">
                      <Package className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedUser.productAdjustments.total.toLocaleString()}
                  </p>
                  <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Added:</span>
                      <span className="font-medium text-emerald-600">
                        +{selectedUser.productAdjustments.quantityAdded}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Removed:</span>
                      <span className="font-medium text-rose-600">
                        -{selectedUser.productAdjustments.quantityRemoved}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Products:</span>
                      <span className="font-medium text-slate-700">
                        {selectedUser.productAdjustments.uniqueProducts}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500">Last Activity</p>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50">
                      <TrendingUp className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                  <p className="text-base font-semibold text-slate-900">
                    {dayjs(selectedUser.lastActivity).fromNow()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {dayjs(selectedUser.lastActivity).format(
                      "MMM DD, YYYY HH:mm"
                    )}
                  </p>
                </div>
              </div>

              {/* User Info and Actions */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {selectedUser.userName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedUser.userEmail}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-white border border-slate-200">
                    {selectedUser.userType}
                  </Badge>
                </div>
                <button
                  onClick={handleViewDetails}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-150 shadow-sm shadow-indigo-200">
                  View Detailed Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detailed User Performance Dialog */}
      {selectedUser && (
        <UserPerformanceDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          userId={selectedUser.userId}
          userName={selectedUser.userName}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </>
  );
};
