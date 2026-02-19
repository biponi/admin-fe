import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { PackageStatusBadge } from "./PackageStatusBadge";
import type { Package } from "../../pages/package/interface";
import { User, MapPin, DollarSign } from "lucide-react";

interface SelectedPackagesSheetProps {
  packages: Package[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SelectedPackagesSheet({
  packages,
  open,
  onOpenChange,
}: SelectedPackagesSheetProps) {
  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 ${
        open ? "block" : "hidden"
      }`}
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Selected Packages</h2>
              <p className="text-gray-500 mt-1">
                {packages.length} package{packages.length !== 1 ? "s" : ""} selected
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {packages.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-500">No packages selected</p>
                </CardContent>
              </Card>
            ) : (
              packages.map((pkg) => (
                <Card key={pkg._id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">#{pkg.orderNumber}</h3>
                          <Badge variant="outline" className="font-mono text-xs">
                            {pkg.packageCode}
                          </Badge>
                          <PackageStatusBadge status={pkg.status} />
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {pkg.order?.customer.name || "N/A"}
                        </span>
                        {pkg.order?.customer.phoneNumber && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">
                              {pkg.order.customer.phoneNumber}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {pkg.order?.shipping.address || "N/A"}
                          {pkg.order?.shipping.district &&
                            `, ${pkg.order.shipping.district}`}
                          {pkg.order?.shipping.division &&
                            `, ${pkg.order.shipping.division}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-700">
                          COD: {pkg.order?.remaining || 0}৳
                        </span>
                        {pkg.order?.totalPrice && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">
                              Total: {pkg.order.totalPrice}৳
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <p className="text-sm text-gray-600 text-center">
            Ready to process {packages.length} package{packages.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
