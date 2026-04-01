import React from "react";
import { Gift, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import useRoleCheck from "../../auth/hooks/useRoleCheck";

interface Props {
  searchValue: string;
  onCreateCampaign: () => void;
}

const MobileCampaignEmpty: React.FC<Props> = ({
  searchValue,
  onCreateCampaign,
}) => {
  const { hasRequiredPermission } = useRoleCheck();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Icon */}
      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4">
        <Gift className="h-10 w-10 text-purple-600" />
      </div>

      {/* Message */}
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {searchValue ? "No campaigns found" : "No campaigns yet"}
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          {searchValue
            ? "Try adjusting your search terms"
            : "Create your first campaign to offer special discounts to your customers"}
        </p>
      </div>

      {/* CTA Button */}
      {hasRequiredPermission("campaign", "create") && !searchValue && (
        <Button
          onClick={onCreateCampaign}
          className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-md">
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Campaign
        </Button>
      )}
    </div>
  );
};

export default MobileCampaignEmpty;
