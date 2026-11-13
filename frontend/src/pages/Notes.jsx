import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import { format } from 'date-fns';
import { noteService } from '../services/noteService';
import { customerService } from '../services/customerService';
import { leadService } from '../services/leadService';
import { dealService } from '../services/dealService';
import Modal from '../components/Modal';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ content: '', customer: '', lead: '', deal: '' });
  const [saving, setSaving] = useState(false);
  const [entityType, setEntityType] = useState('customer');

  const fetchNotes = () => {
    setLoading(true);
    noteService.list()
      .then((res) => setNotes(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotes(); }, []);

  useEffect(() => {
    customerService.list({ limit: 100 }).then((r) => setCustomers(r.data)).catch(() => {});
    leadService.list({ limit: 100 }).then((r) => setLeads(r.data)).catch(() => {});
    dealService.list({ limit: 100 }).then((r) => setDeals(r.data)).catch(() => {});
  }, []);

  const openModal = () => {
    setForm({ content: '', customer: '', lead: '', deal: '' });
    setEntityType('customer');
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.content.trim()) return toast.error('Note content is required');
    const payload = { content: form.content };
    if (entityType === 'customer' && form.customer) payload.customer = form.customer;
    if (entityType === 'lead' && form.lead) payload.lead = form.lead;
    if (entityType === 'deal' && form.deal) payload.deal = form.deal;

    setSaving(true);
    try {
      await noteService.create(payload);
      toast.success('Note added');
      setModal(false);
      fetchNotes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await noteService.remove(id);
      toast.success('Note deleted');
      fetchNotes();
    } catch { toast.error('Failed to delete'); }
  };

  const entityLabel = (n) => {
    if (n.customer) return `Customer: ${n.customer?.name || n.customer}`;
    if (n.lead) return `Lead: ${n.lead?.name || n.lead}`;
    if (n.deal) return `Deal: ${n.deal?.title || n.deal}`;
    return 'General';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Notes</h1>
        <button className="btn-primary" onClick={openModal}><FiPlus className="mr-1 inline" />Add Note</button>
      </div>

      {loading ? (
        <div className="card flex h-32 items-center justify-center text-slate-400 text-sm">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="card flex h-32 items-center justify-center text-slate-400 text-sm">No notes yet.</div>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n._id} className="card group">
              <div className="mb-2 flex items-start justify-between gap-3">
                <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs">
                  {entityLabel(n)}
                </span>
                <button
                  className="invisible group-hover:visible text-slate-400 hover:text-red-500 shrink-0"
                  onClick={() => handleDelete(n._id)}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200">{n.content}</p>
              <p className="mt-2 text-xs text-slate-400">
                {n.createdBy?.name} · {format(new Date(n.createdAt), 'MMM d, yyyy HH:mm')}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Note" size="md"
        footer={<>
          <button className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}>
        <div className="space-y-3">
          <div>
            <label className="label">Note *</label>
            <textarea className="input resize-none" rows={4} placeholder="Write your note..." value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} />
          </div>
          <div>
            <label className="label">Attach to</label>
            <select className="input" value={entityType} onChange={(e) => setEntityType(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="lead">Lead</option>
              <option value="deal">Deal</option>
            </select>
          </div>
          {entityType === 'customer' && (
            <div>
              <label className="label">Customer</label>
              <select className="input" value={form.customer} onChange={(e) => setForm((p) => ({ ...p, customer: e.target.value }))}>
                <option value="">-- Select customer --</option>
                {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          )}
          {entityType === 'lead' && (
            <div>
              <label className="label">Lead</label>
              <select className="input" value={form.lead} onChange={(e) => setForm((p) => ({ ...p, lead: e.target.value }))}>
                <option value="">-- Select lead --</option>
                {leads.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
          )}
          {entityType === 'deal' && (
            <div>
              <label className="label">Deal</label>
              <select className="input" value={form.deal} onChange={(e) => setForm((p) => ({ ...p, deal: e.target.value }))}>
                <option value="">-- Select deal --</option>
                {deals.map((d) => <option key={d._id} value={d._id}>{d.title}</option>)}
              </select>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Notes;
