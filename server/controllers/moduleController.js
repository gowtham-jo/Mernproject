import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

// @desc    Get all modules for a course
// @route   GET /api/courses/:courseId/modules
// @access  Public
export const getCourseModules = catchAsync(async (req, res, next) => {
  const modules = await Module.find({ course: req.params.courseId })
    .sort({ order: 1 })
    .lean();

  const enriched = await Promise.all(
    modules.map(async (mod) => {
      const lessons = await Lesson.find({ module: mod._id }).sort({ order: 1 });
      return { ...mod, lessons };
    })
  );

  res.status(200).json({
    success: true,
    count: enriched.length,
    data: { modules: enriched },
  });
});

// @desc    Create a module
// @route   POST /api/courses/:courseId/modules
// @access  Private/Teacher/Admin
export const createModule = catchAsync(async (req, res, next) => {
  const { title, description, order } = req.body;
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (req.user.role !== 'admin' && course.teacher.toString() !== req.user.id.toString()) {
    return next(new AppError('Unauthorized to add modules to this course', 403));
  }

  const moduleCount = await Module.countDocuments({ course: course._id });

  const module = await Module.create({
    course: course._id,
    title,
    description: description || '',
    order: order !== undefined ? order : moduleCount,
  });

  res.status(201).json({
    success: true,
    message: 'Module created successfully',
    data: { module: { ...module.toObject(), lessons: [] } },
  });
});

// @desc    Update a module
// @route   PUT /api/modules/:id
// @access  Private/Teacher/Admin
export const updateModule = catchAsync(async (req, res, next) => {
  const { title, description, order } = req.body;
  const module = await Module.findById(req.params.id);

  if (!module) {
    return next(new AppError('Module not found', 404));
  }

  const course = await Course.findById(module.course);
  if (req.user.role !== 'admin' && course.teacher.toString() !== req.user.id.toString()) {
    return next(new AppError('Unauthorized to edit this module', 403));
  }

  if (title) module.title = title;
  if (description !== undefined) module.description = description;
  if (order !== undefined) module.order = order;

  await module.save();

  res.status(200).json({
    success: true,
    message: 'Module updated successfully',
    data: { module },
  });
});

// @desc    Delete a module and its lessons
// @route   DELETE /api/modules/:id
// @access  Private/Teacher/Admin
export const deleteModule = catchAsync(async (req, res, next) => {
  const module = await Module.findById(req.params.id);
  if (!module) {
    return next(new AppError('Module not found', 404));
  }

  const course = await Course.findById(module.course);
  if (req.user.role !== 'admin' && course.teacher.toString() !== req.user.id.toString()) {
    return next(new AppError('Unauthorized to delete this module', 403));
  }

  await Lesson.deleteMany({ module: module._id });
  await Module.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Module and its lessons deleted successfully',
  });
});
