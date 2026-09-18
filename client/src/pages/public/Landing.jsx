import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  Star,
  Layers,
  GraduationCap,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import courseService from '../../services/courseService';
import userService from '../../services/userService';
import CourseCard from '../../components/course/CourseCard';
import { Loader } from '../../components/common/Loader';
import Button from '../../components/common/Button';

export const Landing = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [courseRes, catRes, teachRes] = await Promise.all([
          courseService.getCourses({ limit: 6, sort: 'popular' }),
          courseService.getCategories(),
          userService.getTeachersList(),
        ]);
        setFeaturedCourses(courseRes.data.courses || []);
        setCategories(catRes.data.categories || []);
        setTeachers(teachRes.data.teachers || []);
      } catch (error) {
        console.error('Failed to load landing page data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Background glow decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-100/60 via-indigo-100/40 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-subtle">
                <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>Modern Education Reimagined for 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Master High-Impact Skills with <span className="gradient-text">World-Class Instructors</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Explore interactive video masterclasses, hands-on coding labs, quizzes with real-time feedback, and 1-on-1 instructor messaging. Designed to elevate your career.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/courses">
                  <Button size="lg" className="w-full sm:w-auto shadow-md shadow-blue-500/20">
                    <span>Explore All Courses</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <Link to="/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <span>Start Learning Free</span>
                  </Button>
                </Link>
              </div>

              {/* Trust metric badges */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                <div>
                  <h4 className="text-2xl font-black text-slate-900">15,000+</h4>
                  <p className="text-xs text-slate-500 font-medium">Active Students</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900">98.4%</h4>
                  <p className="text-xs text-slate-500 font-medium">Completion Rate</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900">4.9/5</h4>
                  <p className="text-xs text-slate-500 font-medium">Instructor Rating</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Visual Hero Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white">
                  <div className="relative aspect-video">
                    <img
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80"
                      alt="Students collaborating"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-6">
                      <div className="text-white">
                        <span className="px-2.5 py-1 text-xs font-bold bg-blue-600 rounded-lg">
                          Featured Specialization
                        </span>
                        <h3 className="text-lg font-bold mt-2">MERN Full-Stack & Generative AI</h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>Curriculum Progress</span>
                      <span className="text-blue-600">75% Complete</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full w-3/4" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-2.5">
                        <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-xs font-semibold text-slate-700">Verified Certificate</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-2.5">
                        <Zap className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span className="text-xs font-semibold text-slate-700">Instant Grading</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              Course Categories
            </h2>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              Explore Popular Domains
            </h3>
          </div>
          <Link
            to="/courses"
            className="mt-3 sm:mt-0 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Browse All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories && categories.length > 0 ? (
            categories.slice(0, 5).map((cat) => (
              <Link
                key={cat._id}
                to={`/courses?category=${cat.slug}`}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover-card flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  {cat.courseCount || 0} Courses
                </p>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-slate-400">
              Loading categories...
            </div>
          )}
        </div>
      </section>

      {/* 3. FEATURED COURSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              Top Rated Programs
            </h2>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              Featured Masterclasses
            </h3>
          </div>
          <Link
            to="/courses"
            className="mt-3 sm:mt-0 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <Loader text="Loading featured courses..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* 4. WHY LEARN WITH US */}
      <section className="bg-slate-900 text-white py-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-6 sm:px-12 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
            Engineered for Mastery
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Why Thousands of Learners Choose LearnHub
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Traditional learning is passive. LearnHub is active, interactive, and built around real-world mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800/80 border border-slate-700/60 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <PlayCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Video & Interactive Labs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Crystal-clear video lessons coupled with rich reading documentation, PDF guides, and code repositories.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Automated Quiz Grading</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Test your skills with multiple-choice and true/false quizzes with instant score calculation and answer explanations.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Direct Instructor Messaging</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Have questions about a module? Message your course instructor directly in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* 5. INSTRUCTORS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            Expert Mentors
          </h2>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            Learn Directly from Industry Leaders
          </h3>
          <p className="text-xs text-slate-500 mt-2">
            Our teachers are active practitioners and seasoned software architects.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 text-center hover-card shadow-subtle flex flex-col items-center"
            >
              <img
                src={t.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                alt={t.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-50 shadow-md mb-4"
              />
              <h4 className="text-base font-bold text-slate-900">{t.name}</h4>
              <p className="text-xs font-semibold text-blue-600 mb-2">{t.email}</p>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{t.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Accelerate Your Career?
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Join thousands of professionals leveling up their technical skills on LearnHub today.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/courses">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10"
                >
                  Explore Course Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
