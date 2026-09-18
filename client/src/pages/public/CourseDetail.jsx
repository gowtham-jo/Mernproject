import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  Users,
  CheckCircle,
  PlayCircle,
  FileText,
  HelpCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';

export const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openModuleIds, setOpenModuleIds] = useState([]);
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await courseService.getCourseById(id);
        setCourse(res.data.course);
        setModules(res.data.modules || []);
        setIsEnrolled(res.data.isEnrolled);
        setEnrollment(res.data.enrollment);

        // Open all module accordions by default
        if (res.data.modules) {
          setOpenModuleIds(res.data.modules.map((m) => m._id));
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
        toast.error('Course not found');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user]);

  const toggleModuleAccordion = (modId) => {
    setOpenModuleIds((prev) =>
      prev.includes(modId) ? prev.filter((i) => i !== modId) : [...prev, modId]
    );
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast('Please sign in or create an account to enroll', { icon: '🔐' });
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }

    if (user.role !== 'student') {
      toast.error('Only student accounts can enroll in courses.');
      return;
    }

    try {
      setEnrolling(true);
      await enrollmentService.enrollInCourse(id);
      setIsEnrolled(true);
      toast.success('Successfully enrolled in course!');
      navigate(`/student/courses/${id}`);
    } catch (err) {
      toast.error(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading course details..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Course Not Found</h2>
        <Link to="/courses" className="mt-4 inline-block text-blue-600 font-semibold">
          ← Return to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* 1. HERO HEADER */}
      <section className="bg-slate-900 text-white py-14 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Header Info */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                {course.category && (
                  <Badge variant="blue" className="bg-blue-600/20 text-blue-400 border-blue-500/30">
                    {course.category.name}
                  </Badge>
                )}
                <Badge variant="slate" className="bg-slate-800 text-slate-300 border-slate-700 capitalize">
                  {course.level ? course.level.replace('_', ' ') : 'All Levels'}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl">
                {course.subtitle || course.description.slice(0, 200)}
              </p>

              {/* Meta stats */}
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-2">
                <div className="flex items-center space-x-1 font-bold text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{course.rating || 4.8} rating</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{course.enrolledStudentsCount || 0} students enrolled</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{course.duration || '4 Weeks'}</span>
                </div>
              </div>

              {/* Teacher Info */}
              {course.teacher && (
                <div className="flex items-center space-x-3 pt-4 border-t border-slate-800">
                  <Avatar
                    src={course.teacher.profileImage}
                    name={course.teacher.name}
                    size="md"
                  />
                  <div>
                    <p className="text-xs text-slate-400">Created by</p>
                    <p className="text-sm font-bold text-white">{course.teacher.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sticky Enrollment Card (Desktop) */}
            <div className="lg:col-span-4">
              <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-6">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900">
                    {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                    Instant Access
                  </span>
                </div>

                {isEnrolled ? (
                  <div className="space-y-3">
                    <Link to={`/student/courses/${course._id}`}>
                      <Button size="lg" className="w-full font-bold">
                        <span>Go to Course Player</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <p className="text-xs text-center text-slate-500 font-medium">
                      You are enrolled in this course
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={handleEnroll}
                    loading={enrolling}
                    size="lg"
                    className="w-full font-bold shadow-md shadow-blue-500/20"
                  >
                    <span>Enroll in Course</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}

                <div className="space-y-2.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Full lifetime access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Access on mobile, tablet & desktop</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Certificate of completion included</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN BODY: What you will learn, Curriculum, Requirements */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* Learning Outcomes */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-subtle space-y-4">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  What You'll Learn in this Course
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700 leading-relaxed font-medium">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Description */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-subtle space-y-4">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Course Overview</h3>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {course.description}
              </div>
            </div>

            {/* Curriculum Accordion */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-subtle space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Course Curriculum
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {modules.length} Modules • {modules.reduce((a, m) => a + (m.lessons?.length || 0), 0)} Lessons
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {modules.map((mod, modIdx) => {
                  const isOpen = openModuleIds.includes(mod._id);
                  return (
                    <div
                      key={mod._id}
                      className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => toggleModuleAccordion(mod._id)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 transition-colors text-left font-bold text-sm text-slate-900"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-blue-600 font-extrabold uppercase">
                            Module {modIdx + 1}:
                          </span>
                          <span>{mod.title}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-slate-500 font-normal">
                          <span>{mod.lessons?.length || 0} lessons</span>
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="divide-y divide-slate-100 bg-white">
                          {mod.lessons && mod.lessons.length > 0 ? (
                            mod.lessons.map((lesson) => (
                              <div
                                key={lesson._id}
                                className="p-3.5 px-5 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
                              >
                                <div className="flex items-center space-x-3">
                                  {lesson.type === 'video' ? (
                                    <PlayCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  ) : lesson.type === 'quiz' ? (
                                    <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                  )}
                                  <span className="font-semibold text-slate-800">
                                    {lesson.title}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <span className="text-slate-400">{lesson.duration}</span>
                                  {lesson.isPreview ? (
                                    <button
                                      onClick={() => setPreviewVideo(lesson)}
                                      className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold text-[11px] transition-colors"
                                    >
                                      Preview
                                    </button>
                                  ) : !isEnrolled ? (
                                    <Lock className="w-3.5 h-3.5 text-slate-300" />
                                  ) : null}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-xs text-slate-400 text-center">
                              No lessons in this module yet.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Course Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-subtle space-y-4">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Requirements</h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      {previewVideo && (
        <Modal
          isOpen={!!previewVideo}
          onClose={() => setPreviewVideo(null)}
          title={`Preview Lesson: ${previewVideo.title}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
              {previewVideo.videoUrl?.includes('youtube') || previewVideo.videoUrl?.includes('youtu.be') ? (
                <iframe
                  src={`https://www.youtube.com/embed/${
                    previewVideo.videoUrl.includes('v=')
                      ? previewVideo.videoUrl.split('v=')[1].split('&')[0]
                      : previewVideo.videoUrl.split('/').pop()
                  }`}
                  title={previewVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={previewVideo.videoUrl} controls className="w-full h-full" />
              )}
            </div>
            <p className="text-xs text-slate-600">{previewVideo.description}</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CourseDetail;
