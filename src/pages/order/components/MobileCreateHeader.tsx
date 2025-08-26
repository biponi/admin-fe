import React from "react";
import {
  ArrowLeft,
  Package2,
  CheckCircle,
  User,
  ShoppingCart,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../utils/functions";

interface MobileCreateHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  stepTitle: string;
  stepDescription: string;
}

const MobileCreateHeader: React.FC<MobileCreateHeaderProps> = ({
  currentStep,
  totalSteps,
  onBack,
  stepTitle,
  stepDescription,
}) => {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  const stepIcons = [
    ShoppingCart, // Select Products
    User, // Customer Details
    CheckCircle, // Review & Create
  ];

  const CurrentIcon = stepIcons[currentStep] || Package2;

  return (
    <div className='bg-gradient-to-br from-primary/80 to-primary text-white sticky top-0 z-50 sm:hidden rounded-none'>
      {/* Status Bar Background with proper safe area */}
      <div className=' bg-primary/20' />

      {/* Header Content with optimized touch targets */}
      <div className='p-2'>
        {/* Top Row */}
        <div className='flex items-center justify-between mb-3'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onBack}
            className='h-6 w-6 p-0 text-white hover:bg-white/10 rounded-full touch-manipulation'>
            <ArrowLeft className='h-5 w-5' />
          </Button>

          <div className='flex items-center gap-2'>
            <Badge
              variant='secondary'
              className='bg-white/20 text-white border-0 px-3 py-1 text-sm font-medium'>
              Step {currentStep + 1}/{totalSteps}
            </Badge>
          </div>
        </div>

        {/* Title Section with better typography */}
        <div className='flex items-center gap-3 mb-4'>
          <div className='h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm'>
            <CurrentIcon className='h-6 w-6 text-white' />
          </div>
          <div className='flex-1 min-w-0'>
            <h1 className='text-xl font-bold text-white truncate'>
              {stepTitle}
            </h1>
            <p className='text-white/80 text-sm leading-tight'>
              {stepDescription}
            </p>
          </div>
        </div>

        {/* Progress Section with enhanced visibility */}
        <div className='space-y-2'>
          <div className='flex justify-between items-center text-sm'>
            <span className='text-white/90 font-medium'>Progress</span>
            <span className='text-white font-semibold'>
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className='relative'>
            <div className='h-2 bg-white/20 rounded-full overflow-hidden'>
              <div
                className='h-full bg-white rounded-full transition-all duration-700 ease-out shadow-sm'
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Step Indicators with improved touch visibility */}
            <div className='absolute -top-1.5 left-0 right-0 flex justify-between'>
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-4 w-4 rounded-full border-2 transition-all duration-500",
                    index <= currentStep
                      ? "bg-white border-white shadow-lg"
                      : "bg-transparent border-white/50"
                  )}
                  style={{
                    transform: index <= currentStep ? "scale(1.1)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient with better visual separation */}
      <div className='h-4 bg-gradient-to-b from-transparent to-gray-50/30' />
    </div>
  );
};

export default MobileCreateHeader;
