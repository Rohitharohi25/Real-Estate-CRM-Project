import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import toast from 'react-hot-toast';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';
import { taskService } from '../services/taskService';
import { dealService } from '../services/dealService';
import { customerService } from '../services/customerService';
import { userService } from '../services/userService';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const EMPTY_TASK = { title: '', description: '', priority: 'medium', assignedTo: '' };
const EMPTY_DEAL = { title: '', value: '', probability: '10', customer: '', assignedTo: '' };

const Calendar = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [deals, setDeals] = useState([]);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [taskForm, setTaskForm] = useState(EMPTY_TASK);
  const [dealForm, setDealForm] = useState(EMPTY_DEAL);
  const [saving, setSaving] = useState(false);

  const fetchEvents = () => {
    setLoading(true);
    Promise.all([
      taskService.list({ limit: 200 }),
      dealService.list({ limit: 200 }),
    ]).then(([taskResponse, dealResponse]) => {
      setTasks(taskResponse.data.filter((task) => task.dueDate));
      setDeals(dealResponse.data.filter((deal) => deal.expectedCloseDate));
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
    userService.list().then((res) => setUsers(res.data)).catch(() => {});
    customerService.list({ limit: 200 }).then((res) => setCustomers(res.data)).catch(() => {});
  }, []);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const eventsForDay = (date) => ({
    tasks: tasks.filter((task) => isSameDay(parseISO(task.dueDate), date)),
    deals: deals.filter((deal) => isSameDay(parseISO(deal.expectedCloseDate), date)),
  });

  const selectedEvents = eventsForDay(selected);
  const selectedDateValue = format(selected, 'yyyy-MM-dd');

  const openTaskModal = () => {
    setTaskForm(EMPTY_TASK);
    setModal('task');
  };

  const openDealModal = () => {
    setDealForm(EMPTY_DEAL);
    setModal('deal');
  };

  const createTask = async () => {
    if (!taskForm.title.trim()) return toast.error('Task title is required');
    setSaving(true);
    try {
      const payload = { ...taskForm, dueDate: selectedDateValue };
      if (!payload.assignedTo) delete payload.assignedTo;
      await taskService.create(payload);
      toast.success('Task scheduled');
      setModal(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const createDeal = async () => {
    if (!dealForm.title.trim()) return toast.error('Deal title is required');
    if (!dealForm.value && dealForm.value !== 0) return toast.error('Deal value is required');
    setSaving(true);
    try {
      const payload = {
        ...dealForm,
        value: Number(dealForm.value),
        probability: Number(dealForm.probability) || 10,
        expectedCloseDate: selectedDateValue,
      };
      if (!payload.customer) delete payload.customer;
      if (!payload.assignedTo) delete payload.assignedTo;
      await dealService.create(payload);
      toast.success('Deal scheduled');
      setModal(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create deal');
    } finally {
      setSaving(false);
    }
  };

  const goToday = () => {
    const today = new Date();
    setCurrent(today);
    setSelected(today);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Calendar</h1>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={goToday}><FiCalendar size={14} />Today</button>
          <button className="btn-secondary p-2" onClick={() => setCurrent(subMonths(current, 1))} aria-label="Previous month">
            <FiChevronLeft />
          </button>
          <span className="w-36 text-center font-semibold text-slate-700 dark:text-slate-200">
            {format(current, 'MMMM yyyy')}
          </span>
          <button className="btn-secondary p-2" onClick={() => setCurrent(addMonths(current, 1))} aria-label="Next month">
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
            <div key={label} className="py-2 text-center text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              {label}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-7">
            {days.map((date) => {
              const { tasks: dayTasks, deals: dayDeals } = eventsForDay(date);
              const isToday = isSameDay(date, new Date());
              const inMonth = isSameMonth(date, current);
              const isSelected = isSameDay(date, selected);

              return (
                <button
                  type="button"
                  key={date.toISOString()}
                  onClick={() => setSelected(date)}
                  className={`min-h-[92px] border-b border-r border-slate-100 p-1.5 text-left transition-colors dark:border-slate-800
                    ${inMonth ? '' : 'bg-slate-50/50 dark:bg-slate-900/30'}
                    ${isSelected ? 'bg-primary-50 dark:bg-primary-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}
                  `}
                >
                  <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium
                    ${isToday ? 'bg-primary-600 text-white' : inMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'}`}>
                    {format(date, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div key={task._id} className="truncate rounded bg-amber-100 px-1 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Task: {task.title}
                      </div>
                    ))}
                    {dayDeals.slice(0, 1).map((deal) => (
                      <div key={deal._id} className="truncate rounded bg-primary-100 px-1 text-xs text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                        Deal: {deal.title}
                      </div>
                    ))}
                    {dayTasks.length + dayDeals.length > 3 && (
                      <div className="text-xs text-slate-400">+{dayTasks.length + dayDeals.length - 3} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">
            Events on {format(selected, 'MMMM d, yyyy')}
          </h3>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={openTaskModal}><FiPlus size={14} />Task</button>
            <button className="btn-primary" onClick={openDealModal}><FiPlus size={14} />Deal</button>
          </div>
        </div>

        {selectedEvents.tasks.length === 0 && selectedEvents.deals.length === 0 && (
          <p className="text-sm text-slate-400">No events scheduled for this day.</p>
        )}

        {selectedEvents.tasks.map((task) => (
          <button
            type="button"
            key={task._id}
            className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
            onClick={() => navigate(`/tasks/${task._id}`)}
          >
            <div className="rounded bg-amber-100 p-2 text-sm text-amber-600 dark:bg-amber-950 dark:text-amber-400">Task</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{task.title}</p>
              <p className="text-xs text-slate-400">Assigned to {task.assignedTo?.name || 'Unassigned'}</p>
            </div>
            <StatusBadge status={task.priority} />
            <StatusBadge status={task.status} />
          </button>
        ))}

        {selectedEvents.deals.map((deal) => (
          <button
            type="button"
            key={deal._id}
            className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
            onClick={() => navigate(`/deals/${deal._id}`)}
          >
            <div className="rounded bg-primary-100 p-2 text-sm text-primary-600 dark:bg-primary-950 dark:text-primary-400">$</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{deal.title}</p>
              <p className="text-xs text-slate-400">${Number(deal.value).toLocaleString()}</p>
            </div>
            <StatusBadge status={deal.stage} />
          </button>
        ))}
      </div>

      <Modal open={modal === 'task'} onClose={() => setModal(null)} title={`Add Task - ${format(selected, 'MMM d, yyyy')}`}
        footer={<>
          <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn-primary" onClick={createTask} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}>
        <div className="space-y-3">
          <div>
            <label className="label">Title *</label>
            <input className="input" value={taskForm.title} onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={taskForm.description} onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Priority</label>
              <select className="input" value={taskForm.priority} onChange={(e) => setTaskForm((prev) => ({ ...prev, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="label">Assigned To</label>
              <select className="input" value={taskForm.assignedTo} onChange={(e) => setTaskForm((prev) => ({ ...prev, assignedTo: e.target.value }))}>
                <option value="">Unassigned</option>
                {users.map((user) => <option key={user._id} value={user._id}>{user.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'deal'} onClose={() => setModal(null)} title={`Add Deal - ${format(selected, 'MMM d, yyyy')}`}
        footer={<>
          <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn-primary" onClick={createDeal} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}>
        <div className="space-y-3">
          <div>
            <label className="label">Title *</label>
            <input className="input" value={dealForm.title} onChange={(e) => setDealForm((prev) => ({ ...prev, title: e.target.value }))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Value ($) *</label>
              <input type="number" min="0" className="input" value={dealForm.value} onChange={(e) => setDealForm((prev) => ({ ...prev, value: e.target.value }))} />
            </div>
            <div>
              <label className="label">Probability (%)</label>
              <input type="number" min="0" max="100" className="input" value={dealForm.probability} onChange={(e) => setDealForm((prev) => ({ ...prev, probability: e.target.value }))} />
            </div>
            <div>
              <label className="label">Customer</label>
              <select className="input" value={dealForm.customer} onChange={(e) => setDealForm((prev) => ({ ...prev, customer: e.target.value }))}>
                <option value="">None</option>
                {customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Assigned To</label>
              <select className="input" value={dealForm.assignedTo} onChange={(e) => setDealForm((prev) => ({ ...prev, assignedTo: e.target.value }))}>
                <option value="">Unassigned</option>
                {users.map((user) => <option key={user._id} value={user._id}>{user.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Calendar;
