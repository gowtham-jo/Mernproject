import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = catchAsync(async (req, res, next) => {
  const { role, search, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;

  const query = {};

  if (role) {
    query.role = role;
  }

  if (status !== undefined) {
    query.isActive = status === 'active';
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await User.countDocuments(query);
  const users = await User.find(query).sort(sort).skip(skip).limit(limitNum);

  res.status(200).json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    count: users.length,
    data: { users },
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// @desc    Create user (admin)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role, bio, phone } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return next(new AppError('A user with this email already exists.', 400));
  }

  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password: password || 'Password123!',
    role: role || 'student',
    bio: bio || '',
    phone: phone || '',
  });

  const userObj = user.toObject();
  delete userObj.password;

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { user: userObj },
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = catchAsync(async (req, res, next) => {
  const { name, role, isActive, phone, bio, profileImage } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (name) user.name = name;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (profileImage !== undefined) user.profileImage = profileImage;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: { user },
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent deleting self
  if (user._id.toString() === req.user.id.toString()) {
    return next(new AppError('You cannot delete your own admin account.', 400));
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

// @desc    Toggle user active status
// @route   PUT /api/users/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user._id.toString() === req.user.id.toString()) {
    return next(new AppError('You cannot deactivate your own account.', 400));
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user },
  });
});

// @desc    Get all teachers
// @route   GET /api/users/teachers/all
// @access  Public
export const getTeachersList = catchAsync(async (req, res, next) => {
  const teachers = await User.find({ role: 'teacher', isActive: true })
    .select('name email profileImage bio')
    .sort('name');

  res.status(200).json({
    success: true,
    count: teachers.length,
    data: { teachers },
  });
});
