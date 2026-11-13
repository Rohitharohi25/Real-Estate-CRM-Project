import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers, FiUserPlus, FiCheckSquare, FiTrendingUp, FiDollarSign, FiPercent, FiArrowRight,
} from 'react-icons/fi';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { reportService } from '../services/reportService';
import Card from '../components/Card';
import ChartCard from '../components/ChartCard';
import Loader from '../components/Loader';
import { useAuth } from '../hooks/useAuth';

const PIE_COLORS = ['#94a3b8', '#3b82f6', '#f59e0b', '#a855f7', '#22c55e', '#ef4444'];

const monthLabel = (m) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1];

const getNextSteps = (role, stats) => {
  if (role === 'super_admin') {
    return [
      { title: 'Review company accounts', text: 'Check plan buyers, usage, and account status.', to: '/companies' },
      { title: 'Manage public plans', text: 'Keep Starter, Growth, and Enterprise pricing accurate.', to: '/plans' },
      { title: 'Monitor platform usage', text: 'Track users, customers, leads, and account growth.', to: '/account' },
    ];
  }

  if (role === 'admin') {
    return [
      { title: 'Confirm your plan', text: 'Review limits before adding team and CRM records.', to: '/account' },
      { title: 'Add your team', text: 'Create manager and sales user accounts for daily work.', to: '/users' },
      { title: stats.totalLeads > 0 ? 'Work your pipeline' : 'Add your first lead', text: 'Start with a lead, assign follow-up, then convert to a deal.', to: '/leads' },
    ];
  }

  if (role === 'manager') {
    return [
      { title: 'Review team activity', text: 'Check leads, customers, tasks, and assignments.', to: '/users' },
      { title: 'Create or assign leads', text: 'Keep new opportunities moving through the sales flow.', to: '/leads' },
      { title: 'Check reports', text: 'Understand conversion, pipeline value, and won/lost deals.', to: '/reports' },
    ];
  }

  return [
    { title: 'Check assigned leads', text: 'Start with new or contacted leads assigned to you.', to: '/leads' },
    { title: 'Complete follow-ups', text: 'Use tasks and calendar to stay on schedule.', to: '/tasks' },
    { title: 'Update deal progress', text: 'Move opportunities forward and mark wins or losses.', to: '/deals' },
  ];
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService
      .dashboard()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen />;
  if (!stats) return null;

  const salesData = (stats.monthlySales || []).map((m) => ({
    name: `${monthLabel(m._id.month)} ${m._id.year}`,
    total: m.total,
  }));

  const leadsPie = (stats.leadsByStatus || []).map((l) => ({ name: l._id, value: l.count }));

  const wonLostData = [
    { name: 'Won', count: stats.wonDeals },
    { name: 'Lost', count: stats.lostDeals },
  ];
  const nextSteps = getNextSteps(user?.role, stats);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Follow the flow below to keep the CRM moving from setup to sales results.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Project flow</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-slate-50">What happens next</h2>
          <div className="mt-5 space-y-3">
            {[
              'Plan and account setup',
              'Team and role setup',
              'Lead capture and assignment',
              'Follow-up tasks and calendar',
              'Convert to deal and close',
              'Reports and plan usage',
            ].map((item, index) => (
              <div key={item} className="flex gap-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary-600 text-xs font-bold text-white">{index + 1}</span>
                <p className="pt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {nextSteps.map((step) => (
            <Link key={step.title} to={step.to} className="card group flex flex-col justify-between hover:border-primary-200 hover:shadow-md dark:hover:border-primary-800">
              <div>
                <h3 className="font-semibold text-slate-950 dark:text-slate-50">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{step.text}</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-600">
                Open <FiArrowRight className="transition-transform group-hover:translate-x-1" size={15} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card title="Customers" value={stats.totalCustomers} icon={FiUsers} accent="primary" />
        <Card title="Leads" value={stats.totalLeads} icon={FiUserPlus} accent="primary" />
        <Card title="Pending Tasks" value={stats.pendingTasks} icon={FiCheckSquare} accent="amber" />
        <Card title="Won Deals" value={stats.wonDeals} icon={FiTrendingUp} accent="green" />
        <Card title="Open Pipeline" value={`$${stats.openPipelineValue.toLocaleString()}`} icon={FiDollarSign} accent="primary" />
        <Card title="Conversion Rate" value={`${stats.conversionRate}%`} icon={FiPercent} accent="green" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Monthly Sales (Won Deals)">
            {salesData.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">No closed-won deals yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                  <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <ChartCard title="Leads by Status">
          {leadsPie.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No leads yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={leadsPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {leadsPie.map((entry, idx) => (
                    <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Won vs Lost Deals">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={wonLostData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default Dashboard;
