import React, { useRef } from "react";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  Send,
  MessageCircle,
  Phone,
  AlertCircle,
  MoreVertical,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  Loader2,
  Menu,
} from "lucide-react";
import { format } from "date-fns";
import { hasPagePermission } from "../../utils/helperFunction";
import { useSelector } from "react-redux";
import { ChatSidebar } from "../../components/chat-sidebar";
import { useChatData } from "../../hooks/useChatDataSimple";
import { useChatSocket } from "../../hooks/useChatSocket";
import { ChatErrorBoundary } from "../../components/ChatErrorBoundary";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";

// Local interface for component props
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

// Components
const ChatInterface: React.FC<{
  ticket: LocalTicket | null;
  canReply: boolean;
  canAttend: boolean;
  user: any;
  onSendMessage: (
    ticketId: string,
    content: string,
    senderId: string
  ) => Promise<void>;
  onUpdateStatus: (ticketId: string, status: string) => Promise<void>;
  isSending: boolean;
  isUpdatingStatus: boolean;
  connectionStatus: {
    connected: boolean;
    authenticated: boolean;
    reconnectAttempts: number;
  };
  typingUsers: Record<string, { isTyping: boolean; name?: string }>;
  // WhatsApp-style mobile props
  tickets: LocalTicket[];
  selectedTicket: string | null;
  onTicketSelect: (ticketId: string) => void;
  ticketsLoading: boolean;
  ticketsError: any;
}> = ({
  ticket,
  canReply,
  canAttend,
  user,
  onSendMessage,
  onUpdateStatus,
  isSending,
  isUpdatingStatus,
  connectionStatus,
  typingUsers,
  tickets,
  selectedTicket,
  onTicketSelect,
  ticketsLoading,
  ticketsError,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageInputRef = useRef<string>("");

  const { sendTyping } = useChatSocket();

  // Auto-scroll to bottom when messages change
  React.useLayoutEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [ticket?.messages]);

  const handleSend = async () => {
    const message = messageInputRef.current.trim();
    if (message && canReply && ticket && !isSending) {
      try {
        await onSendMessage(
          ticket.ticketId,
          message,
          user?.id || user?.ticketId || ""
        );
        messageInputRef.current = "";
        if (textareaRef.current) {
          textareaRef.current.value = "";
          textareaRef.current.style.height = "auto";
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    messageInputRef.current = e.target.value;

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }

    // Send typing indicator
    if (ticket) {
      sendTyping(ticket.ticketId, e.target.value.length > 0);
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

  const handleStatusChange = async (status: string) => {
    if (ticket && canAttend && !isUpdatingStatus) {
      try {
        await onUpdateStatus(ticket.ticketId, status);
      } catch (error) {
        console.error("Failed to update status:", error);
      }
    }
  };

  const formatMessageTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, "HH:mm");
    } else {
      return format(date, "MMM dd, HH:mm");
    }
  };

  if (!ticket) {
    return (
      <div className='flex items-center justify-center h-full bg-gray-50'>
        <div className='text-center max-w-md mx-auto p-8'>
          <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <MessageCircle className='w-8 h-8 text-blue-600' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Select a conversation
          </h3>
          <p className='text-gray-500'>
            Choose a customer support ticket from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

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

  return (
    <div className='flex flex-col h-full bg-white'>
      {/* Modern Header - WhatsApp Style for Mobile */}
      <div className='flex items-center justify-between p-3 sm:p-4 border-b border-gray-100 bg-white'>
        {/* Mobile Menu Button - WhatsApp style */}
        <div className='flex items-center gap-3 sm:hidden'>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className='p-2 h-auto hover:bg-gray-100'>
                <Menu className='w-5 h-5' />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className='w-80 p-0'>
              <SheetHeader className='p-4 border-b'>
                <SheetTitle className='text-left'>Support Tickets</SheetTitle>
              </SheetHeader>
              <div className='h-[calc(100vh-80px)] overflow-hidden'>
                <ChatSidebar
                  tickets={tickets}
                  selectedTicket={selectedTicket}
                  onTicketSelect={onTicketSelect}
                  isLoading={ticketsLoading}
                  error={ticketsError}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className='flex items-center gap-2 sm:gap-3 flex-1 min-w-0'>
          <Avatar className='w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0'>
            <AvatarFallback className='bg-blue-100 text-blue-700 font-medium text-xs sm:text-sm'>
              {getInitials(ticket.customerInfo.name)}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <h2 className='font-medium text-gray-900 text-sm sm:text-base truncate'>
              {ticket.customerInfo.name}
            </h2>
            <div className='flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500'>
              <Phone className='w-3 h-3 flex-shrink-0' />
              <span className='truncate'>{ticket.customerInfo.phone || "N/A"}</span>
              <span className='hidden sm:inline'>•</span>
              <span className='hidden sm:inline truncate'>{ticket.subject}</span>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-1 sm:gap-3'>
          {/* Mobile-optimized status and controls */}
          <div className='flex items-center gap-1 sm:gap-2'>
            {/* Connection Status - Compact on mobile */}
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                connectionStatus.connected
                  ? "bg-green-500"
                  : connectionStatus.reconnectAttempts > 0
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            />
            {/* Connection text hidden on mobile */}
            <span className='hidden sm:inline text-xs text-gray-500'>
              {connectionStatus.connected
                ? "Connected"
                : connectionStatus.reconnectAttempts > 0
                ? "Reconnecting..."
                : "Disconnected"}
            </span>

            <Badge
              variant='secondary'
              className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 border ${getStatusColor(
                ticket.status
              )}`}>
              {ticket.status}
            </Badge>
          </div>

          {/* Desktop controls - hidden on mobile */}
          <div className='hidden sm:flex items-center gap-3'>
            {canAttend && (
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdatingStatus}
                className='text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50'>
                <option value='open'>Open</option>
                <option value='assigned'>Assigned</option>
                <option value='pending'>Pending</option>
                <option value='resolved'>Resolved</option>
                <option value='closed'>Closed</option>
              </select>
            )}

            {/* Auto-assign indicator for unassigned tickets */}
            {!ticket.assignedAgent && (
              <Badge
                variant='outline'
                className='text-xs px-2 py-1 border-blue-200 text-blue-700 bg-blue-50'>
                Will auto-assign on reply
              </Badge>
            )}

            <Button variant='ghost' size='sm' className='w-8 h-8 p-0'>
              <MoreVertical className='w-4 h-4' />
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button variant='ghost' size='sm' className='sm:hidden p-1.5 h-auto'>
            <MoreVertical className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Messages Area - Mobile Optimized */}
      <div
        ref={scrollAreaRef}
        className='flex-1 overflow-y-auto max-h-[70vh] p-2 sm:p-4 space-y-2 sm:space-y-4 bg-gray-50'>
        {ticket.messages.map((msg, index) => {
          const isFromSameUser =
            index > 0 && ticket.messages[index - 1].sender === msg.sender;

          return (
            <div
              key={msg._id}
              className={`flex items-end gap-1 sm:gap-2 ${
                msg.sender === "agent" ? "justify-end" : "justify-start"
              } ${isFromSameUser ? "mt-1" : "mt-2 sm:mt-4"}`}>
              {/* Avatar for non-agent messages - Smaller on mobile */}
              {msg.sender !== "agent" && !isFromSameUser && (
                <Avatar className='w-6 h-6 sm:w-7 sm:h-7 mb-1 flex-shrink-0'>
                  <AvatarFallback className='text-xs font-medium bg-gray-100 text-gray-600'>
                    {getInitials(ticket.customerInfo.name)}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Spacer for same user messages */}
              {msg.sender !== "agent" && isFromSameUser && (
                <div className='w-6 sm:w-7 flex-shrink-0' />
              )}

              <div
                className={`max-w-[80%] sm:max-w-[70%] ${
                  msg.sender === "agent" ? "order-last" : ""
                }`}>
                {/* Message bubble - Mobile optimized */}
                <div
                  className={`rounded-2xl px-3 py-2 sm:px-4 ${
                    msg.sender === "agent"
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                  } ${isFromSameUser ? "mt-1" : ""}`}>
                  <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
                    {msg.content}
                  </p>
                </div>

                {/* Time and status - Mobile optimized */}
                <div
                  className={`flex items-center gap-1 mt-1 px-1 ${
                    msg.sender === "agent" ? "justify-end" : "justify-start"
                  }`}>
                  <span className='text-xs text-gray-400'>
                    {formatMessageTime(msg.timestamp)}
                  </span>
                  {msg.sender === "agent" && (
                    <div className='text-blue-500 flex-shrink-0'>
                      {msg.read ? (
                        <CheckCheck className='w-3 h-3' />
                      ) : (
                        <Check className='w-3 h-3' />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {typingUsers[ticket.ticketId]?.isTyping && (
          <div className='flex items-center gap-2 px-4 py-2'>
            <div className='flex items-center gap-1'>
              <div
                className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                style={{ animationDelay: "0ms" }}
              />
              <div
                className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                style={{ animationDelay: "150ms" }}
              />
              <div
                className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <span className='text-xs text-gray-500'>
              {typingUsers[ticket.ticketId]?.name || "Customer"} is typing...
            </span>
          </div>
        )}
      </div>

      {/* Message Input - Mobile Optimized */}
      {canReply ? (
        <div className='p-2 sm:p-4 border-t border-gray-100 bg-white'>
          <div className='flex items-end gap-2 sm:gap-3 bg-gray-50 rounded-2xl p-2 sm:p-3'>
            <Button
              variant='ghost'
              size='sm'
              className='w-7 h-7 sm:w-8 sm:h-8 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0'>
              <Paperclip className='w-4 h-4' />
            </Button>

            <div className='flex-1 min-w-0'>
              <Textarea
                ref={textareaRef}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder='Type a message...'
                className='min-h-[20px] max-h-[100px] sm:max-h-[120px] resize-none border-0 bg-transparent p-0 text-sm placeholder:text-gray-400 focus:ring-0 focus:outline-none'
                style={{ height: "auto" }}
              />
            </div>

            <Button
              variant='ghost'
              size='sm'
              className='hidden sm:flex w-8 h-8 p-0 text-gray-400 hover:text-gray-600'>
              <Smile className='w-4 h-4' />
            </Button>

            <Button
              onClick={handleSend}
              disabled={isSending}
              size='sm'
              className='w-8 h-8 sm:w-8 sm:h-8 p-0 rounded-full transition-all bg-blue-500 hover:bg-blue-600 text-white shadow-sm disabled:opacity-50 flex-shrink-0 touch-manipulation'>
              {isSending ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Send className='w-4 h-4' />
              )}
            </Button>
          </div>

          <p className='hidden sm:block text-xs text-gray-400 mt-2 ml-1'>
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      ) : (
        <div className='p-2 sm:p-4 border-t border-gray-100 bg-gray-50'>
          <div className='flex items-center justify-center gap-2 text-gray-500 py-2'>
            <AlertCircle className='w-4 h-4 flex-shrink-0' />
            <span className='text-xs sm:text-sm text-center'>
              You don't have permission to reply to this conversation
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Chat Page Component
const ChatPage: React.FC = () => {
  const selectedTicketRef = useRef<string | null>(null);
  const [selectedTicket, setSelectedTicket] = React.useState<string | null>(null);
  const [isSending, setIsSending] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const initializedRef = useRef(false);
  const urlProcessedRef = useRef(false);

  const user = useSelector((state: any) => state?.user);
  const userPermissions = user?.permissions || [];

  // Hooks
  const {
    tickets,
    currentTicket,
    isLoading: ticketsLoading,
    error: ticketsError,
    isLoadingTicket: ticketLoading,
    fetchTickets,
    fetchTicket,
    sendMessage,
    updateTicketStatus,
    handleSocketMessage,
    handleNewTicket,
    handleTicketUpdated,
  } = useChatData();

  const [connectionStatus, setConnectionStatus] = React.useState<{
    connected: boolean;
    authenticated: boolean;
    reconnectAttempts: number;
  }>({ connected: false, authenticated: false, reconnectAttempts: 0 });

  const [typingUsers, setTypingUsers] = React.useState<
    Record<string, { isTyping: boolean; name?: string }>
  >({});

  const {
    connectSocket,
    disconnectSocket,
    setupSocketListeners,
    getConnectionInfo,
  } = useChatSocket({
    onCustomerMessage: handleSocketMessage,
    onNewTicket: (ticket) => {
      console.log("New ticket received, refreshing ticket list");
      handleNewTicket(ticket);
      // Refresh tickets to ensure the list is updated
      fetchTickets();
    },
    onTicketUpdated: (data) => {
      console.log("Ticket updated via socket:", data);
      handleTicketUpdated(data);
    },
    onConnectionEstablished: () => {
      setConnectionStatus(getConnectionInfo());
    },
    onConnectionLost: () => {
      setConnectionStatus(getConnectionInfo());
    },
    onMessageSent: (data) => {
      console.log("Message sent successfully:", data);
    },
    onTyping: (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.ticketId]: {
          isTyping: data.isTyping,
          name: data.customerName || data.agentName,
        },
      }));

      // Clear typing indicator after 3 seconds
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers((prev) => ({
            ...prev,
            [data.ticketId]: { isTyping: false },
          }));
        }, 3000);
      }
    },
  });

  // Initialize socket connection and data fetching
  React.useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      
      // Set up socket listeners, then connect
      setupSocketListeners();
      connectSocket();
      
      // Fetch tickets only once on initial load
      fetchTickets();
    }

    return () => {
      if (initializedRef.current) {
        disconnectSocket();
        initializedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Check permissions
  const canReply = hasPagePermission("Chat", "reply", userPermissions);
  const canAttend = hasPagePermission("Chat", "attend", userPermissions);
  const canView = hasPagePermission("Chat", "view", userPermissions);

  const handleTicketSelect = React.useCallback((ticketId: string) => {
    selectedTicketRef.current = ticketId;
    setSelectedTicket(ticketId);
    fetchTicket(ticketId);
  }, [fetchTicket]);

  // Handle URL query parameter for auto-selecting ticket
  React.useEffect(() => {
    if (!urlProcessedRef.current && tickets.length > 0) {
      urlProcessedRef.current = true;
      
      const urlParams = new URLSearchParams(window.location.search);
      const ticketParam = urlParams.get('ticket');
      
      if (ticketParam) {
        // Find ticket by ticketId (not _id)
        const ticketToSelect = tickets.find(ticket => ticket.ticketId === ticketParam);
        
        if (ticketToSelect) {
          console.log(`Auto-selecting ticket from URL: ${ticketParam}`);
          handleTicketSelect(ticketToSelect._id);
          
          // Update URL to remove the query parameter to avoid re-processing
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('ticket');
          window.history.replaceState({}, '', newUrl.toString());
        } else {
          console.warn(`Ticket not found in list: ${ticketParam}`);
        }
      }
    }
  }, [tickets, handleTicketSelect]);

  const handleSendMessage = async (
    ticketId: string,
    content: string,
    senderId: string
  ) => {
    setIsSending(true);
    try {
      // Check if ticket is unassigned and use auto-assign
      const ticket = tickets.find((t) => t.ticketId === ticketId);
      if (ticket && !ticket.assignedAgent) {
        console.log(
          "Sending message with auto-assignment for unassigned ticket:",
          ticketId
        );
      }

      await sendMessage(ticketId, content, senderId, user?.id);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    setIsUpdatingStatus(true);
    try {
      await updateTicketStatus(ticketId, status);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!canView) {
    return (
      <div className='flex items-center justify-center h-full bg-gray-50'>
        <div className='text-center max-w-md mx-auto p-8'>
          <AlertCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Access Denied
          </h3>
          <p className='text-gray-500'>
            You don't have permission to access the chat system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChatErrorBoundary>
      <div className='flex w-full max-h-[88vh] overflow-y-hidden rounded-xl bg-slate-300 border'>
        {/* Chat content area */}
        <div className='flex-1 flex overflow-y-hidden'>
          {/* Desktop Sidebar - Hidden on mobile */}
          <div className='hidden md:block w-80 flex-shrink-0 overflow-hidden'>
            <ChatSidebar
              tickets={tickets}
              selectedTicket={selectedTicket}
              onTicketSelect={handleTicketSelect}
              isLoading={ticketsLoading}
              error={ticketsError}
            />
          </div>

          {/* Main chat interface - Full width on mobile, flex-1 on desktop */}
          <div className='flex-1 flex flex-col'>
            {ticketLoading ? (
              <div className='flex items-center justify-center h-full'>
                <Loader2 className='w-8 h-8 animate-spin text-blue-500' />
              </div>
            ) : (
              <ChatInterface
                ticket={currentTicket}
                canReply={canReply}
                canAttend={canAttend}
                user={user}
                onSendMessage={handleSendMessage}
                onUpdateStatus={handleUpdateStatus}
                isSending={isSending}
                isUpdatingStatus={isUpdatingStatus}
                connectionStatus={connectionStatus}
                typingUsers={typingUsers}
                tickets={tickets}
                selectedTicket={selectedTicket}
                onTicketSelect={handleTicketSelect}
                ticketsLoading={ticketsLoading}
                ticketsError={ticketsError}
              />
            )}
          </div>
        </div>
      </div>
    </ChatErrorBoundary>
  );
};

export default ChatPage;
