import { useState, useEffect, useRef, useCallback } from "react";
import { Search, User, Phone, Loader2 } from "lucide-react";
import { customerSearchAPI } from "../../../api/customerSearch";
import type { CustomerListItem } from "../../../api/customerSearch";
import { Button } from "../../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../components/ui/command";

interface CustomerSearchCollapsibleProps {
  onSelect: (customer: CustomerListItem) => void;
  placeholder?: string;
}

export function CustomerSearchCollapsible({
  onSelect,
  placeholder = "Search existing customer...",
}: CustomerSearchCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch customers when popover opens
  useEffect(() => {
    if (isOpen) {
      // Add a small delay before fetching to prevent sudden splash
      const fetchTimer = setTimeout(() => {
        fetchCustomers();
      }, 300);

      return () => {
        clearTimeout(fetchTimer);
        if (searchTimerRef.current) {
          clearTimeout(searchTimerRef.current);
        }
      };
    }
  }, [isOpen]);

  // Debounced search handler
  const handleSearch = useCallback((value: string) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      fetchCustomers(value);
    }, 500);
  }, []);

  const fetchCustomers = async (search: string = "") => {
    setLoading(true);
    try {
      const response = await customerSearchAPI.getCustomerList(search, 10);
      if (response.success) {
        setCustomers(response.data);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (customer: CustomerListItem) => {
    onSelect(customer);
    setIsOpen(false);
  };

  const displayText = placeholder;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className='w-full justify-start h-auto py-2.5 px-3 border-gray-200 hover:border-blue-400 focus:border-blue-400 transition-all font-normal'>
          <div className='flex items-center gap-2 flex-1 min-w-0'>
            <Search className='h-4 w-4 text-gray-400 shrink-0' />
            <span className='text-sm text-gray-700 truncate'>{displayText}</span>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-[400px] p-0' align='start'>
        <Command>
          <CommandInput
            placeholder='Type to search...'
            onValueChange={handleSearch}
          />
          <CommandList>
            {loading ? (
              <div className='flex items-center justify-center py-8 animate-fade-in'>
                <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
                <span className='ml-2 text-sm text-gray-500'>
                  Loading customers...
                </span>
              </div>
            ) : customers.length === 0 ? (
              <CommandEmpty>
                <div className='flex flex-col items-center justify-center py-8 text-center px-4'>
                  <User className='h-10 w-10 text-gray-300 mb-2' />
                  <p className='text-sm text-gray-500'>No customers found</p>
                  <p className='text-xs text-gray-400 mt-1'>
                    Try a different search term
                  </p>
                </div>
              </CommandEmpty>
            ) : (
              <>
                <CommandGroup>
                  {customers.map((customerItem) => (
                    <CommandItem
                      key={customerItem.customer.mobile}
                      value={customerItem.customer.mobile}
                      onSelect={() => handleSelect(customerItem)}
                      className='px-3 py-2.5'>
                      <div className='flex items-center gap-3 w-full'>
                        <div className='h-9 w-9 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shrink-0'>
                          <User className='h-4 w-4 text-blue-600' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-gray-900 truncate'>
                            {customerItem.customer.name}
                          </p>
                          <p className='text-xs text-gray-500 flex items-center gap-1'>
                            <Phone className='h-3 w-3' />
                            {customerItem.customer.mobile}
                          </p>
                          {customerItem.orderCount !== undefined && (
                            <p className='text-xs text-gray-400 mt-0.5'>
                              {customerItem.orderCount} order
                              {customerItem.orderCount !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {customers.length > 0 && (
                  <div className='px-3 py-2 bg-gray-50 border-t border-gray-100'>
                    <p className='text-xs text-gray-500'>
                      {customers.length} customer{customers.length !== 1 ? "s" : ""}{" "}
                      found
                    </p>
                  </div>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
