/**
 * Order Management Entry Point
 * Allows users to toggle between V1 (classic) and V2 (modern) views
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft, Settings } from "lucide-react";
import { OrderListV2 } from "./OrderListV2";
import OrderList from "../order/orderList"; // V1 import
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { pageTransition } from "./lib/animations";
import { useIsMobile } from "../../hooks/use-mobile";

const ORDER_VIEW_PREFERENCE_KEY = "order_view_preference";

type ViewVersion = "v1" | "v2";

export const OrderManagement: React.FC = () => {
  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState<ViewVersion>(() => {
    // Load saved preference
    const saved = localStorage.getItem(ORDER_VIEW_PREFERENCE_KEY);
    return (saved as ViewVersion) || "v2"; // Default to V2
  });

  const [showVersionBanner, setShowVersionBanner] = useState(true);

  useEffect(() => {
    // Save preference
    localStorage.setItem(ORDER_VIEW_PREFERENCE_KEY, currentView);
  }, [currentView]);

  // Listen for changes from settings panel
  useEffect(() => {
    const handleOrderViewChange = (event: CustomEvent<ViewVersion>) => {
      setCurrentView(event.detail);
    };

    window.addEventListener(
      "orderViewChanged",
      handleOrderViewChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "orderViewChanged",
        handleOrderViewChange as EventListener
      );
    };
  }, []);

  return (
    <div className='relative h-full w-full'>
      {/* Version Banner (shown for first-time users) */}
      {showVersionBanner && currentView === "v2" && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className='fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'>
          <div className='container mx-auto px-4 py-3 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Sparkles className='h-5 w-5 animate-pulse' />
              <div>
                <p className='font-semibold text-sm sm:text-base'>
                  Welcome to the new Order Management experience!
                </p>
                <p className='text-xs sm:text-sm text-blue-100'>
                  Modern UI, faster performance, and exciting new features
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setCurrentView("v1")}
                className='text-white hover:bg-white/20'>
                Switch to Classic
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowVersionBanner(false)}
                className='text-white hover:bg-white/20'>
                Got it
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Version Toggle (Floating Button) */}
      <Sheet>
        <SheetTrigger asChild>
          {!isMobile && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`fixed top-24 ${
                currentView === "v1" ? "right-14" : "right-72"
              } z-50`}>
              <Button
                size='lg'
                className='rounded-full shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-2xl transition-shadow'>
                <Settings className='h-5 w-5 mr-2' />
                View Settings
              </Button>
            </motion.div>
          )}
        </SheetTrigger>

        <SheetContent>
          <SheetHeader>
            <SheetTitle>Order View Settings</SheetTitle>
            <SheetDescription>
              Choose your preferred order management experience
            </SheetDescription>
          </SheetHeader>

          <div className='mt-6 space-y-6'>
            {/* Version Selector */}
            <div className='space-y-4'>
              <Label className='text-base font-semibold'>
                Interface Version
              </Label>

              {/* V2 Option */}
              <div
                onClick={() => setCurrentView("v2")}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${
                    currentView === "v2"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <Sparkles className='h-5 w-5 text-purple-600' />
                      <h3 className='font-semibold text-gray-900'>
                        Modern View (V2)
                      </h3>
                      <span className='px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full'>
                        Recommended
                      </span>
                    </div>
                    <p className='text-sm text-gray-600 mb-3'>
                      Beautiful, fast, and feature-rich interface with modern
                      design
                    </p>
                    <ul className='space-y-1 text-xs text-gray-600'>
                      <li className='flex items-center gap-2'>
                        <span className='text-green-600'>✓</span>
                        Virtual scrolling for better performance
                      </li>
                      <li className='flex items-center gap-2'>
                        <span className='text-green-600'>✓</span>
                        Advanced search and filters
                      </li>
                      <li className='flex items-center gap-2'>
                        <span className='text-green-600'>✓</span>
                        Keyboard shortcuts (⌘K)
                      </li>
                      <li className='flex items-center gap-2'>
                        <span className='text-green-600'>✓</span>
                        Smooth animations and transitions
                      </li>
                      <li className='flex items-center gap-2'>
                        <span className='text-green-600'>✓</span>
                        Enhanced bulk actions
                      </li>
                    </ul>
                  </div>
                  <div className='ml-4'>
                    <div
                      className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${
                          currentView === "v2"
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-300"
                        }
                      `}>
                      {currentView === "v2" && (
                        <div className='w-2 h-2 bg-white rounded-full' />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* V1 Option */}
              <div
                onClick={() => setCurrentView("v1")}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${
                    currentView === "v1"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <ArrowLeft className='h-5 w-5 text-gray-600' />
                      <h3 className='font-semibold text-gray-900'>
                        Classic View (V1)
                      </h3>
                    </div>
                    <p className='text-sm text-gray-600 mb-3'>
                      Familiar interface with all the features you're used to
                    </p>
                    <ul className='space-y-1 text-xs text-gray-600'>
                      <li className='flex items-center gap-2'>
                        <span className='text-blue-600'>•</span>
                        Traditional table layout
                      </li>
                      <li className='flex items-center gap-2'>
                        <span className='text-blue-600'>•</span>
                        Tried and tested workflow
                      </li>
                      <li className='flex items-center gap-2'>
                        <span className='text-blue-600'>•</span>
                        All existing features available
                      </li>
                    </ul>
                  </div>
                  <div className='ml-4'>
                    <div
                      className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${
                          currentView === "v1"
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-300"
                        }
                      `}>
                      {currentView === "v1" && (
                        <div className='w-2 h-2 bg-white rounded-full' />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Toggle */}
            <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
              <div>
                <Label htmlFor='quick-toggle' className='font-medium'>
                  Quick Toggle
                </Label>
                <p className='text-xs text-gray-600 mt-1'>
                  Switch between {currentView === "v1" ? "classic" : "modern"}{" "}
                  and {currentView === "v1" ? "modern" : "classic"} view
                </p>
              </div>
              <Switch
                id='quick-toggle'
                checked={currentView === "v2"}
                onCheckedChange={(checked) =>
                  setCurrentView(checked ? "v2" : "v1")
                }
              />
            </div>

            {/* Info */}
            <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-xs text-blue-800'>
                <strong>Note:</strong> Your preference is saved automatically.
                You can switch between views anytime.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* View Content */}
      <AnimatePresence mode='wait'>
        {currentView === "v2" && !isMobile ? (
          <motion.div
            key='v2'
            variants={pageTransition}
            initial='initial'
            animate='animate'
            exit='exit'
            className='h-full w-full'>
            <OrderListV2 />
          </motion.div>
        ) : (
          <motion.div
            key='v1'
            variants={pageTransition}
            initial='initial'
            animate='animate'
            exit='exit'
            className='h-full w-full'>
            <OrderList />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManagement;
