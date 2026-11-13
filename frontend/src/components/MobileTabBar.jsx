import { NavLink } from 'react-router-dom';
import { FiCheckSquare, FiGrid, FiTrendingUp, FiUserPlus, FiUsers } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const tabs = [
  { to: '/dashboard', label: 'Home', icon: FiGrid },
  { to: '/customers', label: 'Customers', icon: FiUsers },
  { to: '/leads', label: 'Leads', icon: FiUserPlus },
  { to: '/deals', label: 'Deals', icon: FiTrendingUp },
  { to: '/tasks', label: 'Tasks', icon: FiCheckSquare },
];

const MobileTabBar = () => {
  const { user, isAuthenticated } = useAuth();

  if (!user || !isAuthenticated) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.10)] backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center justify-center rounded-lg px-1 py-2 text-[11px] font-semibold transition-colors ${
                isActive
                  ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            <Icon size={20} className="mb-1" />
            <span className="w-full truncate text-center">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileTabBar;
