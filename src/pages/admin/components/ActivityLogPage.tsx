import React, { useState, useEffect, useCallback } from "react";
import { useActivityLog, useUserTimeline } from "../../../hooks/useActivityLog";
import {
  ActivityLogEntry,
  exportActivityCsv,
} from "../../../api/activityLog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../../components/ui/sheet";
import {
  History,
  Search,
  RotateCcw,
  Download,
  Users,
  ShieldAlert,
  Activity,
  PencilLine,
  Clock,
  Globe,
  User2,
} from "lucide-react";
import dayjs from "dayjs";
import useDebounce from "../../../customHook/useDebounce";
import { useToast } from "../../../components/ui/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const ACTION_OPTIONS = [
  "USER_LOGIN",
  "USER_LOGIN_FAILED",
  "ORDER_CREATION",
  "ORDER_MODIFICATION",
  "ORDER_STATUS_UPDATE",
  "ORDER_BULK_UPDATE",
  "ORDER_DELETION",
  "ORDER_RETURN_PROCESSING",
  "PRODUCT_CREATION",
  "PRODUCT_MODIFICATION",
  "PRODUCT_DELETION",
  "COUPON_OPERATION",
  "ROLE_PERMISSION_CHANGE",
  "CONFIG_UPDATE",
  "BULK_OPERATION",
  "SEARCH_OPERATION",
  "ANALYTICS_VIEW",
  "DATA_EXPORT",
  "GENERIC_API_CALL",
];

