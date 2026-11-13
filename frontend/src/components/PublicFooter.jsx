import { Link } from 'react-router-dom';

const PublicFooter = () => (
  <footer className="border-t border-primary-900 bg-slate-950 px-4 py-12 text-white dark:border-slate-800 sm:px-6 lg:px-12">
    <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
      <div>
        <Link to="/" className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-primary-600 font-bold text-white">
            <span className="absolute bottom-0 left-0 h-1 w-full bg-accent-500" />
            P
          </div>
          <span className="text-xl font-bold text-white">ProCRM</span>
        </Link>
        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
          A focused CRM for managing customers, leads, deals, tasks, and reporting from one workspace.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white">Product</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-400">
          <Link to="/features" className="block hover:text-white">Features</Link>
          <Link to="/pricing" className="block hover:text-white">Pricing</Link>
          <Link to="/register" className="block hover:text-white">Create account</Link>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white">Company</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-400">
          <Link to="/about" className="block hover:text-white">About</Link>
          <Link to="/contact" className="block hover:text-white">Contact</Link>
          <Link to="/privacy" className="block hover:text-white">Privacy</Link>
          <Link to="/terms" className="block hover:text-white">Terms</Link>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white">Access</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-400">
          <Link to="/login" className="block hover:text-white">Log in</Link>
          <Link to="/forgot-password" className="block hover:text-white">Reset password</Link>
        </div>
      </div>
    </div>

    <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-2 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>&copy; {new Date().getFullYear()} ProCRM. All rights reserved.</span>
      <span>Built for modern sales teams.</span>
    </div>
  </footer>
);

export default PublicFooter;
