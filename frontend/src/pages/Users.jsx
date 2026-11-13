import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import { format } from 'date-fns';
import { userService } from '../services/userService';
import { planService } from '../services/planService';
import SearchFilterBar from '../components/SearchFilterBar';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'sales_executive', status: 'active', companyName: '', selectedPlan: '' };

const UserForm = ({ form, setForm, isEdit, canManageSuperAdmin, plans }) => {
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="space-y-3">
      <div>
        <label className="label">Name *</label>
        <input className="input" value={form.name} onChange={set('name')} placeholder="Full name" />
      </div>
      <div>
        <label className="label">Email *</label>
        <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="user@company.com" />
      </div>
      {!isEdit && (
        <div>
          <label className="label">Password *</label>
          <input type="password" className="input" value={form.password} onChange={set('password')} placeholder="Min 8 characters" />
        </div>
      )}
      <div>
        <label className="label">Company</label>
        <input className="input" value={form.companyName || ''} onChange={set('companyName')} placeholder="Company name" />
      </div>
      {canManageSuperAdmin && form.role === 'admin' && (
        <div>
          <label className="label">Plan</label>
          <select className="input" value={form.selectedPlan || ''} onChange={set('selectedPlan')}>
            <option value="">No plan</option>
            {plans.map((plan) => <option key={plan._id} value={plan._id}>{plan.name}</option>)}
          </select>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Role</label>
          <select className="input" value={form.role} onChange={set('role')}>
            {canManageSuperAdmin && <option value="super_admin">Super Admin</option>}
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="sales_executive">Sales Executive</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={set('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const Users = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    userService.list({ search, role, status })
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }, [search, role, status]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => {
    if (me?.role === 'super_admin') {
      planService.list({ status: 'active' }).then((res) => setPlans(res.data)).catch(() => {});
    }
  }, [me?.role]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setModal('add'); };
  const openEdit = (u) => {
    setForm({ name: u.name||'', email: u.email||'', password: '', role: u.role||'sales_executive', status: u.status||'active', companyName: u.companyName || '', selectedPlan: u.selectedPlan?._id || '' });
    setEditTarget(u);
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.email.trim()) return toast.error('Email is required');
    if (modal === 'add' && !form.password) return toast.error('Password is required');
    setSaving(true);
    try {
      if (modal === 'add') {
        await userService.create(form);
        toast.success('User created');
      } else {
        const payload = { name: form.name, role: form.role, status: form.status, companyName: form.companyName, selectedPlan: form.selectedPlan || null };
        await userService.update(editTarget._id, payload);
        toast.success('User updated');
      }
      setModal(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userService.remove(deleteTarget._id);
      toast.success('User deleted');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const isSuperAdmin = me?.role === 'super_admin';
  const isAdmin = me?.role === 'admin' || isSuperAdmin;

  const columns = [
    { key: 'name', label: 'Name', render: (r) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 text-sm font-semibold">
          {r.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">{r.name}</p>
          <p className="text-xs text-slate-400">{r.email}</p>
        </div>
      </div>
    )},
    { key: 'role', label: 'Role', render: (r) => (
      <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300 capitalize">
        {r.role?.replace(/_/g,' ')}
      </span>
    )},
    { key: 'companyName', label: 'Company', render: (r) => r.companyName || '—' },
    { key: 'selectedPlan', label: 'Plan', render: (r) => r.selectedPlan?.name || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'lastLogin', label: 'Last Login', render: (r) => r.lastLogin ? format(new Date(r.lastLogin), 'MMM d, yyyy') : '—' },
    { key: 'actions', label: '', render: (r) => (
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEdit(r)}>Edit</button>
        {isAdmin && r._id !== me?._id && (
          <button className="btn-danger py-1 px-2 text-xs" onClick={() => setDeleteTarget(r)}>Del</button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Team</h1>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        filters={[
          { name: 'role', label: 'All Roles', value: role, onChange: setRole,
            options: [
              { value:'admin',label:'Admin' },{ value:'manager',label:'Manager' },
              ...(isSuperAdmin ? [{ value:'super_admin',label:'Super Admin' }] : []),
              { value:'sales_executive',label:'Sales Executive' },
            ]},
          { name: 'status', label: 'All Statuses', value: status, onChange: setStatus,
            options: [{ value:'active',label:'Active' },{ value:'inactive',label:'Inactive' }] },
        ]}
        actions={isAdmin && (
          <button className="btn-primary" onClick={openAdd}><FiPlus className="mr-1 inline" />Add User</button>
        )}
      />

      <DataTable columns={columns} rows={users} loading={loading} emptyMessage="No team members found" />

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Team Member' : 'Edit Team Member'} size="md"
        footer={<>
          <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}>
        <UserForm form={form} setForm={setForm} isEdit={modal === 'edit'} canManageSuperAdmin={isSuperAdmin} plans={plans} />
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete User?"
        message={`Delete ${deleteTarget?.name}? This action cannot be undone.`} />
    </div>
  );
};

export default Users;
