
import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowUpRight, Sparkles, Star } from 'lucide-react';
import { SERVICES, getIcon } from '../constants.tsx';

const { Link, useLocation } = ReactRouterDOM;

const Home: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#services') {
      setTimeout(() => {
        const element = document.getElementById('services');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  return (
    <div className="bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-52 lg:pb-64 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-3/5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8 lg:mb-10 border border-indigo-100 animate-reveal mx-auto lg:mx-0">
                <Sparkles size={12} />
                <span>2024 Design Agency of the Year</span>
              </div>
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-serif font-black text-indigo-900 leading-[0.9] mb-8 lg:mb-10 animate-reveal delay-100 tracking-tighter">
                Bold <span className="text-indigo-500 italic">Creative</span> <br /> 
                <span className="relative">
                  Impact
                  <span className="absolute bottom-2 lg:bottom-4 left-0 w-full h-2 lg:h-4 bg-indigo-100/60 -z-10 rounded-full"></span>
                </span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-slate-500 max-w-xl mb-10 lg:mb-14 leading-relaxed animate-reveal delay-200 mx-auto lg:mx-0">
                We design digital experiences that command attention. Elite branding, web development, and content for the next generation of global leaders.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-reveal delay-300 justify-center lg:justify-start">
                <Link 
                  to="/request/general" 
                  className="btn-premium bg-indigo-600 text-white px-8 lg:px-10 py-4 lg:py-5 rounded-[2rem] text-base lg:text-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100"
                >
                  Start a Project <ArrowUpRight size={20} />
                </Link>
                <button 
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 lg:px-10 py-4 lg:py-5 rounded-[2rem] text-base lg:text-lg font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  Explore Capabilities
                </button>
              </div>
            </div>
            
            <div className="lg:w-2/5 relative w-full max-w-md lg:max-w-none">
              <div className="relative z-10 animate-float">
                 <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000" 
                  alt="Abstract Art" 
                  className="rounded-[3rem] lg:rounded-[4rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] w-full aspect-square object-cover"
                />
              </div>
              <div className="absolute -top-10 -right-10 w-48 lg:w-64 h-48 lg:h-64 bg-pink-100 rounded-full blur-3xl opacity-50 -z-0"></div>
              <div className="absolute -bottom-10 -left-10 w-48 lg:w-64 h-48 lg:h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker Section */}
      <section className="py-8 lg:py-10 bg-slate-50 border-y border-slate-100 overflow-hidden">
        <div className="flex gap-10 lg:gap-20 animate-shimmer whitespace-nowrap opacity-30 grayscale items-center">
          {[1,2,3,4,5,6,7,8].map(i => (
             <span key={i} className="text-xl lg:text-3xl font-serif font-black text-slate-900 tracking-tighter">ELITE PARTNERS</span>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 lg:py-32 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 lg:mb-24 gap-8 lg:gap-10">
            <div className="max-w-2xl animate-reveal">
              <h2 className="text-4xl lg:text-6xl font-serif font-black text-indigo-900 mb-6 lg:mb-8 leading-tight">Mastering Every <br /> <span className="text-indigo-500 italic">Dimension</span></h2>
              <p className="text-lg lg:text-xl text-slate-500">From the core of your brand to the pixels of your site, we offer end-to-end creative excellence.</p>
            </div>
            <Link to="/request/general" className="text-indigo-600 font-black text-sm uppercase tracking-widest flex items-center gap-2 group animate-reveal delay-100">
              See Full Suite <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
            {SERVICES.map((service, idx) => (
              <Link 
                key={service.id} 
                to={`/services/${service.id}`}
                className={`group relative bg-slate-50 rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-12 card-hover hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 border border-transparent hover:border-indigo-50 animate-reveal`}
                style={{ animationDelay: `${(idx + 1) * 150}ms` }}
              >
                <div className="w-14 lg:w-16 h-14 lg:h-16 bg-white rounded-[1.2rem] lg:rounded-[1.5rem] flex items-center justify-center text-indigo-600 shadow-sm mb-8 lg:mb-10 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                  {getIcon(service.icon)}
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-indigo-900 mb-4 lg:mb-6 group-hover:text-indigo-600 transition-colors">{service.title}</h3>
                <p className="text-slate-500 leading-relaxed mb-8 lg:mb-10 opacity-80 group-hover:opacity-100 transition-opacity text-sm lg:text-base">
                  {service.description}
                </p>
                <div className="flex items-center text-indigo-600 font-black text-xs uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                  Deep Dive <ArrowUpRight size={14} className="ml-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 lg:py-40 bg-indigo-950 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          alt="Office"
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-20">
            {[
              { label: 'Successful Launches', val: '240+' },
              { label: 'Awards Won', val: '32' },
              { label: 'Client Retention', val: '99%' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="text-6xl lg:text-8xl font-serif font-black text-white mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-700">{stat.val}</div>
                <div className="text-indigo-300 font-black uppercase tracking-[0.3em] text-[10px] lg:text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Star className="mx-auto text-indigo-600 mb-8 lg:mb-10 animate-pulse" fill="currentColor" size={32} />
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-indigo-900 mb-10 lg:mb-12 italic leading-relaxed px-4">
            "Lumina is not just an agency; they are strategic partners who pushed our brand further than we ever thought possible."
          </h2>
          <div className="flex flex-col items-center">
            <div className="w-16 lg:w-20 h-16 lg:h-20 rounded-full overflow-hidden mb-4 lg:mb-6 border-4 border-indigo-50 shadow-xl">
              <img src="https://i.pravatar.cc/150?u=premium" alt="CEO" className="w-full h-full object-cover" />
            </div>
            <div className="font-black text-indigo-900 uppercase tracking-widest text-sm lg:text-base">Marcus Sterling</div>
            <div className="text-slate-400 text-xs lg:text-sm">CEO, Zenith Global</div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="pb-20 lg:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto bg-indigo-600 rounded-[3rem] lg:rounded-[4rem] p-12 lg:p-32 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-6xl lg:text-8xl font-serif font-black mb-6 lg:mb-10 leading-none">Ready for the <br className="hidden sm:block" /> <span className="text-indigo-200">Next Phase?</span></h2>
            <p className="text-lg lg:text-2xl text-indigo-100 mb-10 lg:mb-16 max-w-2xl mx-auto">
              Limited slots available for Q4. Secure your transformation with Lumina today.
            </p>
            <Link 
              to="/request/general" 
              className="btn-premium inline-flex items-center gap-4 bg-white text-indigo-600 px-10 lg:px-14 py-4 lg:py-6 rounded-[2rem] lg:rounded-[2.5rem] text-lg lg:text-xl font-black uppercase tracking-widest shadow-2xl"
            >
              Start Journey <ArrowUpRight size={24} className="w-5 h-5 lg:w-6 lg:h-6" />
            </Link>
          </div>
          <div className="absolute top-0 left-0 w-48 lg:w-64 h-48 lg:h-64 bg-indigo-500 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50 animate-float"></div>
          <div className="absolute bottom-0 right-0 w-64 lg:w-96 h-64 lg:h-96 bg-indigo-700 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl opacity-50 animate-float delay-300"></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
