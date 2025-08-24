import { useReducer, useCallback } from "react";
import {
  chatApiService,
  Ticket,
  TicketFilters,
  Message,
} from "../services/chatApiService";
import { socketService } from "../services/socketService";

// State interface
interface ChatState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  isLoading: boolean;
  error: string | null;
  isLoadingTicket: boolean;
  ticketError: string | null;
}

// Action types
type ChatAction =
  | { type: "FETCH_TICKETS_START" }
  | { type: "FETCH_TICKETS_SUCCESS"; payload: Ticket[] }
  | { type: "FETCH_TICKETS_ERROR"; payload: string }
  | { type: "FETCH_TICKET_START" }
  | { type: "FETCH_TICKET_SUCCESS"; payload: Ticket }
  | { type: "FETCH_TICKET_ERROR"; payload: string }
  | { type: "ADD_MESSAGE"; payload: { ticketId: string; message: Message } }
  | {
      type: "UPDATE_TICKET_STATUS";
      payload: { ticketId: string; status: string };
    }
  | {
      type: "UPDATE_TICKET";
      payload: { ticketId: string; updates: Partial<Ticket> };
    }
  | { type: "ADD_NEW_TICKET"; payload: Ticket }
  | { type: "CLEAR_CURRENT_TICKET" };

// Initial state
const initialState: ChatState = {
  tickets: [],
  currentTicket: null,
  isLoading: false,
  error: null,
  isLoadingTicket: false,
  ticketError: null,
};

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "FETCH_TICKETS_START":
      return { ...state, isLoading: true, error: null };

    case "FETCH_TICKETS_SUCCESS":
      return { ...state, isLoading: false, tickets: action.payload };

    case "FETCH_TICKETS_ERROR":
      return { ...state, isLoading: false, error: action.payload };

    case "FETCH_TICKET_START":
      return { ...state, isLoadingTicket: true, ticketError: null };

    case "FETCH_TICKET_SUCCESS":
      return {
        ...state,
        isLoadingTicket: false,
        currentTicket: action.payload,
      };

    case "FETCH_TICKET_ERROR":
      return { ...state, isLoadingTicket: false, ticketError: action.payload };

    case "ADD_MESSAGE":
      const updatedTickets = state.tickets.map((ticket) => {
        return ticket.ticketId === action.payload.ticketId
          ? {
              ...ticket,
              messages: [...ticket.messages, action.payload.message],
              lastMessage: action.payload.message.content,
              updatedAt: new Date(),
            }
          : ticket;
      });

      const updatedCurrentTicket =
        state.currentTicket?.ticketId === action.payload.ticketId
          ? {
              ...state.currentTicket,
              messages: [
                ...state.currentTicket.messages,
                action.payload.message,
              ],
              updatedAt: new Date(),
            }
          : state.currentTicket;

      return {
        ...state,
        tickets: updatedTickets,
        currentTicket: updatedCurrentTicket,
      };

    case "UPDATE_TICKET_STATUS":
      const statusUpdatedTickets = state.tickets.map((ticket) =>
        ticket.ticketId === action.payload.ticketId
          ? {
              ...ticket,
              status: action.payload.status as any,
              updatedAt: new Date(),
            }
          : ticket
      );

      const statusUpdatedCurrentTicket =
        state.currentTicket?.ticketId === action.payload.ticketId
          ? {
              ...state.currentTicket,
              status: action.payload.status as any,
              updatedAt: new Date(),
            }
          : state.currentTicket;

      return {
        ...state,
        tickets: statusUpdatedTickets,
        currentTicket: statusUpdatedCurrentTicket,
      };

    case "UPDATE_TICKET":
      const updatedTicketsList = state.tickets.map((ticket) =>
        ticket.ticketId === action.payload.ticketId
          ? { ...ticket, ...action.payload.updates, updatedAt: new Date() }
          : ticket
      );

      const updatedCurrentTicketData =
        state.currentTicket?.ticketId === action.payload.ticketId
          ? {
              ...state.currentTicket,
              ...action.payload.updates,
              updatedAt: new Date(),
            }
          : state.currentTicket;

      return {
        ...state,
        tickets: updatedTicketsList,
        currentTicket: updatedCurrentTicketData,
      };

    case "ADD_NEW_TICKET":
      return {
        ...state,
        tickets: [action.payload, ...state.tickets],
      };

    case "CLEAR_CURRENT_TICKET":
      return {
        ...state,
        currentTicket: null,
      };

    default:
      return state;
  }
}

