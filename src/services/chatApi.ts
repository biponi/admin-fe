import { CHAT_API_BASE_URL } from '../config/api';

export interface Message {
  _id: string;
  content: string;
  sender: 'customer' | 'agent' | 'system';
  senderId?: string;
  timestamp: string;
  read: boolean;
  messageType?: 'text' | 'file' | 'image' | 'system_notification';
  metadata?: any;
}

export interface Ticket {
  _id: string;
  ticketId: string;
  customerId: string;
  customerSocketId?: string;
  status: 'open' | 'assigned' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedAgent?: string;
  department: string;
  subject: string;
  customerInfo: {
    name?: string;
    email?: string;
    phone?: string;
    connectedAt: string;
    lastSeen: string;
    userAgent?: string;
    ipAddress?: string;
  };
  agentInfo?: {
    name: string;
    department: string;
    assignedAt: string;
  };
  messages: Message[];
  tags: string[];
  metadata: {
    source: 'web' | 'mobile' | 'api';
    category?: string;
    subcategory?: string;
    escalated: boolean;
    escalatedAt?: string;
    escalatedBy?: string;
    rating?: number;
    feedback?: string;
  };
  resolutionInfo?: {
    resolvedAt?: string;
    resolvedBy?: string;
    resolutionNotes?: string;
    resolutionTime?: number;
  };
  closedAt?: string;
  closedBy?: string;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  unreadCount?: number;
  lastMessage?: Message;
  messageCount?: number;
  duration?: number;
}

export interface Agent {
  _id: string;
  agentId: string;
  name: string;
  email: string;
  department: string;
  role: 'agent' | 'supervisor' | 'admin';
  status: 'available' | 'busy' | 'away' | 'offline';
  skills: string[];
  languages: string[];
  maxConcurrentTickets: number;
  isActive: boolean;
  lastLoginAt?: string;
  lastLogoutAt?: string;
  currentSocketId?: string;
  metrics: {
    totalTicketsHandled: number;
    avgResponseTime: number;
    avgResolutionTime: number;
    customerSatisfactionRating: number;
    totalRatings: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  type: 'new_ticket' | 'ticket_assigned' | 'new_message' | 'ticket_status_change' | 'customer_disconnect' | 'agent_offline' | 'priority_escalation';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  relatedData: {
    ticketId?: string;
    customerId?: string;
    agentId?: string;
    messageId?: string;
  };
  isActive: boolean;
  createdAt: string;
  recipients: {
    agents: Array<{
      agentId: string;
      read: boolean;
      readAt?: string;
    }>;
  };
}

export interface TicketFilters {
  status?: string;
  agentId?: string;
  customerId?: string;
  priority?: string;
  department?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[];
  } & {
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    statistics?: any;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

class ChatApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = CHAT_API_BASE_URL || 'http://localhost:5000';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Ticket APIs
  async getTickets(filters: TicketFilters = {}): Promise<PaginatedResponse<Ticket>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<PaginatedResponse<Ticket>>(endpoint);
  }

  async getTicket(ticketId: string): Promise<ApiResponse<{ ticket: Ticket }>> {
    return this.request<ApiResponse<{ ticket: Ticket }>>(`/api/tickets/${ticketId}`);
  }

  async createTicket(ticketData: {
    customerId: string;
    customerInfo?: any;
    subject?: string;
    department?: string;
    priority?: string;
    initialMessage?: string;
    metadata?: any;
  }): Promise<ApiResponse<{ ticket: Ticket }>> {
    return this.request<ApiResponse<{ ticket: Ticket }>>('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async updateTicketStatus(ticketId: string, data: {
    status: string;
    agentId?: string;
    notes?: string;
  }): Promise<ApiResponse<{ ticket: { ticketId: string; status: string; updatedAt: string } }>> {
    return this.request<ApiResponse<{ ticket: { ticketId: string; status: string; updatedAt: string } }>>(`/api/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async assignTicket(ticketId: string, agentId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/tickets/${ticketId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ agentId }),
    });
  }

  async addMessage(ticketId: string, data: {
    content: string;
    sender: string;
    senderId?: string;
    messageType?: string;
    metadata?: any;
  }): Promise<ApiResponse<{ message: Message }>> {
    return this.request<ApiResponse<{ message: Message }>>(`/api/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markMessagesAsRead(ticketId: string, sender = 'customer'): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/tickets/${ticketId}/messages/read`, {
      method: 'PATCH',
      body: JSON.stringify({ sender }),
    });
  }

  async updateTicketPriority(ticketId: string, data: {
    priority: string;
    agentId?: string;
  }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/tickets/${ticketId}/priority`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async searchTickets(query: string, options: {
    limit?: number;
    page?: number;
  } = {}): Promise<ApiResponse<{ tickets: Ticket[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    if (options.limit) queryParams.append('limit', options.limit.toString());
    if (options.page) queryParams.append('page', options.page.toString());
    
    const endpoint = `/api/tickets/search/${encodeURIComponent(query)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<ApiResponse<{ tickets: Ticket[]; pagination: any }>>(endpoint);
  }

  async getTicketStats(filters: {
    department?: string;
    agentId?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/tickets/stats/overview${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<ApiResponse<any>>(endpoint);
  }

  // Agent APIs
  async getAgents(filters: {
    department?: string;
    status?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<PaginatedResponse<Agent>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/agents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<PaginatedResponse<Agent>>(endpoint);
  }

  async getAgent(agentId: string): Promise<ApiResponse<{ agent: Agent; activeTickets: Ticket[]; recentTickets: Ticket[]; activeTicketsCount: number }>> {
    return this.request<ApiResponse<{ agent: Agent; activeTickets: Ticket[]; recentTickets: Ticket[]; activeTicketsCount: number }>>(`/api/agents/${agentId}`);
  }

  async updateAgentStatus(agentId: string, status: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/agents/${agentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getAgentTickets(agentId: string, filters: {
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<PaginatedResponse<Ticket>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/agents/${agentId}/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<PaginatedResponse<Ticket>>(endpoint);
  }

  async getAgentNotifications(agentId: string, unreadOnly = false, limit = 50): Promise<ApiResponse<{ notifications: Notification[] }>> {
    const queryParams = new URLSearchParams();
    queryParams.append('unreadOnly', unreadOnly.toString());
    queryParams.append('limit', limit.toString());

    const endpoint = `/api/agents/${agentId}/notifications?${queryParams.toString()}`;
    return this.request<ApiResponse<{ notifications: Notification[] }>>(endpoint);
  }

  async markNotificationAsRead(agentId: string, notificationId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/agents/${agentId}/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async getAvailableAgents(filters: {
    department?: string;
    skills?: string[];
  } = {}): Promise<ApiResponse<{ availableAgents: any[]; totalAvailable: number }>> {
    const queryParams = new URLSearchParams();
    
    if (filters.department) {
      queryParams.append('department', filters.department);
    }
    
    if (filters.skills && filters.skills.length > 0) {
      filters.skills.forEach(skill => queryParams.append('skills', skill));
    }

    const endpoint = `/api/agents/available/for-assignment${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<ApiResponse<{ availableAgents: any[]; totalAvailable: number }>>(endpoint);
  }

  // Dashboard APIs
  async getDashboardStats(): Promise<any> {
    return this.request<any>('/api/dashboard/stats');
  }

  async getOnlineAgents(): Promise<any> {
    return this.request<any>('/api/dashboard/agents');
  }
}

export const chatApi = new ChatApiService();
export default chatApi;