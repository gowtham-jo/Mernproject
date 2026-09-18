import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

// @desc    Enroll student in course
// @route   POST /api/courses/:courseId/enroll
// @access  Private/Student
export const enrollInCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const studentId = req.user.id;

  const course = await Course.findById(courseId).populate('teacher', 'name email');
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (existingEnrollment) {
    return res.status(200).json({
      success: true,
      message: 'You are already enrolled in this course.',
      data: { enrollment: existingEnrollment },
    });
  }

  // Find first lesson if any
  const firstModule = await Module.findOne({ course: courseId }).sort({ order: 1 });
  let firstLesson = null;
  if (firstModule) {
    firstLesson = await Lesson.findOne({ module: firstModule._id }).sort({ order: 1 });
  }

  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    progress: 0,
    completedLessons: [],
    lastAccessedLesson: firstLesson ? firstLesson._id : undefined,
  });

  // Increment enrolled count on course
  course.enrolledStudentsCount = (course.enrolledStudentsCount || 0) + 1;
  await course.save();

  // Send notification to student
  await Notification.create({
    recipient: studentId,
    sender: course.teacher?._id,
    title: 'Enrollment Confirmed!',
    message: `You have successfully enrolled in "${course.title}". Start learning today!`,
    type: 'enrollment',
    link: `/student/courses/${course._id}`,
  }).catch(() => {});

  // Send notification to teacher
  if (course.teacher) {
    await Notification.create({
      recipient: course.teacher._id,
      sender: studentId,
      title: 'New Student Enrolled!',
      message: `${req.user.name} enrolled in your course "${course.title}".`,
      type: 'enrollment',
      link: `/teacher/students`,
    }).catch(() => {});
  }

  res.status(201).json({
    success: true,
    message: 'Enrolled successfully in the course',
    data: { enrollment },
  });
});

// @desc    Get all courses enrolled by the current logged-in student
// @route   GET /api/enrollments/my-courses
// @access  Private/Student
export const getMyCourses = catchAsync(async (req, res, next) => {
  const enrollments = await Enrollment.find({ student: req.user.id })
    .populate({
      path: 'course',
      populate: [
        { path: 'teacher', select: 'name email profileImage' },
        { path: 'category', select: 'name slug' },
      ],
    })
    .populate('lastAccessedLesson', 'title type duration')
    .sort({ updatedAt: -1 });

  // Filter out any enrollments whose course might have been deleted
  const validEnrollments = enrollments.filter((e) => e.course != null);

  res.status(200).json({
    success: true,
    count: validEnrollments.length,
    data: { enrollments: validEnrollments },
  });
});

// @desc    Get student progress for a specific course
// @route   GET /api/progress/course/:courseId
// @access  Private
export const getCourseProgress = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const studentId = req.user.id;

  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  })
    .populate('completedLessons')
    .populate('lastAccessedLesson');

  if (!enrollment) {
    return next(new AppError('You are not enrolled in this course.', 404));
  }

  // Get total lessons count for accurate recalculation
  const modules = await Module.find({ course: courseId });
  const moduleIds = modules.map((m) => m._id);
  const totalLessons = await Lesson.countDocuments({ module: { $in: moduleIds } });

  res.status(200).json({
    success: true,
    data: {
      enrollment,
      totalLessons,
      completedCount: enrollment.completedLessons.length,
      progress: enrollment.progress,
      isCompleted: enrollment.progress === 100,
    },
  });
});

// @desc    Mark a lesson complete / incomplete and recalculate progress
// @route   POST /api/progress/toggle-lesson
// @access  Private/Student
export const toggleLessonComplete = catchAsync(async (req, res, next) => {
  const { courseId, lessonId, isCompleted } = req.body;
  const studentId = req.user.id;

  let enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (!enrollment) {
    return next(new AppError('Enrollment record not found.', 404));
  }

  const lessonObjectId = lessonId.toString();
  const completedSet = new Set(enrollment.completedLessons.map((id) => id.toString()));

  if (isCompleted === false) {
    completedSet.delete(lessonObjectId);
  } else {
    completedSet.add(lessonObjectId);
  }

  enrollment.completedLessons = Array.from(completedSet);
  enrollment.lastAccessedLesson = lessonId;

  // Recalculate percentage
  const modules = await Module.find({ course: courseId });
  const moduleIds = modules.map((m) => m._id);
  const totalLessons = await Lesson.countDocuments({ module: { $in: moduleIds } });

  const completedCount = enrollment.completedLessons.length;
  enrollment.progress = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 100;

  if (enrollment.progress === 100 && !enrollment.completedAt) {
    enrollment.completedAt = new Date();
  } else if (enrollment.progress < 100) {
    enrollment.completedAt = undefined;
  }

  await enrollment.save();

  res.status(200).json({
    success: true,
    message: isCompleted === false ? 'Lesson marked incomplete' : 'Lesson marked complete',
    data: {
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
      isCompleted: enrollment.progress === 100,
    },
  });
});

// @desc    Update last accessed lesson
// @route   POST /api/progress/last-accessed
// @access  Private/Student
export const updateLastAccessed = catchAsync(async (req, res, next) => {
  const { courseId, lessonId } = req.body;

  const enrollment = await Enrollment.findOneAndUpdate(
    { student: req.user.id, course: courseId },
    { lastAccessedLesson: lessonId },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: { enrollment },
  });
});

// @desc    Get all enrollments (Admin)
// @route   GET /api/enrollments
// @access  Private/Admin
export const getAllEnrollments = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 15 } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const total = await Enrollment.countDocuments();
  const enrollments = await Enrollment.find()
    .populate('student', 'name email profileImage')
    .populate('course', 'title category price thumbnail')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: { enrollments },
  });
});

// @desc    Get enrolled students for teacher's courses
// @route   GET /api/enrollments/teacher/students
// @access  Private/Teacher
export const getTeacherStudents = catchAsync(async (req, res, next) => {
  const teacherCourses = await Course.find({ teacher: req.user.id }).select('_id title');
  const courseIds = teacherCourses.map((c) => c._id);

  const enrollments = await Enrollment.find({ course: { $in: courseIds } })
    .populate('student', 'name email profileImage phone createdAt')
    .populate('course', 'title')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: { enrollments },
  });
});
