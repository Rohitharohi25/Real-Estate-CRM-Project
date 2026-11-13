import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMessageCircle, FiSend, FiX, FiZap } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const nowId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const quickPrompts = [
  'How does this CRM flow work?',
  'Which login can I use?',
  'How do plans work?',
  'How to add my team?',
];

const linkMap = {
  pricing: '/pricing',
  plans: '/plans',
  account: '/account',
  workflow: '/workflow',
  team: '/users',
  users: '/users',
  leads: '/leads',
  customers: '/customers',
  deals: '/deals',
  tasks: '/tasks',
  reports: '/reports',
  companies: '/companies',
  login: '/login',
};

const appRoutePrefixes = [
  '/dashboard',
  '/workflow',
  '/customers',
  '/leads',
  '/deals',
  '/tasks',
  '/calendar',
  '/notes',
  '/reports',
  '/account',
  '/users',
  '/companies',
  '/plans',
  '/profile',
  '/settings',
  '/notifications',
];

const publicRoutePrefixes = ['/', '/features', '/pricing', '/about', '/contact', '/privacy', '/terms', '/login', '/register', '/forgot-password', '/reset-password'];

const getReply = (rawText, user, pathname) => {
  const text = rawText.toLowerCase();
  const role = user?.role?.replace(/_/g, ' ') || 'visitor';

  if (text.includes('login') || text.includes('password')) {
    return {
      text: 'For security, I cannot show passwords in chat. Use the credentials provided by your admin, or open login and use forgot password if you need access. Buyer accounts only see their own company workspace.',
      links: [{ label: 'Open login', to: '/login' }, { label: 'Reset password', to: '/forgot-password' }],
    };
  }

  if (text.includes('flow') || text.includes('workflow') || text.includes('start')) {
    return {
      text: 'The main flow is: choose a plan, create the admin account, review account limits, add team users, add leads, schedule follow-ups, convert to deals, then review reports.',
      links: [{ label: 'Open workflow', to: '/workflow' }, { label: 'View plans', to: '/pricing' }],
    };
  }

  if (text.includes('plan') || text.includes('subscription') || text.includes('price')) {
    return {
      text: user
        ? 'Plans control user, customer, and lead limits. Admins can review or change their plan from Account. Super admins manage plan definitions from Plans.'
        : 'There are three public plans: Starter, Growth, and Enterprise. Pick a plan to create an admin account for that company.',
      links: user
        ? [{ label: 'Open account', to: '/account' }, ...(user.role === 'super_admin' ? [{ label: 'Manage plans', to: '/plans' }] : [])]
        : [{ label: 'View pricing', to: '/pricing' }],
    };
  }

  if (text.includes('team') || text.includes('user') || text.includes('manager') || text.includes('sales')) {
    return {
      text: 'Admins add managers and sales executives from Team. Buyer admins only see users inside their own company; super admin can see platform-level accounts.',
      links: [{ label: 'Open team', to: '/users' }],
    };
  }

  if (text.includes('lead') || text.includes('customer') || text.includes('deal')) {
    return {
      text: 'Sales work starts with leads or customers. Assign leads to users, create follow-up tasks, then convert qualified leads into customers and deals.',
      links: [
        { label: 'Open leads', to: '/leads' },
        { label: 'Open customers', to: '/customers' },
        { label: 'Open deals', to: '/deals' },
      ],
    };
  }

  if (text.includes('report') || text.includes('dashboard')) {
    return {
      text: 'Dashboard and Reports show customers, leads, pending tasks, won deals, open pipeline, conversion rate, and sales charts. Buyer accounts only see their own workspace data.',
      links: [{ label: 'Open reports', to: '/reports' }, { label: 'Open dashboard', to: '/dashboard' }],
    };
  }

  if (text.includes('company') || text.includes('buyer')) {
    return {
      text: 'A buyer chooses a plan and becomes the company admin. Super admin can manage buyer companies from Companies; buyer admins only manage their own workspace.',
      links: user?.role === 'super_admin' ? [{ label: 'Open companies', to: '/companies' }] : [{ label: 'Open account', to: '/account' }],
    };
  }

  const pageHint = pathname === '/' ? 'You are on the home page.' : `You are on ${pathname}.`;
  return {
    text: `${pageHint} I can help with CRM flow, plans, login test accounts, team setup, leads, deals, tasks, reports, and company/buyer access. Your current role is ${role}.`,
    links: [{ label: 'Open workflow', to: '/workflow' }],
  };
};

