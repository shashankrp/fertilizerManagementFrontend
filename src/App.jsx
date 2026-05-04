import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { ProtectedRoute, RoleBasedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { HelmetProvider } from 'react-helmet-async';

// Lazy load pages
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const VerifyOTP = lazy(() => import('./pages/Auth/VerifyOTP'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));
const License = lazy(() => import('./pages/Auth/License'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Fertilizers = lazy(() => import('./pages/Fertilizers'));
const Stocks = lazy(() => import('./pages/Stocks'));
const Reports = lazy(() => import('./pages/Reports'));
const Billing = lazy(() => import('./pages/Billing'));
const Users = lazy(() => import('./pages/Users'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const LicenseManager = lazy(() => import('./pages/LicenseManager'));
const RenewSubscription = lazy(() => import('./pages/RenewSubscription'));
const Profile = lazy(() => import('./pages/Profile'));

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="p-4 md:p-8 flex-1 w-full max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <InventoryProvider>
          <BrowserRouter>
          <Suspense fallback={<div className="flex items-center justify-center h-screen font-semibold text-primary-600">Initializing Sri Basaveshwara...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/license" element={<License />} />

              {/* Protected Dashboard Routes */}
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/fertilizers" element={<Fertilizers />} />
                <Route path="/stocks" element={<Stocks />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/profile" element={<Profile />} />
                
                {/* Admin/Super Admin only */}
                <Route element={<RoleBasedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/users" element={<Users />} />
                </Route>

                {/* Super Admin only */}
                <Route element={<RoleBasedRoute allowedRoles={['SUPER_ADMIN']} />}>
                  <Route path="/audit-logs" element={<AuditLogs />} />
                  <Route path="/license-manager" element={<LicenseManager />} />
                </Route>
                <Route path="/renew-subscription" element={<RenewSubscription />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        </InventoryProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
