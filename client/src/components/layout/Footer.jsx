import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Linkedin, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1 */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Learn<span className="text-blue-500">Hub</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The next-generation Learning Management System. Empowering students, teachers, and organizations to achieve excellence through interactive education.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/courses" className="hover:text-white transition-colors">Browse All Courses</Link></li>
              <li><Link to="/courses?category=web-development" className="hover:text-white transition-colors">Web Development</Link></li>
              <li><Link to="/courses?category=ai-data-science" className="hover:text-white transition-colors">Artificial Intelligence</Link></li>
              <li><Link to="/courses?category=ui-ux-design" className="hover:text-white transition-colors">UI/UX Design Systems</Link></li>
              <li><Link to="/courses?price=free" className="hover:text-white transition-colors">Free Masterclasses</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Become a Student</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Teach on LearnHub</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Portal Login</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Demo Credentials</h4>
            <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60 text-xs space-y-1.5 font-mono">
              <p className="text-slate-300 font-sans font-semibold text-[11px]">Password for all: <span className="text-blue-400">Password123!</span></p>
              <div className="pt-1 text-slate-400">
                <p>👑 Admin: <span className="text-slate-200">admin@example.com</span></p>
                <p>👩‍🏫 Teacher: <span className="text-slate-200">teacher@example.com</span></p>
                <p>👨‍🎓 Student: <span className="text-slate-200">student@example.com</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 LearnHub LMS Platform. Built with the complete MERN Stack.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Designed for Modern Education</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
