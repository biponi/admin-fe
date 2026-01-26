/**
 * Keyboard Shortcuts Hook
 * Provides system-wide keyboard shortcuts for power users
 */

import { useEffect, useCallback } from 'react';
import type { KeyboardShortcut } from '../types';

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: KeyboardShortcut[];
}

export const useKeyboardShortcuts = ({
  enabled = true,
  shortcuts,
}: UseKeyboardShortcutsOptions) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if user is in an input field first
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true';

      // Find matching shortcut
      const matchedShortcut = shortcuts.find((shortcut) => {
        if (shortcut.enabled === false) return false;

        // Handle key matching (case-insensitive)
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        if (!keyMatches) return false;

        // For shortcuts with meta key, match either metaKey (Mac) or ctrlKey (Windows/Linux)
        const modifierPressed = shortcut.meta
          ? (event.metaKey || event.ctrlKey)
          : false;

        // Check if ctrl is required (without meta)
        const ctrlMatches = shortcut.ctrl
          ? event.ctrlKey
          : (shortcut.meta ? true : !event.ctrlKey);

        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        // If meta is specified, check modifier (cmd on Mac, ctrl on Windows/Linux)
        const metaMatches = shortcut.meta
          ? modifierPressed
          : !event.metaKey;

        return keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches;
      });

      if (matchedShortcut) {
        // Allow certain shortcuts even in input fields (like Escape)
        const allowInInput =
          matchedShortcut.key === 'Escape' ||
          matchedShortcut.key === '?';

        if (!isInputField || allowInInput) {
          event.preventDefault();
          event.stopPropagation();
          matchedShortcut.action();
        }
      }
    },
    [enabled, shortcuts]
  );

  useEffect(() => {
    if (!enabled) return;

    // Use capture phase to intercept before browser default actions
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [enabled, handleKeyDown]);
};

/**
 * Format keyboard shortcut for display
 */
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.meta) parts.push('⌘');

  parts.push(shortcut.key.toUpperCase());

  return parts.join(' + ');
};

/**
 * Check if Mac
 */
export const isMac = () => {
  return typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};

/**
 * Get the modifier key symbol (Cmd on Mac, Ctrl on Windows/Linux)
 */
export const getModifierSymbol = () => {
  return isMac() ? '⌘' : 'Ctrl';
};
