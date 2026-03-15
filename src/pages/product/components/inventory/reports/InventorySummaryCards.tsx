import { Package, Archive, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { formatCurrency, formatNumber } from "../../../../../utils/inventoryReportUtils";
import { InventorySummary } from "../../../../../api/inventoryReport";

interface InventorySummaryCardsProps {
  data: InventorySummary;
}

/**
 * Inventory Summary Cards Component
 * Displays high-level inventory statistics with gradient design
 */
export const InventorySummaryCards = ({ data }: InventorySummaryCardsProps) => {
  const cards = [
    {
      title: "Total Products",
      value: data.totalProducts,
      description: `${data.activeProducts} active, ${data.inactiveProducts} inactive`,
      icon: <Package className='h-6 w-6' />,
      gradient: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      textColor: "text-blue-700",
    },
    {
      title: "Active Products",
      value: data.activeProducts,
      description: `${((data.activeProducts / data.totalProducts) * 100).toFixed(1)}% of total`,
      icon: <Package className='h-6 w-6' />,
      gradient: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
      textColor: "text-green-700",
    },
    {
      title: "Total Inventory Units",
      value: data.totalInventoryUnits,
      description: "Combined stock across all products",
      icon: <Archive className='h-6 w-6' />,
      gradient: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      iconColor: "text-purple-600",
      textColor: "text-purple-700",
    },
    {
      title: "Total Inventory Value",
      value: formatCurrency(data.totalInventoryValue),
      description: "Combined product valuation",
      icon: <DollarSign className='h-6 w-6' />,
      gradient: "from-amber-50 to-amber-100",
      borderColor: "border-amber-200",
      iconColor: "text-amber-600",
      textColor: "text-amber-700",
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
      {cards.map((card, index) => (
        <Card
          key={index}
          className='group relative overflow-hidden border border-gray-200 bg-white hover:shadow-lg hover:scale-[1.02] transition-all duration-300'>
          {/* Subtle gradient overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          />

          <CardHeader className='pb-3 relative z-10'>
            <div className='flex items-start justify-between gap-3'>
              {/* Icon container */}
              <div
                className={`flex-shrink-0 flex justify-center items-center p-2.5 rounded-lg bg-gradient-to-br ${card.gradient} shadow-sm group-hover:shadow-md transition-shadow duration-300`}>
                <div className={`${card.iconColor} w-6 h-6`}>{card.icon}</div>
              </div>

              {/* Value display */}
              <div className='flex flex-col items-end'>
                <span
                  className={`text-2xl font-bold ${card.textColor} tabular-nums`}>
                  {typeof card.value === 'number' ? formatNumber(card.value) : card.value}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className='relative z-10 pt-0'>
            <CardTitle className='text-sm font-semibold text-gray-900 mb-1'>
              {card.title}
            </CardTitle>
            <p className='text-xs text-gray-600 leading-relaxed'>
              {card.description}
            </p>
          </CardContent>

          {/* Decorative corner accent */}
          <div
            className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
          />
        </Card>
      ))}
    </div>
  );
};

export default InventorySummaryCards;
