import axios from "axios";
import {
  EmailCampaign,
  EmailCampaignResponse,
  CampaignListResponse,
  CampaignQueryParams,
  CreateEmailCampaignRequest,
  ApiResponse,
  QueueStats,
  FailedJob,
  JobStatus,
} from "../pages/bulk-communication/interface";

const BASE_URL = process.env.REACT_APP_API_URL || "";

// Create Bulk Email Campaign
export const createBulkEmailCampaign = async (
  data: CreateEmailCampaignRequest,
): Promise<ApiResponse<EmailCampaignResponse>> => {
  try {
    const response = await axios.post(`${BASE_URL}/bulk-email/campaign`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to create email campaign",
      errors: error.response?.data?.errors,
    };
  }
};

// Get Bulk Email Campaign by ID
export const getBulkEmailCampaign = async (
  campaignId: string,
): Promise<ApiResponse<EmailCampaign>> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/bulk-email/campaign/${campaignId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch email campaign",
      errors: error.response?.data?.errors,
    };
  }
};

// Get User's Bulk Email Campaigns
export const getBulkEmailCampaigns = async (
  params?: CampaignQueryParams,
): Promise<ApiResponse<CampaignListResponse<EmailCampaign>>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await axios.get(
      `${BASE_URL}/bulk-email/campaigns?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch email campaigns",
      errors: error.response?.data?.errors,
    };
  }
};

// Cancel Bulk Email Campaign
export const cancelBulkEmailCampaign = async (
  campaignId: string,
): Promise<ApiResponse<{ campaignId: string; status: string }>> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/bulk-email/campaign/${campaignId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to cancel email campaign",
      errors: error.response?.data?.errors,
    };
  }
};

// Delete Bulk Email Campaign
export const deleteBulkEmailCampaign = async (
  campaignId: string,
): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/bulk-email/campaign/${campaignId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to delete email campaign",
      errors: error.response?.data?.errors,
    };
  }
};

// Get Queue Statistics
export const getEmailQueueStats = async (): Promise<
  ApiResponse<QueueStats>
> => {
  try {
    const response = await axios.get(`${BASE_URL}/bulk-email/queue/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch queue stats",
      errors: error.response?.data?.errors,
    };
  }
};

// Get Failed Jobs
export const getEmailFailedJobs = async (
  start: number = 0,
  end: number = 10,
): Promise<ApiResponse<FailedJob[]>> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/bulk-email/queue/failed?start=${start}&end=${end}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch failed jobs",
      errors: error.response?.data?.errors,
    };
  }
};

// Retry Failed Job
export const retryEmailJob = async (
  jobId: string,
): Promise<ApiResponse<{ success: boolean; jobId: string }>> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/bulk-email/queue/${jobId}/retry`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to retry job",
      errors: error.response?.data?.errors,
    };
  }
};

// Get Job Status
export const getEmailJobStatus = async (
  jobId: string,
): Promise<ApiResponse<JobStatus>> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/bulk-email/queue/job/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch job status",
      errors: error.response?.data?.errors,
    };
  }
};
