import React from 'react';
import { Bell, CheckCheck, Trash2, BookOpen, Award, Radio } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

export const StudentNotifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Platform announcements, quiz score releases, and course updates
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-1.5" />
            <span>Mark All as Read</span>
          </Button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden divide-y divide-slate-100">
        {notifications && notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markAsRead(n._id)}
              className={`p-5 flex items-start justify-between transition-colors cursor-pointer ${
                !n.isRead ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    n.type === 'enrollment'
                      ? 'bg-blue-50 text-blue-600'
                      : n.type === 'quiz_result'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {n.type === 'enrollment' ? (
                    <BookOpen className="w-5 h-5" />
                  ) : n.type === 'quiz_result' ? (
                    <Award className="w-5 h-5" />
                  ) : (
                    <Radio className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{n.message}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString()} at{' '}
                    {new Date(n.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={Bell}
            title="All caught up!"
            description="You don't have any notifications right now."
          />
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;
