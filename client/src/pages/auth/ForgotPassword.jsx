import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await authService.forgotPassword(email);
      setSubmitted(true);
      if (res.resetTokenInDev) {
        setDevToken(res.resetTokenInDev);
      }
      toast.success('Password reset instructions sent!');
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
      toast.error(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Forgot Password</h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Enter your registered email address to receive password reset instructions.
        </p>
      </div>

      {submitted ? (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            If an account exists for <span className="font-semibold text-slate-800">{email}</span>, a password reset link has been dispatched.
          </p>

          {devToken && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-left">
              <p className="text-[11px] font-bold text-blue-900 uppercase">Development Mode Shortcut:</p>
              <Link
                to={`/reset-password?token=${devToken}`}
                className="text-xs text-blue-600 font-semibold underline break-all mt-1 block"
              >
                Click here to reset your password with token
              </Link>
            </div>
          )}

          <Link to="/login" className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-500 pt-2">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            icon={Mail}
            required
          />

          <Button type="submit" className="w-full mt-2" loading={loading} size="lg">
            <span>Send Reset Instructions</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <div className="text-center pt-2">
            <Link to="/login" className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
