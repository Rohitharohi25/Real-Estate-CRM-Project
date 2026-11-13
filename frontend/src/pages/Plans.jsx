import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import { planService } from '../services/planService';
import SearchFilterBar from '../components/SearchFilterBar';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const EMPTY_FORM = {
  name: '',
  description: '',
  priceMonthly: '',
  maxUsers: '5',
  maxCustomers: '500',
  maxLeads: '500',
  features: '',
  status: 'active',
  sortOrder: '0',
};

const PlanForm = ({ form, setForm }) => {
  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Name *</label>
          <input className="input" value={form.name} onChange={set('name')} placeholder="Starter" />
        </div>
        <div>
          <label className="label">Monthly Price ($)</label>
          <input type="number" min="0" className="input" value={form.priceMonthly} onChange={set('priceMonthly')} placeholder="0" />
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea className="input resize-none" rows={2} value={form.description} onChange={set('description')} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label">Max Users</label>
          <input type="number" min="1" className="input" value={form.maxUsers} onChange={set('maxUsers')} />
        </div>
        <div>
          <label className="label">Max Customers</label>
          <input type="number" min="0" className="input" value={form.maxCustomers} onChange={set('maxCustomers')} />
        </div>
        <div>
          <label className="label">Max Leads</label>
          <input type="number" min="0" className="input" value={form.maxLeads} onChange={set('maxLeads')} />
        </div>
      </div>

      <div>
        <label className="label">Features</label>
        <textarea
          className="input resize-none"
          rows={5}
          value={form.features}
          onChange={set('features')}
          placeholder="One feature per line"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={set('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="label">Sort Order</label>
          <input type="number" className="input" value={form.sortOrder} onChange={set('sortOrder')} />
        </div>
      </div>
    </div>
  );
};

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPlans = useCallback(() => {
    setLoading(true);
    planService.list({ search, status })
      .then((res) => setPlans(res.data))
      .finally(() => setLoading(false));
  }, [search, status]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setModal('add');
  };

  const openEdit = (plan) => {
    setForm({
      name: plan.name || '',
      description: plan.description || '',
      priceMonthly: String(plan.priceMonthly ?? ''),
      maxUsers: String(plan.maxUsers ?? 5),
      maxCustomers: String(plan.maxCustomers ?? 500),
      maxLeads: String(plan.maxLeads ?? 500),
      features: (plan.features || []).join('\n'),
      status: plan.status || 'active',
      sortOrder: String(plan.sortOrder ?? 0),
    });
    setEditTarget(plan);
    setModal('edit');
  };

  const payloadFromForm = () => ({
    name: form.name.trim(),
    description: form.description.trim(),
    priceMonthly: Number(form.priceMonthly) || 0,
    maxUsers: Number(form.maxUsers) || 1,
    maxCustomers: Number(form.maxCustomers) || 0,
    maxLeads: Number(form.maxLeads) || 0,
    features: form.features.split('\n').map((feature) => feature.trim()).filter(Boolean),
    status: form.status,
    sortOrder: Number(form.sortOrder) || 0,
  });

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Plan name is required');
    setSaving(true);
    try {
      const payload = payloadFromForm();
      if (modal === 'add') {
        await planService.create(payload);
        toast.success('Plan created');
      } else {
        await planService.update(editTarget._id, payload);
        toast.success('Plan updated');
      }
      setModal(null);
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await planService.remove(deleteTarget._id);
      toast.success('Plan deleted');
      setDeleteTarget(null);
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete plan');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Plan', render: (plan) => (
      <div>
        <p className="font-medium text-slate-800 dark:text-slate-100">{plan.name}</p>
        {plan.description && <p className="max-w-md truncate text-xs text-slate-400">{plan.description}</p>}
      </div>
    ) },
    { key: 'priceMonthly', label: 'Price', render: (plan) => `$${Number(plan.priceMonthly || 0).toLocaleString()}/mo` },
    { key: 'limits', label: 'Limits', render: (plan) => (
      <span>{plan.maxUsers} users · {plan.maxCustomers} customers · {plan.maxLeads} leads</span>
    ) },
    { key: 'features', label: 'Features', render: (plan) => plan.features?.length || 0 },
    { key: 'status', label: 'Status', render: (plan) => <StatusBadge status={plan.status} /> },
    { key: 'actions', label: '', render: (plan) => (
      <div className="flex gap-1" onClick={(event) => event.stopPropagation()}>
        <button className="btn-secondary px-2 py-1 text-xs" onClick={() => openEdit(plan)}>Edit</button>
        <button className="btn-danger px-2 py-1 text-xs" onClick={() => setDeleteTarget(plan)}>Del</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Plans</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Define the CRM packages, limits, and feature sets your organization offers.</p>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        filters={[
          { name: 'status', label: 'All Statuses', value: status, onChange: setStatus,
            options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
        ]}
        actions={<button className="btn-primary" onClick={openAdd}><FiPlus size={14} />Add Plan</button>}
      />

      <DataTable columns={columns} rows={plans} loading={loading} emptyMessage="No plans found" />

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Plan' : 'Edit Plan'} size="lg"
        footer={<>
          <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}>
        <PlanForm form={form} setForm={setForm} />
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Plan?"
        message={`Delete ${deleteTarget?.name}? This cannot be undone.`} />
    </div>
  );
};

export default Plans;
