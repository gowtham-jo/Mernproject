import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, BookOpen, Award, CheckCircle2 } from 'lucide-react';
import analyticsService from '../../services/analyticsService';
import { Loader } from '../../components/common/Loader';
import { StatsCard, Card } from '../../components/common/Card';

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#8b5cf6', '#ec4899'];

export const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getAdminAnalytics();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Generating platform analytics reports..." />
      </div>
    );
  }

  const stats = data?.stats || {};
  const monthlyEnrollments = data?.monthlyEnrollments || [];
  const categoryStats = data?.categoryStats || [];
  const userDistribution = data?.userDistribution || [];

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Analytics & Intelligence</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics on student engagement, retention rates, and course distributions
        </p>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Platform Users"
          value={(stats.totalStudents || 0) + (stats.totalTeachers || 0) + 1}
          icon={Users}
          color="blue"
          trend="+24%"
        />
        <StatsCard
          title="Total Enrollments"
          value={stats.totalEnrollments || 0}
          icon={BookOpen}
          color="emerald"
          trend="+32%"
        />
        <StatsCard
          title="Active Course Catalog"
          value={stats.publishedCourses || 0}
          icon={CheckCircle2}
          color="indigo"
        />
        <StatsCard
          title="Categories Active"
          value={stats.categoriesCount || 0}
          icon={Award}
          color="violet"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Growth Trends Line/Area */}
        <div className="lg:col-span-8">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Monthly Course Enrollments</h3>
            <p className="text-xs text-slate-500 mb-6">Student adoption over the previous 6-month period</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyEnrollments}>
                  <defs>
                    <linearGradient id="colorEnr" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="enrollments"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorEnr)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Category Breakdown Bar */}
        <div className="lg:col-span-4">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Course Distribution by Category</h3>
              <p className="text-xs text-slate-500 mb-4">Marketplace breadth</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                        border: 'none',
                      }}
                    />
                    <Bar dataKey="courses" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
