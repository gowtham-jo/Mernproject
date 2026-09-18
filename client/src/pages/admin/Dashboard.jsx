import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  Layers,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import analyticsService from '../../services/analyticsService';
import { StatsCard, Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#8b5cf6'];

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getAdminAnalytics();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading platform administration data..." />
      </div>
    );
  }

  const stats = data?.stats || {};
  const monthlyEnrollments = data?.monthlyEnrollments || [];
  const categoryStats = data?.categoryStats || [];
  const userDistribution = data?.userDistribution || [];
  const recentEnrollments = data?.recentEnrollments || [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
            Platform Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            LearnHub Executive Control Center
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Monitor platform metrics, manage user permissions, and oversee curriculum standards.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-3">
          <Link
            to="/admin/users"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-blue-600/30"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/courses"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-700"
          >
            Manage Courses
          </Link>
        </div>
      </div>

      {/* 6 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents || 0}
          icon={GraduationCap}
          color="blue"
        />
        <StatsCard
          title="Total Teachers"
          value={stats.totalTeachers || 0}
          icon={Users}
          color="indigo"
        />
        <StatsCard
          title="Total Courses"
          value={stats.totalCourses || 0}
          icon={BookOpen}
          color="violet"
        />
        <StatsCard
          title="Published"
          value={stats.publishedCourses || 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="Enrollments"
          value={stats.totalEnrollments || 0}
          icon={FileCheck}
          color="amber"
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers || 0}
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Activity Bar Chart */}
        <div className="lg:col-span-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Course Enrollments vs Completions
                </h3>
                <p className="text-xs text-slate-500">6-Month historical platform throughput</p>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyEnrollments}>
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
                  <Bar dataKey="enrollments" fill="#3b82f6" name="Enrollments" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completions" fill="#10b981" name="Completions" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* User Distribution Pie */}
        <div className="lg:col-span-4">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">User Demographics</h3>
              <p className="text-xs text-slate-500">Account distribution across platform roles</p>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {userDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                        border: 'none',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Students</span>
                <p className="font-bold text-blue-600">{stats.totalStudents || 0}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Teachers</span>
                <p className="font-bold text-emerald-600">{stats.totalTeachers || 0}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Admins</span>
                <p className="font-bold text-slate-900">1</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Platform Enrollments Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Enrollments</h3>
            <p className="text-xs text-slate-500">Real-time student registrations</p>
          </div>
          <Link
            to="/admin/enrollments"
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            View All Enrollments →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase">
                <th className="pb-3">Student</th>
                <th className="pb-3">Course</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentEnrollments.map((enr) => (
                <tr key={enr._id} className="hover:bg-slate-50">
                  <td className="py-3">
                    <div className="flex items-center space-x-2.5">
                      <Avatar
                        src={enr.student?.profileImage}
                        name={enr.student?.name}
                        size="xs"
                      />
                      <span className="font-bold text-slate-800">{enr.student?.name}</span>
                    </div>
                  </td>
                  <td className="py-3 font-medium text-slate-700">{enr.course?.title}</td>
                  <td className="py-3 text-slate-400">
                    {new Date(enr.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <Badge variant="green" size="sm">
                      Active
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
