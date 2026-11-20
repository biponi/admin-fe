import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../components/ui/command";
import { cn } from "../../../lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Inline combobox (no Radix Popover / no portal / no focus scope).
//
// Portaled Popovers inside the vaul drawer lose the fight over focus with the
// drawer's internal (vaul never forwards `modal`, so the drawer runs a trapped
// FocusScope) — on mobile the search input ends up unable to hold focus or
// open the keyboard. This renders the list INSIDE the drawer DOM instead,
// exactly like the proven LocationCombobox in editOrderCustomer.tsx: a plain
// button toggle + absolutely-positioned cmdk panel + document mousedown
// outside-close. Focus and typing stay in the user's gesture.
// ─────────────────────────────────────────────────────────────────────────────

export interface InlineComboboxOption {
  /** Identity passed back through onValueChange */
  id: string;
  /** Text shown in the list */
  label: string;
  /** Extra searchable text (not shown) */
  keywords?: string;
}

interface InlineComboboxProps {
  value: string;
  onValueChange: (id: string) => void;
  options: InlineComboboxOption[];
  placeholder: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  itemClassName?: string;
}

export function InlineCombobox({
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  disabled = false,
  itemClassName,
}: InlineComboboxProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);

  // Close when clicking/tapping outside the whole combobox
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className='relative' ref={containerRef}>
      <Button
        type='button'
        variant='outline'
        role='combobox'
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "w-full justify-start h-9 border-border hover:bg-muted/50 transition-all font-normal text-foreground",
          !selected && "text-muted-foreground",
        )}>
        <span className='truncate'>{selected?.label ?? placeholder}</span>
        <ChevronsUpDown className='ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground' />
      </Button>

      {open && (
        <div className='absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg'>
          <Command>
            <CommandInput
              placeholder={searchPlaceholder ?? "Search..."}
              className='h-8 text-xs'
            />
            <CommandList className='max-h-48'>
              <CommandEmpty className='py-6 text-center text-xs text-muted-foreground'>
                No results found.
              </CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.id}
                    value={
                      opt.keywords ? `${opt.label} ${opt.keywords}` : opt.label
                    }
                    onSelect={() => {
                      onValueChange(opt.id);
                      setOpen(false);
                    }}
                    className={cn("cursor-pointer text-xs", itemClassName)}>
                    <Check
                      className={cn(
                        "mr-2 h-3 w-3",
                        value === opt.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span>{opt.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
