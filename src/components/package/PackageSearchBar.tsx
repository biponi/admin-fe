import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface PackageSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export function PackageSearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search packages by code, order number, customer name, or phone...",
  className,
}: PackageSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      // Auto-search when value changes (debouncing can be added if needed)
    }
  }, [value]);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className={`relative flex items-center transition-shadow ${
          isFocused ? "ring-2 ring-blue-500 ring-opacity-50 rounded-lg" : ""
        }`}
      >
        <Search className="absolute left-3 h-5 w-5 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="pl-10 pr-10 h-11 text-base border-gray-300 focus:border-blue-500 focus:ring-0"
        />
        {value && (
          <Button
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="absolute right-1 h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        )}
      </div>
    </div>
  );
}
