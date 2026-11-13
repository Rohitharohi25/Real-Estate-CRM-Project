import { Link } from 'react-router-dom';
import {
  FiBarChart2,
  FiCheckCircle,
  FiCreditCard,
  FiRepeat,
  FiTrendingUp,
  FiUserPlus,
  FiUsers,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const flowSteps = [
  {
    icon: FiCreditCard,
    title: 'Plan setup',
    text: 'Super admin manages plans. A buyer selects a plan and creates the company admin account.',
    action: 'Review account',
    to: '/account',
  },
  {
    icon: FiUsers,
    title: 'Team setup',
    text: 'Admin adds managers and sales users, then assigns work ownership.',
    action: 'Manage team',
    to: '/users',
  },
  {
    icon: FiUserPlus,
    title: 'Lead capture',
    text: 'Add leads from website, referral, calls, ads, or other sources.',
    action: 'Add leads',
    to: '/leads',
  },
  {
    icon: FiCheckCircle,
    title: 'Follow-up work',
    text: 'Create tasks, notes, reminders, and calendar follow-ups.',
    action: 'Open tasks',
    to: '/tasks',
  },
  {
    icon: FiRepeat,
    title: 'Convert',
    text: 'Convert qualified leads into customers and deals.',
    action: 'Work pipeline',
    to: '/deals',
  },
  {
    icon: FiBarChart2,
    title: 'Measure',
    text: 'Use reports to track revenue, conversion, pipeline health, and plan usage.',
    action: 'View reports',
    to: '/reports',
  },
];

const roleGuides = {
  super_admin: [
    ['Companies', 'Control buyer accounts, plan assignment, and account status.', '/companies'],
    ['Plans', 'Maintain public pricing and limits.', '/plans'],
    ['Account', 'Monitor platform totals and usage.', '/account'],
  ],
  admin: [
    ['Account', 'Confirm plan, limits, and usage.', '/account'],
    ['Team', 'Add managers and sales users.', '/users'],
    ['Leads', 'Start the sales workflow with leads.', '/leads'],
  ],
  manager: [
    ['Team', 'Review team members and ownership.', '/users'],
    ['Tasks', 'Track follow-ups and team activity.', '/tasks'],
    ['Reports', 'Review pipeline and conversion.', '/reports'],
  ],
  sales_executive: [
    ['Leads', 'Work assigned leads.', '/leads'],
    ['Tasks', 'Complete follow-ups.', '/tasks'],
    ['Deals', 'Update opportunity progress.', '/deals'],
  ],
};

const Workflow = () => {
  const { user } = useAuth();
  const guide = roleGuides[user?.role] || roleGuides.sales_executive;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Workflow</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950 dark:text-slate-50">Complete project flow</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Follow this path from plan purchase to daily CRM work, conversion, and reporting.
          </p>
        </div>
        <Link to="/account" className="btn-primary">Start with account setup</Link>
      </div>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {flowSteps.map(({ icon: Icon, title, text, action, to }, index) => (
          <div key={title} className="card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
                  <Icon size={22} />
                </div>
                <span className="text-sm font-bold text-slate-300">0{index + 1}</span>
              </div>
              <h2 className="mt-5 font-semibold text-slate-950 dark:text-slate-50">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
            </div>
            <Link to={to} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-600">
              {action}
            </Link>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="card">
          <FiTrendingUp className="text-primary-600" size={24} />
          <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-slate-50">Your next actions</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            These shortcuts are based on your current role, so each user sees the flow that matters to them.
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {guide.map(([title, text, to]) => (
            <Link key={title} to={to} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-primary-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary-800">
              <h3 className="font-semibold text-slate-950 dark:text-slate-50">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Workflow;
