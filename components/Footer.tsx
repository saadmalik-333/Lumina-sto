
import React from 'react';
// Fix: Use namespace import to resolve missing exported member errors
import * as ReactRouterDOM from 'react-router-dom';
import { Instagram, Twitter, Linkedin, Mail } from 'lucide-react';

const { Link } = ReactRouterDOM;

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <span className="text-2xl font-serif font-bold tracking-tighter text-indigo-900">LUMINA</span>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
            </Link>
            <p className="text-gray-500 max-w-sm mb-6 leading-relaxed">
              We are a collective of digital craftsmen focused on creating premium experiences for forward-thinking brands.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-indigo-900 mb-6 uppercase tracking-wider text-sm">Services</h4>
            <ul className="space-y-4 text-gray-500">
              <li><Link to="/services/web-design" className="hover:text-indigo-600 transition-colors">Web Design</Link></li>
              <li><Link to="/services/branding" className="hover:text-indigo-600 transition-colors">Branding</Link></li>
              <li><Link to="/services/graphic-design" className="hover:text-indigo-600 transition-colors">Visual Identity</Link></li>
              <li><Link to="/services/media-content" className="hover:text-indigo-600 transition-colors">Media Production</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-indigo-900 mb-6 uppercase tracking-wider text-sm">Studio</h4>
            <ul className="space-y-4 text-gray-500">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Portfolio</a></li>
              <li><Link to="/request/general" className="hover:text-indigo-600 transition-colors">Work with us</Link></li>
              <li><Link to="/admin/login" className="hover:text-indigo-600 transition-colors">Admin Access</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-50 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2024 Lumina Creative Studio. All rights reserved.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
