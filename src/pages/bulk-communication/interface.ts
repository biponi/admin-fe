// Bulk Communication Types

export type CampaignStatus = 'draft' | 'queued' | 'processing' | 'completed' | 'cancelled' | 'failed';
export type JobState = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
export type BulkMessageType = 'sms' | 'email';

// Base Campaign Interface
export interface BaseCampaign {
  id: string;
  name: string;
  totalRecipients: number;
  status: CampaignStatus;
  scheduledFor?: string;
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  createdBy?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

// SMS Specific Types
export interface SMSRecipient {
  phoneNumber: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  jobId?: string;
  attempts: number;
  sentAt?: string;
  deliveredAt?: string;
  failedReason?: string;
}

export interface SMSCampaign extends BaseCampaign {
  message: string;
  recipients: SMSRecipient[];
  sentCount: number;
  failedCount: number;
  deliveredCount: number;
  successRate: number;
}

export interface CreateSMSCampaignRequest {
  name: string;
  message: string;
  recipients: string[];
  scheduledFor?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface SMSCampaignResponse {
  campaignId: string;
  name: string;
  message: string;
  totalRecipients: number;
  status: CampaignStatus;
  scheduledFor?: string;
  progress: number;
  createdAt: string;
}

// Email Specific Types
export interface EmailAttachment {
  filename: string;
  path: string;
  contentType: string;
}

export interface EmailRecipient {
  email: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'opened' | 'clicked';
  jobId?: string;
  messageId?: string;
  attempts: number;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  failedReason?: string;
}

export interface EmailCampaign extends BaseCampaign {
  subject: string;
  html: string;
  text?: string;
  recipients: EmailRecipient[];
  attachments?: EmailAttachment[];
  sentCount: number;
  failedCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  openRate: number;
  clickRate: number;
  successRate: number;
}

export interface CreateEmailCampaignRequest {
  name: string;
  subject: string;
  html: string;
  text?: string;
  recipients: string[];
  attachments?: EmailAttachment[];
  scheduledFor?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface EmailCampaignResponse {
  campaignId: string;
  name: string;
  subject: string;
  totalRecipients: number;
  status: CampaignStatus;
  scheduledFor?: string;
  progress: number;
  createdAt: string;
}

// Queue Management Types
export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  total: number;
}

export interface FailedJob {
  id: string;
  data: {
    phoneNumber?: string;
    email?: string;
    message?: string;
    campaignId?: string;
    campaignName?: string;
  };
  failedReason: string;
  attemptsMade: number;
  createdAt: string;
}

export interface JobStatus {
  id: string;
  name: string;
  data: any;
  progress: number;
  state: JobState;
  attemptsMade: number;
  failedReason?: string;
  processedOn?: string;
  finishedOn?: string;
  createdAt: string;
}

// Pagination
export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CampaignListResponse<T extends BaseCampaign> {
  campaigns: T[];
  pagination: PaginationMetadata;
}

// Query Parameters
export interface CampaignQueryParams {
  status?: CampaignStatus;
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Recipient Import Types
export interface RecipientImportResult {
  success: boolean;
  validRecipients: string[];
  invalidRecipients: string[];
  total: number;
  validCount: number;
  invalidCount: number;
}
