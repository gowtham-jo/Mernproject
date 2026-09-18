import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_learnhub_jwt_key_2026_very_long_and_secure');
    const currentUser = await User.findById(decoded.id).select('-password');

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (!currentUser.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 403));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }
});

// Optional auth (populates req.user if token present, but doesn't block if missing)
export const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_learnhub_jwt_key_2026_very_long_and_secure');
    const currentUser = await User.findById(decoded.id).select('-password');
    if (currentUser && currentUser.isActive) {
      req.user = currentUser;
    }
  } catch (err) {
    // Ignore invalid token in optional auth
  }

  next();
});
