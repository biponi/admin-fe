import { Clock, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { PackageStatus } from "../../pages/package/interface";

interface ScanEntry {
  barcode: string;
  orderNumber: number;
  timestamp: Date;
  status?: PackageStatus;
  success: boolean;
  error?: string;
}

interface ScanHistoryProps {
  scans: ScanEntry[];
  onRescan?: (barcode: string) => void;
  onClear?: () => void;
  maxDisplay?: number;
}

export function ScanHistory({
  scans,
  onRescan,
  onClear,
  maxDisplay = 10,
}: ScanHistoryProps) {
  const displayScans = scans.slice(0, maxDisplay);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getStatusBadge = (status?: PackageStatus, success?: boolean) => {
    if (!success) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Error
        </Badge>
      );
    }

    if (!status) {
      return <Badge variant="secondary">Unknown</Badge>;
    }

    const statusColors: Record<PackageStatus, string> = {
      requested: "bg-blue-100 text-blue-800",
      packing: "bg-yellow-100 text-yellow-800",
      packed: "bg-green-100 text-green-800",
      shipping_requested: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      returned: "bg-orange-100 text-orange-800",
    };

    return (
      <Badge className={statusColors[status]}>
        {status}
      </Badge>
    );
  };

  if (displayScans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Scan History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No scans yet</p>
            <p className="text-sm mt-1">Scanned barcodes will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Scan History ({scans.length})
          </CardTitle>
          {onClear && scans.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayScans.map((scan, index) => (
            <div
              key={`${scan.barcode}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {scan.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      Order #{scan.orderNumber}
                    </span>
                    {getStatusBadge(scan.status, scan.success)}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <code className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
                      {scan.barcode}
                    </code>
                    <span className="text-xs text-gray-400">
                      {formatTime(scan.timestamp)}
                    </span>
                  </div>
                  {scan.error && (
                    <p className="text-xs text-red-600 mt-1">{scan.error}</p>
                  )}
                </div>
              </div>
              {onRescan && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRescan(scan.barcode)}
                  className="flex-shrink-0"
                  title="Rescan this barcode"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {scans.length > maxDisplay && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              Showing {maxDisplay} of {scans.length} scans
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
