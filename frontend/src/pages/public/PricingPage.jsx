import { useEffect, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { planService } from '../../services/planService';
import PublicPageShell from './PublicPageShell';

const getFeaturedPlanId = (plans) => {
  const growthPlan = plans.find((plan) => plan.name?.toLowerCase() === 'growth');
  if (growthPlan) return growthPlan._id;
  return plans[Math.min(1, plans.length - 1)]?._id;
};

const PricingPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    planService.publicList()
      .then((res) => setPlans(res.data))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const featuredPlanId = getFeaturedPlanId(plans);

  return (
    <PublicPageShell>
      <section className="px-4 py-14 text-center sm:px-6 lg:px-12 lg:py-20">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Pricing</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold leading-tight text-slate-950 dark:text-slate-50 lg:text-5xl">
          Choose the right CRM plan for your team.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-400">
          Every plan creates an admin account for the buyer, while super admin controls the platform plans.
        </p>
        <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
          {['Admin account after purchase', 'Plan limits shown upfront', 'Super admin controls pricing'].map((item) => (
            <div key={item} className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="text-center text-sm text-slate-400">Loading plans...</div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => {
                const isFeatured = plan._id === featuredPlanId;
                return (
                  <div key={plan._id} className={`relative flex min-h-[520px] flex-col rounded-lg border bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900 ${isFeatured ? 'border-primary-500 ring-2 ring-primary-100 dark:ring-primary-950' : 'border-slate-200 dark:border-slate-800'}`}>
                    {isFeatured && <span className="absolute right-4 top-4 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white">Popular</span>}
                    <div className="pr-20">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{plan.name}</h2>
                      <p className="mt-2 min-h-[60px] text-sm leading-6 text-slate-500 dark:text-slate-400">{plan.description}</p>
                    </div>
                    <div className="mt-6 border-b border-slate-100 pb-6 dark:border-slate-800">
                      <span className="text-4xl font-extrabold text-slate-950 dark:text-slate-50">${Number(plan.priceMonthly || 0).toLocaleString()}</span>
                      <span className="ml-1 text-sm font-medium text-slate-500">per month</span>
                    </div>
                    <div className="mt-5 grid grid-cols-1 gap-2 text-center sm:grid-cols-3">
                      <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/70"><p className="text-sm font-semibold">{plan.maxUsers}</p><p className="text-[11px] text-slate-500">Users</p></div>
                      <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/70"><p className="text-sm font-semibold">{Number(plan.maxCustomers).toLocaleString()}</p><p className="text-[11px] text-slate-500">Customers</p></div>
                      <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/70"><p className="text-sm font-semibold">{Number(plan.maxLeads).toLocaleString()}</p><p className="text-[11px] text-slate-500">Leads</p></div>
                    </div>
                    <div className="mt-6 flex-1 space-y-3">
                      {(plan.features || []).map((feature, index) => (
                        <div key={`${plan._id}-feature-${index}`} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <FiCheck className="mt-0.5 flex-shrink-0 text-green-500" size={15} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Link to={`/register?plan=${plan._id}`} className={isFeatured ? 'btn-primary mt-6 w-full' : 'btn-secondary mt-6 w-full'}>Buy plan</Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicPageShell>
  );
};

export default PricingPage;
