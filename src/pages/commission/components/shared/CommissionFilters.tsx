import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover";
import { Badge } from "../../../../components/ui/badge";
import {
  Search,
  X,
  CalendarIcon,
  User,
  ChevronDown,
  SlidersHorizontal,
  Check,
  Clock,
  ChevronRight,
} from "lucide-react";
import { CommissionQueryParams } from "../../../../api/commission";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { cn } from "../../../../lib/utils";
import { useState, useEffect, useMemo, useRef } from "react";
import { getAllUsers } from "../../../../api/user";
import { Calendar } from "../../../../components/ui/calendar";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "../../../../components/ui/drawer";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CommissionFiltersProps {
  filters: CommissionQueryParams;
  onFiltersChange: (filters: any) => void;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const filterCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

  /* ── Token reuse from parent cm-root, with local fallbacks ── */
  .cf-wrap {
    --cf-accent:    #5b52f0;
    --cf-accent-lt: rgba(91,82,240,.08);
    --cf-border:    #e4e6f0;
    --cf-bg:        #ffffff;
    --cf-surface:   #f5f6fa;
    --cf-text:      #1a1d2e;
    --cf-muted:     #8b90a7;
    --cf-danger:    #f43f5e;
    font-family: 'Sora', sans-serif;
  }

  /* ── Desktop Filter Bar ── */
  .cf-bar {
    background: #ffffff;
    border: 1px solid var(--cf-border);
    border-radius: 14px;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 1px 6px rgba(26,29,46,.05);
  }

  .cf-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* ── Search field ── */
  .cf-search-wrap {
    position: relative;
    flex: 1;
    min-width: 180px;
  }
  .cf-search-icon {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--cf-muted);
    pointer-events: none;
  }
  .cf-search-input {
    width: 100%;
    height: 36px;
    padding: 0 32px 0 34px;
    border-radius: 10px;
    border: 1.5px solid var(--cf-border);
    background: var(--cf-surface);
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    color: var(--cf-text);
    outline: none;
    transition: border-color .18s, background .18s, box-shadow .18s;
    box-sizing: border-box;
  }
  .cf-search-input::placeholder { color: var(--cf-muted); }
  .cf-search-input:focus {
    border-color: var(--cf-accent);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(91,82,240,.1);
  }
  .cf-search-clear {
    position: absolute;
    right: 9px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px; height: 18px;
    border-radius: 50%;
    background: #e4e6f0;
    border: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--cf-muted);
    transition: background .15s, color .15s;
  }
  .cf-search-clear:hover { background: var(--cf-danger); color: #fff; }

  /* ── Filter Pill Button ── */
  .cf-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 36px;
    padding: 0 12px;
    border-radius: 10px;
    border: 1.5px dashed var(--cf-border);
    background: transparent;
    font-family: 'Sora', sans-serif;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--cf-muted);
    cursor: pointer;
    transition: all .17s;
    white-space: nowrap;
  }
  .cf-pill:hover {
    border-color: var(--cf-accent);
    color: var(--cf-accent);
    background: var(--cf-accent-lt);
    border-style: solid;
  }
  .cf-pill.active {
    border-style: solid;
    border-color: var(--cf-accent);
    background: var(--cf-accent-lt);
    color: var(--cf-accent);
  }
  .cf-pill-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--cf-accent);
    flex-shrink: 0;
  }

  /* ── Clear button ── */
  .cf-clear-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 36px;
    padding: 0 10px;
    border-radius: 10px;
    border: none;
    background: transparent;
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: var(--cf-muted);
    cursor: pointer;
    transition: color .15s, background .15s;
  }
  .cf-clear-btn:hover { color: var(--cf-danger); background: rgba(244,63,94,.06); }

  /* ── Active badge strip ── */
  .cf-badges {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .cf-badges-label {
    font-size: 11px;
    color: var(--cf-muted);
    font-weight: 500;
    letter-spacing: .03em;
  }
  .cf-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px 3px 8px;
    border-radius: 100px;
    border: 1px solid rgba(91,82,240,.18);
    background: var(--cf-accent-lt);
    font-size: 11px;
    font-weight: 500;
    color: var(--cf-accent);
    white-space: nowrap;
  }
  .cf-badge-x {
    width: 14px; height: 14px;
    border-radius: 50%;
    border: none;
    background: rgba(91,82,240,.15);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: var(--cf-accent);
    margin-left: 2px;
    transition: background .15s, color .15s;
    flex-shrink: 0;
  }
  .cf-badge-x:hover { background: var(--cf-danger); color: #fff; }

  /* ── Popover dropdown ── */
  .cf-dropdown {
    background: #fff;
    border: 1px solid var(--cf-border);
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(26,29,46,.1);
    overflow: hidden;
  }
  .cf-dropdown-search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--cf-border);
  }
  .cf-dropdown-search input {
    flex: 1;
    border: none;
    outline: none;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    color: var(--cf-text);
    background: transparent;
  }
  .cf-dropdown-search input::placeholder { color: var(--cf-muted); }
  .cf-dropdown-list {
    max-height: 220px;
    overflow-y: auto;
    padding: 6px;
    scrollbar-width: thin;
    scrollbar-color: #e4e6f0 transparent;
  }
  .cf-dropdown-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 9px;
    border: none;
    background: transparent;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    color: var(--cf-text);
    cursor: pointer;
    text-align: left;
    transition: background .13s;
  }
  .cf-dropdown-item:hover { background: var(--cf-surface); }
  .cf-dropdown-item.active { background: var(--cf-accent-lt); color: var(--cf-accent); font-weight: 500; }
  .cf-check { color: var(--cf-accent); flex-shrink: 0; margin-left: auto; }

  /* ── Calendar popover ── */
  .cf-cal-wrap { padding: 0; }
  .cf-quick-strip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px 10px;
    border-top: 1px solid var(--cf-border);
    flex-wrap: wrap;
  }
  .cf-quick-label {
    font-size: 11px;
    color: var(--cf-muted);
    font-weight: 500;
    letter-spacing: .03em;
  }
  .cf-quick-btn {
    padding: 4px 10px;
    border-radius: 100px;
    border: 1.5px solid var(--cf-border);
    background: transparent;
    font-family: 'Sora', sans-serif;
    font-size: 11px;
    font-weight: 500;
    color: var(--cf-muted);
    cursor: pointer;
    transition: all .13s;
  }
  .cf-quick-btn:hover {
    border-color: var(--cf-accent);
    color: var(--cf-accent);
    background: var(--cf-accent-lt);
  }

  /* ══════════════════════════════════════════════════
     MOBILE FILTER TRIGGER (sticky bottom bar)
  ══════════════════════════════════════════════════ */
  .cf-mobile-trigger {
    display: none;
  }

  @media (max-width: 767px) {
    /* Hide desktop bar completely */
    .cf-bar { display: none; }

    /* Show mobile trigger */
    .cf-mobile-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      position: sticky;
      top: 0;
      z-index: 30;
      background: rgba(255,255,255,.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--cf-border);
      padding: 10px 16px;
      margin: 0 -16px;
    }

    .cf-mobile-search-pill {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 12px;
      border-radius: 12px;
      background: #f5f6fa;
      border: 1.5px solid var(--cf-border);
      cursor: pointer;
      transition: border-color .15s;
    }
    .cf-mobile-search-pill:focus-within,
    .cf-mobile-search-pill:hover { border-color: var(--cf-accent); }
    .cf-mobile-search-pill span {
      font-size: 13px;
      color: var(--cf-muted);
      font-family: 'Sora', sans-serif;
    }

    .cf-mobile-filter-btn {
      position: relative;
      width: 40px; height: 40px;
      border-radius: 12px;
      background: #f5f6fa;
      border: 1.5px solid var(--cf-border);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      color: var(--cf-text);
      transition: all .15s;
      flex-shrink: 0;
    }
    .cf-mobile-filter-btn.has-filters {
      background: var(--cf-accent-lt);
      border-color: var(--cf-accent);
      color: var(--cf-accent);
    }
    .cf-filter-dot {
      position: absolute;
      top: 7px; right: 7px;
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--cf-accent);
      border: 1.5px solid #fff;
    }

    .cf-active-chips {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
      padding: 0 16px 8px;
      margin: 0 -16px;
    }
    .cf-active-chips::-webkit-scrollbar { display: none; }
  }

  /* ══════════════════════════════════════════════════
     BOTTOM SHEET (mobile filter panel)
  ══════════════════════════════════════════════════ */
  .cf-sheet-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(26,29,46,.3);
    backdrop-filter: blur(4px);
    z-index: 100;
    opacity: 0;
    pointer-events: none;
    transition: opacity .25s;
  }
  .cf-sheet-backdrop.open {
    opacity: 1;
    pointer-events: all;
  }

  .cf-sheet {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 101;
    background: #ffffff;
    border-radius: 22px 22px 0 0;
    box-shadow: 0 -12px 48px rgba(26,29,46,.14);
    transform: translateY(100%);
    transition: transform .3s cubic-bezier(.32,.72,0,1);
    max-height: 92vh;
    display: flex;
    flex-direction: column;
  }
  .cf-sheet.open { transform: translateY(0); }

  .cf-sheet-handle {
    width: 36px; height: 4px;
    border-radius: 2px;
    background: #dde0ec;
    margin: 12px auto 0;
    flex-shrink: 0;
  }

  /* ── Search FIRST — at top above keyboard ── */
  .cf-sheet-search-zone {
    padding: 14px 16px 10px;
    border-bottom: 1px solid var(--cf-border);
    flex-shrink: 0;
    background: #fff;
  }
  .cf-sheet-search-inner {
    position: relative;
    display: flex;
    align-items: center;
  }
  .cf-sheet-search-icon {
    position: absolute;
    left: 12px;
    color: var(--cf-muted);
    pointer-events: none;
  }
  .cf-sheet-search-input {
    width: 100%;
    height: 44px;
    padding: 0 40px 0 40px;
    border-radius: 12px;
    border: 1.5px solid var(--cf-border);
    background: var(--cf-surface);
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    color: var(--cf-text);
    outline: none;
    box-sizing: border-box;
    transition: border-color .18s, box-shadow .18s;
    /* Prevent iOS zoom (font-size must be >=16 OR we nudge here) */
    font-size: max(16px, 14px);
  }
  .cf-sheet-search-input::placeholder { color: var(--cf-muted); }
  .cf-sheet-search-input:focus {
    border-color: var(--cf-accent);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(91,82,240,.1);
  }
  .cf-sheet-search-clear {
    position: absolute;
    right: 10px;
    width: 22px; height: 22px;
    border-radius: 50%;
    background: #e4e6f0;
    border: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--cf-muted);
    transition: background .15s, color .15s;
  }
  .cf-sheet-search-clear:hover { background: var(--cf-danger); color: #fff; }

  /* ── Sheet header (title + close) ── */
  .cf-sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 0;
    flex-shrink: 0;
  }
  .cf-sheet-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--cf-text);
    letter-spacing: -.01em;
    margin: 0;
  }
  .cf-sheet-close {
    width: 30px; height: 30px;
    border-radius: 50%;
    border: none;
    background: var(--cf-surface);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: var(--cf-muted);
    transition: background .15s, color .15s;
  }
  .cf-sheet-close:hover { background: #e4e6f0; color: var(--cf-text); }

  /* ── Scrollable body ── */
  .cf-sheet-body {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0 0;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .cf-sheet-body::-webkit-scrollbar { display: none; }

  /* ── Section ── */
  .cf-sheet-section {
    padding: 14px 16px;
    border-bottom: 1px solid var(--cf-border);
  }
  .cf-sheet-section:last-child { border-bottom: none; }
  .cf-sheet-section-label {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: .07em;
    text-transform: uppercase;
    color: var(--cf-muted);
    margin-bottom: 10px;
  }

  /* ── Quick range chips in sheet ── */
  .cf-sheet-chip-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .cf-sheet-chip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 40px;
    border-radius: 12px;
    border: 1.5px solid var(--cf-border);
    background: var(--cf-surface);
    font-family: 'Sora', sans-serif;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--cf-text);
    cursor: pointer;
    transition: all .15s;
  }
  .cf-sheet-chip:hover,
  .cf-sheet-chip.active {
    border-color: var(--cf-accent);
    background: var(--cf-accent-lt);
    color: var(--cf-accent);
  }

  /* ── User list in sheet ── */
  .cf-sheet-user-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid var(--cf-border);
    cursor: pointer;
    transition: opacity .13s;
  }
  .cf-sheet-user-item:last-child { border-bottom: none; }
  .cf-sheet-user-item:hover { opacity: .75; }
  .cf-sheet-user-name {
    flex: 1;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--cf-text);
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cf-sheet-user-all {
    font-size: 13.5px;
    font-weight: 500;
    color: var(--cf-muted);
  }

  /* ── Date range display in sheet ── */
  .cf-sheet-date-display {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    background: var(--cf-surface);
    border-radius: 12px;
    border: 1px solid var(--cf-border);
    margin-bottom: 10px;
  }
  .cf-sheet-date-label {
    font-size: 12px;
    color: var(--cf-muted);
  }
  .cf-sheet-date-val {
    font-size: 13px;
    font-weight: 600;
    color: var(--cf-text);
    font-family: 'Sora', sans-serif;
  }

  /* ── Sheet footer ── */
  .cf-sheet-footer {
    padding: 12px 16px;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
    border-top: 1px solid var(--cf-border);
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    background: #fff;
  }
  .cf-sheet-apply {
    flex: 1;
    height: 46px;
    border-radius: 13px;
    border: none;
    background: var(--cf-accent);
    color: #fff;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(91,82,240,.28);
    transition: all .18s;
    letter-spacing: -.01em;
  }
  .cf-sheet-apply:hover { background: #6b63f5; transform: translateY(-1px); }
  .cf-sheet-reset {
    height: 46px;
    padding: 0 18px;
    border-radius: 13px;
    border: 1.5px solid var(--cf-border);
    background: transparent;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--cf-muted);
    cursor: pointer;
    transition: all .15s;
  }
  .cf-sheet-reset:hover { border-color: var(--cf-danger); color: var(--cf-danger); background: rgba(244,63,94,.05); }

  /* ── Avatar sizing ── */
  .cf-avatar-sm {
    width: 20px; height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #5b52f0, #a78bfa);
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 700; color: #fff;
    flex-shrink: 0;
  }
  .cf-avatar-md {
    width: 34px; height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #5b52f0, #a78bfa);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #fff;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(91,82,240,.2);
  }
