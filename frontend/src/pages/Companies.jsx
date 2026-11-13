import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { companyService } from '../services/companyService';
import { planService } from '../services/planService';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      companyService.list(),
      planService.list({ status: 'active' }),
    ])
      .then(([companyRes, planRes]) => {
        setCompanies(companyRes.data);
        setPlans(planRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateCompany = async (company, payload) => {
    setSaving(company._id);
    try {
      await companyService.update(company._id, payload);
      toast.success('Company updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving('');
    }
  };

  const columns = [
    { key: 'companyName', label: 'Company', render: (row) => (
      <div>
        <p className="font-semibold text-slate-900 dark:text-slate-50">{row.companyName || row.name}</p>
        <p className="text-xs text-slate-500">{row.name} · {row.email}</p>
      </div>
    ) },
    { key: 'selectedPlan', label: 'Plan', render: (row) => (
      <select
        className="input min-w-40"
        value={row.selectedPlan?._id || ''}
        disabled={saving === row._id}
        onChange={(event) => updateCompany(row, { planId: event.target.value })}
      >
        {plans.map((plan) => <option key={plan._id} value={plan._id}>{plan.name}</option>)}
      </select>
    ) },
    { key: 'usage', label: 'Usage', render: (row) => (
      <span>{row.usage.users} users / {row.usage.customers} customers / {row.usage.leads} leads</span>
    ) },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'actions', label: '', render: (row) => (
      <button
        className={row.status === 'active' ? 'btn-secondary px-3 py-1 text-xs' : 'btn-primary px-3 py-1 text-xs'}
        disabled={saving === row._id}
        onClick={() => updateCompany(row, { status: row.status === 'active' ? 'inactive' : 'active' })}
      >
        {row.status === 'active' ? 'Deactivate' : 'Activate'}
      </button>
    ) },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Companies</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Super admin control for plan buyers, subscription status, and usage.</p>
      </div>
      <DataTable columns={columns} rows={companies} loading={loading} emptyMessage="No company accounts found" />
    </div>
  );
};

export default Companies;
