import React from 'react';
import { IonButton, IonIcon, IonRippleEffect } from '@ionic/react';
import { cn } from '../../utils/cn';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'default' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  icon?: string;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'default',
  disabled = false,
  onClick,
  icon,
  iconPosition = 'start',
  fullWidth = false,
  className,
}) => {
  const getColor = () => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'secondary';
      case 'danger':
        return 'danger';
      case 'outline':
        return 'primary';
      case 'ghost':
        return 'medium';
      default:
        return 'primary';
    }
  };

  const getFill = () => {
    switch (variant) {
      case 'outline':
        return 'outline';
      case 'ghost':
        return 'clear';
      default:
        return 'solid';
    }
  };

  return (
    <IonButton
      color={getColor()}
      fill={getFill()}
      size={size}
      disabled={disabled}
      onClick={onClick}
      expand={fullWidth ? 'block' : undefined}
      className={cn(
        'relative ion-activatable ripple-parent rounded-lg font-medium transition-all',
        {
          'h-8 text-sm': size === 'small',
          'h-10': size === 'default',
          'h-12 text-lg': size === 'large',
        },
        className
      )}
    >
      {icon && iconPosition === 'start' && (
        <IonIcon icon={icon} slot="start" />
      )}
      {children}
      {icon && iconPosition === 'end' && (
        <IonIcon icon={icon} slot="end" />
      )}
      <IonRippleEffect />
    </IonButton>
  );
};