import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileTabBar from '../components/MobileTabBar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />
        <main className="flex-1 overflow-y-auto p-4 pb-28 md:p-6 md:pb-28 lg:p-8">
          <Outlet />
        </main>
        <div className="hidden lg:block">
          <Footer />
        </div>
        <MobileTabBar />
      </div>
    </div>
  );
};

export default DashboardLayout;
