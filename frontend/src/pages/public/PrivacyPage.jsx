import PublicPageShell from './PublicPageShell';

const PrivacyPage = () => (
  <PublicPageShell>
    <section className="px-6 py-16 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-50">Privacy Policy</h1>
        <p className="mt-4 text-slate-500 dark:text-slate-400">This demo CRM stores account and sales data needed to operate the product experience.</p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
          <p>Workspace users should only enter business data they are authorized to manage.</p>
          <p>Authentication tokens are stored locally in the browser for this development build.</p>
          <p>Production deployments should configure secure hosting, HTTPS, database backups, and organization-specific privacy terms.</p>
        </div>
      </div>
    </section>
  </PublicPageShell>
);

export default PrivacyPage;
