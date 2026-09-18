import React from 'react';
import { Menu, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import Avatar from '../common/Avatar';

export const Header = ({ onMenuClick, title }) => {
  const { user } = useAuth();

  const getChatLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'teacher') return '/teacher/messages';
    return '/student/messages';
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>}
      </div>

      <div className="flex items-center space-x-3">
        <Link
          to={getChatLink()}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
          title="Messages"
        >
          <MessageSquare className="w-5 h-5" />
        </Link>

        <NotificationBell />

        <div className="h-6 w-px bg-slate-200" />

        <Link
          to={`/${user?.role}/profile`}
          className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <Avatar src={user?.profileImage} name={user?.name} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
