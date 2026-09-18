import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-elevated border border-slate-100 py-3 z-50 animate-scale-up">
            <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-600 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              {notifications && notifications.length > 0 ? (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n._id}
                    onClick={() => {
                      if (!n.isRead) markAsRead(n._id);
                      setIsOpen(false);
                    }}
                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                      !n.isRead ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-bold text-slate-800">{n.title}</p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="mt-1.5 text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      • {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No notifications yet.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
