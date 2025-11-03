import { Button } from "../../../components/ui/button";
import { Calendar } from "lucide-react";
import { useState } from "react";

interface DateRangePickerProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onDateRangeChange,
}) => {
  const [selectedRange, setSelectedRange] = useState("30days");

  const presets = [
    { label: "Today", value: "today", days: 0 },
    { label: "Last 7 Days", value: "7days", days: 7 },
    { label: "Last 30 Days", value: "30days", days: 30 },
    { label: "Last 90 Days", value: "90days", days: 90 },
  ];

  const handlePresetClick = (value: string, days: number) => {
    setSelectedRange(value);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const formatDate = (date: Date) => {
      return date.toISOString().split("T")[0];
    };

    onDateRangeChange(formatDate(startDate), formatDate(endDate));
  };

  return (
    <div className='flex items-center gap-2 flex-wrap'>
      <Calendar className='h-4 w-4 text-muted-foreground' />
      <span className='text-sm text-muted-foreground'>Range:</span>
      {presets.map((preset) => (
        <Button
          key={preset.value}
          variant={selectedRange === preset.value ? "default" : "outline"}
          size='sm'
          onClick={() => handlePresetClick(preset.value, preset.days)}>
          {preset.label}
        </Button>
      ))}
    </div>
  );
};

export default DateRangePicker;
