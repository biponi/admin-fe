/**
 * BulkActionsBar Component
 * Floating action bar for bulk operations with progress tracking
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Download,
  Truck,
  X,
  Eye,
  Printer,
  ChevronDown,
  Package,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Dots } from '@/components/loading-ui/dots';
import { slideInFromBottom, fabVariants } from '../lib/animations';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import type { BulkActionProgress } from '../types';
import useRoleCheck from '../../auth/hooks/useRoleCheck';
import { selectionHasForeignOrders } from '../../../utils/orderPermission';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  isAllSelected?: boolean;
  /** Full selected order objects — required for own-only permission gating */
  selectedOrders?: Array<{ createdByUserId?: string | null }>;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onShipped: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onGenerateInvoices: () => void;
  onPrintInvoices?: () => void;
  onGeneratePackingSlips?: () => void;
  onPrintPackingSlips?: () => void;
  onViewSelectedOrders: () => void;
  progress?: BulkActionProgress | null;
  className?: string;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  totalCount,
  isAllSelected = false,
  selectedOrders = [],
  onClearSelection,
  onSelectAll,
  onShipped,
  onComplete,
  onCancel,
  onGenerateInvoices,
  onPrintInvoices,
  onGeneratePackingSlips,
  onPrintPackingSlips,
  onViewSelectedOrders,
  progress,
  className,
}) => {

  const { userStore, hasRequiredPermission } = useRoleCheck();

  // Own-only restriction: block bulk actions when the selection contains
  // orders the current user didn't create
  const bulkOwnOnlyBlocked = (action: string) =>
    selectionHasForeignOrders(
      userStore?.permissions,
      userStore?.id,
      'order',
      action,
      selectedOrders,
    );

  const progressPercentage = progress
    ? Math.round(((progress.completed + progress.failed) / progress.total) * 100)
    : 0;

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          variants={slideInFromBottom}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-2xl',
            'md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[600px] md:max-w-3xl md:rounded-lg md:border',
            className
          )}
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
                <div className="flex items-center gap-3">
                  <motion.div
                    variants={fabVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full"
                  >
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </motion.div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-base font-semibold">
                      {selectedCount}
                    </Badge>
                    <p className="text-sm font-medium text-gray-700">
                      {selectedCount === 1 ? 'order' : 'orders'} selected
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
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewSelectedOrders}
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
                <Dots className="h-4 w-6 text-primary" />
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
                {/* Mark as Shipped */}
                {hasRequiredPermission('order', 'update_status') && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onShipped}
                    disabled={bulkOwnOnlyBlocked('update_status') || bulkOwnOnlyBlocked('bulk_action')}
                    className="h-9 bg-blue-600 hover:bg-blue-700"
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Mark as Shipped</span>
                    <span className="sm:hidden">Shipped</span>
                  </Button>
                )}

                {/* Mark as Complete */}
                {hasRequiredPermission('order', 'update_status') && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onComplete}
                    disabled={bulkOwnOnlyBlocked('update_status') || bulkOwnOnlyBlocked('bulk_action')}
                    className="h-9 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Mark as Complete</span>
                    <span className="sm:hidden">Complete</span>
                  </Button>
                )}

                {/* Generate Invoices - Dropdown with Print and Download */}
                {hasRequiredPermission('order', 'documents') && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Invoices</span>
                        <span className="sm:hidden">Inv</span>
                        <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem onClick={onPrintInvoices}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print with Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onGenerateInvoices}>
                        <Download className="mr-2 h-4 w-4" />
                        Download as ZIP
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Generate Packing Slips - Dropdown with Print and Download */}
                {hasRequiredPermission('order', 'documents') && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Packing Slips</span>
                        <span className="sm:hidden">Slip</span>
                        <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem onClick={onPrintPackingSlips}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print with Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onGeneratePackingSlips}>
                        <Download className="mr-2 h-4 w-4" />
                        Download as ZIP
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Cancel Orders */}
                {hasRequiredPermission('order', 'cancel') && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onCancel}
                    disabled={bulkOwnOnlyBlocked('cancel') || bulkOwnOnlyBlocked('bulk_action')}
                    className="h-9 ml-auto"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Cancel Orders</span>
                    <span className="sm:hidden">Cancel</span>
                  </Button>
                )}

                {(bulkOwnOnlyBlocked('update_status') ||
                  bulkOwnOnlyBlocked('cancel') ||
                  bulkOwnOnlyBlocked('bulk_action')) && (
                  <p className="text-xs text-amber-600 w-full">
                    Own-only restriction: deselect orders you didn&apos;t create.
                  </p>
                )}
              </div>
            )}

            {/* Error Summary */}
            {progress && progress.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-800">
                      {progress.errors.length} {progress.errors.length === 1 ? 'error' : 'errors'} occurred
                    </p>
                    <div className="mt-1 max-h-20 overflow-y-auto">
                      {progress.errors.slice(0, 3).map((error, idx) => (
                        <p key={idx} className="text-xs text-red-700 truncate">
                          • {error.error}
                        </p>
                      ))}
                      {progress.errors.length > 3 && (
                        <p className="text-xs text-red-700">
                          ...and {progress.errors.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
