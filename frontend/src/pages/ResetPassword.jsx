import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Reset link is missing a token');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword({ token, password });
      toast.success('Password reset. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Reset password</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a new password for your account.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label">New password</label>
          <input type="password" required minLength={8} className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
      <Link to="/login" className="mt-6 inline-block text-sm font-medium text-primary-600 hover:underline">
        Back to login
      </Link>
    </div>
  );
};

export default ResetPassword;
