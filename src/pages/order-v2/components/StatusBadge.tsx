/**
 * StatusBadge Component
 * Displays status badges with proper styling and animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { scaleUp } from '../lib/animations';
import type { OrderStatus, DeliveryStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus | DeliveryStatus | string;
  type?: 'order' | 'delivery' | 'payment' | 'fraud';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  provider?: string;
  className?: string;
}

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    icon?: string;
  }
> = {
  // Order statuses
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '⏳',
  },
  processing: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '⚙️',
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '📦',
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✓',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '✕',
  },
  cancel: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '✕',
  },
  failed: {
    label: 'Failed',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '⚠',
  },

  // Delivery statuses
  not_shipped: {
    label: 'Not Shipped',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  in_transit: {
    label: 'In Transit',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '🚚',
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✓',
  },
  hold: {
    label: 'On Hold',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },

  // Payment statuses
  paid: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '💰',
  },
  partial: {
    label: 'Partial',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  unpaid: {
    label: 'Unpaid',
    color: 'bg-red-100 text-red-800 border-red-200',
  },

  // Fraud risk levels
  green: {
    label: 'Low Risk',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✓',
  },
  yellow: {
    label: 'Medium Risk',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '⚠',
  },
  red: {
    label: 'High Risk',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '⚠',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'order',
  size = 'md',
  animated = true,
  provider,
  className,
}) => {
  const config = statusConfig[status.toLowerCase()] || {
    label: status,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const badgeContent = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors',
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {config.icon && <span className="text-xs">{config.icon}</span>}
      <span>{config.label}</span>
      {provider && status.toLowerCase() === 'shipped' && (
        <span className="opacity-75">({provider})</span>
      )}
    </span>
  );

  if (animated) {
    return (
      <motion.div
        variants={scaleUp}
        initial="hidden"
        animate="visible"
        className="inline-block"
      >
        {badgeContent}
      </motion.div>
    );
  }

  return badgeContent;
};

// Specialized status badge components
export const OrderStatusBadge: React.FC<Omit<StatusBadgeProps, 'type'>> = (props) => (
  <StatusBadge {...props} type="order" />
);

export const DeliveryStatusBadge: React.FC<Omit<StatusBadgeProps, 'type'>> = (props) => (
  <StatusBadge {...props} type="delivery" />
);

export const PaymentStatusBadge: React.FC<Omit<StatusBadgeProps, 'type'>> = (props) => (
  <StatusBadge {...props} type="payment" />
);

export const FraudRiskBadge: React.FC<Omit<StatusBadgeProps, 'type'>> = (props) => (
  <StatusBadge {...props} type="fraud" />
);
