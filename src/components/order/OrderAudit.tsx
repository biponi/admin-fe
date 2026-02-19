import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle, Info, Shield, RotateCcw } from 'lucide-react';
import { IOrder } from '../../pages/order/interface';
import { format } from 'date-fns';

interface OrderAuditProps {
  order: IOrder;
}

const getRiskLevelColor = (riskLevel: string) => {
  switch (riskLevel.toLowerCase()) {
    case 'green':
      return 'default';
    case 'yellow':
      return 'secondary';
    case 'red':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getRiskLevelLabel = (riskLevel: string) => {
  switch (riskLevel.toLowerCase()) {
    case 'green':
      return 'Low Risk';
    case 'yellow':
      return 'Medium Risk';
    case 'red':
      return 'High Risk';
    default:
      return 'Unknown';
  }
};

export const OrderAudit = ({ order }: OrderAuditProps) => {
  return (
    <div className="space-y-6">
      {/* Fraud Detection Analysis - Conditional */}
      {order.requiresManualReview && order.fraudFlags && order.fraudFlags.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This order requires manual review due to potential fraud indicators.
          </AlertDescription>
        </Alert>
      )}

      {order.fraudDetection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Shield className="mr-2 h-5 w-5" />
              Fraud Detection Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Risk Level</p>
                <Badge variant={getRiskLevelColor(order.fraudDetection.riskLevel)} className="mt-1">
                  {getRiskLevelLabel(order.fraudDetection.riskLevel)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Risk Score</p>
                <p className="text-lg font-semibold">{order.fraudDetection.riskScore.toFixed(2)}</p>
              </div>
            </div>
            {order.fraudFlags && order.fraudFlags.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Fraud Flags:</p>
                <ul className="list-disc list-inside space-y-1">
                  {order.fraudFlags.map((flag, idx) => (
                    <li key={idx} className="text-sm text-red-600">
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Return Information - Conditional */}
      {order.isReturn && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <RotateCcw className="mr-2 h-5 w-5" />
              Return Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.returnReason && (
                <div>
                  <p className="text-sm text-gray-600">Return Reason</p>
                  <p className="font-medium">{order.returnReason}</p>
                </div>
              )}
              {order.returnReasonDetails && (
                <div>
                  <p className="text-sm text-gray-600">Return Details</p>
                  <p className="text-sm">{order.returnReasonDetails}</p>
                </div>
              )}
              {order.returnedAt && (
                <div>
                  <p className="text-sm text-gray-600">Returned At</p>
                  <p className="font-medium">
                    {format(new Date(order.returnedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Info className="mr-2 h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="font-medium">
                {format(new Date(order.timestamps.createdAt), 'MMM dd, yyyy HH:mm:ss')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updated At</p>
              <p className="font-medium">
                {format(new Date(order.timestamps.updatedAt), 'MMM dd, yyyy HH:mm:ss')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-medium">#{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge variant={order.active ? 'default' : 'secondary'} className="mt-1">
                {order.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
