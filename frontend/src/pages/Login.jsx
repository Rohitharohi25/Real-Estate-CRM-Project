import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiLock, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-8">
      <div className="mb-6 inline-flex rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:border-primary-900 dark:bg-primary-950 dark:text-primary-300">
        Secure CRM access
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50">Welcome back</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Sign in to manage customers, pipeline, plans, and your sales team.</p>

      <div className="mt-5 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
        {['Fast team workspace', 'Plan-based admin access', 'Role-aware CRM tools'].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <FiCheckCircle className="text-primary-600" size={16} />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="email"
              required
              className="input pl-10"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="password"
              required
              className="input pl-10"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
            />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in...' : <>Sign in <FiArrowRight size={16} /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
};

export default Login;
