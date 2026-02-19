import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPackage } from "../../api/package";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { Barcode, Loader2 } from "lucide-react";
import { CameraScanner } from "../../components/package/CameraScanner";
import { ScanResultDialog } from "../../components/package/ScanResultDialog";
import { ScanHistory } from "../../components/package/ScanHistory";
import { usePackageStore } from "../../store/packageStore";

export function BarcodeScannerPage() {
  const navigate = useNavigate();
  const {
    scanHistory,
    scanResult,
    addScanHistoryEntry,
    setScanResult,
    clearScanHistory,
  } = usePackageStore();

  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [useCamera, setUseCamera] = useState(false);

  // Handle barcode scan (from camera or manual input)
  const handleScan = async (barcode: string) => {
    if (!barcode || barcode.trim() === "") return;

    setLoading(true);
    try {
      // Extract order number from barcode
      const orderNumberMatch = barcode.match(/\d+/);
      const orderNumber = orderNumberMatch ? parseInt(orderNumberMatch[0]) : 0;

      if (!orderNumber) {
        toast.error("Invalid barcode format");

        // Add to scan history as failed
        addScanHistoryEntry({
          barcode,
          orderNumber: 0,
          timestamp: new Date(),
          success: false,
          error: "Invalid barcode format",
        });
        setLoading(false);
        return;
      }

      // Fetch package details
      const result = await getPackage(orderNumber);

      if (result.success && result.data) {
        const pkg = result.data;

        // Add to scan history
        addScanHistoryEntry({
          barcode,
          orderNumber: pkg.orderNumber,
          timestamp: new Date(),
          status: pkg.status,
          success: true,
        });

        // Set scan result and show dialog
        setScanResult(pkg);
        setShowResultDialog(true);

        // Clear input if it was manual
        if (!useCamera) {
          setBarcodeInput("");
        }
      } else {
        const errorMsg = result.error || "Package not found";
        toast.error(errorMsg);

        // Add to scan history as failed
        addScanHistoryEntry({
          barcode,
          orderNumber,
          timestamp: new Date(),
          success: false,
          error: errorMsg,
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Scan failed";
      toast.error(errorMsg);

      // Add to scan history as failed
      addScanHistoryEntry({
        barcode,
        orderNumber: 0,
        timestamp: new Date(),
        success: false,
        error: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle manual input
  const handleManualScan = () => {
    const barcode = barcodeInput.trim();
    if (!barcode) {
      toast.error("Please enter a barcode");
      return;
    }
    handleScan(barcode);
  };

  // Handle camera scan
  const handleCameraScan = (barcode: string) => {
    handleScan(barcode);
  };

  // Handle successful status change
  const handleConfirm = () => {
    setShowResultDialog(false);
    setScanResult(null);
  };

  // Handle dialog cancel
  const handleCancel = () => {
    setShowResultDialog(false);
    setScanResult(null);
  };

  // Handle rescan from history
  const handleRescan = (barcode: string) => {
    handleScan(barcode);
  };

  // Navigate to bulk shipping
  const handleBulkShipping = () => {
    const packedPackages = scanHistory.filter(
      (entry) => entry.success && entry.status === "packed"
    );

    if (packedPackages.length === 0) {
      toast.error("No packed packages to ship");
      return;
    }

    const orderNumbers = Array.from(
      new Set(packedPackages.map((entry) => entry.orderNumber))
    );

    navigate("/packages/bulk", {
      state: { orderNumbers },
    });
  };

  const packedCount = scanHistory.filter(
    (entry) => entry.success && entry.status === "packed"
  ).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Barcode Scanner</h1>
        <p className="text-gray-500 mt-1">
          Scan packages to mark them as packed
        </p>
      </div>

      {/* Scanner Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={!useCamera ? "default" : "outline"}
          onClick={() => setUseCamera(false)}
          className="flex-1"
        >
          <Barcode className="h-4 w-4 mr-2" />
          Manual Input
        </Button>
        <Button
          variant={useCamera ? "default" : "outline"}
          onClick={() => setUseCamera(true)}
          className="flex-1"
        >
          Camera Scanner
        </Button>
      </div>

      {/* Scanner Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            {useCamera ? "Camera Scanner" : "Manual Input"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {useCamera ? (
            <CameraScanner
              onScan={handleCameraScan}
              onError={(error) => toast.error(error)}
            />
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter barcode or order number"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualScan()}
                  className="pl-10"
                  autoFocus
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleManualScan}
                disabled={loading || !barcodeInput.trim()}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Scan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Shipping Button */}
      {packedCount > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handleBulkShipping}
              className="w-full"
              size="lg"
            >
              Request Shipping for {packedCount} Packed Package
              {packedCount > 1 ? "s" : ""}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Scan History */}
      <ScanHistory
        scans={scanHistory}
        onRescan={handleRescan}
        onClear={clearScanHistory}
        maxDisplay={20}
      />

      {/* Scan Result Dialog */}
      <ScanResultDialog
        open={showResultDialog}
        onOpenChange={setShowResultDialog}
        package={scanResult}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
