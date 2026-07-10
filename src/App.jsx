import React, { useEffect, useRef, useState, Suspense } from 'react';
import gsap from 'gsap';
import Lenis from 'lenis';
import { ArrowUpRight, ArrowDown } from 'lucide-react';
import Navbar from './components/Navbar.jsx';
import Hero3D from './components/Hero3D.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import OrdersPage from './components/OrdersPage.jsx';

// Dynamic lazy loaded components for bundle optimization and progressive rendering
const Features = React.lazy(() => import('./components/Features.jsx'));
const Gallery = React.lazy(() => import('./components/Gallery.jsx'));
const About = React.lazy(() => import('./components/About.jsx'));
const Testimonials = React.lazy(() => import('./components/Testimonials.jsx'));
const Pricing = React.lazy(() => import('./components/Pricing.jsx'));
const Contact = React.lazy(() => import('./components/Contact.jsx'));
const Footer = React.lazy(() => import('./components/Footer.jsx'));

export default function App() {
  const containerRef = useRef(null);
  const heading1Ref = useRef(null);
  const heading2Ref = useRef(null);
  const metaLeftRef = useRef(null);
  const ctaWrapRef = useRef(null);
  const badgeRef = useRef(null);
  const indicatorRef = useRef(null);

  // Animation & View states
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [cursorHovered, setCursorHovered] = useState(false);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const preloaderRef = useRef(null);

  // Interactive E-Commerce sandbox states
  const [view, setView] = useState('landing'); // 'landing' or 'orders'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Update ScrollTrigger on Lenis scroll
    lenis.on('scroll', () => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        ScrollTrigger.update();
      });
    });

    // Synchronize GSAP Ticker with Lenis RAF
    const tickHandler = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickHandler);
    gsap.ticker.lagSmoothing(0);

    // Initial Luxury Preloader Sequence
    const count = { value: 0 };
    const loaderTl = gsap.to(count, {
      value: 100,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => {
        setProgress(Math.floor(count.value));
      },
      onComplete: () => {
        const exitTl = gsap.timeline({
          onComplete: () => setLoading(false)
        });

        exitTl.to('.preloader-panel', {
          yPercent: -100,
          stagger: 0.08,
          duration: 0.8,
          ease: 'power4.inOut'
        })
        .to(preloaderRef.current, {
          opacity: 0,
          duration: 0.3
        }, '-=0.4')
        .add(() => {
          // Trigger Hero Reveal right after preloader finishes sliding up
          triggerHeroReveal();
        });
      }
    });

    // Elegant GSAP Hero Reveal logic
    const triggerHeroReveal = () => {
      const ctx = gsap.context(() => {
        const headings = [heading1Ref.current, heading2Ref.current].filter(Boolean);
        const metaLeft = metaLeftRef.current;
        const ctaWrap = ctaWrapRef.current;
        const badge = badgeRef.current;
        const indicator = indicatorRef.current;

        // Set initial states inside overflow clips
        if (headings.length > 0) gsap.set(headings, { yPercent: 105, opacity: 0 });
        if (metaLeft) gsap.set(metaLeft, { y: 30, opacity: 0 });
        if (ctaWrap) gsap.set(ctaWrap, { scale: 0.95, opacity: 0 });
        if (badge) gsap.set(badge, { x: -15, opacity: 0 });
        if (indicator) gsap.set(indicator, { y: 15, opacity: 0 });

        const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.4 } });

        if (badge) tl.to(badge, { x: 0, opacity: 1 }, 0.1);
        if (headings.length > 0) tl.to(headings, { yPercent: 0, opacity: 1, stagger: 0.12 }, 0.2);
        if (metaLeft) tl.to(metaLeft, { y: 0, opacity: 1 }, '-=0.8');
        if (ctaWrap) tl.to(ctaWrap, { scale: 1, opacity: 1, ease: 'back.out(1.2)' }, '-=0.9');
        if (indicator) tl.to(indicator, { y: 0, opacity: 1, ease: 'power2.out' }, '-=0.6');

        // Floating infinite bounce for scroll indicator
        if (indicator) {
          gsap.to(indicator, {
            y: 8,
            repeat: -1,
            yoyo: true,
            duration: 1.2,
            ease: 'power1.inOut'
          });
        }
      }, containerRef);
    };

    // Premium Dual lagging Interactive Cursor logic using gsap.quickTo for peak 120 FPS performance
    let xDotTo, yDotTo, xRingTo, yRingTo;
    if (cursorDotRef.current && cursorRingRef.current) {
      xDotTo = gsap.quickTo(cursorDotRef.current, "x", { duration: 0.08, ease: 'power2.out' });
      yDotTo = gsap.quickTo(cursorDotRef.current, "y", { duration: 0.08, ease: 'power2.out' });
      xRingTo = gsap.quickTo(cursorRingRef.current, "x", { duration: 0.4, ease: 'power3.out' });
      yRingTo = gsap.quickTo(cursorRingRef.current, "y", { duration: 0.4, ease: 'power3.out' });
    }

    const handleMouseMove = (e) => {
      if (xDotTo && yDotTo && xRingTo && yRingTo) {
        xDotTo(e.clientX);
        yDotTo(e.clientY);
        xRingTo(e.clientX);
        yRingTo(e.clientY);
      }
    };

    // Ultra-high performance Event Delegation for custom cursor hover feedback
    const handleMouseOver = (e) => {
      if (e.target && e.target.closest) {
        const interactive = e.target.closest('a, button, [role="button"], .cursor-pointer, input, textarea');
        if (interactive) {
          setCursorHovered(true);
        }
      }
    };

    const handleMouseOut = (e) => {
      if (e.relatedTarget && e.relatedTarget.closest) {
        const interactive = e.relatedTarget.closest('a, button, [role="button"], .cursor-pointer, input, textarea');
        if (interactive) {
          return;
        }
      }
      setCursorHovered(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickHandler);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="bg-just-black text-surface-cream min-h-screen flex flex-col relative overflow-hidden select-none selection:bg-surface-cream selection:text-just-black"
    >
      {/* Custom Premium Dynamic Dual Cursor */}
      <div 
        ref={cursorDotRef} 
        className="custom-cursor-dot hidden md:block" 
        style={{ left: -100, top: -100 }}
      />
      <div 
        ref={cursorRingRef} 
        className={`custom-cursor-ring hidden md:block ${cursorHovered ? 'cursor-hover' : ''}`} 
        style={{ left: -100, top: -100 }}
      />

      {/* Cinematic Slide-Wipe Page Preloader */}
      {loading && (
        <div 
          ref={preloaderRef}
          className="fixed inset-0 z-[100] flex pointer-events-auto"
        >
          {/* Elegant three columns split vertical sliding panel */}
          <div className="preloader-panel w-1/3 h-full bg-off-black border-r border-surface-25/20 flex flex-col justify-between p-12 relative">
            <span className="font-mono text-caption text-surface-25">// SYSTEM INIT</span>
            <span className="font-mori-bold text-heading-small text-surface-cream opacity-20">GSAP</span>
          </div>
          <div className="preloader-panel w-1/3 h-full bg-off-black border-r border-surface-25/20 flex items-center justify-center relative">
            <div className="flex flex-col items-center gap-4">
              <span className="font-mono text-[72px] sm:text-[96px] md:text-[120px] font-mori-bold text-surface-cream tracking-tighter tabular-nums leading-none">
                {progress}%
              </span>
              <div className="w-24 h-[1px] bg-surface-25 relative overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-shockingly-green transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          <div className="preloader-panel w-1/3 h-full bg-off-black flex flex-col justify-between items-end p-12 relative">
            <span className="font-mono text-caption text-surface-25">EDITION 2026 //</span>
            <span className="font-mori-bold text-heading-small text-surface-cream opacity-20">MOTION</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar currentView={view} onViewChange={setView} />

      {/* Conditional page render */}
      {view === 'orders' ? (
        <OrdersPage onBackToHome={() => { setView('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
      ) : (
        <>
          {/* Hero Section Container */}
          <main 
            id="hero-section" 
            className="relative flex flex-col justify-center items-center px-6 min-h-[calc(100vh-80px)] z-10 overflow-hidden"
          >
            {/* Cinematic React Three Fiber 3D Canvas Background (High performance refractive glass) */}
            <Hero3D />

            {/* Foreground Content */}
            <div className="w-full max-w-7xl mx-auto flex flex-col justify-between h-full relative z-10 pointer-events-none mt-6">
              
              {/* Top Row: Creative Edition Badge */}
              <div className="flex items-center mb-8">
                <span 
                  id="hero-badge"
                  ref={badgeRef}
                  className="text-shockingly-green font-mono text-body-sm bg-shockingly-green/10 border border-shockingly-green/20 px-4 py-2 rounded-full tracking-widest uppercase flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-light-green animate-pulse" />
                  GSAP 3D Edition // 2026
                </span>
              </div>

              {/* Core Display Headline Pair */}
              <div className="text-left w-full">
                <div className="text-mask-wrapper mb-1">
                  <h1 
                    id="hero-headline-1"
                    ref={heading1Ref}
                    className="text-mask-content text-[12vw] sm:text-[10vw] md:text-[224px] font-mori-bold text-surface-cream leading-[0.9] tracking-[-0.02em] uppercase select-none pointer-events-none"
                  >
                    Animate
                  </h1>
                </div>
                <div className="text-mask-wrapper flex items-baseline flex-wrap gap-4">
                  <h1 
                    id="hero-headline-2"
                    ref={heading2Ref}
                    className="text-mask-content text-[12vw] sm:text-[10vw] md:text-[224px] font-mori-bold text-surface-cream leading-[0.9] tracking-[-0.02em] uppercase select-none pointer-events-none"
                  >
                    Anything
                  </h1>
                </div>
              </div>

              {/* Bottom Row: Eyebrow + Description + Outlined CTA Actions */}
              <div className="mt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 w-full border-t border-surface-25/50 pt-10">
                <div 
                  id="hero-meta-left" 
                  ref={metaLeftRef}
                  className="flex flex-col gap-4 max-w-lg pointer-events-auto"
                >
                  <span className="text-surface-cream font-mori-regular text-body-sm tracking-wide">
                    {'{ High-Precision Glass Simulation }'}
                  </span>
                  <p className="text-body-large text-surface-50 font-mori-regular leading-relaxed">
                    Experience physical light dispersion and live ambient-linked environment reflections driven directly by GSAP high-precision coordinate interpolation.
                  </p>
                </div>

                <div 
                  id="hero-cta-wrap" 
                  ref={ctaWrapRef}
                  className="flex items-center gap-4 flex-wrap pointer-events-auto"
                >
                  <a 
                    id="hero-action-btn-primary"
                    href="#features-section" 
                    className="px-8 py-4 border-cream-ghost rounded-full font-mori-bold text-surface-cream hover:bg-surface-cream hover:text-just-black transition-gsap uppercase text-body-small tracking-wider"
                  >
                    Get Started
                  </a>
                  <a 
                    id="hero-action-btn-secondary"
                    href="#pricing-section" 
                    className="px-8 py-4 border-hairline hover:border-surface-cream rounded-full font-mori-bold text-surface-50 hover:text-surface-cream transition-gsap uppercase text-body-small tracking-wider inline-flex items-center gap-1.5"
                  >
                    Pricing <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Interactive Scroll Indicator */}
              <div 
                id="scroll-indicator-wrap" 
                ref={indicatorRef}
                className="flex flex-col items-center gap-2 mt-12 cursor-pointer pointer-events-auto mx-auto"
                onClick={() => {
                  const el = document.getElementById('features-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="font-mono text-caption-standard text-surface-50 uppercase tracking-widest">
                  Scroll to explore
                </span>
                <div className="w-10 h-10 rounded-full border border-surface-25 flex items-center justify-center text-surface-cream hover:border-surface-cream transition-gsap">
                  <ArrowDown className="w-4 h-4" />
                </div>
              </div>

            </div>
          </main>

          {/* Elevated Features Section */}
          <Suspense fallback={<div className="h-48 flex flex-col items-center justify-center text-surface-25 font-mono text-[11px] uppercase tracking-widest gap-2 bg-just-black border-t border-surface-25/40"><div className="w-5 h-5 border border-surface-25 border-t-shockingly-green rounded-full animate-spin"></div>Loading motion matrices...</div>}>
            <Features />
          </Suspense>

          {/* Interactive Showcase Gallery */}
          <Suspense fallback={<div className="h-48 flex flex-col items-center justify-center text-surface-25 font-mono text-[11px] uppercase tracking-widest gap-2 bg-just-black border-t border-surface-25/40"><div className="w-5 h-5 border border-surface-25 border-t-pink rounded-full animate-spin"></div>Assembling dynamic gallery canvas...</div>}>
            <Gallery />
          </Suspense>

          {/* Narrative Story About Section */}
          <Suspense fallback={<div className="h-48 flex flex-col items-center justify-center text-surface-25 font-mono text-[11px] uppercase tracking-widest gap-2 bg-just-black border-t border-surface-25/40"><div className="w-5 h-5 border border-surface-25 border-t-lilac rounded-full animate-spin"></div>Choreographing brand narratives...</div>}>
            <About />
          </Suspense>

          {/* Premium Endorsements & Testimonials Section */}
          <Suspense fallback={<div className="h-48 flex flex-col items-center justify-center text-surface-25 font-mono text-[11px] uppercase tracking-widest gap-2 bg-just-black border-t border-surface-25/40"><div className="w-5 h-5 border border-surface-25 border-t-orangey rounded-full animate-spin"></div>Calibrating industry endorsements...</div>}>
            <Testimonials />
          </Suspense>

          {/* Premium Pricing Cards Section */}
          <Suspense fallback={<div className="h-48 flex flex-col items-center justify-center text-surface-25 font-mono text-[11px] uppercase tracking-widest gap-2 bg-just-black border-t border-surface-25/40"><div className="w-5 h-5 border border-surface-25 border-t-blue rounded-full animate-spin"></div>Structuring commercial pipelines...</div>}>
            <Pricing onBuy={(plan) => { setSelectedProduct(plan); setIsModalOpen(true); }} />
          </Suspense>

          {/* Interactive Contact Form Section */}
          <Suspense fallback={<div className="h-48 flex flex-col items-center justify-center text-surface-25 font-mono text-[11px] uppercase tracking-widest gap-2 bg-just-black border-t border-surface-25/40"><div className="w-5 h-5 border border-surface-25 border-t-light-green rounded-full animate-spin"></div>Booting secure transmission terminal...</div>}>
            <Contact />
          </Suspense>

          {/* Premium Apple-Level Footer */}
          <Suspense fallback={<div className="h-48 flex flex-col items-center justify-center text-surface-25 font-mono text-[11px] uppercase tracking-widest gap-2 bg-just-black border-t border-surface-25/40"><div className="w-5 h-5 border border-surface-25 border-t-surface-cream rounded-full animate-spin"></div>Finalizing platform environment...</div>}>
            <Footer />
          </Suspense>
        </>
      )}

      {/* Checkout Modal Overlay */}
      <CheckoutModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedProduct={selectedProduct} 
        onViewOrders={() => { setView('orders'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />
    </div>
  );
}

