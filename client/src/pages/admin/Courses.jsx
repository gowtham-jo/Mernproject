import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Trash2, Eye, Search, PlusCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import { Loader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';

export const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteCourseId, setDeleteCourseId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await courseService.getCourses({
        page,
        limit: 10,
        search,
        status: 'all', // Show all courses to admin
      });
      setCourses(res.data.courses || []);
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load courses for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search, page]);

  const handleToggleStatus = async (course) => {
    try {
      const nextStatus = course.status === 'published' ? 'draft' : 'published';
      await courseService.toggleCourseStatus(course._id, nextStatus);
      toast.success(`Course status changed to ${nextStatus}`);
      setCourses((prev) =>
        prev.map((c) => (c._id === course._id ? { ...c, status: nextStatus } : c))
      );
    } catch (err) {
      toast.error('Failed to update course status.');
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteCourseId) return;
    try {
      setDeleting(true);
      await courseService.deleteCourse(deleteCourseId);
      toast.success('Course deleted.');
      setCourses((prev) => prev.filter((c) => c._id !== deleteCourseId));
      setDeleteCourseId(null);
    } catch (err) {
      toast.error('Failed to delete course.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Courses</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {totalCount} masterclasses and curriculums registered on LearnHub
          </p>
        </div>

        <div className="w-full sm:w-64">
          <SearchBar
            placeholder="Search all courses..."
            value={search}
            onSearch={(val) => {
              setSearch(val);
              setPage(1);
            }}
          />
        </div>
      </div>

      {loading ? (
        <Loader text="Loading course catalog..." />
      ) : courses.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Course & Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Admin Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                        />
                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {course.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {course.category?.name || 'General'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      {course.teacher?.name || 'Instructor'}
                    </td>

                    <td className="px-6 py-4 text-xs font-black text-slate-900">
                      {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                    </td>

                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      {course.enrolledStudentsCount || 0}
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={course.status === 'published' ? 'green' : 'amber'}
                        size="sm"
                        dot
                      >
                        {course.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleStatus(course)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                            course.status === 'published'
                              ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {course.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>

                        <Link
                          to={`/courses/${course._id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setDeleteCourseId(course._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses registered"
          description="No courses found."
        />
      )}

      {/* Delete Course Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteCourseId}
        onClose={() => setDeleteCourseId(null)}
        onConfirm={handleDeleteCourse}
        loading={deleting}
        title="Admin Override: Delete Course"
        message="Are you sure you want to permanently delete this course and all associated lessons?"
      />
    </div>
  );
};

export default AdminCourses;
