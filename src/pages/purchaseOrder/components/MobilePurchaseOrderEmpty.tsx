import React from "react";
import { Package, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import useRoleCheck from "../../auth/hooks/useRoleCheck";

interface Props {
  onCreateOrder: () => void;
}

const MobilePurchaseOrderEmpty: React.FC<Props> = ({ onCreateOrder }) => {
  const { hasRequiredPermission } = useRoleCheck();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Icon */}
      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-4">
        <Package className="h-10 w-10 text-blue-600" />
      </div>

      {/* Message */}
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          No purchase orders yet
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Create your first purchase order to start tracking your inventory
          purchases and manage suppliers
        </p>
      </div>

      {/* CTA Button */}
      {hasRequiredPermission("purchaseOrder", "create") && (
        <Button
          onClick={onCreateOrder}
          className="h-12 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium shadow-md">
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Order
        </Button>
      )}
    </div>
  );
};

export default MobilePurchaseOrderEmpty;
