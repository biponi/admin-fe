import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { getStatusColors, getStatusBgColor, getStatusTextColor, getStatusBorderColor } from "../../../../utils/commissionColors";
import { formatCurrency } from "../../../../utils/inventoryReportUtils";

interface StatusBreakdown {
  count: number;
  amount: number;
}

interface StatusBreakdownData {
  [key: string]: StatusBreakdown;
}

interface MobileStatusBreakdownGridProps {
  breakdown: StatusBreakdownData;
  className?: string;
}

export const MobileStatusBreakdownGrid: React.FC<MobileStatusBreakdownGridProps> = ({
  breakdown,
  className = ''
}) => {
  const entries = Object.entries(breakdown).filter(([_, data]) => data.count > 0);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={`md:hidden ${className}`}>
      <h3 className='text-sm font-semibold mb-3 text-foreground'>Status Breakdown</h3>
      <div className='grid grid-cols-2 gap-3'>
        {entries.map(([status, data]) => {
          const colors = getStatusColors(status);
          const bgColor = getStatusBgColor(status);
          const textColor = getStatusTextColor(status);
          const borderColor = getStatusBorderColor(status);

          return (
            <Card
              key={status}
              className={`border ${borderColor} overflow-hidden`}
            >
              <CardHeader className='pb-2 px-4 pt-4'>
                <CardTitle className={`text-xs font-bold uppercase tracking-wide ${textColor}`}>
                  {status}
                </CardTitle>
              </CardHeader>
              <CardContent className='px-4 pb-4 space-y-1'>
                <div className={`text-lg font-bold ${textColor} leading-tight`}>
                  {data.count} item{data.count !== 1 ? 's' : ''}
                </div>
                <div className={`text-sm font-semibold ${textColor}/80`}>
                  {formatCurrency(data.amount)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
