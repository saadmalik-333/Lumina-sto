
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'py-4' : 'py-8'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`glass rounded-[2rem] px-8 py-4 flex justify-between items-center transition-all duration-500 ${
          scrolled ? 'shadow-2xl shadow-indigo-100/50' : 'bg-white/0 border-transparent shadow-none'
        }`}>
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-serif font-black tracking-tighter text-indigo-900 group-hover:text-indigo-600 transition-colors">LUMINA</span>
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
          </Link>

          <div className="hidden md:flex items-center space-x-10">
            <Link to="/" className="text-sm font-bold text-gray-800 hover:text-indigo-600 transition-colors uppercase tracking-widest">Home</Link>
            <button 
              onClick={handleServicesClick}
              className="text-sm font-bold text-gray-800 hover:text-indigo-600 transition-colors uppercase tracking-widest cursor-pointer bg-transparent border-none outline-none"
            >
              Services
            </button>
            <Link to="/client/portal" className="text-sm font-bold text-gray-800 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-2">
              <User size={16} /> Portal
            </Link>
            
            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            {session ? (
              <Link to="/admin/dashboard" className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
                <ShieldCheck size={20} />
              </Link>
            ) : (
              <Link to="/admin/login" className="p-2 text-gray-300 hover:text-gray-500 transition-colors">
                <ShieldCheck size={20} />
              </Link>
            )}

            <Link 
              to="/request/general" 
              className="btn-premium bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-indigo-200"
            >
              Start Project <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-900 hover:text-indigo-600 transition-colors"
            >
              {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 top-0 left-0 bg-white z-[60] p-8 flex flex-col justify-center items-center space-y-10 animate-in fade-in duration-300">
          <button onClick={() => setIsOpen(false)} className="absolute top-8 right-8 text-gray-900"><X size={40}/></button>
          <Link to="/" onClick={() => setIsOpen(false)} className="text-4xl font-serif font-black text-indigo-900">Home</Link>
          <button onClick={handleServicesClick} className="text-4xl font-serif font-black text-indigo-900 bg-transparent border-none">Services</button>
          <Link to="/client/portal" onClick={() => setIsOpen(false)} className="text-4xl font-serif font-black text-indigo-900">Client Portal</Link>
          <Link to="/request/general" onClick={() => setIsOpen(false)} className="bg-indigo-600 text-white px-12 py-6 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-2xl">Start Project</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
