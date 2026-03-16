import Link from 'next/link';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export default function Button({
  children,
  href,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 active:scale-95';
  
  const variantClasses = {
    primary:
      'bg-primary-800 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-lg hover:shadow-xl',
    secondary:
      'bg-white text-primary-800 border-2 border-primary-800 hover:bg-primary-50 focus:ring-primary-500',
  };

  // Check if className overrides the background color
  // For primary variant: default is bg-primary-800, so any other bg- is override
  // For secondary variant: default is bg-white, so any other bg- is override
  const defaultBgPrimary = 'bg-primary-800';
  const defaultBgSecondary = 'bg-white';
  const hasBgOverride = 
    className.includes('bg-white') || 
    className.includes('bg-transparent') || 
    className.match(/bg-\w+\/\d+/) || 
    className.includes('!bg-') ||
    (variant === 'primary' && className.includes('bg-primary-') && !className.includes(defaultBgPrimary)) ||
    (variant === 'secondary' && className.includes('bg-') && !className.includes(defaultBgSecondary));
  
  // If className overrides background, COMPLETELY remove conflicting variant classes
  let variantClassString = variantClasses[variant];
  if (hasBgOverride) {
    // When background is overridden, remove ALL background and text color classes from variant
    if (variant === 'primary') {
      // Remove bg-primary-800, text-white, hover:bg-primary-700 - keep only non-color styles
      variantClassString = 'focus:ring-primary-500 shadow-lg hover:shadow-xl';
    } else {
      // Remove bg-white, text-primary-800, hover:bg-primary-50 - keep only border if not overridden
      if (!className.includes('border-')) {
        variantClassString = 'border-2 border-primary-800 focus:ring-primary-500';
      } else {
        variantClassString = 'focus:ring-primary-500';
      }
    }
  }
  
  // Apply classes - className comes last to ensure it overrides variant classes
  const classes = `${baseClasses} ${variantClassString} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
