import { useState, useCallback } from 'react';
import { useToast } from '../../../components/ui/use-toast';
import {
  SMSCampaign,
  EmailCampaign,
  CampaignQueryParams,
  QueueStats,
  FailedJob,
  BulkMessageType,
} from '../interface';
import * as bulkSMSAPI from '../../../api/bulkSMS';
import * as bulkEmailAPI from '../../../api/bulkEmail';

export const useBulkCommunication = (type: BulkMessageType) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<(SMSCampaign | EmailCampaign)[] | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<SMSCampaign | EmailCampaign | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [failedJobs, setFailedJobs] = useState<FailedJob[] | null>(null);

  // Fetch campaigns list
  const fetchCampaigns = useCallback(async (params?: CampaignQueryParams) => {
    setLoading(true);

    const response = type === 'sms'
      ? await bulkSMSAPI.getBulkSMSCampaigns(params)
      : await bulkEmailAPI.getBulkEmailCampaigns(params);

    if (response?.success && response?.data) {
      setCampaigns(response.data.campaigns);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response?.message || 'Failed to fetch campaigns',
      });
    }
    setLoading(false);
  }, [type, toast]);

  // Fetch single campaign
  const fetchCampaign = useCallback(async (campaignId: string) => {
    setLoading(true);
    const response = type === 'sms'
      ? await bulkSMSAPI.getBulkSMSCampaign(campaignId)
      : await bulkEmailAPI.getBulkEmailCampaign(campaignId);

    if (response?.success && response?.data) {
      setSelectedCampaign(response.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response?.message || 'Failed to fetch campaign',
      });
    }
    setLoading(false);
  }, [type, toast]);

  // Create campaign
  const createCampaign = useCallback(async (data: any): Promise<string | null> => {
    setLoading(true);
    const response = type === 'sms'
      ? await bulkSMSAPI.createBulkSMSCampaign(data)
      : await bulkEmailAPI.createBulkEmailCampaign(data);

    setLoading(false);

    if (response?.success && response?.data) {
      toast({
        title: 'Success',
        description: `${type === 'sms' ? 'SMS' : 'Email'} campaign created successfully`,
      });
      return response.data.campaignId;
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response?.message || `Failed to create ${type} campaign`,
      });
      return null;
    }
  }, [type, toast]);

  // Cancel campaign
  const cancelCampaign = useCallback(async (campaignId: string) => {
    const response = type === 'sms'
      ? await bulkSMSAPI.cancelBulkSMSCampaign(campaignId)
      : await bulkEmailAPI.cancelBulkEmailCampaign(campaignId);

    if (response?.success) {
      toast({
        title: 'Success',
        description: 'Campaign cancelled successfully',
      });
      // Refresh campaigns list and selected campaign
      fetchCampaigns();
      if (selectedCampaign?.id === campaignId) {
        fetchCampaign(campaignId);
      }
      return true;
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response?.message || 'Failed to cancel campaign',
      });
      return false;
    }
  }, [type, selectedCampaign, fetchCampaigns, fetchCampaign, toast]);

  // Delete campaign
  const deleteCampaign = useCallback(async (campaignId: string) => {
    const response = type === 'sms'
      ? await bulkSMSAPI.deleteBulkSMSCampaign(campaignId)
      : await bulkEmailAPI.deleteBulkEmailCampaign(campaignId);

    if (response?.success) {
      toast({
        title: 'Success',
        description: 'Campaign deleted successfully',
      });
      // Refresh campaigns list
      fetchCampaigns();
      return true;
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response?.message || 'Failed to delete campaign',
      });
      return false;
    }
  }, [type, fetchCampaigns, toast]);

  // Fetch queue statistics
  const fetchQueueStats = useCallback(async () => {
    const response = type === 'sms'
      ? await bulkSMSAPI.getSMSQueueStats()
      : await bulkEmailAPI.getEmailQueueStats();

    if (response?.success && response?.data) {
      setQueueStats(response.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response?.message || 'Failed to fetch queue statistics',
      });
    }
  }, [type, toast]);

  // Fetch failed jobs
  const fetchFailedJobs = useCallback(async (start = 0, end = 50) => {
    const response = type === 'sms'
      ? await bulkSMSAPI.getSMSFailedJobs(start, end)
      : await bulkEmailAPI.getEmailFailedJobs(start, end);

    if (response?.success && response?.data) {
      setFailedJobs(response.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response?.message || 'Failed to fetch failed jobs',
      });
    }
  }, [type, toast]);

  // Retry failed job
  const retryJob = useCallback(async (jobId: string) => {
    const response = type === 'sms'
      ? await bulkSMSAPI.retrySMSJob(jobId)
      : await bulkEmailAPI.retryEmailJob(jobId);

    if (response?.success) {
      toast({
        title: 'Success',
        description: 'Job retry queued successfully',
      });
      return true;
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response?.message || 'Failed to retry job',
      });
      return false;
    }
  }, [type, toast]);

  return {
    loading,
    campaigns,
    selectedCampaign,
    queueStats,
    failedJobs,
    fetchCampaigns,
    fetchCampaign,
    createCampaign,
    cancelCampaign,
    deleteCampaign,
    fetchQueueStats,
    fetchFailedJobs,
    retryJob,
    setSelectedCampaign,
  };
};
