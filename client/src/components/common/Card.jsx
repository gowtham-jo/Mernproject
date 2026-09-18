import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  glass = false,
  padding = 'p-6',
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white transition-all duration-200 ${
        glass ? 'glass-panel' : ''
      } ${hover ? 'hover-card cursor-pointer' : 'shadow-subtle'} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  trendPositive = true,
}) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
  };

  return (
    <Card className="relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h4>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2 space-x-1">
              <span
                className={`text-xs font-semibold ${
                  trendPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trend}
              </span>
              <span className="text-xs text-slate-400">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${
              colorMap[color] || colorMap.blue
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;
