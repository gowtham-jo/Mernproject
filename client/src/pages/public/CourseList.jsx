import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, BookOpen, RefreshCw } from 'lucide-react';
import courseService from '../../services/courseService';
import CourseCard from '../../components/course/CourseCard';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { Loader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export const CourseList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [level, setLevel] = useState(searchParams.get('level') || 'all');
  const [price, setPrice] = useState(searchParams.get('price') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Load categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await courseService.getCategories();
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch courses whenever filters change
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        sort,
      };

      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      if (level !== 'all') params.level = level;
      if (price !== 'all') params.price = price;

      const res = await courseService.getCourses(params);
      setCourses(res.data.courses || []);
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);

      // Sync URL search params
      const newParams = {};
      if (search) newParams.search = search;
      if (category !== 'all') newParams.category = category;
      if (level !== 'all') newParams.level = level;
      if (price !== 'all') newParams.price = price;
      if (sort !== 'newest') newParams.sort = sort;
      if (page > 1) newParams.page = page.toString();
      setSearchParams(newParams);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search, category, level, price, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setLevel('all');
    setPrice('all');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore Courses</h1>
        <p className="text-sm text-slate-500 mt-1">
          Showing {totalCount} verified online courses and masterclasses
        </p>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-4">
            <SearchBar
              placeholder="Search by title, keyword, tech stack..."
              value={search}
              onSearch={(val) => {
                setSearch(val);
                setPage(1);
              }}
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug || cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Level Dropdown */}
          <div className="md:col-span-2">
            <select
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Price Dropdown */}
          <div className="md:col-span-1">
            <select
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              <option value="all">Pricing</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips & Reset */}
        {(search || category !== 'all' || level !== 'all' || price !== 'all' || sort !== 'newest') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-slate-400 font-medium">Active Filters:</span>
              {search && (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold">
                  "{search}"
                </span>
              )}
              {category !== 'all' && (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold">
                  Category: {category}
                </span>
              )}
              {level !== 'all' && (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold capitalize">
                  {level}
                </span>
              )}
              {price !== 'all' && (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold capitalize">
                  {price}
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <Loader text="Fetching courses..." />
      ) : courses && courses.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Try adjusting your filters or search keywords to find available courses."
          actionLabel="Reset All Filters"
          onAction={handleResetFilters}
        />
      )}
    </div>
  );
};

export default CourseList;
