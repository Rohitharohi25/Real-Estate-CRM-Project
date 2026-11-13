import { FiBarChart2, FiCheckSquare, FiShield, FiTarget, FiTrendingUp, FiUsers } from 'react-icons/fi';
import PublicPageShell from './PublicPageShell';

const AboutPage = () => (
  <PublicPageShell>
    <section className="px-4 py-14 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">About ProCRM</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight text-slate-950 dark:text-slate-50 lg:text-5xl">
            Sales operations, account control, and customer work in one clean system.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-500 dark:text-slate-400">
            ProCRM is shaped around the everyday rhythm of CRM work: capture leads, assign ownership, move deals, schedule follow-ups, and understand progress through reports.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3">
            {[
              ['Platform owner', 'Super admin manages plans and system-level control.'],
              ['Account owner', 'Plan buyers become admins for their company workspace.'],
              ['Team users', 'Managers and sales users work through assigned CRM activity.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-950">
                <p className="font-semibold text-slate-900 dark:text-slate-50">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section className="px-4 pb-16 sm:px-6 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
        {[
          { icon: FiTarget, title: 'Focused', text: 'No noisy modules. The app keeps attention on customers, leads, deals, tasks, and reports.' },
          { icon: FiUsers, title: 'Role aware', text: 'Super admin manages the platform while admins, managers, and sales users work inside CRM accounts.' },
          { icon: FiShield, title: 'Controlled', text: 'Plan management and top-level controls stay with super admin, while plan buyers become admins.' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Icon className="text-primary-600" size={24} />
            <h2 className="mt-4 font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="border-y border-slate-200 bg-slate-50 px-4 py-16 dark:border-slate-800 dark:bg-slate-900/40 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">What it connects</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 dark:text-slate-50">The important pieces of daily sales work.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FiUsers, title: 'Customers', text: 'Company and contact records stay searchable and owned.' },
            { icon: FiTrendingUp, title: 'Pipeline', text: 'Leads and deals move through clear stages.' },
            { icon: FiCheckSquare, title: 'Activity', text: 'Tasks, notes, and calendar items keep follow-up visible.' },
            { icon: FiBarChart2, title: 'Reports', text: 'Dashboards help teams understand progress and revenue.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-lg bg-white p-5 shadow-sm dark:bg-slate-950">
              <Icon className="text-primary-600" size={22} />
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </PublicPageShell>
);

export default AboutPage;
