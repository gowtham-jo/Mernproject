import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleDemoFill = (email, role) => {
    setFormData({
      email,
      password: 'Password123!',
    });
    toast.success(`Demo credentials filled for ${role}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const user = await login(formData);
      toast.success(`Welcome back, ${user.name}!`);

      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to your account</h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Or{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
            create a new student account
          </Link>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="name@example.com"
          icon={Mail}
          required
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            icon={Lock}
            required
          />
        </div>

        <Button type="submit" className="w-full mt-2" loading={loading} size="lg">
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>

      {/* 1-Click Demo Accounts Pill Bar */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
          Quick Demo 1-Click Fill
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoFill('admin@example.com', 'Admin')}
            className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors text-center"
          >
            👑 Admin
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('teacher@example.com', 'Teacher')}
            className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors text-center"
          >
            👩‍🏫 Teacher
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('student@example.com', 'Student')}
            className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors text-center"
          >
            👨‍🎓 Student
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
