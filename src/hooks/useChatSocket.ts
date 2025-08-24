import { useCallback, useRef, useEffect } from 'react';
import { socketService, SocketEventCallbacks } from '../services/socketService';
import { Ticket, Message } from '../services/chatApiService';

// Hook for managing socket connections and real-time updates
export const useChatSocket = (callbacks?: {
  onCustomerMessage?: (data: { ticketId: string; message: Message }) => void;
  onNewTicket?: (ticket: Ticket) => void;
  onTicketUpdated?: (data: { ticketId: string; updates: Partial<Ticket> }) => void;
  onTicketAssigned?: (data: { ticketId: string; agentName: string; agentDepartment: string }) => void;
  onConnectionEstablished?: () => void;
  onConnectionLost?: () => void;
  onMessageSent?: (data: { ticketId: string; messageId: string; timestamp: Date }) => void;
  onTyping?: (data: { ticketId: string; isTyping: boolean; customerName?: string; agentName?: string }) => void;
}) => {

  // Use ref to store the latest callbacks
  const callbacksRef = useRef(callbacks);
  
  // Update ref when callbacks change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const setupSocketListeners = useCallback(() => {
    const socketCallbacks: SocketEventCallbacks = {
      onCustomerMessage: (data) => callbacksRef.current?.onCustomerMessage?.(data),
      onNewTicket: (ticket) => callbacksRef.current?.onNewTicket?.(ticket),
      onTicketUpdated: (data) => callbacksRef.current?.onTicketUpdated?.(data),
      onTicketAssigned: (data) => {
        console.log("Ticket assigned via socket:", data);
        callbacksRef.current?.onTicketAssigned?.(data);
        // Also trigger ticket update to refresh status
        callbacksRef.current?.onTicketUpdated?.({
          ticketId: data.ticketId,
          updates: { assignedAgent: data.agentName, status: 'assigned' as any }
        });
      },
      onConnectionEstablished: () => callbacksRef.current?.onConnectionEstablished?.(),
      onConnectionLost: () => callbacksRef.current?.onConnectionLost?.(),
      onMessageSent: (data) => callbacksRef.current?.onMessageSent?.(data),
      onTyping: (data) => callbacksRef.current?.onTyping?.(data),
      onError: (error: any) => {
        console.error('Socket error received:', error);
      },
    };

    socketService.addCallbacks(socketCallbacks);
  }, []);

  const connectSocket = useCallback(() => {
    socketService.connect();
  }, []);

  const disconnectSocket = useCallback(() => {
    socketService.disconnect();
  }, []);

  const sendMessage = useCallback((ticketId: string, content: string) => {
    socketService.sendMessage(ticketId, content);
  }, []);

  const sendMessageWithAutoAssign = useCallback((ticketId: string, content: string) => {
    socketService.sendMessageWithAutoAssign(ticketId, content);
  }, []);

  const updateStatus = useCallback((status: 'available' | 'busy' | 'away' | 'offline') => {
    socketService.updateStatus(status);
  }, []);

  const sendTyping = useCallback((ticketId: string, isTyping: boolean) => {
    socketService.sendTyping(ticketId, isTyping);
  }, []);

  const getConnectionStatus = useCallback(() => {
    return socketService.getConnectionStatus();
  }, []);

  const assignTicket = useCallback((ticketId: string) => {
    socketService.assignTicket(ticketId);
  }, []);

  const transferTicket = useCallback((ticketId: string, targetAgentId: string, reason?: string) => {
    socketService.transferTicket(ticketId, targetAgentId, reason);
  }, []);

  const closeTicket = useCallback((ticketId: string, reason?: string, rating?: number) => {
    socketService.closeTicket(ticketId, reason, rating);
  }, []);

  const setAway = useCallback((message?: string) => {
    socketService.setAway(message);
  }, []);

  const setAvailable = useCallback(() => {
    socketService.setAvailable();
  }, []);

  const joinDepartment = useCallback((department: string) => {
    socketService.joinDepartment(department);
  }, []);

  const joinUserChannel = useCallback((userId: string) => {
    socketService.joinUserChannel(userId);
  }, []);

  const leaveDepartment = useCallback((department: string) => {
    socketService.leaveDepartment(department);
  }, []);

  const getTicketDetails = useCallback((ticketId: string) => {
    socketService.getTicketDetails(ticketId);
  }, []);

  const markNotificationsAsRead = useCallback((notificationIds: string[]) => {
    socketService.markNotificationsAsRead(notificationIds);
  }, []);

  const sendFile = useCallback((ticketId: string, fileName: string, fileType: string, fileSize: number, fileUrl: string, metadata: any = {}) => {
    socketService.sendFile(ticketId, fileName, fileType, fileSize, fileUrl, metadata);
  }, []);

  const getConnectionInfo = useCallback(() => {
    return socketService.getConnectionInfo();
  }, []);

  const authenticate = useCallback(() => {
    socketService.authenticate();
  }, []);

  return {
    connectSocket,
    disconnectSocket,
    sendMessage,
    sendMessageWithAutoAssign,
    updateStatus,
    sendTyping,
    getConnectionStatus,
    setupSocketListeners,
    assignTicket,
    transferTicket,
    closeTicket,
    setAway,
    setAvailable,
    joinDepartment,
    joinUserChannel,
    leaveDepartment,
    getTicketDetails,
    markNotificationsAsRead,
    sendFile,
    getConnectionInfo,
    authenticate,
  };
};