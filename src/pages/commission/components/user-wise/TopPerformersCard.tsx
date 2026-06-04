import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Separator } from "../../../../components/ui/separator";
import { UserCommissionHistory } from "../../../../api/commission";
import { formatCurrency } from "../../../../utils/inventoryReportUtils";
import { Trophy, Medal, Award, Star } from "lucide-react";

interface TopPerformersCardProps {
  topProducts: UserCommissionHistory["topProducts"];
}

export const TopPerformersCard: React.FC<TopPerformersCardProps> = ({ topProducts }) => {
  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg">
          <Trophy className="h-4 w-4" />
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-md">
          <Medal className="h-4 w-4" />
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-700 text-white shadow-md">
          <Award className="h-4 w-4" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-semibold text-sm">
        {index + 1}
      </div>
    );
  };

  if (topProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No product data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Performing Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topProducts.slice(0, 5).map((product, index) => (
            <div key={product.productId}>
              <div className="flex items-center gap-3">
                {getRankBadge(index)}
                <Avatar className="h-10 w-10 ring-2 ring-primary/10 shrink-0">
                  <AvatarImage src={product.productImage} alt={product.productName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {product.productName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{product.productName}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs">
                      {product.commissionCount} {product.commissionCount === 1 ? "commission" : "commissions"}
                    </Badge>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-primary">
                    {formatCurrency(product.totalCommission)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total earned</div>
                </div>
              </div>
              {index < topProducts.slice(0, 5).length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
