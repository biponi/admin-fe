import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Skeleton } from "../../../components/ui/skeleton";
import { useProductAdjustment } from "../../../hooks/useProductAdjustment";
import { AdjustmentHistoryItem } from "../../../api/productAdjustment";
import {
  PackagePlus,
  PackageMinus,
  Package,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Separator } from "../../../components/ui/separator";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";

dayjs.extend(relativeTime);

interface ProductAdjustmentHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  useSheet?: boolean; // For mobile responsive
}

export const ProductAdjustmentHistory: React.FC<
  ProductAdjustmentHistoryProps
> = ({ open, onOpenChange, productId, productName, useSheet = false }) => {
  const { fetchAdjustmentHistory, isLoading } = useProductAdjustment();
  const [adjustments, setAdjustments] = useState<AdjustmentHistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdjustments, setTotalAdjustments] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (open && productId) {
      loadHistory();
    }
    //eslint-disable-next-line
  }, [open, productId, currentPage]);

  const loadHistory = async () => {
    const data = await fetchAdjustmentHistory(productId, {
      limit,
      page: currentPage,
    });

    if (data) {
      setAdjustments(data.adjustments);
      setTotalPages(data.pagination.totalPages);
      setTotalAdjustments(data.pagination.totalAdjustments);
    }
  };

  const getAdjustmentIcon = (type: string) => {
    switch (type) {
      case "add":
        return <PackagePlus className='h-4 w-4 text-green-600' />;
      case "remove":
        return <PackageMinus className='h-4 w-4 text-red-600' />;
      case "set":
        return <Package className='h-4 w-4 text-blue-600' />;
      default:
        return <Package className='h-4 w-4' />;
    }
  };

  const getAdjustmentBadge = (type: string) => {
    switch (type) {
      case "add":
        return (
          <Badge className='bg-green-100 text-green-800 hover:bg-green-200'>
            Add
          </Badge>
        );
      case "remove":
        return (
          <Badge className='bg-red-100 text-red-800 hover:bg-red-200'>
            Remove
          </Badge>
        );
      case "set":
        return (
          <Badge className='bg-blue-100 text-blue-800 hover:bg-blue-200'>
            Set
          </Badge>
        );
      default:
        return <Badge variant='outline'>{type}</Badge>;
    }
  };

  const getQuantityDisplay = (adjustment: AdjustmentHistoryItem) => {
    const change = adjustment.quantityChange;
    if (adjustment.adjustmentType === "add") {
      return <span className='text-green-600 font-semibold'>+{change}</span>;
    } else if (adjustment.adjustmentType === "remove") {
      return (
        <span className='text-red-600 font-semibold'>-{Math.abs(change)}</span>
      );
    } else {
      return <span className='text-blue-600 font-semibold'>{change}</span>;
    }
  };

  const HistoryContent = () => {
    if (isLoading && adjustments.length === 0) {
      return (
        <div className='space-y-3'>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className='h-20 w-full' />
          ))}
        </div>
      );
    }

    if (adjustments.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <Package className='h-12 w-12 text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold'>No Adjustment History</h3>
          <p className='text-sm text-muted-foreground mt-2'>
            No stock adjustments have been made for this product yet.
          </p>
        </div>
      );
    }

    return (
      <div className='space-y-4'>
        {/* Desktop View - Table */}
        <div className='hidden md:block'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className='text-right'>Old Qty</TableHead>
                <TableHead className='text-right'>Change</TableHead>
                <TableHead className='text-right'>New Qty</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustments.map((adjustment) => (
                <TableRow key={adjustment.id}>
                  <TableCell className='text-sm'>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-3 w-3 text-muted-foreground' />
                      <div>
                        <div>
                          {dayjs(adjustment.timestamps.createdAt).format(
                            "MMM DD, YYYY"
                          )}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {dayjs(adjustment.timestamps.createdAt).format(
                            "h:mm A"
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      {getAdjustmentIcon(adjustment.adjustmentType)}
                      {getAdjustmentBadge(adjustment.adjustmentType)}
                    </div>
                  </TableCell>
                  <TableCell className='text-right font-mono'>
                    {adjustment.oldQuantity}
                  </TableCell>
                  <TableCell className='text-right font-mono'>
                    {getQuantityDisplay(adjustment)}
                  </TableCell>
                  <TableCell className='text-right font-mono font-semibold'>
                    {adjustment.newQuantity}
                  </TableCell>
                  <TableCell className='max-w-xs'>
                    <div className='space-y-1'>
                      <p className='text-sm'>{adjustment.reason}</p>
                      {adjustment.notes && (
                        <p className='text-xs text-muted-foreground'>
                          {adjustment.notes}
                        </p>
                      )}
                      {adjustment.referenceNumber && (
                        <Badge variant='outline' className='text-xs'>
                          Ref: {adjustment.referenceNumber}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <User className='h-3 w-3 text-muted-foreground' />
                      <div className='text-sm'>
                        <div className='font-medium'>
                          {adjustment.adjustedBy.userName}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {adjustment.adjustedBy.userType}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View - Cards */}
        <div className='md:hidden space-y-3'>
          {adjustments.map((adjustment) => (
            <Card key={adjustment.id}>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {getAdjustmentIcon(adjustment.adjustmentType)}
                    {getAdjustmentBadge(adjustment.adjustmentType)}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    {dayjs(adjustment.timestamps.createdAt).fromNow()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>
                    Stock Change:
                  </span>
                  <div className='font-mono text-sm'>
                    <span>{adjustment.oldQuantity}</span>
                    <span className='mx-2'>→</span>
                    {getQuantityDisplay(adjustment)}
                    <span className='mx-2'>→</span>
                    <span className='font-semibold'>
                      {adjustment.newQuantity}
                    </span>
                  </div>
                </div>
                <Separator />
                <div>
                  <div className='flex items-center gap-2 text-sm font-medium mb-1'>
                    <FileText className='h-3 w-3' />
                    Reason:
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {adjustment.reason}
                  </p>
                  {adjustment.notes && (
                    <p className='text-xs text-muted-foreground mt-1'>
                      {adjustment.notes}
                    </p>
                  )}
                  {adjustment.referenceNumber && (
                    <Badge variant='outline' className='text-xs mt-2'>
                      Ref: {adjustment.referenceNumber}
                    </Badge>
                  )}
                </div>
                <Separator />
                <div className='flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-2 text-muted-foreground'>
                    <User className='h-3 w-3' />
                    <span>{adjustment.adjustedBy.userName}</span>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {dayjs(adjustment.timestamps.createdAt).format(
                      "MMM DD, h:mm A"
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-between pt-4 border-t'>
            <div className='text-sm text-muted-foreground'>
              Page {currentPage} of {totalPages} ({totalAdjustments} total)
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}>
                <ChevronLeft className='h-4 w-4' />
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || isLoading}>
                Next
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (useSheet) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side='right' className='w-full sm:max-w-3xl'>
          <SheetHeader>
            <SheetTitle>Adjustment History</SheetTitle>
            <SheetDescription>{productName}</SheetDescription>
          </SheetHeader>
          <ScrollArea className='h-[calc(100vh-8rem)] mt-6'>
            <HistoryContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-5xl max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle>Adjustment History</DialogTitle>
          <DialogDescription>{productName}</DialogDescription>
        </DialogHeader>
        <ScrollArea className='max-h-[70vh]'>
          <HistoryContent />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Usage Example:
 *
 * const ProductListItem = ({ product }) => {
 *   const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <Button variant="ghost" onClick={() => setHistoryDialogOpen(true)}>
 *         View History
 *       </Button>
 *
 *       <ProductAdjustmentHistory
 *         open={historyDialogOpen}
 *         onOpenChange={setHistoryDialogOpen}
 *         productId={product.id}
 *         productName={product.name}
 *       />
 *     </>
 *   );
 * };
 */
