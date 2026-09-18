import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import Category from '../models/Category.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

// @desc    Get all courses with search, filters, sorting & pagination
// @route   GET /api/courses
// @access  Public
export const getCourses = catchAsync(async (req, res, next) => {
  const {
    search,
    category,
    level,
    price,
    teacher,
    rating,
    sort = 'newest',
    page = 1,
    limit = 12,
    status = 'published',
  } = req.query;

  const query = {};

  // For public endpoints, default to published courses unless admin/teacher viewing their own
  if (status && status !== 'all') {
    query.status = status;
  }

  // If teacher filter provided
  if (teacher) {
    query.teacher = teacher;
  }

  // Category filter (support ObjectId or slug)
  if (category && category !== 'all') {
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = category;
    } else {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }
  }

  // Level filter
  if (level && level !== 'all') {
    query.level = level;
  }

  // Price filter
  if (price === 'free') {
    query.price = 0;
  } else if (price === 'paid') {
    query.price = { $gt: 0 };
  }

  // Rating filter
  if (rating) {
    query.rating = { $gte: Number(rating) };
  }

  // Search keyword in title, description, or tags
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  // Sorting
  let sortOption = {};
  switch (sort) {
    case 'popular':
      sortOption = { enrolledStudentsCount: -1 };
      break;
    case 'rating':
      sortOption = { rating: -1 };
      break;
    case 'price-low':
      sortOption = { price: 1 };
      break;
    case 'price-high':
      sortOption = { price: -1 };
      break;
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'newest':
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('teacher', 'name email profileImage bio')
    .populate('category', 'name slug icon')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    count: courses.length,
    data: { courses },
  });
});

// @desc    Get single course by ID with modules, lessons and enrollment status
// @route   GET /api/courses/:id
// @access  Public (Enhanced if authenticated)
export const getCourseById = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate('teacher', 'name email profileImage bio')
    .populate('category', 'name slug icon');

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Fetch modules and their lessons
  const modules = await Module.find({ course: course._id }).sort({ order: 1 }).lean();

  const enrichedModules = await Promise.all(
    modules.map(async (mod) => {
      const lessons = await Lesson.find({ module: mod._id })
        .populate('quiz', 'title timeLimit passingScore')
        .sort({ order: 1 })
        .lean();
      return {
        ...mod,
        lessons,
      };
    })
  );

  let isEnrolled = false;
  let enrollmentData = null;

  if (req.user) {
    enrollmentData = await Enrollment.findOne({
      student: req.user.id,
      course: course._id,
    });
    if (enrollmentData) {
      isEnrolled = true;
    }
  }

  // Count total lessons
  const totalLessons = enrichedModules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0);

  res.status(200).json({
    success: true,
    data: {
      course,
      modules: enrichedModules,
      totalLessons,
      isEnrolled,
      enrollment: enrollmentData,
    },
  });
});

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Teacher/Admin
export const createCourse = catchAsync(async (req, res, next) => {
  const {
    title,
    subtitle,
    description,
    category,
    price,
    level,
    duration,
    thumbnail,
    requirements,
    learningOutcomes,
    tags,
    status,
  } = req.body;

  // Verify category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return next(new AppError('Invalid category ID provided', 400));
  }

  const course = await Course.create({
    title,
    subtitle: subtitle || '',
    description,
    category,
    teacher: req.user.id,
    price: price || 0,
    level: level || 'all_levels',
    duration: duration || '4 Weeks',
    thumbnail:
      thumbnail ||
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
    requirements: requirements || [],
    learningOutcomes: learningOutcomes || [],
    tags: tags || [],
    status: status || 'draft',
  });

  const populatedCourse = await Course.findById(course._id)
    .populate('teacher', 'name email profileImage')
    .populate('category', 'name slug');

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    data: { course: populatedCourse },
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Teacher/Admin
export const updateCourse = catchAsync(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Authorization check: only course teacher or admin
  if (req.user.role !== 'admin' && course.teacher.toString() !== req.user.id.toString()) {
    return next(new AppError('You are not authorized to update this course', 403));
  }

  const {
    title,
    subtitle,
    description,
    category,
    price,
    level,
    duration,
    thumbnail,
    requirements,
    learningOutcomes,
    tags,
    status,
  } = req.body;

  if (title) course.title = title;
  if (subtitle !== undefined) course.subtitle = subtitle;
  if (description) course.description = description;
  if (category) course.category = category;
  if (price !== undefined) course.price = price;
  if (level) course.level = level;
  if (duration) course.duration = duration;
  if (thumbnail) course.thumbnail = thumbnail;
  if (requirements) course.requirements = requirements;
  if (learningOutcomes) course.learningOutcomes = learningOutcomes;
  if (tags) course.tags = tags;
  if (status) course.status = status;

  await course.save();

  const updatedCourse = await Course.findById(course._id)
    .populate('teacher', 'name email profileImage')
    .populate('category', 'name slug');

  res.status(200).json({
    success: true,
    message: 'Course updated successfully',
    data: { course: updatedCourse },
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Teacher/Admin
export const deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (req.user.role !== 'admin' && course.teacher.toString() !== req.user.id.toString()) {
    return next(new AppError('You are not authorized to delete this course', 403));
  }

  // Delete all modules and lessons
  const modules = await Module.find({ course: course._id });
  for (const mod of modules) {
    await Lesson.deleteMany({ module: mod._id });
  }
  await Module.deleteMany({ course: course._id });
  await Enrollment.deleteMany({ course: course._id });
  await Course.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Course and all associated content deleted successfully',
  });
});

// @desc    Publish/Unpublish course
// @route   PUT /api/courses/:id/status
// @access  Private/Teacher/Admin
export const toggleCourseStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (req.user.role !== 'admin' && course.teacher.toString() !== req.user.id.toString()) {
    return next(new AppError('You are not authorized to change this course status', 403));
  }

  course.status = status || (course.status === 'published' ? 'draft' : 'published');
  await course.save();

  // If newly published, optionally notify students
  if (course.status === 'published') {
    const students = await User.find({ role: 'student' }).limit(50);
    const notifications = students.map((std) => ({
      recipient: std._id,
      sender: req.user.id,
      title: 'New Course Published!',
      message: `Check out "${course.title}" by ${req.user.name}`,
      type: 'course_update',
      link: `/courses/${course._id}`,
    }));
    await Notification.insertMany(notifications).catch(() => {});
  }

  res.status(200).json({
    success: true,
    message: `Course status changed to ${course.status}`,
    data: { course },
  });
});

// @desc    Get courses created by logged-in teacher
// @route   GET /api/courses/teacher/my-courses
// @access  Private/Teacher
export const getMyTeacherCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find({ teacher: req.user.id })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: courses.length,
    data: { courses },
  });
});
