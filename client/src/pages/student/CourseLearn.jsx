import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
  Award,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import { Loader } from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export const CourseLearn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toggling, setToggling] = useState(false);

  // Flatten all lessons across modules for easy prev/next index calculation
  const allLessons = modules.flatMap((m) => m.lessons || []);

  const currentIndex = allLessons.findIndex((l) => l._id === currentLesson?._id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  const isCurrentCompleted = currentLesson
    ? completedLessons.includes(currentLesson._id)
    : false;

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const [courseRes, progRes] = await Promise.all([
          courseService.getCourseById(courseId),
          enrollmentService.getCourseProgress(courseId),
        ]);

        setCourse(courseRes.data.course);
        const fetchedModules = courseRes.data.modules || [];
        setModules(fetchedModules);

        const enr = progRes.data.enrollment;
        const completedIds = (enr?.completedLessons || []).map((l) =>
          typeof l === 'object' ? l._id : l
        );
        setCompletedLessons(completedIds);
        setProgress(progRes.data.progress || 0);

        // Select active lesson: either lastAccessed, or first uncompleted, or first lesson
        const all = fetchedModules.flatMap((m) => m.lessons || []);
        let initialLesson = null;

        if (enr?.lastAccessedLesson) {
          const lastId =
            typeof enr.lastAccessedLesson === 'object'
              ? enr.lastAccessedLesson._id
              : enr.lastAccessedLesson;
          initialLesson = all.find((l) => l._id === lastId);
        }

        if (!initialLesson) {
          initialLesson = all.find((l) => !completedIds.includes(l._id)) || all[0];
        }

        setCurrentLesson(initialLesson || null);
      } catch (err) {
        console.error('Failed to load course player data:', err);
        toast.error('Failed to load course classroom.');
        navigate('/student/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, navigate]);

  const handleSelectLesson = async (lesson) => {
    setCurrentLesson(lesson);
    // Persist last accessed lesson
    await enrollmentService.updateLastAccessed(courseId, lesson._id).catch(() => {});
  };

  const handleToggleComplete = async () => {
    if (!currentLesson) return;

    try {
      setToggling(true);
      const newStatus = !isCurrentCompleted;
      const res = await enrollmentService.toggleLessonComplete(
        courseId,
        currentLesson._id,
        newStatus
      );

      setProgress(res.data.progress);
      setCompletedLessons((prev) =>
        newStatus
          ? [...prev, currentLesson._id]
          : prev.filter((id) => id !== currentLesson._id)
      );

      if (newStatus) {
        toast.success('Lesson marked complete! 🎉');
        // Auto advance to next lesson if available
        if (nextLesson) {
          handleSelectLesson(nextLesson);
        }
      } else {
        toast('Lesson marked incomplete');
      }
    } catch (err) {
      toast.error('Failed to update lesson progress.');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Loader size="lg" text="Loading classroom environment..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 1. TOP CLASSROOM NAVBAR */}
      <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center space-x-4">
          <Link
            to="/student/courses"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to my courses"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />
          <div>
            <h1 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
              {course?.title}
            </h1>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">
              {currentLesson?.title || 'Classroom'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Progress Pill */}
          <div className="hidden md:flex items-center space-x-3 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700">
            <span className="text-xs font-bold text-slate-300">Course Progress:</span>
            <div className="w-24 bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-blue-400">{progress}%</span>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. CLASSROOM SPLIT BODY */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT / DESKTOP SIDEBAR: CURRICULUM ACCORDION */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-16 left-0 z-20 w-80 sm:w-96 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out`}
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Course Curriculum
            </h3>
            <span className="text-xs text-blue-400 font-bold">
              {completedLessons.length} / {allLessons.length} Completed
            </span>
          </div>

          {/* Modules List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-2">
            {modules.map((mod, modIdx) => (
              <div key={mod._id} className="rounded-xl overflow-hidden bg-slate-950/40 p-2">
                <div className="px-3 py-2 text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="truncate">
                    M{modIdx + 1}: {mod.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {mod.lessons?.length || 0} items
                  </span>
                </div>

                <div className="space-y-1 mt-1">
                  {mod.lessons?.map((lesson) => {
                    const isSelected = currentLesson?._id === lesson._id;
                    const isDone = completedLessons.includes(lesson._id);

                    return (
                      <button
                        key={lesson._id}
                        onClick={() => {
                          handleSelectLesson(lesson);
                          if (window.innerWidth < 1024) setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors text-left ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                            : isDone
                            ? 'text-slate-300 hover:bg-slate-800/60 font-medium'
                            : 'text-slate-400 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0 text-[10px]">
                          {lesson.type === 'video' ? (
                            <PlayCircle className="w-3.5 h-3.5 opacity-70" />
                          ) : lesson.type === 'quiz' ? (
                            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 opacity-70" />
                          )}
                          <span className="opacity-70">{lesson.duration}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT: LESSON VIEWER */}
        <main className="flex-1 flex flex-col justify-between overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto w-full">
          <div className="space-y-6">
            {currentLesson ? (
              <>
                {/* 1. LESSON CONTENT RENDERER */}
                {currentLesson.type === 'video' && (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800">
                    {currentLesson.videoUrl?.includes('youtube') ||
                    currentLesson.videoUrl?.includes('youtu.be') ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${
                          currentLesson.videoUrl.includes('v=')
                            ? currentLesson.videoUrl.split('v=')[1].split('&')[0]
                            : currentLesson.videoUrl.split('/').pop()
                        }`}
                        title={currentLesson.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={currentLesson.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}
                        controls
                        className="w-full h-full"
                      />
                    )}
                  </div>
                )}

                {currentLesson.type === 'document' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{currentLesson.title}</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      {currentLesson.description || 'Download or view the accompanying lesson document.'}
                    </p>
                    {currentLesson.documentUrl ? (
                      <a
                        href={currentLesson.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Document Resource</span>
                      </a>
                    ) : (
                      <p className="text-xs text-slate-500">Document resource will appear here.</p>
                    )}
                  </div>
                )}

                {currentLesson.type === 'text' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4 text-slate-200">
                    <h2 className="text-2xl font-black text-white">{currentLesson.title}</h2>
                    <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line text-slate-300">
                      {currentLesson.content || currentLesson.description}
                    </div>
                  </div>
                )}

                {currentLesson.type === 'quiz' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
                      <HelpCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{currentLesson.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        Evaluate your understanding with this graded interactive assessment.
                      </p>
                    </div>

                    <div className="pt-2">
                      <Link to={`/student/quizzes/${currentLesson.quiz?._id || currentLesson.quiz}`}>
                        <Button size="lg" className="font-bold bg-amber-500 hover:bg-amber-600 text-slate-950">
                          <HelpCircle className="w-5 h-5 mr-2" />
                          <span>Start Graded Quiz</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* 2. LESSON INFO HEADER */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                      Lesson {currentIndex + 1} of {allLessons.length}
                    </span>
                    <h2 className="text-xl font-bold text-white mt-0.5">{currentLesson.title}</h2>
                    {currentLesson.description && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {currentLesson.description}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleToggleComplete}
                    loading={toggling}
                    variant={isCurrentCompleted ? 'secondary' : 'primary'}
                    size="md"
                    className="flex-shrink-0"
                  >
                    {isCurrentCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 mr-2" />
                        <span>Mark as Complete</span>
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-500">
                Select a lesson from the curriculum to begin.
              </div>
            )}
          </div>

          {/* 3. BOTTOM NAVIGATION CONTROLS */}
          <div className="pt-8 mt-8 border-t border-slate-800 flex items-center justify-between">
            {prevLesson ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectLesson(prevLesson)}
                className="text-slate-300 border-slate-700 hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Previous:</span> {prevLesson.title.slice(0, 20)}...
              </Button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSelectLesson(nextLesson)}
              >
                <span className="hidden sm:inline">Next:</span> {nextLesson.title.slice(0, 20)}...
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Link to="/student/courses">
                <Button variant="success" size="sm">
                  <Award className="w-4 h-4 mr-1.5" />
                  <span>Course Finished!</span>
                </Button>
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseLearn;
