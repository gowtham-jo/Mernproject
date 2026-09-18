import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  PlayCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getStudentAnalytics();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load student analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading student dashboard..." />
      </div>
    );
  }

  const stats = data?.stats || {};
  const continueLearning = data?.continueLearning;
  const weeklyStudyHours = data?.weeklyStudyHours || [];
  const recentEnrollments = data?.recentEnrollments || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
            You have completed {stats.completedCount || 0} of {stats.enrolledCount || 0} courses. Keep up the great momentum!
          </p>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Enrolled Courses"
          value={stats.enrolledCount || 0}
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgressCount || 0}
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="Completed"
          value={stats.completedCount || 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="Overall Progress"
          value={`${stats.overallProgress || 0}%`}
          icon={Award}
          color="violet"
        />
      </div>

      {/* Continue Learning Feature Box */}
      {continueLearning && continueLearning.course && (
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 border-0 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500 text-white text-[11px] font-bold uppercase tracking-wider">
                  Continue Learning
                </span>
                <span className="text-xs text-slate-400">
                  {continueLearning.progress || 0}% Complete
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {continueLearning.course.title}
              </h2>

              {continueLearning.lastAccessedLesson && (
                <p className="text-xs text-slate-300 flex items-center space-x-1.5">
                  <PlayCircle className="w-4 h-4 text-blue-400" />
                  <span>Next Lesson: {continueLearning.lastAccessedLesson.title}</span>
                </p>
              )}

              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mt-3 max-w-md">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${continueLearning.progress || 0}%` }}
                />
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link to={`/student/courses/${continueLearning.course._id}`}>
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600 font-bold text-white shadow-lg">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  <span>Resume Course</span>
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Weekly Study Activity Chart & Recent Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Study Hours Chart */}
        <div className="lg:col-span-7">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Weekly Study Activity</h3>
                  <p className="text-xs text-slate-500">Hours spent learning this week</p>
                </div>
                <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18% from last week</span>
                </div>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyStudyHours}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="h" />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                        border: 'none',
                      }}
                    />
                    <Bar dataKey="hours" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        {/* My Enrolled Courses Quick List */}
        <div className="lg:col-span-5">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Active Courses</h3>
                <Link to="/student/courses" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {recentEnrollments && recentEnrollments.length > 0 ? (
                  recentEnrollments.map((enr) => (
                    <Link
                      key={enr._id}
                      to={`/student/courses/${enr.course?._id}`}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between transition-colors block group"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          {enr.progress}%
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600">
                            {enr.course?.title}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {enr.course?.teacher?.name || 'Instructor'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    You haven't enrolled in any courses yet.{' '}
                    <Link to="/courses" className="text-blue-600 font-bold">
                      Browse courses
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <Link to="/courses" className="mt-4 block">
              <Button variant="outline" size="sm" className="w-full">
                <span>Browse New Courses</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
