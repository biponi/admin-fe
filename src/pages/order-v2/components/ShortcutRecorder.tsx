/**
 * ShortcutRecorder Component
 * Records keyboard shortcut combinations when user presses keys
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Keyboard, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../lib/utils';

interface ShortcutRecorderProps {
  value: string[];
  onChange: (keys: string[]) => void;
  onCancel?: () => void;
  className?: string;
}

export const ShortcutRecorder: React.FC<ShortcutRecorderProps> = ({
  value,
  onChange,
  onCancel,
  className,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState<string[]>(value);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const normalizeKey = (key: string): string => {
    // Normalize modifier keys
    const keyMap: Record<string, string> = {
      Control: 'Ctrl',
      Meta: '⌘',
      Alt: 'Alt',
      Shift: 'Shift',
    };

    return keyMap[key] || key.toUpperCase();
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isRecording) return;

      event.preventDefault();
      event.stopPropagation();

      const newKeys = new Set(pressedKeys);
      const normalizedKey = normalizeKey(event.key);

      // Add modifier keys
      if (event.ctrlKey || event.metaKey) {
        newKeys.add(event.metaKey ? '⌘' : 'Ctrl');
      }
      if (event.shiftKey) newKeys.add('Shift');
      if (event.altKey) newKeys.add('Alt');

      // Add the main key if it's not a modifier
      if (!['Control', 'Meta', 'Alt', 'Shift'].includes(event.key)) {
        newKeys.add(normalizedKey);
      }

      setPressedKeys(newKeys);
    },
    [isRecording, pressedKeys]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!isRecording) return;

      event.preventDefault();
      event.stopPropagation();

      // When keys are released, save the combination
      if (pressedKeys.size > 0) {
        const keysArray = Array.from(pressedKeys);
        setRecordedKeys(keysArray);
        onChange(keysArray);
        setIsRecording(false);
        setPressedKeys(new Set());
      }
    },
    [isRecording, pressedKeys, onChange]
  );

  useEffect(() => {
    if (isRecording) {
      window.addEventListener('keydown', handleKeyDown, { capture: true });
      window.addEventListener('keyup', handleKeyUp, { capture: true });

      return () => {
        window.removeEventListener('keydown', handleKeyDown, { capture: true });
        window.removeEventListener('keyup', handleKeyUp, { capture: true });
      };
    }
  }, [isRecording, handleKeyDown, handleKeyUp]);

  const startRecording = () => {
    setPressedKeys(new Set());
    setIsRecording(true);
  };

  const clearShortcut = () => {
    setRecordedKeys([]);
    onChange([]);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center gap-1 px-3 py-2 rounded-lg border-2 min-w-[200px] transition-all',
          isRecording
            ? 'border-blue-500 bg-blue-50 animate-pulse'
            : 'border-gray-300 bg-white'
        )}
      >
        {isRecording ? (
          <span className="text-sm text-blue-600 font-medium animate-pulse">
            Press keys...
          </span>
        ) : recordedKeys.length > 0 ? (
          <div className="flex items-center gap-1 flex-wrap">
            {recordedKeys.map((key, index) => (
              <kbd
                key={index}
                className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold bg-gray-100 border border-gray-300 rounded"
              >
                {key}
              </kbd>
            ))}
          </div>
        ) : (
          <span className="text-sm text-gray-400">No shortcut set</span>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={startRecording}
        disabled={isRecording}
        className="h-9"
      >
        <Keyboard className="h-4 w-4 mr-1" />
        {isRecording ? 'Recording...' : 'Record'}
      </Button>

      {recordedKeys.length > 0 && !isRecording && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearShortcut}
          className="h-9"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {onCancel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-9"
        >
          Cancel
        </Button>
      )}
    </div>
  );
};
