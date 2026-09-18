import Announcement from '../models/Announcement.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

// @desc    Get announcements (by course or global platform announcements)
// @route   GET /api/announcements
// @access  Private
export const getAnnouncements = catchAsync(async (req, res, next) => {
  const { courseId } = req.query;
  const query = {};

  if (courseId) {
    query.course = courseId;
  } else if (req.user.role === 'student') {
    // For student, get global announcements + announcements for their enrolled courses
    const studentEnrollments = await Enrollment.find({ student: req.user.id }).select('course');
    const courseIds = studentEnrollments.map((e) => e.course);

    query.$or = [{ isGlobal: true }, { course: { $in: courseIds } }];
  } else if (req.user.role === 'teacher') {
    // For teacher, get global + their created courses' announcements
    const teacherCourses = await Course.find({ teacher: req.user.id }).select('_id');
    const courseIds = teacherCourses.map((c) => c._id);
    query.$or = [{ isGlobal: true }, { course: { $in: courseIds } }, { sender: req.user.id }];
  }

  const announcements = await Announcement.find(query)
    .populate('sender', 'name email profileImage role')
    .populate('course', 'title thumbnail')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: announcements.length,
    data: { announcements },
  });
});

// @desc    Create announcement (teacher for course, admin for global/course)
// @route   POST /api/announcements
// @access  Private/Teacher/Admin
export const createAnnouncement = catchAsync(async (req, res, next) => {
  const { title, content, courseId, isGlobal } = req.body;

  let course = null;
  if (courseId) {
    course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user.id.toString()) {
      return next(new AppError('Unauthorized to post announcement for this course', 403));
    }
  }

  const announcement = await Announcement.create({
    sender: req.user.id,
    course: course ? course._id : undefined,
    title,
    content,
    isGlobal: req.user.role === 'admin' ? !!isGlobal : false,
  });

  // Notify enrolled students or all students
  let recipients = [];
  if (course) {
    const enrollments = await Enrollment.find({ course: course._id }).select('student');
    recipients = enrollments.map((e) => e.student);
  } else if (isGlobal) {
    const users = await User.find({ isActive: true }).select('_id');
    recipients = users.map((u) => u._id);
  }

  if (recipients.length > 0) {
    const notifications = recipients.map((recipientId) => ({
      recipient: recipientId,
      sender: req.user.id,
      title: `Announcement: ${title}`,
      message: `${course ? `[${course.title}] ` : ''}${content.slice(0, 120)}...`,
      type: 'announcement',
      link: course ? `/courses/${course._id}` : '/announcements',
    }));
    await Notification.insertMany(notifications).catch(() => {});
  }

  const populated = await Announcement.findById(announcement._id)
    .populate('sender', 'name email profileImage role')
    .populate('course', 'title');

  res.status(201).json({
    success: true,
    message: 'Announcement posted successfully',
    data: { announcement: populated },
  });
});

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Teacher/Admin
export const deleteAnnouncement = catchAsync(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    return next(new AppError('Announcement not found', 404));
  }

  if (
    req.user.role !== 'admin' &&
    announcement.sender.toString() !== req.user.id.toString()
  ) {
    return next(new AppError('Unauthorized to delete this announcement', 403));
  }

  await Announcement.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Announcement deleted successfully',
  });
});
