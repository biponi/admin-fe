import { io, Socket } from "socket.io-client";
import { SOCKET_URL, SOCKET_EVENTS } from "../config/api";
import { Message, Ticket } from "./chatApiService";

export interface SocketEventCallbacks {
  onCustomerMessage?: (data: { ticketId: string; message: Message }) => void;
  onNewTicket?: (ticket: Ticket) => void;
  onTicketUpdated?: (data: {
    ticketId: string;
    updates: Partial<Ticket>;
  }) => void;
  onTicketAssigned?: (data: {
    ticketId: string;
    agentName: string;
    agentDepartment: string;
  }) => void;
  onTicketTransferred?: (data: { ticketId: string; message: string }) => void;
  onTicketTransferredToYou?: (data: {
    ticketId: string;
    transferredBy: string;
    reason: string;
    ticket: any;
  }) => void;
  onTicketTransferredAway?: (data: {
    ticketId: string;
    transferredBy: string;
    reason: string;
  }) => void;
  onTicketClosed?: (data: {
    ticketId: string;
    closedBy: string;
    reason: string;
    timestamp: Date;
  }) => void;
  onAgentStatusChange?: (data: {
    userId: string;
    name: string;
    status: string;
    timestamp: Date;
  }) => void;
  onCustomerDisconnected?: (data: {
    ticketId: string;
    customerId: string;
    timestamp: Date;
  }) => void;
  onCustomerReconnected?: (data: {
    ticketId: string;
    customerName: string;
    lastSeen: Date;
  }) => void;
  onCustomerEndedConversation?: (data: {
    ticketId: string;
    customerName: string;
    feedback?: string;
    rating?: number;
    timestamp: Date;
  }) => void;
  onAgentRequested?: (data: { ticket: any }) => void;
  onNotification?: (notification: any) => void;
  onTyping?: (data: {
    ticketId: string;
    isTyping: boolean;
    customerName?: string;
    agentName?: string;
  }) => void;
  onConnectionEstablished?: () => void;
  onConnectionLost?: () => void;
  onAuthSuccess?: (data: { user: any }) => void;
  onAuthError?: (error: any) => void;
  onMessageSent?: (data: {
    ticketId: string;
    messageId: string;
    timestamp: Date;
  }) => void;
  onStatusUpdated?: (data: { status: string; timestamp: Date }) => void;
  onError?: (error: any) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private isAuthenticated = false;
  private callbacks: SocketEventCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // constructor() {
  //   // Don't auto-connect in constructor - let the app control when to connect
  // }