const ChatBot = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => [
    {
      id: nowId(),
      role: 'bot',
      text: 'Hi, I am your ProCRM helper. Ask me about login, plans, workflow, buyer accounts, leads, deals, or reports.',
      links: [{ label: 'Show workflow', to: '/workflow' }],
    },
  ]);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const isAppRoute = appRoutePrefixes.some((path) => location.pathname.startsWith(path));
  const isPublicRoute = publicRoutePrefixes.some((path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path)));
  const liftAboveMobileTabs = (Boolean(user) && isAppRoute) || (!user && isPublicRoute);

  const placeholder = useMemo(() => {
    if (!user) return 'Ask about plans or login...';
    if (user.role === 'super_admin') return 'Ask about companies or plans...';
    if (user.role === 'admin') return 'Ask about team or account setup...';
    return 'Ask about leads, tasks, or deals...';
  }, [user]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [open]);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const reply = getReply(trimmed, user, location.pathname);
    setMessages((prev) => [
      ...prev,
      { id: nowId(), role: 'user', text: trimmed },
      { id: nowId(), role: 'bot', ...reply },
    ]);
    setInput('');
    setOpen(true);
  };

  return (
    <div
      ref={containerRef}
      className={`fixed right-4 z-[80] sm:right-6 lg:bottom-6 ${
        liftAboveMobileTabs ? 'bottom-24' : 'bottom-4 sm:bottom-6'
      }`}
    >
      {open && (
        <div className="mb-3 flex h-[min(34rem,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-[23rem] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm shadow-primary-600/20">
                <FiMessageCircle size={17} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-5 text-slate-950 dark:text-slate-50">ProCRM Assistant</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">Workflow, plans, and CRM help</p>
              </div>
            </div>
            <button className="ml-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" onClick={() => setOpen(false)} aria-label="Close chat">
              <FiX />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-900/70">
            {messages.map((message) => (
              <div key={message.id} className={message.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block max-w-[90%] px-3.5 py-2.5 text-sm leading-6 shadow-sm ${
                  message.role === 'user'
                    ? 'rounded-2xl rounded-br-md bg-primary-600 text-white shadow-primary-600/20'
                    : 'rounded-2xl rounded-bl-md border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                }`}>
                  {message.text}
                </div>
                {message.links?.length > 0 && (
                  <div className={`mt-2 flex flex-wrap gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.links.map((link) => (
                      <Link
                        key={`${message.id}-${link.to}`}
                        to={link.to}
                        className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100 dark:border-primary-900 dark:bg-primary-950 dark:text-primary-200"
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {quickPrompts.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  className="flex-shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(input);
              }}
            >
              <input
                className="input h-11 rounded-xl"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={placeholder}
              />
              <button className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700" type="submit" aria-label="Send message">
                <FiSend size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {!open && (
        <button
          className="group flex items-center gap-3 rounded-full bg-primary-600 py-2 pl-3 pr-4 text-white shadow-2xl shadow-primary-600/25 transition-transform hover:-translate-y-1 hover:bg-primary-700"
          onClick={() => setOpen(true)}
          aria-label="Open chat assistant"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <FiMessageCircle size={20} />
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold leading-4">Need help?</span>
            <span className="block text-xs text-emerald-50">Ask ProCRM</span>
          </span>
        </button>
      )}
    </div>
  );
};

export default ChatBot;
