import React, { useEffect, useRef, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowUpRight, Sparkles, Star, ChevronRight } from 'lucide-react';
import { SERVICES, getIcon } from '../constants.tsx';

const { Link, useLocation } = ReactRouterDOM;

// Advanced Intersection Observer Hook
const useIntersectionObserver = (options: IntersectionObserverInit & { triggerOnce?: boolean } = {}): [React.RefObject<HTMLDivElement | null>, boolean] => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        if (options.triggerOnce !== false) observer.unobserve(entry.target);
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

const FadeInSection: React.FC<{ children: React.ReactNode, delay?: number, className?: string, direction?: 'up' | 'down' | 'left' | 'right' }> = ({ children, delay = 0, className = "", direction = 'up' }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  
  const getTransform = () => {
    if (isVisible) return 'translate(0, 0)';
    switch(direction) {
      case 'up': return 'translateY(50px)';
      case 'down': return 'translateY(-50px)';
      case 'left': return 'translateX(50px)';
      case 'right': return 'translateX(-50px)';
      default: return 'translateY(0)';
    }
  };

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`}
      style={{ 
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        filter: isVisible ? 'blur(0px)' : 'blur(15px)',
        transitionDelay: `${delay}ms` 
      }}
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
      }, 300);
    }
  }, [location]);

  return (
    <div className="bg-white overflow-x-hidden selection:bg-indigo-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-64 lg:pb-80 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.08)_0%,_transparent_70%)] -mr-[400px] -mt-[400px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_rgba(244,114,182,0.05)_0%,_transparent_70%)] -ml-[300px] -mb-[300px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-28">
            <div className="lg:w-3/5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-12 border border-slate-100 shadow-sm animate-fade-up mx-auto lg:mx-0">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></div>
                <span>Award Winning Digital Studio</span>
              </div>
              
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif font-black text-slate-900 leading-[0.85] mb-12 animate-fade-up [animation-delay:200ms] tracking-tighter">
                Crafting <br />
                <span className="text-indigo-600 italic relative inline-block group cursor-default">
                  Digital
                  <span className="absolute bottom-2 left-0 w-0 h-2 bg-indigo-100/50 -z-10 transition-all duration-1000 ease-out group-hover:w-full"></span>
                </span> <br /> 
                Legacies
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-500 max-w-xl mb-16 leading-relaxed animate-fade-up [animation-delay:400ms] mx-auto lg:mx-0 font-medium">
                We design and build bespoke digital environments for world-class organizations. Absolute precision, no compromise.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 animate-fade-up [animation-delay:600ms] justify-center lg:justify-start">
                <Link 
                  to="/request/general" 
                  className="btn-premium bg-indigo-600 text-white px-12 py-6 rounded-[2rem] text-lg font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl shadow-indigo-100"
                >
                  Start Project <ArrowUpRight size={22} />
                </Link>
                <button 
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-12 py-6 rounded-[2rem] text-lg font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all duration-500 flex items-center justify-center gap-3 border border-slate-100 active:scale-95 hover:border-indigo-100"
                >
                  Our Modules <ChevronRight size={20} className="text-indigo-400" />
                </button>
              </div>
            </div>
            
            <div className="lg:w-2/5 relative w-full max-w-lg lg:max-w-none group animate-fade-up [animation-delay:800ms]">
              <div className="relative z-10 transition-all duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] group-hover:-rotate-1">
                 <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200" 
                  alt="Elite Art" 
                  className="rounded-[4rem] lg:rounded-[6rem] shadow-[0_80px_160px_-40px_rgba(79,70,229,0.25)] rotate-3 w-full aspect-[4/5] object-cover transition-all duration-[1.5s]"
                />
                {/* Floating Micro-Badge */}
                <div className="absolute -bottom-10 -right-10 bg-white p-10 rounded-[3rem] shadow-2xl border border-indigo-50 hidden lg:block animate-bounce [animation-duration:8s]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                      <Star size={20} fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Elite Quality</p>
                      <p className="text-xl font-serif font-black text-slate-900 leading-none">99.9% Refined</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker - Smooth Infinite Loop */}
      <section className="py-20 bg-white overflow-hidden relative border-y border-slate-50">
        <div className="flex gap-24 whitespace-nowrap opacity-[0.08] items-center">
           <div className="flex gap-24 animate-[marquee_50s_linear_infinite]">
            {[1,2,3,4].map(i => (
              <span key={`a-${i}`} className="text-5xl lg:text-9xl font-serif font-black text-slate-900 tracking-tighter uppercase">No Compromise Strategy</span>
            ))}
          </div>
          <div className="flex gap-24 animate-[marquee_50s_linear_infinite]">
            {[1,2,3,4].map(i => (
              <span key={`b-${i}`} className="text-5xl lg:text-9xl font-serif font-black text-slate-900 tracking-tighter uppercase">No Compromise Strategy</span>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-40 lg:py-64 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-32 lg:mb-40 gap-12">
            <FadeInSection className="max-w-2xl">
              <h2 className="text-5xl lg:text-9xl font-serif font-black text-slate-900 mb-10 leading-[0.85] tracking-tighter">Mastery In <br /> <span className="text-indigo-600 italic">Every Pixel</span></h2>
              <p className="text-xl lg:text-2xl text-slate-500 font-medium leading-relaxed">We deliver high-end digital solutions through a fusion of artistic intuition and structural engineering.</p>
            </FadeInSection>
            <FadeInSection delay={200} direction="left">
              <Link to="/request/general" className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 group px-12 py-6 rounded-full border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-600 hover:text-white transition-all duration-700 active:scale-95">
                Full Scope <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
              </Link>
            </FadeInSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
            {SERVICES.map((service, idx) => (
              <FadeInSection key={service.id} delay={idx * 150}>
                <Link 
                  to={`/services/${service.id}`}
                  className="group relative h-full bg-slate-50/40 rounded-[4rem] p-12 lg:p-16 card-premium hover:bg-white border border-transparent hover:border-indigo-50/50 flex flex-col"
                >
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm mb-16 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:-rotate-3">
                    {getIcon(service.icon)}
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 group-hover:text-indigo-600 transition-colors duration-500 leading-[1.1] tracking-tight">{service.title}</h3>
                  <p className="text-slate-500 leading-relaxed mb-16 opacity-80 group-hover:opacity-100 transition-all duration-700 text-lg font-medium">
                    {service.description}
                  </p>
                  <div className="mt-auto flex items-center text-indigo-600 font-black text-[10px] uppercase tracking-[0.4em] group-hover:translate-x-6 transition-all duration-700">
                    Depth Analysis <ArrowUpRight size={16} className="ml-3" />
                  </div>
                </Link>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Focus Feature */}
      <section className="py-40 lg:py-64 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <FadeInSection>
              <h2 className="text-5xl lg:text-9xl font-serif font-black mb-20 leading-[0.85] tracking-tighter">Elite Tech. <br /> <span className="text-indigo-400 italic">Global Scale.</span></h2>
              <div className="space-y-16">
                {[
                  { t: 'Hyper-Fast Performance', d: 'Architecture optimized for instantaneous load times and fluid motion.' },
                  { t: 'Bespoke UI Frameworks', d: 'We build our own components to ensure your brand stands entirely unique.' },
                  { t: 'Secure Cloud Infrastructure', d: 'Enterprise-grade security integrated directly into your digital footprint.' }
                ].map((item, i) => (
                  <FadeInSection key={i} delay={i * 100} className="flex gap-10 group">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-[1s] group-hover:scale-110">
                      <Sparkles size={28} />
                    </div>
                    <div>
                      <h4 className="text-3xl font-bold mb-4 transition-colors duration-500 group-hover:text-indigo-400 tracking-tight">{item.t}</h4>
                      <p className="text-slate-400 leading-relaxed text-lg font-medium opacity-80 group-hover:opacity-100 transition-opacity">{item.d}</p>
                    </div>
                  </FadeInSection>
                ))}
              </div>
            </FadeInSection>
            <FadeInSection delay={300} direction="left">
              <div className="relative group perspective-2000">
                <img 
                  src="https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1200" 
                  alt="Precision" 
                  className="rounded-[5rem] shadow-3xl grayscale group-hover:grayscale-0 transition-all duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] transform group-hover:scale-105 group-hover:rotate-1"
                />
                <div className="absolute -bottom-16 -right-12 glass p-16 rounded-[4rem] border-white/10 text-slate-900 hidden sm:block shadow-2xl animate-[float_12s_infinite_ease-in-out]">
                  <div className="text-6xl font-black mb-2 text-indigo-600 tracking-tighter">100%</div>
                  <div className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Uptime Reliability</div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-48 lg:pb-80 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeInSection className="relative bg-indigo-600 rounded-[5rem] lg:rounded-[7rem] p-20 lg:p-32 overflow-hidden shadow-[0_80px_140px_-30px_rgba(79,70,229,0.4)]">
            <div className="relative z-10 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-20">
              <div className="lg:max-w-4xl">
                <h2 className="text-6xl lg:text-9xl font-serif font-black text-white mb-12 leading-[0.85] tracking-tighter">Transcend The <br /> <span className="text-indigo-200 italic">Ordinary.</span></h2>
                <p className="text-indigo-100 text-2xl lg:text-4xl font-medium opacity-90 max-w-2xl">Your project deserves the elite craftsmanship only Lumina provides.</p>
              </div>
              <Link 
                to="/request/general" 
                className="bg-white text-indigo-600 px-16 py-8 rounded-[3rem] text-xl lg:text-2xl font-black uppercase tracking-[0.2em] hover:bg-indigo-50 hover:scale-110 transition-all duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)] shadow-3xl active:scale-95 flex items-center gap-6 shrink-0"
              >
                Let's Build <ArrowUpRight size={32} />
              </Link>
            </div>
            {/* Fluid BG patterns */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px] -mr-60 -mt-60 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-950/20 rounded-full blur-[120px] -ml-60 -mb-60"></div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
};

export default Home;