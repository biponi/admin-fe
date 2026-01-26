/**
 * FloatingHelpButton Component
 * Floating action button for quick access to help and shortcuts
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Keyboard, Lightbulb, X, Zap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { cn } from "../lib/utils";

interface FloatingHelpButtonProps {
  onShowKeyboardShortcuts: () => void;
  onShowOnboarding: () => void;
  className?: string;
}

export const FloatingHelpButton: React.FC<FloatingHelpButtonProps> = ({
  onShowKeyboardShortcuts,
  onShowOnboarding,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    {
      icon: Keyboard,
      label: "Keyboard Shortcuts",
      description: "View all shortcuts",
      shortcut: "?",
      onClick: () => {
        onShowKeyboardShortcuts();
        setIsExpanded(false);
      },
      color: "text-blue-600",
      bgColor: "bg-blue-100 hover:bg-blue-200",
    },
    {
      icon: Lightbulb,
      label: "Quick Tour",
      description: "Show feature tour",
      onClick: () => {
        onShowOnboarding();
        setIsExpanded(false);
      },
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 hover:bg-yellow-200",
    },
    {
      icon: Zap,
      label: "Quick Tips",
      description: "Power user tips",
      onClick: () => {
        setIsExpanded(false);
      },
      color: "text-purple-600",
      bgColor: "bg-purple-100 hover:bg-purple-200",
    },
  ];

  return (
    <TooltipProvider delayDuration={100} skipDelayDuration={0}>
      <div
        className={cn(
          "fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2",
          className
        )}>
        {/* Menu Items - Icon only buttons with tooltips */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className='flex flex-col gap-2 mb-2'>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={item.onClick}
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-all",
                          item.bgColor,
                          item.color,
                          "border border-gray-200"
                        )}>
                        <item.icon className='h-5 w-5' />
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='left'
                      sideOffset={12}
                      align='center'
                      className='z-50'>
                      <div className='flex items-center gap-2'>
                        <p className='font-medium'>{item.label}</p>
                        {item.shortcut && (
                          <kbd className='inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold bg-gray-100 border border-gray-300 rounded'>
                            {item.shortcut}
                          </kbd>
                        )}
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        {item.description}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Help Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full shadow-lg",
                "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                "text-white transition-all duration-200",
                "focus:outline-none focus:ring-4 focus:ring-blue-300",
                isExpanded && "rotate-90"
              )}>
              {isExpanded ? (
                <X className='h-6 w-6' />
              ) : (
                <HelpCircle className='h-6 w-6' />
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent
            side='left'
            sideOffset={12}
            align='center'
            className='z-50'>
            <p className='font-medium'>
              {isExpanded ? "Close Help Menu" : "Help & Shortcuts"}
            </p>
            <p className='text-xs text-muted-foreground'>
              Press{" "}
              <kbd className='px-1 py-0.5 bg-gray-200 rounded text-xs'>?</kbd>{" "}
              for shortcuts
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Keyboard Shortcut Hint Badge */}
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className='absolute -top-2 -left-2 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md'>
            ?
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
};
