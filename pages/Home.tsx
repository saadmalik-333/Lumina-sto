
import React, { useEffect, useRef, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowUpRight, Sparkles, Star, ChevronRight } from 'lucide-react';
import { SERVICES, getIcon } from '../constants.tsx';

const { Link, useLocation } = ReactRouterDOM;

/**
 * Custom hook to detect when an element enters the viewport with intersection observer
 */
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.unobserve(entry.target);
      }
    }, options);

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (targetRef.current) observer.unobserve(targetRef.current);
    };
  }, [options]);

  return [targetRef, isIntersecting];
};

const FadeInSection: React.FC<{ children: React.ReactNode, delay?: number, className?: string }> = ({ children, delay = 0, className = "" }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  
  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${className} ${
        isVisible ? 'opacity-100 translate-y-0 filter-none' : 'opacity-0 translate-y-12 blur-sm'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

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
    <div className="bg-white overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-600">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-64 lg:pb-72 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/40 via-white to-white">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="lg:w-3/5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-indigo-100 shadow-sm animate-reveal mx-auto lg:mx-0">
                <Sparkles size={12} className="animate-pulse" />
                <span>2024 Global Excellence Winner</span>
              </div>
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif font-black text-slate-900 leading-[0.85] mb-10 animate-reveal delay-100 tracking-tighter">
                Crafting <span className="text-indigo-600 italic">Digital</span> <br /> 
                <span className="relative inline-block">
                  Legacies
                  <span className="absolute bottom-2 lg:bottom-4 left-0 w-full h-3 lg:h-6 bg-indigo-50 -z-10 rounded-full"></span>
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-500 max-w-xl mb-14 leading-relaxed animate-reveal delay-200 mx-auto lg:mx-0 font-medium">
                Lumina is a bespoke creative studio for industry titans. We define the intersection of elite design and high-performance technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 animate-reveal delay-300 justify-center lg:justify-start">
                <Link 
                  to="/request/general" 
                  className="btn-premium bg-indigo-600 text-white px-10 py-5 rounded-2xl text-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200"
                >
                  Start Project <ArrowUpRight size={20} />
                </Link>
                <button 
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-10 py-5 rounded-2xl text-lg font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-all flex items-center justify-center gap-3 border border-slate-100 active:scale-95"
                >
                  View Services <ChevronRight size={18} />
                </button>
              </div>
            </div>
            
            <div className="lg:w-2/5 relative w-full max-w-md lg:max-w-none group">
              <div className="relative z-10 animate-float transition-all duration-1000 group-hover:scale-[1.03] group-hover:rotate-0">
                 <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200" 
                  alt="Elite Art" 
                  className="rounded-[3rem] lg:rounded-[4.5rem] shadow-[0_60px_100px_-20px_rgba(79,70,229,0.15)] rotate-3 w-full aspect-[4/5] object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
              </div>
              <div className="absolute -top-12 -right-12 w-64 lg:w-80 h-64 lg:h-80 bg-indigo-100 rounded-full blur-[100px] opacity-40 -z-0"></div>
              <div className="absolute -bottom-12 -left-12 w-64 lg:w-80 h-64 lg:h-80 bg-pink-50 rounded-full blur-[100px] opacity-40 -z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker Section - Smoother Speed */}
      <section className="py-12 bg-white overflow-hidden relative border-y border-slate-50">
        <div className="flex gap-24 whitespace-nowrap opacity-20 grayscale hover:opacity-40 transition-opacity duration-700 items-center">
           <div className="flex gap-24 animate-[shimmer_60s_linear_infinite]">
            {[1,2,3,4,5,6].map(i => (
              <span key={`a-${i}`} className="text-4xl lg:text-5xl font-serif font-black text-slate-900 tracking-tighter">PREMIUM STANDARDS</span>
            ))}
          </div>
          <div className="flex gap-24 animate-[shimmer_60s_linear_infinite]">
            {[1,2,3,4,5,6].map(i => (
              <span key={`b-${i}`} className="text-4xl lg:text-5xl font-serif font-black text-slate-900 tracking-tighter">PREMIUM STANDARDS</span>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 lg:py-48 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 lg:mb-32 gap-10">
            <FadeInSection className="max-w-2xl">
              <h2 className="text-5xl lg:text-7xl font-serif font-black text-slate-900 mb-8 leading-tight">Mastering Every <br /> <span className="text-indigo-600 italic">Dimension</span></h2>
              <p className="text-xl lg:text-2xl text-slate-500 font-medium">From visual identity to technical infrastructure, we build digital environments that command attention.</p>
            </FadeInSection>
            <FadeInSection delay={200}>
              <Link to="/request/general" className="text-indigo-600 font-black text-sm uppercase tracking-widest flex items-center gap-3 group px-8 py-4 rounded-full border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-600 hover:text-white transition-all duration-500 active:scale-95">
                Full Capability Brief <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </FadeInSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {SERVICES.map((service, idx) => (
              <FadeInSection key={service.id} delay={idx * 150}>
                <Link 
                  to={`/services/${service.id}`}
                  className="group relative h-full bg-slate-50/50 rounded-[3rem] p-10 lg:p-12 card-hover hover:bg-white border border-transparent hover:border-indigo-50 flex flex-col"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-10 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    {getIcon(service.icon)}
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-6 group-hover:text-indigo-600 transition-colors duration-500">{service.title}</h3>
                  <p className="text-slate-500 leading-relaxed mb-12 opacity-80 group-hover:opacity-100 transition-opacity duration-500 text-lg font-medium">
                    {service.description}
                  </p>
                  <div className="mt-auto flex items-center text-indigo-600 font-black text-xs uppercase tracking-[0.2em] group-hover:translate-x-3 transition-transform duration-500">
                    Explore Depth <ArrowUpRight size={14} className="ml-2" />
                  </div>
                </Link>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Focus Feature */}
      <section className="py-32 lg:py-48 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <FadeInSection>
              <h2 className="text-5xl lg:text-7xl font-serif font-black mb-12 leading-tight">Elite Precision. <br /> <span className="text-indigo-400 italic">No Compromise.</span></h2>
              <div className="space-y-10">
                {[
                  { t: 'Strategic Architecture', d: 'Every pixel is placed with intent, driven by data and aesthetic intuition.' },
                  { t: 'High-Performance Tech', d: 'We use the most modern stacks to ensure your platform is as fast as it is beautiful.' },
                  { t: 'Global Scalability', d: 'Built for growth, our systems scale with your organization effortlessly.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 transition-colors duration-500 group-hover:text-indigo-400">{item.t}</h4>
                      <p className="text-slate-400 leading-relaxed text-lg font-medium">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeInSection>
            <FadeInSection delay={300}>
              <div className="relative group perspective-1000">
                <img 
                  src="https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1200" 
                  alt="Precision" 
                  className="rounded-[3.5rem] shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-105"
                />
                <div className="absolute -bottom-10 -right-10 glass p-10 rounded-[2.5rem] border-white/10 text-slate-900 hidden sm:block animate-float">
                  <div className="text-4xl font-black mb-2 text-indigo-600">99.9%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quality Index</div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] -mr-[400px] -mt-[400px]"></div>
      </section>

      {/* Social Proof */}
      <section className="py-32 lg:py-48 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeInSection>
            <Star className="mx-auto text-indigo-600 mb-12 animate-pulse" fill="currentColor" size={40} />
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-16 italic leading-snug">
              "Lumina didn't just design our brand; they architected our future presence."
            </h2>
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 p-1 mb-2">
                 <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" 
                  alt="CEO" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="font-black text-indigo-900 uppercase tracking-widest text-sm">Marcus Sterling</div>
              <div className="text-slate-400 font-bold text-xs uppercase tracking-tighter">CEO, NEXUS GLOBAL</div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 lg:pb-64 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeInSection className="relative bg-indigo-600 rounded-[3rem] lg:rounded-[5rem] p-12 lg:p-24 overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="relative z-10 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="lg:max-w-2xl">
                <h2 className="text-4xl lg:text-7xl font-serif font-black text-white mb-8 leading-tight">Ready to transcend <br /> the <span className="text-indigo-200 italic">ordinary</span>?</h2>
                <p className="text-indigo-100 text-xl lg:text-2xl font-medium">Join the ranks of elite brands choosing Lumina.</p>
              </div>
              <Link 
                to="/request/general" 
                className="bg-white text-indigo-600 px-12 py-6 rounded-[2rem] text-xl font-black uppercase tracking-widest hover:bg-indigo-50 hover:scale-105 transition-all shadow-2xl active:scale-95 flex items-center gap-4"
              >
                Let's Build <ArrowUpRight size={24} />
              </Link>
            </div>
            {/* Abstract Background Patterns */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
};

export default Home;