`;

// ─── Quick range presets ──────────────────────────────────────────────────────
const QUICK_RANGES = [
  {
    label: "Today",
    range: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }),
  },
  {
    label: "Last 7 days",
    range: () => ({
      from: startOfDay(subDays(new Date(), 7)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "Last 30 days",
    range: () => ({
      from: startOfDay(subDays(new Date(), 30)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "This month",
    range: () => ({
      from: startOfDay(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      ),
      to: endOfDay(new Date()),
    }),
  },
];

const formatLocalDateTime = (date: Date) => {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
};

// ─── Component ───────────────────────────────────────────────────────────────
export const CommissionFilters: React.FC<CommissionFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfDay(subDays(new Date(), 30)),
    to: endOfDay(new Date()),
  });
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Mobile sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetUserQuery, setSheetUserQuery] = useState("");
  const [sheetDateRange, setSheetDateRange] = useState<{
    from: Date;
    to: Date;
  }>(dateRange);
  const [sheetUserFilter, setSheetUserFilter] = useState<any>(null);
  const [sheetShowCalendar, setSheetShowCalendar] = useState(false);

  // Ref for mobile search input (keyboard-aware)
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const sheetSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAllUsers().then((res) => {
      if (res.success && res.data) setAllUsers(res.data);
    });
  }, []);

  useEffect(() => {
    if (filters.userId) {
      setSelectedUser(allUsers.find((u) => u.id === filters.userId) ?? null);
    } else {
      setSelectedUser(null);
    }
  }, [filters.userId, allUsers]);

  // When sheet opens, sync internal sheet state from live filters
  useEffect(() => {
    if (sheetOpen) {
      setSheetUserFilter(selectedUser);
      setSheetDateRange(dateRange);
      setSheetUserQuery("");
      setSheetShowCalendar(false);
      // Focus search after sheet animation (~300ms)
      setTimeout(() => sheetSearchRef.current?.focus(), 320);
    }
  }, [sheetOpen]);

  // Sync dateRange → filters
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      onFiltersChange((prev: any) => ({
        ...prev,
        startDate: formatLocalDateTime(dateRange.from),
        endDate: formatLocalDateTime(dateRange.to),
      }));
    }
    // eslint-disable-next-line
  }, [dateRange]);

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery) return allUsers;
    return allUsers.filter((u) =>
      u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()),
    );
  }, [allUsers, userSearchQuery]);

  const sheetFilteredUsers = useMemo(() => {
    if (!sheetUserQuery) return allUsers;
    return allUsers.filter((u) =>
      u.name?.toLowerCase().includes(sheetUserQuery.toLowerCase()),
    );
  }, [allUsers, sheetUserQuery]);

  const updateFilter = (key: keyof CommissionQueryParams, value: any) =>
    onFiltersChange({ ...filters, [key]: value });

  const clearFilters = () => {
    onFiltersChange({});
    setSelectedUser(null);
    setDateRange({ from: startOfDay(new Date()), to: endOfDay(new Date()) });
  };

  // Apply from sheet
  const applySheetFilters = () => {
    const next: any = { ...filters };
    if (sheetUserFilter) next.userId = sheetUserFilter.id;
    else delete next.userId;
    next.startDate = formatLocalDateTime(sheetDateRange.from);
    next.endDate = formatLocalDateTime(sheetDateRange.to);
    onFiltersChange(next);
    setSelectedUser(sheetUserFilter);
    setDateRange(sheetDateRange);
    setSheetOpen(false);
  };

  const resetSheet = () => {
    setSheetUserFilter(null);
    setSheetDateRange({
      from: startOfDay(subDays(new Date(), 30)),
      to: endOfDay(new Date()),
    });
    setSheetUserQuery("");
  };

  const hasActiveFilters = Object.keys(filters).length > 0;
  const filterCount = [
    filters.userId,
    filters.search,
    filters.startDate,
  ].filter(Boolean).length;

  const initials = (name?: string) => name?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <div className='cf-wrap'>
      <style>{filterCSS}</style>

      {/* ══════════════════════════════════════════
          DESKTOP FILTER BAR
      ══════════════════════════════════════════ */}
      <div className='cf-bar'>
        <div className='cf-row'>
          {/* Search */}
          <div className='cf-search-wrap'>
            <Search size={14} className='cf-search-icon' />
            <input
              className='cf-search-input'
              placeholder='Search commissions…'
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
            {filters.search && (
              <button
                className='cf-search-clear'
                onClick={() => updateFilter("search", undefined)}>
                <X size={10} />
              </button>
            )}
          </div>

          {/* User pill */}
          <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
            <PopoverTrigger asChild>
              <button className={cn("cf-pill", filters.userId && "active")}>
                {filters.userId && <div className='cf-pill-dot' />}
                <User size={13} />
                {selectedUser ? (
                  <span
                    style={{
                      maxWidth: 100,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                    {selectedUser.name}
                  </span>
                ) : (
                  <span>User</span>
                )}
                <ChevronDown size={11} style={{ opacity: 0.5 }} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className='cf-dropdown'
              style={{ width: 220, padding: 0, border: "none" }}
              align='start'>
              <div className='cf-dropdown-search'>
                <Search size={13} style={{ color: "#8b90a7", flexShrink: 0 }} />
                <input
                  placeholder='Search users…'
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <div className='cf-dropdown-list'>
                <button
                  className={cn(
                    "cf-dropdown-item",
                    !filters.userId && "active",
                  )}
                  onClick={() => {
                    updateFilter("userId", undefined);
                    setUserSearchOpen(false);
                  }}>
                  <User size={14} style={{ opacity: 0.5 }} />
                  All users
                  {!filters.userId && <Check size={13} className='cf-check' />}
                </button>
                {filteredUsers.map((user) => (
                  <button
                    key={user._id}
                    className={cn(
                      "cf-dropdown-item",
                      filters.userId === user.id && "active",
                    )}
                    onClick={() => {
                      updateFilter("userId", user.id);
                      setUserSearchOpen(false);
                      setUserSearchQuery("");
                    }}>
                    <div className='cf-avatar-sm'>{initials(user.name)}</div>
                    <span
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {user.name}
                    </span>
                    {filters.userId === user.id && (
                      <Check size={13} className='cf-check' />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Date pill */}
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button className={cn("cf-pill", filters.startDate && "active")}>
                {filters.startDate && <div className='cf-pill-dot' />}
                <CalendarIcon size={13} />
                {dateRange.from && dateRange.to ? (
                  <span>
                    {format(dateRange.from, "MMM d")} –{" "}
                    {format(dateRange.to, "MMM d, yy")}
                  </span>
                ) : (
                  <span>Date range</span>
                )}
                <ChevronDown size={11} style={{ opacity: 0.5 }} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className='cf-cal-wrap cf-dropdown'
              style={{ width: "auto", padding: 0, border: "none" }}
              align='end'>
              <Calendar
                mode='range'
                selected={dateRange}
                onSelect={(r) => {
                  if (r?.from && r?.to)
                    setDateRange({
                      from: startOfDay(r.from),
                      to: endOfDay(r.to),
                    });
                }}
                numberOfMonths={2}
              />
              <div className='cf-quick-strip'>
                <span className='cf-quick-label'>Quick:</span>
                {QUICK_RANGES.map((q) => (
                  <button
                    key={q.label}
                    className='cf-quick-btn'
                    onClick={() => {
                      setDateRange(q.range());
                      setDateOpen(false);
                    }}>
                    {q.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Clear */}
          {hasActiveFilters && (
            <button className='cf-clear-btn' onClick={clearFilters}>
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        {/* Active badges */}
        {hasActiveFilters && (
          <div className='cf-badges'>
            <span className='cf-badges-label'>Active:</span>
            {filters.search && (
              <span className='cf-badge'>
                <Search size={10} /> {filters.search}
                <button
                  className='cf-badge-x'
                  onClick={() => updateFilter("search", undefined)}>
                  <X size={8} />
                </button>
              </span>
            )}
            {filters.userId && selectedUser && (
              <span className='cf-badge'>
                <User size={10} /> {selectedUser.name}
                <button
                  className='cf-badge-x'
                  onClick={() => updateFilter("userId", undefined)}>
                  <X size={8} />
                </button>
              </span>
            )}
            {filters.startDate && dateRange.from && dateRange.to && (
              <span className='cf-badge'>
                <CalendarIcon size={10} />
                {format(dateRange.from, "MMM d")} –{" "}
                {format(dateRange.to, "MMM d")}
                <button
                  className='cf-badge-x'
                  onClick={() =>
                    setDateRange({
                      from: startOfDay(new Date()),
                      to: endOfDay(new Date()),
                    })
                  }>
                  <X size={8} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          MOBILE: sticky top trigger bar
      ══════════════════════════════════════════ */}
      <div className='cf-mobile-trigger'>
        {/* Tappable search pill — opens sheet with search focused */}
        <div
          className='cf-mobile-search-pill'
          onClick={() => setSheetOpen(true)}>
          <Search size={15} style={{ color: "#8b90a7", flexShrink: 0 }} />
          <span>{filters.search ? filters.search : "Search commissions…"}</span>
        </div>

        {/* Filter icon button */}
        <button
          className={cn(
            "cf-mobile-filter-btn",
            hasActiveFilters && "has-filters",
          )}
          onClick={() => setSheetOpen(true)}>
          <SlidersHorizontal size={17} />
          {hasActiveFilters && <div className='cf-filter-dot' />}
        </button>
      </div>

      {/* Active chips strip (mobile, below trigger) */}
      {hasActiveFilters && (
        <div className='cf-active-chips' style={{ display: "none" }}>
          {/* shown via CSS media query inside cf-wrap, but we hide by default */}
        </div>
      )}

      {/* ══════════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════════ */}
      <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent className='cf-wrap max-h-[92vh] overflow-hidden rounded-t-[22px] border-0 bg-white p-0'>
          <DrawerTitle className='sr-only'>Commission filters</DrawerTitle>

          {/* ── SEARCH FIRST — appears at top, above keyboard content ── */}
          <div className='cf-sheet-search-zone'>
            <div className='cf-sheet-search-inner'>
              <Search size={16} className='cf-sheet-search-icon' />
              <input
                ref={sheetSearchRef}
                className='cf-sheet-search-input'
                placeholder='Search commissions…'
                value={filters.search || ""}
                onChange={(e) => updateFilter("search", e.target.value)}
                inputMode='search'
                enterKeyHint='search'
              />
              {filters.search && (
                <button
                  className='cf-sheet-search-clear'
                  onClick={() => updateFilter("search", undefined)}>
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Header */}
          <div className='cf-sheet-header'>
            <h3 className='cf-sheet-title'>Filters</h3>
            <button
              className='cf-sheet-close'
              onClick={() => setSheetOpen(false)}>
              <X size={15} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className='cf-sheet-body'>
            {/* ── Date Range Section ── */}
            <div className='cf-sheet-section'>
              <div className='cf-sheet-section-label'>Date Range</div>

              {/* Current selection display */}
              <div className='cf-sheet-date-display'>
                <CalendarIcon
                  size={14}
                  style={{ color: "#5b52f0", flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div className='cf-sheet-date-label'>Selected period</div>
                  <div className='cf-sheet-date-val'>
                    {format(sheetDateRange.from, "MMM d, yyyy")} –{" "}
                    {format(sheetDateRange.to, "MMM d, yyyy")}
                  </div>
                </div>
              </div>

              {/* Quick presets grid */}
              <div className='cf-sheet-chip-row'>
                {QUICK_RANGES.map((q) => {
                  const r = q.range();
                  const isActive =
                    format(sheetDateRange.from, "yyyy-MM-dd") ===
                      format(r.from, "yyyy-MM-dd") &&
                    format(sheetDateRange.to, "yyyy-MM-dd") ===
                      format(r.to, "yyyy-MM-dd");
                  return (
                    <button
                      key={q.label}
                      className={cn("cf-sheet-chip", isActive && "active")}
                      onClick={() => setSheetDateRange(q.range())}>
                      <Clock size={12} />
                      {q.label}
                      {isActive && <Check size={11} />}
                    </button>
                  );
                })}
              </div>

              {/* Toggle full calendar */}
              <button
                style={{
                  marginTop: 10,
                  width: "100%",
                  height: 38,
                  borderRadius: 11,
                  border: "1.5px dashed #e4e6f0",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#8b90a7",
                  cursor: "pointer",
                  fontFamily: "'Sora', sans-serif",
                  transition: "all .15s",
                }}
                onClick={() => setSheetShowCalendar(!sheetShowCalendar)}>
                <CalendarIcon size={13} />
                {sheetShowCalendar ? "Hide" : "Custom date range"}
                <ChevronRight
                  size={13}
                  style={{
                    transform: sheetShowCalendar ? "rotate(90deg)" : "none",
                    transition: "transform .2s",
                  }}
                />
              </button>

              {sheetShowCalendar && (
                <div style={{ marginTop: 10, overflowX: "auto" }}>
                  <Calendar
                    mode='range'
                    selected={sheetDateRange}
                    onSelect={(r) => {
                      if (r?.from && r?.to)
                        setSheetDateRange({
                          from: startOfDay(r.from),
                          to: endOfDay(r.to),
                        });
                    }}
                    numberOfMonths={1}
                  />
                </div>
              )}
            </div>

            {/* ── User Section ── */}
            <div className='cf-sheet-section'>
              <div className='cf-sheet-section-label'>Filter by User</div>

              {/* User search */}
              <div style={{ position: "relative", marginBottom: 10 }}>
                <Search
                  size={13}
                  style={{
                    position: "absolute",
                    left: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#8b90a7",
                  }}
                />
                <input
                  style={{
                    width: "100%",
                    height: 38,
                    padding: "0 12px 0 34px",
                    borderRadius: 10,
                    border: "1.5px solid #e4e6f0",
                    background: "#f5f6fa",
                    fontFamily: "'Sora', sans-serif",
                    fontSize: 13,
                    color: "#1a1d2e",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color .15s",
                  }}
                  placeholder='Search users…'
                  value={sheetUserQuery}
                  onChange={(e) => setSheetUserQuery(e.target.value)}
                />
              </div>

              {/* All users option */}
              <div
                className='cf-sheet-user-item'
                onClick={() => setSheetUserFilter(null)}>
                <div className='cf-avatar-md' style={{ background: "#f0f1f8" }}>
                  <User size={15} style={{ color: "#8b90a7" }} />
                </div>
                <span className='cf-sheet-user-all'>All users</span>
                {!sheetUserFilter && (
                  <Check size={15} style={{ color: "#5b52f0", flexShrink: 0 }} />
                )}
              </div>

              {sheetFilteredUsers.slice(0, 8).map((user) => (
                <div
                  key={user._id}
                  className='cf-sheet-user-item'
                  onClick={() => setSheetUserFilter(user)}>
                  <div className='cf-avatar-md'>{initials(user.name)}</div>
                  <span className='cf-sheet-user-name'>{user.name}</span>
                  {sheetUserFilter?.id === user.id && (
                    <Check
                      size={15}
                      style={{ color: "#5b52f0", flexShrink: 0 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className='cf-sheet-footer'>
            <button className='cf-sheet-reset' onClick={resetSheet}>
              Reset
            </button>
            <button className='cf-sheet-apply' onClick={applySheetFilters}>
              Apply Filters {filterCount > 0 && `(${filterCount})`}
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
