import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Check your email</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          If an account exists for {email}, we've sent a link to reset your password.
        </p>
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-primary-600 hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Forgot password</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Enter your email and we'll send you a reset link.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label">Email</label>
          <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
      <Link to="/login" className="mt-6 inline-block text-sm font-medium text-primary-600 hover:underline">
        Back to login
      </Link>
    </div>
  );
};

export default ForgotPassword;
