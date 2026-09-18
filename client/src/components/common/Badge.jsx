import React from 'react';

const badgeVariants = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const Badge = ({
  children,
  variant = 'blue',
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 font-medium',
    md: 'text-sm px-3 py-1 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${
        badgeVariants[variant] || badgeVariants.blue
      } ${sizeClasses[size] || sizeClasses.sm} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            variant === 'green' || variant === 'emerald'
              ? 'bg-emerald-500'
              : variant === 'rose'
              ? 'bg-rose-500'
              : variant === 'amber'
              ? 'bg-amber-500'
              : 'bg-blue-500'
          }`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
