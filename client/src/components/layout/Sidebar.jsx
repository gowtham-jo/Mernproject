import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Users,
  GraduationCap,
  Layers,
  BarChart3,
  MessageSquare,
  Bell,
  Settings,
  User,
  LogOut,
  Compass,
  CheckSquare,
  Award,
  Radio,
  FileCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define sidebar links per role
  const getNavLinks = () => {
    if (user?.role === 'admin') {
      return [
        { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
        { label: 'All Users', to: '/admin/users', icon: Users },
        { label: 'Students', to: '/admin/students', icon: GraduationCap },
        { label: 'Teachers', to: '/admin/teachers', icon: User },
        { label: 'Courses', to: '/admin/courses', icon: BookOpen },
        { label: 'Categories', to: '/admin/categories', icon: Layers },
        { label: 'Enrollments', to: '/admin/enrollments', icon: FileCheck },
        { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
        { label: 'Announcements', to: '/admin/announcements', icon: Radio },
        { label: 'Settings', to: '/admin/settings', icon: Settings },
      ];
    }

    if (user?.role === 'teacher') {
      return [
        { label: 'Dashboard', to: '/teacher', icon: LayoutDashboard, end: true },
        { label: 'My Courses', to: '/teacher/courses', icon: BookOpen },
        { label: 'Create Course', to: '/teacher/courses/create', icon: PlusCircle },
        { label: 'My Students', to: '/teacher/students', icon: GraduationCap },
        { label: 'Quizzes', to: '/teacher/quizzes', icon: CheckSquare },
        { label: 'Student Results', to: '/teacher/results', icon: Award },
        { label: 'Announcements', to: '/teacher/announcements', icon: Radio },
        { label: 'Messages', to: '/teacher/messages', icon: MessageSquare },
        { label: 'Settings', to: '/teacher/settings', icon: Settings },
      ];
    }

    // Default Student
    return [
      { label: 'Dashboard', to: '/student', icon: LayoutDashboard, end: true },
      { label: 'Browse Courses', to: '/student/browse', icon: Compass },
      { label: 'My Courses', to: '/student/courses', icon: BookOpen },
      { label: 'My Progress', to: '/student/progress', icon: BarChart3 },
      { label: 'Quizzes', to: '/student/quizzes', icon: CheckSquare },
      { label: 'My Results', to: '/student/results', icon: Award },
      { label: 'Messages', to: '/student/messages', icon: MessageSquare },
      { label: 'Notifications', to: '/student/notifications', icon: Bell },
      { label: 'Settings', to: '/student/settings', icon: Settings },
    ];
  };

  const links = getNavLinks();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-slate-200 w-64">
      <div>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              Learn<span className="text-blue-600">Hub</span>
            </span>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Role Badge */}
        <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {user?.role} Workspace
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`}
                    />
                    <span>{link.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer / Logout */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <Link
          to={`/${user?.role}/profile`}
          onClick={onClose}
          className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <Avatar
            src={user?.profileImage}
            name={user?.name}
            size="sm"
            status="online"
          />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">{sidebarContent}</aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
