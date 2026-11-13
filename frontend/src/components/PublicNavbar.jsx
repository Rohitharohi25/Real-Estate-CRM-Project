import { useEffect, useRef, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link, NavLink } from 'react-router-dom';
import PublicMobileTabBar from './PublicMobileTabBar';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const PublicNavbar = () => {
  const [open, setOpen] = useState(false);
  const navbarRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <header ref={navbarRef} className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm shadow-slate-200/50 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-none">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
          <Link to="/" className="flex min-w-0 items-center gap-2" onClick={() => setOpen(false)}>
            <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-600 font-bold text-white shadow-lg shadow-primary-600/25">
              <span className="absolute bottom-0 left-0 h-1 w-full bg-accent-500" />
              P
            </div>
            <span className="truncate text-xl font-bold text-slate-800 dark:text-slate-50">ProCRM</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                      : 'hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800 dark:hover:text-primary-400'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <Link to="/login" className="btn-secondary px-3 py-2">Log in</Link>
            <Link to="/register" className="btn-primary px-3 py-2">Get started</Link>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            {open ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        {open && (
          <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800 sm:hidden">
            <nav className="grid gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 ${isActive ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to="/login" className="btn-secondary" onClick={() => setOpen(false)}>Log in</Link>
              <Link to="/register" className="btn-primary" onClick={() => setOpen(false)}>Get started</Link>
            </div>
          </div>
        )}
      </header>
      <PublicMobileTabBar />
    </>
  );
};

export default PublicNavbar;
