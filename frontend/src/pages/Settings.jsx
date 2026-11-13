import { useEffect, useState } from 'react';
import { FiMoon, FiSun, FiMonitor } from 'react-icons/fi';

const Settings = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

  const applyTheme = (t) => {
    setTheme(t);
    localStorage.setItem('theme', t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  };

  const themeOptions = [
    { key: 'light', label: 'Light', icon: FiSun },
    { key: 'dark', label: 'Dark', icon: FiMoon },
    { key: 'system', label: 'System', icon: FiMonitor },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Settings</h1>

      {/* Appearance */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">Appearance</h2>
        <div>
          <label className="label">Theme</label>
          <div className="mt-1 flex gap-2">
            {themeOptions.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => applyTheme(key)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors
                  ${theme === key
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'}`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications preferences (informational; real control via Notifications page) */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">Notifications</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          ProCRM sends in-app notifications when tasks are due, leads are assigned, and deals are updated.
          View and manage your notifications on the Notifications page.
        </p>
      </div>

      {/* About */}
      <div className="card space-y-2">
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">About</h2>
        <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
          <p>ProCRM v1.0.0</p>
          <p>Full-stack CRM · React · Node.js · MongoDB</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
