import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useCommission } from "../../hooks/useCommission";
import {
  CommissionQueryParams,
  OrderCommissionQueryParams,
  UserCommissionQueryParams,
  Commission,
  OrderCommission,
  OrderCommissionDetails,
  UserCommissionSummary,
  UserCommissionHistory,
} from "../../api/commission";
import {
  Download,
  Loader2,
  BarChart3,
  FileText,
  Users,
  Layers,
  ChevronDown,
  Calendar,
  Filter,
  Package,
  ShoppingBag,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "../../components/ui/drawer";
import { formatDate } from "../../utils/inventoryReportUtils";

import { ProductCommissionTable } from "./components/product-wise/ProductCommissionTable";
import { ProductCommissionDetailsModal } from "./components/product-wise/ProductCommissionDetailsModal";
import { OrderCommissionTable } from "./components/order-wise/OrderCommissionTable";
import { OrderCommissionDetailsSheet } from "./components/order-wise/OrderCommissionDetailsSheet";
import { BulkCommissionActionsBar } from "./components/order-wise/BulkCommissionActionsBar";
import { MobileBulkCommissionActions } from "./components/order-wise/MobileBulkCommissionActions";
import { UserCommissionTable } from "./components/user-wise/UserCommissionTable";
import { UserCommissionDetailsSheet } from "./components/user-wise/UserCommissionDetailsSheet";
import { CommissionFilters } from "./components/shared/CommissionFilters";
import { UpdateCommissionDialog } from "./components/shared/UpdateCommissionDialog";
import { CommissionSummaryCards } from "./components/shared/CommissionSummaryCards";
import { CommissionSummaryBadges } from "./components/shared/CommissionSummaryBadges";
import { cn } from "../order-v2/lib/utils";

// ─── Inline styles ──────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .cm-root {
    --cm-bg:        #f5f6fa;
    --cm-surface:   #ffffff;
    --cm-surface2:  #f0f1f8;
    --cm-border:    #e4e6f0;
    --cm-accent:    #5b52f0;
    --cm-accent-lt: rgba(91,82,240,.08);
    --cm-accent2:   #00b896;
    --cm-danger:    #f43f5e;
    --cm-warn:      #f59e0b;
    --cm-text:      #1a1d2e;
    --cm-muted:     #8b90a7;
    --cm-radius:    16px;
    font-family: 'Sora', sans-serif;
    background: var(--cm-bg);
    color: var(--cm-text);
    min-height: 100vh;
  }

  /* ── App Shell ── */
  .cm-shell {
    max-width: 520px;
    margin: 0 auto;
    position: relative;
    background: var(--cm-bg);
  }
  @media(min-width:768px) {
    .cm-shell { max-width: 100%; padding: 0 28px; }
  }

  /* ── Status Bar (mobile only) ── */
  .cm-statusbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px 4px;
    font-size: 11px;
    font-weight: 600;
    color: var(--cm-muted);
    letter-spacing: .04em;
  }
  @media(min-width:768px) { .cm-statusbar { display:none; } }

  /* ── Hero Section ── */
  .cm-hero {
    padding: 20px 20px 0;
    position: relative;
    overflow: hidden;
  }
  .cm-hero-bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 90% 70% at 60% -20%, rgba(91,82,240,.07) 0%, transparent 65%);
    pointer-events: none;
  }
  .cm-hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--cm-accent-lt);
    border: 1px solid rgba(91,82,240,.18);
    border-radius: 100px;
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 600;
    color: var(--cm-accent);
    letter-spacing: .06em;
    margin-bottom: 12px;
  }
  .cm-hero-title {
    font-size: clamp(22px, 5vw, 28px);
    font-weight: 700;
    letter-spacing: -.025em;
    line-height: 1.15;
    margin: 0 0 5px;
    color: var(--cm-text);
  }
  .cm-hero-title span { color: var(--cm-accent); }
  .cm-hero-sub {
    font-size: 12.5px;
    color: var(--cm-muted);
    margin: 0 0 20px;
    font-weight: 400;
  }

  /* ── Quick Stats Strip ── */
  .cm-stats-strip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }
  .cm-stat-card {
    background: var(--cm-surface);
    border: 1px solid var(--cm-border);
    border-radius: 14px;
    padding: 14px 12px;
    position: relative;
    overflow: hidden;
    transition: box-shadow .2s, border-color .2s;
    box-shadow: 0 1px 4px rgba(26,29,46,.04);
  }
  .cm-stat-card:hover {
    border-color: rgba(91,82,240,.25);
    box-shadow: 0 4px 16px rgba(91,82,240,.08);
  }
  .cm-stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--cm-stat-color, var(--cm-accent));
    opacity: .85;
    border-radius: 14px 14px 0 0;
  }
  .cm-stat-icon {
    width: 28px; height: 28px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 8px;
    background: var(--cm-accent-lt);
  }
  .cm-stat-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 15px;
    font-weight: 600;
    color: var(--cm-text);
    line-height: 1;
    margin-bottom: 3px;
  }
  .cm-stat-lbl {
    font-size: 10px;
    color: var(--cm-muted);
    font-weight: 500;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  /* ── Action Bar ── */
  .cm-action-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }
  .cm-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 12px;
    padding: 10px 16px;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all .18s;
    border: none;
    white-space: nowrap;
  }
  .cm-btn-primary {
    background: var(--cm-accent);
    color: #fff;
    box-shadow: 0 4px 14px rgba(91,82,240,.28);
  }
  .cm-btn-primary:hover { background: #6b63f5; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(91,82,240,.32); }
  .cm-btn-primary:disabled { opacity:.55; cursor:not-allowed; transform:none; }
  .cm-btn-ghost {
    background: var(--cm-surface);
    color: var(--cm-text);
    border: 1px solid var(--cm-border);
    flex: 1;
    justify-content: center;
    box-shadow: 0 1px 3px rgba(26,29,46,.05);
  }
  .cm-btn-ghost:hover { border-color: rgba(91,82,240,.3); background: var(--cm-accent-lt); color: var(--cm-accent); }
  .cm-btn-ghost:disabled { opacity: .5; cursor: not-allowed; }

  /* ── View Toggle (pill tabs) ── */
  .cm-view-toggle {
    display: flex;
    background: var(--cm-surface);
    border: 1px solid var(--cm-border);
    border-radius: 14px;
    padding: 4px;
    margin-bottom: 20px;
    gap: 3px;
    box-shadow: 0 1px 4px rgba(26,29,46,.06);
  }
  .cm-view-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 9px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s;
    border: none;
    background: transparent;
    color: var(--cm-muted);
    font-family: 'Sora', sans-serif;
    letter-spacing: .01em;
  }
  .cm-view-btn.active {
    background: var(--cm-accent);
    color: #fff;
    box-shadow: 0 2px 10px rgba(91,82,240,.28);
  }
  .cm-view-btn:not(.active):hover { color: var(--cm-accent); background: var(--cm-accent-lt); }

  /* ── Content Area ── */
  .cm-content {
    padding: 0 16px 32px;
  }

  /* ── Status Chip Tabs (horizontal scroll) ── */
  .cm-chip-row {
    display: flex;
    gap: 7px;
    overflow-x: auto;
    scrollbar-width: none;
    margin-bottom: 16px;
    padding-bottom: 2px;
  }
  .cm-chip-row::-webkit-scrollbar { display: none; }
  .cm-chip {
    flex-shrink: 0;
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
    border: 1.5px solid var(--cm-border);
    background: var(--cm-surface);
    color: var(--cm-muted);
    font-family: 'Sora', sans-serif;
    transition: all .15s;
    letter-spacing: .02em;
    box-shadow: 0 1px 3px rgba(26,29,46,.04);
  }
  .cm-chip.active {
    border-color: var(--cm-accent);
    background: var(--cm-accent-lt);
    color: var(--cm-accent);
  }
  .cm-chip:not(.active):hover { border-color: rgba(91,82,240,.25); color: var(--cm-text); }

  /* ── Section Card ── */
  .cm-section {
    background: var(--cm-surface);
    border: 1px solid var(--cm-border);
    border-radius: var(--cm-radius);
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(26,29,46,.05);
  }
  .cm-section-head {
    padding: 16px 18px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--cm-surface);
  }
  .cm-section-title {
    font-size: 14.5px;
    font-weight: 700;
    color: var(--cm-text);
    margin: 0;
    letter-spacing: -.01em;
  }
  .cm-section-desc {
    font-size: 11px;
    color: var(--cm-muted);
    margin: 2px 0 0;
    font-weight: 400;
  }
  .cm-section-body { padding: 4px 0; }

  /* ── Loader ── */
  .cm-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 0;
    color: var(--cm-muted);
  }

  /* ── Top Performers ── */
  .cm-performer-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 18px;
    border-bottom: 1px solid var(--cm-border);
    transition: background .15s;
    cursor: default;
  }
  .cm-performer-item:last-child { border-bottom: none; }
  .cm-performer-item:hover { background: #fafbff; }
  .cm-performer-rank {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    color: var(--cm-muted);
    width: 22px;
    flex-shrink: 0;
  }
  .cm-performer-rank.gold { color: #d4960a; }
  .cm-performer-rank.silver { color: #8b95a7; }
  .cm-performer-rank.bronze { color: #b06020; }
  .cm-performer-avatar {
    width: 38px; height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--cm-accent), #a78bfa);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #fff;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(91,82,240,.2);
  }
  .cm-performer-info { flex: 1; min-width: 0; }
  .cm-performer-name {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--cm-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cm-performer-count {
    font-size: 11px;
    color: var(--cm-muted);
    margin-top: 1px;
  }
  .cm-performer-amounts { text-align: right; flex-shrink: 0; }
  .cm-performer-total {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 600;
    color: var(--cm-text);
  }
  .cm-performer-paid {
    font-size: 11px;
    color: var(--cm-accent2);
    margin-top: 2px;
    font-weight: 500;
  }

  /* ── Badge ── */
  .cm-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: .03em;
  }
  .cm-badge-accent { background: var(--cm-accent-lt); color: var(--cm-accent); border: 1px solid rgba(91,82,240,.18); }
  .cm-badge-success { background: rgba(0,184,150,.1); color: #00966e; border: 1px solid rgba(0,184,150,.2); }

  /* ── Summary Drawer ── */
  .cm-drawer-inner { padding: 20px 16px 32px; }
  .cm-drawer-title {
    font-size: 17px;
    font-weight: 700;
    margin: 0 0 16px;
    color: var(--cm-text);
    letter-spacing: -.01em;
  }

  /* ── Desktop header ── */
  .cm-desktop-header {
    display: none;
  }
  @media(min-width:768px) {
    .cm-desktop-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 32px 0 24px;
      border-bottom: 1px solid var(--cm-border);
      margin-bottom: 28px;
    }
    .cm-hero { display: none; }
    .cm-view-toggle { max-width: 420px; }
    .cm-content { padding: 0 0 40px; }
  }

  /* ── Spin animation ── */
  @keyframes spin { to { transform: rotate(360deg); } }
  .cm-spin { animation: spin .8s linear infinite; }

  /* ── Fade-up animation ── */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .cm-fade-up { animation: fadeUp .25s ease both; }

  /* ── Pagination ── */
  .cm-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 14px 18px;
    border-top: 1px solid var(--cm-border);
    background: var(--cm-surface);
  }
  .cm-page-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 7px 14px;
    border-radius: 10px;
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all .18s;
    border: 1.5px solid var(--cm-border);
    background: var(--cm-surface);
    color: var(--cm-text);
  }
  .cm-page-btn:hover:not(:disabled) {
    border-color: var(--cm-accent);
    background: var(--cm-accent-lt);
    color: var(--cm-accent);
  }
  .cm-page-btn:disabled {
    opacity: .4;
    cursor: not-allowed;
  }
  .cm-page-info {
    font-size: 12px;
    font-weight: 500;
    color: var(--cm-muted);
    font-family: 'JetBrains Mono', monospace;
  }
`;

// Status chips config
const STATUS_CHIPS = [
  { value: "all-commissions", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
  { value: "removed", label: "Removed" },
  { value: "top-performers", label: "⭐ Top" },
];

const VIEW_MODES = [
  { value: "product-wise", label: "Products", Icon: Package },
  { value: "order-wise", label: "Orders", Icon: ShoppingBag },
  { value: "user-wise", label: "Users", Icon: Users },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

// ─── Component ───────────────────────────────────────────────────────────────
export const CommissionManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = searchParams.get("view") || "product-wise";

  const [productActiveTab, setProductActiveTab] = useState("all-commissions");
  const [productFilters, setProductFilters] = useState({});
  const [commissions, setCommissions] = useState([]);
  const [productSummary, setProductSummary] = useState(null);
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [viewDetailsCommission, setViewDetailsCommission] = useState(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [productPagination, setProductPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const [orderFilters, setOrderFilters] = useState({});
  const [orderCommissions, setOrderCommissions] = useState([]);
  const [orderSummary, setOrderSummary] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [viewOrderDetails, setViewOrderDetails] = useState(null);
  const [orderPagination, setOrderPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkErrors, setBulkErrors] = useState(0);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMode, setExportMode] = useState(null);

  const [userFilters, setUserFilters] = useState({});
  const [userCommissions, setUserCommissions] = useState([]);
  const [userSummary, setUserSummary] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [viewUserDetails, setViewUserDetails] = useState(null);
  const [userPagination, setUserPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const {
    fetchCommissions,
    fetchCommissionSummary,
    fetchUserCommissions,
    fetchOrderCommissions,
    fetchOrderCommissionDetails,
    updateStatus,
    submitBulkCommissionUpdate,
    submitBulkOrderCommissionUpdate,
    fetchUserCommissionsList,
    fetchUserCommissionHistory,
    fetchUserWiseSummaryStats,
    downloadCommissionReport,
    isLoading,
  } = useCommission();
  const { toast } = useToast();

  const setViewMode = (view) => setSearchParams({ view });

  const handleProductFiltersChange = useCallback(
    (v) => setProductFilters((p) => (typeof v === "function" ? v(p) : v)),
    [],
  );
  const handleOrderFiltersChange = useCallback(
    (v) => setOrderFilters((p) => (typeof v === "function" ? v(p) : v)),
    [],
  );
  const handleUserFiltersChange = useCallback(
    (v) => setUserFilters((p) => (typeof v === "function" ? v(p) : v)),
    [],
  );

  const handleProductPageChange = useCallback((page: number) => {
    setProductFilters((p) => ({ ...p, page }));
  }, []);

  const handleOrderPageChange = useCallback((page: number) => {
    setOrderFilters((p) => ({ ...p, page }));
  }, []);

  const handleUserPageChange = useCallback((page: number) => {
    setUserFilters((p) => ({ ...p, page }));
  }, []);

  useEffect(() => {
    if (viewMode !== "product-wise") return;
    (async () => {
      const [cd, sd] = await Promise.all([
        fetchCommissions(productFilters),
        fetchCommissionSummary(productFilters),
      ]);
      if (cd) {
        setCommissions(cd.commissions);
        setProductPagination(cd.pagination);
      }
      if (sd) setProductSummary(sd);
    })();
  }, [productFilters, viewMode, fetchCommissions, fetchCommissionSummary]);

  useEffect(() => {
    if (viewMode !== "order-wise") return;
    (async () => {
      const d = await fetchOrderCommissions(orderFilters);
      if (d) {
        setOrderCommissions(d.commissions);
        setOrderPagination(d.pagination);
        setOrderSummary(d.summary);
      }
    })();
  }, [orderFilters, viewMode, fetchOrderCommissions]);

  useEffect(() => {
    if (viewMode !== "user-wise") return;
    (async () => {
      const [ud, sd] = await Promise.all([
        fetchUserCommissionsList(userFilters),
        fetchUserWiseSummaryStats(userFilters),
      ]);
      if (ud) {
        setUserCommissions(ud.data);
        setUserPagination(ud.pagination);
      }
      if (sd) setUserSummary(sd);
    })();
  }, [
    userFilters,
    viewMode,
    fetchUserCommissionsList,
    fetchUserWiseSummaryStats,
  ]);

  const handleUpdateStatus = async (id, status, notes) => {
    const result = await updateStatus(id, status, notes);
    if (result) {
      toast({
        title: "Status Updated",
        description: "Commission updated successfully",
      });
      const cd = await fetchCommissions(productFilters);
      if (cd) setCommissions(cd.commissions);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update commission status",
      });
    }
  };

  const handleProductRowAction = async (commission, status) => {
    const result = await updateStatus(commission.id, status);
    if (result) {
      toast({
        title: "Status Updated",
        description: `Commission marked as ${status}`,
      });
      const cd = await fetchCommissions(productFilters);
      if (cd) setCommissions(cd.commissions);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update commission status",
      });
    }
  };

  const handleOrderRowAction = async (orderCommission, status) => {
    const orderNumbers = [orderCommission.orderNumber];
    const result = await submitBulkOrderCommissionUpdate({
      orderNumbers,
      status,
    });
    if (result.success) {
      toast({
        title: "Status Updated",
        description: `Order #${orderCommission.orderNumber} marked as ${status}`,
      });
      const d = await fetchOrderCommissions(orderFilters);
      if (d) {
        setOrderCommissions(d.commissions);
        setOrderSummary(d.summary);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to update order status",
      });
    }
  };

  const handleUserRowAction = async (userCommission, status) => {
    const userData = await fetchUserCommissions(userCommission.userId, {
      limit: 1000,
    });
    if (!userData || !userData.commissions?.length) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No commissions found for this user",
      });
      return;
    }
    const commissionIds = userData.commissions.map((c) => c.id);
    const result = await submitBulkCommissionUpdate({
      commissionIds,
      status,
    });
    if (result.success) {
      toast({
        title: "Status Updated",
        description: `All commissions for ${userCommission.userName} marked as ${status}`,
      });
      const ud = await fetchUserCommissionsList(userFilters);
      if (ud) {
        setUserCommissions(ud.data);
        setUserPagination(ud.pagination);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to update user commissions",
      });
    }
  };

  const handleProductTabChange = (value) => {
    setProductActiveTab(value);
    if (value === "all-commissions" || value === "top-performers") {
      setProductFilters((p) => ({ ...p, status: undefined }));
    } else {
      setProductFilters((p) => ({ ...p, status: value }));
    }
  };

  const handleExport = async (mode) => {
    if (isExporting) return;
    setExportMode(mode);
    setIsExporting(true);
    setExportProgress(0);
    try {
      const filters =
        viewMode === "product-wise"
          ? {
              startDate: productFilters.startDate,
              endDate: productFilters.endDate,
              status: productFilters.status,
            }
          : viewMode === "order-wise"
            ? {
                startDate: orderFilters.startDate,
                endDate: orderFilters.endDate,
                status: orderFilters.status,
              }
            : {
                startDate: userFilters.startDate,
                endDate: userFilters.endDate,
                status: userFilters.status,
              };

      const result = await downloadCommissionReport(
        mode,
        filters,
        setExportProgress,
      );
      toast(
        result.success
          ? { title: "Exported", description: `${result.filename}` }
          : {
              title: "Export Failed",
              description: result.error,
              variant: "destructive",
            },
      );
    } catch (e) {
      toast({
        title: "Export Failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportMode(null);
      setExportProgress(0);
    }
  };

  const handleSelectOrder = (id, sel) =>
    setSelectedOrderIds((p) => (sel ? [...p, id] : p.filter((x) => x !== id)));
  const handleSelectAllOrders = (sel) =>
    setSelectedOrderIds(sel ? orderCommissions.map((c) => c.orderId) : []);

  const handleViewOrderDetails = async (oc) => {
    const d = await fetchOrderCommissionDetails(oc.orderId);
    if (d) setViewOrderDetails(d);
  };

  const handleSelectUser = (id, sel) =>
    setSelectedUserIds((p) => (sel ? [...p, id] : p.filter((x) => x !== id)));
  const handleSelectAllUsers = (sel) =>
    setSelectedUserIds(sel ? userCommissions.map((c) => c.userId) : []);

  const handleViewUserDetails = async (uc) => {
    const d = await fetchUserCommissionHistory(uc.userId, {
      interval: "daily",
      includePerformance: true,
    });
    if (d) setViewUserDetails(d);
  };

  const handleBulkAction = async (action) => {
    if (!selectedOrderIds.length) return;
    setBulkProcessing(true);
    setBulkProgress(0);
    setBulkErrors(0);
    const orderNumbers = orderCommissions
      .filter((c) => selectedOrderIds.includes(c.orderId))
      .map((c) => c.orderNumber);
    const result = await submitBulkOrderCommissionUpdate({
      orderNumbers,
      status: action,
    });
    if (result.success) {
      if (result.jobId) {
        const iv = setInterval(() => {
          setBulkProgress((p) => {
            if (p >= 100) {
              clearInterval(iv);
              setBulkProcessing(false);
              setTimeout(async () => {
                const d = await fetchOrderCommissions(orderFilters);
                if (d) {
                  setOrderCommissions(d.commissions);
                  setOrderSummary(d.summary);
                }
                setSelectedOrderIds([]);
              }, 0);
              toast({ title: "Done", description: `Bulk ${action} completed` });
              return 100;
            }
            return p + 10;
          });
        }, 500);
      } else {
        setBulkProcessing(false);
        const d = await fetchOrderCommissions(orderFilters);
        if (d) {
          setOrderCommissions(d.commissions);
          setOrderSummary(d.summary);
        }
        setSelectedOrderIds([]);
        toast({ title: "Done", description: `Bulk ${action} completed` });
      }
    } else {
      setBulkProcessing(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Bulk action failed",
      });
    }
  };

  // Derive current summary
  const currentSummary =
    viewMode === "product-wise"
      ? productSummary?.overview
      : viewMode === "order-wise"
        ? orderSummary
        : userSummary;

  const summaryType =
    viewMode === "product-wise"
      ? "product"
      : viewMode === "order-wise"
        ? "order"
        : "user";

  // Active view filters
  const activeFilters =
    viewMode === "product-wise"
      ? productFilters
      : viewMode === "order-wise"
        ? orderFilters
        : userFilters;

  const dateRangeLabel =
    activeFilters?.startDate || activeFilters?.endDate
      ? `${activeFilters.startDate ? formatDate(activeFilters.startDate) : "Start"} – ${activeFilters.endDate ? formatDate(activeFilters.endDate) : "Now"}`
      : "All time";

  return (
    <>
      <style>{css}</style>
      <div className='cm-root'>
        <div className='cm-shell'>
          {/* ── Desktop Header ── */}
          <div className='cm-desktop-header'>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4,
                }}>
                <Sparkles size={16} style={{ color: "#5b52f0" }} />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#5b52f0",
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                  }}>
                  Commission Management
                </span>
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: "-.02em",
                  color: "#1a1d2e",
                }}>
                {viewMode === "product-wise"
                  ? "Product Analysis"
                  : viewMode === "order-wise"
                    ? "Order Analysis"
                    : "User Analysis"}
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8b90a7" }}>
                {dateRangeLabel}
              </p>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {/* Summary */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className='cm-btn cm-btn-ghost'
                    style={{ width: "auto" }}>
                    <BarChart3 size={14} /> Summary
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className='w-auto p-4'
                  align='end'
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e4e6f0",
                    borderRadius: 16,
                    boxShadow: "0 8px 32px rgba(26,29,46,.1)",
                  }}>
                  <CommissionSummaryBadges
                    type={summaryType}
                    summary={currentSummary}
                  />
                </PopoverContent>
              </Popover>

              {/* Export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className='cm-btn cm-btn-primary'
                    disabled={isExporting}>
                    {isExporting ? (
                      <>
                        <Loader2 size={14} className='cm-spin' />{" "}
                        {exportProgress > 0
                          ? `${exportProgress}%`
                          : "Exporting…"}
                      </>
                    ) : (
                      <>
                        <Download size={14} /> Export <ChevronDown size={12} />
                      </>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e4e6f0",
                    borderRadius: 12,
                    minWidth: 200,
                    boxShadow: "0 8px 24px rgba(26,29,46,.1)",
                  }}>
                  <DropdownMenuItem onClick={() => handleExport("order-wise")}>
                    <FileText size={14} style={{ marginRight: 8 }} /> Order-wise
                    only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("user-wise")}>
                    <Users size={14} style={{ marginRight: 8 }} /> User-wise
                    only
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport("combined")}>
                    <Layers size={14} style={{ marginRight: 8 }} /> Combined
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* ── Mobile Hero ── */}
          <div className='cm-hero'>
            <div className='cm-hero-bg' />
            <div className='cm-hero-tag'>
              <Sparkles size={11} /> Commission Report
            </div>
            <div className='flex justify-between items-center'>
              <div>
                <h1 className='cm-hero-title'>
                  {viewMode === "product-wise" ? (
                    <>
                      <span>Product</span> Analysis
                    </>
                  ) : viewMode === "order-wise" ? (
                    <>
                      <span>Order</span> Analysis
                    </>
                  ) : (
                    <>
                      <span>User</span> Analysis
                    </>
                  )}
                </h1>
                <p className='cm-hero-sub'>{dateRangeLabel}</p>
              </div>

              {/* Mobile Action Bar */}
              <div className='cm-action-bar'>
                {/* Summary Drawer */}
                <Drawer
                  open={mobileSummaryOpen}
                  onOpenChange={setMobileSummaryOpen}>
                  <DrawerTrigger asChild>
                    <button className='cm-btn cm-btn-ghost'>
                      <BarChart3 size={14} />
                    </button>
                  </DrawerTrigger>
                  <DrawerContent
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e4e6f0",
                      borderRadius: "20px 20px 0 0",
                      boxShadow: "0 -8px 32px rgba(26,29,46,.08)",
                    }}>
                    <div className='cm-drawer-inner'>
                      <h3 className='cm-drawer-title'>Summary Overview</h3>
                      <CommissionSummaryCards
                        type={summaryType}
                        summary={currentSummary}
                      />
                    </div>
                  </DrawerContent>
                </Drawer>

                {/* Export */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className='cm-btn cm-btn-primary'
                      disabled={isExporting}
                      style={{ flex: 1, justifyContent: "center" }}>
                      {isExporting ? (
                        <>
                          <Loader2 size={14} className='cm-spin' />{" "}
                          {exportProgress > 0
                            ? `${exportProgress}%`
                            : "Exporting"}
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          <ChevronDown size={12} />
                        </>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align='end'
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e4e6f0",
                      borderRadius: 12,
                      boxShadow: "0 8px 24px rgba(26,29,46,.1)",
                    }}>
                    <DropdownMenuItem
                      onClick={() => handleExport("order-wise")}>
                      <FileText size={14} style={{ marginRight: 8 }} />{" "}
                      Order-wise
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("user-wise")}>
                      <Users size={14} style={{ marginRight: 8 }} /> User-wise
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleExport("combined")}>
                      <Layers size={14} style={{ marginRight: 8 }} /> Combined
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* ── View Toggle ── */}
          <div style={{ padding: "0 16px" }}>
            <div className='cm-view-toggle'>
              {VIEW_MODES.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  className={`cm-view-btn ${viewMode === value ? "active" : ""}`}
                  onClick={() => setViewMode(value)}>
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Content ── */}
          <div className='cm-content'>
            {/* ─── PRODUCT-WISE ─── */}
            {viewMode === "product-wise" && (
              <div className='cm-fade-up'>
                {/* Filters */}
                <CommissionFilters
                  filters={productFilters}
                  onFiltersChange={handleProductFiltersChange}
                />

                {/* Status chips */}
                <div className='cm-chip-row' style={{ marginTop: 12 }}>
                  {STATUS_CHIPS.map((c) => (
                    <button
                      key={c.value}
                      className={`cm-chip ${productActiveTab === c.value ? "active" : ""}`}
                      onClick={() => handleProductTabChange(c.value)}>
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Table Card */}
                {productActiveTab !== "top-performers" ? (
                  <div className='cm-section'>
                    <div className='cm-section-head'>
                      <div>
                        <h3 className='cm-section-title'>
                          {STATUS_CHIPS.find(
                            (c) => c.value === productActiveTab,
                          )?.label ?? "All"}{" "}
                          Commissions
                        </h3>
                        <p className='cm-section-desc'>
                          View and manage commission records
                        </p>
                      </div>
                      <span className='cm-badge cm-badge-accent'>
                        {commissions.length} records
                      </span>
                    </div>
                    <div className='cm-section-body'>
                      {isLoading ? (
                        <div className='cm-loader'>
                          <Loader2 size={24} className='cm-spin' />
                        </div>
                      ) : (
                        <ProductCommissionTable
                          commissions={commissions}
                          onViewDetails={(c) => setViewDetailsCommission(c)}
                          onUpdateStatus={(c) => {
                            setSelectedCommission(c);
                            setIsUpdateDialogOpen(true);
                          }}
                          onMarkPaid={(c) => handleProductRowAction(c, "paid")}
                          onMarkUnpaid={(c) =>
                            handleProductRowAction(c, "unpaid")
                          }
                          onHold={(c) => handleProductRowAction(c, "hold")}
                          onCancel={(c) =>
                            handleProductRowAction(c, "cancelled")
                          }
                        />
                      )}
                    </div>
                    {productPagination.totalPages > 1 && (
                      <div
                        className={cn(
                          "cm-pagination",
                          selectedOrderIds.length > 0 ? "mb-6" : "",
                        )}>
                        <button
                          className='cm-page-btn'
                          disabled={!productPagination.hasPreviousPage}
                          onClick={() =>
                            handleProductPageChange(
                              productPagination.currentPage - 1,
                            )
                          }>
                          <ChevronLeft size={14} /> Prev
                        </button>
                        <span className='cm-page-info'>
                          Page {productPagination.currentPage} of{" "}
                          {productPagination.totalPages}
                        </span>
                        <button
                          className='cm-page-btn'
                          disabled={!productPagination.hasNextPage}
                          onClick={() =>
                            handleProductPageChange(
                              productPagination.currentPage + 1,
                            )
                          }>
                          Next <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Top Performers */
                  <div className='cm-section'>
                    <div className='cm-section-head'>
                      <div>
                        <h3 className='cm-section-title'>Top Performers</h3>
                        <p className='cm-section-desc'>
                          Highest earning commission users
                        </p>
                      </div>
                      <Sparkles
                        size={16}
                        style={{ color: "#f59e0b", opacity: 0.9 }}
                      />
                    </div>
                    <div className='cm-section-body'>
                      {productSummary?.topUsers?.length > 0 ? (
                        productSummary.topUsers.map((user, i) => (
                          <div key={user.userId} className='cm-performer-item'>
                            <span
                              className={`cm-performer-rank ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>
                              #{i + 1}
                            </span>
                            <div className='cm-performer-avatar'>
                              {user.userName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className='cm-performer-info'>
                              <div className='cm-performer-name'>
                                {user.userName}
                              </div>
                              <div className='cm-performer-count'>
                                {user.commissionCount} commissions
                              </div>
                            </div>
                            <div className='cm-performer-amounts'>
                              <div className='cm-performer-total'>
                                {formatCurrency(user.totalCommission)}
                              </div>
                              <div className='cm-performer-paid'>
                                {formatCurrency(user.paidAmount)} paid
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div
                          className='cm-loader'
                          style={{ color: "#7b82a0", fontSize: 13 }}>
                          No data available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── ORDER-WISE ─── */}
            {viewMode === "order-wise" && (
              <div className='cm-fade-up'>
                <CommissionFilters
                  filters={orderFilters}
                  onFiltersChange={handleOrderFiltersChange}
                />

                <div className='cm-section' style={{ marginTop: 12 }}>
                  <div className='cm-section-head'>
                    <div>
                      <h3 className='cm-section-title'>Order Commissions</h3>
                      <p className='cm-section-desc'>
                        Commissions grouped by order
                      </p>
                    </div>
                    {selectedOrderIds.length > 0 && (
                      <span className='cm-badge cm-badge-accent'>
                        {selectedOrderIds.length} selected
                      </span>
                    )}
                  </div>
                  <div className='cm-section-body'>
                    <OrderCommissionTable
                      commissions={orderCommissions}
                      selectedIds={selectedOrderIds}
                      onSelect={handleSelectOrder}
                      onSelectAll={handleSelectAllOrders}
                      onViewDetails={handleViewOrderDetails}
                      onMarkPaid={(oc) => handleOrderRowAction(oc, "paid")}
                      onMarkUnpaid={(oc) => handleOrderRowAction(oc, "unpaid")}
                      onHold={(oc) => handleOrderRowAction(oc, "hold")}
                      onCancel={(oc) => handleOrderRowAction(oc, "cancelled")}
                      loading={isLoading}
                    />
                  </div>
                  {orderPagination.totalPages > 1 && (
                    <div
                      className={cn(
                        "cm-pagination",
                        selectedOrderIds.length > 0 ? "mb-6" : "",
                      )}>
                      <button
                        className='cm-page-btn'
                        disabled={!orderPagination.hasPreviousPage}
                        onClick={() =>
                          handleOrderPageChange(orderPagination.currentPage - 1)
                        }>
                        <ChevronLeft size={14} /> Prev
                      </button>
                      <span className='cm-page-info'>
                        Page {orderPagination.currentPage} of{" "}
                        {orderPagination.totalPages}
                      </span>
                      <button
                        className='cm-page-btn'
                        disabled={!orderPagination.hasNextPage}
                        onClick={() =>
                          handleOrderPageChange(orderPagination.currentPage + 1)
                        }>
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── USER-WISE ─── */}
            {viewMode === "user-wise" && (
              <div className='cm-fade-up'>
                <CommissionFilters
                  filters={userFilters}
                  onFiltersChange={handleUserFiltersChange}
                />

                <div className='cm-section' style={{ marginTop: 12 }}>
                  <div className='cm-section-head'>
                    <div>
                      <h3 className='cm-section-title'>User Commissions</h3>
                      <p className='cm-section-desc'>
                        Performance metrics by user
                      </p>
                    </div>
                    {selectedUserIds.length > 0 && (
                      <span className='cm-badge cm-badge-accent'>
                        {selectedUserIds.length} selected
                      </span>
                    )}
                  </div>
                  <div className='cm-section-body'>
                    {isLoading ? (
                      <div className='cm-loader'>
                        <Loader2 size={24} className='cm-spin' />
                      </div>
                    ) : (
                      <UserCommissionTable
                        commissions={userCommissions}
                        selectedIds={selectedUserIds}
                        onSelect={handleSelectUser}
                        onSelectAll={handleSelectAllUsers}
                        onViewDetails={handleViewUserDetails}
                        onMarkPaid={(uc) => handleUserRowAction(uc, "paid")}
                        onMarkUnpaid={(uc) => handleUserRowAction(uc, "unpaid")}
                        onHold={(uc) => handleUserRowAction(uc, "hold")}
                        onCancel={(uc) => handleUserRowAction(uc, "cancelled")}
                        loading={isLoading}
                      />
                    )}
                  </div>
                  {userPagination.totalPages > 1 && (
                    <div
                      className={cn(
                        "cm-pagination",
                        selectedOrderIds.length > 0 ? "mb-6" : "",
                      )}>
                      <button
                        className='cm-page-btn'
                        disabled={!userPagination.hasPreviousPage}
                        onClick={() =>
                          handleUserPageChange(userPagination.currentPage - 1)
                        }>
                        <ChevronLeft size={14} /> Prev
                      </button>
                      <span className='cm-page-info'>
                        Page {userPagination.currentPage} of{" "}
                        {userPagination.totalPages}
                      </span>
                      <button
                        className='cm-page-btn'
                        disabled={!userPagination.hasNextPage}
                        onClick={() =>
                          handleUserPageChange(userPagination.currentPage + 1)
                        }>
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bulk Actions (fixed position, outside shell) ── */}
      {selectedOrderIds.length > 0 && (
        <>
          <BulkCommissionActionsBar
            selectedCount={selectedOrderIds.length}
            processing={bulkProcessing}
            progress={bulkProgress}
            errors={bulkErrors}
            onApprove={() => handleBulkAction("paid")}
            onMarkPaid={() => handleBulkAction("paid")}
            onMarkUnpaid={() => handleBulkAction("unpaid")}
            onHold={() => handleBulkAction("hold")}
            onExport={() => handleExport("order-wise")}
            onCancel={() => handleBulkAction("cancelled")}
            onClearSelection={() => setSelectedOrderIds([])}
          />
          <MobileBulkCommissionActions
            selectedCount={selectedOrderIds.length}
            processing={bulkProcessing}
            progress={bulkProgress}
            errors={bulkErrors}
            onApprove={() => handleBulkAction("paid")}
            onMarkPaid={() => handleBulkAction("paid")}
            onMarkUnpaid={() => handleBulkAction("unpaid")}
            onHold={() => handleBulkAction("hold")}
            onExport={() => handleExport("order-wise")}
            onCancel={() => handleBulkAction("cancelled")}
            onClearSelection={() => setSelectedOrderIds([])}
          />
        </>
      )}

      {/* ── Modals / Sheets (unchanged logic) ── */}
      <ProductCommissionDetailsModal
        commission={viewDetailsCommission}
        open={!!viewDetailsCommission}
        onOpenChange={(open) => !open && setViewDetailsCommission(null)}
        onEdit={(commission) => {
          setViewDetailsCommission(null);
          setSelectedCommission(commission);
          setIsUpdateDialogOpen(true);
        }}
      />
      <OrderCommissionDetailsSheet
        orderDetails={viewOrderDetails}
        open={!!viewOrderDetails}
        onClose={() => setViewOrderDetails(null)}
      />
      <UserCommissionDetailsSheet
        userDetails={viewUserDetails}
        open={!!viewUserDetails}
        onClose={() => setViewUserDetails(null)}
      />
      <UpdateCommissionDialog
        commission={selectedCommission}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        onUpdate={handleUpdateStatus}
      />
    </>
  );
};
