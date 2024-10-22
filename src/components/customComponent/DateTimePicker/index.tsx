"use client";

import * as React from "react";
import { add, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { TimePickerDemo } from "./time-picker";

interface DateTimePickerProps {
  value?: string;
  onChange: (value: Date | null) => void;
}

export function DateTimePicker({ value = "", onChange }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | null>(
    value ? new Date(value) : null
  );
  const prevValueRef = React.useRef(value);

  // Handle date updates when the `value` prop changes
  React.useEffect(() => {
    if (value !== prevValueRef.current) {
      const newDate = value ? new Date(value) : null;
      setDate(newDate);
      prevValueRef.current = value;
    }
  }, [value]);

  // Handle date selection from the calendar
  const handleSelect = (newDay: Date | undefined) => {
    if (!newDay) return;

    // Keep the current time when selecting a new day
    if (date) {
      const timePart = {
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
      };
      const newDateFull = add(newDay, timePart);
      setDate(newDateFull);
      onChange(newDateFull);
    } else {
      setDate(newDay);
      onChange(newDay);
    }
  };

  // Handle time picker updates
  const handleTimeChange = (newTime: Date) => {
    if (!date) return;
    const updatedDate = new Date(date);
    updatedDate.setHours(
      newTime.getHours(),
      newTime.getMinutes(),
      newTime.getSeconds()
    );
    setDate(updatedDate);
    onChange(updatedDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP HH:mm:ss") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={handleSelect}
          initialFocus
        />
        <div className="p-3 border-t border-border">
          <TimePickerDemo
            setDate={(value: Date | undefined) =>
              !!value && handleTimeChange(value)
            }
            date={date ?? new Date()}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
