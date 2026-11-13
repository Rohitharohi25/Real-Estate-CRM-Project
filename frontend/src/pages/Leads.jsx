import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import { leadService } from '../services/leadService';
import { userService } from '../services/userService';
import SearchFilterBar from '../components/SearchFilterBar';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';

const EMPTY_FORM = {
  name: '', email: '', phone: '', company: '',
  source: 'other', status: 'new', estimatedValue: '', assignedTo: '',
};

const LeadForm = ({ form, setForm, users }) => {
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
          <input type="email" className="input" value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={set('phone')} />
        </div>
        <div>
          <label className="label">Company</label>
          <input className="input" value={form.company} onChange={set('company')} />
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
            {['new','contacted','proposal_sent','negotiation','won','lost'].map((s) => (
              <option key={s} value={s}>{s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Estimated Value ($)</label>
          <input type="number" min="0" className="input" value={form.estimatedValue} onChange={set('estimatedValue')} placeholder="0" />
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

const Leads = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [converting, setConverting] = useState(null);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    leadService.list({ search, status, page, limit: 10 })
      .then((res) => { setLeads(res.data); setPagination(res.pagination); })
      .finally(() => setLoading(false));
  }, [search, status, page]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { userService.list().then((r) => setUsers(r.data)).catch(() => {}); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setModal('add'); };
  const openEdit = (l) => {
    setForm({
      name: l.name||'', email: l.email||'', phone: l.phone||'', company: l.company||'',
      source: l.source||'other', status: l.status||'new',
      estimatedValue: l.estimatedValue||'', assignedTo: l.assignedTo?._id||'',
    });
    setEditTarget(l);
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const payload = { ...form, estimatedValue: Number(form.estimatedValue) || 0 };
      if (modal === 'add') { await leadService.create(payload); toast.success('Lead added'); }
      else { await leadService.update(editTarget._id, payload); toast.success('Lead updated'); }
      setModal(null);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await leadService.remove(deleteTarget._id);
      toast.success('Lead deleted');
      setDeleteTarget(null);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleConvert = async (lead) => {
    if (lead.convertedToCustomer) return toast.error('Already converted');
    setConverting(lead._id);
    try {
      await leadService.convert(lead._id);
      toast.success('Lead converted to customer + deal!');
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Conversion failed');
    } finally {
      setConverting(null);
    }
  };

  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  const columns = [
    { key: 'name', label: 'Name', render: (r) => (
      <span className="font-medium text-slate-800 dark:text-slate-100">{r.name}</span>
    )},
    { key: 'company', label: 'Company' },
    { key: 'estimatedValue', label: 'Est. Value', render: (r) => r.estimatedValue ? `$${r.estimatedValue.toLocaleString()}` : '—' },
    { key: 'assignedTo', label: 'Assigned', render: (r) => r.assignedTo?.name || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', render: (r) => (
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEdit(r)}>Edit</button>
        {!r.convertedToCustomer && (
          <button className="btn-secondary py-1 px-2 text-xs" onClick={() => handleConvert(r)} disabled={converting === r._id} title="Convert to Customer & Deal">
            <FiRefreshCw size={12} className={converting === r._id ? 'animate-spin' : ''} />
          </button>
        )}
        {canDelete && (
          <button className="btn-danger py-1 px-2 text-xs" onClick={() => setDeleteTarget(r)}>Del</button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Leads</h1>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        filters={[
          { name: 'status', label: 'All Statuses', value: status, onChange: (v) => { setStatus(v); setPage(1); },
            options: ['new','contacted','proposal_sent','negotiation','won','lost'].map((s) => ({
              value: s, label: s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
            })) },
        ]}
        actions={
          <button className="btn-primary" onClick={openAdd}><FiPlus className="mr-1 inline" />Add Lead</button>
        }
      />

      <DataTable columns={columns} rows={leads} loading={loading} emptyMessage="No leads found"
        pagination={pagination} onPageChange={setPage} onRowClick={(r) => navigate(`/leads/${r._id}`)} />

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Lead' : 'Edit Lead'} size="lg"
        footer={<>
          <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}>
        <LeadForm form={form} setForm={setForm} users={users} />
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Lead?"
        message={`Delete ${deleteTarget?.name}? This cannot be undone.`} />
    </div>
  );
};

export default Leads;
