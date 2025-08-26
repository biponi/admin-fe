import React, { useState } from "react";
import {
  Check,
  X,
  Truck,
  CheckCircle,
  Clock,
  Trash2,
  Settings,
  AlertTriangle,
  FileText
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../components/ui/sheet";
import { cn } from "../../../utils/functions";
import useRoleCheck from "../../auth/hooks/useRoleCheck";

interface MobileBulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onBulkAction: (action: string) => void;
  onGenerateInvoices?: () => void;
  isVisible: boolean;
}

const MobileBulkActions: React.FC<MobileBulkActionsProps> = ({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  onBulkAction,
  onGenerateInvoices,
  isVisible
}) => {
  const { hasRequiredPermission } = useRoleCheck();
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  if (!isVisible) return null;

  const bulkActions = [
    {
      key: "shipped",
      label: "Mark as Shipped",
      icon: Truck,
      color: "bg-purple-600 hover:bg-purple-700",
      permission: "edit"
    },
    {
      key: "complete",
      label: "Mark as Complete",
      icon: CheckCircle,
      color: "bg-green-600 hover:bg-green-700",
      permission: "edit"
    },
    {
      key: "processing",
      label: "Reset to Processing",
      icon: Clock,
      color: "bg-blue-600 hover:bg-blue-700",
      permission: "edit"
    },
    {
      key: "cancel",
      label: "Cancel Orders",
      icon: X,
      color: "bg-orange-600 hover:bg-orange-700",
      permission: "edit",
      danger: true
    },
    {
      key: "delete",
      label: "Delete Orders",
      icon: Trash2,
      color: "bg-red-600 hover:bg-red-700",
      permission: "delete",
      danger: true
    }
  ];

  const documentActions = [
    {
      key: "invoices",
      label: "Generate Invoices",
      icon: FileText,
      color: "bg-indigo-600 hover:bg-indigo-700",
      action: onGenerateInvoices
    }
  ];

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 sm:hidden">
      {/* Selection Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg backdrop-blur-lg bg-white/95 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {selectedCount} Selected
              </p>
              <p className="text-xs text-gray-600">
                {selectedCount} of {totalCount} orders
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
              className="h-8 px-3 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              {selectedCount === totalCount ? (
                <>
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </>
              ) : (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  All
                </>
              )}
            </Button>
            
            <Sheet open={isActionsOpen} onOpenChange={setIsActionsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 rounded-lg"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Actions
                </Button>
              </SheetTrigger>
              
              <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
                <SheetHeader className="text-left pb-6">
                  <SheetTitle className="flex items-center gap-2 text-xl">
                    <Settings className="h-5 w-5" />
                    Bulk Actions
                    <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-0">
                      {selectedCount} orders
                    </Badge>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="space-y-6">
                  {/* Document Actions */}
                  {hasRequiredPermission("order", "documents") && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Generate Documents
                      </h3>
                      <div className="space-y-2">
                        {documentActions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <Button
                              key={action.key}
                              onClick={() => {
                                action.action?.();
                                setIsActionsOpen(false);
                              }}
                              className={cn(
                                "w-full justify-start gap-3 h-12 text-left rounded-xl",
                                action.color,
                                "text-white"
                              )}
                            >
                              <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="font-medium">{action.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Status Change Actions */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Change Status
                    </h3>
                    <div className="space-y-2">
                      {bulkActions
                        .filter(action => !action.danger && hasRequiredPermission("order", action.permission))
                        .map((action) => {
                          const Icon = action.icon;
                          return (
                            <Button
                              key={action.key}
                              onClick={() => {
                                onBulkAction(action.key);
                                setIsActionsOpen(false);
                              }}
                              className={cn(
                                "w-full justify-start gap-3 h-12 text-left rounded-xl",
                                action.color,
                                "text-white"
                              )}
                            >
                              <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="font-medium">{action.label}</span>
                            </Button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div>
                    <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Danger Zone
                    </h3>
                    <div className="space-y-2">
                      {bulkActions
                        .filter(action => action.danger && hasRequiredPermission("order", action.permission))
                        .map((action) => {
                          const Icon = action.icon;
                          return (
                            <Button
                              key={action.key}
                              onClick={() => {
                                onBulkAction(action.key);
                                setIsActionsOpen(false);
                              }}
                              variant="outline"
                              className={cn(
                                "w-full justify-start gap-3 h-12 text-left rounded-xl",
                                "border-red-200 text-red-700 hover:bg-red-50"
                              )}
                            >
                              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <Icon className="h-4 w-4 text-red-600" />
                              </div>
                              <span className="font-medium">{action.label}</span>
                            </Button>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsActionsOpen(false)}
                    className="w-full h-12 rounded-2xl"
                  >
                    Close
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
              style={{ width: `${(selectedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileBulkActions;