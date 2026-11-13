import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Ban,
  Clock,
  Download,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { cn } from "../../lib/utils";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import {
  exportFraudReport,
  getFraudDashboard,
  getHighRiskCustomers,
  getMediumRiskCustomers,
  getRecentlyFlagged,
  searchFraudCustomers,
  type FraudCustomer,
  type FraudDashboardStats,
} from "../../api/fraud";
import {
  CARD_CLASS,
  CARD_HEADER_CLASS,
  EYEBROW_CLASS,
  formatFraudDate,
} from "../../components/fraud/fraudTheme";
import FraudStatCard from "../../components/fraud/FraudStatCard";
import CustomerTable, { TablePagination } from "./CustomerTable";
import FraudGroupTab from "./FraudGroupTab";
import CustomerDetailSheet from "./CustomerDetailSheet";
import { useIsMobile } from "../../hooks/use-mobile";
import {
  MobileEmptyState,
  MobileListCard,
  MobilePage,
  MobilePagination,
  MobileSkeletonList,
  MobileStaggeredList,
  rippleProps,
} from "../../components/mobile";
import { PageHeader } from "../../components/PageHeader";

const PAGE_SIZE = 20;

/** Fraud management — dashboard, risk lists, and the blocked-customer group */
const FraudManagementPage = () => {
  const { hasRequiredPermission } = useRoleCheck();
  const canManage = hasRequiredPermission("fraud", "manage");
  const canBlock = hasRequiredPermission("fraud", "block");

  // Dashboard
  const [stats, setStats] = useState<FraudDashboardStats | null>(null);
  const [recent, setRecent] = useState<FraudCustomer[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  // Customers tab
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FraudCustomer[] | null>(
    null,
  );
  const [searching, setSearching] = useState(false);
  const [listTab, setListTab] = useState<"high" | "medium">("high");
  const [customers, setCustomers] = useState<FraudCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [exporting, setExporting] = useState(false);
  const [detailPhone, setDetailPhone] = useState<string | null>(null);
  const [detailName, setDetailName] = useState<string | undefined>();
  const isMobile = useIsMobile();

  const fetchStats = useCallback(async () => {
    const result = await getFraudDashboard();
    if (result.success && result.data) setStats(result.data);
  }, []);

  const fetchRecent = useCallback(async () => {
    setRecentLoading(true);
    const result = await getRecentlyFlagged({ days: 7 });
    if (result.success && result.data) setRecent(result.data.customers);
    setRecentLoading(false);
  }, []);

  const fetchCustomers = useCallback(async () => {
    setCustomersLoading(true);
    const params = { page: page + 1, limit: PAGE_SIZE }; // backend is 1-based
    const result =
      listTab === "high"
        ? await getHighRiskCustomers(params)
        : await getMediumRiskCustomers(params);
    if (result.success && result.data) {
      setCustomers(result.data.customers);
      setTotalPages(result.data.pagination.totalPages || 1);
    }
    setCustomersLoading(false);
  }, [listTab, page]);

  useEffect(() => {
    fetchStats();
    fetchRecent();
  }, [fetchStats, fetchRecent]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const result = await searchFraudCustomers(searchQuery.trim());
      setSearching(false);
      if (result.success && result.data) {
        setSearchResults(result.data.customers);
      } else {
        toast.error(result.error || "Search failed");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleExport = async () => {
    setExporting(true);
    const result = await exportFraudReport();
    setExporting(false);
    if (result.success) toast.success("Fraud report exported");
    else toast.error(result.error || "Export failed");
  };

  const refreshAll = () => {
    fetchStats();
    fetchRecent();
    fetchCustomers();
  };

  // ── Mobile: card list replacement for CustomerTable ──
  const renderCustomerCards = (
    list: FraudCustomer[],
    loading: boolean,
    emptyMessage: string,
  ) => {
    if (loading) return <MobileSkeletonList count={5} />;
    if (list.length === 0)
      return (
        <MobileEmptyState
          icon={<ShieldAlert className='h-7 w-7' />}
          title='No customers'
          description={emptyMessage}
        />
      );
    return (
      <MobileStaggeredList key={`${listTab}-${page}-${list.length}`}>
        {list.map((customer) => (
          <MobileListCard
            key={customer.phoneNumber}
            onClick={() => {
              setDetailPhone(customer.phoneNumber);
              setDetailName(customer.customerName);
            }}
            title={customer.customerName}
            subtitle={
              <span>
                <span className='font-mono'>{customer.phoneNumber}</span>
                {customer.totalOrders ? ` · ${customer.totalOrders} orders` : ""}
              </span>
            }
            trailing={
              <span className='text-sm font-semibold tabular-nums'>
                {customer.riskScore?.toFixed?.() ?? customer.riskScore}
              </span>
            }
            badge={
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                  customer.riskLevel === "red"
                    ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300"
                    : customer.riskLevel === "yellow"
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300",
                )}>
                {customer.riskLevel === "red"
                  ? "high"
                  : customer.riskLevel === "yellow"
                    ? "medium"
                    : "low"}
              </span>
            }
          />
        ))}
      </MobileStaggeredList>
    );
  };

  // ── Mobile page ──
  if (isMobile) {
    return (
      <MobilePage
        title='Fraud Detection'
        icon={<ShieldAlert className='h-5 w-5 text-primary' />}
        subtitle='Risk scoring, review lists & blocked customers'
        back
        actions={
          <>
            <button
              onClick={handleExport}
              disabled={exporting}
              aria-label='Export CSV'
              className='m3-ripple grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary active:scale-95 transition-transform disabled:opacity-50'
              {...rippleProps()}>
              {exporting ? (
                <Loader2 className='h-4.5 w-4.5 animate-spin' />
              ) : (
                <Download className='h-4.5 w-4.5' />
              )}
            </button>
            <button
              onClick={refreshAll}
              aria-label='Refresh'
              className='m3-ripple grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary active:scale-95 transition-transform'
              {...rippleProps()}>
              <RefreshCw className='h-4.5 w-4.5' />
            </button>
          </>
        }>
        <div className='space-y-3 px-4 pt-3 pb-6'>
          <Tabs defaultValue='overview' className='space-y-3'>
            <TabsList className='bg-slate-100 dark:bg-slate-800 h-8 mobile:flex mobile:w-full mobile:overflow-x-auto'>
              <TabsTrigger value='overview' className='text-[12px] h-6 gap-1.5'>
                <ShieldCheck className='w-3.5 h-3.5' />
                Overview
              </TabsTrigger>
              <TabsTrigger value='customers' className='text-[12px] h-6 gap-1.5'>
                <Users className='w-3.5 h-3.5' />
                Customers
              </TabsTrigger>
              <TabsTrigger value='blocked' className='text-[12px] h-6 gap-1.5'>
                <Ban className='w-3.5 h-3.5' />
                Blocked
              </TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value='overview' className='space-y-3'>
              <div className='grid grid-cols-2 gap-3'>
                <FraudStatCard
                  label='Total customers'
                  value={stats?.totalCustomers ?? "—"}
                  icon={Users}
                  sub='Analyzed risk profiles'
                />
                <FraudStatCard
                  label='High risk'
                  value={stats?.riskDistribution.red ?? "—"}
                  level='red'
                  icon={ShieldAlert}
                  sub='Require manual review'
                />
                <FraudStatCard
                  label='Medium risk'
                  value={stats?.riskDistribution.yellow ?? "—"}
                  level='yellow'
                  icon={Shield}
                  sub='Watch list'
                />
                <FraudStatCard
                  label='Low risk'
                  value={stats?.riskDistribution.green ?? "—"}
                  level='green'
                  icon={ShieldCheck}
                  sub='Healthy customers'
                />
              </div>

              <div className={cn(CARD_CLASS)}>
                <div
                  className={cn(CARD_HEADER_CLASS, "flex items-center gap-1.5")}>
                  <AlertTriangle className='w-3 h-3 text-slate-400' />
                  <span className={EYEBROW_CLASS}>
                    Recently flagged (last 7 days)
                  </span>
                </div>
                <div className='px-2 py-2'>
                  {renderCustomerCards(recent, recentLoading, "No new flags this week")}
                </div>
              </div>

              <div className={cn(CARD_CLASS)}>
                <div
                  className={cn(CARD_HEADER_CLASS, "flex items-center gap-1.5")}>
                  <Clock className='w-3 h-3 text-slate-400' />
                  <span className={EYEBROW_CLASS}>Analysis schedule</span>
                </div>
                <div className='px-3 py-3 space-y-2 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed'>
                  <p>
                    Runs automatically daily at 12:00 AM (Asia/Dhaka) across all
                    customers.
                  </p>
                  <p className='text-slate-500 dark:text-slate-400'>
                    Last analysis: {formatFraudDate(stats?.lastAnalysisDate)}
                  </p>
                  {canManage ? (
                    <p className='text-slate-500 dark:text-slate-400'>
                      Per-customer re-analysis is available from any customer's
                      detail panel. Full runs live in
                      <span className='font-medium'> Settings → Jobs</span>.
                    </p>
                  ) : null}
                </div>
              </div>
            </TabsContent>

            {/* Customers */}
            <TabsContent value='customers' className='space-y-3'>
              <div className='relative w-full'>
                <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400' />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search by phone, name or email…'
                  className='h-10 pl-8 text-[13px] rounded-full border-slate-300 dark:border-slate-600 bg-[#FAF9F6] dark:bg-slate-800'
                />
                {searching ? (
                  <Loader2 className='absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin' />
                ) : null}
              </div>

              {searchResults ? (
                <div className={cn(CARD_CLASS)}>
                  <div
                    className={cn(
                      CARD_HEADER_CLASS,
                      "flex items-center gap-1.5",
                    )}>
                    <Search className='w-3 h-3 text-slate-400' />
                    <span className={EYEBROW_CLASS}>
                      Search results ({searchResults.length})
                    </span>
                  </div>
                  <div className='px-2 py-2'>
                    {renderCustomerCards(
                      searchResults,
                      false,
                      `No matches for "${searchQuery}"`,
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className='flex items-center gap-1.5'>
                    {(["high", "medium"] as const).map((tab) => (
                      <button
                        key={tab}
                        type='button'
                        onClick={() => {
                          setListTab(tab);
                          setPage(0);
                        }}
                        className={cn(
                          "px-3 py-1.5 text-[12px] rounded-full border transition-colors flex items-center gap-1.5",
                          listTab === tab
                            ? tab === "high"
                              ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300"
                              : "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300"
                            : "bg-[#FAF9F6] border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300",
                        )}>
                        {tab === "high" ? (
                          <ShieldAlert className='w-3 h-3' />
                        ) : (
                          <Shield className='w-3 h-3' />
                        )}
                        {tab === "high" ? "High risk" : "Medium risk"}
                      </button>
                    ))}
                  </div>
                  <div className={cn(CARD_CLASS)}>
                    <div className='px-2 py-2'>
                      {renderCustomerCards(
                        customers,
                        customersLoading,
                        "No customers in this list",
                      )}
                    </div>
                    <TablePagination
                      page={page}
                      totalPages={totalPages}
                      onChange={setPage}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            {/* Blocked */}
            <TabsContent value='blocked'>
              <FraudGroupTab />
            </TabsContent>
          </Tabs>

          <CustomerDetailSheet
            open={!!detailPhone}
            onOpenChange={(open) => !open && setDetailPhone(null)}
            phoneNumber={detailPhone}
            customerName={detailName}
            onChanged={refreshAll}
          />
        </div>
      </MobilePage>
    );
  }

  return (
    <div className='w-full mx-auto px-4 py-5 space-y-4 md:container'>
      {/* Header */}
      <PageHeader
        icon={<ShieldAlert className='w-5 h-5 text-white' />}
        title='Fraud Detection'
        subtitle='Risk scoring, review lists & blocked customers'
        actions={
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleExport}
              disabled={exporting}
              className='h-8 rounded-md gap-1.5 border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300'>
              {exporting ? (
                <Loader2 className='w-3.5 h-3.5 animate-spin' />
              ) : (
                <Download className='w-3.5 h-3.5' />
              )}
              Export CSV
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={refreshAll}
              className='h-8 rounded-md gap-1.5 border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300'>
              <RefreshCw className='w-3.5 h-3.5' />
              Refresh
            </Button>
          </div>
        }
      />

      <Tabs defaultValue='overview' className='space-y-3'>
        <TabsList className='bg-slate-100 dark:bg-slate-800 h-8'>
          <TabsTrigger value='overview' className='text-[12px] h-6 gap-1.5'>
            <ShieldCheck className='w-3.5 h-3.5' />
            Overview
          </TabsTrigger>
          <TabsTrigger value='customers' className='text-[12px] h-6 gap-1.5'>
            <Users className='w-3.5 h-3.5' />
            Customers
          </TabsTrigger>
          <TabsTrigger value='blocked' className='text-[12px] h-6 gap-1.5'>
            <Ban className='w-3.5 h-3.5' />
            Blocked
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value='overview' className='space-y-3'>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
            <FraudStatCard
              label='Total customers'
              value={stats?.totalCustomers ?? "—"}
              icon={Users}
              sub='Analyzed risk profiles'
            />
            <FraudStatCard
              label='High risk'
              value={stats?.riskDistribution.red ?? "—"}
              level='red'
              icon={ShieldAlert}
              sub='Require manual review'
            />
            <FraudStatCard
              label='Medium risk'
              value={stats?.riskDistribution.yellow ?? "—"}
              level='yellow'
              icon={Shield}
              sub='Watch list'
            />
            <FraudStatCard
              label='Low risk'
              value={stats?.riskDistribution.green ?? "—"}
              level='green'
              icon={ShieldCheck}
              sub='Healthy customers'
            />
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
            <div className={cn(CARD_CLASS, "lg:col-span-1")}>
              <div
                className={cn(CARD_HEADER_CLASS, "flex items-center gap-1.5")}>
                <Clock className='w-3 h-3 text-slate-400' />
                <span className={EYEBROW_CLASS}>Analysis schedule</span>
              </div>
              <div className='px-3 py-3 space-y-2 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed'>
                <p>
                  Runs automatically daily at 12:00 AM (Asia/Dhaka) across all
                  customers.
                </p>
                <p className='text-slate-500 dark:text-slate-400'>
                  Last analysis: {formatFraudDate(stats?.lastAnalysisDate)}
                </p>
                {canManage ? (
                  <p className='text-slate-500 dark:text-slate-400'>
                    Per-customer re-analysis is available from any customer's
                    detail panel. Full runs live in
                    <span className='font-medium'> Settings → Jobs</span>.
                  </p>
                ) : null}
              </div>
            </div>

            <div className={cn(CARD_CLASS, "lg:col-span-2")}>
              <div
                className={cn(CARD_HEADER_CLASS, "flex items-center gap-1.5")}>
                <AlertTriangle className='w-3 h-3 text-slate-400' />
                <span className={EYEBROW_CLASS}>
                  Recently flagged (last 7 days)
                </span>
              </div>
              <CustomerTable
                customers={recent}
                loading={recentLoading}
                onView={(customer) => {
                  setDetailPhone(customer.phoneNumber);
                  setDetailName(customer.customerName);
                }}
                emptyMessage='No new flags this week'
              />
            </div>
          </div>
        </TabsContent>

        {/* Customers */}
        <TabsContent value='customers' className='space-y-3'>
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2'>
            <div className='relative w-full sm:w-72'>
              <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400' />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search by phone, name or email…'
                className='h-8 pl-8 text-[12px] border-slate-300 dark:border-slate-600 bg-[#FAF9F6] dark:bg-slate-800'
              />
              {searching ? (
                <Loader2 className='absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin' />
              ) : null}
            </div>
            {!searchResults ? (
              <div className='flex items-center gap-1.5'>
                {(["high", "medium"] as const).map((tab) => (
                  <button
                    key={tab}
                    type='button'
                    onClick={() => {
                      setListTab(tab);
                      setPage(0);
                    }}
                    className={cn(
                      "px-2.5 py-1 text-[11px] rounded-full border transition-colors flex items-center gap-1.5",
                      listTab === tab
                        ? tab === "high"
                          ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300"
                          : "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300"
                        : "bg-[#FAF9F6] border-slate-300 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300",
                    )}>
                    {tab === "high" ? (
                      <ShieldAlert className='w-3 h-3' />
                    ) : (
                      <Shield className='w-3 h-3' />
                    )}
                    {tab === "high" ? "High risk" : "Medium risk"}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className={CARD_CLASS}>
            {searchResults ? (
              <>
                <div
                  className={cn(
                    CARD_HEADER_CLASS,
                    "flex items-center gap-1.5",
                  )}>
                  <Search className='w-3 h-3 text-slate-400' />
                  <span className={EYEBROW_CLASS}>
                    Search results ({searchResults.length})
                  </span>
                </div>
                <CustomerTable
                  customers={searchResults}
                  loading={false}
                  onView={(customer) => {
                    setDetailPhone(customer.phoneNumber);
                    setDetailName(customer.customerName);
                  }}
                  emptyMessage={`No matches for "${searchQuery}"`}
                />
              </>
            ) : (
              <>
                <CustomerTable
                  customers={customers}
                  loading={customersLoading}
                  onView={(customer) => {
                    setDetailPhone(customer.phoneNumber);
                    setDetailName(customer.customerName);
                  }}
                />
                <TablePagination
                  page={page}
                  totalPages={totalPages}
                  onChange={setPage}
                />
              </>
            )}
          </div>
        </TabsContent>

        {/* Blocked */}
        <TabsContent value='blocked'>
          <FraudGroupTab />
        </TabsContent>
      </Tabs>

      <CustomerDetailSheet
        open={!!detailPhone}
        onOpenChange={(open) => !open && setDetailPhone(null)}
        phoneNumber={detailPhone}
        customerName={detailName}
        onChanged={refreshAll}
      />
    </div>
  );
};

export default FraudManagementPage;
