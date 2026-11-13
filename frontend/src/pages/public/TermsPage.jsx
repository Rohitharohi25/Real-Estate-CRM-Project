import PublicPageShell from './PublicPageShell';

const TermsPage = () => (
  <PublicPageShell>
    <section className="px-6 py-16 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-50">Terms of Service</h1>
        <p className="mt-4 text-slate-500 dark:text-slate-400">These placeholder terms describe expected use for the ProCRM demo project.</p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
          <p>Users are responsible for the accuracy and legality of data entered into the CRM.</p>
          <p>Plan names, prices, limits, and features are controlled by the super admin account.</p>
          <p>Before production use, replace this page with legal terms reviewed for your business and region.</p>
        </div>
      </div>
    </section>
  </PublicPageShell>
);

export default TermsPage;
