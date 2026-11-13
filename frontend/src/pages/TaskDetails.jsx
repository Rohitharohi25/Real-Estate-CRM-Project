import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheck, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { taskService } from '../services/taskService';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';

const formatDate = (value, pattern = 'MMM d, yyyy') => (
  value ? format(new Date(value), pattern) : 'None'
);

const getRelatedLink = (task) => {
  if (task.relatedCustomer) return { to: `/customers/${task.relatedCustomer._id}`, label: task.relatedCustomer.name };
  if (task.relatedLead) return { to: `/leads/${task.relatedLead._id}`, label: task.relatedLead.name };
  if (task.relatedDeal) return { to: `/deals/${task.relatedDeal._id}`, label: task.relatedDeal.title };
  return null;
};

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchTask = () => {
    setLoading(true);
    taskService.get(id)
      .then((res) => setTask(res.data))
      .catch(() => navigate('/tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTask(); }, [id]);

  const updateStatus = async (status) => {
    setSaving(true);
    try {
      await taskService.update(id, { status });
      toast.success(status === 'completed' ? 'Task completed' : 'Task updated');
      fetchTask();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!task) return null;

  const related = getRelatedLink(task);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-secondary p-2" onClick={() => navigate('/tasks')} aria-label="Back to tasks">
          <FiArrowLeft size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-slate-800 dark:text-slate-50">{task.title}</h1>
          <p className="text-sm text-slate-500">Created {formatDate(task.createdAt, 'MMM d, yyyy HH:mm')}</p>
        </div>
        <StatusBadge status={task.priority} />
        <StatusBadge status={task.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card space-y-4 lg:col-span-2">
          <div>
            <h2 className="font-semibold text-slate-700 dark:text-slate-200">Details</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
              {task.description || 'No description added.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {task.status !== 'completed' && (
              <button className="btn-primary" onClick={() => updateStatus('completed')} disabled={saving}>
                <FiCheck size={15} /> Mark Complete
              </button>
            )}
            {task.status === 'pending' && (
              <button className="btn-secondary" onClick={() => updateStatus('in_progress')} disabled={saving}>
                <FiClock size={15} /> Start Task
              </button>
            )}
            {task.status === 'completed' && (
              <button className="btn-secondary" onClick={() => updateStatus('pending')} disabled={saving}>
                Reopen
              </button>
            )}
          </div>
        </div>

        <div className="card space-y-3">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200">Task Info</h2>
          <div>
            <p className="text-xs text-slate-400">Due Date</p>
            <p className="text-sm text-slate-700 dark:text-slate-200">{formatDate(task.dueDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Assigned To</p>
            <p className="text-sm text-slate-700 dark:text-slate-200">{task.assignedTo?.name || 'Unassigned'}</p>
          </div>
          {related && (
            <div>
              <p className="text-xs text-slate-400">Related Record</p>
              <Link className="text-sm font-medium text-primary-600 hover:underline" to={related.to}>
                {related.label}
              </Link>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-400">Last Updated</p>
            <p className="text-sm text-slate-700 dark:text-slate-200">{formatDate(task.updatedAt, 'MMM d, yyyy HH:mm')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
