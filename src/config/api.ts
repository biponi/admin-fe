export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";
export const CHAT_API_BASE_URL = "https://yuki.priorbd.com";
export const SOCKET_URL = "https://yuki.priorbd.com";

export const API_ENDPOINTS = {
  // Tickets
  TICKETS: "/api/tickets",
  TICKET_BY_ID: "/api/tickets",
  TICKET_STATUS: "/api/tickets/:id/status",
  TICKET_ASSIGN: "/api/tickets/:id/assign",
  TICKET_MESSAGES: "/api/tickets/:id/messages",
  TICKET_PRIORITY: "/api/tickets/:id/priority",
  TICKET_SEARCH: "/api/tickets/search",
  TICKET_STATS: "/api/tickets/stats/overview",

  // Agents
  AGENTS: "/api/agents",
  AGENT_BY_ID: "/api/agents",
  AGENT_STATUS: "/api/agents/:id/status",
  AGENT_TICKETS: "/api/agents/:id/tickets",
  AGENT_NOTIFICATIONS: "/api/agents/:id/notifications",
  AGENT_METRICS: "/api/agents/:id/metrics",
  AVAILABLE_AGENTS: "/api/agents/available/for-assignment",

  // Dashboard
  DASHBOARD_STATS: "/api/dashboard/stats",
  DASHBOARD_AGENTS: "/api/dashboard/agents",

  // Health
  HEALTH: "/health",
} as const;

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: "connect",
  DISCONNECT: "disconnect",

  // Agent events
  AUTHENTICATE: "authenticate",
  AUTH_SUCCESS: "auth_success",
  AUTH_ERROR: "auth_error",
  UPDATE_STATUS: "update_status",
  STATUS_UPDATED: "status_updated",
  ASSIGN_TICKET: "assign_ticket",
  TICKET_ASSIGNED_SUCCESS: "ticket_assigned_success",
  TRANSFER_TICKET: "transfer_ticket",
  TICKET_TRANSFER_SUCCESS: "ticket_transfer_success",
  TICKET_TRANSFERRED_TO_YOU: "ticket_transferred_to_you",
  TICKET_TRANSFERRED_AWAY: "ticket_transferred_away",
  CLOSE_TICKET: "close_ticket",
  TICKET_CLOSED_SUCCESS: "ticket_closed_success",
  SET_AWAY: "set_away",
  SET_AVAILABLE: "set_available",
  JOIN_DEPARTMENT: "join_department",
  LEAVE_DEPARTMENT: "leave_department",
  JOINED_DEPARTMENT: "joined_department",
  LEFT_DEPARTMENT: "left_department",

  // Message events
  SEND_MESSAGE: "send_message",
  MESSAGE_SENT: "message_sent",
  CUSTOMER_MESSAGE: "customer_message",
  AGENT_MESSAGE: "agent_message",
  FILE_SENT: "file_sent",
  CUSTOMER_FILE: "customer_file",

  // Ticket events
  NEW_TICKET: "new_ticket",
  UPDATE_TICKET_STATUS: "update_ticket_status",
  TICKET_UPDATED: "ticket_updated",
  GET_TICKET_DETAILS: "get_ticket_details",
  TICKET_DETAILS: "ticket_details",
  TICKET_ASSIGNED: "ticket_assigned",
  TICKET_TRANSFERRED: "ticket_transferred",
  TICKET_CLOSED: "ticket_closed",
  AGENT_REQUESTED: "agent_requested",
  AGENT_REQUEST_SENT: "agent_request_sent",
  AGENT_ALREADY_ASSIGNED: "agent_already_assigned",

  // Customer events
  CUSTOMER_CONNECT: "customer_connect",
  CONNECTION_ESTABLISHED: "connection_established",
  CUSTOMER_RECONNECTED: "customer_reconnected",
  CONVERSATION_RECONNECTED: "conversation_reconnected",
  NO_ACTIVE_CONVERSATION: "no_active_conversation",
  REQUEST_AGENT: "request_agent",
  END_CONVERSATION: "end_conversation",
  CONVERSATION_ENDED: "conversation_ended",
  CUSTOMER_ENDED_CONVERSATION: "customer_ended_conversation",

  // Typing events
  TYPING: "typing",
  CUSTOMER_TYPING: "customer_typing",
  AGENT_TYPING: "agent_typing",

  // Notification events
  NOTIFICATION: "notification",
  NOTIFICATION_READ: "notification_read",
  NOTIFICATIONS_READ_ALL: "notifications_read_all",
  NOTIFICATIONS_MARKED_READ: "notifications_marked_read",

  // Status changes
  AGENT_STATUS_CHANGE: "agent_status_change",
  CUSTOMER_DISCONNECTED: "customer_disconnected",

  // Errors
  ERROR: "error",
} as const;
