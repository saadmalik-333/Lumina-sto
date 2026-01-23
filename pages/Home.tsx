import React, { useEffect, useRef, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowUpRight, Sparkles, Star, ChevronRight } from 'lucide-react';
import { SERVICES, getIcon } from '../constants.tsx';

const { Link, useLocation } = ReactRouterDOM;

// Added custom options type to include triggerOnce which is not part of IntersectionObserverInit
const useIntersectionObserver = (options: IntersectionObserverInit & { triggerOnce?: boolean } = {}): [React.RefObject<HTMLDivElement | null>, boolean] => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        // triggerOnce is checked to determine if we should stop observing after first intersect
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
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.15 });
  
  const getTransform = () => {
    switch(direction) {
      case 'up': return isVisible ? 'translateY(0)' : 'translateY(40px)';
      case 'down': return isVisible ? 'translateY(0)' : 'translateY(-40px)';
      case 'left': return isVisible ? 'translateX(0)' : 'translateX(40px)';
      case 'right': return isVisible ? 'translateX(0)' : 'translateX(-40px)';
      default: return 'translateY(0)';
    }
  };

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${className}`}
      style={{ 
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        filter: isVisible ? 'blur(0px)' : 'blur(10px)',
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
      }, 150);
    }
  }, [location]);

  return (
    <div className="bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-64 lg:pb-72 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-24">
            <div className="lg:w-3/5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-indigo-100 shadow-sm animate-fade-up mx-auto lg:mx-0">
                <Sparkles size={12} className="animate-pulse" />
                <span>2024 Global Excellence Winner</span>
              </div>
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif font-black text-slate-900 leading-[0.85] mb-10 animate-fade-up [animation-delay:150ms] tracking-tighter">
                Crafting <span className="text-indigo-600 italic">Digital</span> <br /> 
                <span className="relative inline-block">
                  Legacies
                  <span className="absolute bottom-2 lg:bottom-4 left-0 w-full h-2 lg:h-4 bg-indigo-100/60 -z-10 rounded-full animate-[revealMask_1.5s_ease-in-out_forwards]"></span>
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-500 max-w-xl mb-14 leading-relaxed animate-fade-up [animation-delay:300ms] mx-auto lg:mx-0 font-medium">
                Lumina is a bespoke creative studio for industry titans. We define the intersection of elite design and high-performance technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 animate-fade-up [animation-delay:450ms] justify-center lg:justify-start">
                <Link 
                  to="/request/general" 
                  className="btn-premium bg-indigo-600 text-white px-10 py-5 rounded-2xl text-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200"
                >
                  Start Project <ArrowUpRight size={20} />
                </Link>
                <button 
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-10 py-5 rounded-2xl text-lg font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-3 border border-slate-100 active:scale-95 shadow-sm"
                >
                  View Services <ChevronRight size={18} />
                </button>
              </div>
            </div>
            
            <div className="lg:w-2/5 relative w-full max-w-md lg:max-w-none group animate-fade-up [animation-delay:600ms]">
              <div className="relative z-10 transition-all duration-1000 group-hover:scale-[1.04] group-hover:rotate-0">
                 <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200" 
                  alt="Elite Art" 
                  className="rounded-[3.5rem] lg:rounded-[5rem] shadow-[0_60px_120px_-20px_rgba(79,70,229,0.18)] rotate-2 w-full aspect-[4/5] object-cover transition-all duration-[1.5s] ease-[cubic-bezier(0.23,1,0.32,1)]"
                />
              </div>
              <div className="absolute -top-12 -right-12 w-64 lg:w-96 h-64 lg:h-96 bg-indigo-100 rounded-full blur-[110px] opacity-40 -z-0"></div>
              <div className="absolute -bottom-12 -left-12 w-64 lg:w-96 h-64 lg:h-96 bg-pink-100/50 rounded-full blur-[110px] opacity-40 -z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker - Perfectly Seamless */}
      <section className="py-16 bg-white overflow-hidden relative border-y border-slate-50">
        <div className="flex gap-20 whitespace-nowrap opacity-20 grayscale items-center">
           <div className="flex gap-20 animate-[marquee_40s_linear_infinite]">
            {[1,2,3,4,5,6,7,8].map(i => (
              <span key={`a-${i}`} className="text-4xl lg:text-6xl font-serif font-black text-slate-900 tracking-tighter">PREMIUM STANDARDS</span>
            ))}
          </div>
          <div className="flex gap-20 animate-[marquee_40s_linear_infinite]">
            {[1,2,3,4,5,6,7,8].map(i => (
              <span key={`b-${i}`} className="text-4xl lg:text-6xl font-serif font-black text-slate-900 tracking-tighter">PREMIUM STANDARDS</span>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 lg:py-52 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 lg:mb-36 gap-10">
            <FadeInSection className="max-w-2xl">
              <h2 className="text-5xl lg:text-8xl font-serif font-black text-slate-900 mb-8 leading-[0.95] tracking-tighter">Mastering Every <br /> <span className="text-indigo-600 italic">Dimension</span></h2>
              <p className="text-xl lg:text-2xl text-slate-500 font-medium">From visual identity to technical infrastructure, we build digital environments that command absolute attention.</p>
            </FadeInSection>
            <FadeInSection delay={200} direction="left">
              <Link to="/request/general" className="text-indigo-600 font-black text-sm uppercase tracking-widest flex items-center gap-3 group px-10 py-5 rounded-full border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-600 hover:text-white transition-all duration-700 active:scale-95 shadow-sm">
                Full Capability Brief <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </FadeInSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14">
            {SERVICES.map((service, idx) => (
              <FadeInSection key={service.id} delay={idx * 150}>
                <Link 
                  to={`/services/${service.id}`}
                  className="group relative h-full bg-slate-50/40 rounded-[3.5rem] p-12 lg:p-14 card-premium hover:bg-white border border-transparent hover:border-indigo-50/50 flex flex-col"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-12 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110">
                    {getIcon(service.icon)}
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-6 group-hover:text-indigo-600 transition-colors duration-500 leading-tight">{service.title}</h3>
                  <p className="text-slate-500 leading-relaxed mb-12 opacity-80 group-hover:opacity-100 transition-all duration-700 text-lg font-medium">
                    {service.description}
                  </p>
                  <div className="mt-auto flex items-center text-indigo-600 font-black text-[10px] uppercase tracking-[0.25em] group-hover:translate-x-4 transition-all duration-700">
                    Explore Depth <ArrowUpRight size={14} className="ml-2" />
                  </div>
                </Link>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Focus Feature */}
      <section className="py-32 lg:py-52 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-28 items-center">
            <FadeInSection>
              <h2 className="text-5xl lg:text-8xl font-serif font-black mb-16 leading-[0.95] tracking-tighter">Elite Precision. <br /> <span className="text-indigo-400 italic">No Compromise.</span></h2>
              <div className="space-y-12">
                {[
                  { t: 'Strategic Architecture', d: 'Every pixel is placed with intent, driven by data and aesthetic intuition.' },
                  { t: 'High-Performance Tech', d: 'We use the most modern stacks to ensure your platform is as fast as it is beautiful.' },
                  { t: 'Global Scalability', d: 'Built for growth, our systems scale with your organization effortlessly.' }
                ].map((item, i) => (
                  <FadeInSection key={i} delay={i * 100} className="flex gap-8 group">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-700 group-hover:scale-110">
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold mb-3 transition-colors duration-500 group-hover:text-indigo-400 tracking-tight">{item.t}</h4>
                      <p className="text-slate-400 leading-relaxed text-lg font-medium opacity-80 group-hover:opacity-100 transition-opacity">{item.d}</p>
                    </div>
                  </FadeInSection>
                ))}
              </div>
            </FadeInSection>
            <FadeInSection delay={300} direction="left">
              <div className="relative group perspective-1000">
                <img 
                  src="https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1200" 
                  alt="Precision" 
                  className="rounded-[4rem] shadow-3xl grayscale group-hover:grayscale-0 transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] transform group-hover:scale-105 group-hover:rotate-1"
                />
                <div className="absolute -bottom-12 -right-8 glass p-12 rounded-[3rem] border-white/20 text-slate-900 hidden sm:block shadow-2xl animate-[float_10s_infinite_ease-in-out]">
                  <div className="text-5xl font-black mb-2 text-indigo-600 tracking-tighter">99.9%</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Quality Index</div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-indigo-600/10 rounded-full blur-[130px] -mr-[450px] -mt-[450px]"></div>
      </section>

      {/* CTA Section */}
      <section className="py-40 lg:pb-64 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeInSection className="relative bg-indigo-600 rounded-[4rem] lg:rounded-[6rem] p-16 lg:p-28 overflow-hidden shadow-[0_60px_100px_-20px_rgba(79,70,229,0.3)]">
            <div className="relative z-10 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-16">
              <div className="lg:max-w-3xl">
                <h2 className="text-5xl lg:text-8xl font-serif font-black text-white mb-10 leading-[0.95] tracking-tighter">Ready to transcend <br /> the <span className="text-indigo-200 italic">ordinary</span>?</h2>
                <p className="text-indigo-100 text-xl lg:text-3xl font-medium opacity-90">Join the ranks of elite brands choosing Lumina.</p>
              </div>
              <Link 
                to="/request/general" 
                className="bg-white text-indigo-600 px-14 py-7 rounded-[2.5rem] text-xl lg:text-2xl font-black uppercase tracking-widest hover:bg-indigo-50 hover:scale-105 transition-all duration-700 shadow-3xl active:scale-95 flex items-center gap-5 shrink-0"
              >
                Let's Build <ArrowUpRight size={28} />
              </Link>
            </div>
            {/* Ambient Background Patterns */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-950/30 rounded-full blur-[100px] -ml-40 -mb-40"></div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
};

export default Home;
