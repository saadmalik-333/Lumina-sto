
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Instagram, Twitter, Linkedin } from 'lucide-react';

const { Link } = ReactRouterDOM;

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 lg:pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 lg:mb-20">
          <div className="col-span-1 lg:col-span-2 text-center sm:text-left">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6 lg:mb-8 group">
              <span className="text-2xl lg:text-3xl font-serif font-black tracking-tighter text-indigo-900 group-hover:text-indigo-600 transition-colors">LUMINA</span>
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
            </Link>
            <p className="text-slate-500 max-w-sm mb-8 leading-relaxed mx-auto sm:mx-0 text-sm lg:text-base">
              We are a collective of digital craftsmen focused on creating premium experiences for forward-thinking brands.
            </p>
            <div className="flex justify-center sm:justify-start space-x-4">
              <a href="#" className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div className="text-center sm:text-left">
            <h4 className="font-black text-indigo-900 mb-6 lg:mb-8 uppercase tracking-[0.2em] text-xs">Capabilities</h4>
            <ul className="space-y-4 text-slate-500 font-bold text-sm">
              <li><Link to="/services/web-design" className="hover:text-indigo-600 transition-colors">Web Architecture</Link></li>
              <li><Link to="/services/branding" className="hover:text-indigo-600 transition-colors">Visual Branding</Link></li>
              <li><Link to="/services/graphic-design" className="hover:text-indigo-600 transition-colors">Graphic Systems</Link></li>
              <li><Link to="/services/media-content" className="hover:text-indigo-600 transition-colors">Media Narrative</Link></li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-black text-indigo-900 mb-6 lg:mb-8 uppercase tracking-[0.2em] text-xs">Studio</h4>
            <ul className="space-y-4 text-slate-500 font-bold text-sm">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Process</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Portfolio</a></li>
              <li><Link to="/request/general" className="hover:text-indigo-600 transition-colors">Collaborate</Link></li>
              <li><Link to="/admin/login" className="hover:text-indigo-600 transition-colors">Portal Access</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-50 pt-10 flex flex-col lg:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-xs font-bold text-center lg:text-left">
            © 2024 LUMINA CREATIVE STUDIO. ALL RIGHTS RESERVED.
          </p>
          <div className="flex space-x-8 text-[10px] font-black uppercase tracking-widest text-slate-300">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
