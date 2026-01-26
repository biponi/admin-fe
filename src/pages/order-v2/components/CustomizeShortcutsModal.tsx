/**
 * CustomizeShortcutsModal Component
 * Allows users to customize keyboard shortcuts
 */

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import {
  AlertTriangle,
  RotateCcw,
  Search,
  Keyboard,
  Save,
  X,
} from 'lucide-react';
import { ShortcutRecorder } from './ShortcutRecorder';
import { cn } from '../lib/utils';

interface ShortcutConfig {
  id: string;
  keys: string[];
  description: string;
  category: string;
  isCustom?: boolean;
}

interface CustomizeShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultShortcuts: ShortcutConfig[];
  customShortcuts: Record<string, string[]>;
  onSave: (customShortcuts: Record<string, string[]>) => void;
}

export const CustomizeShortcutsModal: React.FC<CustomizeShortcutsModalProps> = ({
  open,
  onOpenChange,
  defaultShortcuts,
  customShortcuts,
  onSave,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempCustomShortcuts, setTempCustomShortcuts] = useState<Record<string, string[]>>(
    customShortcuts
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Merge default and custom shortcuts
  const shortcuts = useMemo(() => {
    return defaultShortcuts.map((shortcut) => ({
      ...shortcut,
      keys: tempCustomShortcuts[shortcut.id] || shortcut.keys,
      isCustom: !!tempCustomShortcuts[shortcut.id],
    }));
  }, [defaultShortcuts, tempCustomShortcuts]);

  // Filter shortcuts based on search
  const filteredShortcuts = useMemo(() => {
    if (!searchQuery.trim()) return shortcuts;

    const query = searchQuery.toLowerCase();
    return shortcuts.filter(
      (shortcut) =>
        shortcut.description.toLowerCase().includes(query) ||
        shortcut.category.toLowerCase().includes(query) ||
        shortcut.keys.some((key) => key.toLowerCase().includes(query))
    );
  }, [shortcuts, searchQuery]);

  // Group by category
  const groupedShortcuts = useMemo(() => {
    return filteredShortcuts.reduce((acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    }, {} as Record<string, ShortcutConfig[]>);
  }, [filteredShortcuts]);

  // Check for conflicts
  const checkConflicts = (keys: string[], currentId: string): string[] => {
    const conflicts: string[] = [];
    const keyString = keys.join('+');

    shortcuts.forEach((shortcut) => {
      if (shortcut.id !== currentId && shortcut.keys.join('+') === keyString) {
        conflicts.push(shortcut.description);
      }
    });

    return conflicts;
  };

  const handleShortcutChange = (id: string, keys: string[]) => {
    const foundConflicts = checkConflicts(keys, id);
    setConflicts(foundConflicts);

    setTempCustomShortcuts((prev) => ({
      ...prev,
      [id]: keys,
    }));
  };

  const handleReset = (id: string) => {
    const updated = { ...tempCustomShortcuts };
    delete updated[id];
    setTempCustomShortcuts(updated);
    setEditingId(null);
    setConflicts([]);
  };

  const handleResetAll = () => {
    setTempCustomShortcuts({});
    setEditingId(null);
    setConflicts([]);
  };

  const handleSave = () => {
    onSave(tempCustomShortcuts);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempCustomShortcuts(customShortcuts);
    setEditingId(null);
    setConflicts([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Keyboard className="h-6 w-6 text-blue-600" />
            Customize Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Click "Record" to set a new shortcut combination. Press Escape to cancel recording.
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Conflicts Alert */}
        {conflicts.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This shortcut conflicts with: {conflicts.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Shortcuts List */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border transition-all',
                        editingId === shortcut.id
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {shortcut.description}
                          </span>
                          {shortcut.isCustom && (
                            <Badge variant="outline" className="text-xs">
                              Custom
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {editingId === shortcut.id ? (
                          <ShortcutRecorder
                            value={shortcut.keys}
                            onChange={(keys) => handleShortcutChange(shortcut.id, keys)}
                            onCancel={() => setEditingId(null)}
                          />
                        ) : (
                          <>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, index) => (
                                <kbd
                                  key={index}
                                  className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold bg-gray-100 border border-gray-300 rounded"
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(shortcut.id)}
                              className="h-8"
                            >
                              Edit
                            </Button>
                            {shortcut.isCustom && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReset(shortcut.id)}
                                className="h-8"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleResetAll}
            className="mr-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All to Defaults
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={conflicts.length > 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
