import { useEffect, useState } from "react";
import { useIsMobile } from "../../../hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../../components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../../../components/ui/drawer";
import { Badge } from "../../../components/ui/badge";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  Filter,
  Plus,
  Minus,
  AlignCenter,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  CheckCircle,
  Clock,
  XCircle,
  X,
} from "lucide-react";
import { useProductAnalytics } from "../hooks/useProductAnalytics";
import { format } from "date-fns";

interface AdjustmentHistoryTabProps {
  productId: string;
}

const AdjustmentHistoryTab = ({ productId }: AdjustmentHistoryTabProps) => {
  const isMobile = useIsMobile();
  const {
    adjustmentHistory,
    loading,
    fetchAdjustmentHistory,
    adjustmentParams,
  } = useProductAnalytics(productId);

  const [selectedAdjustment, setSelectedAdjustment] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adjustmentTypeFilter, setAdjustmentTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchAdjustmentHistory();
  }, [fetchAdjustmentHistory]);

  const handleFilter = () => {
    fetchAdjustmentHistory({
      page: 1,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      adjustmentType: adjustmentTypeFilter && adjustmentTypeFilter !== "all" ? adjustmentTypeFilter as any : undefined,
      status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
      sortBy,
      sortOrder,
    });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setAdjustmentTypeFilter("all");
    setStatusFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    fetchAdjustmentHistory({ page: 1, limit: 20 });
  };

  const handleAdjustmentClick = (adjustment: any) => {
    setSelectedAdjustment(adjustment);
    setShowDetails(true);
  };

  const getAdjustmentTypeIcon = (type: string) => {
    switch (type) {
      case "add":
        return <Plus className="h-4 w-4" />;
      case "remove":
        return <Minus className="h-4 w-4" />;
      case "set":
        return <AlignCenter className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getAdjustmentTypeBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case "add":
        return "default";
      case "remove":
        return "destructive";
      case "set":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "approved":
      case "applied":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "applied":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading && !adjustmentHistory) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading adjustment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Adjustments</p>
                <p className="text-2xl font-bold">
                  {adjustmentHistory?.summary.totalAdjustments || 0}
                </p>
              </div>
              <AlignCenter className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Added</p>
                <p className="text-2xl font-bold text-green-600">
                  +{adjustmentHistory?.summary.totalAdded || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Removed</p>
                <p className="text-2xl font-bold text-red-600">
                  -{adjustmentHistory?.summary.totalRemoved || 0}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Net Change</p>
                <p
                  className={`text-2xl font-bold ${
                    (adjustmentHistory?.summary.netChange || 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(adjustmentHistory?.summary.netChange || 0) >= 0 ? "+" : ""}
                  {adjustmentHistory?.summary.netChange || 0}
                </p>
              </div>
              <RotateCcw className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">
                  {adjustmentHistory?.summary.pendingApprovals || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select
                value={adjustmentTypeFilter}
                onValueChange={setAdjustmentTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="add">Add</SelectItem>
                  <SelectItem value="remove">Remove</SelectItem>
                  <SelectItem value="set">Set</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date</SelectItem>
                  <SelectItem value="quantityChange">Quantity Change</SelectItem>
                  <SelectItem value="adjustmentType">Type</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end space-x-2">
              <Button onClick={handleFilter} className="flex-1">
                Apply Filters
              </Button>
              <Button onClick={handleReset} variant="outline">
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DataTable with Sticky Header */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            <Table divClass="relative">
              <TableHeader className="sticky top-0 bg-white border-b z-10">
                <TableRow className="bg-sidebar">
                  <TableHead>Type</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead className="text-right">Old Qty</TableHead>
                  <TableHead className="text-right">New Qty</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Adjusted By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustmentHistory?.adjustments?.map((adjustment) => (
                  <TableRow
                    key={adjustment.adjustmentId}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAdjustmentClick(adjustment)}
                  >
                    <TableCell>
                      <Badge
                        variant={getAdjustmentTypeBadgeVariant(adjustment.adjustmentType)}
                        className="flex items-center space-x-1"
                      >
                        {getAdjustmentTypeIcon(adjustment.adjustmentType)}
                        <span className="ml-1 capitalize">
                          {adjustment.adjustmentType}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {adjustment.variationDetails ? (
                        <span className="text-sm">
                          {adjustment.variationDetails.color && (
                            <span>{adjustment.variationDetails.color}</span>
                          )}
                          {adjustment.variationDetails.color &&
                            adjustment.variationDetails.size && <span> - </span>}
                          {adjustment.variationDetails.size && (
                            <span>{adjustment.variationDetails.size}</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Standard</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {adjustment.oldQuantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {adjustment.newQuantity}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        adjustment.quantityChange > 0
                          ? "text-green-600"
                          : adjustment.quantityChange < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {adjustment.quantityChange > 0 ? "+" : ""}
                      {adjustment.quantityChange}
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={adjustment.reason}>
                      {adjustment.reason}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">
                          {adjustment.adjustedBy.userName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {adjustment.adjustedBy.userType}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(adjustment.status)}
                        className="flex items-center space-x-1"
                      >
                        {getStatusIcon(adjustment.status)}
                        <span className="ml-1 capitalize">{adjustment.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(adjustment.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
                {(!adjustmentHistory?.adjustments ||
                  adjustmentHistory.adjustments.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No adjustments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing{" "}
                {((adjustmentHistory?.pagination.currentPage || 1) - 1) *
                  (adjustmentParams.limit || 20) +
                  1}
                -
                {Math.min(
                  (adjustmentHistory?.pagination.currentPage || 1) *
                    (adjustmentParams.limit || 20),
                  adjustmentHistory?.pagination.totalItems || 0
                )}{" "}
                of {adjustmentHistory?.pagination.totalItems || 0} adjustments
              </div>
              <div className="flex items-center space-x-2">
                <Select
                  value={`${adjustmentParams.limit}`}
                  onValueChange={(value) =>
                    fetchAdjustmentHistory({ limit: Number(value), page: 1 })
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!adjustmentHistory?.pagination.hasPreviousPage}
                  onClick={() =>
                    fetchAdjustmentHistory({
                      page: (adjustmentParams.page || 1) - 1,
                    })
                  }
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {adjustmentHistory?.pagination.currentPage} of{" "}
                  {adjustmentHistory?.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!adjustmentHistory?.pagination.hasNextPage}
                  onClick={() =>
                    fetchAdjustmentHistory({
                      page: (adjustmentParams.page || 1) + 1,
                    })
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adjustment Details Sheet (Desktop) / Drawer (Mobile) */}
      {isMobile ? (
        <Drawer open={showDetails} onOpenChange={setShowDetails}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="flex items-center space-x-2">
                <Badge
                  variant={getAdjustmentTypeBadgeVariant(
                    selectedAdjustment?.adjustmentType
                  )}
                >
                  {getAdjustmentTypeIcon(selectedAdjustment?.adjustmentType)}
                  <span className="ml-1 capitalize">
                    {selectedAdjustment?.adjustmentType}
                  </span>
                </Badge>
              </DrawerTitle>
            </DrawerHeader>
            <ScrollArea className="h-[60vh] px-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Adjustment Details</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Type:</span>{" "}
                      <Badge variant="outline">
                        {selectedAdjustment?.adjustmentType}
                      </Badge>
                    </p>
                    <p>
                      <span className="text-gray-500">Old Quantity:</span>{" "}
                      {selectedAdjustment?.oldQuantity}
                    </p>
                    <p>
                      <span className="text-gray-500">New Quantity:</span>{" "}
                      {selectedAdjustment?.newQuantity}
                    </p>
                    <p>
                      <span className="text-gray-500">Change:</span>{" "}
                      <span
                        className={`font-semibold ${
                          (selectedAdjustment?.quantityChange || 0) > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {(selectedAdjustment?.quantityChange || 0) > 0 ? "+" : ""}
                        {selectedAdjustment?.quantityChange}
                      </span>
                    </p>
                  </div>
                </div>
                {selectedAdjustment?.variationDetails && (
                  <div>
                    <h3 className="font-semibold mb-2">Variant Details</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-gray-500">SKU:</span>{" "}
                        {selectedAdjustment.variationDetails.sku || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-500">Color:</span>{" "}
                        {selectedAdjustment.variationDetails.color || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-500">Size:</span>{" "}
                        {selectedAdjustment.variationDetails.size || "N/A"}
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold mb-2">Reason & Notes</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Reason:</span>{" "}
                      {selectedAdjustment?.reason}
                    </p>
                    {selectedAdjustment?.notes && (
                      <p>
                        <span className="text-gray-500">Notes:</span>{" "}
                        {selectedAdjustment.notes}
                      </p>
                    )}
                    {selectedAdjustment?.referenceNumber && (
                      <p>
                        <span className="text-gray-500">Reference:</span>{" "}
                        {selectedAdjustment.referenceNumber}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">User Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Adjusted By:</span>{" "}
                      {selectedAdjustment?.adjustedBy.userName} (
                      {selectedAdjustment?.adjustedBy.userType})
                    </p>
                    <p>
                      <span className="text-gray-500">Email:</span>{" "}
                      {selectedAdjustment?.adjustedBy.userEmail}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Current Status:</span>{" "}
                      <Badge variant="outline">
                        {getStatusIcon(selectedAdjustment?.status)}
                        <span className="ml-1 capitalize">
                          {selectedAdjustment?.status}
                        </span>
                      </Badge>
                    </p>
                    {selectedAdjustment?.approvedBy && (
                      <p>
                        <span className="text-gray-500">Approved By:</span>{" "}
                        {selectedAdjustment.approvedBy.userName}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Timestamps</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Created At:</span>{" "}
                      {selectedAdjustment &&
                        format(
                          new Date(selectedAdjustment.createdAt),
                          "MMM dd, yyyy HH:mm"
                        )}
                    </p>
                    {selectedAdjustment?.approvedBy?.approvedAt && (
                      <p>
                        <span className="text-gray-500">Approved At:</span>{" "}
                        {format(
                          new Date(selectedAdjustment.approvedBy.approvedAt),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={showDetails} onOpenChange={setShowDetails}>
          <SheetContent className="w-full sm:max-w-2xl">
            <SheetHeader>
              <SheetTitle className="flex items-center space-x-2">
                <Badge
                  variant={getAdjustmentTypeBadgeVariant(
                    selectedAdjustment?.adjustmentType
                  )}
                >
                  {getAdjustmentTypeIcon(selectedAdjustment?.adjustmentType)}
                  <span className="ml-1 capitalize">
                    {selectedAdjustment?.adjustmentType}
                  </span>
                </Badge>
                <span className="ml-2">Adjustment Details</span>
              </SheetTitle>
              <SheetDescription>
                Full inventory adjustment information
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-200px)] mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 text-lg">
                    Adjustment Details
                  </h3>
                  <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Type:</span>
                      <Badge variant="outline">
                        {selectedAdjustment?.adjustmentType}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">
                        Old Quantity:
                      </span>
                      <span>{selectedAdjustment?.oldQuantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">
                        New Quantity:
                      </span>
                      <span>{selectedAdjustment?.newQuantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">
                        Quantity Change:
                      </span>
                      <span
                        className={`font-semibold text-lg ${
                          (selectedAdjustment?.quantityChange || 0) > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {(selectedAdjustment?.quantityChange || 0) > 0 ? "+" : ""}
                        {selectedAdjustment?.quantityChange}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedAdjustment?.variationDetails && (
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">
                      Variant Details
                    </h3>
                    <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">SKU:</span>
                        <span>
                          {selectedAdjustment.variationDetails.sku || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">
                          Color:
                        </span>
                        <span>
                          {selectedAdjustment.variationDetails.color || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">
                          Size:
                        </span>
                        <span>
                          {selectedAdjustment.variationDetails.size || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3 text-lg">
                    Reason & Notes
                  </h3>
                  <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                    <p>
                      <span className="text-gray-500 font-medium">Reason:</span>
                    </p>
                    <p className="text-base">
                      {selectedAdjustment?.reason}
                    </p>
                    {selectedAdjustment?.notes && (
                      <>
                        <p>
                          <span className="text-gray-500 font-medium">
                            Notes:
                          </span>
                        </p>
                        <p className="text-base">{selectedAdjustment.notes}</p>
                      </>
                    )}
                    {selectedAdjustment?.referenceNumber && (
                      <div className="flex justify-between pt-2">
                        <span className="text-gray-500 font-medium">
                          Reference Number:
                        </span>
                        <span className="font-mono">
                          {selectedAdjustment.referenceNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-lg">
                    User Information
                  </h3>
                  <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">
                        Adjusted By:
                      </span>
                      <span>
                        {selectedAdjustment?.adjustedBy.userName}{" "}
                        <span className="text-gray-500">
                          ({selectedAdjustment?.adjustedBy.userType})
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Email:</span>
                      <span>{selectedAdjustment?.adjustedBy.userEmail}</span>
                    </div>
                    {selectedAdjustment?.ipAddress && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">
                          IP Address:
                        </span>
                        <span className="font-mono">
                          {selectedAdjustment.ipAddress}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-lg">Status</h3>
                  <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">
                        Current Status:
                      </span>
                      <Badge>
                        {getStatusIcon(selectedAdjustment?.status)}
                        <span className="ml-1 capitalize">
                          {selectedAdjustment?.status}
                        </span>
                      </Badge>
                    </div>
                    {selectedAdjustment?.approvedBy && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">
                            Approved By:
                          </span>
                          <span>{selectedAdjustment.approvedBy.userName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">
                            Approved At:
                          </span>
                          <span>
                            {format(
                              new Date(selectedAdjustment.approvedBy.approvedAt),
                              "MMM dd, yyyy HH:mm"
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-lg">Timestamps</h3>
                  <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">
                        Created At:
                      </span>
                      <span>
                        {selectedAdjustment &&
                          format(
                            new Date(selectedAdjustment.createdAt),
                            "MMM dd, yyyy HH:mm:ss"
                          )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default AdjustmentHistoryTab;
