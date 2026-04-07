import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Commission } from "../../../api/commission";
import { CommissionStatusBadge } from "./CommissionStatusBadge";
import { formatDate, formatCurrency } from "../../../utils/inventoryReportUtils";
import { showOrderModal } from "../../../utils/orderModal";
import { Eye, Edit, Package, Calendar, CheckCircle2, ExternalLink } from "lucide-react";

interface CommissionTableProps {
  commissions: Commission[];
  onViewDetails?: (commission: Commission) => void;
  onUpdateStatus?: (commission: Commission) => void;
}

export const CommissionTable: React.FC<CommissionTableProps> = ({
  commissions,
  onViewDetails,
  onUpdateStatus,
}) => {
  if (commissions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No commissions found</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Card Layout */}
      <div className="space-y-3 md:hidden">
        {commissions.map((commission) => (
          <Card key={commission.id} className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              {/* Header: Order + Status + User */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={commission.userAvatar} />
                    <AvatarFallback className="text-sm">
                      {commission.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {commission.userName}
                    </p>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-mono text-xs mt-1 hover:text-blue-600"
                      onClick={() => showOrderModal(commission.orderNumber)}
                    >
                      <Badge variant="outline" className="pointer-events-none">
                        #{commission.orderNumber}
                      </Badge>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
                <CommissionStatusBadge status={commission.status} />
              </div>

              <Separator />

              {/* Commission Amount */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-700 mb-1">Commission Amount</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(commission.commissionAmount)}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {commission.commissionType === "percentage"
                    ? `${commission.commissionRate}% rate`
                    : `${formatCurrency(commission.commissionRate)} rate`}
                </p>
              </div>

              {/* Product Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Package className="h-4 w-4 text-purple-600" />
                  <span className="line-clamp-1">{commission.productName}</span>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  Qty: {commission.quantity} × {formatCurrency(commission.productPrice)} = {formatCurrency(commission.totalPrice)}
                </p>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(commission.createdAt)}
              </div>

              {/* Paid Off Date - Only for paid commissions */}
              {commission.status === 'paid' && commission.paidOffDate && (
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Paid: {formatDate(commission.paidOffDate)}
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {onViewDetails && (
                  <Button
                    variant="outline"
                    size="default"
                    className="h-11"
                    onClick={() => onViewDetails(commission)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                )}
                {onUpdateStatus && (
                  <Button
                    size="default"
                    className="h-11"
                    onClick={() => onUpdateStatus(commission)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Paid Off Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissions.map((commission) => (
              <TableRow key={commission.id}>
                <TableCell className="font-medium">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-mono hover:text-blue-600 hover:bg-transparent"
                    onClick={() => showOrderModal(commission.orderNumber)}
                  >
                    #{commission.orderNumber}
                    <ExternalLink className="h-3 w-3 ml-1 inline" />
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={commission.userAvatar} />
                      <AvatarFallback>
                        {commission.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <div className="font-medium">{commission.userName}</div>
                      <div className="text-xs text-muted-foreground">
                        {commission.userId}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{commission.productName}</div>
                    <div className="text-xs text-muted-foreground">
                      Qty: {commission.quantity} × {formatCurrency(commission.productPrice)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="text-sm">
                    <div className="font-medium">{formatCurrency(commission.commissionAmount)}</div>
                    <div className="text-xs text-muted-foreground">
                      {commission.commissionType === "percentage"
                        ? `${commission.commissionRate}%`
                        : formatCurrency(commission.commissionRate)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <CommissionStatusBadge status={commission.status} />
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(commission.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  {commission.status === 'paid' && commission.paidOffDate ? (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      {formatDate(commission.paidOffDate)}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onViewDetails && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(commission)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onUpdateStatus && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateStatus(commission)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
