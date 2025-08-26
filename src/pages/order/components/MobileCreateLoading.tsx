import React from "react";
import {
  CheckCircle2,
  Loader2,
  Clock,
  Send,
  Sparkles,
  CreditCard,
  Truck,
} from "lucide-react";
import { cn } from "../../../utils/functions";

interface MobileCreateLoadingProps {
  className?: string;
}

const MobileCreateLoading: React.FC<MobileCreateLoadingProps> = ({
  className,
}) => {
  const steps = [
    {
      icon: CheckCircle2,
      text: "Validating products",
      status: "completed",
      delay: "0ms",
    },
    {
      icon: Loader2,
      text: "Processing order details",
      status: "processing",
      delay: "500ms",
    },
    {
      icon: CreditCard,
      text: "Setting up payment",
      status: "pending",
      delay: "1000ms",
    },
    {
      icon: Truck,
      text: "Finalizing delivery",
      status: "pending",
      delay: "1500ms",
    },
  ];

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-primary/5 via-blue-50 to-purple-50 sm:hidden",
        className
      )}>
      {/* Status Bar */}
      <div className='h-6 bg-primary/10 safe-area-inset-top' />

      {/* Header */}
      <div className='px-4 pt-8 pb-6'>
        <div className='text-center'>
          <div className='relative mb-6'>
            {/* Main Loading Icon */}
            <div className='w-20 h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto shadow-xl'>
              <Loader2 className='w-10 h-10 text-white animate-spin' />
            </div>

            {/* Floating Send Icon */}
            <div
              className='absolute top-2 -right-2 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce'
              style={{ animationDelay: "0.5s" }}>
              <Send className='w-6 h-6 text-white' />
            </div>

            {/* Decorative Particles */}
            <div className='absolute -top-4 -left-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping' />
            <div
              className='absolute -bottom-2 left-2 w-2 h-2 bg-pink-400 rounded-full animate-ping'
              style={{ animationDelay: "1s" }}
            />
            <div
              className='absolute top-8 -right-6 w-2 h-2 bg-purple-400 rounded-full animate-ping'
              style={{ animationDelay: "1.5s" }}
            />
          </div>

          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            Creating Your Order
          </h2>
          <p className='text-gray-600 flex items-center justify-center gap-2'>
            <Clock className='w-4 h-4' />
            Please wait while we process everything...
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className='px-4 space-y-3'>
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-4 rounded-2xl transition-all duration-500 border-2",
                step.status === "completed" &&
                  "bg-green-50 border-green-200 shadow-sm",
                step.status === "processing" &&
                  "bg-blue-50 border-blue-200 shadow-md",
                step.status === "pending" && "bg-gray-50 border-gray-200"
              )}
              style={{ animationDelay: step.delay }}>
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  step.status === "completed" && "bg-green-500 text-white",
                  step.status === "processing" && "bg-blue-500 text-white",
                  step.status === "pending" && "bg-gray-300 text-gray-500"
                )}>
                <Icon
                  className={cn(
                    "w-5 h-5",
                    step.status === "processing" && "animate-spin"
                  )}
                />
              </div>

              <span
                className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  step.status === "completed" && "text-green-800",
                  step.status === "processing" && "text-blue-800",
                  step.status === "pending" && "text-gray-600"
                )}>
                {step.text}
              </span>

              {/* Status Indicator */}
              <div className='ml-auto'>
                {step.status === "completed" && (
                  <div className='w-2 h-2 bg-green-500 rounded-full' />
                )}
                {step.status === "processing" && (
                  <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse' />
                )}
                {step.status === "pending" && (
                  <div className='w-2 h-2 bg-gray-300 rounded-full' />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Message */}
      <div className='mt-8 mx-4'>
        <div className='bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center'>
              <Sparkles className='w-4 h-4 text-white' />
            </div>
            <div>
              <p className='text-sm font-semibold text-yellow-800'>
                Almost done!
              </p>
              <p className='text-xs text-yellow-700'>
                Your order is being created with love ✨
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Animation */}
      <div className='fixed bottom-8 left-1/2 transform -translate-x-1/2'>
        <div className='flex items-center gap-1'>
          <div className='w-2 h-2 bg-primary rounded-full animate-bounce' />
          <div
            className='w-2 h-2 bg-primary rounded-full animate-bounce'
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className='w-2 h-2 bg-primary rounded-full animate-bounce'
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileCreateLoading;
