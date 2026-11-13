import { NavLink } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiUserPlus, FiTrendingUp, FiCheckSquare, FiCalendar,
  FiFileText, FiBarChart2, FiUserCheck, FiX, FiPackage, FiCreditCard, FiBriefcase,
  FiGitBranch,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid, roles: ['super_admin', 'admin', 'manager', 'sales_executive'] },
  { to: '/workflow', label: 'Workflow', icon: FiGitBranch, roles: ['super_admin', 'admin', 'manager', 'sales_executive'] },
  { to: '/customers', label: 'Customers', icon: FiUsers, roles: ['super_admin', 'admin', 'manager', 'sales_executive'] },
  { to: '/leads', label: 'Leads', icon: FiUserPlus, roles: ['super_admin', 'admin', 'manager', 'sales_executive'] },
  { to: '/deals', label: 'Deals', icon: FiTrendingUp, roles: ['super_admin', 'admin', 'manager', 'sales_executive'] },
  { to: '/tasks', label: 'Tasks', icon: FiCheckSquare, roles: ['super_admin', 'admin', 'manager', 'sales_executive'] },
  { to: '/calendar', label: 'Calendar', icon: FiCalendar, roles: ['super_admin', 'admin', 'manager', 'sales_executive'] },
  { to: '/notes', label: 'Notes', icon: FiFileText, roles: ['super_admin', 'admin', 'manager', 'sales_executive'] },
  { to: '/reports', label: 'Reports', icon: FiBarChart2, roles: ['super_admin', 'admin', 'manager', 'sales_executive'] },
  { to: '/account', label: 'Account', icon: FiCreditCard, roles: ['super_admin', 'admin', 'manager', 'sales_executive'] },
  { to: '/users', label: 'Team', icon: FiUserCheck, roles: ['super_admin', 'admin', 'manager'] },
  { to: '/companies', label: 'Companies', icon: FiBriefcase, roles: ['super_admin'] },
  { to: '/plans', label: 'Plans', icon: FiPackage, roles: ['super_admin'] },
];

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const visibleLinks = links.filter((l) => l.roles.includes(user?.role));

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-900 bg-slate-950 text-slate-100 shadow-2xl shadow-slate-950/20 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 font-bold text-white shadow-lg shadow-primary-500/30">
              P
            </div>
            <span className="text-lg font-bold text-white">ProCRM</span>
          </div>
          <button className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden" onClick={onClose} aria-label="Close menu">
            <FiX />
          </button>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {visibleLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
