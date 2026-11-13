import { Outlet } from 'react-router-dom';
import PublicFooter from '../components/PublicFooter';
import PublicNavbar from '../components/PublicNavbar';

// Shared two-column layout for Login / Register / Forgot / Reset Password pages.
const AuthLayout = () => (
  <div className="min-h-screen bg-slate-50 pb-24 pt-16 sm:pb-0 dark:bg-slate-950">
    <PublicNavbar />
    <main className="flex min-h-[calc(100vh-8rem)]">
      <div
        className="hidden flex-1 flex-col justify-between bg-cover bg-center p-12 text-white lg:flex"
        style={{ backgroundImage: "linear-gradient(135deg, rgba(2,44,34,0.92), rgba(15,23,42,0.76) 55%, rgba(234,88,12,0.34)), url('/assets/crm-hero.png')" }}
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-100">ProCRM Workspace</p>
          <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight">Run your entire sales pipeline in one place.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-emerald-50">
            Track customers, leads, and deals from first contact to closed-won, with your whole team in sync.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-emerald-50">
          <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">Role-based access for super admins, admins, managers, and sales teams.</div>
          <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">Plans, customers, pipeline, tasks, and reporting in one product.</div>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </main>
    <PublicFooter />
  </div>
);

export default AuthLayout;
