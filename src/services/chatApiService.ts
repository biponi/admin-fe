import axios, { AxiosResponse } from 'axios';
import { CHAT_API_BASE_URL } from '../config/api';

// Types compatible with backend
export interface Message {
  _id: string;
  content: string;
  sender: 'customer' | 'agent';
  senderId: string;
  messageType: 'text' | 'image' | 'file';
  timestamp: Date;
  read: boolean;
}

export interface Ticket {
  _id: string;
  ticketId: string;
  customerId: string;
  customerInfo: {
    name: string;
    email?: string;
    phone?: string;
  };
  subject: string;
  status: 'open' | 'assigned' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  department: string;
  assignedAgent?: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  // Local computed fields
  unreadCount?: number;
  lastMessage?: string;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  department?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

class ChatApiService {
  private apiClient;

  constructor() {
    this.apiClient = axios.create({
      baseURL: CHAT_API_BASE_URL || 'http://localhost:5000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['x-access-token'] = token;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error('Chat API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Authentication APIs
  async verifyToken(): Promise<ApiResponse<any>> {
    const response = await this.apiClient.post('/api/auth/verify-token');
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    const response = await this.apiClient.get('/api/auth/me');
    return response.data;
  }

  // Ticket APIs
  async getTickets(filters: TicketFilters = {}): Promise<ApiResponse<{ tickets: Ticket[] }>> {
    const response = await this.apiClient.get('/api/tickets', { params: filters });
    return response.data;
  }

  async getTicket(ticketId: string): Promise<ApiResponse<{ ticket: Ticket }>> {
    const response = await this.apiClient.get(`/api/tickets/${ticketId}`);
    return response.data;
  }

  async updateTicketStatus(ticketId: string, status: string): Promise<ApiResponse<{ ticket: Ticket }>> {
    const response = await this.apiClient.patch(`/api/tickets/${ticketId}/status`, { status });
    return response.data;
  }

  async assignTicket(ticketId: string, agentId: string): Promise<ApiResponse<{ ticket: Ticket }>> {
    const response = await this.apiClient.patch(`/api/tickets/${ticketId}/assign`, { agentId });
    return response.data;
  }

  async sendMessage(ticketId: string, content: string, senderId: string): Promise<ApiResponse<{ message: Message }>> {
    const response = await this.apiClient.post(`/api/tickets/${ticketId}/messages`, {
      content,
      sender: 'agent',
      senderId,
      messageType: 'text',
    });
    return response.data;
  }

  // Dashboard APIs
  async getDashboardStats(): Promise<ApiResponse<any>> {
    const response = await this.apiClient.get('/api/dashboard/stats');
    return response.data;
  }

  async getNotificationsSummary(): Promise<ApiResponse<any>> {
    const response = await this.apiClient.get('/api/dashboard/notifications/summary');
    return response.data;
  }
}

export const chatApiService = new ChatApiService();
export default chatApiService;