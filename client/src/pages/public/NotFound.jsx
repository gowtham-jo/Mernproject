import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <BookOpen className="w-8 h-8" />
      </div>
      <h1 className="text-6xl font-black text-slate-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-2 mb-8">
        The requested page does not exist or has been moved.
      </p>
      <Link to="/">
        <Button size="md">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back to Home</span>
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
