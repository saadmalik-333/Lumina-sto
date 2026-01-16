
import React, { Suspense, lazy } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';

const { HashRouter: Router, Routes, Route, Navigate, useLocation } = ReactRouterDOM;

// Lazy load pages with explicit extensions for stable build resolution
const Home = lazy(() => import('./pages/Home.tsx'));
const ServicePage = lazy(() => import('./pages/ServicePage.tsx'));
const RequestService = lazy(() => import('./pages/RequestService.tsx'));
const AdminLogin = lazy(() => import('./pages/AdminLogin.tsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.tsx'));
const ClientLogin = lazy(() => import('./pages/ClientLogin.tsx'));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard.tsx'));

/**
 * Lightweight Loading Fallback to satisfy fast preview initialization
 */
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Synchronizing Studio...</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();
  
  if (loading) return <LoadingFallback />;
  
  if (!session) return <Navigate to="/admin/login" replace />;
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith('/admin/dashboard');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminDashboard && <Navbar />}
      <main className="flex-grow">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services/:serviceId" element={<ServicePage />} />
            <Route path="/request/:serviceId" element={<RequestService />} />
            <Route path="/client/portal" element={<ClientLogin />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminDashboard && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
