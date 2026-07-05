import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getPackageBarcode } from "../../api/package";
import { Loader2, Download, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface BarcodeDisplayProps {
  orderNumber: number;
  packageCode?: string;
}

export function BarcodeDisplay({
  orderNumber,
  packageCode,
}: BarcodeDisplayProps) {
  const [barcode, setBarcode] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generateBarcode = async () => {
    setLoading(true);
    try {
      const result = await getPackageBarcode(orderNumber);
      if (result.success && result.data) {
        const raw = result.data.barcode;
        const barcodeDataUri = raw.startsWith("data:")
          ? raw
          : `data:image/png;base64,${raw}`;
        setBarcode(barcodeDataUri);
        toast.success("Barcode generated successfully");
      } else {
        toast.error(result.error || "Failed to generate barcode");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate barcode",
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadBarcode = () => {
    const link = document.createElement("a");
    link.href = barcode;
    link.download = `${packageCode || "barcode"}-order-${orderNumber}.png`;
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Package Barcode</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {!barcode ? (
          <Button
            onClick={generateBarcode}
            disabled={loading}
            className='w-full'>
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Generate Barcode
          </Button>
        ) : (
          <div className='space-y-4'>
            <div className='flex justify-center p-4 bg-white rounded border'>
              <img
                src={barcode}
                alt='Package Barcode'
                className='w-full h-auto max-w-xs'
              />
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={downloadBarcode}
                className='flex-1'>
                <Download className='mr-2 h-4 w-4' />
                Download
              </Button>
              <Button
                variant='outline'
                onClick={() => setBarcode("")}
                className='flex-1'>
                <RefreshCcw className='mr-2 h-4 w-4' />
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
