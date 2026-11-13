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

  const [showVersionBanner, setShowVersionBanner] = useState(false);

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
      handleOrderViewChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        "orderViewChanged",
        handleOrderViewChange as EventListener,
      );
    };
  }, []);

  return (
    <div className='relative h-full w-full'>
      {/* Version Banner (shown for first-time users) */}
      {showVersionBanner && currentView === "v2" && !isMobile && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className='fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'>
          <div className='container mx-auto px-4 py-3 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Sparkles className='h-5 w-5 animate-pulse' />
              <div>
                <p className='font-semibold text-sm md:text-base'>
                  Welcome to the new Order Management experience!
                </p>
                <p className='text-xs md:text-sm text-blue-100'>
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
