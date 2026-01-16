
import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Home as HomeIcon } from 'lucide-react';
import { SERVICES, getIcon } from '../constants.tsx';

const { useParams, Link, useNavigate } = ReactRouterDOM;

const ServicePage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  
  const service = SERVICES.find(s => 
    s.id.toLowerCase() === serviceId?.toLowerCase()?.trim()
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [serviceId]);

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-8 animate-pulse">
          <Sparkles size={32} />
        </div>
        <h1 className="text-3xl lg:text-5xl font-serif font-black text-indigo-900 mb-4 tracking-tighter">Capability Not Found</h1>
        <p className="text-slate-500 mb-10 max-w-md mx-auto text-base lg:text-lg">
          The requested service module is currently unavailable or has been relocated within our studio index.
        </p>
        <Link 
          to="/" 
          className="btn-premium bg-indigo-600 text-white px-8 lg:px-10 py-4 lg:py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl"
        >
          <HomeIcon size={16} /> Return to Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-x-hidden">
      {/* Header Section */}
      <div className="relative pt-32 pb-16 lg:pt-52 lg:pb-32 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 mb-12 lg:mb-16 transition-colors font-black text-[10px] lg:text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> All Capabilities
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="animate-reveal text-center lg:text-left">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-indigo-600 rounded-[1.2rem] lg:rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl mb-8 lg:mb-10 mx-auto lg:mx-0">
                {getIcon(service.icon)}
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-black text-indigo-900 mb-8 lg:mb-10 leading-[1] tracking-tighter">
                {service.title}
              </h1>
              <p className="text-lg lg:text-2xl text-slate-500 leading-relaxed mb-10 lg:mb-14 max-w-xl italic font-medium mx-auto lg:mx-0">
                {service.fullDescription}
              </p>
              <Link 
                to={`/request/${service.id}`} 
                className="btn-premium bg-indigo-600 text-white px-10 py-5 rounded-[2rem] text-base lg:text-lg font-black uppercase tracking-widest inline-flex items-center gap-3 shadow-2xl shadow-indigo-100"
              >
                Book Service <ArrowRight size={20} />
              </Link>
            </div>
            <div className="relative animate-reveal delay-200 w-full max-w-lg mx-auto lg:max-w-none">
              <img 
                src={service.image} 
                alt={service.title} 
                className="rounded-[3rem] lg:rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(99,102,241,0.2)] w-full aspect-square object-cover rotate-1 hover:rotate-0 transition-transform duration-700"
              />
              <div className="absolute -bottom-6 -left-6 lg:-bottom-10 lg:-left-10 glass p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] shadow-xl hidden sm:block border-indigo-100 max-w-[240px]">
                <Sparkles className="text-indigo-600 mb-4" />
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Tier-1 Deliverable</div>
                <div className="text-xl lg:text-2xl font-serif font-bold text-indigo-900">Bespoke Strategy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deliverables */}
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="text-center mb-16 lg:mb-24">
          <div className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Core Competencies</div>
          <h2 className="text-4xl lg:text-5xl font-serif font-black text-indigo-900 mb-6 lg:mb-8 leading-tight">Elite <span className="text-indigo-500 italic">Deliverables</span></h2>
          <p className="text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto">Precision-engineered results for brands that demand the absolute highest standard of digital execution.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {service.features.map((feature, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-6 lg:gap-8 p-8 lg:p-10 bg-slate-50 rounded-[2.5rem] lg:rounded-[3rem] group hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-indigo-50">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-xl lg:text-2xl font-bold text-indigo-900 mb-3 lg:mb-4">{feature}</h4>
                <p className="text-sm lg:text-base text-slate-500 leading-relaxed opacity-80">Every deliverable is curated through our internal 5-step quality assurance framework to ensure global standards.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicePage;
