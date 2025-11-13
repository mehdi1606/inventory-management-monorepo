// src/components/ui/GradientButton.tsx
import React from 'react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const GradientButton: React.FC<GradientButtonProps> = ({ 
  children, 
  className = '',
  variant = 'primary',
  size = 'md',
  disabled,
  ...props 
}) => {
  const variants = {
    primary: 'from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
    secondary: 'from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800',
    success: 'from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700',
    danger: 'from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
  };

  const sizes = {
    sm: 'py-1 px-4 text-sm',
    md: 'py-2 px-6 text-base',
    lg: 'py-3 px-8 text-lg'
  };

  return (
    <button
      className={`
        bg-gradient-to-r ${variants[variant]}
        text-white font-semibold rounded-lg
        ${sizes[size]}
        transition-all duration-200
        shadow-md hover:shadow-lg
        transform hover:-translate-y-0.5
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};