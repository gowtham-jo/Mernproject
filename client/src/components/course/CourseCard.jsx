import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Users, BookOpen } from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';

export const CourseCard = ({ course, isEnrolled, progress }) => {
  if (!course) return null;

  const levelColorMap = {
    beginner: 'emerald',
    intermediate: 'blue',
    advanced: 'purple',
    all_levels: 'slate',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden flex flex-col hover-card group">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={
            course.thumbnail ||
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'
          }
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {course.category && (
            <span className="px-2.5 py-1 text-xs font-semibold bg-white/90 backdrop-blur-md rounded-full text-slate-800 shadow-sm">
              {typeof course.category === 'object' ? course.category.name : course.category}
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant={levelColorMap[course.level] || 'blue'} size="sm" className="backdrop-blur-md bg-white/90">
            {course.level ? course.level.replace('_', ' ') : 'All Levels'}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Teacher Info */}
          {course.teacher && (
            <div className="flex items-center space-x-2.5 mb-2.5">
              <Avatar
                src={course.teacher.profileImage}
                name={course.teacher.name}
                size="xs"
              />
              <span className="text-xs font-medium text-slate-600 truncate">
                {course.teacher.name}
              </span>
            </div>
          )}

          {/* Title */}
          <Link to={`/courses/${course._id}`}>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {course.title}
            </h3>
          </Link>

          {/* Subtitle / Description excerpt */}
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {course.subtitle || course.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          {/* Progress Bar (if enrolled) */}
          {isEnrolled && progress !== undefined ? (
            <div className="mb-3">
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Course Progress</span>
                <span className="text-blue-600">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            /* Meta Stats: Rating, Duration, Students */
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
              <div className="flex items-center space-x-1 font-semibold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{course.rating || 4.8}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.duration || '4 Weeks'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.enrolledStudentsCount || 0}</span>
              </div>
            </div>
          )}

          {/* Footer Action & Price */}
          <div className="flex items-center justify-between">
            <div>
              {!isEnrolled && (
                <span className="text-lg font-black text-slate-900">
                  {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                </span>
              )}
            </div>
            <Link
              to={isEnrolled ? `/student/courses/${course._id}` : `/courses/${course._id}`}
              className={`text-xs font-bold px-3.5 py-2 rounded-lg transition-colors inline-flex items-center space-x-1.5 ${
                isEnrolled
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isEnrolled ? 'Continue Learning' : 'View Course'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
