import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, User, Phone, Loader2, ChevronDown } from "lucide-react";
import { customerSearchAPI } from "../../../api/customerSearch";
import type { CustomerListItem } from "../../../api/customerSearch";

interface CustomerSearchDropdownProps {
  onSelect: (customer: CustomerListItem) => void;
  placeholder?: string;
}

export function CustomerSearchDropdown({
  onSelect,
  placeholder = "Search existing customer...",
}: CustomerSearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Fetch customers on mount and when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      updateDropdownPosition();
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        fetchCustomers(searchQuery);
      } else if (isOpen) {
        fetchCustomers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        triggerRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Update dropdown position based on trigger button
  const updateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px margin (mt-2)
        left: rect.left,
        width: rect.width,
      });
    }
  };

  // Handle window scroll/resize to update position
  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => updateDropdownPosition();
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);

    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [isOpen]);

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
    <div className='relative w-full'>
      {/* Dropdown Trigger */}
      <button
        ref={triggerRef}
        type='button'
        onClick={() => {
          setIsOpen(!isOpen);
          inputRef.current?.focus();
        }}
        className='w-full flex items-center justify-between px-3 py-2.5 text-left bg-white border border-gray-200 rounded-lg hover:border-blue-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all'>
        <div className='flex items-center gap-2 flex-1 min-w-0'>
          <Search className='h-4 w-4 text-gray-400 shrink-0' />
          <span className='text-sm text-gray-700 truncate'>{displayText}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Content - Rendered via Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className='fixed z-[100] pointer-events-auto bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden'
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}>
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
                  autoFocus
                />
              </div>
            </div>

            {/* Customer List */}
            <div className='overflow-y-auto max-h-60'>
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
            </div>

            {/* Footer */}
            {customers.length > 0 && (
              <div className='px-3 py-2 bg-gray-50 border-t border-gray-100'>
                <p className='text-xs text-gray-500'>
                  {customers.length} customer{customers.length !== 1 ? "s" : ""}{" "}
                  found
                </p>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
