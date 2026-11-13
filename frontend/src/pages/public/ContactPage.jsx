import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiClock, FiHelpCircle, FiMail, FiMessageSquare, FiSend, FiShield, FiUsers } from 'react-icons/fi';
import PublicPageShell from './PublicPageShell';

const supportCards = [
  { icon: FiMail, title: 'Sales and plans', text: 'Questions about pricing, plan limits, and admin account setup.' },
  { icon: FiUsers, title: 'Implementation', text: 'Help planning roles, teams, demo data, and first workspace setup.' },
  { icon: FiShield, title: 'Platform admin', text: 'Guidance for super admin controls, plan management, and account ownership.' },
];

const faqs = [
  ['Who manages plans?', 'Only the super admin can create, edit, or remove plans.'],
  ['Who becomes admin after buying?', 'The person who selects a plan and registers becomes admin for that CRM workspace.'],
  ['Can managers add users?', 'Managers can view team information, while admins and super admins manage users.'],
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', company: '', topic: 'sales', message: '' });

  const submit = (event) => {
    event.preventDefault();
    toast.success('Message captured for demo purposes.');
    setForm({ name: '', email: '', company: '', topic: 'sales', message: '' });
  };

  return (
    <PublicPageShell>
      <section className="px-4 py-12 sm:px-6 lg:px-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Contact</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
              Get help choosing and setting up ProCRM.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-500 dark:text-slate-400">
              Ask about plans, admin setup, super admin controls, account ownership, or the best way to configure your sales workflow.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {supportCards.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <Icon className="text-primary-600" size={22} />
                  <h2 className="mt-3 font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Name</label>
                <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Email</label>
                <input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Company</label>
                <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div>
                <label className="label">Topic</label>
                <select className="input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                  <option value="sales">Plans and pricing</option>
                  <option value="setup">Workspace setup</option>
                  <option value="admin">Admin roles</option>
                  <option value="support">Product support</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Message</label>
                <textarea required rows={6} className="input resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
            </div>

            <button className="btn-primary mt-5 w-full" type="submit">
              <FiSend size={15} /> Send message
            </button>

            <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:grid-cols-2">
              <div className="flex gap-2">
                <FiClock className="mt-0.5 flex-shrink-0 text-primary-600" />
                <span>Typical response: one business day</span>
              </div>
              <div className="flex gap-2">
                <FiMessageSquare className="mt-0.5 flex-shrink-0 text-primary-600" />
                <span>Demo inbox: support@procrm.local</span>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-4 py-14 dark:border-slate-800 dark:bg-slate-900/40 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-2">
            <FiHelpCircle className="text-primary-600" size={22} />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Common questions</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {faqs.map(([question, answer]) => (
              <div key={question} className="rounded-lg bg-white p-5 shadow-sm dark:bg-slate-950">
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">{question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
};

export default ContactPage;
