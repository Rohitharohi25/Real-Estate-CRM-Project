import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheck, FiCreditCard, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { accountService } from '../services/accountService';
import { useAuth } from '../hooks/useAuth';

const UsageBar = ({ label, value = 0, max = 0 }) => {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-500">{value.toLocaleString()} / {Number(max || 0).toLocaleString()}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full rounded-full bg-primary-600" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

const Account = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState('');

  const load = () => {
    setLoading(true);
    accountService.summary()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const changePlan = async (planId) => {
    setSavingPlan(planId);
    try {
      await accountService.changePlan(planId);
      toast.success('Plan updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Plan change failed');
    } finally {
      setSavingPlan('');
    }
  };

  if (loading) return <div className="card">Loading account...</div>;

  const isSuperAdmin = user?.role === 'super_admin';
  const plan = data?.plan;
  const usage = data?.usage || {};

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Account</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Plan and subscription</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Review plan limits, usage, and account status.</p>
      </div>

      {isSuperAdmin ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['Companies', data.platform?.companies, FiCreditCard],
            ['Users', data.platform?.users, FiUsers],
            ['Customers', data.platform?.customers, FiTrendingUp],
            ['Leads', data.platform?.leads, FiTrendingUp],
          ].map(([label, value, Icon]) => (
            <div key={label} className="card">
              <Icon className="mb-3 text-primary-600" size={22} />
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-slate-50">{Number(value || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Current plan</p>
                <h2 className="mt-1 text-3xl font-bold text-slate-950 dark:text-slate-50">{plan?.name || 'No plan'}</h2>
                <p className="mt-2 text-sm text-slate-500">{data?.companyName || 'Company not set'}</p>
              </div>
              <span className="badge bg-green-100 text-green-700">Active</span>
            </div>

            {plan && (
              <div className="mt-6 space-y-4">
                <UsageBar label="Users" value={usage.users} max={plan.maxUsers} />
                <UsageBar label="Customers" value={usage.customers} max={plan.maxCustomers} />
                <UsageBar label="Leads" value={usage.leads} max={plan.maxLeads} />
              </div>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {(data?.plans || []).map((item) => {
              const current = item._id === plan?._id;
              return (
                <div key={item._id} className={`flex flex-col rounded-lg border bg-white p-5 shadow-sm dark:bg-slate-900 ${current ? 'border-primary-500 ring-2 ring-primary-100' : 'border-slate-200 dark:border-slate-800'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-slate-50">{item.name}</h3>
                    {current && <FiCheck className="text-primary-600" />}
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-slate-50">${Number(item.priceMonthly || 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">per month</p>
                  <div className="mt-4 flex-1 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p>{item.maxUsers} users</p>
                    <p>{Number(item.maxCustomers).toLocaleString()} customers</p>
                    <p>{Number(item.maxLeads).toLocaleString()} leads</p>
                  </div>
                  <button
                    className={current ? 'btn-secondary mt-5 w-full' : 'btn-primary mt-5 w-full'}
                    disabled={current || !data?.canChangePlan || savingPlan === item._id}
                    onClick={() => changePlan(item._id)}
                  >
                    {current ? 'Current' : savingPlan === item._id ? 'Updating...' : 'Choose'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
