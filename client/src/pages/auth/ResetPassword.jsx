import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError('Password reset token is missing from URL.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.resetPassword({ token, password });
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
      toast.error(err.message || 'Reset error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Set New Password</h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Enter your new password below to regain access to your LearnHub account.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          icon={Lock}
          required
        />

        <Input
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          icon={Lock}
          required
        />

        <Button type="submit" className="w-full mt-2" loading={loading} size="lg">
          <span>Reset Password</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <div className="text-center pt-2">
          <Link to="/login" className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
