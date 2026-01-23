import React, { Suspense, lazy, useEffect } from 'react';
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
 * Premium Loading Fallback with shimmering studio identity
 */
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="text-5xl font-serif font-black tracking-tighter text-indigo-900 opacity-5">LUMINA</div>
        <div className="absolute inset-0 text-5xl font-serif font-black tracking-tighter text-indigo-600 animate-pulse overflow-hidden">
          LUMINA
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></div>
      </div>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();
  
  if (loading) return <LoadingFallback />;
  
  if (!session) return <Navigate to="/admin/login" replace />;
  
  return <>{children}</>;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith('/admin/dashboard');

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {!isAdminDashboard && <Navbar />}
      {/* Route animation key ensures the whole main tag re-triggers its animate-route animation on path change */}
      <main key={location.pathname} className="flex-grow animate-route overflow-hidden">
        <Suspense fallback={<LoadingFallback />}>
          <Routes location={location}>
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