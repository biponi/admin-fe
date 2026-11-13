/**
 * Export dropdown — existing download logic, claude-themed chrome.
 */
import { Download, FileText, FileType } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { claude } from "../../../../lib/claude";
import { cn } from "../../../../lib/utils";

export interface ExportOption {
  name: string;
  format: string;
  variant: string;
  download: () => Promise<any>;
}

export const ExportMenu = ({
  options,
  disabled,
  isDownloading,
}: {
  options: ExportOption[];
  disabled?: boolean;
  isDownloading?: boolean;
}) => {
  const pdfOptions = options.filter((o) => o.format === "PDF");
  const csvOptions = options.filter((o) => o.format === "CSV");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          disabled={disabled}
          className={cn(
            claude.btnOutline,
            "inline-flex items-center gap-2 px-3.5 py-2 disabled:opacity-50",
          )}>
          {isDownloading ? (
            <span className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#D8D3C8] border-t-[#D97757]' />
          ) : (
            <Download className='h-3.5 w-3.5' />
          )}
          Export report
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='w-52 rounded-xl border-[#E8E4DC]'>
        <DropdownMenuLabel className='text-xs text-[#8A877D] font-medium'>
          Product reports
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuLabel className='text-xs text-[#8A877D]'>
          PDF format
        </DropdownMenuLabel>
        {pdfOptions.map((option) => (
          <DropdownMenuItem
            key={option.name}
            onClick={option.download}
            className='rounded-lg'>
            <FileText className='mr-2 h-4 w-4 text-[#8A877D]' />
            {option.variant}
            <span className='ml-auto text-xs text-[#8A877D]'>All items</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className='text-xs text-[#8A877D]'>
          CSV format
        </DropdownMenuLabel>
        {csvOptions.map((option) => (
          <DropdownMenuItem
            key={option.name}
            onClick={option.download}
            className='rounded-lg'>
            <FileType className='mr-2 h-4 w-4 text-[#8A877D]' />
            {option.variant}
            <span className='ml-auto text-xs text-[#8A877D]'>All items</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;
