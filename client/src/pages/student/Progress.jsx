import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, CheckCircle2, Clock, PlayCircle, BarChart3 } from 'lucide-react';
import enrollmentService from '../../services/enrollmentService';
import { Loader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

export const StudentProgress = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const res = await enrollmentService.getMyCourses();
        setEnrollments(res.data.enrollments || []);
      } catch (err) {
        console.error('Failed to load student progress:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading your progress metrics..." />
      </div>
    );
  }

  const completedCount = enrollments.filter((e) => e.progress === 100).length;
  const inProgressCount = enrollments.filter((e) => e.progress < 100).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Learning Progress & Milestones</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Detailed completion breakdown across all enrolled curriculums
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{enrollments.length} Courses</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{inProgressCount} Courses</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{completedCount} Finished</h3>
          </div>
        </div>
      </div>

      {/* Progress Cards List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Curriculum Breakdown</h3>

        {enrollments && enrollments.length > 0 ? (
          <div className="space-y-4">
            {enrollments.map((enr) => {
              if (!enr.course) return null;

              return (
                <div
                  key={enr._id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6 hover-card"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                        {enr.course.category?.name || 'Course'}
                      </span>
                      {enr.progress === 100 && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          Completed 🎉
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{enr.course.title}</h4>

                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span>Instructor: {enr.course.teacher?.name || 'LearnHub Teacher'}</span>
                      <span>•</span>
                      <span>Enrolled on {new Date(enr.enrolledAt).toLocaleDateString()}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-2 max-w-md">
                      <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                        <span>Completion Rate</span>
                        <span className="text-blue-600">{enr.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${enr.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Link to={`/student/courses/${enr.course._id}`}>
                      <Button size="md" className="font-bold">
                        <PlayCircle className="w-4 h-4 mr-1.5" />
                        <span>{enr.progress === 100 ? 'Review Course' : 'Continue Learning'}</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={BarChart3}
            title="No progress data"
            description="Enroll in a course to begin tracking your learning milestones."
            actionLabel="Browse Courses"
            onAction={() => (window.location.href = '/courses')}
          />
        )}
      </div>
    </div>
  );
};

export default StudentProgress;
