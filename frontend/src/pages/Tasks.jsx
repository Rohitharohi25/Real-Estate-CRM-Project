import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiCheck } from 'react-icons/fi';
import { format } from 'date-fns';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import SearchFilterBar from '../components/SearchFilterBar';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const EMPTY_FORM = {
  title: '', description: '', priority: 'medium', status: 'pending',
  dueDate: '', assignedTo: '',
};

const TaskForm = ({ form, setForm, users }) => {
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="space-y-3">
      <div>
        <label className="label">Title *</label>
        <input className="input" value={form.title} onChange={set('title')} placeholder="Task title" />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input resize-none" rows={3} value={form.description} onChange={set('description')} placeholder="Details..." />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={set('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={set('status')}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="label">Due Date</label>
          <input type="date" className="input" value={form.dueDate} onChange={set('dueDate')} />
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

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = useCallback(() => {
    setLoading(true);
    taskService.list({ search, status, priority, page, limit: 10 })
      .then((res) => { setTasks(res.data); setPagination(res.pagination); })
      .finally(() => setLoading(false));
  }, [search, status, priority, page]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { userService.list().then((r) => setUsers(r.data)).catch(() => {}); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setModal('add'); };
  const openEdit = (t) => {
    setForm({
      title: t.title||'', description: t.description||'',
      priority: t.priority||'medium', status: t.status||'pending',
      dueDate: t.dueDate ? t.dueDate.slice(0,10) : '',
      assignedTo: t.assignedTo?._id||'',
    });
    setEditTarget(t);
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      if (modal === 'add') { await taskService.create(payload); toast.success('Task created'); }
      else { await taskService.update(editTarget._id, payload); toast.success('Task updated'); }
      setModal(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (task) => {
    try {
      await taskService.update(task._id, { status: 'completed' });
      toast.success('Marked as completed');
      fetchTasks();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await taskService.remove(deleteTarget._id);
      toast.success('Task deleted');
      setDeleteTarget(null);
      fetchTasks();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const isOverdue = (t) => t.dueDate && t.status !== 'completed' && new Date(t.dueDate) < new Date();

  const columns = [
    { key: 'title', label: 'Title', render: (r) => (
      <div>
        <p className={`font-medium ${r.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>{r.title}</p>
        {r.description && <p className="text-xs text-slate-400 truncate max-w-xs">{r.description}</p>}
      </div>
    )},
    { key: 'priority', label: 'Priority', render: (r) => <StatusBadge status={r.priority} /> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'dueDate', label: 'Due Date', render: (r) => r.dueDate ? (
      <span className={isOverdue(r) ? 'text-red-500 font-medium' : 'text-slate-600 dark:text-slate-300'}>
        {format(new Date(r.dueDate), 'MMM d, yyyy')}
      </span>
    ) : '—'},
    { key: 'assignedTo', label: 'Assigned', render: (r) => r.assignedTo?.name || '—' },
    { key: 'actions', label: '', render: (r) => (
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        {r.status !== 'completed' && (
          <button className="btn-secondary py-1 px-2 text-xs" onClick={() => handleComplete(r)} title="Mark complete">
            <FiCheck size={12} />
          </button>
        )}
        <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEdit(r)}>Edit</button>
        <button className="btn-danger py-1 px-2 text-xs" onClick={() => setDeleteTarget(r)}>Del</button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Tasks</h1>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        filters={[
          { name: 'status', label: 'All Statuses', value: status, onChange: (v) => { setStatus(v); setPage(1); },
            options: [{ value:'pending',label:'Pending' },{ value:'in_progress',label:'In Progress' },{ value:'completed',label:'Completed' }] },
          { name: 'priority', label: 'All Priorities', value: priority, onChange: (v) => { setPriority(v); setPage(1); },
            options: [{ value:'low',label:'Low' },{ value:'medium',label:'Medium' },{ value:'high',label:'High' }] },
        ]}
        actions={
          <button className="btn-primary" onClick={openAdd}><FiPlus className="mr-1 inline" />Add Task</button>
        }
      />

      <DataTable columns={columns} rows={tasks} loading={loading} emptyMessage="No tasks found"
        pagination={pagination} onPageChange={setPage} onRowClick={(r) => navigate(`/tasks/${r._id}`)} />

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Task' : 'Edit Task'} size="md"
        footer={<>
          <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}>
        <TaskForm form={form} setForm={setForm} users={users} />
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Task?"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`} />
    </div>
  );
};

export default Tasks;
