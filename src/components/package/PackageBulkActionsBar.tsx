import { CheckCircle, XCircle, Ship, Package, X, Eye, Printer, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface PackageBulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  isAllSelected?: boolean;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onMarkPacked: () => void;
  onRequestShipping: () => void;
  onPrintSlips: () => void;
  onViewSelected: () => void;
  progress?: {
    inProgress: boolean;
    completed: number;
    failed: number;
    total: number;
    errors: Array<{ id: string; error: string }>;
  } | null;
  className?: string;
}

export function PackageBulkActionsBar({
  selectedCount,
  totalCount,
  isAllSelected = false,
  onClearSelection,
  onSelectAll,
  onMarkPacked,
  onRequestShipping,
  onPrintSlips,
  onViewSelected,
  progress,
  className,
}: PackageBulkActionsBarProps) {
  const progressPercentage = progress
    ? Math.round(((progress.completed + progress.failed) / progress.total) * 100)
    : 0;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-2xl md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[600px] md:max-w-3xl md:rounded-lg md:border ${className}`}
    >
      {/* Progress Bar */}
      {progress?.inProgress && (
        <div className="absolute top-0 left-0 right-0">
          <Progress value={progressPercentage} className="h-1 rounded-none md:rounded-t-lg" />
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-base font-semibold">
                {selectedCount}
              </Badge>
              <p className="text-sm font-medium text-gray-700">
                {selectedCount === 1 ? "package" : "packages"} selected
              </p>
            </div>
            {!isAllSelected && totalCount > selectedCount && (
              <button
                onClick={onSelectAll}
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline ml-2"
              >
                Select all {totalCount}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewSelected}
              className="h-8 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
              disabled={progress?.inProgress}
            >
              <Eye className="h-4 w-4 mr-1.5 text-blue-600" />
              <span className="text-blue-600 font-medium hidden sm:inline">View List</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8 w-8 p-0"
              disabled={progress?.inProgress}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Info */}
        {progress?.inProgress && (
          <div className="flex items-center gap-4 px-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">
                Processing {progress.completed + progress.failed} of {progress.total}...
              </p>
              {progress.failed > 0 && (
                <p className="text-xs text-red-600">{progress.failed} failed</p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {!progress?.inProgress && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Mark as Packed */}
            <Button variant="default" size="sm" onClick={onMarkPacked} className="h-9 bg-purple-600 hover:bg-purple-700">
              <Package className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Mark as Packed</span>
              <span className="sm:hidden">Packed</span>
            </Button>

            {/* Request Shipping */}
            <Button variant="default" size="sm" onClick={onRequestShipping} className="h-9 bg-blue-600 hover:bg-blue-700">
              <Ship className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Request Shipping</span>
              <span className="sm:hidden">Ship</span>
            </Button>

            {/* Print Slips */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Printer className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Print</span>
                  <span className="sm:hidden">Print</span>
                  <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={onPrintSlips}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Packing Slips
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Error Summary */}
        {progress && progress.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-800">
                  {progress.errors.length} {progress.errors.length === 1 ? "error" : "errors"} occurred
                </p>
                <div className="mt-1 max-h-20 overflow-y-auto">
                  {progress.errors.slice(0, 3).map((error, idx) => (
                    <p key={idx} className="text-xs text-red-700 truncate">
                      • {error.error}
                    </p>
                  ))}
                  {progress.errors.length > 3 && (
                    <p className="text-xs text-red-700">...and {progress.errors.length - 3} more</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
