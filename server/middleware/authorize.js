import { AppError } from '../utils/appError.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You must be logged in to perform this action.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`User role '${req.user.role}' is not authorized to access this resource.`, 403)
      );
    }

    next();
  };
};
