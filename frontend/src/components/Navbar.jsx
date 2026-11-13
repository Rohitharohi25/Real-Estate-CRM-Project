import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiSun, FiMoon, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notificationService';

const Navbar = ({ onMenuClick, darkMode, onToggleDark }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const loadNotifications = () => {
      notificationService
        .list()
        .then((res) => {
          setNotifications(res.data);
          setUnreadCount(res.unreadCount);
        })
        .catch(() => {});
    };
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm shadow-slate-200/50 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none">
      <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden" onClick={onMenuClick} aria-label="Open menu">
        <FiMenu size={20} />
      </button>
      <div className="hidden lg:block">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Workspace</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage customers, pipeline, and team activity</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          onClick={onToggleDark}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            onClick={() => setNotifOpen((o) => !o)}
            aria-label="Notifications"
          >
            <FiBell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <span className="font-semibold text-sm">Notifications</span>
                <button className="text-xs text-primary-600 hover:underline" onClick={markAllRead}>
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">You're all caught up</p>
                )}
                {notifications.map((n) => (
                  <Link
                    key={n._id}
                    to={n.link || '/notifications'}
                    className={`block border-b border-slate-50 px-4 py-3 text-sm dark:border-slate-800/50 ${
                      !n.isRead ? 'bg-primary-50/50 dark:bg-primary-950/30' : ''
                    }`}
                    onClick={() => setNotifOpen(false)}
                  >
                    <p className="font-medium text-slate-700 dark:text-slate-200">{n.title}</p>
                    <p className="text-xs text-slate-500">{n.message}</p>
                  </Link>
                ))}
              </div>
              <Link
                to="/notifications"
                className="block px-4 py-2 text-center text-xs text-primary-600 hover:underline"
                onClick={() => setNotifOpen(false)}
              >
                View all
              </Link>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setProfileOpen((o) => !o)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="hidden text-sm font-medium text-slate-600 dark:text-slate-300 md:block">{user?.name}</span>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
              <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setProfileOpen(false)}>
                <FiUser size={16} /> Profile
              </Link>
              <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setProfileOpen(false)}>
                <FiSettings size={16} /> Settings
              </Link>
              <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                <FiLogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
