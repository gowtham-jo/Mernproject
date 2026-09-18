import Category from '../models/Category.js';
import Course from '../models/Course.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find().sort('name');

  // Enrich with course count
  const enrichedCategories = await Promise.all(
    categories.map(async (cat) => {
      const count = await Course.countDocuments({ category: cat._id, status: 'published' });
      return {
        ...cat.toObject(),
        courseCount: count,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: enrichedCategories.length,
    data: { categories: enrichedCategories },
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { category },
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = catchAsync(async (req, res, next) => {
  const { name, description, icon } = req.body;

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const existing = await Category.findOne({ slug });
  if (existing) {
    return next(new AppError('Category with this name already exists', 400));
  }

  const category = await Category.create({
    name,
    slug,
    description: description || '',
    icon: icon || 'BookOpen',
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category },
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = catchAsync(async (req, res, next) => {
  const { name, description, icon, isActive } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  if (name) {
    category.name = name;
    category.slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  if (description !== undefined) category.description = description;
  if (icon !== undefined) category.icon = icon;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: { category },
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  const courseCount = await Course.countDocuments({ category: category._id });
  if (courseCount > 0) {
    return next(
      new AppError(`Cannot delete category with ${courseCount} associated courses. Reassign or delete courses first.`, 400)
    );
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});
