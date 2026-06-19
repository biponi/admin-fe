import React from "react";
import { Search, Zap } from "lucide-react";
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
    <div className='space-y-3'>
      <div className='mb-2'>
        <div className='bg-gradient-to-r from-fuchsia-600 to-pink-600 p-4 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center'>
              <Zap className='h-5 w-5 text-gray-600' />
            </div>
            <div className='flex-1'>
              <h3 className='font-semibold text-white'>Campaign Management</h3>
              <p className='text-xs text-white'>
                Organize and manage campaigns
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Search Input - Full width on mobile */}
      <div className='relative mx-2'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
        <Input
          type='text'
          placeholder='Search campaigns...'
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className='w-full pl-10 h-11 bg-white border-gray-200 focus-visible:ring-primary/20'
        />
      </div>
    </div>
  );
};

export default MobileCampaignHeader;
