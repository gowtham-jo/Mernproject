import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:ring-blue-500',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400',
  outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-blue-500',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
  ghost: 'hover:bg-slate-100 text-slate-700 focus:ring-slate-400',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
  md: 'px-4 py-2 text-sm font-medium rounded-lg',
  lg: 'px-6 py-2.5 text-base font-medium rounded-xl',
};

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${
        variants[variant] || variants.primary
      } ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 mr-2 -ml-0.5" />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 ml-2 -mr-0.5" />
      )}
    </button>
  );
};

export default Button;
