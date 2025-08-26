import React from "react";
import { CheckCircle2, Clock, Sparkles } from "lucide-react";
import { cn } from "../../../utils/functions";

interface Step {
  id: number;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "complete" | "in-progress" | "pending";
}

interface MobileStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

const MobileStepper: React.FC<MobileStepperProps> = ({
  steps,
  currentStep,
  className,
}) => {
  return (
    <div className={cn("px-4 py-4 bg-gray-50 hidden", className)}>
      <div className='space-y-4 flex justify-between items-center'>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
          const isPending = index > currentStep;

          return (
            <div
              key={step.id}
              className={cn(
                "relative flex items-center p-4 rounded-xl transition-all duration-300 border touch-manipulation",
                isComplete && "bg-green-50 border-green-200 shadow-sm",
                isActive && "bg-white border-primary shadow-xl scale-[1.02]",
                isPending && "bg-white border-gray-200"
              )}>
              {/* Connection Line with better visibility */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-10 top-20 w-0.5 h-8 transition-colors duration-500 hidden",
                    isComplete ? "bg-green-300" : "bg-gray-300"
                  )}
                />
              )}

              {/* Step Icon with enhanced visual feedback */}
              <div
                className={cn(
                  "relative z-10 w-5 h-5 rounded-full flex items-center justify-center mr-2 transition-all duration-500",
                  isComplete && "bg-green-500 text-white shadow-xl",
                  isActive && "bg-primary text-white shadow-2xl animate-pulse",
                  isPending && "bg-gray-300 text-gray-500"
                )}>
                {isComplete ? (
                  <CheckCircle2 className='w-3 h-3' />
                ) : (
                  <Icon className='w-3 h-3' />
                )}

                {/* Active indicator with better visual feedback */}
                {isActive && (
                  <div className='absolute -inset-2 bg-primary/20 rounded-full animate-ping hidden' />
                )}
              </div>

              {/* Step Content */}
              <div className='flex-1 min-w-0 '>
                <div className='flex items-center gap-2 mb-1.5'>
                  <h3
                    className={cn(
                      "font-semibold text-base transition-colors duration-300",
                      isComplete && "text-green-800",
                      isActive && "text-primary",
                      isPending && "text-gray-600"
                    )}>
                    {step.name}
                  </h3>

                  {isActive && (
                    <div className='flex items-center gap-1 hidden'>
                      <div className='w-2 h-2 bg-primary rounded-full animate-pulse' />
                      <div className='w-1 h-1 bg-primary/60 rounded-full animate-pulse delay-100' />
                      <div className='w-1 h-1 bg-primary/40 rounded-full animate-pulse delay-200' />
                    </div>
                  )}
                </div>

                <p
                  className={cn(
                    "text-sm leading-relaxed transition-colors duration-300 hidden",
                    isComplete && "text-green-600",
                    isActive && "text-primary/80 font-medium",
                    isPending && "text-gray-500"
                  )}>
                  {step.description}
                </p>
              </div>

              {/* Status Badge with better mobile visibility */}
              <div className=' flex-col items-end gap-1 hidden'>
                {isComplete && (
                  <div className='flex items-center gap-1.5 px-3 py-1.5 bg-green-100 rounded-full'>
                    <CheckCircle2 className='w-4 h-4 text-green-600' />
                    <span className='text-sm font-medium text-green-700'>
                      Done
                    </span>
                  </div>
                )}

                {isActive && (
                  <div className='flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full'>
                    <Clock className='w-4 h-4 text-primary' />
                    <span className='text-sm font-medium text-primary'>
                      Active
                    </span>
                  </div>
                )}

                {isPending && (
                  <div className='flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full'>
                    <div className='w-4 h-4 rounded-full bg-gray-400' />
                    <span className='text-sm font-medium text-gray-500'>
                      Pending
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom decoration with improved mobile design */}
      <div className='mt-8 flex items-center justify-center'>
        <div className='flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-lg border border-gray-200'>
          <Sparkles className='w-5 h-5 text-primary' />
          <span className='text-sm font-medium text-gray-700'>
            Creating your order
          </span>
        </div>
      </div>
    </div>
  );
};

export default MobileStepper;
