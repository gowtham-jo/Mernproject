import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import enrollmentService from '../../services/enrollmentService';
import CourseCard from '../../components/course/CourseCard';
import { Loader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';

export const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'in-progress', 'completed'
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        const res = await enrollmentService.getMyCourses();
        setEnrollments(res.data.enrollments || []);
      } catch (err) {
        console.error('Failed to load my courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  const filteredEnrollments = enrollments.filter((e) => {
    if (!e.course) return false;
    const matchesSearch =
      e.course.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.course.category?.name?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'in-progress') return e.progress < 100;
    if (activeTab === 'completed') return e.progress === 100;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Courses</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Continue learning and track your progress across enrolled programs
          </p>
        </div>

        <div className="w-full sm:w-72">
          <SearchBar
            placeholder="Search enrolled courses..."
            value={search}
            onSearch={(val) => setSearch(val)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Courses ({enrollments.length})
        </button>
        <button
          onClick={() => setActiveTab('in-progress')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'in-progress'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          In Progress ({enrollments.filter((e) => e.progress < 100).length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'completed'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Completed ({enrollments.filter((e) => e.progress === 100).length})
        </button>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <Loader text="Loading your courses..." />
      ) : filteredEnrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enr) => (
            <CourseCard
              key={enr._id}
              course={enr.course}
              isEnrolled={true}
              progress={enr.progress}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description={
            search
              ? 'No enrolled courses match your search criteria.'
              : activeTab === 'completed'
              ? 'You have not completed any courses yet. Keep learning!'
              : 'You are not currently enrolled in any courses.'
          }
          actionLabel="Browse Course Catalog"
          onAction={() => (window.location.href = '/courses')}
        />
      )}
    </div>
  );
};

export default MyCourses;
