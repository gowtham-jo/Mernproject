import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Public / Enrolled
export const getLessonById = catchAsync(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id)
    .populate({
      path: 'quiz',
      populate: {
        path: 'questions',
      },
    });

  if (!lesson) {
    return next(new AppError('Lesson not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { lesson },
  });
});

// @desc    Create a lesson in a module
// @route   POST /api/modules/:moduleId/lessons
// @access  Private/Teacher/Admin
export const createLesson = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    type,
    videoUrl,
    documentUrl,
    content,
    duration,
    order,
    isPreview,
    quiz,
  } = req.body;

  const module = await Module.findById(req.params.moduleId);
  if (!module) {
    return next(new AppError('Module not found', 404));
  }

  const course = await Course.findById(module.course);
  if (req.user.role !== 'admin' && course.teacher.toString() !== req.user.id.toString()) {
    return next(new AppError('Unauthorized to add lessons to this course', 403));
  }

  const lessonCount = await Lesson.countDocuments({ module: module._id });

  const lesson = await Lesson.create({
    module: module._id,
    course: course._id,
    title,
    description: description || '',
    type: type || 'video',
    videoUrl: videoUrl || '',
    documentUrl: documentUrl || '',
    content: content || '',
    duration: duration || '10 min',
    order: order !== undefined ? order : lessonCount,
    isPreview: !!isPreview,
    quiz: quiz || undefined,
  });

  res.status(201).json({
    success: true,
    message: 'Lesson created successfully',
    data: { lesson },
  });
});

// @desc    Update a lesson
// @route   PUT /api/lessons/:id
// @access  Private/Teacher/Admin
export const updateLesson = catchAsync(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    return next(new AppError('Lesson not found', 404));
  }

  const course = await Course.findById(lesson.course);
  if (req.user.role !== 'admin' && course.teacher.toString() !== req.user.id.toString()) {
    return next(new AppError('Unauthorized to edit this lesson', 403));
  }

  const {
    title,
    description,
    type,
    videoUrl,
    documentUrl,
    content,
    duration,
    order,
    isPreview,
    quiz,
  } = req.body;

  if (title) lesson.title = title;
  if (description !== undefined) lesson.description = description;
  if (type) lesson.type = type;
  if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
  if (documentUrl !== undefined) lesson.documentUrl = documentUrl;
  if (content !== undefined) lesson.content = content;
  if (duration !== undefined) lesson.duration = duration;
  if (order !== undefined) lesson.order = order;
  if (isPreview !== undefined) lesson.isPreview = isPreview;
  if (quiz !== undefined) lesson.quiz = quiz || undefined;

  await lesson.save();

  res.status(200).json({
    success: true,
    message: 'Lesson updated successfully',
    data: { lesson },
  });
});

// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
// @access  Private/Teacher/Admin
export const deleteLesson = catchAsync(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    return next(new AppError('Lesson not found', 404));
  }

  const course = await Course.findById(lesson.course);
  if (req.user.role !== 'admin' && course.teacher.toString() !== req.user.id.toString()) {
    return next(new AppError('Unauthorized to delete this lesson', 403));
  }

  // If lesson had an associated quiz, delete quiz
  if (lesson.quiz) {
    await Quiz.findByIdAndDelete(lesson.quiz);
  }

  await Lesson.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Lesson deleted successfully',
  });
});
