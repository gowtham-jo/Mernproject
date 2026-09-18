import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  PlayCircle,
  FileText,
  HelpCircle,
  Upload,
  Eye,
  Save,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import quizService from '../../services/quizService';
import uploadService from '../../services/uploadService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import CourseCard from '../../components/course/CourseCard';

export const CreateCourse = () => {
  const navigate = useNavigate();
  const { courseId } = useParams(); // If present, it's Edit mode

  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // Step 1 State: Course Details
  const [courseData, setCourseData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: '',
    price: 0,
    level: 'all_levels',
    duration: '4 Weeks',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
    requirements: ['Basic computer knowledge'],
    learningOutcomes: ['Build full-stack applications'],
    status: 'draft',
  });

  // Created course instance ID
  const [savedCourseId, setSavedCourseId] = useState(courseId || null);

  // Step 2 & 3 State: Modules & Lessons
  const [modules, setModules] = useState([]);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // Lesson Form Modal State
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    type: 'video', // 'video', 'document', 'text', 'quiz'
    videoUrl: '',
    documentUrl: '',
    content: '',
    duration: '10 min',
    isPreview: false,
    quizTitle: '',
    quizTimeLimit: 15,
    quizPassingScore: 70,
    quizQuestions: [
      {
        questionText: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: 0,
        marks: 1,
        explanation: '',
      },
    ],
  });

  // Load categories and existing course if editing
  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await courseService.getCategories();
        setCategories(catRes.data.categories || []);
        if (catRes.data.categories?.length > 0 && !courseData.category) {
          setCourseData((prev) => ({ ...prev, category: catRes.data.categories[0]._id }));
        }

        if (courseId) {
          const res = await courseService.getCourseById(courseId);
          const c = res.data.course;
          setCourseData({
            title: c.title,
            subtitle: c.subtitle || '',
            description: c.description,
            category: c.category?._id || c.category,
            price: c.price || 0,
            level: c.level || 'all_levels',
            duration: c.duration || '4 Weeks',
            thumbnail: c.thumbnail,
            requirements: c.requirements?.length ? c.requirements : [''],
            learningOutcomes: c.learningOutcomes?.length ? c.learningOutcomes : [''],
            status: c.status,
          });
          setSavedCourseId(c._id);
          setModules(res.data.modules || []);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    init();
  }, [courseId]);

  // Thumbnail upload
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingThumb(true);
      const res = await uploadService.uploadFile(file);
      setCourseData((prev) => ({ ...prev, thumbnail: res.data.url }));
      toast.success('Course thumbnail uploaded!');
    } catch (err) {
      toast.error('Failed to upload thumbnail.');
    } finally {
      setUploadingThumb(false);
    }
  };

  // Step 1: Save Course Info
  const handleSaveStep1 = async (e) => {
    e.preventDefault();
    if (!courseData.title || !courseData.description || !courseData.category) {
      toast.error('Please fill in title, description, and category.');
      return;
    }

    try {
      setLoading(true);
      if (savedCourseId) {
        await courseService.updateCourse(savedCourseId, courseData);
        toast.success('Course information updated!');
      } else {
        const res = await courseService.createCourse(courseData);
        setSavedCourseId(res.data.course._id);
        toast.success('Course draft created! Now add curriculum modules.');
      }
      setCurrentStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to save course.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Add Module
  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) {
      toast.error('Please enter a module title.');
      return;
    }
    if (!savedCourseId) {
      toast.error('Please complete step 1 first.');
      return;
    }

    try {
      const res = await courseService.createModule(savedCourseId, {
        title: newModuleTitle.trim(),
        order: modules.length + 1,
      });
      setModules((prev) => [...prev, res.data.module]);
      setNewModuleTitle('');
      toast.success('Module added!');
    } catch (err) {
      toast.error(err.message || 'Failed to create module.');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      await courseService.deleteModule(moduleId);
      setModules((prev) => prev.filter((m) => m._id !== moduleId));
      toast.success('Module deleted.');
    } catch (err) {
      toast.error('Failed to delete module.');
    }
  };

  // Step 3: Add Lesson / Quiz
  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!selectedModuleId) return;

    try {
      let createdQuizId = null;

      // If Quiz type, create Quiz first
      if (lessonForm.type === 'quiz') {
        const quizRes = await quizService.createQuiz({
          course: savedCourseId,
          title: lessonForm.quizTitle || lessonForm.title,
          timeLimit: lessonForm.quizTimeLimit,
          passingScore: lessonForm.quizPassingScore,
          questions: lessonForm.quizQuestions.filter((q) => q.questionText.trim()),
        });
        createdQuizId = quizRes.data.quiz._id;
      }

      const res = await courseService.createLesson(selectedModuleId, {
        title: lessonForm.title,
        description: lessonForm.description,
        type: lessonForm.type,
        videoUrl: lessonForm.videoUrl,
        documentUrl: lessonForm.documentUrl,
        content: lessonForm.content,
        duration: lessonForm.duration,
        isPreview: lessonForm.isPreview,
        quiz: createdQuizId || undefined,
      });

      // Update modules state
      setModules((prev) =>
        prev.map((mod) =>
          mod._id === selectedModuleId
            ? { ...mod, lessons: [...(mod.lessons || []), res.data.lesson] }
            : mod
        )
      );

      setShowLessonModal(false);
      setLessonForm({
        title: '',
        description: '',
        type: 'video',
        videoUrl: '',
        documentUrl: '',
        content: '',
        duration: '10 min',
        isPreview: false,
        quizTitle: '',
        quizTimeLimit: 15,
        quizPassingScore: 70,
        quizQuestions: [
          {
            questionText: '',
            type: 'multiple_choice',
            options: ['', '', '', ''],
            correctAnswer: 0,
            marks: 1,
            explanation: '',
          },
        ],
      });
      toast.success('Lesson added to curriculum!');
    } catch (err) {
      toast.error(err.message || 'Failed to add lesson.');
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId) => {
    try {
      await courseService.deleteLesson(lessonId);
      setModules((prev) =>
        prev.map((m) =>
          m._id === moduleId
            ? { ...m, lessons: m.lessons.filter((l) => l._id !== lessonId) }
            : m
        )
      );
      toast.success('Lesson deleted.');
    } catch (err) {
      toast.error('Failed to delete lesson.');
    }
  };

  // Step 5: Publish Course
  const handlePublishToggle = async (status) => {
    try {
      setLoading(true);
      await courseService.toggleCourseStatus(savedCourseId, status);
      setCourseData((prev) => ({ ...prev, status }));
      toast.success(`Course successfully ${status === 'published' ? 'published to marketplace!' : 'saved as draft'}`);
      navigate('/teacher/courses');
    } catch (err) {
      toast.error('Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Course Info' },
    { num: 2, label: 'Curriculum' },
    { num: 3, label: 'Add Content' },
    { num: 4, label: 'Live Preview' },
    { num: 5, label: 'Publish' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {courseId ? 'Edit Course & Curriculum' : 'Create a New Masterclass'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Step-by-step course builder with video streaming, PDF guides, and interactive quizzes
        </p>
      </div>

      {/* Steps Breadcrumb */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between overflow-x-auto">
        {steps.map((step, idx) => (
          <div key={step.num} className="flex items-center">
            <button
              onClick={() => {
                if (savedCourseId || step.num === 1) setCurrentStep(step.num);
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                currentStep === step.num
                  ? 'bg-blue-600 text-white shadow-sm'
                  : currentStep > step.num
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep === step.num
                    ? 'bg-white text-blue-600'
                    : currentStep > step.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > step.num ? <Check className="w-3 h-3" /> : step.num}
              </span>
              <span className="whitespace-nowrap">{step.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-slate-300 mx-2 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* STEP 1: COURSE INFORMATION */}
      {currentStep === 1 && (
        <form onSubmit={handleSaveStep1} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-subtle space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b pb-3">
            Step 1: General Course Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Course Title"
                value={courseData.title}
                onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                placeholder="e.g. Full-Stack Modern MERN Masterclass"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Course Subtitle"
                value={courseData.subtitle}
                onChange={(e) => setCourseData({ ...courseData, subtitle: e.target.value })}
                placeholder="e.g. Master React, Node, Express and MongoDB by building scalable products"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={courseData.category}
                onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                required
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Difficulty Level
              </label>
              <select
                value={courseData.level}
                onChange={(e) => setCourseData({ ...courseData, level: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="all_levels">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <Input
                label="Price ($ USD - set 0 for Free)"
                type="number"
                min="0"
                step="0.01"
                value={courseData.price}
                onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Input
                label="Estimated Duration"
                value={courseData.duration}
                onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                placeholder="e.g. 6 Weeks, 24 Hours"
              />
            </div>

            {/* Thumbnail URL & Upload */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Course Thumbnail
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={courseData.thumbnail}
                  alt="Preview"
                  className="w-32 h-20 rounded-xl object-cover border bg-slate-100"
                />
                <div className="flex-1 space-y-2 w-full">
                  <Input
                    placeholder="Paste image URL..."
                    value={courseData.thumbnail}
                    onChange={(e) => setCourseData({ ...courseData, thumbnail: e.target.value })}
                  />
                  <div className="flex items-center space-x-2">
                    <label className="cursor-pointer inline-flex items-center space-x-2 text-xs font-bold text-blue-600 hover:text-blue-700">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingThumb ? 'Uploading...' : 'Or upload image file'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Description
              </label>
              <textarea
                rows={4}
                value={courseData.description}
                onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                placeholder="Detailed syllabus and course outline..."
                className="w-full bg-white border border-slate-300 rounded-xl text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" size="lg" loading={loading}>
              <span>Continue to Curriculum</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2 & 3: MODULES & LESSONS BUILDER */}
      {(currentStep === 2 || currentStep === 3) && (
        <div className="space-y-6">
          {/* Add Module Input */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="e.g. Module 1: Full-Stack Foundations & API Setup"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={handleAddModule} size="md" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add Module</span>
            </Button>
          </div>

          {/* Module List with Lesson Adders */}
          {modules.map((mod, modIdx) => (
            <div
              key={mod._id}
              className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden space-y-4 p-6"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                    Module {modIdx + 1}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{mod.title}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedModuleId(mod._id);
                      setShowLessonModal(true);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Add Lesson / Quiz</span>
                  </Button>
                  <button
                    onClick={() => handleDeleteModule(mod._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lessons in Module */}
              <div className="space-y-2">
                {mod.lessons && mod.lessons.length > 0 ? (
                  mod.lessons.map((lesson, lIdx) => (
                    <div
                      key={lesson._id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        {lesson.type === 'video' ? (
                          <PlayCircle className="w-4 h-4 text-blue-600" />
                        ) : lesson.type === 'quiz' ? (
                          <HelpCircle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-500" />
                        )}
                        <span className="font-bold text-slate-800">
                          {lIdx + 1}. {lesson.title}
                        </span>
                        <span className="text-slate-400">({lesson.duration})</span>
                        {lesson.isPreview && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold">
                            Preview
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteLesson(mod._id, lesson._id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    No lessons yet. Click "Add Lesson / Quiz" above.
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              <span>Back</span>
            </Button>
            <Button onClick={() => setCurrentStep(4)}>
              <span>Preview Course</span>
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: LIVE PREVIEW */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between text-xs text-blue-900">
            <span>This is how your course will look to prospective students.</span>
            <Badge variant="blue">Student Perspective</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Marketplace Card Preview
              </h4>
              <CourseCard course={{ ...courseData, _id: savedCourseId }} />
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <h4 className="text-base font-bold text-slate-900">Curriculum Structure Preview</h4>
              <div className="space-y-3">
                {modules.map((m, i) => (
                  <div key={m._id} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-slate-800">
                      Module {i + 1}: {m.title}
                    </p>
                    <p className="text-slate-500">{m.lessons?.length || 0} Lessons & Quizzes</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(3)}>
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Content</span>
            </Button>
            <Button onClick={() => setCurrentStep(5)}>
              <span>Proceed to Publish</span>
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: PUBLISH & STATUS */}
      {currentStep === 5 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-subtle text-center space-y-6 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <BookOpen className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900">Ready to Launch Your Course?</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Publishing will make your course immediately discoverable in the LearnHub course catalog.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              variant="outline"
              size="lg"
              loading={loading}
              onClick={() => handlePublishToggle('draft')}
            >
              <span>Save as Draft</span>
            </Button>

            <Button
              variant="success"
              size="lg"
              loading={loading}
              onClick={() => handlePublishToggle('published')}
            >
              <Check className="w-4 h-4 mr-1.5" />
              <span>Publish Course</span>
            </Button>
          </div>
        </div>
      )}

      {/* ADD LESSON / QUIZ MODAL */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-100 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add Lesson / Quiz</h3>
              <button
                onClick={() => setShowLessonModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                  Lesson Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['video', 'document', 'text', 'quiz'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLessonForm({ ...lessonForm, type: t })}
                      className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                        lessonForm.type === t
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Lesson Title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="e.g. 1.1 Introduction to Clean MERN Architecture"
                required
              />

              <Input
                label="Duration"
                value={lessonForm.duration}
                onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                placeholder="e.g. 15 min"
              />

              {lessonForm.type === 'video' && (
                <Input
                  label="Video URL (YouTube or direct MP4)"
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              )}

              {lessonForm.type === 'document' && (
                <Input
                  label="Document PDF Resource URL"
                  value={lessonForm.documentUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, documentUrl: e.target.value })}
                  placeholder="https://.../guide.pdf"
                />
              )}

              {lessonForm.type === 'text' && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                    Lesson Content (Markdown / Text)
                  </label>
                  <textarea
                    rows={4}
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                    className="w-full border rounded-xl p-3 text-xs"
                    placeholder="Enter reading content..."
                  />
                </div>
              )}

              {lessonForm.type === 'quiz' && (
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-4">
                  <h4 className="text-xs font-bold text-amber-900 uppercase">Quiz Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Time Limit (Mins)"
                      type="number"
                      value={lessonForm.quizTimeLimit}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          quizTimeLimit: parseInt(e.target.value, 10) || 10,
                        })
                      }
                    />
                    <Input
                      label="Pass Score (%)"
                      type="number"
                      value={lessonForm.quizPassingScore}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          quizPassingScore: parseInt(e.target.value, 10) || 70,
                        })
                      }
                    />
                  </div>

                  {/* Single Question Builder inside Modal */}
                  <div className="space-y-3 pt-2">
                    <Input
                      label="Question 1 Text"
                      value={lessonForm.quizQuestions[0]?.questionText}
                      onChange={(e) => {
                        const qs = [...lessonForm.quizQuestions];
                        qs[0].questionText = e.target.value;
                        setLessonForm({ ...lessonForm, quizQuestions: qs });
                      }}
                      placeholder="e.g. What is the role of JWT tokens?"
                    />

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Answer Options</label>
                      {lessonForm.quizQuestions[0]?.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="correctOpt"
                            checked={lessonForm.quizQuestions[0].correctAnswer === oIdx}
                            onChange={() => {
                              const qs = [...lessonForm.quizQuestions];
                              qs[0].correctAnswer = oIdx;
                              setLessonForm({ ...lessonForm, quizQuestions: qs });
                            }}
                          />
                          <input
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            value={opt}
                            onChange={(e) => {
                              const qs = [...lessonForm.quizQuestions];
                              qs[0].options[oIdx] = e.target.value;
                              setLessonForm({ ...lessonForm, quizQuestions: qs });
                            }}
                            className="flex-1 text-xs border rounded-lg p-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isPreviewCheck"
                  checked={lessonForm.isPreview}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, isPreview: e.target.checked })
                  }
                  className="rounded text-blue-600"
                />
                <label htmlFor="isPreviewCheck" className="text-xs font-medium text-slate-700">
                  Allow students to preview this lesson for free before enrolling
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <Button variant="outline" size="sm" onClick={() => setShowLessonModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Lesson to Module
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;
