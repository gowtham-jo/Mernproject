import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Award,
  CheckCircle2,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  Eye,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import analyticsService from '../../services/analyticsService';
import { useAuth } from '../../context/AuthContext';
import { StatsCard, Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getTeacherAnalytics();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load teacher analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading teacher dashboard..." />
      </div>
    );
  }

  const stats = data?.stats || {};
  const enrollmentTrends = data?.enrollmentTrends || [];
  const recentCourses = data?.recentCourses || [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
            Instructor Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Instructor Workspace • {user?.name}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Manage your courses, examine student progress, and grade assessments.
          </p>
        </div>

        <div className="relative z-10 flex-shrink-0">
          <Link to="/teacher/courses/create">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/30">
              <PlusCircle className="w-5 h-5 mr-2" />
              <span>Create New Course</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Courses"
          value={stats.totalCourses || 0}
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Published"
          value={stats.publishedCourses || 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents || 0}
          icon={Users}
          color="indigo"
        />
        <StatsCard
          title="Avg Completion"
          value={`${stats.averageCompletionRate || 0}%`}
          icon={Award}
          color="amber"
        />
        <StatsCard
          title="Avg Quiz Score"
          value={`${stats.averageQuizScore || 0}%`}
          icon={Award}
          color="rose"
        />
      </div>

      {/* Chart & Recent Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Enrollment Trend Chart */}
        <div className="lg:col-span-7">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Student Enrollment Trends</h3>
                  <p className="text-xs text-slate-500">Monthly student enrollments across your courses</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Growing Steady
                </span>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enrollmentTrends}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                        border: 'none',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="students"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorStudents)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        {/* My Active Courses List */}
        <div className="lg:col-span-5">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">My Courses</h3>
                <Link to="/teacher/courses" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  Manage All
                </Link>
              </div>

              <div className="space-y-3">
                {recentCourses.length > 0 ? (
                  recentCourses.map((c) => (
                    <div
                      key={c._id}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-between transition-colors"
                    >
                      <div className="min-w-0 pr-3">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{c.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant={c.status === 'published' ? 'green' : 'amber'}
                            size="sm"
                          >
                            {c.status}
                          </Badge>
                          <span className="text-[11px] text-slate-400">
                            {c.enrolledStudentsCount || 0} students
                          </span>
                        </div>
                      </div>

                      <Link to={`/teacher/courses/${c._id}/edit`}>
                        <Button variant="outline" size="sm">
                          <span>Edit</span>
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No courses created yet.{' '}
                    <Link to="/teacher/courses/create" className="text-blue-600 font-bold">
                      Create your first course
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <Link to="/teacher/courses/create" className="mt-4 block">
              <Button size="sm" className="w-full font-bold">
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                <span>Create Another Course</span>
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