  connect(): void {
    if (this.socket && this.isConnected) {
      console.log("Socket already connected, skipping...");
      return;
    }

    if (this.socket && !this.isConnected) {
      console.log("Socket exists but not connected, disconnecting first...");
      this.socket.disconnect();
      this.socket = null;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No auth token found for socket connection");
      return;
    }

    this.socket = io(`${SOCKET_URL}/agent`, {
      auth: {
        token,
      },
      autoConnect: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log("Socket connected successfully");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.callbacks.onConnectionEstablished?.();
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log("Socket disconnected:", reason);
      this.isConnected = false;
      this.isAuthenticated = false;
      this.callbacks.onConnectionLost?.();

      // Auto-reconnect unless disconnect was intentional
      if (
        reason !== "io client disconnect" &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        setTimeout(() => {
          this.reconnectAttempts++;
          console.log(
            `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
          );
          this.reconnect();
        }, this.reconnectDelay * this.reconnectAttempts);
      }
    });

    this.socket.on(SOCKET_EVENTS.AUTH_SUCCESS, (data) => {
      console.log("Socket authentication successful:", data);
      this.isAuthenticated = true;

      // Auto-join support department and user-specific channels
      if (data.user?.id) {
        this.joinDepartment("support");
        this.joinUserChannel(data.user.id);
      }

      this.callbacks.onAuthSuccess?.(data);
    });

    this.socket.on(SOCKET_EVENTS.AUTH_ERROR, (error) => {
      console.error("Socket authentication failed:", error);
      this.isAuthenticated = false;
      this.callbacks.onAuthError?.(error);
      this.callbacks.onError?.(error);
    });

    // Message events
    this.socket.on(SOCKET_EVENTS.CUSTOMER_MESSAGE, (data) => {
      console.log("💬 CUSTOMER_MESSAGE socket event received:", data);
      console.log("💬 Calling onCustomerMessage callback...");
      this.callbacks.onCustomerMessage?.(data);
    });

    // Ticket events
    this.socket.on(SOCKET_EVENTS.NEW_TICKET, (ticket) => {
      console.log("🎟️ NEW_TICKET socket event received:", ticket);
      console.log("🎟️ Calling onNewTicket callback...");
      this.callbacks.onNewTicket?.(ticket);
    });

    this.socket.on(SOCKET_EVENTS.TICKET_UPDATED, (data) => {
      console.log("Ticket updated:", data);
      this.callbacks.onTicketUpdated?.(data);
    });

    this.socket.on(SOCKET_EVENTS.TICKET_ASSIGNED, (data) => {
      console.log("Ticket assigned:", data);
      this.callbacks.onTicketAssigned?.(data);
    });

    this.socket.on(SOCKET_EVENTS.TICKET_TRANSFERRED, (data) => {
      console.log("Ticket transferred:", data);
      this.callbacks.onTicketTransferred?.(data);
    });

    this.socket.on(SOCKET_EVENTS.TICKET_TRANSFERRED_TO_YOU, (data) => {
      console.log("Ticket transferred to you:", data);
      this.callbacks.onTicketTransferredToYou?.(data);
    });

    this.socket.on(SOCKET_EVENTS.TICKET_TRANSFERRED_AWAY, (data) => {
      console.log("Ticket transferred away:", data);
      this.callbacks.onTicketTransferredAway?.(data);
    });

    this.socket.on(SOCKET_EVENTS.TICKET_CLOSED, (data) => {
      console.log("Ticket closed:", data);
      this.callbacks.onTicketClosed?.(data);
    });

    this.socket.on(SOCKET_EVENTS.AGENT_REQUESTED, (data) => {
      console.log("Agent requested:", data);
      this.callbacks.onAgentRequested?.(data);
    });

    this.socket.on(SOCKET_EVENTS.TICKET_ASSIGNED_SUCCESS, (data) => {
      console.log("Ticket assignment successful:", data);
    });

    this.socket.on(SOCKET_EVENTS.TICKET_TRANSFER_SUCCESS, (data) => {
      console.log("Ticket transfer successful:", data);
    });

    this.socket.on(SOCKET_EVENTS.TICKET_CLOSED_SUCCESS, (data) => {
      console.log("Ticket close successful:", data);
    });

    this.socket.on(SOCKET_EVENTS.MESSAGE_SENT, (data) => {
      console.log("Message sent confirmation:", data);
      this.callbacks.onMessageSent?.(data);
    });

    this.socket.on(SOCKET_EVENTS.STATUS_UPDATED, (data) => {
      console.log("Status updated:", data);
      this.callbacks.onStatusUpdated?.(data);
    });

    // Status events
    this.socket.on(SOCKET_EVENTS.AGENT_STATUS_CHANGE, (data) => {
      console.log("Agent status changed:", data);
      this.callbacks.onAgentStatusChange?.(data);
    });

    this.socket.on(SOCKET_EVENTS.CUSTOMER_DISCONNECTED, (data) => {
      console.log("Customer disconnected:", data);
      this.callbacks.onCustomerDisconnected?.(data);
    });

    this.socket.on(SOCKET_EVENTS.CUSTOMER_RECONNECTED, (data) => {
      console.log("Customer reconnected:", data);
      this.callbacks.onCustomerReconnected?.(data);
    });

    this.socket.on(SOCKET_EVENTS.CUSTOMER_ENDED_CONVERSATION, (data) => {
      console.log("Customer ended conversation:", data);
      this.callbacks.onCustomerEndedConversation?.(data);
    });

    // Typing events
    this.socket.on(SOCKET_EVENTS.CUSTOMER_TYPING, (data) => {
      this.callbacks.onTyping?.(data);
    });

    this.socket.on(SOCKET_EVENTS.AGENT_TYPING, (data) => {
      this.callbacks.onTyping?.(data);
    });

    // Notification events
    this.socket.on(SOCKET_EVENTS.NOTIFICATION, (notification) => {
      console.log("🔔 NOTIFICATION socket event received:", notification);
      console.log("🔔 Notification callback exists:", !!this.callbacks.onNotification);
      if (this.callbacks.onNotification) {
        console.log("🔔 Calling onNotification callback...");
        this.callbacks.onNotification(notification);
      } else {
        console.warn("🔔 No onNotification callback registered!");
      }
    });

    // Department and user channel events
    this.socket.on(SOCKET_EVENTS.JOINED_DEPARTMENT, (data) => {
      console.log("Successfully joined department:", data.department);
    });

    this.socket.on(SOCKET_EVENTS.LEFT_DEPARTMENT, (data) => {
      console.log("Successfully left department:", data.department);
    });

    // Handle user channel join confirmation
    this.socket.on("user_channel_joined", (data) => {
      console.log("Successfully joined user channel:", data.userId);
    });

    // Error handling
    this.socket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error("Socket error:", error);
      this.callbacks.onError?.(error);
    });
  }

  // Set event callbacks
  setCallbacks(callbacks: SocketEventCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Add callbacks without overwriting existing ones
  addCallbacks(callbacks: SocketEventCallbacks): void {
    // Special handling for each callback type to maintain type safety
    if (callbacks.onNotification) {
      const existingOnNotification = this.callbacks.onNotification;
      const newOnNotification = callbacks.onNotification;
      
      if (existingOnNotification) {
        this.callbacks.onNotification = (notification) => {
          try {
            existingOnNotification(notification);
          } catch (error) {
            console.error('Error in existing onNotification callback:', error);
          }
          try {
            newOnNotification(notification);
          } catch (error) {
            console.error('Error in new onNotification callback:', error);
          }
        };
      } else {
        this.callbacks.onNotification = newOnNotification;
      }
    }
    
    // For other callbacks, use simple overwrite (they're typically not shared)
    if (callbacks.onCustomerMessage) this.callbacks.onCustomerMessage = callbacks.onCustomerMessage;
    if (callbacks.onNewTicket) this.callbacks.onNewTicket = callbacks.onNewTicket;
    if (callbacks.onTicketUpdated) this.callbacks.onTicketUpdated = callbacks.onTicketUpdated;
    if (callbacks.onTicketAssigned) this.callbacks.onTicketAssigned = callbacks.onTicketAssigned;
    if (callbacks.onTicketTransferred) this.callbacks.onTicketTransferred = callbacks.onTicketTransferred;
    if (callbacks.onTicketTransferredToYou) this.callbacks.onTicketTransferredToYou = callbacks.onTicketTransferredToYou;
    if (callbacks.onTicketTransferredAway) this.callbacks.onTicketTransferredAway = callbacks.onTicketTransferredAway;
    if (callbacks.onTicketClosed) this.callbacks.onTicketClosed = callbacks.onTicketClosed;
    if (callbacks.onAgentStatusChange) this.callbacks.onAgentStatusChange = callbacks.onAgentStatusChange;
    if (callbacks.onCustomerDisconnected) this.callbacks.onCustomerDisconnected = callbacks.onCustomerDisconnected;
    if (callbacks.onCustomerReconnected) this.callbacks.onCustomerReconnected = callbacks.onCustomerReconnected;
    if (callbacks.onCustomerEndedConversation) this.callbacks.onCustomerEndedConversation = callbacks.onCustomerEndedConversation;
    if (callbacks.onAgentRequested) this.callbacks.onAgentRequested = callbacks.onAgentRequested;
    if (callbacks.onTyping) this.callbacks.onTyping = callbacks.onTyping;
    if (callbacks.onConnectionEstablished) this.callbacks.onConnectionEstablished = callbacks.onConnectionEstablished;
    if (callbacks.onConnectionLost) this.callbacks.onConnectionLost = callbacks.onConnectionLost;
    if (callbacks.onAuthSuccess) this.callbacks.onAuthSuccess = callbacks.onAuthSuccess;
    if (callbacks.onAuthError) this.callbacks.onAuthError = callbacks.onAuthError;
    if (callbacks.onMessageSent) this.callbacks.onMessageSent = callbacks.onMessageSent;
    if (callbacks.onStatusUpdated) this.callbacks.onStatusUpdated = callbacks.onStatusUpdated;
    if (callbacks.onError) this.callbacks.onError = callbacks.onError;
  }

  // Send message
  sendMessage(ticketId: string, content: string): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
      ticketId,
      content,
      messageType: "text",
    });
  }

  // Send message with auto-assignment
  sendMessageWithAutoAssign(ticketId: string, content: string): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    // First try to assign the ticket to current user
    this.assignTicket(ticketId);

    // Then send the message
    this.socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
      ticketId,
      content,
      messageType: "text",
      autoAssign: true, // Flag to indicate this should auto-assign
    });
  }

  // Update agent status
  updateStatus(status: "available" | "busy" | "away" | "offline"): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit(SOCKET_EVENTS.UPDATE_STATUS, { status });
  }

  // Update ticket status
  updateTicketStatus(ticketId: string, status: string): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit(SOCKET_EVENTS.UPDATE_TICKET_STATUS, {
      ticketId,
      status,
    });
  }

  // Send typing indicator
  sendTyping(ticketId: string, isTyping: boolean): void {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit(SOCKET_EVENTS.TYPING, {
      ticketId,
      isTyping,
    });
  }

  // Get ticket details
  getTicketDetails(ticketId: string): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit(SOCKET_EVENTS.GET_TICKET_DETAILS, { ticketId });
  }

  // Mark notifications as read
  markNotificationsAsRead(notificationIds: string[]): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit(SOCKET_EVENTS.NOTIFICATIONS_READ_ALL, { notificationIds });
  }

  // Assign ticket to current agent
  assignTicket(ticketId: string): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit(SOCKET_EVENTS.ASSIGN_TICKET, { ticketId });
  }

  // Transfer ticket to another agent
  transferTicket(
    ticketId: string,
    targetAgentId: string,
    reason?: string
  ): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit(SOCKET_EVENTS.TRANSFER_TICKET, {
      ticketId,
      targetAgentId,
      reason,
    });
  }

  // Close ticket
  closeTicket(ticketId: string, reason?: string, rating?: number): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit(SOCKET_EVENTS.CLOSE_TICKET, {
      ticketId,
      reason,
      rating,
    });
  }

  // Set agent status to away
  setAway(message?: string): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit(SOCKET_EVENTS.SET_AWAY, { message });
  }

  // Set agent status to available
  setAvailable(): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit(SOCKET_EVENTS.SET_AVAILABLE);
  }

  // Join department room
  joinDepartment(department: string): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit(SOCKET_EVENTS.JOIN_DEPARTMENT, { department });
  }

  // Join user-specific channel for personal notifications
  joinUserChannel(userId: string): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("join_user_channel", { userId });
  }

  // Leave department room
  leaveDepartment(department: string): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit(SOCKET_EVENTS.LEAVE_DEPARTMENT, { department });
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Get authentication status
  getAuthenticationStatus(): boolean {
    return this.isAuthenticated;
  }

  // Force authentication
  authenticate(): void {
    const token = localStorage.getItem("token");
    if (this.socket && token) {
      this.socket.emit(SOCKET_EVENTS.AUTHENTICATE, { token });
    }
  }

  // Send file
  sendFile(
    ticketId: string,
    fileName: string,
    fileType: string,
    fileSize: number,
    fileUrl: string,
    metadata: any = {}
  ): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
      ticketId,
      content: fileName,
      messageType: "file",
      metadata: {
        ...metadata,
        fileName,
        fileType,
        fileSize,
        fileUrl,
      },
    });
  }

  // Get agent notifications
  getNotifications(): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("get_notifications");
  }

  // Mark single notification as read
  markNotificationAsRead(notificationId: string): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit(SOCKET_EVENTS.NOTIFICATION_READ, { notificationId });
  }

  // Get connection info
  getConnectionInfo(): {
    connected: boolean;
    authenticated: boolean;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      authenticated: this.isAuthenticated,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Reconnect
  reconnect(): void {
    this.disconnect();
    this.connect();
  }
}

export const socketService = new SocketService();
export default socketService;
