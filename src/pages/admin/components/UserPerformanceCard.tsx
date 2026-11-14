import React, { useEffect, useState } from "react";
import { useAdminAudit } from "../../../hooks/useAdminAudit";
import {
  UserPerformanceSummary,
  UserPerformanceDetailResponse,
} from "../../../api/adminAudit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { Package, ShoppingCart, User, TrendingUp, Activity } from "lucide-react";
import { InlineLoader, ButtonLoadingText } from "@/components/loaders";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { UserPerformanceSheet } from "./UserPerformanceSheet";
import { ActivityPillGrid } from "./ActivityPillGrid";
import { claude } from "../../../lib/claude";

dayjs.extend(relativeTime);

interface UserPerformanceCardProps {
  startDate: string;
  endDate: string;
}

export const UserPerformanceCard: React.FC<UserPerformanceCardProps> = ({
  startDate,
  endDate,
}) => {
  const { fetchUserPerformance, fetchUserDetail, isLoading, error } =
    useAdminAudit();
  const [users, setUsers] = useState<UserPerformanceSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUser, setSelectedUser] =
    useState<UserPerformanceSummary | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [userDetail, setUserDetail] =
    useState<UserPerformanceDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line
  }, [startDate, endDate]);

  useEffect(() => {
    if (selectedUserId) {
      loadUserDetail(selectedUserId);
    }
    // eslint-disable-next-line
  }, [selectedUserId, startDate, endDate]);

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

  const loadUserDetail = async (userId: string) => {
    setDetailLoading(true);
    setDetailError(null);
    setUserDetail(null);

    const data = await fetchUserDetail(userId, {
      startDate,
      endDate,
    });

    if (data) {
      setUserDetail(data);
    } else {
      setDetailError("Failed to load user details");
    }
    setDetailLoading(false);
  };

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find((u) => u.userId === userId);
    setSelectedUser(user || null);
  };

  const handleViewDetails = () => {
    if (selectedUser) {
      setSheetOpen(true);
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className={claude.card + " p-8"}>
        <InlineLoader domain='users' text='Loading Performance' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-rose-50 border border-rose-200 rounded-xl p-4'>
        <p className='text-sm text-rose-700'>Error: {error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={claude.card + " overflow-hidden"}>
        <div className={`flex items-center gap-2.5 px-4 py-3 ${claude.cardHeader}`}>
          <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#D97757]/20 bg-[#D97757]/10 text-[#D97757]'>
            <User className='h-3.5 w-3.5' />
          </span>
          <div>
            <h3 className='text-[13px] font-semibold text-[#141413] leading-tight'>
              User Performance Overview
            </h3>
            <p className='text-[11px] text-[#8A877D] mt-0.5'>
              Select a user to view their performance metrics
            </p>
          </div>
        </div>
        <div className='p-5'>
          <div className={claude.panel + " p-4 text-center"}>
            <User className='w-12 h-12 mx-auto mb-3 text-[#D8D3C8]' />
            <p className='text-[13px] text-[#57554D]'>
              No users found in the selected date range
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={claude.card + " overflow-hidden"}>
        <div className={`flex items-center gap-2.5 px-4 py-3 ${claude.cardHeader}`}>
          <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#D97757]/20 bg-[#D97757]/10 text-[#D97757]'>
            <User className='h-3.5 w-3.5' />
          </span>
          <div>
            <h3 className='text-[13px] font-semibold text-[#141413] leading-tight'>
              User Performance Overview
            </h3>
            <p className='text-[11px] text-[#8A877D] mt-0.5'>
              Select a user to view their performance metrics
            </p>
          </div>
        </div>
        <div className='p-5 space-y-6'>
          {/* User Selection Dropdown */}
          <div className='flex items-center gap-4'>
            <label className={claude.microLabel + " min-w-fit"}>
              Select User
            </label>
            <Select value={selectedUserId} onValueChange={handleUserChange}>
              <SelectTrigger className='w-full max-w-md rounded-md'>
                <SelectValue placeholder='Select a user' />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.userId} value={user.userId}>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium text-foreground'>
                        {user.userName}
                      </span>
                      <span className='text-[11px] text-[#8A877D]'>
                        ({user.userEmail})
                      </span>
                      <Badge
                        variant='outline'
                        className='ml-2 rounded-md bg-[#FAF9F6] border-[#E8E4DC] text-[#57554D]'>
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
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                {/* Total Actions */}
                <div className={claude.card + " p-4"}>
                  <div className='flex items-center justify-between mb-2'>
                    <p className={claude.microLabel}>Total Actions</p>
                    <div className={claude.iconTile}>
                      <Activity className='h-4 w-4' />
                    </div>
                  </div>
                  <p className='text-lg font-semibold text-[#141413] tabular-nums'>
                    {(
                      selectedUser.orderOperations.total +
                      selectedUser.productAdjustments.total
                    ).toLocaleString()}
                  </p>
                  <p className='text-xs text-[#57554D] mt-1'>
                    Combined activities
                  </p>
                </div>

                {/* Order Operations */}
                <div className={claude.card + " p-4"}>
                  <div className='flex items-center justify-between mb-2'>
                    <p className={claude.microLabel}>Order Operations</p>
                    <div className={claude.iconTile}>
                      <ShoppingCart className='h-4 w-4' />
                    </div>
                  </div>
                  <p className='text-lg font-semibold text-[#141413] tabular-nums'>
                    {selectedUser.orderOperations.total.toLocaleString()}
                  </p>
                  <div className='text-[11px] text-[#8A877D] mt-1 space-y-0.5'>
                    <div className='flex justify-between'>
                      <span>Creates:</span>
                      <span className='font-medium text-[#B85A3D]'>
                        {selectedUser.orderOperations.creates}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Status:</span>
                      <span className='font-medium text-[#57554D]'>
                        {selectedUser.orderOperations.statusUpdates}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Payments:</span>
                      <span className='font-medium text-[#57554D]'>
                        {selectedUser.orderOperations.paymentUpdates}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product Adjustments */}
                <div className={claude.card + " p-4"}>
                  <div className='flex items-center justify-between mb-2'>
                    <p className={claude.microLabel}>Stock Adjustments</p>
                    <div className={claude.iconTile}>
                      <Package className='h-4 w-4' />
                    </div>
                  </div>
                  <p className='text-lg font-semibold text-[#141413] tabular-nums'>
                    {selectedUser.productAdjustments.total.toLocaleString()}
                  </p>
                  <div className='text-[11px] text-[#8A877D] mt-1 space-y-0.5'>
                    <div className='flex justify-between'>
                      <span>Added:</span>
                      <span className='font-medium text-emerald-600'>
                        +{selectedUser.productAdjustments.quantityAdded}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Removed:</span>
                      <span className='font-medium text-rose-600'>
                        -{selectedUser.productAdjustments.quantityRemoved}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Products:</span>
                      <span className='font-medium text-[#57554D]'>
                        {selectedUser.productAdjustments.uniqueProducts}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Last Activity */}
                <div className={claude.card + " p-4"}>
                  <div className='flex items-center justify-between mb-2'>
                    <p className={claude.microLabel}>Last Activity</p>
                    <div className={claude.iconTile}>
                      <TrendingUp className='h-4 w-4' />
                    </div>
                  </div>
                  <p className='text-base font-semibold text-[#141413]'>
                    {dayjs(selectedUser.lastActivity).fromNow()}
                  </p>
                  <p className='text-[11px] text-[#8A877D] mt-1 tabular-nums'>
                    {dayjs(selectedUser.lastActivity).format(
                      "MMM DD, YYYY HH:mm",
                    )}
                  </p>
                </div>
              </div>

              {/* 90 Day Activity Pills */}
              {userDetail && userDetail.activityTrend.length > 0 && (
                <div className={claude.card + " p-4"}>
                  <ActivityPillGrid
                    title={`Activity — Last 90 Days${selectedUser ? ` · ${selectedUser.userName}` : ""}`}
                    days={userDetail.activityTrend.map((t) => ({
                      date: t.date,
                      count: t.orderActions + t.productAdjustments,
                    }))}
                  />
                </div>
              )}

              {/* Loading indicator for detail fetch */}
              {detailLoading && !userDetail && (
                <div className={claude.card + " p-4"}>
                  <InlineLoader domain='users' text='Loading Activity' />
                </div>
              )}

              {/* User Info and Actions */}
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-[#FAF9F6] rounded-lg border border-[#E8E4DC]'>
                <div className='flex items-center gap-3'>
                  <div className={claude.iconTile + " h-10 w-10"}>
                    <User className='h-5 w-5' />
                  </div>
                  <div>
                    <p className='text-[13px] font-semibold text-[#141413]'>
                      {selectedUser.userName}
                    </p>
                    <p className='text-[11px] text-[#8A877D]'>
                      {selectedUser.userEmail}
                    </p>
                  </div>
                  <Badge
                    variant='secondary'
                    className='rounded-md bg-[#FAF9F6] border border-[#E8E4DC] text-[#57554D]'>
                    {selectedUser.userType}
                  </Badge>
                </div>
                <button
                  onClick={handleViewDetails}
                  disabled={detailLoading}
                  className='inline-flex items-center justify-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-[#B85A3D] rounded-md hover:bg-[#A34E34] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'>
                  {detailLoading ? (
                    <ButtonLoadingText text='Loading…' />
                  ) : (
                    "View Detailed Report"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detailed User Performance Sheet */}
      <UserPerformanceSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        userName={selectedUser?.userName || ""}
        userDetail={userDetail}
        isLoading={detailLoading}
        error={detailError}
        startDate={startDate}
        endDate={endDate}
      />
    </>
  );
};
