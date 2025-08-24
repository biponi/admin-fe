import { useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from '../config/api';
import { Ticket, Message, Notification } from '../services/chatApi';

interface UseSocketOptions {
  agentId?: string;
  agentName?: string;
  department?: string;
}

export interface UseSocketReturn {
  socket: Socket | null;
  isConnected: () => boolean;
  isAuthenticated: () => boolean;
  connect: () => void;
  disconnect: () => void;
  authenticate: (agentData: { agentId: string; agentName: string; department?: string }) => void;
  sendMessage: (ticketId: string, message: string) => void;
  updateTicketStatus: (ticketId: string, status: string, notes?: string) => void;
  updateAgentStatus: (status: string) => void;
  getTicketDetails: (ticketId: string) => void;
  markTyping: (ticketId: string, isTyping: boolean) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
}

export const useSocket = (options: UseSocketOptions = {}): UseSocketReturn => {
  const { agentId, agentName, department } = options;
  
  const socketRef = useRef<Socket | null>(null);
  const connectedRef = useRef(false);
  const authenticatedRef = useRef(false);

  const socketActions = useMemo(() => {
    const connect = () => {
      if (socketRef.current?.connected) return;

      socketRef.current = io(`${SOCKET_URL}/agent`, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      const socket = socketRef.current;

      socket.on(SOCKET_EVENTS.CONNECT, () => {
        console.log('Connected to agent socket');
        connectedRef.current = true;
        
        // Auto-authenticate if credentials are provided
        if (agentId && agentName) {
          authenticate({ agentId, agentName, department });
        }
      });

      socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        console.log('Disconnected from agent socket');
        connectedRef.current = false;
        authenticatedRef.current = false;
      });

      socket.on(SOCKET_EVENTS.AUTH_SUCCESS, (data) => {
        console.log('Agent authenticated successfully:', data);
        authenticatedRef.current = true;
      });

      socket.on(SOCKET_EVENTS.AUTH_ERROR, (data) => {
        console.error('Authentication failed:', data);
        authenticatedRef.current = false;
      });

      socket.on(SOCKET_EVENTS.ERROR, (data) => {
        console.error('Socket error:', data);
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        connectedRef.current = false;
      });
    };

    const disconnect = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        connectedRef.current = false;
        authenticatedRef.current = false;
      }
    };

    const authenticate = (agentData: { agentId: string; agentName: string; department?: string }) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit(SOCKET_EVENTS.AUTHENTICATE, agentData);
      }
    };

    const sendMessage = (ticketId: string, message: string) => {
      if (socketRef.current?.connected && authenticatedRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.SEND_MESSAGE, { ticketId, message });
      }
    };

    const updateTicketStatus = (ticketId: string, status: string, notes?: string) => {
      if (socketRef.current?.connected && authenticatedRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.UPDATE_TICKET_STATUS, { ticketId, status, notes });
      }
    };

    const updateAgentStatus = (status: string) => {
      if (socketRef.current?.connected && authenticatedRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.UPDATE_STATUS, { status });
      }
    };

    const getTicketDetails = (ticketId: string) => {
      if (socketRef.current?.connected && authenticatedRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.GET_TICKET_DETAILS, { ticketId });
      }
    };

    const markTyping = (ticketId: string, isTyping: boolean) => {
      if (socketRef.current?.connected && authenticatedRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.TYPING, { ticketId, isTyping });
      }
    };

    const markNotificationRead = (notificationId: string) => {
      if (socketRef.current?.connected && authenticatedRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.NOTIFICATION_READ, { notificationId });
      }
    };

    const markAllNotificationsRead = () => {
      if (socketRef.current?.connected && authenticatedRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.NOTIFICATIONS_READ_ALL, {});
      }
    };

    const isConnected = () => connectedRef.current;
    const isAuthenticated = () => authenticatedRef.current;

    return {
      connect,
      disconnect,
      authenticate,
      sendMessage,
      updateTicketStatus,
      updateAgentStatus,
      getTicketDetails,
      markTyping,
      markNotificationRead,
      markAllNotificationsRead,
      isConnected,
      isAuthenticated,
    };
  // eslint-disable-next-line
  }, []);

  return {
    socket: socketRef.current,
    ...socketActions,
  };
};