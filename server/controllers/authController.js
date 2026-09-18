import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendEmail } from '../utils/sendEmail.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_learnhub_jwt_key_2026_very_long_and_secure', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  const userObj = user.toObject();
  delete userObj.password;

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user: userObj,
    },
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Security: Public registration can only register student or teacher (if allowed) - admin must be created by admin or seed
  let assignedRole = 'student';
  if (role === 'teacher') {
    assignedRole = 'teacher';
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    return next(new AppError('An account with this email already exists.', 400));
  }

  const newUser = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password,
    role: assignedRole,
  });

  createSendToken(newUser, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide both email and password.', 400));
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 403));
  }

  createSendToken(user, 200, res);
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase().trim() });

  if (!user) {
    // Return success to avoid email enumeration
    return res.status(200).json({
      success: true,
      message: 'If that email is registered, password reset instructions have been sent.',
    });
  }

  // Generate random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  const message = `You are receiving this email because you requested a password reset. Please click on the link or paste it in your browser to complete the process:\n\n${resetURL}\n\nIf you did not request this, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'LearnHub LMS - Password Reset Request',
      message,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to email.',
      resetTokenInDev: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the reset email. Try again later.', 500));
  }
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(new AppError('Please provide both token and new password.', 400));
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Password reset token is invalid or has expired.', 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

// @desc    Update Profile Details
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = catchAsync(async (req, res, next) => {
  const { name, phone, bio, profileImage } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (profileImage !== undefined) user.profileImage = profileImage;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    return next(new AppError('Your current password is incorrect.', 400));
  }

  user.password = newPassword;
  await user.save();

  createSendToken(user, 200, res);
});
