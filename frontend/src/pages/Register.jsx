import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { planService } from '../services/planService';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlanId = searchParams.get('plan') || '';
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    companyName: '',
    password: '',
    planId: selectedPlanId,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    planService.publicList()
      .then((res) => setPlans(res.data))
      .catch(() => setPlans([]));
  }, []);

  useEffect(() => {
    if (selectedPlanId) setForm((prev) => ({ ...prev, planId: selectedPlanId }));
  }, [selectedPlanId]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan._id === form.planId),
    [plans, form.planId]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.planId) return toast.error('Please select a plan');
    setLoading(true);
    try {
      await register(form);
      toast.success('Admin account created. Review your plan setup.');
      navigate('/account');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Step 2 of 3</p>
      <h2 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-slate-50">Create admin account</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        Choose a plan, create the account owner, then continue to plan usage and team setup.
      </p>

      {selectedPlan && (
        <div className="mt-5 rounded-lg border border-primary-100 bg-primary-50 p-4 dark:border-primary-900 dark:bg-primary-950/40">
          <p className="text-sm font-semibold text-primary-800 dark:text-primary-200">{selectedPlan.name}</p>
          <p className="mt-1 text-sm text-primary-700 dark:text-primary-300">
            ${Number(selectedPlan.priceMonthly || 0).toLocaleString()} per month / {selectedPlan.maxUsers} users
          </p>
          <div className="mt-3 grid gap-2 text-xs text-primary-800 dark:text-primary-200">
            {['Admin account is created', 'Plan limits are applied', 'Next step opens Account setup'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <FiCheckCircle size={14} /> {item}
              </span>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label">Plan</label>
          <select required className="input" value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })}>
            <option value="">Select a plan</option>
            {plans.map((plan) => (
              <option key={plan._id} value={plan._id}>
                {plan.name} - ${Number(plan.priceMonthly || 0).toLocaleString()}/mo
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Company name</label>
          <input required className="input" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="Acme Inc" />
        </div>
        <div>
          <label className="label">Admin full name</label>
          <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
        </div>
        <div>
          <label className="label">Admin email</label>
          <input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" required minLength={8} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creating admin...' : 'Create admin and continue'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
