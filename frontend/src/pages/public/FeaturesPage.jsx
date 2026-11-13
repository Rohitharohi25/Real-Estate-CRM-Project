import { FiBarChart2, FiBell, FiCalendar, FiCheckSquare, FiFileText, FiShield, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import PublicPageShell from './PublicPageShell';

const featureGroups = [
  { icon: FiUsers, title: 'Customer and contact records', desc: 'Track customer profiles, companies, ownership, notes, and activity from one searchable workspace.' },
  { icon: FiTrendingUp, title: 'Lead and deal pipeline', desc: 'Move prospects from first touch to won or lost with stages, conversion, and Kanban deal tracking.' },
  { icon: FiCheckSquare, title: 'Tasks and follow-ups', desc: 'Assign follow-ups, track priority and status, and keep due dates visible on the shared calendar.' },
  { icon: FiCalendar, title: 'Calendar planning', desc: 'Plan tasks and expected deal close dates directly from a month view.' },
  { icon: FiBarChart2, title: 'Reports and exports', desc: 'Review dashboard metrics, sales reports, lead reports, and export PDF or CSV when needed.' },
  { icon: FiBell, title: 'Notifications', desc: 'Keep users aware of task assignments, deal outcomes, and important CRM events.' },
  { icon: FiShield, title: 'Role controls', desc: 'Separate super admin, admin, manager, and sales executive access for cleaner operations.' },
  { icon: FiFileText, title: 'Notes everywhere', desc: 'Attach notes to customers, leads, deals, and manage all notes in one place.' },
];

const roleFeatures = [
  ['Super admin', 'Manage platform plans, see all accounts, and keep top-level control separate from customer admins.'],
  ['Admin', 'Own a CRM workspace after buying a plan, manage users, and configure daily sales operations.'],
  ['Manager', 'Review team activity, reports, customers, leads, and pipeline progress.'],
  ['Sales executive', 'Work assigned customers, leads, deals, tasks, and follow-ups without extra noise.'],
];

const FeaturesPage = () => (
  <PublicPageShell>
    <section className="px-6 py-16 text-center lg:px-12 lg:py-20">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Features</p>
      <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold text-slate-900 dark:text-slate-50 lg:text-5xl">
        Everything a sales team needs after the first conversation.
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-slate-500 dark:text-slate-400">
        ProCRM keeps account records, pipeline movement, daily tasks, and reporting in one focused workflow.
      </p>
    </section>

    <section className="border-y border-slate-200 bg-slate-50 px-4 py-16 dark:border-slate-800 dark:bg-slate-900/40 sm:px-6 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Operational flow</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">A workflow for the whole sales cycle.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            ProCRM connects records, ownership, pipeline movement, and reporting so the team can see what has happened and what should happen next.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {['Add leads and customers', 'Convert leads into deals', 'Assign tasks and notes', 'Measure pipeline health'].map((item, index) => (
            <div key={item} className="rounded-lg bg-white p-5 shadow-sm dark:bg-slate-950">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">{index + 1}</span>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-50">{item}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="px-6 pb-20 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-5 pt-16 sm:grid-cols-2 lg:grid-cols-4">
        {featureGroups.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 inline-flex rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
              <Icon size={20} />
            </div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="px-4 pb-20 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Role support</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">Access that matches responsibility.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {roleFeatures.map(([role, text]) => (
            <div key={role} className="rounded-lg border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">{role}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="border-t border-slate-200 px-6 py-14 dark:border-slate-800 lg:px-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-5 rounded-lg bg-slate-50 p-8 text-center dark:bg-slate-900 md:flex-row md:text-left">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Ready to try the workflow?</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Pick a plan and create the admin account for your CRM workspace.</p>
        </div>
        <Link to="/pricing" className="btn-primary">View plans</Link>
      </div>
    </section>
  </PublicPageShell>
);

export default FeaturesPage;
