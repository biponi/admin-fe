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
import { Search, X, CalendarIcon, User, ChevronDown } from "lucide-react";
import { CommissionQueryParams } from "../../../../api/commission";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { cn } from "../../../../lib/utils";
import { useState, useEffect, useMemo } from "react";
import { getAllUsers } from "../../../../api/user";
import { Calendar } from "../../../../components/ui/calendar";

interface CommissionFiltersProps {
  filters: CommissionQueryParams;
  onFiltersChange: (filters: any) => void;
}

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

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery) return allUsers;
    return allUsers.filter((u) =>
      u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()),
    );
  }, [allUsers, userSearchQuery]);

  const updateFilter = (key: keyof CommissionQueryParams, value: any) =>
    onFiltersChange({ ...filters, [key]: value });

  const clearFilters = () => {
    onFiltersChange({});
    setSelectedUser(null);
    setDateRange({ from: startOfDay(new Date()), to: endOfDay(new Date()) });
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const formatLocalDateTime = (date: Date) => {
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
  };

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

  const quickRanges = [
    {
      label: "Today",
      range: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
    },
    {
      label: "Last 7 days",
      range: {
        from: startOfDay(new Date(Date.now() - 7 * 86400000)),
        to: endOfDay(new Date()),
      },
    },
    {
      label: "Last 30 days",
      range: {
        from: startOfDay(new Date(Date.now() - 30 * 86400000)),
        to: endOfDay(new Date()),
      },
    },
    {
      label: "This month",
      range: {
        from: startOfDay(
          new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        ),
        to: endOfDay(new Date()),
      },
    },
  ];

  return (
    <div className='rounded-xl border bg-card px-4 py-3 space-y-3'>
      {/* Filter controls row */}
      <div className='flex items-center gap-2 flex-wrap'>
        {/* Search */}
        <div className='relative flex-1 min-w-[180px]'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground' />
          <Input
            placeholder='Search commissions…'
            className='pl-8 pr-7 h-8 text-sm bg-muted/40 border-transparent focus:border-border focus:bg-background'
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
          {filters.search && (
            <button
              className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
              onClick={() => updateFilter("search", undefined)}>
              <X className='h-3 w-3' />
            </button>
          )}
        </div>

        {/* User filter pill */}
        <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className={cn(
                "h-8 gap-1.5 text-sm font-normal border-dashed",
                selectedUser && "border-solid border-foreground/30 bg-muted/60",
              )}>
              <User className='h-3.5 w-3.5 text-muted-foreground' />
              {selectedUser ? (
                <div className='flex items-center gap-1.5'>
                  <Avatar className='h-4 w-4'>
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback className='text-[9px]'>
                      {selectedUser.name?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className='max-w-[100px] truncate'>
                    {selectedUser.name}
                  </span>
                </div>
              ) : (
                <span className='text-muted-foreground'>User</span>
              )}
              <ChevronDown className='h-3 w-3 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-56 p-0' align='start'>
            <div className='flex items-center gap-2 px-2 py-1.5 border-b'>
              <Search className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
              <Input
                placeholder='Search users…'
                className='h-7 border-0 p-0 text-sm focus-visible:ring-0 bg-transparent'
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className='max-h-52 overflow-y-auto p-1'>
              <button
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted",
                  !filters.userId && "bg-muted font-medium",
                )}
                onClick={() => {
                  updateFilter("userId", undefined);
                  setUserSearchOpen(false);
                }}>
                All users
              </button>
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted text-left",
                    filters.userId === user.id && "bg-muted font-medium",
                  )}
                  onClick={() => {
                    updateFilter("userId", user.id);
                    setUserSearchOpen(false);
                    setUserSearchQuery("");
                  }}>
                  <Avatar className='h-5 w-5 shrink-0'>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className='text-[10px]'>
                      {user.name?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className='truncate'>{user.name}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Date range pill */}
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className={cn(
                "h-8 gap-1.5 text-sm font-normal border-dashed",
                filters.startDate &&
                  "border-solid border-foreground/30 bg-muted/60",
              )}>
              <CalendarIcon className='h-3.5 w-3.5 text-muted-foreground' />
              {dateRange.from && dateRange.to ? (
                <span>
                  {format(dateRange.from, "MMM d")} –{" "}
                  {format(dateRange.to, "MMM d, yyyy")}
                </span>
              ) : (
                <span className='text-muted-foreground'>Date range</span>
              )}
              <ChevronDown className='h-3 w-3 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='end'>
            <Calendar
              mode='range'
              selected={dateRange}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({
                    from: startOfDay(range.from),
                    to: endOfDay(range.to),
                  });
                }
              }}
              numberOfMonths={2}
            />
            <div className='border-t px-3 py-2 flex items-center gap-1.5'>
              <span className='text-xs text-muted-foreground mr-1'>Quick:</span>
              {quickRanges.map((q) => (
                <Button
                  key={q.label}
                  variant='ghost'
                  size='sm'
                  className='h-6 px-2 text-xs'
                  onClick={() => {
                    setDateRange(q.range);
                    setDateOpen(false);
                  }}>
                  {q.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear all */}
        {hasActiveFilters && (
          <Button
            variant='ghost'
            size='sm'
            className='h-8 gap-1 text-xs text-muted-foreground hover:text-destructive px-2'
            onClick={clearFilters}>
            <X className='h-3 w-3' />
            Clear all
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className='flex items-center gap-1.5 flex-wrap'>
          <span className='text-xs text-muted-foreground'>Active:</span>

          {filters.search && (
            <Badge
              variant='secondary'
              className='gap-1 px-2 py-0.5 text-xs font-normal rounded-full'>
              <Search className='h-3 w-3' />
              {filters.search}
              <button
                className='ml-0.5 hover:text-destructive'
                onClick={() => updateFilter("search", undefined)}>
                <X className='h-3 w-3' />
              </button>
            </Badge>
          )}

          {filters.userId && selectedUser && (
            <Badge
              variant='secondary'
              className='gap-1 px-2 py-0.5 text-xs font-normal rounded-full'>
              <User className='h-3 w-3' />
              {selectedUser.name}
              <button
                className='ml-0.5 hover:text-destructive'
                onClick={() => updateFilter("userId", undefined)}>
                <X className='h-3 w-3' />
              </button>
            </Badge>
          )}

          {filters.startDate && dateRange.from && dateRange.to && (
            <Badge
              variant='secondary'
              className='gap-1 px-2 py-0.5 text-xs font-normal rounded-full'>
              <CalendarIcon className='h-3 w-3' />
              {format(dateRange.from, "MMM d")} –{" "}
              {format(dateRange.to, "MMM d")}
              <button
                className='ml-0.5 hover:text-destructive'
                onClick={() =>
                  setDateRange({
                    from: startOfDay(new Date()),
                    to: endOfDay(new Date()),
                  })
                }>
                <X className='h-3 w-3' />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
