import { Card, CardContent } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { Badge } from "../../../components/ui/badge";
import { Search, X, CalendarIcon, User } from "lucide-react";
import { CommissionQueryParams } from "../../../api/commission";
import { format, startOfDay, endOfDay } from "date-fns";
import { cn } from "../../../lib/utils";
import { useState, useEffect, useMemo } from "react";
import { getAllUsers } from "../../../api/user";
import { Calendar } from "../../../components/ui/calendar";

interface CommissionFiltersProps {
  filters: CommissionQueryParams;
  onFiltersChange: (filters: any) => void;
}

export const CommissionFilters: React.FC<CommissionFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  // Enhanced user search state
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      const response = await getAllUsers();
      if (response.success && response.data) {
        setAllUsers(response.data);
      }
    };
    fetchUsers();
  }, []);

  // Update selectedUser when userId filter changes
  useEffect(() => {
    if (filters.userId) {
      const user = allUsers.find((u) => u.id === filters.userId);
      setSelectedUser(user);
    } else {
      setSelectedUser(null);
    }
  }, [filters.userId, allUsers]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery) return allUsers;
    return allUsers.filter((user) =>
      user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()),
    );
  }, [allUsers, userSearchQuery]);

  const updateFilter = (key: keyof CommissionQueryParams, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setSelectedUser(null);
    setDateRange({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    });
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  // Update filters when date range changes
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      const formatLocalDateTime = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      const newStartDate = formatLocalDateTime(dateRange.from);
      const newEndDate = formatLocalDateTime(dateRange.to);

      // Use functional update to avoid depending on filters
      onFiltersChange((prevFilters: any) => ({
        ...prevFilters,
        startDate: newStartDate,
        endDate: newEndDate,
      }));
    }
    //eslint-disable-next-line
  }, [dateRange]);

  return (
    <Card>
      <CardContent className='pt-6 space-y-4'>
        {/* Row 1: Search + Clear Button */}
        <div className='flex gap-2'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search commissions...'
              className='pl-9 h-10'
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
            {filters.search && (
              <Button
                variant='ghost'
                size='sm'
                className='absolute right-1 top-1 h-8 w-8 p-0'
                onClick={() => updateFilter("search", undefined)}>
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant='outline'
              size='icon'
              className='h-10 w-10'
              onClick={clearFilters}
              title='Clear all filters'>
              <X className='h-4 w-4' />
            </Button>
          )}
        </div>

        {/* Row 2: User Dropdown + Date Picker - 2 columns */}
        <div className='grid gap-4 md:grid-cols-2'>
          {/* Enhanced User Dropdown with Search */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Filter by User</Label>
            <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    "w-full justify-start h-10",
                    selectedUser && "text-foreground",
                  )}>
                  <User className='mr-2 h-4 w-4 text-muted-foreground' />
                  {selectedUser ? (
                    <div className='flex items-center gap-2 flex-1'>
                      <Avatar className='h-5 w-5'>
                        <AvatarImage src={selectedUser.avatar} />
                        <AvatarFallback className='text-xs'>
                          {selectedUser.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className='truncate'>{selectedUser.name}</span>
                    </div>
                  ) : (
                    <span className='text-muted-foreground'>All Users</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[95vw] sm:w-80 p-0' align='start'>
                <div className='p-2 border-b'>
                  <div className='relative'>
                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Search users...'
                      className='h-9 pl-8 text-sm'
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className='max-h-60 overflow-y-auto p-1'>
                  <Button
                    variant='ghost'
                    className='w-full justify-start'
                    onClick={() => {
                      updateFilter("userId", undefined);
                      setUserSearchOpen(false);
                    }}>
                    <span className='font-normal'>All Users</span>
                  </Button>
                  {filteredUsers.map((user) => (
                    <Button
                      key={user._id}
                      variant={
                        filters.userId === user.id ? "secondary" : "ghost"
                      }
                      className='w-full justify-start'
                      onClick={() => {
                        updateFilter("userId", user.id);
                        setUserSearchOpen(false);
                        setUserSearchQuery("");
                      }}>
                      <Avatar className='h-6 w-6 mr-2'>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className='text-xs'>
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className='truncate'>{user.name}</span>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Enhanced Date Range Picker with Quick Selects */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !dateRange.from && "text-muted-foreground",
                  )}>
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {dateRange.from && dateRange.to ? (
                    <span className='truncate'>
                      {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                      {format(dateRange.to, "MMM dd, yyyy")}
                    </span>
                  ) : (
                    <span>Select date range</span>
                  )}
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
                  className='rounded-md'
                />
                {/* Quick Select Buttons */}
                <div className='p-3 border-t'>
                  <p className='text-xs font-medium text-muted-foreground mb-2'>
                    Quick Select:
                  </p>
                  <div className='flex gap-2 flex-wrap'>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-9 text-xs'
                      onClick={() =>
                        setDateRange({
                          from: startOfDay(new Date()),
                          to: endOfDay(new Date()),
                        })
                      }>
                      Today
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-9 text-xs'
                      onClick={() =>
                        setDateRange({
                          from: startOfDay(
                            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                          ),
                          to: endOfDay(new Date()),
                        })
                      }>
                      Last 7 Days
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-9 text-xs'
                      onClick={() =>
                        setDateRange({
                          from: startOfDay(
                            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                          ),
                          to: endOfDay(new Date()),
                        })
                      }>
                      Last 30 Days
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-9 text-xs'
                      onClick={() =>
                        setDateRange({
                          from: startOfDay(
                            new Date(
                              new Date().getFullYear(),
                              new Date().getMonth(),
                              1,
                            ),
                          ),
                          to: endOfDay(new Date()),
                        })
                      }>
                      This Month
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Row 3: Active Filter Badges */}
        {hasActiveFilters && (
          <div className='flex items-center gap-2 flex-wrap pt-2 border-t'>
            <span className='text-xs font-medium text-muted-foreground'>
              Active filters:
            </span>
            {filters.search && (
              <Badge variant='secondary' className='gap-1 px-2 py-1'>
                <Search className='h-3 w-3' />
                Search: "{filters.search}"
                <button
                  onClick={() => updateFilter("search", undefined)}
                  className='ml-1 hover:bg-primary/20 rounded'>
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            )}
            {filters.userId && selectedUser && (
              <Badge variant='secondary' className='gap-1 px-2 py-1'>
                <User className='h-3 w-3' />
                {selectedUser.name}
                <button
                  onClick={() => updateFilter("userId", undefined)}
                  className='ml-1 hover:bg-primary/20 rounded'>
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            )}
            {filters.startDate && (
              <Badge variant='secondary' className='gap-1 px-2 py-1'>
                <CalendarIcon className='h-3 w-3' />
                {format(dateRange.from!, "MMM dd")} -{" "}
                {format(dateRange.to!, "MMM dd")}
                <button
                  onClick={() =>
                    setDateRange({
                      from: startOfDay(new Date()),
                      to: endOfDay(new Date()),
                    })
                  }
                  className='ml-1 hover:bg-primary/20 rounded'>
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
