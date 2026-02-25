import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { modernTheme } from './theme/theme';
import { AppProviders } from './contexts/AppProviders';
import Layout from './components/common/Layout';
import TestDataManager from './components/common/TestDataManager';
import Dashboard from './pages/Dashboard';
import Bills from './pages/Bills';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Settings from './pages/Settings';
import UserSettings from './pages/UserSettings';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import AdminPanel from './pages/AdminPanel';
import AdminSettings from './pages/AdminSettings';
import SecuritySettings from './pages/SecuritySettings';
import SubscriptionManagement from './pages/SubscriptionManagement';
import AppSettings from './pages/AppSettings';
import InvoiceTemplateLibrary from './pages/InvoiceTemplateLibrary';
import UserManagement from './components/admin/UserManagement';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ViewBill from './pages/ViewBill';
import Suppliers from './pages/Suppliers';
import ExpenseManager from './pages/ExpenseManager';
import AuditLogs from './pages/AuditLogs';

/**
 * Main App component with clean context provider composition
 * Uses focused context providers instead of monolithic AppContext
 */
const App: React.FC = () => {
  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      <AppProviders>
        <Router>
          <Routes>
            {/* Public routes without Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes with Layout */}
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/bills" element={<Bills />} />
                  <Route path="/bills/new" element={<Bills />} />
                  <Route path="/bills/view/:id" element={<ViewBill />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customers/new" element={<Customers />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/new" element={<Products />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/admin/settings/*" element={<AdminSettings />} />
                  <Route path="/admin/security" element={<SecuritySettings />} />
                  <Route path="/admin/subscription" element={<SubscriptionManagement />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/audit-logs" element={<AuditLogs />} />
                  <Route path="/admin/app-settings" element={<AppSettings />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/expenses" element={<ExpenseManager />} />
                  <Route path="/templates" element={<InvoiceTemplateLibrary />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/user-settings" element={<UserSettings />} />
                </Routes>
              </Layout>
            } />
          </Routes>
          <TestDataManager />
        </Router>
      </AppProviders>
    </ThemeProvider>
  );
};

export default App;
