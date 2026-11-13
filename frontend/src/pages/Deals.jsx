import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { dealService } from '../services/dealService';
import { customerService } from '../services/customerService';
import { userService } from '../services/userService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';

const STAGES = [
  { key: 'new_lead', label: 'New Lead' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'proposal_sent', label: 'Proposal Sent' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'won', label: 'Won' },
  { key: 'lost', label: 'Lost' },
];

const EMPTY_FORM = {
  title: '', value: '', stage: 'new_lead', probability: '10',
  expectedCloseDate: '', assignedTo: '', customer: '', lostReason: '',
};

const DealForm = ({ form, setForm, customers, users }) => {
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={set('title')} placeholder="Deal title" />
        </div>
        <div>
          <label className="label">Value ($) *</label>
          <input type="number" min="0" className="input" value={form.value} onChange={set('value')} placeholder="0" />
        </div>
        <div>
          <label className="label">Probability (%)</label>
          <input type="number" min="0" max="100" className="input" value={form.probability} onChange={set('probability')} />
        </div>
        <div>
          <label className="label">Stage</label>
          <select className="input" value={form.stage} onChange={set('stage')}>
            {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Expected Close Date</label>
          <input type="date" className="input" value={form.expectedCloseDate} onChange={set('expectedCloseDate')} />
        </div>
        <div>
          <label className="label">Customer</label>
          <select className="input" value={form.customer} onChange={set('customer')}>
            <option value="">-- None --</option>
            {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Assigned To</label>
          <select className="input" value={form.assignedTo} onChange={set('assignedTo')}>
            <option value="">-- Unassigned --</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        </div>
        {form.stage === 'lost' && (
          <div className="sm:col-span-2">
            <label className="label">Lost Reason</label>
            <input className="input" value={form.lostReason} onChange={set('lostReason')} placeholder="Why was this deal lost?" />
          </div>
        )}
      </div>
    </div>
  );
};

const DealCard = ({ deal, onEdit, onDelete, onOpen, canDelete, index }) => (
  <Draggable draggableId={deal._id} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 cursor-grab select-none ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-400' : ''}`}
      >
        <p className="font-medium text-sm text-slate-800 dark:text-slate-100 mb-1">{deal.title}</p>
        {deal.customer && (
          <p className="text-xs text-slate-500 mb-2">{deal.customer.name || deal.customer.company}</p>
        )}
        <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
          ${Number(deal.value).toLocaleString()}
        </p>
        <div className="mt-2 flex items-center justify-between gap-1">
          <span className="text-xs text-slate-400">{deal.assignedTo?.name || 'Unassigned'}</span>
          <div className="flex gap-1">
            <button className="text-xs btn-secondary py-0.5 px-1.5" onClick={() => onOpen(deal)}>View</button>
            <button className="text-xs btn-secondary py-0.5 px-1.5" onClick={() => onEdit(deal)}>Edit</button>
            {canDelete && <button className="text-xs btn-danger py-0.5 px-1.5" onClick={() => onDelete(deal)}>Del</button>}
          </div>
        </div>
        {deal.probability != null && (
          <div className="mt-2">
            <div className="h-1 w-full rounded bg-slate-100 dark:bg-slate-800">
              <div className="h-1 rounded bg-primary-400" style={{ width: `${deal.probability}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{deal.probability}% probability</p>
          </div>
        )}
      </div>
    )}
  </Draggable>
);

const Deals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allDeals, setAllDeals] = useState([]);
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const buildColumns = (deals) => {
    const cols = {};
    STAGES.forEach((s) => { cols[s.key] = []; });
    deals.forEach((d) => {
      const stage = d.stage || 'new_lead';
      if (cols[stage]) cols[stage].push(d);
    });
    setColumns(cols);
  };

  const fetchDeals = useCallback(() => {
    setLoading(true);
    dealService.list({ limit: 200 })
      .then((res) => { setAllDeals(res.data); buildColumns(res.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);
  useEffect(() => {
    customerService.list({ limit: 100 }).then((r) => setCustomers(r.data)).catch(() => {});
    userService.list().then((r) => setUsers(r.data)).catch(() => {});
  }, []);

  const openAdd = (defaultStage = 'new_lead') => {
    setForm({ ...EMPTY_FORM, stage: defaultStage });
    setEditTarget(null);
    setModal('add');
  };

  const openEdit = (d) => {
    setForm({
      title: d.title || '', value: d.value || '', stage: d.stage || 'new_lead',
      probability: d.probability ?? 10, lostReason: d.lostReason || '',
      expectedCloseDate: d.expectedCloseDate ? d.expectedCloseDate.slice(0, 10) : '',
      assignedTo: d.assignedTo?._id || '', customer: d.customer?._id || '',
    });
    setEditTarget(d);
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.value && form.value !== 0) return toast.error('Value is required');
    setSaving(true);
    try {
      const payload = { ...form, value: Number(form.value), probability: Number(form.probability) || 10 };
      if (!payload.customer) delete payload.customer;
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.expectedCloseDate) delete payload.expectedCloseDate;
      if (modal === 'add') { await dealService.create(payload); toast.success('Deal created'); }
      else { await dealService.update(editTarget._id, payload); toast.success('Deal updated'); }
      setModal(null);
      fetchDeals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await dealService.remove(deleteTarget._id);
      toast.success('Deal deleted');
      setDeleteTarget(null);
      fetchDeals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newCols = { ...columns };
    const srcList = [...newCols[source.droppableId]];
    const [moved] = srcList.splice(source.index, 1);
    newCols[source.droppableId] = srcList;

    const destList = [...(newCols[destination.droppableId] || [])];
    destList.splice(destination.index, 0, { ...moved, stage: destination.droppableId });
    newCols[destination.droppableId] = destList;
    setColumns(newCols);

    try {
      await dealService.update(draggableId, { stage: destination.droppableId });
      toast.success(`Moved to ${STAGES.find((s) => s.key === destination.droppableId)?.label}`);
    } catch (err) {
      toast.error('Failed to update stage');
      fetchDeals();
    }
  };

  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Deals Pipeline</h1>
        <button className="btn-primary" onClick={() => openAdd()}><FiPlus className="mr-1 inline" />Add Deal</button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center text-slate-400 text-sm">Loading...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const deals = columns[stage.key] || [];
              const stageValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
              return (
                <div key={stage.key} className="w-[82vw] flex-shrink-0 sm:w-72 lg:w-64">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">{stage.label}</h3>
                      <p className="text-xs text-slate-400">{deals.length} deals · ${stageValue.toLocaleString()}</p>
                    </div>
                    <button className="text-slate-400 hover:text-primary-600" onClick={() => openAdd(stage.key)} title="Add deal here">
                      <FiPlus size={15} />
                    </button>
                  </div>
                  <Droppable droppableId={stage.key}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[120px] space-y-2 rounded-xl p-2 transition-colors ${snapshot.isDraggingOver ? 'bg-primary-50 dark:bg-primary-950/30' : 'bg-slate-100 dark:bg-slate-800/40'}`}
                      >
                        {deals.map((deal, idx) => (
                          <DealCard key={deal._id} deal={deal} index={idx} onEdit={openEdit} onDelete={setDeleteTarget} onOpen={(d) => navigate(`/deals/${d._id}`)} canDelete={canDelete} />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Deal' : 'Edit Deal'} size="lg"
        footer={<>
          <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}>
        <DealForm form={form} setForm={setForm} customers={customers} users={users} />
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Deal?"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`} />
    </div>
  );
};

export default Deals;
