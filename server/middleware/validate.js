import { AppError } from '../utils/appError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!parsed.success) {
      const errorDetails = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
      return next(new AppError(errorDetails.join(', '), 400));
    }

    // Replace request with sanitized data if needed
    next();
  } catch (err) {
    next(err);
  }
};
