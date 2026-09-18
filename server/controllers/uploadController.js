import cloudinary from '../config/cloudinary.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import fs from 'fs';

// @desc    Upload a single file (image, pdf, document)
// @route   POST /api/upload
// @access  Private
export const uploadFile = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file was uploaded.', 400));
  }

  const filePath = req.file.path;
  const fileName = req.file.filename;
  const originalName = req.file.originalname;
  const mimeType = req.file.mimetype;

  // Check if Cloudinary is configured
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    try {
      const isDoc = mimeType.includes('pdf') || mimeType.includes('document');
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'learnhub_lms',
        resource_type: isDoc ? 'raw' : 'auto',
      });

      // Remove local temp file after Cloudinary upload
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: result.secure_url,
          public_id: result.public_id,
          fileName: originalName,
          mimeType,
        },
      });
    } catch (error) {
      console.error('Cloudinary upload error, using local fallback:', error.message);
    }
  }

  // Local storage URL fallback
  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
  const fileUrl = `${serverUrl}/uploads/${fileName}`;

  res.status(200).json({
    success: true,
    message: 'File uploaded successfully (local storage)',
    data: {
      url: fileUrl,
      fileName: originalName,
      mimeType,
      size: req.file.size,
    },
  });
});