const actionBadgeClass = (action: string): string => {
  if (action.includes("DELETION") || action.includes("FAILED"))
    return "bg-rose-50 text-rose-700 border-rose-200";
  if (action.includes("CREATION"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (action.includes("MODIFICATION") || action.includes("UPDATE"))
    return "bg-blue-50 text-blue-700 border-blue-200";
  if (action === "USER_LOGIN") return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (action.includes("VIEW") || action.includes("SEARCH"))
    return "bg-violet-50 text-violet-700 border-violet-200";
  if (action.includes("CHANGE") || action.includes("BULK"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
};

const methodBadgeClass = (method: string): string => {
  switch (method) {
    case "POST":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PUT":
    case "PATCH":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "DELETE":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

const prettyJson = (value: any): string => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export const ActivityLogPage: React.FC = () => {
  const { toast } = useToast();
  const {
    logs,
    pagination,
    stats,
    isLoading,
    error,
    currentPage,
    limit,
    filters,
    setCurrentPage,
    setLimit,
    updateFilter,
    setDateRange,
    resetFilters,
    nextPage,
    prevPage,
    refetch,
  } = useActivityLog();

  const { timeline, isLoading: timelineLoading, fetchTimeline, clearTimeline } =
    useUserTimeline();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [detailEntry, setDetailEntry] = useState<ActivityLogEntry | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    updateFilter("search", debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleOpenTimeline = useCallback(
    (userId: string) => {
      setTimelineOpen(true);
      fetchTimeline(userId);
    },
    [fetchTimeline]
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportActivityCsv(filters as any);
      if (result.success && result.data) {
        const filename = `activity_log_${dayjs().format("YYYY-MM-DD")}.csv`;
        const { saveAs } = await import("file-saver");
        saveAs(result.data, filename);
        toast({ title: "Export ready", description: filename });
      } else {
        toast({
          title: "Export failed",
          description: result.error || "Failed to export activity log",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Export failed",
        description: err?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    setSearchInput("");
    resetFilters();
  };

  if (error && logs.length === 0 && !isLoading) {
    return (
      <div className="container space-y-6">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <p className="text-sm text-rose-700">Error: {error}</p>
          <button
            onClick={refetch}
            className="mt-3 px-3 py-1.5 text-sm font-medium rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-100">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200">
            <History className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 leading-tight">
              Activity Log
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Every recorded staff action — who did what, when and from where
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type='datetime-local'
            value={
              filters.startDate
                ? dayjs(filters.startDate).format("YYYY-MM-DDTHH:mm")
                : ""
            }
            onChange={(e) =>
              setDateRange(
                e.target.value
                  ? new Date(e.target.value).toISOString()
                  : undefined,
                filters.endDate
              )
            }
            className='px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
          <span className='text-sm text-slate-500'>to</span>
          <input
            type='datetime-local'
            value={
              filters.endDate
                ? dayjs(filters.endDate).format("YYYY-MM-DDTHH:mm")
                : ""
            }
            onChange={(e) =>
              setDateRange(
                filters.startDate,
                e.target.value
                  ? dayjs(e.target.value).endOf("day").toISOString()
                  : undefined
              )
            }
            className='px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
          <button
            onClick={refetch}
            className='px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-1.5'>
            <RotateCcw className='h-3.5 w-3.5' />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className='px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 disabled:opacity-50'>
            <Download className='h-3.5 w-3.5' />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        <div className='bg-white rounded-xl border border-slate-100 p-4 shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50'>
              <Activity className='h-4 w-4 text-indigo-600' />
            </div>
          </div>
          <p className='text-lg font-semibold text-indigo-600 leading-none mb-1'>
            {stats?.totals.totalActions?.toLocaleString() ?? "—"}
          </p>
          <p className='text-xs text-slate-500'>Total Actions</p>
        </div>
        <div className='bg-white rounded-xl border border-slate-100 p-4 shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50'>
              <Users className='h-4 w-4 text-emerald-600' />
            </div>
          </div>
          <p className='text-lg font-semibold text-emerald-600 leading-none mb-1'>
            {stats?.totals.activeUsers?.toLocaleString() ?? "—"}
          </p>
          <p className='text-xs text-slate-500'>Active Users</p>
        </div>
        <div className='bg-white rounded-xl border border-slate-100 p-4 shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50'>
              <PencilLine className='h-4 w-4 text-amber-600' />
            </div>
          </div>
          <p className='text-lg font-semibold text-amber-600 leading-none mb-1'>
            {stats?.totals.mutations?.toLocaleString() ?? "—"}
          </p>
          <p className='text-xs text-slate-500'>Mutations (write ops)</p>
        </div>
        <div className='bg-white rounded-xl border border-slate-100 p-4 shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50'>
              <ShieldAlert className='h-4 w-4 text-rose-600' />
            </div>
          </div>
          <p className='text-lg font-semibold text-rose-600 leading-none mb-1'>
            {stats?.totals.failures?.toLocaleString() ?? "—"}
            {stats && stats.totals.totalActions > 0 && (
              <span className='text-xs font-normal text-slate-500 ml-1'>
                ({stats.totals.successRate}% ok)
              </span>
            )}
          </p>
          <p className='text-xs text-slate-500'>Failed Requests</p>
        </div>
      </div>

      <Tabs defaultValue='feed'>
        <TabsList>
          <TabsTrigger value='feed'>Activity Feed</TabsTrigger>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
        </TabsList>

        {/* ================= FEED TAB ================= */}
        <TabsContent value='feed' className='space-y-4'>
          {/* Filter Bar */}
          <div className='flex flex-col lg:flex-row lg:items-center gap-3'>
            <div className='relative flex-1 lg:max-w-xs'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
              <input
                type='text'
                placeholder='Search endpoint...'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className='w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
            </div>

            <select
              value={filters.action || ""}
              onChange={(e) => updateFilter("action", e.target.value)}
              className='px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'>
              <option value=''>All Actions</option>
              {ACTION_OPTIONS.map((action) => (
                <option key={action} value={action}>
                  {action.replace(/_/g, " ")}
                </option>
              ))}
            </select>

            <select
              value={filters.method || ""}
              onChange={(e) => updateFilter("method", e.target.value)}
              className='px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'>
              <option value=''>All Methods</option>
              <option value='GET'>GET</option>
              <option value='POST'>POST</option>
              <option value='PUT'>PUT</option>
              <option value='PATCH'>PATCH</option>
              <option value='DELETE'>DELETE</option>
            </select>

            <select
              value={filters.success || ""}
              onChange={(e) => updateFilter("success", e.target.value)}
              className='px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'>
              <option value=''>All Statuses</option>
              <option value='true'>Success only</option>
              <option value='false'>Failures only</option>
            </select>

            <input
              type='text'
              placeholder='IP address'
              value={filters.ip || ""}
              onChange={(e) => updateFilter("ip", e.target.value)}
              className='px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40'
            />

            <button
              onClick={handleReset}
              className='px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-1.5'>
              <RotateCcw className='h-3.5 w-3.5' />
              Reset
            </button>
          </div>

          {/* Feed Table */}
          <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-slate-50'>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Request</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j}>
                            <div className='h-4 bg-slate-100 rounded animate-pulse' />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className='text-center py-12'>
                          <History className='w-12 h-12 mx-auto mb-3 text-slate-300' />
                          <p className='text-sm text-slate-500'>
                            No activity recorded for the current filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((entry) => (
                      <TableRow
                        key={entry._id}
                        onClick={() => setDetailEntry(entry)}
                        className='hover:bg-slate-50 transition-colors cursor-pointer'>
                        <TableCell>
                          <p className='text-sm text-slate-900'>
                            {dayjs(entry.timestamp).format("MMM D, YYYY")}
                          </p>
                          <p className='text-xs text-slate-500'>
                            {dayjs(entry.timestamp).format("h:mm:ss A")}
                          </p>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTimeline(entry.userId);
                            }}
                            className='text-left group'
                            title='View user timeline'>
                            <p className='text-sm font-medium text-slate-900 group-hover:text-indigo-600'>
                              {entry.userName}
                            </p>
                            <p className='text-xs text-slate-500'>
                              {entry.userEmail || entry.userId}
                            </p>
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline' className={actionBadgeClass(entry.action)}>
                            {entry.action.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1.5'>
                            <Badge variant='outline' className={methodBadgeClass(entry.method)}>
                              {entry.method}
                            </Badge>
                            <span
                              className='text-sm text-slate-600 max-w-[260px] truncate'
                              title={entry.endpoint}>
                              {entry.endpoint}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant='outline'
                            className={
                              entry.statusCode < 400
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }>
                            {entry.statusCode}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className='text-sm text-slate-600'>
                            {entry.duration}ms
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className='text-sm text-slate-600 font-mono'>
                            {entry.metadata?.ipAddress || "—"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            {pagination && (
              <div className='flex items-center justify-between px-4 py-3 border-t border-slate-100'>
                <p className='text-sm text-slate-500'>
                  Showing{" "}
                  <span className='font-medium text-slate-900'>
                    {pagination.totalCount === 0
                      ? 0
                      : (pagination.currentPage - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className='font-medium text-slate-900'>
                    {Math.min(
                      pagination.currentPage * pagination.limit,
                      pagination.totalCount
                    )}
                  </span>{" "}
                  of{" "}
                  <span className='font-medium text-slate-900'>
                    {pagination.totalCount.toLocaleString()}
                  </span>{" "}
                  actions
                </p>
                <div className='flex items-center gap-2'>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className='px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700'>
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                  <button
                    onClick={prevPage}
                    disabled={!pagination.hasPrev}
                    className='px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed'>
                    Previous
                  </button>
                  <span className='text-sm text-slate-600'>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={!pagination.hasNext}
                    className='px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed'>
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ================= OVERVIEW TAB ================= */}
        <TabsContent value='overview' className='space-y-4'>
          {stats ? (
            <>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-4'>
                  <h3 className='text-sm font-semibold text-slate-900 mb-3'>
                    Actions per Day
                  </h3>
                  <div className='h-64'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={stats.byDay} barCategoryGap='20%'>
                        <XAxis
                          dataKey='date'
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => dayjs(v).format("MM/DD")}
                        />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey='count' fill='#6366f1' radius={[3, 3, 0, 0]} />
                        <Bar dataKey='failures' fill='#f43f5e' radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='flex items-center gap-4 mt-2'>
                    <span className='flex items-center gap-1.5 text-xs text-slate-500'>
                      <span className='w-2.5 h-2.5 rounded-sm bg-indigo-500' /> Actions
                    </span>
                    <span className='flex items-center gap-1.5 text-xs text-slate-500'>
                      <span className='w-2.5 h-2.5 rounded-sm bg-rose-500' /> Failures
                    </span>
                  </div>
                </div>

                <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-4'>
                  <h3 className='text-sm font-semibold text-slate-900 mb-3'>
                    Actions by Type
                  </h3>
                  <div className='h-64'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={stats.byAction} barCategoryGap='25%'>
                        <XAxis
                          dataKey='action'
                          tick={{ fontSize: 9 }}
                          interval={0}
                          angle={-35}
                          textAnchor='end'
                          height={70}
                          tickFormatter={(v: string) =>
                            v.length > 14 ? v.slice(0, 13) + "…" : v
                          }
                        />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey='count' radius={[3, 3, 0, 0]}>
                          {stats.byAction.map((_, index) => (
                            <Cell
                              key={index}
                              fill={
                                index % 3 === 0
                                  ? "#6366f1"
                                  : index % 3 === 1
                                    ? "#10b981"
                                    : "#f59e0b"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Top users */}
              <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-4'>
                <h3 className='text-sm font-semibold text-slate-900 mb-3'>
                  Most Active Users
                </h3>
                {stats.topUsers.length === 0 ? (
                  <p className='text-sm text-slate-500 py-4'>No activity in range</p>
                ) : (
                  <div className='space-y-2'>
                    {stats.topUsers.map((user, index) => {
                      const max = stats.topUsers[0]?.count || 1;
                      return (
                        <button
                          key={`${user.userId}-${index}`}
                          onClick={() => handleOpenTimeline(user.userId)}
                          className='w-full flex items-center gap-3 text-left group'>
                          <div className='flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold'>
                            {index + 1}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center justify-between mb-1'>
                              <p className='text-sm font-medium text-slate-900 group-hover:text-indigo-600 truncate'>
                                {user.userName}
                              </p>
                              <div className='flex items-center gap-3 text-xs text-slate-500 shrink-0 ml-2'>
                                <span>{user.count.toLocaleString()} actions</span>
                                {user.failures > 0 && (
                                  <span className='text-rose-600'>
                                    {user.failures} failed
                                  </span>
                                )}
                                <span>
                                  {dayjs(user.lastActivity).format("MMM D, h:mm A")}
                                </span>
                              </div>
                            </div>
                            <div className='h-1.5 bg-slate-100 rounded-full overflow-hidden'>
                              <div
                                className='h-full bg-indigo-500 rounded-full'
                                style={{
                                  width: `${Math.max(4, (user.count / max) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className='text-center py-12 text-sm text-slate-500'>
              {stats === null ? "Loading overview..." : "No stats available"}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ================= DETAIL SHEET ================= */}
      <Sheet open={!!detailEntry} onOpenChange={(open) => !open && setDetailEntry(null)}>
        <SheetContent className='w-full sm:max-w-2xl overflow-y-auto'>
          {detailEntry && (
            <>
              <SheetHeader>
                <SheetTitle className='flex items-center gap-2'>
                  <Badge variant='outline' className={actionBadgeClass(detailEntry.action)}>
                    {detailEntry.action.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant='outline' className={methodBadgeClass(detailEntry.method)}>
                    {detailEntry.method}
                  </Badge>
                  <Badge
                    variant='outline'
                    className={
                      detailEntry.statusCode < 400
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }>
                    {detailEntry.statusCode}
                  </Badge>
                </SheetTitle>
                <SheetDescription className='break-all'>
                  {detailEntry.endpoint}
                </SheetDescription>
              </SheetHeader>

              <div className='mt-5 space-y-5'>
                {/* Who */}
                <div className='rounded-xl border border-slate-100 p-4'>
                  <h4 className='text-xs font-semibold uppercase text-slate-400 mb-3'>
                    Who
                  </h4>
                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    <div>
                      <p className='text-slate-500 text-xs'>User</p>
                      <p className='font-medium text-slate-900'>
                        {detailEntry.userName}
                      </p>
                    </div>
                    <div>
                      <p className='text-slate-500 text-xs'>Email</p>
                      <p className='text-slate-700'>
                        {detailEntry.userEmail || "—"}
                      </p>
                    </div>
                    <div>
                      <p className='text-slate-500 text-xs'>User ID</p>
                      <p className='text-slate-700 font-mono text-xs'>
                        {detailEntry.userId}
                      </p>
                    </div>
                    <div>
                      <p className='text-slate-500 text-xs'>Role ID</p>
                      <p className='text-slate-700 font-mono text-xs'>
                        {detailEntry.userRoleId || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* What / When / Where */}
                <div className='rounded-xl border border-slate-100 p-4'>
                  <h4 className='text-xs font-semibold uppercase text-slate-400 mb-3'>
                    What, When & Where
                  </h4>
                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    <div>
                      <p className='text-slate-500 text-xs'>Timestamp</p>
                      <p className='text-slate-700'>
                        {dayjs(detailEntry.timestamp).format(
                          "MMM D, YYYY h:mm:ss A"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className='text-slate-500 text-xs'>Duration</p>
                      <p className='text-slate-700'>{detailEntry.duration}ms</p>
                    </div>
                    <div>
                      <p className='text-slate-500 text-xs'>IP Address</p>
                      <p className='text-slate-700 font-mono text-xs flex items-center gap-1'>
                        <Globe className='h-3 w-3' />
                        {detailEntry.metadata?.ipAddress || "—"}
                      </p>
                    </div>
                    <div>
                      <p className='text-slate-500 text-xs'>Resource</p>
                      <p className='text-slate-700 text-xs'>
                        {detailEntry.resourceType || "—"}
                        {detailEntry.resourceId ? ` · ${detailEntry.resourceId}` : ""}
                      </p>
                    </div>
                    <div className='col-span-2'>
                      <p className='text-slate-500 text-xs'>User Agent</p>
                      <p className='text-slate-700 text-xs break-all'>
                        {detailEntry.metadata?.userAgent || "—"}
                      </p>
                    </div>
                    {detailEntry.metadata?.errorMessage && (
                      <div className='col-span-2'>
                        <p className='text-rose-500 text-xs'>Error</p>
                        <p className='text-rose-700 text-xs break-all'>
                          {detailEntry.metadata.errorMessage}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Query / Params */}
                {(detailEntry.metadata?.additionalInfo?.query ||
                  detailEntry.metadata?.additionalInfo?.params) && (
                  <div className='rounded-xl border border-slate-100 p-4'>
                    <h4 className='text-xs font-semibold uppercase text-slate-400 mb-3'>
                      Query & Params
                    </h4>
                    <pre className='text-xs bg-slate-50 rounded-lg p-3 overflow-x-auto text-slate-700'>
                      {prettyJson({
                        query: detailEntry.metadata?.additionalInfo?.query,
                        params: detailEntry.metadata?.additionalInfo?.params,
                      })}
                    </pre>
                  </div>
                )}

                {/* Request body (mutations only, redacted at write time) */}
                {detailEntry.metadata?.additionalInfo?.requestBody !== undefined && (
                  <div className='rounded-xl border border-slate-100 p-4'>
                    <div className='flex items-center justify-between mb-3'>
                      <h4 className='text-xs font-semibold uppercase text-slate-400'>
                        Request Body
                      </h4>
                      <div className='flex flex-wrap gap-1'>
                        {detailEntry.changeDetails?.changedFields?.map((field) => (
                          <Badge key={field} variant='outline' className='text-xs'>
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className='text-xs text-slate-400 mb-2'>
                      Sensitive fields (passwords, tokens, OTPs) are redacted automatically.
                    </p>
                    <pre className='text-xs bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto max-h-80'>
                      {prettyJson(detailEntry.metadata?.additionalInfo?.requestBody)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ================= USER TIMELINE SHEET ================= */}
      <Sheet
        open={timelineOpen}
        onOpenChange={(open) => {
          if (!open) {
            setTimelineOpen(false);
            clearTimeline();
          }
        }}>
        <SheetContent className='w-full sm:max-w-2xl overflow-y-auto'>
          <SheetHeader>
            <SheetTitle className='flex items-center gap-2'>
              <User2 className='h-4 w-4 text-indigo-600' />
              {timeline?.userName || "User timeline"}
            </SheetTitle>
            <SheetDescription>
              Full action history for this user — click an entry for details
            </SheetDescription>
          </SheetHeader>

          {timelineLoading && !timeline && (
            <div className='flex justify-center py-10'>
              <div className='w-8 h-8 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin' />
            </div>
          )}

          {timeline && (
            <div className='mt-5 space-y-5'>
              {/* Summary */}
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                <div className='rounded-xl border border-slate-100 p-3'>
                  <p className='text-lg font-semibold text-indigo-600 leading-none'>
                    {timeline.summary.totalActions.toLocaleString()}
                  </p>
                  <p className='text-xs text-slate-500 mt-1'>Total Actions</p>
                </div>
                <div className='rounded-xl border border-slate-100 p-3'>
                  <p className='text-lg font-semibold text-slate-700 leading-none text-xs pt-1 font-mono'>
                    {timeline.summary.lastActivity
                      ? dayjs(timeline.summary.lastActivity).format("MMM D, h:mm A")
                      : "—"}
                  </p>
                  <p className='text-xs text-slate-500 mt-1'>Last Activity</p>
                </div>
                <div className='rounded-xl border border-slate-100 p-3'>
                  <p className='text-sm font-medium text-slate-700 leading-tight truncate'>
                    {timeline.summary.ips.length > 0
                      ? timeline.summary.ips.join(", ")
                      : "—"}
                  </p>
                  <p className='text-xs text-slate-500 mt-1'>IP(s)</p>
                </div>
              </div>

              {/* Action breakdown */}
              <div className='rounded-xl border border-slate-100 p-4'>
                <h4 className='text-xs font-semibold uppercase text-slate-400 mb-3'>
                  Action Breakdown
                </h4>
                <div className='flex flex-wrap gap-1.5'>
                  {timeline.summary.actionBreakdown.map((item) => (
                    <Badge
                      key={item._id}
                      variant='outline'
                      className={actionBadgeClass(item._id)}>
                      {item._id.replace(/_/g, " ")} · {item.count}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Timeline entries */}
              <div className='relative'>
                <div className='absolute left-[11px] top-2 bottom-2 w-px bg-slate-200' />
                <div className='space-y-3'>
                  {timeline.logs.map((entry) => (
                    <button
                      key={entry._id}
                      onClick={() => setDetailEntry(entry)}
                      className='relative flex items-start gap-3 w-full text-left pl-8 pr-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group'>
                      <span
                        className={`absolute left-1 top-3 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                          entry.success ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <Badge
                            variant='outline'
                            className={actionBadgeClass(entry.action)}>
                            {entry.action.replace(/_/g, " ")}
                          </Badge>
                          <span className='text-xs text-slate-500'>
                            <Clock className='inline h-3 w-3 mr-0.5' />
                            {dayjs(entry.timestamp).format("MMM D, h:mm:ss A")}
                          </span>
                        </div>
                        <p className='text-xs text-slate-600 mt-1 truncate group-hover:text-indigo-600'>
                          {entry.method} {entry.endpoint}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium shrink-0 ${
                          entry.statusCode < 400 ? "text-emerald-600" : "text-rose-600"
                        }`}>
                        {entry.statusCode}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
