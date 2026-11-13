import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBarChart2, FiCheck, FiCheckSquare, FiRepeat, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { planService } from '../services/planService';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const features = [
  { icon: FiUsers, title: 'Customer Management', desc: 'Keep every contact, company, and conversation organized in one place.' },
  { icon: FiTrendingUp, title: 'Sales Pipeline', desc: 'Move leads through stages from first touch to closed-won.' },
  { icon: FiCheckSquare, title: 'Task & Follow-ups', desc: 'Never miss a follow-up with assignable tasks and reminders.' },
  { icon: FiBarChart2, title: 'Reports & Analytics', desc: 'See conversion rates, pipeline value, and team performance at a glance.' },
];

const workflow = [
  { title: 'Capture', desc: 'Add customers and leads with ownership, source, and contact details.' },
  { title: 'Advance', desc: 'Convert leads into deals and move opportunities through the pipeline.' },
  { title: 'Follow up', desc: 'Schedule tasks, notes, and calendar items so no conversation is lost.' },
  { title: 'Measure', desc: 'Use dashboards and reports to understand revenue, conversion, and team activity.' },
];

const getFeaturedPlanId = (plans) => {
  const growthPlan = plans.find((plan) => plan.name?.toLowerCase() === 'growth');
  if (growthPlan) return growthPlan._id;
  return plans[Math.min(1, plans.length - 1)]?._id;
};

const Home = () => {
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    planService.publicList()
      .then((res) => setPlans(res.data))
      .catch(() => setPlans([]))
      .finally(() => setPlansLoading(false));
  }, []);

  const featuredPlanId = getFeaturedPlanId(plans);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 pb-24 pt-16 sm:pb-0 dark:bg-slate-950">
      <PublicNavbar />

      <section
        className="relative min-h-[640px] overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(90deg, rgba(2,44,34,0.94) 0%, rgba(15,23,42,0.80) 48%, rgba(15,23,42,0.22) 100%), url('/assets/crm-hero.png')" }}
      >
        <div className="mx-auto flex min-h-[640px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-12">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-50 shadow-sm backdrop-blur">
              CRM for growing sales teams
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-[3.35rem]">
              Customer relationships, organized and closed faster.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-emerald-50 sm:text-lg">
              ProCRM gives teams one polished workspace for customers, leads, deals, follow-ups, reports, and plan-based account ownership.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/pricing" className="btn-primary px-6 py-3">View plans</Link>
              <Link to="/features" className="btn-secondary px-6 py-3">Explore features</Link>
            </div>
            <div className="mt-9 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                ['4', 'Role levels'],
                ['8+', 'CRM modules'],
                ['Live', 'Plan signup'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-white/15 bg-white/10 p-4 shadow-sm backdrop-blur">
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs font-medium text-emerald-50">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">How ProCRM works</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950 dark:text-slate-50">A clear flow from plan purchase to closed deals.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              The platform starts with super admin plans, then creates a company admin account, then guides the sales team through daily CRM work.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {[
              ['1', 'Choose plan', 'Pick Starter, Growth, or Enterprise.'],
              ['2', 'Create admin', 'Buyer becomes the company admin.'],
              ['3', 'Add team', 'Invite managers and sales users.'],
              ['4', 'Capture leads', 'Add leads, customers, and ownership.'],
              ['5', 'Close deals', 'Convert leads and track pipeline.'],
              ['6', 'Measure', 'Review reports, limits, and usage.'],
            ].map(([step, title, text]) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">{step}</span>
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Core modules</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">Built for daily CRM work</h2>
            </div>
            <Link to="/features" className="text-sm font-medium text-primary-600 hover:underline">View all features</Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 inline-flex rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-4 py-16 dark:border-slate-800 dark:bg-slate-900/40 sm:px-6 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Workflow</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">From first lead to closed deal.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              The app connects the work your team repeats every day, so sales activity stays visible and measurable.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {workflow.map((item, index) => (
              <div key={item.title} className="rounded-lg bg-white p-5 shadow-sm dark:bg-slate-950">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">{index + 1}</div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          {[
            { icon: FiUsers, title: 'For account owners', text: 'Plan buyers become admins and can manage users, customers, leads, deals, tasks, notes, and reports.' },
            { icon: FiRepeat, title: 'For managers', text: 'Managers can monitor pipeline health, assignment, activity, and team progress without extra setup.' },
            { icon: FiCheckSquare, title: 'For sales users', text: 'Sales executives get focused access to their own assigned work, follow-ups, and pipeline records.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-lg border border-slate-200 p-6 dark:border-slate-800">
              <Icon className="text-primary-600" size={24} />
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" className="border-t border-slate-200 px-4 py-16 dark:border-slate-800 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">Pricing</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Plans that scale with your pipeline</h2>
            <p className="mx-auto max-w-xl text-sm text-slate-500 dark:text-slate-400">
              Choose a package that matches your team size and sales workflow.
            </p>
          </div>

          {plansLoading ? (
            <div className="text-center text-sm text-slate-400">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="text-center text-sm text-slate-400">Plans will be available soon.</div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => {
                const isFeatured = plan._id === featuredPlanId;

                return (
                  <div
                    key={plan._id}
                    className={`relative flex min-h-[520px] flex-col rounded-lg border bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900
                      ${isFeatured
                        ? 'border-primary-500 ring-2 ring-primary-100 dark:ring-primary-950'
                        : 'border-slate-200 dark:border-slate-800'
                      }`}
                  >
                    {isFeatured && (
                      <span className="absolute right-4 top-4 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white">
                        Popular
                      </span>
                    )}

                    <div className="pr-20">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">{plan.name}</h3>
                      <p className="mt-2 min-h-[60px] text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {plan.description || 'A flexible plan for sales teams.'}
                      </p>
                    </div>

                    <div className="mt-6 border-b border-slate-100 pb-6 dark:border-slate-800">
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50">
                          ${Number(plan.priceMonthly || 0).toLocaleString()}
                        </span>
                        <span className="pb-1.5 text-sm font-medium text-slate-500">per month</span>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-2 text-center sm:grid-cols-3">
                      <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/70">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{plan.maxUsers}</p>
                        <p className="text-[11px] text-slate-500">Users</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/70">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{Number(plan.maxCustomers).toLocaleString()}</p>
                        <p className="text-[11px] text-slate-500">Customers</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/70">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{Number(plan.maxLeads).toLocaleString()}</p>
                        <p className="text-[11px] text-slate-500">Leads</p>
                      </div>
                    </div>

                    <div className="mt-6 flex-1">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Included</p>
                      <div className="space-y-3">
                        {(plan.features || []).slice(0, 5).map((feature, index) => (
                          <div key={`${plan._id}-feature-${index}`} className="flex gap-2 text-sm leading-5 text-slate-600 dark:text-slate-300">
                            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-300">
                              <FiCheck size={13} />
                            </span>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link to={`/register?plan=${plan._id}`} className={isFeatured ? 'btn-primary mt-6 w-full' : 'btn-secondary mt-6 w-full'}>
                      Buy plan
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
};

export default Home;
