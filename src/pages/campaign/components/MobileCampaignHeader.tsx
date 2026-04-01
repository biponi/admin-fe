import React from "react";
import { Search } from "lucide-react";
import { Input } from "../../../components/ui/input";

interface Props {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const MobileCampaignHeader: React.FC<Props> = ({
  searchValue,
  onSearchChange,
}) => {
  return (
    <div className="space-y-3">
      {/* Search Input - Full width on mobile */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search campaigns..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 h-11 bg-white border-gray-200 focus-visible:ring-primary/20"
        />
      </div>
    </div>
  );
};

export default MobileCampaignHeader;
