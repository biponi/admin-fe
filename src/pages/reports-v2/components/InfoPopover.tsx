import React from "react";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface InfoPopoverProps {
  title: string;
  description: string;
  formula?: string;
  dataFreshness?: string;
  className?: string;
}

const InfoPopover: React.FC<InfoPopoverProps> = ({
  title,
  description,
  formula,
  dataFreshness,
  className,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          className={`inline-flex shadow-sm  p-1  border border-gray-100 items-center justify-center h-8 w-8 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer ${className || ""}`}>
          <Info className='h-5 w-5 text-gray-600' />
        </button>
      </PopoverTrigger>
      <PopoverContent align='start' sideOffset={4} className='w-80 p-0'>
        <div className='border-b border-slate-100 px-4 py-3'>
          <h4 className='text-sm font-semibold text-slate-900'>{title}</h4>
        </div>
        <div className='px-4 py-3 space-y-3'>
          <p className='text-xs text-slate-600 leading-relaxed'>
            {description}
          </p>
          {formula && (
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
              <p className='text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1'>
                How it's calculated
              </p>
              <p className='text-xs text-slate-700 font-mono leading-relaxed'>
                {formula}
              </p>
            </div>
          )}
          {dataFreshness && (
            <div className='flex items-center gap-1.5 text-[10px] text-slate-400'>
              <div className='h-1.5 w-1.5 rounded-full bg-amber-400' />
              {dataFreshness}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default InfoPopover;