// Custom hook
export const useChatData = () => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Fetch tickets
  const fetchTickets = useCallback(async (filters?: TicketFilters) => {
    dispatch({ type: "FETCH_TICKETS_START" });

    try {
      const response = await chatApiService.getTickets(filters);
      if (response.success) {
        dispatch({
          type: "FETCH_TICKETS_SUCCESS",
          payload: response.data.tickets,
        });
      } else {
        dispatch({
          type: "FETCH_TICKETS_ERROR",
          payload: response.error || "Failed to fetch tickets",
        });
      }
    } catch (error: any) {
      dispatch({
        type: "FETCH_TICKETS_ERROR",
        payload: error.message || "Failed to fetch tickets",
      });
    }
  }, []);

  // Fetch single ticket
  const fetchTicket = useCallback(async (ticketId: string) => {
    if (!ticketId) return;

    dispatch({ type: "FETCH_TICKET_START" });

    try {
      const response = await chatApiService.getTicket(ticketId);
      if (response.success) {
        dispatch({
          type: "FETCH_TICKET_SUCCESS",
          payload: response.data.ticket,
        });
      } else {
        dispatch({
          type: "FETCH_TICKET_ERROR",
          payload: response.error || "Failed to fetch ticket",
        });
      }
    } catch (error: any) {
      dispatch({
        type: "FETCH_TICKET_ERROR",
        payload: error.message || "Failed to fetch ticket",
      });
    }
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (
      ticketId: string,
      content: string,
      senderId: string,
      userId: string = ""
    ) => {
      try {
        const response = await chatApiService.sendMessage(
          ticketId,
          content,
          senderId
        );
        if (response.success) {
          dispatch({
            type: "ADD_MESSAGE",
            payload: { ticketId, message: response.data.message },
          });

          // Check if ticket needs assignment
          const currentTicketData = state.tickets.find(
            (t) => t.ticketId === ticketId
          );
          
          if (
            currentTicketData &&
            !currentTicketData.assignedAgent &&
            !!userId
          ) {
            // Assign ticket and update local state
            try {
              const assignResponse = await chatApiService.assignTicket(ticketId, userId);
              if (assignResponse.success) {
                dispatch({
                  type: "UPDATE_TICKET",
                  payload: { 
                    ticketId, 
                    updates: { 
                      assignedAgent: userId,
                      status: 'assigned' as any
                    } 
                  },
                });
              }
            } catch (assignError) {
              console.error("Failed to assign ticket:", assignError);
            }
          }

          // Always send via socket regardless of assignment
          socketService.sendMessage(ticketId, content);

          return response;
        } else {
          throw new Error(response.error || "Failed to send message");
        }
      } catch (error: any) {
        throw error;
      }
    },
    [state.tickets]
  );

  // Update ticket status
  const updateTicketStatus = useCallback(
    async (ticketId: string, status: string) => {
      try {
        const response = await chatApiService.updateTicketStatus(
          ticketId,
          status
        );
        if (response.success) {
          dispatch({
            type: "UPDATE_TICKET_STATUS",
            payload: { ticketId, status },
          });

          // Also send via socket
          socketService.updateTicketStatus(ticketId, status);

          return response;
        } else {
          throw new Error(response.error || "Failed to update ticket status");
        }
      } catch (error: any) {
        throw error;
      }
    },
    []
  );

  // Socket event handlers
  const handleSocketMessage = useCallback(
    (data: { ticketId: string; message: Message }) => {
      console.log("handleSocketMessage called with:", data);
      dispatch({ type: "ADD_MESSAGE", payload: data });
    },
    []
  );

  const handleNewTicket = useCallback((ticket: Ticket) => {
    console.log("handleNewTicket called with:", ticket);
    dispatch({ type: "ADD_NEW_TICKET", payload: ticket });
  }, []);

  const handleTicketUpdated = useCallback(
    (data: { ticketId: string; updates: Partial<Ticket> }) => {
      dispatch({ type: "UPDATE_TICKET", payload: data });
    },
    []
  );

  const clearCurrentTicket = useCallback(() => {
    dispatch({ type: "CLEAR_CURRENT_TICKET" });
  }, []);

  return {
    // State
    tickets: state.tickets,
    currentTicket: state.currentTicket,
    isLoading: state.isLoading,
    error: state.error,
    isLoadingTicket: state.isLoadingTicket,
    ticketError: state.ticketError,

    // Actions
    fetchTickets,
    fetchTicket,
    sendMessage,
    updateTicketStatus,
    clearCurrentTicket,

    // Socket handlers
    handleSocketMessage,
    handleNewTicket,
    handleTicketUpdated,
  };
};
