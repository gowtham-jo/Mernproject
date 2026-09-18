import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import { Loader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SearchBar from '../../components/common/SearchBar';

export const TeacherMyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteCourseId, setDeleteCourseId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await courseService.getMyTeacherCourses();
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Failed to load teacher courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleToggleStatus = async (course) => {
    try {
      const nextStatus = course.status === 'published' ? 'draft' : 'published';
      await courseService.toggleCourseStatus(course._id, nextStatus);
      toast.success(`Course ${nextStatus === 'published' ? 'published' : 'moved to drafts'}`);
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
      toast.success('Course deleted successfully.');
      setCourses((prev) => prev.filter((c) => c._id !== deleteCourseId));
      setDeleteCourseId(null);
    } catch (err) {
      toast.error('Failed to delete course.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Courses</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, edit curriculum, and publish courses to the student marketplace
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-48 sm:w-64">
            <SearchBar
              placeholder="Search my courses..."
              value={search}
              onSearch={(val) => setSearch(val)}
            />
          </div>

          <Link to="/teacher/courses/create">
            <Button size="md" className="font-bold flex-shrink-0">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>New Course</span>
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading your courses..." />
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Enrolled
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((course) => (
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
                            Level: <span className="capitalize">{course.level || 'All'}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {course.category?.name || 'General'}
                    </td>

                    <td className="px-6 py-4 text-xs font-bold text-slate-900">
                      {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                    </td>

                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      {course.enrolledStudentsCount || 0} students
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
                          title={course.status === 'published' ? 'Unpublish' : 'Publish'}
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
                          title="Preview live"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/teacher/courses/${course._id}/edit`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                          title="Edit course"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setDeleteCourseId(course._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete course"
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
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="You haven't created any courses yet. Launch your first course today!"
          actionLabel="Create Your First Course"
          onAction={() => (window.location.href = '/teacher/courses/create')}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteCourseId}
        onClose={() => setDeleteCourseId(null)}
        onConfirm={handleDeleteCourse}
        loading={deleting}
        title="Delete Course Permanently"
        message="Are you sure you want to delete this course? All associated modules, lessons, and quiz questions will be removed."
        confirmText="Delete Course"
      />
    </div>
  );
};

export default TeacherMyCourses;
