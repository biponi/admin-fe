import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Progress } from "../../../../components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  Download,
  Check,
  X,
  Eye,
  Clock,
  Pause,
} from "lucide-react";
import { cn } from "../../../../lib/utils";

interface BulkCommissionActionsBarProps {
  selectedCount: number;
  processing?: boolean;
  progress?: number;
  errors?: number;
  onApprove?: () => void;
  onMarkPaid?: () => void;
  onMarkUnpaid?: () => void;
  onHold?: () => void;
  onExport?: () => void;
  onCancel?: () => void;
  onClearSelection: () => void;
  onViewProcessing?: () => void;
}

export const BulkCommissionActionsBar: React.FC<
  BulkCommissionActionsBarProps
> = ({
  selectedCount,
  processing = false,
  progress = 0,
  errors = 0,
  onApprove,
  onMarkPaid,
  onMarkUnpaid,
  onHold,
  onExport,
  onCancel,
  onClearSelection,
  onViewProcessing,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={cn(
          "bg-background border shadow-lg rounded-lg p-3",
          "flex items-center gap-3",
          "min-w-[400px] max-w-[90vw]",
          "animate-in slide-in-from-bottom-4"
        )}
      >
        {/* Selected Count Badge */}
        <Badge
          variant="secondary"
          className="bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold"
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          {selectedCount} Order{selectedCount !== 1 ? "s" : ""} Selected
        </Badge>

        {/* Progress Bar (when processing) */}
        {processing && (
          <div className="flex-1 min-w-[150px]">
            <div className="flex items-center gap-2 mb-1">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Processing... {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        {/* Error Badge */}
        {errors > 0 && (
          <Badge variant="destructive" className="px-2 py-1">
            <XCircle className="h-3 w-3 mr-1" />
            {errors} Error{errors !== 1 ? "s" : ""}
          </Badge>
        )}

        {/* Action Buttons */}
        {!processing && (
          <div className="flex items-center gap-2">
            {onApprove && (
              <Button
                size="sm"
                variant="outline"
                onClick={onApprove}
                className="h-9"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
            )}
            {onMarkPaid && (
              <Button
                size="sm"
                variant="outline"
                onClick={onMarkPaid}
                className="h-9"
              >
                <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                Mark Paid
              </Button>
            )}
            {onMarkUnpaid && (
              <Button
                size="sm"
                variant="outline"
                onClick={onMarkUnpaid}
                className="h-9"
              >
                <Clock className="h-4 w-4 mr-1 text-blue-600" />
                Mark Unpaid
              </Button>
            )}
            {onHold && (
              <Button
                size="sm"
                variant="outline"
                onClick={onHold}
                className="h-9"
              >
                <Pause className="h-4 w-4 mr-1 text-orange-600" />
                On Hold
              </Button>
            )}
            {onExport && (
              <Button
                size="sm"
                variant="outline"
                onClick={onExport}
                className="h-9"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            )}
            {onCancel && (
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                className="h-9"
              >
                <XCircle className="h-4 w-4 mr-1 text-red-600" />
                Cancel
              </Button>
            )}
          </div>
        )}

        {/* Clear Selection */}
        {!processing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            className="h-9 px-3"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}

        {/* View Processing (when processing) */}
        {processing && onViewProcessing && (
          <Button
            size="sm"
            variant="outline"
            onClick={onViewProcessing}
            className="h-9"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        )}
      </div>
    </div>
  );
};
