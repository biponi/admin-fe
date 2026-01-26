/**
 * OnboardingTour Component
 * Interactive tour for new users to learn about Order V2 features
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Search,
  Filter,
  Package,
  Zap,
  Keyboard,
  Eye,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { cn } from '../lib/utils';
import { getModifierSymbol } from '../hooks/useKeyboardShortcuts';

interface OnboardingTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

interface TourStep {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlight?: boolean;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  open,
  onOpenChange,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const modKey = getModifierSymbol();

  const steps: TourStep[] = [
    {
      title: '👋 Welcome to Order Management V2!',
      description:
        "Let's take a quick tour of the new features that will help you manage orders faster and more efficiently.",
      icon: Package,
      position: 'center',
    },
    {
      title: '🔍 Powerful Search',
      description:
        'Use the search bar to quickly find orders by order number, customer name, or phone number. Try typing # followed by an order number!',
      icon: Search,
      targetSelector: 'input[type="text"]',
      position: 'bottom',
      highlight: true,
    },
    {
      title: '📊 Status Tabs',
      description:
        'Quickly filter orders by status using these tabs. You can also use number keys (1-6) to switch between tabs!',
      icon: Filter,
      targetSelector: '[role="tablist"]',
      position: 'bottom',
      highlight: true,
    },
    {
      title: '✅ Bulk Actions',
      description:
        'Select multiple orders by checking the boxes, then use the bulk action bar to perform actions on all selected orders at once.',
      icon: CheckCircle,
      position: 'center',
    },
    {
      title: '👁️ View Selected Orders',
      description:
        'Click the "View List" button in the bulk actions bar to see all your selected orders in a beautiful organized view.',
      icon: Eye,
      position: 'center',
    },
    {
      title: '⚡ Keyboard Shortcuts',
      description: `Press ${modKey}+K to open the command palette for quick actions, or press ? to see all available shortcuts. Master these to become a power user!`,
      icon: Keyboard,
      position: 'center',
    },
    {
      title: '🚀 You\'re All Set!',
      description:
        'You now know the basics of Order Management V2. Remember, you can always press ? to see keyboard shortcuts or click the help button in the bottom-right corner.',
      icon: Zap,
      position: 'center',
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    onOpenChange(false);
    setCurrentStep(0);
  };

  // Get position for the tooltip based on target element
  const getTooltipPosition = () => {
    if (!currentStepData.targetSelector) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    // This is simplified - in production you'd calculate actual element positions
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  };

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
    }
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleSkip}
          />

          {/* Highlight Target Element */}
          {currentStepData.highlight && currentStepData.targetSelector && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed z-[101] pointer-events-none"
              style={{
                // This would be calculated based on actual element position
                ...getTooltipPosition(),
              }}
            >
              <div className="w-64 h-16 border-4 border-blue-500 rounded-lg animate-pulse" />
            </motion.div>
          )}

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed z-[102] max-w-md w-full"
            style={getTooltipPosition()}
          >
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <currentStepData.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {currentStepData.title}
                      </h3>
                      <p className="text-xs text-blue-100">
                        Step {currentStep + 1} of {steps.length}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Progress value={progress} className="h-1 bg-blue-400" />
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-600"
                >
                  Skip Tour
                </Button>

                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        Get Started
                        <CheckCircle className="h-4 w-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Step Indicators */}
              <div className="flex items-center justify-center gap-1.5 pb-3">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      index === currentStep
                        ? 'w-6 bg-blue-600'
                        : index < currentStep
                        ? 'w-1.5 bg-blue-400'
                        : 'w-1.5 bg-gray-300'
                    )}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
