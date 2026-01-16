
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
 * Premium Loading Fallback with shimmering studio identity
 */
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-white animate-fade">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="text-4xl font-serif font-black tracking-tighter text-indigo-900 opacity-20">LUMINA</div>
        <div className="absolute inset-0 text-4xl font-serif font-black tracking-tighter text-indigo-600 animate-pulse overflow-hidden">
          LUMINA
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"></div>
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

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith('/admin/dashboard');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminDashboard && <Navbar />}
      {/* Container for smooth content appearance */}
      <main className="flex-grow animate-fade">
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
