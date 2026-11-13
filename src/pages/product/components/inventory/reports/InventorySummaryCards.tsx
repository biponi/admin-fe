import { Package, PackageCheck, Archive, DollarSign } from "lucide-react";
import { ReportStatTiles, type ReportStatTile } from "../reportScaffold/ReportStatTiles";
import { formatCurrency, formatNumber } from "../../../../../utils/inventoryReportUtils";
import { InventorySummary } from "../../../../../api/inventoryReport";

interface InventorySummaryCardsProps {
  data: InventorySummary;
}

/**
 * Inventory Summary — high-level inventory statistics as claude stat tiles.
 */
export const InventorySummaryCards = ({ data }: InventorySummaryCardsProps) => {
  const d = data ?? {
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    totalInventoryUnits: 0,
    totalInventoryValue: 0,
  };
  const activePct =
    d.totalProducts > 0
      ? ((d.activeProducts / d.totalProducts) * 100).toFixed(1)
      : "0.0";

  const tiles: ReportStatTile[] = [
    {
      label: "Total Products",
      value: formatNumber(d.totalProducts),
      sub: `${d.activeProducts} active, ${d.inactiveProducts} inactive`,
      icon: <Package className='h-3.5 w-3.5' />,
    },
    {
      label: "Active Products",
      value: formatNumber(d.activeProducts),
      sub: `${activePct}% of total`,
      tone: "good",
      icon: <PackageCheck className='h-3.5 w-3.5' />,
    },
    {
      label: "Total Inventory Units",
      value: formatNumber(d.totalInventoryUnits),
      sub: "combined stock across all products",
      icon: <Archive className='h-3.5 w-3.5' />,
    },
    {
      label: "Total Inventory Value",
      value: formatCurrency(d.totalInventoryValue),
      sub: "combined product valuation",
      tone: "warn",
      icon: <DollarSign className='h-3.5 w-3.5' />,
    },
  ];

  return <ReportStatTiles tiles={tiles} />;
};

export default InventorySummaryCards;
