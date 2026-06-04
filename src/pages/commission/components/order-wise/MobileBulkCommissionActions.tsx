import { useState } from "react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../../components/ui/sheet";
import { Progress } from "../../../../components/ui/progress";
import { Separator } from "../../../../components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  Download,
  Check,
  X,
  Clock,
  Pause,
  ChevronUp,
} from "lucide-react";
import { cn } from "../../../../lib/utils";

interface MobileBulkCommissionActionsProps {
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
}

export const MobileBulkCommissionActions: React.FC<
  MobileBulkCommissionActionsProps
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
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Selection Bar */}
      <div className="bg-background border-t shadow-lg rounded-t-xl">
        {/* Progress Section (when processing) */}
        {processing && (
          <div className="px-4 pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm font-medium">Processing...</span>
              <Badge variant="secondary">{progress}%</Badge>
              {errors > 0 && (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  {errors}
                </Badge>
              )}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Selection Bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold">
                {selectedCount} Order{selectedCount !== 1 ? "s" : ""} Selected
              </p>
              {!processing && (
                <p className="text-xs text-muted-foreground">
                  Tap to perform actions
                </p>
              )}
            </div>
          </div>

          {!processing ? (
            <>
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline" className="h-9">
                    Actions
                    <ChevronUp className="h-4 w-4 ml-1" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-xl">
                  <SheetHeader className="pb-4">
                    <SheetTitle>Bulk Actions</SheetTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedCount} order{selectedCount !== 1 ? "s" : ""}{" "}
                      selected
                    </p>
                  </SheetHeader>

                  <div className="space-y-4">
                    {/* Status Change Actions */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Change Status
                      </p>
                      <div className="space-y-2">
                        {onApprove && (
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                              onApprove();
                              setSheetOpen(false);
                            }}
                          >
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Approve Selected
                          </Button>
                        )}
                        {onMarkPaid && (
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                              onMarkPaid();
                              setSheetOpen(false);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            Mark as Paid
                          </Button>
                        )}
                        {onMarkUnpaid && (
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                              onMarkUnpaid();
                              setSheetOpen(false);
                            }}
                          >
                            <Clock className="h-4 w-4 mr-2 text-blue-600" />
                            Mark as Unpaid
                          </Button>
                        )}
                        {onHold && (
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                              onHold();
                              setSheetOpen(false);
                            }}
                          >
                            <Pause className="h-4 w-4 mr-2 text-orange-600" />
                            Place on Hold
                          </Button>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Document Actions */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Actions
                      </p>
                      {onExport && (
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            onExport();
                            setSheetOpen(false);
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Commissions
                        </Button>
                      )}
                      {onCancel && (
                        <Button
                          variant="outline"
                          className="w-full justify-start text-destructive hover:text-destructive"
                          onClick={() => {
                            onCancel();
                            setSheetOpen(false);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Commissions
                        </Button>
                      )}
                    </div>

                    <Separator />

                    {/* Clear Selection */}
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        onClearSelection();
                        setSheetOpen(false);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Selection
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Button
                size="sm"
                variant="ghost"
                onClick={onClearSelection}
                className="h-9 px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              className="h-9 px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
