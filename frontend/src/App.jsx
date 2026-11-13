import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Guards
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Home from './pages/Home';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import FeaturesPage from './pages/public/FeaturesPage';
import PricingPage from './pages/public/PricingPage';
import PrivacyPage from './pages/public/PrivacyPage';
import TermsPage from './pages/public/TermsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Dashboard pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import Deals from './pages/Deals';
import DealDetails from './pages/DealDetails';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import Calendar from './pages/Calendar';
import Notes from './pages/Notes';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Plans from './pages/Plans';
import Account from './pages/Account';
import Companies from './pages/Companies';
import Workflow from './pages/Workflow';
import NotFound from './pages/NotFound';

const App = () => (
  <Routes>
    {/* Public home */}
    <Route path="/" element={<Home />} />
    <Route path="/features" element={<FeaturesPage />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/privacy" element={<PrivacyPage />} />
    <Route path="/terms" element={<TermsPage />} />

    {/* Auth pages (split-screen layout) */}
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Route>

    {/* Protected dashboard (any logged-in user) */}
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/leads/:id" element={<LeadDetails />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/deals/:id" element={<DealDetails />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/:id" element={<TaskDetails />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/account" element={<Account />} />
        <Route path="/workflow" element={<Workflow />} />

        {/* Admin + Manager only */}
        <Route element={<ProtectedRoute roles={['super_admin', 'admin', 'manager']} />}>
          <Route path="/users" element={<Users />} />
        </Route>

        {/* Super Admin only */}
        <Route element={<ProtectedRoute roles={['super_admin']} />}>
          <Route path="/plans" element={<Plans />} />
          <Route path="/companies" element={<Companies />} />
        </Route>
      </Route>
    </Route>

    {/* Fallback */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
