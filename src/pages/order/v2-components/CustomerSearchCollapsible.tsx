import { useState, useEffect, useRef } from "react";
import { Search, User, Phone, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { customerSearchAPI } from "../../../api/customerSearch";
import type { CustomerListItem } from "../../../api/customerSearch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/ui/collapsible";
import { ScrollArea } from "../../../components/ui/scroll-area";

interface CustomerSearchCollapsibleProps {
  onSelect: (customer: CustomerListItem) => void;
  placeholder?: string;
}

export function CustomerSearchCollapsible({
  onSelect,
  placeholder = "Search existing customer...",
}: CustomerSearchCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch customers when collapsible opens
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      // Focus input after it becomes visible
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Reset state when closed
      setSearchQuery("");
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        fetchCustomers(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    setSearchQuery("");
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || customers.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < customers.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < customers.length) {
          handleSelect(customers[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const displayText = searchQuery || placeholder;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        type='button'
        className='w-full flex items-center justify-between px-3 py-2.5 text-left bg-white border border-gray-200 rounded-lg hover:border-blue-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all'>
        <div className='flex items-center gap-2 flex-1 min-w-0'>
          <Search className='h-4 w-4 text-gray-400 shrink-0' />
          <span className='text-sm text-gray-700 truncate'>{displayText}</span>
        </div>
        {isOpen ? (
          <ChevronUp className='h-4 w-4 text-gray-400 shrink-0' />
        ) : (
          <ChevronDown className='h-4 w-4 text-gray-400 shrink-0' />
        )}
      </CollapsibleTrigger>

      <CollapsibleContent className='mt-2 overflow-hidden transition-all duration-300 ease-in-out'>
        <div className='border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm'>
          {/* Search Input */}
          <div className='p-3 border-b border-gray-100'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                ref={inputRef}
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Type to search...'
                className='w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20'
              />
            </div>
          </div>

          {/* Customer List */}
          <ScrollArea className='max-h-60'>
            {loading ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
                <span className='ml-2 text-sm text-gray-500'>
                  Loading customers...
                </span>
              </div>
            ) : customers.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-8 text-center px-4'>
                <User className='h-10 w-10 text-gray-300 mb-2' />
                <p className='text-sm text-gray-500'>No customers found</p>
                <p className='text-xs text-gray-400 mt-1'>
                  Try a different search term
                </p>
              </div>
            ) : (
              <ul className='py-1'>
                {customers.map((customerItem, index) => (
                  <li
                    key={customerItem.customer.mobile}
                    onClick={() => handleSelect(customerItem)}
                    className={`px-3 py-2.5 cursor-pointer transition-colors ${
                      index === selectedIndex
                        ? "bg-blue-50 border-l-4 border-blue-600"
                        : "hover:bg-gray-50"
                    }`}>
                    <div className='flex items-center gap-3'>
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
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>

          {/* Footer */}
          {customers.length > 0 && (
            <div className='px-3 py-2 bg-gray-50 border-t border-gray-100'>
              <p className='text-xs text-gray-500'>
                {customers.length} customer{customers.length !== 1 ? "s" : ""}{" "}
                found
              </p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
