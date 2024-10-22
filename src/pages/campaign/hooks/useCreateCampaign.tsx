import { useState } from "react";
import axiosInstance from "../../../api/axios";
import config from "../../../utils/config";
import toast from "react-hot-toast";

export const useCreateCampaign = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const createCampaign = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(
        config.campaign.createCampaign(),
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setSuccess(true);
      toast.success("Campaign Created Successfully");
      return response.data;
    } catch (error) {
      toast.error("Failed to create campaign");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async (formData: FormData, id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.put(
        config.campaign.editCampaign(id),
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setSuccess(true);
      return response.data;
    } catch (error) {
      setError("Failed to update campaign");
      toast.error("Failed to update Campaign");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCampaignById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        config.campaign.getCampaignById(id)
      );
      setSuccess(true);
      return response.data?.data;
    } catch (error) {
      toast.error("Failed to fetch campaign");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCampaign,
    updateCampaign,
    getCampaignById,
    loading,
    error,
    success,
  };
};
