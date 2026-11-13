import { useEffect, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { reportService } from '../services/reportService';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';

const PIE_COLORS = ['#4f46e5','#3b82f6','#f59e0b','#a855f7','#22c55e','#ef4444','#94a3b8'];

const labelize = (s) => (s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '');

const Reports = () => {
  const [tab, setTab] = useState('sales');
  const [sales, setSales] = useState(null);
  const [leads, setLeads] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([reportService.sales(), reportService.leads()])
      .then(([sr, lr]) => { setSales(sr.data); setLeads(lr.data); })
      .finally(() => setLoading(false));
  }, []);

  const exportCSV = (rows, filename) => {
    if (!rows.length) return;
    const keys = Object.keys(rows[0]);
    const escapeCell = (value) => {
      const text = String(value ?? '');
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => escapeCell(r[k])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('ProCRM Reports', 14, 15);
    doc.setFontSize(12);

    if (tab === 'sales' && sales) {
      doc.text('Deals by Stage', 14, 28);
      autoTable(doc, {
        startY: 32,
        head: [['Stage', 'Count', 'Total Value']],
        body: sales.dealsByStage.map((d) => [labelize(d._id), d.count, `$${d.totalValue.toLocaleString()}`]),
      });
      const y = doc.lastAutoTable.finalY + 10;
      doc.text('Top Performers', 14, y);
      autoTable(doc, {
        startY: y + 4,
        head: [['Name', 'Deals Won', 'Total Value']],
        body: sales.topPerformers.map((p) => [p.user?.name || '—', p.dealsWon, `$${p.totalValue.toLocaleString()}`]),
      });
    } else if (tab === 'leads' && leads) {
      doc.text('Leads by Source', 14, 28);
      autoTable(doc, {
        startY: 32,
        head: [['Source', 'Count']],
        body: leads.bySource.map((d) => [labelize(d._id), d.count]),
      });
    }

    doc.save(`procrm-${tab}-report.pdf`);
  };

  if (loading) return <Loader fullScreen />;

  const stageBarData = (sales?.dealsByStage || []).map((d) => ({
    name: labelize(d._id), count: d.count, value: d.totalValue,
  }));

  const sourceData = (leads?.bySource || []).map((d) => ({ name: labelize(d._id), value: d.count }));
  const statusData = (leads?.byStatus || []).map((d) => ({ name: labelize(d._id), value: d.count }));

  const performerColumns = [
    { key: 'name', label: 'Rep', render: (r) => r.user?.name || '—' },
    { key: 'dealsWon', label: 'Deals Won' },
    { key: 'totalValue', label: 'Total Value', render: (r) => `$${r.totalValue.toLocaleString()}` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Reports</h1>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => exportCSV(
            tab === 'sales' ? sales?.dealsByStage.map((d) => ({ stage: d._id, count: d.count, value: d.totalValue })) : leads?.bySource.map((d) => ({ source: d._id, count: d.count })),
            `${tab}-report`
          )}>
            <FiDownload className="mr-1 inline" size={14} />CSV
          </button>
          <button className="btn-secondary" onClick={exportPDF}>
            <FiDownload className="mr-1 inline" size={14} />PDF
          </button>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800 w-fit">
        {['sales', 'leads'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors
              ${tab === t ? 'bg-white shadow dark:bg-slate-900 text-slate-800 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'sales' && sales && (
        <div className="space-y-4">
          <ChartCard title="Deals by Stage">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stageBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" name="Count" fill="#4f46e5" radius={[4,4,0,0]} />
                <Bar yAxisId="right" dataKey="value" name="Value ($)" fill="#a5b4fc" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div>
            <h3 className="mb-2 font-semibold text-slate-700 dark:text-slate-200">Top Performers</h3>
            <DataTable
              columns={performerColumns}
              rows={sales.topPerformers.map((p, i) => ({ ...p, _id: i }))}
              emptyMessage="No data yet"
            />
          </div>
        </div>
      )}

      {tab === 'leads' && leads && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Leads by Source">
            {sourceData.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {sourceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Leads by Status">
            {statusData.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Count" fill="#4f46e5" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      )}
    </div>
  );
};

export default Reports;
