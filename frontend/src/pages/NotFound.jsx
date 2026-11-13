import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950 text-center">
    <div className="text-7xl font-black text-primary-600">404</div>
    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Page not found</h1>
    <p className="text-slate-500 dark:text-slate-400">The page you're looking for doesn't exist or has been moved.</p>
    <Link to="/dashboard" className="btn-primary mt-2">Go to Dashboard</Link>
  </div>
);

export default NotFound;
