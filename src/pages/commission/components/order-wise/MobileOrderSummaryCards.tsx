import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Package, Layers, DollarSign, Users } from "lucide-react";
import { formatCurrency } from "../../../../utils/inventoryReportUtils";

interface OrderSummary {
  totalProducts: number;
  totalQuantity: number;
  totalCommissionAmount: number;
  recipientsCount: number;
}

interface MobileOrderSummaryCardsProps {
  summary: OrderSummary;
}

export const MobileOrderSummaryCards: React.FC<MobileOrderSummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Total Products',
      value: summary.totalProducts,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      title: 'Total Quantity',
      value: summary.totalQuantity,
      icon: Layers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Total Commission',
      value: formatCurrency(summary.totalCommissionAmount),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Recipients',
      value: summary.recipientsCount,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  return (
    <div className='md:hidden grid grid-cols-2 gap-3'>
      {cards.map((card) => (
        <Card key={card.title} className='overflow-hidden'>
          <CardHeader className='flex flex-row items-center justify-between pb-2 px-4 pt-4'>
            <CardTitle className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent className='px-4 pb-4'>
            <div className='text-xl sm:text-2xl font-bold tracking-tight'>
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
