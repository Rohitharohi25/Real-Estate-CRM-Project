// Maps lead/deal/task status strings to badge colors so they stay visually consistent app-wide.
const colorMap = {
  // Leads / Deals pipeline
  new: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  new_lead: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  contacted: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  proposal_sent: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  negotiation: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  won: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  lost: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  // Tasks
  pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  // Priority
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  // Generic
  active: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  inactive: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

const labelize = (s) => (s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '');

const StatusBadge = ({ status }) => (
  <span className={`badge ${colorMap[status] || colorMap.new}`}>{labelize(status)}</span>
);

export default StatusBadge;
