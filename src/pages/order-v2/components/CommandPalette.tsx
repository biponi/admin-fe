/**
 * CommandPalette Component
 * ⌘K powered command palette for quick actions
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../../../components/ui/command';
import {
  Plus,
  Filter,
  RefreshCw,
  Trash2,
  Package,
  Users,
  TrendingUp,
  FileText,
  HelpCircle,
  Keyboard,
} from 'lucide-react';
import { useOrderStore } from '../store/orderStore';
import { useUIStore } from '../store/uiStore';
import { formatOrderNumber } from '../lib/utils';
import type { CommandAction } from '../types';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    orders,
    refreshOrders,
    setFilters,
    clearFilters,
    clearSelection,
  } = useOrderStore();

  const {
    showToast,
    openSheet,
    toggleKeyboardShortcutsModal,
    setViewMode,
  } = useUIStore();

  // Reset search on close
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  // Define all available commands
  const commands: CommandAction[] = useMemo(
    () => [
      // Quick Actions
      {
        id: 'new-order',
        label: 'Create New Order',
        description: 'Start creating a new order',
        section: 'Actions',
        icon: <Plus className="h-4 w-4" />,
        keywords: ['create', 'new', 'add', 'order'],
        perform: () => {
          showToast({ type: 'info', title: 'Opening order creation...' });
          // Navigate to create order or open modal
          onOpenChange(false);
        },
      },
      {
        id: 'refresh',
        label: 'Refresh Orders',
        description: 'Reload order list',
        section: 'Actions',
        icon: <RefreshCw className="h-4 w-4" />,
        keywords: ['refresh', 'reload', 'sync'],
        perform: () => {
          refreshOrders();
          showToast({ type: 'success', title: 'Orders refreshed' });
          onOpenChange(false);
        },
      },
      {
        id: 'clear-selection',
        label: 'Clear Selection',
        description: 'Deselect all selected orders',
        section: 'Actions',
        icon: <Trash2 className="h-4 w-4" />,
        keywords: ['clear', 'deselect', 'unselect'],
        perform: () => {
          clearSelection();
          showToast({ type: 'info', title: 'Selection cleared' });
          onOpenChange(false);
        },
      },

      // Filters
      {
        id: 'filter-processing',
        label: 'Show Processing Orders',
        description: 'Filter by processing status',
        section: 'Filters',
        icon: <Filter className="h-4 w-4" />,
        keywords: ['filter', 'processing', 'status'],
        perform: () => {
          setFilters({ status: 'processing' });
          showToast({ type: 'info', title: 'Filtered to Processing' });
          onOpenChange(false);
        },
      },
      {
        id: 'filter-shipped',
        label: 'Show Shipped Orders',
        description: 'Filter by shipped status',
        section: 'Filters',
        icon: <Filter className="h-4 w-4" />,
        keywords: ['filter', 'shipped', 'status'],
        perform: () => {
          setFilters({ status: 'shipped' });
          showToast({ type: 'info', title: 'Filtered to Shipped' });
          onOpenChange(false);
        },
      },
      {
        id: 'filter-completed',
        label: 'Show Completed Orders',
        description: 'Filter by completed status',
        section: 'Filters',
        icon: <Filter className="h-4 w-4" />,
        keywords: ['filter', 'completed', 'done', 'status'],
        perform: () => {
          setFilters({ status: 'completed' });
          showToast({ type: 'info', title: 'Filtered to Completed' });
          onOpenChange(false);
        },
      },
      {
        id: 'clear-filters',
        label: 'Clear All Filters',
        description: 'Remove all active filters',
        section: 'Filters',
        icon: <Filter className="h-4 w-4" />,
        keywords: ['clear', 'reset', 'filter'],
        perform: () => {
          clearFilters();
          showToast({ type: 'info', title: 'Filters cleared' });
          onOpenChange(false);
        },
      },

      // View Options
      {
        id: 'view-table',
        label: 'Table View',
        description: 'Switch to table view',
        section: 'View',
        icon: <Package className="h-4 w-4" />,
        keywords: ['view', 'table', 'list'],
        perform: () => {
          setViewMode('table');
          onOpenChange(false);
        },
      },
      {
        id: 'view-card',
        label: 'Card View',
        description: 'Switch to card view',
        section: 'View',
        icon: <Package className="h-4 w-4" />,
        keywords: ['view', 'card', 'grid'],
        perform: () => {
          setViewMode('card');
          onOpenChange(false);
        },
      },

      // Navigation
      {
        id: 'goto-customers',
        label: 'Go to Customers',
        description: 'Navigate to customers page',
        section: 'Navigation',
        icon: <Users className="h-4 w-4" />,
        keywords: ['goto', 'navigate', 'customers', 'users'],
        perform: () => {
          navigate('/customers');
          onOpenChange(false);
        },
      },
      {
        id: 'goto-analytics',
        label: 'Go to Analytics',
        description: 'Navigate to analytics page',
        section: 'Navigation',
        icon: <TrendingUp className="h-4 w-4" />,
        keywords: ['goto', 'navigate', 'analytics', 'reports', 'stats'],
        perform: () => {
          navigate('/analytics');
          onOpenChange(false);
        },
      },

      // Help
      {
        id: 'keyboard-shortcuts',
        label: 'Keyboard Shortcuts',
        description: 'View all keyboard shortcuts',
        section: 'Help',
        icon: <Keyboard className="h-4 w-4" />,
        keywords: ['help', 'keyboard', 'shortcuts', 'hotkeys'],
        perform: () => {
          toggleKeyboardShortcutsModal();
          onOpenChange(false);
        },
      },
      {
        id: 'help',
        label: 'Help & Documentation',
        description: 'View help documentation',
        section: 'Help',
        icon: <HelpCircle className="h-4 w-4" />,
        keywords: ['help', 'docs', 'documentation', 'guide'],
        perform: () => {
          window.open('https://docs.example.com', '_blank');
          onOpenChange(false);
        },
      },
    ],
    [
      refreshOrders,
      setFilters,
      clearFilters,
      clearSelection,
      showToast,
      setViewMode,
      toggleKeyboardShortcutsModal,
      navigate,
      onOpenChange,
    ]
  );

  // Filter commands based on search query
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return commands;

    const query = searchQuery.toLowerCase();
    return commands.filter((cmd) => {
      const labelMatch = cmd.label.toLowerCase().includes(query);
      const descMatch = cmd.description?.toLowerCase().includes(query);
      const keywordMatch = cmd.keywords?.some((k) => k.toLowerCase().includes(query));

      return labelMatch || descMatch || keywordMatch;
    });
  }, [commands, searchQuery]);

  // Group commands by section
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandAction[]> = {};

    filteredCommands.forEach((cmd) => {
      const section = cmd.section || 'Other';
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(cmd);
    });

    return groups;
  }, [filteredCommands]);

  // Recent orders for quick access
  const recentOrders = useMemo(() => {
    if (!searchQuery.startsWith('#')) return [];

    const query = searchQuery.slice(1).toLowerCase();
    return orders
      .filter((order) => {
        const orderNum = formatOrderNumber(order.orderNumber).toLowerCase();
        return orderNum.includes(query);
      })
      .slice(0, 5);
  }, [orders, searchQuery]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search orders (#123)..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <>
            <CommandGroup heading="Orders">
              {recentOrders.map((order) => (
                <CommandItem
                  key={order._id}
                  onSelect={() => {
                    openSheet({
                      id: 'order-details',
                      type: 'order-details',
                      data: order,
                    });
                    onOpenChange(false);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{formatOrderNumber(order.orderNumber)}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    - {order.customer.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Grouped Commands */}
        {Object.entries(groupedCommands).map(([section, cmds], idx) => (
          <React.Fragment key={section}>
            <CommandGroup heading={section}>
              {cmds.map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => cmd.perform()}
                  className="cursor-pointer"
                >
                  {cmd.icon && <span className="mr-2">{cmd.icon}</span>}
                  <div className="flex flex-col">
                    <span>{cmd.label}</span>
                    {cmd.description && (
                      <span className="text-xs text-muted-foreground">
                        {cmd.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {idx < Object.entries(groupedCommands).length - 1 && <CommandSeparator />}
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
};
