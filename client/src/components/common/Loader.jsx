import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ size = 'md', text, className = '' }) => {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Loader2 className={`${sizeMap[size] || sizeMap.md} text-blue-600 animate-spin`} />
      {text && <p className="mt-3 text-sm text-slate-500 font-medium">{text}</p>}
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse shadow-sm">
      <div className="w-full h-44 bg-slate-200 rounded-xl mb-4" />
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
      <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <div className="h-5 bg-slate-200 rounded w-16" />
        <div className="h-8 bg-slate-200 rounded w-24" />
      </div>
    </div>
  );
};

export default Loader;
