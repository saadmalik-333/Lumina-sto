import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Menu, X, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

const { Link, useNavigate, useLocation } = ReactRouterDOM;

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleServicesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (location.pathname === '/') {
      const element = document.getElementById('services');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#services');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-[1s] ease-[cubic-bezier(0.23,1,0.32,1)] ${
      scrolled ? 'py-4' : 'py-10'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`glass rounded-[2.5rem] px-8 lg:px-10 py-4 flex justify-between items-center transition-all duration-[1s] ease-[cubic-bezier(0.23,1,0.32,1)] ${
          scrolled ? 'shadow-2xl shadow-indigo-100/50 bg-white/90 scale-[0.98] border-indigo-100/30' : 'bg-white/0 border-transparent shadow-none scale-100'
        }`}>
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl lg:text-3xl font-serif font-black tracking-tighter text-indigo-900 group-hover:text-indigo-600 transition-colors duration-700">LUMINA</span>
            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-indigo-600 animate-pulse"></div>
          </Link>

          <div className="hidden md:flex items-center space-x-12">
            <Link to="/" className="text-xs font-black text-slate-900 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em] relative group/nav">
              Home
              <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-indigo-600 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/nav:w-full"></span>
            </Link>
            <button 
              onClick={handleServicesClick}
              className="text-xs font-black text-slate-900 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em] cursor-pointer bg-transparent border-none outline-none relative group/nav"
            >
              Services
              <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-indigo-600 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/nav:w-full"></span>
            </button>
            <Link to="/client/portal" className="text-xs font-black text-slate-900 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em] flex items-center gap-2 relative group/nav">
              <User size={14} /> Portal
              <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-indigo-600 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/nav:w-full"></span>
            </Link>
            
            <div className="h-6 w-px bg-slate-200/60 mx-2"></div>

            <div className="flex items-center gap-6">
              {session ? (
                <Link to="/admin/dashboard" className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-500 shadow-sm">
                  <ShieldCheck size={18} />
                </Link>
              ) : (
                <Link to="/admin/login" className="text-slate-300 hover:text-indigo-600 transition-all duration-500">
                  <ShieldCheck size={18} />
                </Link>
              )}

              <Link 
                to="/request/general" 
                className="btn-premium bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] flex items-center gap-2 shadow-xl shadow-indigo-100"
              >
                Start Project <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-indigo-900 hover:text-indigo-600 transition-all active:scale-90"
            >
              {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <div className={`fixed inset-0 bg-white z-[60] p-10 flex flex-col justify-center items-center space-y-12 transition-all duration-[1.2s] ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-10 blur-xl'
      }`}>
        <button onClick={() => setIsOpen(false)} className="absolute top-10 right-10 text-indigo-900 hover:rotate-90 transition-transform duration-700"><X size={48}/></button>
        <Link to="/" onClick={() => setIsOpen(false)} className="text-5xl font-serif font-black text-indigo-900 hover:text-indigo-600 transition-all">Home</Link>
        <button onClick={handleServicesClick} className="text-5xl font-serif font-black text-indigo-900 bg-transparent border-none hover:text-indigo-600 transition-all">Services</button>
        <Link to="/client/portal" onClick={() => setIsOpen(false)} className="text-5xl font-serif font-black text-indigo-900 hover:text-indigo-600 transition-all">Portal</Link>
        <Link to="/request/general" onClick={() => setIsOpen(false)} className="btn-premium bg-indigo-600 text-white px-14 py-7 rounded-[2.5rem] text-xl font-black uppercase tracking-widest shadow-2xl">Start Project</Link>
      </div>
    </nav>
  );
};

export default Navbar;