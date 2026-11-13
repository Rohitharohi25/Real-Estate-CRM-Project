import PublicFooter from '../../components/PublicFooter';
import PublicNavbar from '../../components/PublicNavbar';

const PublicPageShell = ({ children }) => (
  <div className="min-h-screen bg-white pb-24 pt-16 text-slate-900 sm:pb-0 dark:bg-slate-950 dark:text-slate-50">
    <PublicNavbar />
    <main>{children}</main>
    <PublicFooter />
  </div>
);

export default PublicPageShell;
