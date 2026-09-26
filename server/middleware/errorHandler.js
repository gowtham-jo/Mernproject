import { AppError } from '../utils/appError.js';

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.statusCode >= 500 || process.env.NODE_ENV === 'development') {
    if (err.statusCode !== 404) {
      console.error('[Error Details]', {
        message: err.message,
        statusCode: err.statusCode,
      });
    }
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `A record with that ${field} already exists.`,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((el) => el.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. '),
      errors: messages,
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid resource identifier: ${err.value}`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Your session has expired. Please log in again.',
    });
  }

  // Mongoose buffering timeout (DB disconnected when query was attempted)
  if (
    err.name === 'MongooseError' ||
    (err.message && err.message.includes('buffering timed out'))
  ) {
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable. Please try again in a moment.',
    });
  }

  // MongoDB server errors (network, auth, etc.)
  if (err.name === 'MongoServerError' || err.name === 'MongoNetworkError') {
    return res.status(503).json({
      success: false,
      message: 'A database error occurred. Please try again later.',
    });
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
