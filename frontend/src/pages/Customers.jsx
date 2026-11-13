import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import { customerService } from '../services/customerService';
import { userService } from '../services/userService';
import SearchFilterBar from '../components/SearchFilterBar';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';

const EMPTY_FORM = {
  name: '', email: '', phone: '', company: '', jobTitle: '',
  source: 'other', status: 'active', assignedTo: '',
};

const CustomerForm = ({ form, setForm, users }) => {
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Name *</label>
          <input className="input" required value={form.name} onChange={set('name')} placeholder="Full name" />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="email@example.com" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={set('phone')} placeholder="+1 555-0100" />
        </div>
        <div>
          <label className="label">Company</label>
          <input className="input" value={form.company} onChange={set('company')} placeholder="Company name" />
        </div>
        <div>
          <label className="label">Job Title</label>
          <input className="input" value={form.jobTitle} onChange={set('jobTitle')} placeholder="e.g. CEO" />
        </div>
        <div>
          <label className="label">Source</label>
          <select className="input" value={form.source} onChange={set('source')}>
            {['website','referral','social_media','advertisement','cold_call','other'].map((s) => (
              <option key={s} value={s}>{s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={set('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="label">Assigned To</label>
          <select className="input" value={form.assignedTo} onChange={set('assignedTo')}>
            <option value="">-- Unassigned --</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

const Customers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = useCallback(() => {
    setLoading(true);
    customerService.list({ search, status, page, limit: 10 })
      .then((res) => { setCustomers(res.data); setPagination(res.pagination); })
      .finally(() => setLoading(false));
  }, [search, status, page]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  useEffect(() => {
    userService.list().then((res) => setUsers(res.data)).catch(() => {});
  }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setModal('add'); };
  const openEdit = (c) => {
    setForm({
      name: c.name || '', email: c.email || '', phone: c.phone || '',
      company: c.company || '', jobTitle: c.jobTitle || '',
      source: c.source || 'other', status: c.status || 'active',
      assignedTo: c.assignedTo?._id || '',
    });
    setEditTarget(c);
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (modal === 'add') {
        await customerService.create(form);
        toast.success('Customer added');
      } else {
        await customerService.update(editTarget._id, form);
        toast.success('Customer updated');
      }
      setModal(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await customerService.remove(deleteTarget._id);
      toast.success('Customer deleted');
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  const columns = [
    { key: 'name', label: 'Name', render: (r) => (
      <span className="font-medium text-slate-800 dark:text-slate-100">{r.name}</span>
    )},
    { key: 'company', label: 'Company' },
    { key: 'email', label: 'Email' },
    { key: 'assignedTo', label: 'Assigned To', render: (r) => r.assignedTo?.name || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', render: (r) => (
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEdit(r)}>Edit</button>
        {canDelete && (
          <button className="btn-danger py-1 px-2 text-xs" onClick={() => setDeleteTarget(r)}>Del</button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Customers</h1>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        filters={[
          { name: 'status', label: 'All Statuses', value: status, onChange: (v) => { setStatus(v); setPage(1); },
            options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
        ]}
        actions={
          <button className="btn-primary" onClick={openAdd}><FiPlus className="mr-1 inline" />Add Customer</button>
        }
      />

      <DataTable
        columns={columns}
        rows={customers}
        loading={loading}
        emptyMessage="No customers found"
        pagination={pagination}
        onPageChange={setPage}
        onRowClick={(r) => navigate(`/customers/${r._id}`)}
      />

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Customer' : 'Edit Customer'} size="lg"
        footer={<>
          <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}>
        <CustomerForm form={form} setForm={setForm} users={users} />
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Customer?"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This cannot be undone.`} />
    </div>
  );
};

export default Customers;
