import { toast } from "react-hot-toast";
import axiosInstance from "../../../api/axios";
import config from "../../../utils/config";

const useCampaign = () => {
  const fetchCampaignList = async () => {
    try {
      const response = await axiosInstance.get(
        config.campaign.getAllCampaign()
      );
      if (response?.status === 200 && response?.data?.success) {
        return response?.data?.data ?? [];
      } else return [];
    } catch (error) {
      console.error(error);
      toast.error("Couldn't fetch the campaign list");
      return [];
    }
  };

  const deleteACampaign = async (id: string) => {
    try {
      const response = await axiosInstance.delete(
        config.campaign.deleteCampaign(id)
      );
      if (response?.status === 200) {
        return true;
      } else return false;
    } catch (error) {
      console.error(error);
      toast.error("Couldn't delete the campaign");
      return false;
    }
  };

  return {
    fetchCampaignList,
    deleteACampaign,
  };
};

export default useCampaign;
