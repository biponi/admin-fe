import * as React from "react";
import {
  MessageCircle,
  Search,
  ChevronDown,
  Clock,
  Phone,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { hasPagePermission } from "../utils/helperFunction";
import { useSelector } from "react-redux";

// Types
interface LocalMessage {
  _id: string;
  content: string;
  sender: "customer" | "agent";
  senderId: string;
  messageType: "text" | "image" | "file";
  timestamp: Date;
  read: boolean;
}

interface LocalTicket {
  _id: string;
  ticketId: string;
  customerId: string;
  customerInfo: {
    name: string;
    email?: string;
    phone?: string;
  };
  subject: string;
  status: "open" | "assigned" | "pending" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  department: string;
  assignedAgent?: string;
  messages: LocalMessage[];
  createdAt: Date;
  updatedAt: Date;
  unreadCount?: number;
  lastMessage?: string;
}

interface ChatSidebarProps {
  tickets: LocalTicket[];
  selectedTicket: string | null;
  onTicketSelect: (ticketId: string) => void;
  className?: string;
  isLoading?: boolean;
  error?: any;
}

export function ChatSidebar({
  tickets,
  selectedTicket,
  onTicketSelect,
  className,
  isLoading = false,
  error = null,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const user = useSelector((state: any) => state?.user);
  const userPermissions = user?.permissions || [];
  const canView = hasPagePermission("Chat", "view", userPermissions);

  // Filter tickets based on search and status
  const filteredTickets = tickets
    .filter((ticket) => {
      const matchesSearch =
        // ticket.subject
        //   .toLowerCase()
        //   .includes(!!searchQuery ? searchQuery.toLowerCase() : "") ||
        ticket?.customerInfo?.name
          .toLowerCase()
          .includes(!!searchQuery ? searchQuery.toLowerCase() : "");
      const matchesStatus =
        filterStatus === "all" || ticket.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by priority first, then by update time
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "resolved":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "closed":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "normal":
        return "bg-blue-500";
      case "low":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const activeTicketsCount = tickets.filter(
    (t) =>
      t.status === "open" || t.status === "assigned" || t.status === "pending"
  ).length;
  const unreadCount = tickets.reduce((sum, t) => sum + (t.unreadCount || 0), 0);

  if (!canView) {
    return (
      <div className='w-80 bg-white border-r border-gray-100 flex items-center justify-center'>
        <div className='text-center p-6'>
          <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
            <MessageCircle className='w-6 h-6 text-gray-400' />
          </div>
          <p className='text-sm text-gray-500'>No access to view tickets</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full sm:w-80 bg-white border-r border-gray-100 flex flex-col ${className}`}>
      {/* Simple Header */}
      <div className='p-4 border-b border-gray-100'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h1 className='text-lg font-semiboldtext-gray-500  '>Support</h1>
            <p className='text-sm text-gray-500 '>
              {activeTicketsCount} active • {unreadCount} unread
            </p>
          </div>
          <div className='w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center'>
            <MessageCircle className='w-5 h-5 text-sidebar' />
          </div>
        </div>

        {/* Clean Search */}
        <div className='relative '>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <Input
            placeholder='Search conversations...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10 border-gray-200 focus:border-sidebar/300 focus:ring-sidebar/100 rounded-lg bg-white'
          />
        </div>
      </div>

      {/* Minimal Filter */}
      <div className='px-4 py-2 border-b border-gray-50'>
        <div className='relative'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className='h-8 text-xstext-gray-500 hover:text-accent-foreground p-0 font-normal'>
            {filterStatus === "all"
              ? "All tickets"
              : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            <ChevronDown className='w-3 h-3 ml-1' />
          </Button>

          {isFilterOpen && (
            <div className='absolute top-8 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]'>
              {["all", "open", "assigned", "pending", "resolved", "closed"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setIsFilterOpen(false);
                    }}
                    className='w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700 capitalize'>
                    {status === "all" ? "All tickets" : status}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Clean Ticket List */}
      <div className='flex-1 overflow-y-auto max-h-[70vh] rounded-bl-md bg-white'>
        {isLoading ? (
          <div className='flex items-center justify-center h-32 text-gray-400'>
            <div className='text-center'>
              <Loader2 className='w-8 h-8 mx-auto mb-2 animate-spin' />
              <p className='text-sm'>Loading conversations...</p>
            </div>
          </div>
        ) : error ? (
          <div className='flex items-center justify-center h-32 text-gray-400'>
            <div className='text-center'>
              <AlertCircle className='w-8 h-8 mx-auto mb-2 text-red-500' />
              <p className='text-sm text-red-600'>
                Failed to load conversations
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                Please try refreshing
              </p>
            </div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className='flex items-center justify-center h-32 text-gray-400'>
            <div className='text-center'>
              <MessageCircle className='w-8 h-8 mx-auto mb-2 opacity-50' />
              <p className='text-sm'>No conversations</p>
            </div>
          </div>
        ) : (
          <div className='divide-y divide-gray-50'>
            {filteredTickets.map((ticket) => (
              <div
                key={ticket._id}
                onClick={() => onTicketSelect(ticket._id)}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedTicket === ticket._id ? "bg-gray-100" : "bg-white"
                }`}>
                <div className='flex items-start gap-3'>
                  {/* Avatar */}
                  <div className='relative flex-shrink-0'>
                    <Avatar className='w-10 h-10'>
                      <AvatarFallback className='bg-gray-100 text-gray-600 text-sm font-medium'>
                        {getInitials(ticket.customerInfo.name)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Priority indicator */}
                    <div
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getPriorityColor(
                        ticket.priority
                      )} border-2 border-white`}
                    />
                    {/* Unread indicator */}
                    {(ticket.unreadCount || 0) > 0 && (
                      <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center'>
                        <span className='text-xs text-white font-medium'>
                          {ticket.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between mb-1'>
                      <h3 className='text-sm font-medium text-gray-900 truncate'>
                        {ticket.customerInfo.name}
                      </h3>
                      <div className='flex items-center gap-2'>
                        {/* Unassigned indicator */}
                        {!ticket.assignedAgent && (
                          <Badge
                            variant='outline'
                            className='text-xs px-1.5 py-0.5 border-blue-200 text-blue-700 bg-blue-50'>
                            Unassigned
                          </Badge>
                        )}
                        <Badge
                          variant='secondary'
                          className={`text-xs px-2 py-0.5 border ${getStatusColor(
                            ticket.status
                          )}`}>
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>

                    <p className='text-sm text-gray-600 mb-1 truncate'>
                      {ticket.subject}
                    </p>

                    <p className='text-xs text-gray-500 truncate mb-2'>
                      {ticket.lastMessage || "No messages yet"}
                    </p>

                    <div className='flex items-center justify-between text-xs text-gray-400'>
                      <div className='flex items-center gap-1'>
                        <Clock className='w-3 h-3' />
                        <span>
                          {formatDistanceToNow(new Date(ticket.updatedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Phone className='w-3 h-3' />
                        <span>
                          •••{ticket.customerInfo.phone?.slice(-4) || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
