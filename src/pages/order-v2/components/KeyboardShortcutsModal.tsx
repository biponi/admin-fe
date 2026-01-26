/**
 * KeyboardShortcutsModal Component
 * Displays all available keyboard shortcuts
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Keyboard, Command, Plus, Filter, Settings } from 'lucide-react';
import { getModifierSymbol } from '../hooks/useKeyboardShortcuts';
import { CustomizeShortcutsModal } from './CustomizeShortcutsModal';
import { cn } from '../lib/utils';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customShortcuts?: Record<string, string[]>;
  onCustomShortcutsChange?: (shortcuts: Record<string, string[]>) => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: string;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  open,
  onOpenChange,
  customShortcuts = {},
  onCustomShortcutsChange,
}) => {
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const modKey = getModifierSymbol();

  const shortcuts: ShortcutItem[] = [
    // General
    { keys: [modKey, 'K'], description: 'Open command palette', category: 'General' },
    { keys: [modKey, '/'], description: 'Open command palette (alt)', category: 'General' },
    { keys: ['?'], description: 'Show keyboard shortcuts', category: 'General' },
    { keys: ['Esc'], description: 'Close dialogs/modals', category: 'General' },
    { keys: [modKey, 'R'], description: 'Refresh orders', category: 'General' },

    // Navigation
    { keys: [modKey, 'N'], description: 'Create new order', category: 'Navigation' },
    { keys: [modKey, 'F'], description: 'Focus search', category: 'Navigation' },
    { keys: [modKey, '←'], description: 'Previous page', category: 'Navigation' },
    { keys: [modKey, '→'], description: 'Next page', category: 'Navigation' },

    // Actions
    { keys: [modKey, 'A'], description: 'Select all orders', category: 'Actions' },
    { keys: [modKey, 'Shift', 'A'], description: 'Clear selection', category: 'Actions' },
    { keys: [modKey, 'D'], description: 'Download invoices', category: 'Actions' },
    { keys: [modKey, 'V'], description: 'View selected orders', category: 'Actions' },

    // Status Tabs
    { keys: ['1'], description: 'Show all orders', category: 'Status Tabs' },
    { keys: ['2'], description: 'Show processing', category: 'Status Tabs' },
    { keys: ['3'], description: 'Show shipped', category: 'Status Tabs' },
    { keys: ['4'], description: 'Show completed', category: 'Status Tabs' },
    { keys: ['5'], description: 'Show cancelled', category: 'Status Tabs' },
    { keys: ['6'], description: 'Show return orders', category: 'Status Tabs' },
  ];

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutItem[]>);

  const categories = [
    { name: 'General', icon: Keyboard },
    { name: 'Navigation', icon: Command },
    { name: 'Actions', icon: Plus },
    { name: 'Status Tabs', icon: Filter },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Keyboard className="h-6 w-6 text-blue-600" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Master these shortcuts to navigate faster and boost your productivity
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6 py-4">
            {categories.map(({ name, icon: Icon }) => {
              const categoryShortcuts = groupedShortcuts[name];
              if (!categoryShortcuts || categoryShortcuts.length === 0) return null;

              return (
                <div key={name}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      {name}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm text-gray-700">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIdx) => (
                            <React.Fragment key={keyIdx}>
                              <kbd
                                className={cn(
                                  'inline-flex items-center justify-center',
                                  'px-2 py-1 min-w-[2rem] h-7',
                                  'text-xs font-semibold',
                                  'bg-gray-100 text-gray-800',
                                  'border border-gray-300 rounded',
                                  'shadow-sm'
                                )}
                              >
                                {key}
                              </kbd>
                              {keyIdx < shortcut.keys.length - 1 && (
                                <span className="text-gray-400 text-xs mx-0.5">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Tips */}
        <div className="border-t pt-4 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">💡</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900 mb-1">Pro Tip</p>
                <p className="text-xs text-blue-700">
                  Press <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs font-semibold">{modKey}</kbd>{' '}
                  <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs font-semibold">K</kbd>{' '}
                  to quickly access any action through the command palette. You can also search
                  for orders by typing <code className="px-1 py-0.5 bg-white rounded text-xs">#123</code>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customize Button */}
        {onCustomShortcutsChange && (
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setCustomizeOpen(true)}
              className="w-full sm:w-auto"
            >
              <Settings className="h-4 w-4 mr-2" />
              Customize Shortcuts
            </Button>
          </DialogFooter>
        )}
      </DialogContent>

      {/* Customize Shortcuts Modal */}
      {onCustomShortcutsChange && (
        <CustomizeShortcutsModal
          open={customizeOpen}
          onOpenChange={setCustomizeOpen}
          defaultShortcuts={shortcuts.map((s, idx) => ({
            id: `shortcut-${idx}`,
            ...s,
          }))}
          customShortcuts={customShortcuts}
          onSave={(updated) => {
            onCustomShortcutsChange(updated);
            setCustomizeOpen(false);
          }}
        />
      )}
    </Dialog>
  );
};
